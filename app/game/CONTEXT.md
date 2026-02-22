# Office Horror — Game Mechanics Reference

**Version:** 2.0.5 (post-fix sprint, 2026-02-22)
**Stack:** Next.js 15.5.6, React 19.1.0, JavaScript ES6+
**Audience:** Planner AI agents. This document replaces reading source code for game system understanding.

---

## Game Overview

Office Horror is a browser-based incremental game embedded in the Sarlak personal portfolio site at `/game`. The core fantasy is: you are a corporate drone trapped in an impossible office. Reality frays as you sort papers. The horror atmosphere escalates through sanity mechanics, visual distortion, and lore documents uncovered in The Archive.

**Core loop (one sentence):** Sort papers to earn Productivity Points, spend PP on upgrades that generate paper and materials, use materials to craft dimensional upgrades that unlock new systems, ultimately crafting Singularity Collapse to escape.

**Full progression chain:**
```
Sort Papers → PP → UPGRADES (ppPerClick, ppPerSecond)
                → PRINTER ROOM (paper production)
                     → DOCUMENT TYPES (buffs, sanity, lore)
                → THE ARCHIVE (lore, cost 400 PP + day 5)
                → THE PORTAL (toggle theme 20x + day 7)
                     → DIMENSIONAL AREA (mine 7 material types)
                          → DIMENSIONAL UPGRADES (armory, singularity engine)
                               → SINGULARITY COLLAPSE (win condition)
```

---

## Resources

| Resource | State Key | Source | Sink | Cap | Notes |
|---|---|---|---|---|---|
| Productivity Points | `pp` | sortPapers click, ppPerSecond tick, events, report buffs, debug rewards | Upgrade purchases | None | Core currency; sanity tier applies multiplier |
| Energy | `energy` | rest action (restores to 100), energy drink upgrade (+20 max) | sortPapers (-2 base), location actions, document printing | 100 (base) + upgrades | Skills reduce cost; temporal distortion skips cost |
| Sanity | `sanity` | meditation, memos (documents), some events, report noSanityDrain buff | Phase 2 passive drain (0.05/tick), events, archive items | 0-100; reality_anchor min 20; resilient_mind +10/level | Phase 1 foreshadow drain starts at 20 PP; phase 2 at 100 PP |
| Paper | `paper` | print action (paperPerPrint), auto_print upgrade (paperPerSecond), reality_printer | Document printing costs, shredding rewards paper | None | Printer Room required; paperPerSecond ticks at 1/10th per 100ms |
| Dimensional Materials | `dimensionalInventory[id]` | Portal -> dimensional area mining | Crafting dimensional upgrades | 20 (base), 40 with reality_stabilizer | 7 types with weighted rarity (see table below) |
| Player XP | `playerXP` | All game actions (sort, debug, collect material, purchase upgrade, achieve) | Level-up (consumed on threshold) | Soft cap at level 50 | Sanity tier multiplies XP gain; buff xpMult stacks additively |
| Skill Points | `skillPoints` | Level up (+1/level, +3 at multiples of 10) | Purchasing skills (cost 1 each) | None | 21 skills across 5 branches |

### Dimensional Material Rarities

| Material | ID | Rarity | Spawn Rate | Color | Size |
|---|---|---|---|---|---|
| Void Fragment | `void_fragment` | Most common | 39.95% | #1a1a2e | Large (28-48px) |
| Static Crystal | `static_crystal` | Common | 30.00% | #4a4a6a | Medium (16-28px) |
| Glitch Shard | `glitch_shard` | Uncommon | 20.00% | #7f00ff | Medium (16-28px) |
| Reality Dust | `reality_dust` | Rare | 8.00% | #ff6b9d | Small (8-16px) |
| Temporal Core | `temporal_core` | Very Rare | 1.50% | #00ffff | Small (8-16px) |
| Dimensional Essence | `dimensional_essence` | Extremely Rare | 0.40% | #ffd700 | Small (8-16px) |
| Singularity Node | `singularity_node` | Rarest | 0.15% | #ff0000 | Small (8-16px) |

---

## Core Game Loop

