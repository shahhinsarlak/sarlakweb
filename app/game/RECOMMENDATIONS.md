# Office Horror — Design Recommendations

**Version:** 2.0.5 post-fix (written 2026-02-22)
**Audience:** Planner agents, developers. This document is the design blueprint for the next development phase.
**Status:** Specifications only — nothing here is implemented. Each recommendation is a candidate for a future phase.

---

## Overview

### What This Document Is

This document contains design specifications for fun-enhancement features that address the three primary diagnosed gaps in Office Horror's incremental design. It is the output of a codebase analysis phase (see CONTEXT.md for mechanics reference).

Each recommendation has three subsections:
- **Design Rationale:** Why this feature belongs in this game, what gap it fills, what design precedent it follows
- **Expected Player Impact:** What the player will feel and do differently at each game stage
- **Implementation Approach:** Concrete technical spec — state properties, file changes, integration points — detailed enough for a planner to build a full phase from it

### Target Aesthetic: Antimatter Dimensions

The target for Office Horror's next evolution is the Antimatter Dimensions pattern:
- **Layered automation:** Players configure HOW the game plays, not just HOW FAST
- **Prestige resets that feel rewarding:** Each reset is faster, richer, and mechanically distinct from the last
- **Number scale explosions:** Numbers grow large enough to feel abstract and awe-inspiring
- **Meaningful meta-progression:** Persistent upgrades across resets create a sense of permanent advancement

### Three Primary Diagnosed Gaps

1. **No automation layer** — Every action is manual forever. No "configure the machine" satisfaction.
2. **No prestige loop** — One playthrough, no reset structure. The vestigial `playerPath`/`pathScores` system was built for exactly this.
3. **No number scale explosions** — PP tops out at ~100,000. Numbers never become overwhelming.

### How to Use This Document

Each recommendation section is a self-contained design spec. A future planner can read Recommendation 1 and produce a complete implementation plan for that feature without reading the game source code. See CONTEXT.md for all mechanic references and state property names used below.

---

## Recommendation 1: Office Automation System

**Fills Gap 1 — No Automation Layer**

### Design Rationale

Antimatter Dimensions's auto-buyers are the most impactful feature because they let players configure HOW the game plays itself, not just HOW FAST. Office Horror has zero automation — every sort, every print, every portal entry is manual indefinitely. The SENIOR ANALYST passive (+10 ppPerSecond) is income, not decision-making. Automation should feel like hiring invisible assistants that the player configures.

The horror context makes automation thematically resonant: "you've been here so long the office runs itself." Automated sorting becomes existentially unsettling — the work continues without you. This is the core horror atmosphere gap: the game should feel like it's happening TO you, not requiring you to click.

### Expected Player Impact

- **Early unlock (autoSort):** Player stops clicking every 2 seconds. Freed from click fatigue, they start making strategic decisions: "My energy is accumulating — should I upgrade it or let autoSort burn through it faster?" First major satisfaction moment.
- **Mid game (autoPrint):** Resource efficiency puzzles emerge. "Set auto-print threshold to 20 paper so portal runs don't starve it." Player becomes a manager of automated systems, not a clicker.
- **Late game (autoPortal):** Fully automated economy that players observe and optimize rather than manually operate — the classic Antimatter Dimensions satisfaction. Player watches numbers grow exponentially and tweaks thresholds.
- **Atmosphere:** The automation layer deepens the horror. You configured the office to run without you. It already was.

### Implementation Approach

**New state properties** (add to `INITIAL_GAME_STATE` in constants.js):
```javascript
automation: {
  autoSort: false,              // Toggles auto-sort
  autoSortThreshold: 80,        // Only auto-sort if energy >= this value
  autoPrint: false,             // Toggles auto-print
  autoPrintDocType: 'memo',     // Which document type to auto-print
  autoPrintThreshold: 50,       // Only auto-print if paper >= this value
  autoPortal: false             // Toggles auto-portal entry
}
```

