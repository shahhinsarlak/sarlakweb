# Office Horror — Game Context

Single source of truth for the `/game` route. Written from a full read of the
source on 2026-06-11. Replaces the old ARCHITECTURE.md, DEBUG_SYSTEM.md,
RECOMMENDATIONS.md and PLAYTIME_AND_BALANCE.md.

For coding conventions (state rules, naming, ESLint, git workflow) see the
repo-root `CLAUDE.md` and `GEMINI.md`. This file documents what the game *is*
and how its systems actually behave in code.

---

## 1. What it is

An incremental ("clicker") horror game. You are an employee in an office that is
not real. You sort papers for Productivity Points (PP), manage Energy and
Sanity, and slowly uncover that the office is a loop you cannot leave. Minimalist
terminal aesthetic, monospace font, no emojis in the UI, dark/light theme via CSS
variables.

- **Stack:** Next.js 15 (App Router), React 19, plain JavaScript. Client side
  only (`'use client'` in `page.js`); no backend for the game.
- **Entry point:** `app/game/page.js` — one big client component that owns all
  state and composes panels and modals.
- **Commands:** `npm run dev` (Turbopack), `npm run build`, `npm run lint`.
  Build is enforced by AWS Amplify, so unescaped JSX entities fail CI.

---

## 2. File map

### State, data, logic
| File | Role |
|------|------|
| `constants.js` | `INITIAL_GAME_STATE` plus all static data: LOCATIONS (incl. Archive items), UPGRADES, DIMENSIONAL_UPGRADES, PRINTER_UPGRADES, EVENTS, ACHIEVEMENTS, DOCUMENT_TYPES (tiers/outcomes), SANITY_TIERS, PP_MULTIPLIER_TIERS, TIER_MASTERY_WEIGHTS, HELP_POPUPS/HELP_TRIGGERS, JOURNAL_ENTRIES, MECHANICS_ENTRIES, LORE_SNIPPETS, DEBUG_CHALLENGES. |
| `skillTreeConstants.js` | `SKILLS` (8 flat skills), `LEVEL_SYSTEM` (linear XP curve), `XP_REWARDS`. |
| `dimensionalConstants.js` | `DIMENSIONAL_MATERIALS` (7 tiers + rarities), node/text generation, base capacity. |
| `gameActions.js` | `createGameActions(...)` factory — every player action handler. |
| `ppHelpers.js` | **Canonical PP math**: `computeClickPP`, `computePassivePPPerSecond`. |
| `skillSystemHelpers.js` | XP/leveling, skill purchase, effect aggregation, achievement bonus aggregation, cooldown/capacity/cost helpers. |
| `sanityPaperHelpers.js` | Sanity tiers, paper quality, document tier unlock/print checks, buff/debuff math, quality-outcome rolls. |
| `journalHelpers.js` | Location discovery tracking (tiny). |
| `gameUtils.js` | Visual/text helpers: distortion, clock, particles, screen shake, `formatPP`. |
| `saveSystem.js` | Versioned save/load (file, clipboard, localStorage autosave), migrations, offline progress. |