```
[PHASE 1 — Cubicle]
  Player sorts papers (click) → gains PP
  Energy costs 2 per sort; rest restores to 100 (30s cooldown)
  Very light sanity drain begins at 20 PP (0.01/tick foreshadow)
  At 100 PP → phase transitions to 2

[PHASE 2 — Horror Active]
  Sanity drains 0.05/tick base
  Player buys upgrades (PP spends) → ppPerClick, ppPerSecond, unlock locations
  Debug challenges (500 PP) unlock → complete debug → XP + PP rewards
  Archive unlocked at 400 PP + day 5 → lore, costs energy to examine
  ↓
  Portal unlocked → toggle theme 20 times + day 7

[DIMENSIONAL PHASE]
  Portal cooldown 60s (base); reduced by dimensional_anchor (30s) and temporal_accelerator (-10s)
  During portal: dimensional area shows encrypted text; materials embedded as nodes
  Collect materials → craft DIMENSIONAL_UPGRADES

[ENDGAME]
  Singularity Engine (1 Singularity Node) → +50 PP/sec
  Singularity Collapse (2 Singularity Nodes) → WIN (unlock 'ending')
```

**Unlock thresholds:**
- 20 PP → phase 1 sanity foreshadow begins
- 50 PP → Stapler (first upgrade) affordable
- 100 PP → Phase 2 transition (full sanity drain)
- 200 PP → Printer Room Access upgrade
- 400 PP + Day 5 → Archive access (Filing Cabinet Key)
- 500 PP → Debug access
- 12000 PP → SENIOR ANALYST (largest ppPerSecond upgrade)
- Theme toggle 20x + Day 7 → Portal unlocked
- Portal + materials → Dimensional upgrades
- 2 Singularity Nodes → WIN

---

## Passive Systems

### Tick Rate
- Game loop runs every **100ms** (10 times per second)
- All per-second values are divided by 10 per tick

### PP Passive Income
```
ppGain_per_tick = (ppPerSecond / 10)
                * applyPPSMultiplier(skillEffects.ppPerSecondMultiplier, skillEffects.ppMultiplier)
                * applySanityPPModifier(sanityTier.ppMultiplier, activeBuffs.ppMult)
                * max(ppPerSecondBuff.ppPerSecondMult)   // highest wins, not additive
```

### Paper Passive Income
```
paperGain_per_tick = paperPerSecond / 10
```
(No skill multiplier applied; raw paperPerSecond value)

### Sanity Drain
- **Phase 1 foreshadow:** -0.01/tick when `phase === 1 && pp > 20` (if not paused)
- **Phase 2 full drain:** -0.05/tick base when `phase >= 2` (if not paused)
  - Pills upgrade: drain × 0.5
  - Void Shield (dimensional): drain × 0.5 (stacks with pills → ×0.25 net)
- Drain paused if any active report buff has `noSanityDrain: true`
- Sanity floor: 0 (game does not end; provides 1.5x PP bonus at critical tier)
- reality_anchor dimensional upgrade: sanity cannot drop below 20

### Event System (Triple-Gate Probability)
```
Tick fires event if:
  1. Math.random() < 0.02          (2% chance per tick)
  2. Math.random() < 0.3           (30% chance — available events pool not empty)
  3. Math.random() < event.prob    (individual event probability)
```
Events fire at most once per event ID (tracked in `discoveredEvents`). Only events with `minDay <= current day` are in pool.

### Cooldown Timers
- **Rest cooldown:** 30s base; reduced by power_napping skill (−10s/level); minimum 5s; ticks via -0.1/tick
- **Portal cooldown:** 60s base; dimensional_anchor sets to 30s; temporal_accelerator -10s; reality_anchor skill multiplies by (1 - portalCooldownReduction); minimum 10s

---

## Upgrade Trees

### Standard Upgrades (UPGRADES in constants.js)

| ID | Name | Cost (PP) | Effect Type | Value | Unlock Req |
|---|---|---|---|---|---|
| stapler | Premium Stapler | 50 | ppPerClick | +2 | — |
| coffee | Coffee Machine | 150 | ppPerSecond | +1 | — |
| printerroom | Printer Room Access | 200 | unlock | printer | — |
| keyboard | Mechanical Keyboard | 300 | ppPerClick | +5 | — |
| archive_access | Filing Cabinet Key | 400 | unlock | archive | Day 5+ |
| debugger | Debug Access | 500 | unlock | debug | — |
| energydrink | Energy Drink Pack | 800 | maxEnergy | +20 | — |
| monitor | Second Monitor | 1200 | ppPerSecond | +3 | — |
| pills | Prescription Pills | 2500 | sanityDrain | ×0.5 rate | — |
| promotion | SENIOR ANALYST | 12000 | ppPerSecond | +10 | — |