**Unlock mechanism** — add to `UPGRADES` array in constants.js:
```javascript
{ id: 'robotic_assistant', name: 'Robotic Assistant', cost: 5000, effect: 'unlock', value: 'autoSort',
  desc: 'An invisible hand sorts the papers. It has always been here.' },
{ id: 'document_automaton', name: 'Document Automaton', cost: 15000, effect: 'unlock', value: 'autoPrint',
  desc: 'The printer runs itself. You hear it printing at 3 AM.',
  requiresUpgrade: 'robotic_assistant' },
{ id: 'void_protocol', name: 'Void Protocol', cost: 50000, effect: 'unlock', value: 'autoPortal',
  desc: 'The portal opens on schedule. It expects you.',
  requiresUpgrade: 'document_automaton' }
```

**Game loop integration** (page.js, inside the 100ms `setInterval`):
```javascript
// After existing passive income block:
if (prev.automation?.autoSort && prev.energy >= (prev.automation.autoSortThreshold || 80)) {
  // Call sortPapers action inline (or create a silent internal version)
  // Deduct energy cost, add PP, increment sortCount
}

if (prev.automation?.autoPrint && prev.paper >= (prev.automation.autoPrintThreshold || 50)) {
  // Call print action for selected docType if resources available
}

if (prev.automation?.autoPortal && prev.portalCooldown === 0 && !prev.inDimensionalArea) {
  // Trigger portal entry
}
```

**UI** — new `AutomationPanel.js` component:
- Similar structure to `DebugPanel.js` (toggle + configuration per unlock)
- Shows each automation slot: locked (grayed) or active (toggle switch + threshold slider)
- Threshold slider: draggable, shows current value, labeled "Trigger when energy >= X"
- Unlock cost shown for locked slots
- Accessible from main UI as a new panel button (next to skill tree)

**Cascading changes checklist:**
- `INITIAL_GAME_STATE`: add `automation` object
- `UPGRADES`: add 3 automation unlock upgrades
- `HELP_POPUPS` + `HELP_TRIGGERS`: add 'firstAutomation' popup triggered on first autoSort enable
- `MECHANICS_ENTRIES`: add automation journal entry
- `ACHIEVEMENTS`: add 'first_automation' (enable any automation), 'full_automation' (enable all three)
- `AutomationPanel.js`: new component
- `page.js`: game loop integration, panel toggle button, import AutomationPanel

---

## Recommendation 2: Day Reset Prestige System

**Fills Gap 2 — No Prestige Loop**

### Design Rationale

The `playerPath` system (`seeker`, `rationalist`, `protector`, `convert`, `rebel`) and `pathScores` are defined in `INITIAL_GAME_STATE` but have zero gameplay impact — they are vestigial (see CONTEXT.md Known Tech Debt). These are the natural vehicle for prestige differentiation.

A "Survive Another Day" reset that preserves path-chosen bonuses and grants a permanent multiplier creates: (1) meaningful replay depth, (2) a reason for the 29 archive lore documents (path-selecting choices), (3) a way to make early game feel fresh on repeat, (4) finally giving `playerPath`/`pathScores` actual gameplay meaning.

In Antimatter Dimensions terms, this is the "Infinity" layer — the first meta-reset that fundamentally changes how you think about the game.

### Expected Player Impact

- **First reset:** Frightening but exciting — player sees what they retain vs what resets. The horror atmosphere is perfect for a scary reset confirmation: "SURVIVE ANOTHER DAY? Everything you know will be lost. Except what matters." Early game is noticeably faster on repeat due to prestige bonus.
- **Path choices become consequential:** Player chooses path based on how they want their prestige bonus. Seeker = XP advantage. Rationalist = PP advantage. Protector = sanity advantage. Convert = paper efficiency. Rebel = portal bonuses.
- **Meta-game emerges:** "I need to grind my Seeker pathScore before I reset so I unlock the tier 2 Seeker bonus." The 29 archive items become the mechanism for increasing pathScores (read items aligned with your path).
- **Antimatter Dimensions analogy:** This is the Infinity layer — the first reset that fundamentally changes how you think about the game.

### Implementation Approach

**New state properties** (add to `INITIAL_GAME_STATE` in constants.js):
```javascript
prestigeCount: 0,         // Number of times player has survived another day
prestigeMultiplier: 1,    // Applied to all PP gain: 1 + (0.1 * prestigeCount)
activePathBonus: null,    // Persistent path bonus from last reset: { type, value }
pathBonusTier: 0          // How many resets have boosted this path's bonus (0-5)
```

