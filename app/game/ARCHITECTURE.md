# Office Horror — Master Architecture Document

**Location:** `app/game/`
**Stack:** Next.js 15.5.6, React 19.1.0, JavaScript (ES6+)
**Purpose:** This is the authoritative reference for the incremental horror game. Read this before
modifying any game system. It replaces reading the full source for understanding, and it documents
the real current state of the code including known divergences and tech debt. Keep it accurate: when
you change a system, update the matching section here.

> History note: several systems were **removed** over time — a loot/armory/equipment/combat system,
> the automation toggles, the prestige loop, the void contracts, and the end-game dimensional upgrades
> (Void Sight, Singularity Collapse, Tear the Veil) plus Temporal Rewind. Treat any mention of weapons,
> imbuements, attack/health, an Armory, prestige paths, void contracts, or "Tear the Veil → /survival"
> as dead unless you are deliberately reviving it.

---

## 1. Mental model

The whole game is **one client component** (`page.js`) holding **one fat state object** (`gameState`)
in a single `useState`. There is no engine and no per-entity loop — a single `setInterval` at 100 ms
in `page.js` is the only tick. All logic lives in:

- **Pure helpers** (`*Helpers.js`) that take `gameState` and return values, never mutating.
- **An action factory** (`gameActions.js`) that returns ~35 handlers, each doing
  *validate → calculate → build next state → defer side effects*.
- **Data/constants** (`constants.js`, `skillTreeConstants.js`, `dimensionalConstants.js`).

UI is **modal-as-route**: `page.js` returns early into a full-screen sub-view (skill tree, dimensional
area, printer room, file drawer, meditation, debug, archive, journal, buff replacement) based on a
state flag. Only one renders at a time. The default render is the main office screen (panels).

---

## 2. File map

### Data / constants
- `constants.js` (~1580 lines) — master data file. `INITIAL_GAME_STATE`, `LOCATIONS`, `UPGRADES`,
  `DIMENSIONAL_UPGRADES`, `PRINTER_UPGRADES`, `EVENTS`, `ACHIEVEMENTS`, `DOCUMENT_TYPES`
  (4 types × 5 tiers × 4 outcomes), `SANITY_TIERS`, `PP_MULTIPLIER_TIERS`,
  `TIER_MASTERY_WEIGHTS`, `HELP_POPUPS`, `HELP_TRIGGERS`, `JOURNAL_ENTRIES`, `MECHANICS_ENTRIES`,
  `LORE_SNIPPETS`, `DEBUG_CHALLENGES`.
- `skillTreeConstants.js` — `SKILLS` (a flat list of 8 standalone skills, each with an `effect(level)`
  closure), `LEVEL_SYSTEM` (linear XP curve, max level 50), `XP_REWARDS`.
- `dimensionalConstants.js` — `DIMENSIONAL_MATERIALS` (7 weighted rarities), `SIZE_RANGES`,
  `DIMENSIONAL_CAPACITY` (20), `generateEncryptedText`, `generateMaterialNodes`.

### Logic / helpers (pure)
- `gameActions.js` (~1220) — `createGameActions(setGameState, addMessage, checkAchievements, grantXP)`.
- `skillSystemHelpers.js` — XP/leveling (`addExperience`), `purchaseSkill`, `getActiveSkillEffects`,
  and the skill/achievement modifier appliers.
- `sanityPaperHelpers.js` — sanity tiers, paper-quality formula, document tier gating, quality→outcome
  roll, buff stacking, material RNG.
- `journalHelpers.js` — `discoverLocation`, `isLocationDiscovered`.
- `saveSystem.js` — file/clipboard save+load, shallow merge migration, offline-PP accrual.
- `gameUtils.js` — text distortion, clock, `formatPP`, DOM particle/screenshake effects.

### Orchestrator
- `page.js` (~1580) — the entire main UI shell, the 100 ms tick, all `useEffect` triggers, save menu,
  debug buttons, modal routing, and the wiring of every panel/action.