### UI — page.js, panels, modals
| File | Role |
|------|------|
| `page.js` | Owns `gameState`, the 100 ms tick, autosave, achievement checks, help/portal triggers, and routes to full-screen views. |
| `GameActionsPanel.js` | Main action buttons (Sort, Rest, Meditation, Debug) + location switchers. |
| `GameStatsPanel.js` | Resource/stat readouts, XP bar, PP and PP/sec breakdowns, active buffs. |
| `GameUpgradesPanel.js` | Tabbed shop: PP / Printer / Dimensional upgrades with tooltips. |
| `GameSidebarExtras.js` | Dimensional inventory + recent event log summary. |
| `EventLog.js` | Scrolling message log. |
| `PrinterRoom.js` | Full-screen: print paper, pick document type/tier, print into File Drawer. |
| `DimensionalArea.js` | Full-screen portal: collect material nodes within capacity, then exit. |
| `FileDrawer.js` | Inbox-style document manager: consume / shred / star / sort. |
| `SkillTreeModal.js` | Spend skill points (called "Personnel File System" in lore). |
| `MeditationModal.js` | Hold-to-breathe minigame to restore sanity. |
| `DebugModal.js` | Fix-the-code minigame for PP. |
| `ArchiveModal.js` / `ExamineModal.js` | Browse Archive bookshelf / read a single item. |
| `JournalModal.js` | Discovered locations + learned mechanics. |
| `AchievementsModal.js` | All achievements + active bonus summary. |
| `HelpPopup.js` / `NotificationPopup.js` | Tutorial popups / top-left toast stack. |
| `BuffReplacementModal.js` | Choose a buff to replace when at the buff cap. |
| `TierUnlockModal.js` | Celebration popup when a PP tier is crossed. |
| `DebugPanel.js` | Dev-only cheat console (resources, progression, presets). Dev builds only. |

---

## 3. Game loop and data flow

- All state lives in one `useState(gameState)` in `page.js`. Every mutation goes
  through functional `setGameState(prev => ...)`.
- Player actions are created once via `createGameActions(setGameState, addMessage,
  checkAchievements, grantXP)` (memoized) and passed down as `actions`.
- A single `setInterval` at **100 ms** drives all passive behaviour: passive PP
  and paper, time/day advance, sanity drain, paper-quality recompute, random
  events, phase transitions, PP-tier checks, focus-mode expiry, cooldown ticks.
- There is **no game loop on a canvas** — the UI is React; the tick only updates
  numbers.
- Autosave to localStorage every 15 s and on `beforeunload`; autosave is restored
  on mount. Achievements are also re-checked via a `useEffect` on key stats.

---

## 4. State model (`INITIAL_GAME_STATE`)

Grouped by system. Exact names are immutable; never rename.

- **Core resources:** `pp`, `energy` (0-100), `sanity` (0-100), `paper`,
  `maxSanity`.
- **Per-action rates:** `ppPerClick`, `ppPerSecond`, `paperPerPrint`,
  `paperPerSecond`, `printerQuality`, `paperQuality`.
- **Progression:** `playerLevel`, `playerXP`, `skillPoints`, `skills{id:level}`,
  `ppMultiplierTier` (0 = none; tiers are 1/2/3).
- **World:** `location`, `unlockedLocations[]`, `day`, `timeInOffice`, `phase`
  (1 or 2), `discoveredEvents[]`.
- **Upgrades:** `upgrades{}`, `printerUpgrades{}`, `dimensionalUpgrades{}`,
  `dimensionalInventory{materialId:count}`.
- **Documents/buffs:** `documentMastery{memos,reports,contracts,prophecies}`,
  `storedDocuments[]`, `activeReportBuffs[]`, `maxActiveBuffs` (3),
  `pendingBuff`/`pendingBuffDocument`, `fileDrawerOpen`, `documentSortBy`.
- **Archive/portal:** `examinedArchiveItems[]`, `examinedItems`, `archiveOpen`,
  `portalUnlocked`, `inDimensionalArea`, `portalCooldown`.
- **Minigames:** `debugMode`/`currentBug`/`debugAttempts`,
  `meditating`/`breathCount` (+ transient meditation timing fields).
- **UI/help/journal:** `recentMessages[]` (cap `maxLogMessages`=15),
  `notifications[]`, `helpEnabled`, `shownHelpPopups[]`, `currentHelpPopup`,
  `meditationUnlocked`, `journalOpen`, `journalTab`, `discoveredLocations[]`,
  `discoveredMechanics[]`.
- **Phase 20:** `focusModeExpiry` (ms timestamp), `lastSavedAt` (ms, drives
  offline progress).

---

## 5. Core systems

### PP and the canonical multiplier chain
All PP routes through `ppHelpers.js` so click, passive tick, and display agree.