**Prestige trigger** — new action `survivedAnotherDay` in gameActions.js:
- Available only after purchasing SENIOR ANALYST upgrade (12000 PP)
- Requires confirmation modal (PrestigeSurviveModal.js — new component)
- Modal shows: what resets, what persists, current path bonus, new prestige multiplier

**Reset scope:**
```javascript
// RESETS to INITIAL_GAME_STATE defaults:
pp, energy, paper, upgrades, printerUpgrades, dimensionalUpgrades,
dimensionalInventory, portalUnlocked, inDimensionalArea, portalCooldown,
printerUnlocked, printCount, documentMastery, storedDocuments, activeReportBuffs,
lootInventory, achievements (partial — new reset achievement still awarded),
phase, day, sortCount, recentMessages

// PERSISTS across reset:
skills,                         // Keep but halve all skill levels (not wiped)
playerLevel, playerXP, skillPoints,  // Carry forward
playerPath, pathScores,         // Core of prestige system
prestigeCount,                  // Increment by 1
prestigeMultiplier,             // Recalculate: 1 + (0.1 * newPrestigeCount)
activePathBonus,                // From this reset's path choice
achievements (cosmetic ones only)  // Discovery achievements reset; milestone do not
```

**Prestige multiplier formula:**
```javascript
prestigeMultiplier = 1 + (0.1 * prestigeCount);
// Applied in PP gain chain (page.js or gameActions.js sortPapers):
ppGain *= gameState.prestigeMultiplier;
```

**Path bonus system** — on reset, active `playerPath` grants permanent passive:
```javascript
const PATH_BONUSES = {
  seeker:      { type: 'xpMultiplier',           value: 0.15 },  // +15% XP per reset
  rationalist: { type: 'ppPerClickMultiplier',    value: 0.20 },  // +20% ppPerClick per reset
  protector:   { type: 'sanityDrainReduction',    value: 0.10 },  // -10% sanity drain per reset
  convert:     { type: 'paperQualityBonus',       value: 10 },    // +10 paper quality pts per reset
  rebel:       { type: 'portalCooldownReduction', value: 0.15 }   // -15% portal cooldown per reset
};
// activePathBonus is set on reset and consumed by relevant calculations
```

**pathScores integration** — archive items grant pathScore when examined:
- Add `pathAlignment: 'seeker' | 'rationalist' | ...` field to each `ARCHIVE_CASES` item
- On examine, `pathScores[alignment] += 10`; dominant path becomes `playerPath`
- This gives 29 archive items gameplay meaning and gives players a reason to explore

**UI:**
- New `PrestigeSurviveModal.js` component: full-screen confirmation with dramatic styling
- Main UI: "SURVIVE ANOTHER DAY" button (visible only after SENIOR ANALYST purchased)
- Path display in main UI showing current path and pathScores (small indicator)

**Cascading changes checklist:**
- `INITIAL_GAME_STATE`: add 4 prestige properties
- `ARCHIVE_CASES`: add `pathAlignment` field to each item
- `ACHIEVEMENTS`: add 'survived_once' (first reset), 'survivor_x5' (5 resets), 'path_master' (reach tier 2 bonus)
- `HELP_POPUPS`: add 'prestige_available' popup at SENIOR ANALYST
- `gameActions.js`: add `survivedAnotherDay` action
- `PrestigeSurviveModal.js`: new component
- `page.js`: show modal trigger, integrate prestigeMultiplier into PP chain

---

## Recommendation 3: PP Multiplier Scale Explosions

**Fills Gap 3 — No Number Scale**

### Design Rationale

In Antimatter Dimensions, reaching Infinity for the first time feels catastrophic — the numbers become incomprehensible in the best way. Office Horror's PP tops out around 100,000 in normal play; numbers never become overwhelming or awe-inspiring. The Singularity Engine (+50 PP/sec linear) is the biggest late-game unlock but feels anticlimactic because it's just more of the same.

The horror context is perfect for number scale explosions: "the quota is no longer comprehensible" feels like a natural escalation of the office horror theme. Numbers becoming abstract (1.23M, 450B) is horrifying in an incremental game context.

### Expected Player Impact