### Panels (main screen)
- `GameActionsPanel.js` — SORT PAPERS / REST / MEDITATE / location nav.
- `GameUpgradesPanel.js` — tabbed PP / printer / dimensional upgrades.
- `GameStatsPanel.js` — resource readouts, active buffs, level bar.
- `GameSidebarExtras.js` — event log / misc sidebar.

### Modals / sub-screens
- `DimensionalArea.js` — portal mining minigame (local session inventory, commits on exit).
- `PrinterRoom.js` — printer minigame (has its **own** print logic, separate from `printPaper`).
- `FileDrawer.js` — stored-document management.
- `SkillTreeModal.js` — flat skill-list UI (no branches/tiers).
- `ArchiveModal.js` / `ExamineModal.js` — archive document reading.
- `MeditationModal.js` — breathing-rhythm sanity minigame.
- `DebugModal.js` — code-fixing minigame.
- `JournalModal.js` — locations + mechanics tabs.
- `AchievementsModal.js`.
- `BuffReplacementModal.js` — at-buff-cap replacement prompt.
- `TierUnlockModal.js` — PP-tier celebration.
- `DebugPanel.js` — developer cheat panel (dev-only via `SHOW_DEV_TOOLS`).

### Small components
- `HelpPopup.js`, `NotificationPopup.js`, `EventLog.js`.

### Sibling docs
- `DEBUG_SYSTEM.md` — the debug minigame. `PLAYTIME_AND_BALANCE.md` (repo root) — balance analysis.

---

## 3. State model (`INITIAL_GAME_STATE`, constants.js)

Single source of truth, loaded via `useState(INITIAL_GAME_STATE)`. Canonical names — **do not rename**
(the save system has no real migration, so renames silently break old saves):

- **Resources:** `pp` (float), `energy` (max 100, +20 with `energydrink`), `sanity`, `maxSanity`,
  `ppPerClick`, `ppPerSecond`.
- **Time/phase:** `day`, `timeInOffice`, `phase` (1→2 when `pp > 100`).
- **Progression:** `playerLevel`, `playerXP`, `skillPoints`, `skills` ({id:level}).
- **Ownership maps ({id:true}):** `upgrades`, `printerUpgrades`, `dimensionalUpgrades`.
- **Arrays:** `unlockedLocations` (['cubicle']), `discoveredLocations`, `discoveredEvents`,
  `achievements`, `examinedArchiveItems`, `recentMessages`, `discoveredMechanics`, `storedDocuments`,
  `activeReportBuffs`, `notifications`, `activePathBonuses`.
- **Counters/flags:** `sortCount`, `printCount`, `breathCount`, `debugAttempts`, `restCooldown`,
  `portalCooldown`, plus the modal flags (`inDimensionalArea`, `inPrinterRoom`, `archiveOpen`,
  `journalOpen`, `fileDrawerOpen`, `meditating`, `debugMode`, …).
- **Printer/paper:** `paper`, `paperPerPrint`, `paperPerSecond`, `printerQuality`, `printerUnlocked`,
  `paperQuality`, `documentMastery` ({memos, reports, contracts, prophecies}).
- **Portal/dimensional:** `portalUnlocked`, `dimensionalInventory` ({materialId:count}),
  `timeRewindUsed`.
- **Buffs:** `maxActiveBuffs` (3) — **overloaded, see gotchas**; `pendingBuff`, `pendingBuffDocument`.
- **Late:** `focusModeExpiry`, `lastSavedAt`, `ppMultiplierTier`.
- **Help:** `helpEnabled`, `shownHelpPopups`, `currentHelpPopup`.

### Save/load (`saveSystem.js`)
- Format: `{ version: <number>, timestamp, state }`. `CURRENT_SAVE_VERSION` is read on load and a real
  `migrateState` runs ordered `MIGRATIONS` (keyed by the version migrating FROM) before merging over
  `INITIAL_GAME_STATE`. To change state shape: bump `CURRENT_SAVE_VERSION` and add a migration.
- Entry points: `saveGame` (download), `loadGame` (file), `exportToClipboard`, `importFromClipboard`,
  plus **localStorage autosave** — `saveToLocalStorage` / `loadFromLocalStorage` / `hasLocalSave` /
  `clearLocalSave`. `page.js` loads the autosave on mount and saves every 15s and on `beforeunload`.