`computeClickPP(state)`: `ppPerClick`
→ skill multipliers (`ppPerClickMultiplier`, overall `ppMultiplier`)
→ sanity tier × active PP buffs (`applySanityPPModifier`)
→ PP tier multiplier (2× / 5× / 25×)
→ chaos bonus (only if a `sanityChaosBonus` skill is present — see findings)
→ achievement PP bonus
→ Focus Mode ×1.5 if active.

`computePassivePPPerSecond(state)`: same chain on `ppPerSecond`, plus strongest
`ppPerSecondMult` contract buff. Tick adds `/10` each 100 ms.

### Energy and rest
`sortPapers` costs 2 energy, reduced by `energyCostReduction` skill and report
buffs, floored at 10% of base. `Temporal Distortion` skill gives a free-action
chance. `rest` refills to max (100 + 20 if Energy Drink) on a 30 s cooldown
(reduced by `Power Napping`).

### Sanity, tiers, drain, phases
`SANITY_TIERS`: high 80-100 (1.0×), medium 40-79 (1.15×), low 10-39 (1.35×),
critical 0-9 (1.5×). The multiplier feeds PP and XP. Lower sanity = more reward,
worse paper quality. Drain: tiny (0.01/tick) in phase 1 above 20 PP; full
(0.05/tick base) in phase 2, reduced by Pills, Void Shield, Mental Fortitude, and
paused by certain report buffs. Phase 1 → 2 transition happens at 100 PP. Reality
Anchor floors sanity at 20.

### Skills and leveling
8 flat skills (no branches, no prerequisites) in `skillTreeConstants.js`:
Efficient Sorting, Passive Systems, Cross-Department Synergy, Energy
Conservation, Mental Fortitude, Power Napping, Portal Attunement, Temporal
Distortion. XP curve is **linear** (`50 * level`), max level 50. Skill points: 1
per level, +3 on every 5th level. 1 point per skill level.

### Achievements
`ACHIEVEMENTS` in `constants.js`. Some carry a `reward` of type `ppMultiplier` or
`portalCooldownReduction`; `getAchievementBonuses` sums unlocked ones and they
feed the PP chain / portal-cooldown helper. Checked in `page.js`
`checkAchievements` (additive, grants 50 XP each).

### PP multiplier tiers
`PP_MULTIPLIER_TIERS`: tier 1 at 10K (×2), tier 2 at 1M (×5), tier 3 at 1B (×25).
Tick promotes the player and pops `TierUnlockModal`. (Note: this is the shipped
3-tier design, not the older 8-tier planning sketch.)

### Locations, Archive, portal unlock
Locations: `cubicle` (start), `archive` (Filing Cabinet Key upgrade, day 5+),
`printerroom` (Printer Room Access upgrade), `portal` (unlocked by lore).
Archive holds ~29 readable items; first examine costs 25 energy. **Portal unlock**
requires reading all three light-related items (`glitched`, `maintenance`,
`encrypted_lights`) AND `day >= 7` (see `PORTAL_UNLOCK_ENTRIES`).

### Printer, paper, paper quality
`printPaper` turns 3 energy into paper. **Paper quality** =
`printerQuality*0.7 + sanity*0.3` (weights shift toward sanity at low/critical
sanity). Printer upgrades raise quality, paper/print, and paper/sec.

### Documents, File Drawer, buffs
4 document types (memo, report, contract, prophecy), each with 5 tiers unlocked
by `documentMastery` (0/3/8/18/30 prints; higher tiers grant more mastery via
`TIER_MASTERY_WEIGHTS`). Printing rolls a quality outcome from paper quality:
corrupted ≤30, standard ≤60, pristine ≤90, perfect >90 (±10 variance). Printed
docs go to the **File Drawer** (`storedDocuments`, capacity 10 + skill). Consuming
applies the outcome: PP/sanity/energy/xp/skillPoint/materials/lore/locks, plus
timed **buffs/debuffs** in `activeReportBuffs` (cap `maxActiveBuffs`=3; over cap
auto-replaces the shortest, or prompts via `BuffReplacementModal` when a pending
buff is set). Shredding returns some paper. Expired buffs are pruned by the
100 ms tick, which logs a `"<name> wore off."` message so timed effects never end
silently (mutation sites still use `cleanExpiredBuffs` for correct cap math).