- **Tier 1 (2x at 10,000 PP):** "Wait, my PP just doubled instantly?" — creates an aha moment players will chase. The first multiplier tier recontextualizes everything they've done so far.
- **Tier 2 (5x at 1,000,000 PP):** Numbers enter the millions. The game feels radically different — the same actions produce staggering output. Sanity drain feels more consequential because recovery is further.
- **Tier 3 (25x at 1,000,000,000 PP):** Numbers become genuinely abstract. The PP counter needs the abbreviation formatter. This is the Antimatter Dimensions "Infinity" feeling — awe-inspiring incomprehensibility.
- **Late game:** Players who have unlocked automation and prestige reach these tiers within minutes on second playthroughs — that's correct, and satisfying.

### Implementation Approach

**New state properties** (add to `INITIAL_GAME_STATE` in constants.js):
```javascript
ppMultiplierTier: 0,   // Current tier (0 = none, 1-3 = active tiers)
```

**Tier definitions** (add to constants.js as `PP_MULTIPLIER_TIERS`):
```javascript
export const PP_MULTIPLIER_TIERS = [
  { tier: 1, threshold: 10000,       multiplier: 2,  name: 'Reality Bonus',        desc: 'Productivity doubles. The office approves.' },
  { tier: 2, threshold: 1000000,     multiplier: 5,  name: 'Void Coefficient',     desc: 'Existence is multiplicative. Not additive.' },
  { tier: 3, threshold: 1000000000,  multiplier: 25, name: 'Singularity Resonance', desc: 'Numbers are no longer real. Neither are you.' }
];
```

**Game loop integration** (page.js, in the 100ms tick after PP calculation):
```javascript
// Check for tier unlock
const nextTier = PP_MULTIPLIER_TIERS[prev.ppMultiplierTier];
if (nextTier && prev.pp >= nextTier.threshold) {
  newState.ppMultiplierTier = prev.ppMultiplierTier + 1;
  // Trigger full-screen flash announcement (see UI below)
}
```

**PP gain integration** (in sortPapers action and passive tick):
```javascript
// After existing multiplier chain, apply tier multiplier:
const tierMultiplier = PP_MULTIPLIER_TIERS
  .slice(0, gameState.ppMultiplierTier)
  .reduce((total, tier) => total * tier.multiplier, 1);
ppGain *= tierMultiplier;
```

**Number formatter utility** (add to gameUtils.js):
```javascript
export const formatPP = (value) => {
  if (value < 10000) return Math.floor(value).toLocaleString();
  if (value < 1000000) return (value / 1000).toFixed(2) + 'K';
  if (value < 1000000000) return (value / 1000000).toFixed(2) + 'M';
  if (value < 1000000000000) return (value / 1000000000).toFixed(2) + 'B';
  return (value / 1000000000000).toFixed(2) + 'T';
};
```

**Tier unlock UI** — full-screen flash announcement on tier transition:
- Reuse `createLevelUpParticles()` visual from gameUtils.js
- Add a centered overlay modal (`TierUnlockModal.js`) showing tier name, description, and new multiplier
- Auto-dismisses after 3 seconds or on click
- Apply distortText effect with sanity-level severity to the announcement

**PP display update** (page.js UI):
- Replace raw PP number display with `formatPP(gameState.pp)` wherever PP is shown
- Add small tier indicator badge next to PP counter (e.g., "[T2]") when tier > 0

**Balance note:** Tier thresholds (10K, 1M, 1B) are calibrated for base gameplay. Post-automation + post-prestige, these should be reached within 1-2 runs max. That's correct — tier explosions are a mid-to-late game reward, not an early unlock.

**Cascading changes checklist:**
- `INITIAL_GAME_STATE`: add `ppMultiplierTier: 0`
- `constants.js`: add `PP_MULTIPLIER_TIERS` export
- `gameUtils.js`: add `formatPP` utility
- `gameActions.js` (sortPapers): apply tier multiplier
- `page.js` game loop: tier unlock check; `TierUnlockModal` display; PP display formatted
- `TierUnlockModal.js`: new component
- `ACHIEVEMENTS`: add 'tier1_unlock', 'tier2_unlock', 'tier3_unlock'
- `HELP_POPUPS`: add 'pp_scale_explained' popup at first tier unlock