- Offline PP: `applyOfflineProgress` (single shared helper) grants `floor(ppPerSecond*0.5*elapsed)` capped
  at 4h, measured from `state.lastSavedAt`. All save writers stamp `lastSavedAt` so active play is not
  miscounted as offline.

---

## 4. Systems

**Clicking / PP (`sortPapers`, gameActions.js).** Per click: energy cost (base 2 → skill reduction →
buff modifier, floored at 0.1× base; `checkFreeAction` may skip it) then PP = `ppPerClick`
→ `applyPPMultiplier` (skills) → `applySanityPPModifier` (sanity tier × stacked buffs)
→ × PP-tier mult (`PP_MULTIPLIER_TIERS`: 2× at 10K, 5× at 1M, 25× at 1B) → × chaos bonus
→ × (1 + achievement ppMultiplier) → × 1.5 if Focus Mode.

**Energy.** Max 100 (+20 energydrink). Only refilled by `rest` (full, 30 s cooldown, reduced by Power
Napping). No passive regen.

**Sanity-Paper (`sanityPaperHelpers.js`, `SANITY_TIERS`).** Four tiers by sanity: high 80-100 (×1.0),
medium 40-79 (×1.15), low 10-39 (×1.35), critical 0-9 (×1.5) — applied to both PP and XP (lower sanity =
more output = the core risk/reward lever). Drain runs in the tick (phase-gated; paused by any
`noSanityDrain` buff; floored by `reality_anchor`). Paper quality =
`floor(printerQuality*w1 + sanity*w2)`, weights shifting toward sanity at low/critical tiers.

**Skills (`skillTreeConstants.js` / `skillSystemHelpers.js`).** A **flat list of 8 standalone skills**
(no branches, no prerequisites): Efficient Sorting, Passive Systems, Cross-Department Synergy (PP);
Energy Conservation, Mental Fortitude, Power Napping (resilience); Portal Attunement, Temporal
Distortion. Each `effect(level)` returns partial effects; `getActiveSkillEffects` sums them into one
aggregate. **Every effect key is consumed by a live helper** — no placebo skills (the old tree had
several whose effects were never read: paper quality, document effect/cost, dimensional material
bonuses, portal duration). Leveling: 1 skill point/level + 2 every 5th, max level 50, **linear** XP
curve `50 * level` (replaced the old `100 * 1.3^(level-1)` exponential wall). Note: `getActiveSkillEffects`
still initializes legacy effect keys to 0 (harmless); the sanity-loss reduction is applied in the tick
drain, not via the otherwise-uncalled `getModifiedSanityLoss`.

**Buffs.** `activeReportBuffs[]`, each `{id, expiresAt, ppMult?, xpMult?, energyCostMult?,
ppPerSecondMult?, noSanityDrain?, materialMult?, …}`. Cap = `maxActiveBuffs`. Stacking is **additive on
the bonus portion** (three 2.5× → `1 + 1.5*3 = 5.5×`). Expired buffs cleaned lazily on each sort.

**File Drawer (`storedDocuments`, FileDrawer.js).** `printDocument` creates and **stores** a document
(no effect yet); `consumeDocument` applies its `outcome` (pp/sanity/energy/xp/skillPoint/materials/buff/
debuff/permanentPPPerSec/lore/locks). `shredDocument` returns paper by quality.

**Locations / dimensional.** `LOCATIONS`: cubicle, archive (29 lore items), portal (→ DimensionalArea),
printerroom (→ PrinterRoom). `DimensionalArea` generates encrypted text + weighted material nodes per
entry, mines into a **local** inventory, commits to `dimensionalInventory` on exit, then sets
`portalCooldown`. (There is **no** colleague/break-room mechanic — only lore references it.)