### Dimensional mining
Enter the portal (`DimensionalArea`) to collect floating material nodes up to
capacity (base 20, 40 with Reality Stabilizer). 7 materials from Void Fragment
(~40%) to Singularity Node (0.15%). Node material selection is weighted by base
rarity; a `rarityBonus` effect compounds by rarity rank to favour rarer tiers
(Material Scanner upgrade grants +0.5). Exit applies a portal cooldown (base
35-60 s, reduced by Dimensional Anchor, Temporal Accelerator, Portal Attunement,
achievements). Materials craft `DIMENSIONAL_UPGRADES`.

### Minigames
- **Debug** (`DebugModal`): fix a code snippet, 3 attempts, ~200-500 PP on
  success (+5 sanity), -10 sanity on failure. Glitch Compiler instead scales the
  reward to ~90 s of passive income (floored at the base), grants a 5 min +25%
  PP buff, and removes the sanity penalty on failure (no longer auto-passes).
- **Meditation** (`MeditationModal`): hold-to-breathe over 3 breaths. Hold Space
  (or the button) to inhale — the bar rises at a wandering speed; release inside
  the green zone near the top, then it exhales (drops). Closer to green = better.
  The modal runs the real-time minigame and calls `completeMeditation(avgScore)`,
  which grants 5-40 sanity by accuracy (doubled by Crystal Meditation, boosted by
  Deep Breathing insights). Unlocks at sanity ≤ 25.

### Events
`EVENTS` fire probabilistically in the tick (gated by `minDay`, fire once). They
nudge pp/energy/sanity and add flavour messages.

### Help, journal, notifications
Help popups are **state-based**: the first unseen popup whose `HELP_TRIGGERS`
predicate is true surfaces (so milestones already passed on an imported save still
appear). Dismissing a popup records its mechanic into the journal. In addition,
the 100 ms tick records any mechanic whose `HELP_TRIGGERS` predicate is currently
true into `discoveredMechanics` directly, so mechanics are "learned by
experiencing them" even when help is disabled or the popup window is missed (this
is what reliably surfaces the low-sanity / low-quality mechanics). `J` toggles the
journal. Notifications are a top-left auto-fading toast stack mirrored from event
messages.

### Focus Mode and offline progress
- **Focus Mode (Phase 20):** 20+ Sort clicks within 30 s sets
  `focusModeExpiry = now + 30s`, giving ×1.5 PP while active. Engaging it logs a
  message (only on the inactive→active transition) and its expiry logs another.
- **Offline progress (Phase 20):** on load, grant
  `floor(ppPerSecond * 0.5 * elapsedSeconds)`, only if elapsed > 60 s, capped at
  4 hours; posts a notification. Driven by `lastSavedAt`.

### Chapter 2: A Way Through
Begins once **every** upgrade (PP, printer, dimensional) is owned —
`isChapter1Complete` in `page.js` flips `chapter2IntroActive`, which routes to the
`Chapter2Intro` cinematic. Finishing it (`actions.startChapter2`) sets `chapter=2`,
`maxSanity=1000`, `meditationUnlocked=true`, and pops the `chapter2` help popup.
- **Sanity uncapped:** the tick clamps to `maxSanity` (1000) in chapter 2 instead
  of `getMaxSanity(100, …)`. Meditation/rest already cap on `maxSanity`. Above 100,
  the office's phase-2 drain is skipped and a **lucid decay** (0.02/tick) pulls
  sanity back toward 100, so staying lucid needs upkeep. `LUCID_ANCHOR_FLOORS`
  ([0,250,500,750] by `lucidAnchorTier`) set a permanent hard floor.
- **Lucid tiers:** `SANITY_TIERS.lucid1..lucid4/transcendent` (min 100/250/500/750/
  1000), each 1.0× PP/XP (clarity is NOT the PP path — low sanity still is) but
  carrying `lucidityRate`/`intelRate`. `getSanityTier` checks these first.