---

## Recommendation 4: Meaningful Trade-Off Upgrades (Build Diversity)

### Design Rationale

Currently all upgrades are strictly additive — no upgrade asks you to give something up. This makes upgrade decisions trivial (always buy if you can afford it). Antimatter Dimensions has upgrades that trade one resource type for another, creating genuine build diversity and decision-making tension.

The horror context is a natural fit: void contracts are thematically appropriate. "The office offers you a deal. There is always a price."

### Expected Player Impact

- Players make identity choices ("Am I a sanity-sacrificer or a resource hoarder?") rather than just "buy everything cheaper."
- Replayability through build variation — different contract combinations make runs feel mechanically distinct.
- Each prestige run (Rec 2) can be combined with different contracts for new experiences.

### Implementation Approach

**New upgrade category** — add `VOID_CONTRACTS` array to constants.js:
```javascript
export const VOID_CONTRACTS = [
  {
    id: 'pact_paper_mountain',
    name: 'Pact of the Paper Mountain',
    cost: { void_fragment: 15, reality_dust: 5 },
    sacrifice: 'Permanently lose 30 max sanity',
    gain: '3x PP per click',
    desc: 'The void asks for clarity. You pay in sanity.',
    stateChanges: { permanentSanityLoss: 30, ppPerClickMultiplier: 3.0 },
    irreversible: true
  },
  {
    id: 'reality_bargain',
    name: 'Reality Bargain',
    cost: { glitch_shard: 20, static_crystal: 10 },
    sacrifice: 'Permanently reduce max energy by 20',
    gain: '5x paper quality',
    desc: 'Compressed reality. More focused, less resilient.',
    stateChanges: { permanentEnergyLoss: 20, paperQualityMultiplier: 5.0 },
    irreversible: true
  },
  {
    id: 'existential_debt',
    name: 'Existential Debt',
    cost: { singularity_node: 1 },
    sacrifice: 'Each Sort Papers costs 1 sanity instead of 2 energy',
    gain: 'Removes energy cost from sorting entirely',
    desc: 'Trade your mind for productivity. The office accepts.',
    stateChanges: { sortCostsSanity: true, sortCostsEnergy: false },
    irreversible: true,
    purchaseCondition: 'sanity >= 20'   // Cannot buy if sanity < 20
  }
];
```

**New state properties** (add to `INITIAL_GAME_STATE`):
```javascript
permanentSanityLoss: 0,        // Reduces effective max sanity
permanentEnergyLoss: 0,        // Reduces effective max energy
paperQualityMultiplier: 1,     // Applied in calculatePaperQuality
sortCostsSanity: false,        // If true, sortPapers costs sanity not energy
sortCostsEnergy: true,         // Default true; set false if sortCostsSanity
activeContracts: []            // Array of purchased contract IDs
```

**Integration points:**
- `sanityPaperHelpers.js` `calculatePaperQuality`: apply `paperQualityMultiplier`
- `gameActions.js` `sortPapers`: check `sortCostsSanity` flag
- Max sanity: `getMaxSanity()` in skillSystemHelpers.js should subtract `permanentSanityLoss`
- Max energy: apply `permanentEnergyLoss` in rest action (cap restore at 100 - permanentEnergyLoss)

**UI** — new `VoidContractsDisplay.js` component:
- Separate "VOID CONTRACTS" tab in `DimensionalUpgradesDisplay.js` (or separate modal)
- Each contract shows: sacrifice in red, gain in green, cost in material
- Warning before purchase: "THIS CONTRACT IS IRREVERSIBLE. Are you certain?"
- Purchased contracts shown as active with strike-through on sacrifice line

**Cascading changes:**
- `INITIAL_GAME_STATE`: 5 new properties
- `constants.js`: add `VOID_CONTRACTS` export
- `DimensionalUpgradesDisplay.js` or new `VoidContractsDisplay.js`: UI
- `gameActions.js`: sortCostsSanity check in sortPapers
- `skillSystemHelpers.js`: permanentSanityLoss in getMaxSanity
- `ACHIEVEMENTS`: add 'first_contract', 'three_contracts'
- `HELP_POPUPS`: add 'void_contracts_available' at first portal unlock

---

## Recommendation 5: Achievement Milestone Passive Bonuses