### Printer Upgrades (PRINTER_UPGRADES in constants.js)

Cost format: `{ pp: N, paper: M }`

| ID | Name | PP Cost | Paper Cost | Effect | Value |
|---|---|---|---|---|---|
| toner_cartridge | New Toner Cartridge | 100 | 10 | printerQuality | +15 |
| print_head_cleaning | Print Head Cleaning | 250 | 25 | printerQuality | +20 |
| calibration | Printer Calibration | 500 | 50 | printerQuality | +25 |
| premium_paper_stock | Premium Paper Stock | 800 | 75 | printerQuality | +20 |
| laser_upgrade | Laser Printer Upgrade | 1500 | 150 | printerQuality | +20 |
| faster_printer | High-Speed Printer | 300 | 30 | paperPerPrint | +1 |
| duplex_printing | Duplex Printing | 600 | 60 | paperPerPrint | +2 |
| bulk_tray | Bulk Paper Tray | 1000 | 100 | paperPerPrint | +3 |
| auto_print | Auto-Print System | 2000 | 200 | paperPerSecond | +0.5 |
| print_server | Network Print Server | 3500 | 350 | paperPerSecond | +1 |
| industrial_printer | Industrial Print Farm | 6000 | 500 | paperPerSecond | +2 |
| reality_printer | Reality Printer | 8000 | 800 | paperPerPrint | +3 (+1 paper/sec) |

### Dimensional Upgrades (DIMENSIONAL_UPGRADES in constants.js)

| ID | Name | Material Cost | Effect | Notes |
|---|---|---|---|---|
| dimensional_anchor | Dimensional Anchor | 5 void + 3 crystal | portalCooldown → 30s | — |
| reality_stabilizer | Reality Stabilizer | 10 glitch + 5 dust | capacity → 40 | — |
| temporal_accelerator | Temporal Accelerator | 3 temporal_core | portalRespawn | Stacks with anchor |
| void_shield | Void Shield | 20 void | sanityDrain ×0.5 | — |
| crystal_meditation | Crystal Meditation | 15 crystal | meditationBonus ×2 | — |
| reality_anchor | Reality Anchor | 8 dust + 2 essence | minSanity 20 | — |
| glitch_compiler | Glitch Compiler | 25 glitch | debugBonus ×2 | First debug attempt always succeeds |
| singularity_engine | Singularity Engine | 1 singularity_node | ppPerSecond +50 | — |
| drawer_key | Bottom Drawer Key | 10 void + 5 crystal | unlock armory | — |
| temporal_rewind | Temporal Rewind | 5 temporal + 2 essence | timeTravel | Once per day |
| material_scanner | Material Scanner | 10 dust | portalScan | Materials glow |
| dimensional_codex | Dimensional Codex | 15 void + 15 crystal + 15 glitch + 15 dust | unlock lore | — |
| void_sight | Void Sight | 50 void + 1 singularity | hiddenText | — |
| shard_weapon | Shard Blade Schematic | 20 void + 10 glitch | unlock shard_weapon | Armory weapon |
| void_cleaver_craft | Void Cleaver Forge | 30 void + 1 essence | unlock void_cleaver_craft | Armory weapon |
| temporal_blade_craft | Temporal Blade Schematic | 5 temporal + 20 void | unlock temporal_blade_craft | Armory weapon |
| reality_weapon_craft | Reality Render Schematic | 1 singularity + 2 essence | unlock reality_weapon_craft | Armory weapon |
| crystal_armor_craft | Crystalline Suit Weave | 20 crystal + 15 glitch | unlock crystal_armor_craft | Armory armor |
| void_visor_craft | Void Visor Lens | 15 void + 5 dust | unlock void_visor_craft | Armory armor |
| temporal_accessory_craft | Temporal Watch Assembly | 3 temporal + 8 dust | unlock temporal_accessory_craft | Armory accessory |
| forgotten_memo_find | Retrieve Forgotten Memo | 15 void + 5 dust | unlock forgotten_memo_find | Armory anomaly |
| glitched_keycard_find | Recover Glitched Keycard | 20 glitch + 10 crystal | unlock glitched_keycard_find | Armory anomaly |
| void_shard_collect | Collect Void Shard | 40 void | unlock void_shard_collect | Armory anomaly |
| singularity_core_extract | Extract Singularity Core | 1 singularity + 1 essence | unlock singularity_core_extract | Armory anomaly |
| singularity_collapse | Singularity Collapse | 2 singularity_node | unlock ending | **WIN CONDITION** |