- **Resources:** reaching 1000% first time sets `resourcesUnlocked` and grants
  `RESOURCE_DISCOVERY_GRANT` (80 lucidity / 50 intelligence). After that, lucidity
  accrues passively while >100 (by tier), intelligence from Debug success (+8),
  consuming Reports (+6), and a lucid trickle; meditating while lucid adds lucidity.
- **Insights ("The Lucid Mind"):** `InsightsPanel` is Chapter 2's research system
  (counterpart to the skill tree). 21 insights in 5 branches (`INSIGHT_CATEGORIES`:
  Stability/Discipline/Perception/Cognition/Techniques), chained via `requires`,
  bought with intelligence (+some lucidity). Stability = Lucid Anchors (raise
  `lucidAnchorTier` → sanity floor). Passive insights contribute effects aggregated
  by `getInsightEffects` (`insightHelpers.js`) — meditationGainMult,
  meditationLucidityMult, lucidDecayReduction (cap 0.9), lucidityRateMult,
  intelRateMult, intelGainMult, clarityDuration/CostMult — hooked into the
  meditation result (gameActions `completeMeditation`), lucid decay + passive
  lucidity/intelligence gen (page.js tick), Debug/Report intelligence, and
  `craftClarity` (Clarity buff duration/cost). Techniques branch unlocks + tunes
  the Clarity craft.
- New state: `chapter`, `chapter2IntroActive/Seen`, `resourcesUnlocked`, `lucidity`,
  `intelligence`, `lucidAnchorTier`, `researchedInsights`, `insightsOpen`. Saves get
  these via the merge-over-`INITIAL_GAME_STATE` (no migration needed).

### The Construct (factory, Phase 2)
Open-ended automation engine, revealed at the same 1000% discovery
(`factoryUnlocked`; a tick backfill grants it to pre-existing saves). **Singular
machines**: each is built once and has a 10-step upgrade track. State
`factoryMachines[id]` is the machine's upgrade LEVEL (0..10); key present = built.
`FACTORY_MACHINES` (base stats + lore + priority) and `FACTORY_UPGRADES` (10 named
upgrades each) in constants; cost formula `getUpgradeCost` in `factoryHelpers`.
- **Power is a battery.** The Generator trickles power in (more per upgrade), the
  Capacitor Bank raises capacity, and each consumer drains its own `powerUse`.
  Each tick, generation tops up the battery, then consumers run in `priority`
  order; a machine runs only if the battery covers its FULL draw that tick,
  otherwise it **halts** (no output, no draw). Converters also halt if substrate
  is short. No throttling — binary per machine. Underpowered = lowest-priority
  machines go dark until the Generator is upgraded to outpace demand.
- **Stats:** `getEffectiveMachineStats` aggregates a machine's purchased upgrades
  (powerGenAdd / powerCapacityAdd / substrateAdd / powerUseMult / outputMult /
  outputAdd / substrateUseMult). `simulate(state, dt)` is shared by
  `computeFactoryTick` (authoritative, dt=0.1) and `getFactoryStats` (per-second
  UI summary + per-machine run/halt status). PP Synthesizer scales by PP tier.
  Materials are integers, so fractional output banks in `factoryMaterialAcc`.
- **Economy:** converters need a blueprint (intelligence) before building;
  building costs a one-time lucidity sum; upgrades cost lucidity (+substrate from
  L4, +intelligence from L7) via the cost formula. Each consumer machine
  (extractor + 5 converters) has an 11th **Overclock Module** upgrade.
- **Pause & overclock:** any built machine can be **paused** (`factoryPaused[id]`;
  skipped in `simulate`/capacity — no draw, gen, output, or capacity). Once the
  Overclock Module is owned, `factoryOverclock[id]` (50% to the dynamic cap,
  default 100) scales that machine's power draw, output, and substrate throughput
  together (`getEffectiveMachineStats` applies `getOverclock/100`) — letting players
  shift the limited power budget toward what they want more of. Actions
  `toggleMachinePause` / `setOverclock`. Per-machine max upgrade level is
  `getMaxLevel(id)` (= its upgrades length: 10, or 11 for consumers).