### Design Rationale

Currently achievements are purely cosmetic/discovery. Office Horror has 34 achievements — finding all of them is satisfying but mechanically meaningless. Antimatter Dimensions's achievement rewards give completionists permanent bonuses that make achievements mechanically valuable rather than just collectibles.

This is low-effort relative to impact: adding a `reward` field to 10-15 existing achievements and a 3-line accumulation function creates a meaningful secondary progression track.

### Expected Player Impact

- Completing "day_7" achievement now matters mechanically — it grants a permanent PP bonus.
- Players who explore all systems get compounding rewards. Completionists feel validated.
- Creates a secondary optimization layer: "If I get these 5 achievements, my PP multiplier goes to X."
- Low cognitive overhead — rewards are passive, not managed.

### Implementation Approach

**Add `reward` field to select achievements** (constants.js, `ACHIEVEMENTS` array):
```javascript
// Example additions to existing achievement objects:
{ id: 'week_one', name: 'Week One Complete', ...,
  reward: { type: 'ppMultiplier', value: 0.03, label: '+3% all PP gain' } },
{ id: 'workaholic', name: 'Workaholic', ...,
  reward: { type: 'ppMultiplier', value: 0.05, label: '+5% all PP gain' } },
{ id: 'portal_finder', name: 'Between Worlds', ...,
  reward: { type: 'portalCooldownReduction', value: 0.05, label: '-5% portal cooldown' } },
{ id: 'enlightened', name: 'Enlightened', ...,
  reward: { type: 'ppMultiplier', value: 0.10, label: '+10% all PP gain' } },
// 10-15 total rewards; rest remain cosmetic
```

**Reward accumulation function** (add to skillSystemHelpers.js or new achievementHelpers.js):
```javascript
export const getAchievementBonuses = (gameState) => {
  const completed = gameState.achievements || [];
  const bonuses = { ppMultiplier: 0, portalCooldownReduction: 0, sanityDrainReduction: 0 };

  ACHIEVEMENTS.forEach(achievement => {
    if (completed.includes(achievement.id) && achievement.reward) {
      const { type, value } = achievement.reward;
      if (bonuses[type] !== undefined) bonuses[type] += value;
    }
  });

  return bonuses;
};
```

**Integration** — apply in PP gain chain:
```javascript
// In sortPapers action and passive tick:
const achievementBonuses = getAchievementBonuses(prev);
ppGain *= (1 + achievementBonuses.ppMultiplier);
```

**UI:**
- In `AchievementsModal.js`: add small reward badge next to achievements that have rewards
- Show total earned bonuses at top of modal: "Achievement Bonuses: +XX% PP, -X% portal cooldown"
- Locked reward badges show what you'd earn (incentivize completion)

**Cascading changes:**
- `constants.js` `ACHIEVEMENTS`: add `reward` field to 10-15 entries
- `skillSystemHelpers.js` or `achievementHelpers.js`: add `getAchievementBonuses()`
- `gameActions.js`: apply achievement bonuses in PP calculation
- `AchievementsModal.js`: display reward badges and total bonuses
- No new state properties needed (computed from existing `achievements` array)

---

## Recommendation 6: Active vs Idle Dual Reward Path

### Design Rationale

Antimatter Dimensions rewards both active clickers and idle players differently through its automation layer. Office Horror currently gives no special reward for sustained active clicking vs leaving the game idle — the same passive income ticks either way. Adding mechanically distinct advantages for each play style creates another strategic axis and addresses retention.

The horror context enriches both paths: "Focus Mode" — the office consumes you when you're active. "Idle Accumulation" — the work was done without you. You were never needed.

### Expected Player Impact

- **Active sessions feel purposeful:** Players who are clicking feel their engagement is mechanically rewarded beyond just more clicks. The "Focus Mode" buff creates a satisfying rhythm of bursts.
- **Idle players have a reason to check back:** The offline accumulation reward creates a return incentive — checking the game after an hour feels meaningful.
- **Strategic choice:** Players decide: "Do I focus-click for 30 seconds for the burst buff, or let it idle for the accumulation bonus later?"
- **Addresses long-session vs check-in play styles:** Both are valid with distinct rewards.

### Implementation Approach