---

## Skill Tree

**XP formula:** `baseXP * (1.3 ^ (level - 1))` where baseXP = 100
(XP multiplier was 1.5 before plan 01 fix — now 1.3 for accessibility)

**Skill point economy:** +1 per level, +3 at multiples of 10 (level 10, 20, 30...)

**5 branches:**

| Branch | Color | Theme | Tier Range |
|---|---|---|---|
| efficiency | #4a90e2 | Productivity / PP | 1-3 |
| admin | #9b59b6 | Paperwork / Documents | 1-3 |
| survival | #27ae60 | Energy / Sanity | 1-3 |
| occult | #e74c3c | Dimensional / Portal | 1-3 |
| forbidden | #000000 | Dark knowledge (Level 20+ required) | 4-5 |

**21 Skills:**

| ID | Branch | Tier | Max Level | Level Req | Effect Key | Effect per Level |
|---|---|---|---|---|---|---|
| efficient_sorting | efficiency | 1 | 5 | — | ppPerClickMultiplier | +10% |
| streamlined_workflow | efficiency | 1 | 5 | — | ppPerSecondMultiplier | +8% |
| productivity_metrics | efficiency | 2 | 3 | efficient_sorting | ppPerClickMultiplier | +15% |
| automation_protocols | efficiency | 2 | 3 | streamlined_workflow | ppPerSecondMultiplier | +12% |
| synergy_optimization | efficiency | 3 | 3 | productivity_metrics + automation_protocols | ppMultiplier | +20% |
| paper_pusher | admin | 1 | 5 | — | paperQualityBonus | +5 pts |
| filing_expertise | admin | 1 | 3 | — | documentDurationMultiplier | +20% |
| bureaucratic_mastery | admin | 2 | 3 | paper_pusher | paperQualityBonus + documentEffectMultiplier | +10 pts / +5% |
| red_tape_navigation | admin | 2 | 3 | filing_expertise | documentCostReduction | -10% |
| executive_authority | admin | 3 | 5 | bureaucratic_mastery + red_tape_navigation | maxStoredDocuments | +2 slots |
| energy_conservation | survival | 1 | 5 | — | energyCostReduction | -10% |
| mental_fortitude | survival | 1 | 5 | — | sanityLossReduction | -15% |
| power_napping | survival | 2 | 3 | energy_conservation | restCooldownReduction | -10s |
| meditation_mastery | survival | 2 | 5 | mental_fortitude | meditationBonus | +5 extra sanity |
| resilient_mind | survival | 3 | 3 | power_napping + meditation_mastery | maxSanity | +10 |
| void_attunement | occult | 1 | 5 | — | dimensionalMaterialBonus | +15% |
| reality_anchor | occult | 1 | 3 | — | portalCooldownReduction | -15% |
| dimensional_sight | occult | 2 | 5 | void_attunement | rareMaterialChance | +10% |
| rift_walker | occult | 2 | 3 | reality_anchor | portalDurationBonus | +5s (deferred — no portal timer) |
| void_mastery | occult | 3 | 3 | dimensional_sight + rift_walker | dimensionalMaterialBonus + rareMaterialChance | +25% / +5% |
| sanity_sacrifice | forbidden | 4 | 3 | Lv20 + synergy_optimization + void_mastery | sanityChaosBonus | +2% PP per 10 sanity lost |
| temporal_distortion | forbidden | 4 | 5 | Lv25 + resilient_mind + void_mastery | freeActionChance | +5% chance per action |
| reality_rejection | forbidden | 5 | 1 | Lv40 + sanity_sacrifice + temporal_distortion | ppMultiplier + dimensionalMaterialBonus + sanityLossIncrease | +50% each |