- **Overclock Regulator** (`overclocker` machine): a 9th machine that only becomes
  available once any machine owns an Overclock Module (`isMachineAvailable` /
  `availableWhen:'anyOverclock'`; hidden from the panel until then). It has no
  power/output of its own; its 10 upgrades (`overclockCapAdd`) raise the global
  overclock cap above the base 300% via `getOverclockCap(state)`, which clamps
  `getOverclock` and the panel slider.
- **Sprites:** animated **128×128** pixel-art per machine, drawn to look cobbled
  from office junk (printer guts, filing cabinet, monitor cube, microwave, etc.),
  muted body + vivid accent. Each has an animated base (4 frames) plus static
  **attachment** overlays that switch on at upgrade levels 3 / 6 / 10 (the
  `visual:true` milestones), so the machine visibly accretes parts. Stored as
  compact RLE/palette JSON (`factorySpriteData.js`, generated by
  `scripts/generateFactorySprites.mjs`), decoded to PXLS projects
  (`factorySpriteHelpers.js`: base layer + active attachment layers) and drawn by
  `FactorySprite.js` (takes a `level` prop) via the PXLS `compositeToCanvas`.
  `spriteToPxlsProject` exports a machine (frames + attachments as layers) into `/pxls`.
- New state: `factoryUnlocked`, `factoryOpen`, `power`, `substrate`,
  `factoryMachines{}` (level map), `factoryBlueprints[]`, `factoryMaterialAcc`. UI:
  `FactoryPanel.js` (carousel: one machine + lore + status + 10-upgrade track),
  "The Construct" entry in the LOCATIONS section, substrate readout in
  `GameStatsPanel`. Save bumped to v3 (old machine counts -> built level 0).

### Save system
`saveSystem.js`. Format `{ version, timestamp, state }`, `CURRENT_SAVE_VERSION=2`.
Versioned `MIGRATIONS` pipeline runs FROM-version steps, then merges over
`INITIAL_GAME_STATE` so new keys get defaults; offline progress applied after.
Supports file download/upload, clipboard export/import, and localStorage autosave
(`LOCAL_KEY = 'sarlak-office-horror-save'`).

---

## 6. UI composition

`page.js` returns early into a full-screen view when a corresponding flag is set,
checked in this priority order: SkillTree → Achievements → Journal →
pendingBuff → DimensionalArea → PrinterRoom → FileDrawer → Meditation → Debug →
ExamineItem → Archive. Otherwise it renders the main dashboard: header button row
(Skills, Achievements, Journal, File Drawer, Save, Help, Dev) then a grid of
`GameActionsPanel`, `GameUpgradesPanel`, `GameStatsPanel`, `GameSidebarExtras`,
with `HelpPopup`/`NotificationPopup` overlaid and the Save menu.

**Shared modal pattern:** fixed full-screen overlay, centered panel, monospace
font, CSS theme variables, ESC-to-close `useEffect`, and `NotificationPopup`
rendered alongside.

---

## 7. Conventions that matter here

- Functional `setState` only; never read `gameState` inside an update.
- All actions live in the `createGameActions` factory and are called as
  `actions.x()`. Never create standalone action functions.
- All PP math must go through `ppHelpers.js` — do not re-derive PP in components.
- Messages: prepend then `.slice(0, prev.maxLogMessages || 15)`.
- No emojis in UI/code. Escape JSX entities (Amplify lint).
- Side effects (XP, achievements) run via `setTimeout(..., 0/50/100)` after the
  state build, so they see committed state.

---

## 8. Quick tuning reference