**New state properties** (add to `INITIAL_GAME_STATE`):
```javascript
lastActiveTimestamp: null,     // Timestamp of last user-initiated action
totalClicksThisSession: 0,     // Resets on page load
focusModeActive: false,        // Whether Focus Mode buff is active
focusModeExpiresAt: null,      // Timestamp when Focus Mode ends
lastSaveTimestamp: null        // Set on every saveGame call; used for idle accumulation
```

**Focus Mode (Active Reward):**
- Trigger: 20+ Sort Papers clicks within 30 seconds
- Mechanic: `setGameState` checks if `totalClicksThisSession` modulo 20 === 0 and time since last 20-click reset < 30s
- Effect: +50% ppPerClick for 30 seconds (`focusModeActive: true`, `focusModeExpiresAt: timestamp`)
- Visual: Subtle pulsing glow on the Sort Papers button during Focus Mode
- Message: "Focus achieved. The office responds to your urgency."
- Apply in `sortPapers` action: `if (prev.focusModeActive && Date.now() < prev.focusModeExpiresAt) ppGain *= 1.5;`

**Idle Accumulation (Offline Reward):**
- Trigger: On game load (page.js initialization, `useEffect` with `[]` dependency)
- Condition: If `lastSaveTimestamp` exists and time since save > 3600000ms (1 hour)
- Calculation:
  ```javascript
  const minutesOffline = (Date.now() - gameState.lastSaveTimestamp) / 60000;
  const cappedMinutes = Math.min(minutesOffline, 240);  // Max 4 hours
  const idlePP = gameState.ppPerSecond * 60 * cappedMinutes * 0.5;  // Half rate
  ```
- Apply on load: `setGameState(prev => ({ ...prev, pp: prev.pp + idlePP }))`
- Message: "You were away for X minutes. The office continued without you. [+Y PP]"
- Modal or notification on load showing idle gain

**saveSystem.js update:**
- `saveGame()` and `exportToClipboard()` should set `lastSaveTimestamp: Date.now()` in the state before saving

**Context note:** CONTEXT.md confirms no offline progress currently exists. This adds it for idle but at half rate, capped at 4 hours — reasonable initial balance.

**Cascading changes:**
- `INITIAL_GAME_STATE`: add 5 properties
- `gameActions.js` sortPapers: Focus Mode click counting + buff application
- `page.js`: idle accumulation check on mount, Focus Mode visual on Sort Papers button
- `saveSystem.js`: set `lastSaveTimestamp` on save
- `HELP_POPUPS`: 'focus_mode_explained' popup at first Focus Mode trigger
- `ACHIEVEMENTS`: 'focused' (trigger Focus Mode), 'well_rested' (collect idle bonus)

---

## Implementation Priority

Ordered by leverage vs effort:

| Priority | Recommendation | Effort | Leverage | Phase Candidate |
|---|---|---|---|---|
| 1 | Office Automation System (Rec 1) | Medium | Highest | Phase 4 — automation layer |
| 2 | PP Multiplier Scale Explosions (Rec 3) | Low-Medium | High | Phase 4 — alongside automation |
| 3 | Day Reset Prestige System (Rec 2) | High | Highest long-term | Phase 5 — after automation proven |
| 4 | Achievement Milestone Bonuses (Rec 5) | Low | Medium | Phase 4 — quick win alongside automation |
| 5 | Void Contracts (Rec 4) | Medium | Medium | Phase 5 — adds depth to prestige layer |
| 6 | Active vs Idle Dual Reward (Rec 6) | Medium | Medium | Phase 5 — retention feature |

**Rationale for order:**
- Automation (Rec 1) has the highest immediate impact on the "feels like an incremental game" problem. It should be first.
- Scale explosions (Rec 3) are architecturally simple (one multiplier, one formatter) and pair naturally with automation phase since higher PP matters more once automation is running.
- Achievement bonuses (Rec 5) are the cheapest win — retrofitting reward fields to existing achievements.
- Prestige (Rec 2) is highest complexity and highest long-term value; it should follow a proven automation system so first prestige run benefits from automation immediately.
- Void contracts (Rec 4) and active/idle (Rec 6) add depth that matters most in a multi-playthrough context, making them Phase 5 candidates.