**Note:** `rift_walker` (portalDurationBonus) effect key is correctly aggregated by `getActiveSkillEffects()` but has no consumer in the game loop — no portal session timer exists. Deferred.

**Aggregation function:** `getActiveSkillEffects(gameState)` in skillSystemHelpers.js returns summed effect object. Game loop and action handlers consume individual keys.

---

## Document System (Printer Room)

### Document Types
4 types, 5 tiers each. Tiers unlock via weighted mastery (total prints weighted by tier):

| Type | ID | Primary Effect | Paper Cost (T1) | Energy Cost (T1) | Special Condition |
|---|---|---|---|---|---|
| Memo | memo | Restore sanity | 5 | 3 | — |
| Report | report | PP multiplier buff (timed) | 15 | 8 | Creates active buff |
| Contract | contract | XP + sanity combined | 15 | 10 | — |
| Prophecy | prophecy | Lore + dimensional materials | 25 | 20 | Requires sanity ≤ 30 (tier 1) |

**Tier mastery weights:** T1=1, T2=3, T3=6, T4=12, T5=25 (prevents T1 spam)
**Tier unlock thresholds (weighted prints):** T1=0, T2=5, T3=15, T4=30, T5=50

### Paper Quality Formula
```
If sanity >= 40 (not low/critical):
  quality = (printerQuality * 0.7) + (sanity * 0.3)

If sanity < 10 (critical — 50/50 split):
  quality = (printerQuality * 0.5) + (sanity * 0.5)

If sanity 10-39 (low — 60/40 split):
  quality = (printerQuality * 0.6) + (sanity * 0.4)

Result: Math.max(0, Math.min(100, quality))
```

### Quality Outcomes (4 per tier per type)
| Outcome | Paper Quality Range | Typical Effect |
|---|---|---|
| Corrupted | 0–30% | Negative/weak (sanity loss, PP penalty, debuffs) |
| Standard | 31–60% | Base intended effect |
| Pristine | 61–90% | Enhanced (larger sanity restore, stronger buff) |
| Perfect | 91–100% | Exceptional (max values + bonus: freeActions, skillPoint, noSanityDrain) |

### Buff System
- Max 3 simultaneous active report buffs (`maxActiveBuffs` state property)
- Wired to `executive_authority` skill: maxActiveBuffs = 3 + (maxStoredDocuments skill bonus)
- Buffs expire by `expiresAt` timestamp (milliseconds)
- At capacity: new buff triggers `BuffReplacementModal` (player picks which to replace)
- `pendingBuff` and `pendingBuffDocument` in state hold the pending buff during modal
- Report buff object: `{ id, name, ppMult, expiresAt, noSanityDrain?, xpMult?, energyCostMult?, ppPerSecondMult? }`

### Document Mastery
State property: `documentMastery: { memos: 0, reports: 0, contracts: 0, prophecies: 0 }` (total weighted prints per type)

---

## Equipment and Loot (Armory)

### Unlock
Craft `drawer_key` dimensional upgrade (10 void_fragment + 5 static_crystal) → Armory appears in locations.

### Equipment Sources
Two parallel systems:
1. **Static equipment** (WEAPONS, ARMOR, ANOMALIES in equipmentConstants.js): Fixed items unlocked by crafting dimensional upgrade IDs. `isEquipmentUnlocked(equipment, gameState)` checks `gameState.dimensionalUpgrades[equipment.dimensionalUpgrade]`
2. **Loot drops** (CrystalOpeningModal): Procedurally generated items from `lootGenerationHelpers.js`, stored in `lootInventory` array

### Rarity Tiers (6)
| Tier | ID | Color | Glow Intensity |
|---|---|---|---|
| 1 | common | #888888 | 0.2 |
| 2 | uncommon | #4CAF50 | 0.4 |
| 3 | rare | #2196F3 | 0.6 |
| 4 | epic | #9C27B0 | 0.8 |
| 5 | legendary | #FF9800 | 1.0 |
| 6 | mythic | #ff0000 | 1.2 |