| Thing | Value |
|------|------|
| Tick rate | 100 ms (10×/s) |
| Sort energy cost | 2 (min 10% of base) |
| Rest cooldown | 30 s (min 5 via skill) |
| Phase 1→2 | 100 PP |
| Sanity drain (phase 2) | 0.05/tick base |
| Meditation unlock | sanity ≤ 25 |
| Examine cost | 25 energy (first time) |
| Portal unlock | 3 light items read + day ≥ 7 |
| Portal capacity | 20 (40 w/ Stabilizer) |
| Portal cooldown | 35-60 s base |
| Buff cap | 3 |
| File Drawer cap | 10 (+ skill) |
| PP tiers | 10K ×2, 1M ×5, 1B ×25 |
| Focus Mode | 20 clicks/30 s → ×1.5 for 30 s |
| Offline PP | 50% of pp/sec, >60 s, cap 4 h |
| Chapter 2 trigger | all PP+printer+dimensional upgrades owned |
| Sanity cap (Ch.2) | 1000 (maxSanity) |
| Lucid decay (>100) | 0.02/tick toward 100 |
| Lucid tiers | 100 / 250 / 500 / 750 / 1000 |
| Resource discovery | first reach 1000% sanity (grant 80 luc / 50 int) |
| Lucid Anchor floors | 250 / 500 / 750 |
| Factory unlock | same 1000% discovery (`factoryUnlocked`) |
| Factory machines | singular (one of each), 10 upgrades each, level in factoryMachines[id] |
| Factory chain | Generator->Power battery (cap by Capacitor), Extractor->Substrate, Converters->resources |
| Power model | battery; consumers run in priority order, halt (binary) if battery can't cover full draw; machines can be paused; consumers can be overclocked 50-300% |
| Machine build cost | one-time lucidity; upgrades lucidity (+substrate L4, +intelligence L7) |
| Factory sprites | 128x128 office-junk, 4-frame base + attachments at L3/6/10, RLE JSON via PXLS renderer |
| Save version | 3 (factory machine counts -> built level 0) |

---

## 9. Notable findings and tech debt

Observations from the read worth tracking before further work:

1. **Dead chaos-bonus path.** `computeClickPP` applies `getChaosBonus`, but it
   depends on a `sanityChaosBonus` skill effect that no current skill in
   `SKILLS` produces. The bonus is effectively always 0.
2. **Legacy skill-effect keys.** `getActiveSkillEffects` initializes ~20 effect
   keys (paperQualityBonus, doubleChance, attackDamage, etc.) that the 8 live
   skills never set. Harmless but misleading.
3. **Stale `canPrintDocument`.** `sanityPaperHelpers.canPrintDocument` reads
   `docData.minPrinterQuality` / top-level `docData.cost` / `docData.maxSanity`,
   which no longer exist on `DOCUMENT_TYPES` (costs/limits moved per-tier). The
   live path is `canPrintDocumentTier`; the old function is superseded.
4. **Outdated tutorial text.** `HELP_POPUPS.paperQuality` states Reports need 30%
   and Contracts 60% paper quality, but the tier system gates by mastery (and
   contracts by sanity cost, prophecies by `maxSanity`). The popup is inaccurate.
5. **Emojis in `MECHANICS_ENTRIES.sanityTiers`** (colored circles) contradict the
   project-wide no-emoji rule.
6. **Help-text vs math framing.** `HELP_POPUPS.sanityTiers` frames HIGH sanity as
   "-15% PP/XP"; in code HIGH is the 1.0× baseline and MEDIUM is 1.15×. Same
   ratios, confusing wording.
7. **Planning docs were stale.** The deleted `.planning` roadmap listed Phase 17
   (PP tiers, achievement rewards) as not-done, but both are implemented in code
   (3-tier PP system, achievement `reward` fields, `getAchievementBonuses`,
   `TierUnlockModal`). Trust the code over old plans.

---

## 10. Dev tools

`DebugPanel.js` renders only when `process.env.NODE_ENV !== 'production'`
(`SHOW_DEV_TOOLS` in `page.js`). It can set resources, progression, unlocks,
materials, and load presets — useful for testing late-game systems without a long
grind. Not shipped to production.