**Dimensional upgrades.** `dimensionalUpgrades` crafted from materials in `GameUpgradesPanel` — portal
cooldown/capacity, sanity floor/drain, meditation, debug bonus, `singularity_engine` (+50 PP/sec),
codex/scanner. (Void contracts and the end-game upgrades Void Sight / Singularity Collapse / Tear the
Veil, plus Temporal Rewind, were removed.)

*(There is no prestige / "Survive Another Day" loop — it was removed. The `promotion` upgrade is now
just a normal +10 `ppPerSecond` purchase.)*

**Achievements / XP / Meditation / Archive / Help.** `ACHIEVEMENTS[].check(state)` scanned by
`checkAchievements` (+50 XP each). `grantXP` → `addExperience`. Meditation is
a 3-breath rhythm game restoring sanity (unlocks at sanity ≤25). Archive: reading three specific lore
entries + day ≥7 unlocks the Portal. Help popups: a single effect surfaces the first `HELP_POPUPS[id]`
whose **state-based** `HELP_TRIGGERS[id](state)` predicate is true and that the player has not seen;
dismissing it adds `id` to `shownHelpPopups` AND `discoveredMechanics` (which reveals the matching
`MECHANICS_ENTRIES` journal entry). Keep `HELP_TRIGGERS`, `HELP_POPUPS` and `MECHANICS_ENTRIES` in
sync by id — a missing `HELP_POPUPS` entry means that journal mechanic can never be discovered.

---

## 5. Progression curve

First clicks (SORT PAPERS) → early PP upgrades (stapler 50 → coffee 150 first passive → printerroom 200
→ … archive 400 → debugger 500). **Phase 2 at pp>100**: real sanity drain begins. Printer/document loop
(print → printer upgrades → document tiers gated by mastery 0/3/8/18/30 → File Drawer → consume).
**Portal unlock** (3 archive entries + day ≥7) → dimensional mining → dimensional upgrades.
**PP-tier explosions** at 10K/1M/1B are the main payoff. (Passive income comes from `ppPerSecond`
upgrades/skills — there is no auto-clicker/automation toggle system, no prestige loop, and no void
contracts; all were removed. There is currently no hard end-game wall beyond the PP tiers.)

Gating mixes PP cost, day count, mastery counts, player level, and materials.

---

## 6. Conventions (follow these)

- **Functional setState only:** `setGameState(prev => ({ ...prev, ... }))`. Never reference `gameState`
  directly inside an update.
- **Actions go through the factory:** add new handlers inside `createGameActions`, following
  validate → calculate → build → side-effects. Side effects (XP, achievements, particles) are deferred
  with `setTimeout(..., 0/50/100)` so they run after the state commit.
- **Helpers are pure:** take `gameState`, return values, no mutation. Aggregate via
  `getActiveSkillEffects` / `getAchievementBonuses`.
- **Messages:** prepend via `addMessage`, always
  `recentMessages: [msg, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)`.
- **New state property:** add to `INITIAL_GAME_STATE` with a comment and correct type; reference the
  canonical name everywhere.
- **JSX:** escape `'` `"` `>` `}` in text (`&apos;` etc.) — `react/no-unescaped-entities` is enforced by
  the Amplify build. Run `npm run build` before pushing.

### Cascading-change checklist (game)
When you touch a system, verify: `INITIAL_GAME_STATE` · `HELP_POPUPS`/`HELP_TRIGGERS` ·
`MECHANICS_ENTRIES` · `ACHIEVEMENTS` checks · `gameActions.js` handlers · the panels showing the values ·
the tick in `page.js` · both light/dark rendering · this document.

---

## 7. Known issues, gotchas & optimization roadmap

These are real and worth fixing before building large new features on top.

### Gotchas that will bite you
- **PP is now one pipeline.** `ppHelpers.js` (`computeClickPP`, `computePassivePPPerSecond`) is the single
  source used by `sortPapers`, the passive tick, and both display calculators. Change PP math
  there, not in several places. (The displays now match real output.)
- **Buff cap vs drawer capacity are separate now.** `gameState.maxActiveBuffs` is purely the buff cap (3).
  File-drawer capacity is `getMaxStoredDocuments` (base 10 + Executive Authority skill), enforced in
  `printDocument`. The tick no longer mutates `maxActiveBuffs`.