### Equipment State
- `equippedWeapon`: legacy static weapon ID (default: 'stapler_shiv')
- `equippedArmor: { head, chest, accessory }`: legacy slots
- `equippedLootWeapon`: loot item ID
- `equippedLootArmor: { head, chest, accessory }`: loot item IDs
- `equippedLootAnomalies`: array of up to 3 loot anomaly IDs
- `lootInventory`: array of generated loot items with random stats, prefixes, void imbuements

---

## Win / Loss / Idle Conditions

| Condition | Trigger | Outcome |
|---|---|---|
| **WIN** | Craft Singularity Collapse (2 Singularity Nodes, rarity 0.15%) | `dimensionalUpgrades.singularity_collapse = true`, 'ESCAPE. TRANSCEND. ASCEND. LEAVE.' message |
| **LOSS** | None | Game does not end; sanity floor is 0 |
| **SANITY FLOOR BONUS** | Sanity = 0 (critical tier) | +50% PP multiplier (critical tier ppMultiplier = 1.5) |
| **IDLE** | No interaction | ppPerSecond and paperPerSecond tick continuously |
| **OFFLINE** | Page closed | No offline progress; no idle accumulation saved |

---

## File Architecture

| File | Lines | Purpose | Key Exports | Notes |
|---|---|---|---|---|
| page.js | 2145 | Main game component: state, game loop (100ms), UI orchestration | default `Game()` | God Component — all UI branches here |
| constants.js | 1729 | All game data constants | `INITIAL_GAME_STATE`, `LOCATIONS`, `UPGRADES`, `DIMENSIONAL_UPGRADES`, `PRINTER_UPGRADES`, `ACHIEVEMENTS`, `EVENTS`, `DOCUMENT_TYPES`, `SANITY_TIERS`, `HELP_POPUPS`, `HELP_TRIGGERS`, `JOURNAL_ENTRIES`, `MECHANICS_ENTRIES`, `DEBUG_CHALLENGES`, `ARCHIVE_CASES`, `TIER_MASTERY_WEIGHTS` | Central data layer |
| gameActions.js | 1134 | Factory for all user-initiated action handlers | `createGameActions()` | Returns 27+ action functions |
| skillSystemHelpers.js | 385 | XP, leveling, skill purchasing, skill effect aggregation | `addExperience`, `purchaseSkill`, `getActiveSkillEffects`, 10+ modifier functions | Pure functions |
| sanityPaperHelpers.js | 438 | Sanity tier logic, paper quality, buff management, document printing | `getSanityTier`, `calculatePaperQuality`, `applySanityPPModifier`, `isSanityDrainPaused`, `canAddMoreBuffs`, 15+ functions | Pure functions |
| lootGenerationHelpers.js | 382 | Procedural loot item generation | `generateLootItem`, `applyPrefix`, `applyVoidImbuement`, 8+ functions | Used by CrystalOpeningModal |
| journalHelpers.js | 257 | Discovery tracking for journal | `discoverLocation`, `discoverEquipment`, `discoverMechanic`, 6+ functions | Pure functions |
| gameUtils.js | 324 | Visual effects | `getDistortionStyle`, `distortText`, `getClockTime`, `createLevelUpParticles`, `createSkillPurchaseParticles`, `createScreenShake` | DOM-imperative |
| saveSystem.js | 133 | Save/load/export/import | `saveGame`, `loadGame`, `exportToClipboard`, `importFromClipboard` | INITIAL_GAME_STATE merge for migration |
| skillTreeConstants.js | 337 | Skill definitions | `SKILLS`, `SKILL_BRANCHES`, `LEVEL_SYSTEM`, `XP_REWARDS` | 21 skills, 5 branches |
| equipmentConstants.js | 442 | Static equipment definitions | `WEAPONS`, `ARMOR`, `ANOMALIES`, `RARITY`, `isEquipmentUnlocked`, 7 helpers | 6-rarity system |
| lootConstants.js | 350 | Loot system data | `BASE_LOOT_ITEMS`, `LOOT_PREFIXES`, `VOID_IMBUEMENTS`, `LOOT_DROP_RATES` | Derives BASE_LOOT_ITEMS from equipmentConstants |
| dimensionalConstants.js | 76 | Dimensional area data | `DIMENSIONAL_MATERIALS`, `SIZE_RANGES`, `DIMENSIONAL_CAPACITY`, `generateEncryptedText`, `generateMaterialNodes` | 7 material types |
| SkillTreeModal.js | 536 | Skill tree UI | default `SkillTreeModal` | Filing cabinet tab UI |
| Armory.js | 714 | Armory display and equip UI | default `Armory` | Static + loot equipment display |
| DimensionalArea.js | 748 | Portal mining UI | default `DimensionalArea` | Encrypted text with node overlays |
| DebugPanel.js | 1171 | Debug challenges UI | default `DebugPanel` | Code debugging puzzles |
| PrinterRoom.js | 721 | Printer room and document printing | default `PrinterRoom` | All 4 doc types × 5 tiers |
| JournalModal.js | 492 | Player journal/discovery log | default `JournalModal` | Tabs: locations, equipment, mechanics |
| ArchiveModal.js | 410 | Archive lore documents | default `ArchiveModal` | 29 examinable items (some encrypted) |
| CrystalOpeningModal.js | 454 | Loot crystal opening | default `CrystalOpeningModal` | Procedural loot generation |
| FileDrawer.js | 354 | Stored document management | default `FileDrawer` | Consume, shred, star documents |
| DimensionalUpgradesDisplay.js | 106 | Dimensional upgrade purchase UI | default `DimensionalUpgradesDisplay` | — |
| BuffReplacementModal.js | 242 | Buff slot management | default `BuffReplacementModal` | Shown when maxActiveBuffs reached |
| AchievementsModal.js | 162 | Achievement display | default `AchievementsModal` | 34 achievements |
| MeditationModal.js | 218 | Sanity restoration minigame | default `MeditationModal` | Breath rhythm matching |
| DebugModal.js | 225 | Single debug challenge | default `DebugModal` | Typo-spotting puzzles |
| ExamineModal.js | 85 | Item examine overlay | default `ExamineModal` | — |
| HelpPopup.js | 143 | Tutorial popup | default `HelpPopup` | Context-aware; shownHelpPopups tracking |
| EventLog.js | 80 | Scrolling message log | default `EventLog` | Last 15 messages |
| NotificationPopup.js | 98 | Temporary top-left notifications | default `NotificationPopup` | Auto-dismiss |
| DEBUG_SYSTEM.md | 425 | Debug system documentation | — | Internal reference |

---

## State Architecture

`INITIAL_GAME_STATE` in constants.js defines all 141 state properties. Key groupings:

| Group | Properties | Notes |
|---|---|---|
| Core economy | pp, energy, sanity, ppPerClick, ppPerSecond | Primary game resources |
| Progression | day, timeInOffice, phase, playerLevel, playerXP, skillPoints, skills | Phase 1→2 at 100 PP |
| Locations | location, unlockedLocations, discoveredLocations | cubicle always unlocked |
| Upgrades | upgrades, printerUpgrades, dimensionalUpgrades | All objects: `{ id: true }` |
| Printer system | paper, paperPerPrint, paperPerSecond, printerQuality, printerUnlocked, printCount, inPrinterRoom | — |
| Document system | paperQuality, documentMastery, storedDocuments, fileDrawerOpen, activeReportBuffs, maxActiveBuffs, pendingBuff, pendingBuffDocument | Buff system |
| Journal/Discovery | journalOpen, journalTab, discoveredBaseWeapons, discoveredBaseArmor, discoveredBaseAnomalies, discoveredMechanics, discoveredEvents | Auto-tracked |
| Equipment/Loot | equippedWeapon, equippedArmor, equippedLootWeapon, equippedLootArmor, equippedLootAnomalies, lootInventory, inArmory | Dual system |
| Dimensional | dimensionalInventory, portalUnlocked, inDimensionalArea, portalCooldown | — |
| Help system | helpEnabled, shownHelpPopups, currentHelpPopup, meditationUnlocked | Popup tracking |
| Notifications | notifications | Auto-dismiss top-left popups |
| Debug | debugMode, currentBug, debugAttempts, debugForceTearSpawn | — |
| Vestigial | mysteryProgress, playerPath, pathScores, investigation | Defined, zero gameplay impact |