- **Two print implementations remain.** `gameActions.printPaper` and `PrinterRoom.handlePrint` still give
  different rewards and only one updates `paperQuality` — deliberately left (the printer room is a separate
  minigame); merge carefully if you touch it.

### Behaviour changes to be aware of (from the optimization pass)
- Executive Authority no longer raises the buff cap (that was the old overload bug); it now raises
  document capacity, its real purpose. Buff cap stays 3.
- The File Drawer now has a real cap (10 + skill); printing is blocked when full.

### Optimization roadmap (status)
1. **(HIGH) Tick + re-render cost.** PARTIAL. `actions` is now `useMemo`'d and all panels/modals are
   `React.memo`'d; display calculators route through the canonical helpers. STILL OPEN: the 100 ms tick
   still copies all of `gameState` (so memo'd panels still re-render each tick because `gameState`
   identity changes), and the tick is not split into independent effects. The real remaining win is
   state-slicing / a reducer + context so panels subscribe to narrow slices.
2. **(HIGH) Unify the PP pipeline.** DONE — `ppHelpers.js`; displays match reality.
3. **(HIGH) Separate buff cap from drawer capacity.** DONE — `getMaxStoredDocuments` + `printDocument`
   enforcement; tick no longer mutates `maxActiveBuffs`.
4. **(HIGH) Real save system.** DONE — versioned `migrateState`, shared `applyOfflineProgress`,
   localStorage autosave wired in `page.js`.
5. **(MEDIUM) PrinterRoom/printPaper + magic numbers.** PARTIAL — offline-PP block de-duplicated. STILL
   OPEN: merging the two print implementations and centralizing scattered cost literals (sort 2, print 3,
   examine 25, rest 30, tier paper-return arrays). Deferred as behaviour-risky/low-value without tests.
6. **(MEDIUM) Decompose `page.js`.** PARTIAL — dev tools gated behind `SHOW_DEV_TOOLS` (dev-only), and
   the help-trigger logic is now a single data-driven effect over `HELP_TRIGGERS` (was ~6 near-identical
   effects). STILL OPEN: extracting a `useGameLoop` hook, a save-menu component, and a context/reducer to
   kill prop drilling — deferred as a high-risk structural rewrite to do under test coverage.

### Dead code & vestiges
Removed in the optimization pass: `enterDimensionalArea` and `documentsCreated` (page.js), and the
unreachable armory / dimensional-tear feature in `DimensionalArea.js`. `DimensionalUpgradesDisplay.js`
was removed earlier.

Still outstanding (low priority):
- `skillSystemHelpers` keeps a "Legacy effects" block (`attackDamage`, `maxHealth`, `critChance`, …) from
  the removed combat system. **Do not blind-delete** — some keys in it (`rarityBonus`, `energyEfficiency`,
  `sanityResistance`) are still read as fallbacks; removing them risks `NaN`.
- A `debugForceTearSpawn` flag may linger in constants/DebugPanel after the tear removal.
- `canPrintDocument` superseded by `canPrintDocumentTier`.

---

## 8. Where to start for common tasks

- **Add an upgrade:** `UPGRADES` (constants.js) → purchase handler in `gameActions.js` → display in
  `GameUpgradesPanel.js` → effect applied wherever relevant → achievement/help/journal if warranted.
- **Add a skill:** `SKILLS` (skillTreeConstants.js) with an `effect(level)` → ensure
  `getActiveSkillEffects` aggregates it → consume the aggregate in the relevant applier.
- **Tune balance:** PP costs in `UPGRADES`/tiers, `PP_MULTIPLIER_TIERS`, `LEVEL_SYSTEM` curve,
  `SANITY_TIERS` multipliers, `DOCUMENT_TYPES` outcomes, `DIMENSIONAL_MATERIALS` weights.
- **Add a document outcome:** `DOCUMENT_TYPES` (constants.js) → handle the outcome key in
  `consumeDocument` (gameActions.js).
- **Touch the loop:** the single `setInterval` lives in `page.js`; respect the memoization notes above.