### Vestigial / Inert State Properties (post-fix)
These properties exist in `INITIAL_GAME_STATE` and persist in saves but have **no current gameplay effect**:
- `mysteryProgress` (0-100) — designed for mystery investigation tracking, never incremented
- `playerPath` (null | 'seeker' | 'rationalist' | 'protector' | 'convert' | 'rebel') — set nowhere
- `pathScores: { seeker, rationalist, protector, convert, rebel }` — never incremented
- `investigation: { clues, theories }` — never populated
- `timeRewindUsed` — temporal_rewind upgrade bought but functionality not verified in page.js; state is set on purchase for achievement tracking only
- `themeToggleCount` — functional (used for portal unlock), included here as notable mechanic

### Save/Load System (saveSystem.js)
```javascript
// Save format
{ version: '1.0', timestamp: ISO_string, state: gameState }

// Version migration (loadGame + importFromClipboard)
const mergedState = { ...INITIAL_GAME_STATE, ...saveData.state };
// Old saves receive all new INITIAL_GAME_STATE properties as defaults
```
Export methods: download JSON file, copy to clipboard (JSON string)
Import methods: file picker, clipboard paste

---

## Known Tech Debt (post-fix)

Issues remaining after plan 01 fixes. These are not blocking but exist:

1. **page.js God Component (2145 lines):** All UI render logic, state, game loop, and 15+ handler functions in one file. No path to decompose without significant architectural work (Rule 4 — architectural decision required).

2. **mysteryProgress / playerPath / pathScores / investigation systems are vestigial:** All state properties defined, no code increments or reads them for gameplay purposes. These were designed for a narrative mystery/choice system that was never implemented. Natural vehicle for future prestige differentiation (see RECOMMENDATIONS.md).

3. **portalDurationBonus skill effect (rift_walker) has no consumer:** The effect is correctly returned by `getActiveSkillEffects()` but no portal session timer exists in the game. The skill can be purchased and appears to work (no error), but the bonus does nothing.

4. **Loot system disconnected from incremental loop:** The loot/equipment system (Armory, CrystalOpeningModal, lootInventory) was built for a combat system removed in v2.0.5. Damage, critChance, critMultiplier stats on items have no mechanical effect. Equipment provides zero PP/resource bonuses. The Armory is cosmetic-only post-combat removal.

5. **CLAUDE.md lists known issues that are now fixed:** The file still documents `combatConstants.js` as existing and 11 missing equipment IDs as broken — both were fixed in plan 01. CLAUDE.md should be updated.

6. **constants.js.backup exists in game directory:** Leftover from plan 01 work. Not imported, not harmful, but clutters the directory.

---

## Design Intent and Future Roadmap

### Original Horror Atmosphere Intent
Office Horror is a sanity-pressure incremental with escalating existential unease. The design intent is: the same actions (sort papers) become increasingly surreal as reality degrades around the player. Lore documents in The Archive reveal an impossible office that predates the player's birth. The Singularity Collapse ending is existential escape, not victory.

### Current Gap vs Intent

| Intent | Reality |
|---|---|
| Sanity as meaningful pressure system | Sanity drain is real but player can ignore it (critical sanity = bonus PP) |
| Skill tree as meaningful progression | Skill tree exists but feels separate from incremental core |
| Equipment as meaningful choice | Equipment has no mechanical effect (combat system removed) |
| Escalating horror through gameplay | Horror is mostly aesthetic; gameplay escalation is upgrade-gated not system-driven |

### Three Primary Diagnosed Gaps

1. **No automation layer:** Every sort, every print, every portal entry is manual indefinitely. There is no "configure the machine" moment that characterizes great incrementals.

2. **No prestige loop:** The game has one playthrough path. There is no reset mechanism that rewards replaying with new advantages. The vestigial `playerPath`/`pathScores` system was designed for exactly this but never implemented.

3. **No number scale explosions:** PP tops out around 100,000 in normal play. Numbers never become overwhelming or awe-inspiring. The Singularity Engine (+50 PP/sec) is the biggest unlock but feels linear, not exponential.

### Recommended Future Phase
Implement an automation layer and prestige "Day Reset" system. The `playerPath`/`pathScores` vestigial properties are the natural vehicle — prestige paths give each reset a distinct mechanical character. See RECOMMENDATIONS.md for full design specs.
