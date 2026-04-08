# Survival Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Armory system, revamp the Journal to 2 working tabs, add the "Tear the Veil" end-game breakthrough, and build a fully independent day-based survival game at `/survival`.

**Architecture:** Three sequential phases — Phase 1 cleans the office game (armory removal + journal), Phase 2 adds the Tear the Veil mechanic (routing bridge), Phase 3 builds the standalone `/survival` page with its own state, save system, and game loop. No shared code between `/game` and `/survival`.

**Tech Stack:** Next.js 15 App Router, React 19, JavaScript ES6+, localStorage for saves, CSS `steps()` for sprite animation. No test framework — verification is `npm run build` + manual browser check.

---

## Critical Rules (read before starting)

- **Commit and push after every task** — CLAUDE.md requires this: `git add [files] && git commit -m "..." && git push`
- **Escape all JSX special characters** — `'` → `&apos;`, `"` → `&quot;`. Unescaped entities break the AWS Amplify build.
- **Always functional setState** — `setGameState(prev => ({...prev, changes}))` never `setGameState({...gameState, changes})`
- **Run `npm run build` before committing** when modifying existing files — catches ESLint errors early

---

## File Map

### Deleted
- `app/game/Armory.js`
- `app/game/equipmentConstants.js`
- `app/game/lootConstants.js`
- `app/game/lootGenerationHelpers.js`
- `app/game/combatConstants.js` (legacy dead file)

### Modified
- `app/game/constants.js` — remove equipment state fields, remove armory dimensional upgrades, add `tear_the_veil` upgrade
- `app/game/page.js` — remove Armory import/render, clean upgrade handler, add `useRouter`, add cinematic overlay
- `app/game/JournalModal.js` — remove Equipment tab, replace with Mechanics as second tab
- `app/game/journalHelpers.js` — remove all equipment/colleague functions
- `app/game/DimensionalArea.js` — remove loot import
- `app/game/DimensionalUpgradesDisplay.js` — add PP cost display + check

### Created
- `app/survival/constants.js`
- `app/survival/saveSystem.js`
- `app/survival/gameActions.js`
- `app/survival/NarrativeIntro.js`
- `app/survival/ResourcePanel.js`
- `app/survival/DayPanel.js`
- `app/survival/EventLog.js`
- `app/survival/SurvivalGame.js`
- `app/survival/page.js`
- `app/survival/CLAUDE.md`

---

## Phase 1 — Office Cleanup

### Task 1: Delete dead files

**Files:** Delete 5 files

- [ ] **Step 1: Delete the files**

```bash
cd C:/Users/0blac/sarlakweb
rm app/game/Armory.js
rm app/game/equipmentConstants.js
rm app/game/lootConstants.js
rm app/game/lootGenerationHelpers.js
rm app/game/combatConstants.js
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "chore: delete armory, loot, combat dead files" && git push
```

---

### Task 2: Remove equipment/loot state from INITIAL_GAME_STATE in constants.js

**Files:**
- Modify: `app/game/constants.js`

- [ ] **Step 1: Remove these fields from `INITIAL_GAME_STATE`** (lines ~94–111)

Remove the entire Equipment System and Loot System blocks:

```js
// DELETE these lines from INITIAL_GAME_STATE:
  // Equipment System
  equippedWeapon: 'stapler_shiv',
  equippedArmor: {
    head: 'standard_headset',
    chest: 'dress_shirt',
    accessory: 'id_badge'
  },
  equippedAnomalies: [],
  inArmory: false,
  // Loot System (Added 2025-10-23)
  lootInventory: [],
  equippedLootWeapon: null,
  equippedLootArmor: {
    head: null,
    chest: null,
    accessory: null
  },
  equippedLootAnomalies: [],
```

- [ ] **Step 2: Update the `journalTab` comment** (line ~130)

Change:
```js
  journalTab: 'locations',         // Current tab: locations, equipment, mechanics
```
To:
```js
  journalTab: 'locations',         // Current tab: locations, mechanics
```

- [ ] **Step 3: Remove equipment discovery fields from INITIAL_GAME_STATE** (lines ~131–134)

Remove:
```js
  discoveredBaseWeapons: ['stapler_shiv'],
  discoveredBaseArmor: ['standard_headset', 'dress_shirt', 'id_badge'],
  discoveredBaseAnomalies: [],
```

Keep `discoveredMechanics: []` — this stays.

- [ ] **Step 4: Remove all armory-related entries from DIMENSIONAL_UPGRADES**

In the `DIMENSIONAL_UPGRADES` array, remove these entries entirely (they reference equipment unlocks):
- `drawer_key` (unlocks armory location)
- `shard_weapon`
- `void_cleaver_craft`
- `temporal_blade_craft`
- `reality_weapon_craft`
- `crystal_armor_craft`
- `void_visor_craft`
- `temporal_accessory_craft`
- `forgotten_memo_find`
- `glitched_keycard_find`
- `void_shard_collect`
- `singularity_core_extract`

Keep: `dimensional_anchor`, `reality_stabilizer`, `temporal_accelerator`, `void_shield`, `crystal_meditation`, `reality_anchor`, `glitch_compiler`, `singularity_engine`, `temporal_rewind`, `material_scanner`, `dimensional_codex`, `void_sight`, `singularity_collapse`.

- [ ] **Step 5: Add `tear_the_veil` to the end of `DIMENSIONAL_UPGRADES`** (after `singularity_collapse`)

```js
  // Breakthrough
  {
    id: 'tear_the_veil',
    name: 'Tear the Veil',
    ppCost: 5000000,
    materials: {
      void_fragment: 10,
      static_crystal: 5,
      glitch_shard: 3,
      reality_dust: 2,
      temporal_core: 1,
      dimensional_essence: 1,
      singularity_node: 1
    },
    effect: 'breakthrough',
    value: 'survival',
    requiresUpgrade: 'singularity_collapse',
    desc: 'There is something beyond this office. Beyond this reality. You can feel it pulling.'
  }
```

- [ ] **Step 6: Remove armory from ACHIEVEMENTS check functions**

Search for any achievement `check:` functions that reference `lootInventory`, `equippedLoot`, `inArmory`, or `discoveredBaseWeapons`. Remove or update those checks.

Run: `grep -n "lootInventory\|equippedLoot\|inArmory\|discoveredBase" app/game/constants.js`

Remove any matching achievement check lines.

- [ ] **Step 7: Remove armory from JOURNAL_ENTRIES help text**

Find and remove the loot reference in MECHANICS_ENTRIES (line ~1787):
```
// Find and delete this line in MECHANICS_ENTRIES if present:
Loot is stored in inventory and can be equipped in the Armory.
```

- [ ] **Step 8: Run build to check for errors**

```bash
npm run build
```

Expected: May show import errors from page.js and other files — that&apos;s fine, those are fixed in Task 3. If constants.js itself has syntax errors, fix them now.

- [ ] **Step 9: Commit**

```bash
git add app/game/constants.js && git commit -m "chore: remove armory state, loot fields, add tear_the_veil upgrade" && git push
```

---

### Task 3: Clean up page.js (remove Armory, loot handler, add router)

**Files:**
- Modify: `app/game/page.js`

- [ ] **Step 1: Remove Armory import and add useRouter**

At the top of page.js, remove:
```js
import Armory from './Armory';
```

Add to existing React/Next imports:
```js
import { useRouter } from 'next/navigation';
```

Also remove these imports (deleted files):
```js
// Remove any of these if present:
import { WEAPONS, ARMOR, ANOMALIES } from './equipmentConstants';
import { BASE_LOOT_ITEMS } from './lootConstants';
import { rollPrefix, rollImbuements, calculateFinalStats } from './lootGenerationHelpers';
```

- [ ] **Step 2: Add router hook** inside the component function body (near top with other hooks)

```js
const router = useRouter();
```

- [ ] **Step 3: Add veilTransition local state** (near other useState hooks)

```js
const [veilTransition, setVeilTransition] = useState(false);
```

- [ ] **Step 4: Clean the dimensional upgrade purchase handler**

Find the `handleDimensionalUpgrade` function (around line 295). Replace the entire `if (upgrade.effect === 'unlock')` block and the equipment crafting block with this clean version:

```js
// Inside setGameState(prev => { ... }):

if (upgrade.effect === 'ppPerSecond') {
  newState.ppPerSecond = (prev.ppPerSecond || 0) + upgrade.value;
} else if (upgrade.effect === 'breakthrough') {
  // Handled outside setGameState — trigger transition after state update
} else if (upgrade.effect === 'portalCooldown' || upgrade.effect === 'portalRespawn') {
  const newMaxCooldown = getModifiedPortalCooldown(60, newState);
  if (prev.portalCooldown > newMaxCooldown) {
    newState.portalCooldown = newMaxCooldown;
    newState.recentMessages = [`Crafted: ${upgrade.name}. Portal cooldown adjusted to ${newMaxCooldown}s.`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
  }
}
// All armory/equipment/loot unlock cases are removed
```

Also remove the PP cost deduction for armory-related upgrades. The `newInventory` block (that deducts materials) stays. Add PP deduction for `ppCost`:

```js
// After building newInventory (material deductions), add:
if (upgrade.ppCost) {
  newState.pp = (prev.pp || 0) - upgrade.ppCost;
}
```

- [ ] **Step 5: Add `canAfford` PP check in the upgrade handler**

Find where `canAfford` is checked at the top of the handler (the `if (!canAfford || prev.dimensionalUpgrades?.[upgrade.id]) return prev;` guard). Add PP check before it:

```js
const materialAfford = Object.entries(upgrade.materials).every(
  ([id, req]) => (prev.dimensionalInventory?.[id] || 0) >= req
);
const ppAfford = !upgrade.ppCost || (prev.pp || 0) >= upgrade.ppCost;
if (!materialAfford || !ppAfford || prev.dimensionalUpgrades?.[upgrade.id]) return prev;
```

Remove the old `canAfford` variable if it exists in the handler.

- [ ] **Step 6: Trigger cinematic transition after tear_the_veil purchase**

After the `setGameState(...)` call in the purchase handler, add:

```js
if (upgrade.effect === 'breakthrough') {
  setVeilTransition(true);
  setTimeout(() => {
    router.push('/survival');
  }, 3500);
}
```

- [ ] **Step 7: Remove inArmory render block**

Find and delete this block (around line 1036):
```js
if (gameState.inArmory) {
  return (
    <Armory
      ...
    />
  );
}
```

- [ ] **Step 8: Remove armory location unlock from upgrade handler**

Find and remove:
```js
if (upgrade.value === 'armory') {
  newState.unlockedLocations = [...new Set([...prev.unlockedLocations, 'armory'])];
  newState.recentMessages = ['The bottom drawer opens. Impossibly deep. An arsenal awaits.', 'NEW LOCATION: The Armory', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
}
```

- [ ] **Step 9: Remove armory from location name map**

Find `'armory': 'Unlocks The Armory'` in the location tooltip/name object and remove it.

- [ ] **Step 10: Add the cinematic overlay JSX**

In the return statement, before the closing `</>` or at the top level, add:

```jsx
{veilTransition && (
  <div style={{
    position: 'fixed',
    inset: 0,
    backgroundColor: '#000',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    animation: 'veilFadeIn 0.8s ease forwards'
  }}>
    <style>{`
      @keyframes veilFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes veilTextReveal {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    <p style={{
      color: '#e0e0e0',
      fontFamily: "'SF Mono', Monaco, monospace",
      fontSize: '16px',
      lineHeight: '2.2',
      textAlign: 'center',
      maxWidth: '400px',
      animation: 'veilTextReveal 1.2s ease 0.6s both'
    }}>
      The fluorescent lights flicker.<br />
      Then go out.<br />
      For the first time in years, you feel wind.<br />
      You don&apos;t look back.
    </p>
  </div>
)}
```

- [ ] **Step 11: Run build**

```bash
npm run build
```

Expected: clean build. Fix any remaining import errors — search for remaining references to deleted files:

```bash
grep -rn "equipmentConstants\|lootConstants\|lootGenerationHelpers\|combatConstants\|Armory" app/game/
```

Fix any hits.

- [ ] **Step 12: Commit**

```bash
git add app/game/page.js && git commit -m "feat: remove armory render, add Tear the Veil cinematic transition" && git push
```

---

### Task 4: Clean up DimensionalArea.js and DimensionalUpgradesDisplay.js

**Files:**
- Modify: `app/game/DimensionalArea.js`
- Modify: `app/game/DimensionalUpgradesDisplay.js`

- [ ] **Step 1: Remove loot import from DimensionalArea.js**

Find and remove:
```js
import { discoverEquipmentFromLoot } from './journalHelpers';
```

Find the loot drop code block in DimensionalArea.js that calls `discoverEquipmentFromLoot`. Remove those lines:
```js
// Remove these lines (around line 191):
const equipmentDiscoveries = discoverEquipmentFromLoot(prev, lootItem);
// and any state update spreading equipmentDiscoveries
```

- [ ] **Step 2: Update DimensionalUpgradesDisplay.js to support ppCost and requiresUpgrade**

Replace the `canAfford` function:

```js
const canAfford = (upgrade) => {
  if (!upgrade.materials || typeof upgrade.materials !== 'object') return false;
  const materialsOk = Object.entries(upgrade.materials).every(
    ([materialId, required]) => (gameState.dimensionalInventory?.[materialId] || 0) >= required
  );
  const ppOk = !upgrade.ppCost || (gameState.pp || 0) >= upgrade.ppCost;
  return materialsOk && ppOk;
};
```

Replace the `availableUpgrades` filter to support `requiresUpgrade`:

```js
const availableUpgrades = DIMENSIONAL_UPGRADES.filter(u => {
  if (gameState.dimensionalUpgrades?.[u.id]) return false;
  if (portalUpgradeIds.includes(u.id) && !gameState.portalUnlocked) return false;
  if (u.requiresUpgrade && !gameState.dimensionalUpgrades?.[u.requiresUpgrade]) return false;
  return true;
});
```

Add PP cost display inside the upgrade button, after the materials display:

```jsx
{upgrade.ppCost && (
  <span style={{
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: (gameState.pp || 0) >= upgrade.ppCost ? 'var(--accent-color)' : '#ff6b6b'
  }}>
    PP: {(gameState.pp || 0).toLocaleString()}/{upgrade.ppCost.toLocaleString()}
  </span>
)}
```

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add app/game/DimensionalArea.js app/game/DimensionalUpgradesDisplay.js && git commit -m "feat: update dimensional area and upgrades for tear_the_veil" && git push
```

---

### Task 5: Revamp JournalModal.js (2 tabs: Locations + Mechanics)

**Files:**
- Modify: `app/game/JournalModal.js`

- [ ] **Step 1: Remove unused imports**

Remove at the top:
```js
import { WEAPONS, ARMOR, ANOMALIES } from './equipmentConstants';
```

Keep:
```js
import { JOURNAL_ENTRIES, LOCATIONS, MECHANICS_ENTRIES } from './constants';
```

- [ ] **Step 2: Remove equipment-related variables at the top of the component**

Remove:
```js
const allWeaponIds = Object.keys(WEAPONS);
const allArmorIds = Object.keys(ARMOR);
const allAnomalyIds = Object.keys(ANOMALIES);
```

- [ ] **Step 3: Delete the entire `renderEquipmentTab` function**

Find `const renderEquipmentTab = () => {` and delete the entire function body.

- [ ] **Step 4: Update the tab navigation array**

Find the tabs array:
```js
{ id: 'locations', label: 'Locations' },
{ id: 'equipment', label: 'Equipment' },
{ id: 'mechanics', label: 'Mechanics' }
```

Replace with:
```js
{ id: 'locations', label: 'Locations' },
{ id: 'mechanics', label: 'Mechanics' }
```

- [ ] **Step 5: Update the content area rendering**

Find:
```js
{currentTab === 'locations' && renderLocationsTab()}
{currentTab === 'equipment' && renderEquipmentTab()}
{currentTab === 'mechanics' && renderMechanicsTab()}
```

Replace with:
```js
{currentTab === 'locations' && renderLocationsTab()}
{currentTab === 'mechanics' && renderMechanicsTab()}
```

- [ ] **Step 6: Run build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 7: Commit**

```bash
git add app/game/JournalModal.js && git commit -m "feat: revamp journal to locations + mechanics tabs" && git push
```

---

### Task 6: Clean up journalHelpers.js

**Files:**
- Modify: `app/game/journalHelpers.js`

- [ ] **Step 1: Remove the equipmentConstants import**

Remove:
```js
import { WEAPONS, ARMOR, ANOMALIES } from './equipmentConstants';
```

- [ ] **Step 2: Delete equipment and colleague functions**

Delete these entire functions:
- `discoverColleague`
- `extractBaseEquipmentId` (private helper)
- `discoverEquipmentFromLoot`
- `discoverEquipmentById`
- `isEquipmentDiscovered`
- `getDiscoveryCounts` (references equipment fields — remove entirely)
- `getColleagueRelationshipSummary`
- `isColleagueDiscovered`

Keep:
- `discoverLocation`
- `isLocationDiscovered`

- [ ] **Step 3: Final journalHelpers.js should look like this**

```js
/**
 * Journal System Helpers
 * Location discovery tracking
 */

export const discoverLocation = (gameState, locationId) => {
  if (!locationId) return gameState.discoveredLocations;
  const discovered = gameState.discoveredLocations || [];
  if (discovered.includes(locationId)) return discovered;
  return [...discovered, locationId];
};

export const isLocationDiscovered = (gameState, locationId) => {
  return (gameState.discoveredLocations || []).includes(locationId);
};
```

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: clean build. If anything still imports the removed functions, fix those imports.

```bash
grep -rn "discoverEquipment\|discoverColleague\|isEquipmentDiscovered\|getDiscoveryCounts\|getColleagueRelationship" app/game/
```

Remove any hits.

- [ ] **Step 5: Commit**

```bash
git add app/game/journalHelpers.js && git commit -m "chore: strip journalHelpers to location-only tracking" && git push
```

---

### Task 7: Phase 1 final build verification

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: 0 errors, 0 warnings about missing modules.

- [ ] **Step 2: Run dev and verify in browser**

```bash
npm run dev
```

Navigate to `http://localhost:3000/game`:
- [ ] Game loads without errors
- [ ] No Armory button/location visible in nav
- [ ] Journal opens with 2 tabs: Locations and Mechanics only
- [ ] Dimensional upgrades panel shows no armory crafting entries
- [ ] Tear the Veil upgrade is hidden (only appears after singularity_collapse)

---

## Phase 2 — Tear the Veil (already wired in Tasks 2–3, this task verifies end-to-end)

### Task 8: Verify Tear the Veil end-to-end

- [ ] **Step 1: Use debug panel to test transition**

In `DebugPanel.js` or browser console, manually set `dimensionalUpgrades.singularity_collapse = true` and `pp = 5000000` and all required materials.

Verify:
- [ ] Tear the Veil upgrade appears in dimensional upgrades panel after singularity_collapse
- [ ] PP cost displays correctly (red when insufficient, amber when sufficient)
- [ ] All 7 material costs display correctly
- [ ] Clicking purchase triggers the cinematic overlay
- [ ] Overlay text appears: "The fluorescent lights flicker..."
- [ ] After ~3.5 seconds, browser navigates to `/survival` (currently 404 — that&apos;s expected until Phase 3)

- [ ] **Step 2: Commit verification note** (no code change needed if everything works)

```bash
git commit --allow-empty -m "chore: verify tear_the_veil transition works end-to-end" && git push
```

---

## Phase 3 — Survival Game

### Task 9: Create app/survival/constants.js

**Files:**
- Create: `app/survival/constants.js`

- [ ] **Step 1: Create the file**

```js
// app/survival/constants.js
// === DAY_CONFIG === (add new day structure config here)
export const DAY_CONFIG = {
  baseActionSlots: 4,
};

// === INITIAL_STATE ===
export const INITIAL_SURVIVAL_STATE = {
  day: 1,
  food: 3,
  water: 3,
  firewood: 2,
  shelter: 10,
  daysWithoutFood: 0,
  daysWithoutWater: 0,
  actionLog: [],        // Array of narrative strings
  chosenActions: [],    // Action IDs queued for current day
  bonusActionSlotNextDay: false,
  bonusActionSlotToday: false,
  isDead: false,
  introSeen: false,
};

// === RESOURCES === (add new resources here)
export const RESOURCE_DRAIN = {
  food: 1,
  water: 1,
  firewood: 1,   // only consumed if firewood > 0
  shelter: 2,    // integrity decay per day
};

// === ACTIONS === (add new actions here)
export const ACTIONS = [
  {
    id: 'forage',
    label: 'Forage',
    slots: 1,
    desc: 'Search the area for edible plants and berries.',
    resolve: () => ({ food: Math.floor(Math.random() * 3) + 1 }),
  },
  {
    id: 'collect_water',
    label: 'Collect Water',
    slots: 1,
    desc: 'Find a stream or collect rainwater.',
    resolve: () => ({ water: Math.floor(Math.random() * 3) + 2 }),
  },
  {
    id: 'gather_wood',
    label: 'Gather Wood',
    slots: 1,
    desc: 'Collect firewood to survive the night.',
    resolve: () => ({ firewood: Math.floor(Math.random() * 2) + 2 }),
  },
  {
    id: 'build_shelter',
    label: 'Build Shelter',
    slots: 1,
    desc: 'Repair and reinforce your shelter.',
    resolve: () => ({ shelter: Math.floor(Math.random() * 6) + 5 }),
  },
  {
    id: 'rest',
    label: 'Rest',
    slots: 1,
    desc: 'Recover. Gain a bonus action slot tomorrow.',
    resolve: () => ({ bonusActionSlot: true }),
  },
  {
    id: 'hunt',
    label: 'Hunt',
    slots: 2,
    desc: 'Stalk larger game. Costs 2 slots. Chance of failure.',
    resolve: () => {
      const success = Math.random() > 0.3;
      return success
        ? { food: Math.floor(Math.random() * 4) + 3 }
        : { huntFailed: true };
    },
  },
  {
    id: 'explore',
    label: 'Explore',
    slots: 1,
    desc: 'Venture further out. Unknown outcomes.',
    resolve: () => ({ triggerExploreEvent: true }),
  },
];

// === EVENTS === (add new random events here)
export const EVENTS = [
  { id: 'clear_day', narrative: 'A clear sky. Nothing remarkable happens.', effect: {} },
  { id: 'rain', narrative: 'Rain. Your water stores are replenished.', effect: { water: 2 } },
  { id: 'cold_night', narrative: 'A bitter night. Your firewood burns faster.', effect: { firewood: -1 } },
  { id: 'found_berries', narrative: 'A berry bush nearby. Small mercy.', effect: { food: 2 } },
  { id: 'storm', narrative: 'A storm battered your shelter while you slept.', effect: { shelter: -10 } },
  { id: 'quiet', narrative: 'Quiet. Just wind. It is almost peaceful.', effect: {} },
  { id: 'morning_mist', narrative: 'Heavy mist in the morning. The world feels far away.', effect: {} },
  { id: 'animal_nearby', narrative: 'You heard something moving in the dark. It did not come closer.', effect: {} },
];

export const EXPLORE_EVENTS = [
  { id: 'found_cache', narrative: 'An old supply cache, half-buried. Food and water inside.', effect: { food: 4, water: 3 } },
  { id: 'high_ground', narrative: 'From higher ground you see the landscape clearly. The horizon is vast.', effect: {} },
  { id: 'old_fire', narrative: 'Someone camped here before you. They left firewood.', effect: { firewood: 4 } },
  { id: 'dangerous_terrain', narrative: 'Unstable ground. You retreat carefully. Time wasted.', effect: {} },
  { id: 'fresh_water', narrative: 'A spring. Clean water. You drink deeply and fill what you can carry.', effect: { water: 5 } },
];
```

- [ ] **Step 2: Commit**

```bash
git add app/survival/constants.js && git commit -m "feat(survival): add constants — resources, actions, events" && git push
```

---

### Task 10: Create app/survival/saveSystem.js

**Files:**
- Create: `app/survival/saveSystem.js`

- [ ] **Step 1: Create the file**

```js
// app/survival/saveSystem.js
const SAVE_KEY = 'officeHorror_survival';

export const loadSurvivalState = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSurvivalState = (state) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {}
};

export const clearSurvivalSave = () => {
  localStorage.removeItem(SAVE_KEY);
};
```

- [ ] **Step 2: Commit**

```bash
git add app/survival/saveSystem.js && git commit -m "feat(survival): add save system" && git push
```

---

### Task 11: Create app/survival/gameActions.js

**Files:**
- Create: `app/survival/gameActions.js`

- [ ] **Step 1: Create the file**

```js
// app/survival/gameActions.js
import { ACTIONS, EVENTS, EXPLORE_EVENTS, RESOURCE_DRAIN, DAY_CONFIG } from './constants';

const applyEffect = (state, effect) => {
  const s = { ...state };
  if (effect.food !== undefined) s.food = Math.max(0, s.food + effect.food);
  if (effect.water !== undefined) s.water = Math.max(0, s.water + effect.water);
  if (effect.firewood !== undefined) s.firewood = Math.max(0, s.firewood + effect.firewood);
  if (effect.shelter !== undefined) s.shelter = Math.min(100, Math.max(0, s.shelter + effect.shelter));
  return s;
};

/**
 * Add an action ID to the current day's queue.
 * Returns updated state, or unchanged state if not enough slots.
 */
export const queueAction = (state, actionId) => {
  const action = ACTIONS.find(a => a.id === actionId);
  if (!action) return state;

  const totalSlots = DAY_CONFIG.baseActionSlots + (state.bonusActionSlotToday ? 1 : 0);
  const usedSlots = state.chosenActions.reduce((sum, id) => {
    const a = ACTIONS.find(x => x.id === id);
    return sum + (a?.slots || 1);
  }, 0);

  if (usedSlots + action.slots > totalSlots) return state;

  return { ...state, chosenActions: [...state.chosenActions, actionId] };
};

/**
 * Remove the last instance of actionId from the queue.
 */
export const dequeueAction = (state, actionId) => {
  const idx = [...state.chosenActions].reverse().findIndex(id => id === actionId);
  if (idx === -1) return state;
  const realIdx = state.chosenActions.length - 1 - idx;
  const next = [...state.chosenActions];
  next.splice(realIdx, 1);
  return { ...state, chosenActions: next };
};

/**
 * Resolve the current day: apply queued actions, fire a random event,
 * apply daily drain, check death, increment day.
 * Returns { newState, isDead, narrativeLines }
 */
export const resolveDay = (state) => {
  let s = { ...state };
  const narrativeLines = [];

  // 1. Apply queued actions
  for (const id of s.chosenActions) {
    const action = ACTIONS.find(a => a.id === id);
    if (!action) continue;

    const result = action.resolve(s);

    if (result.food) s.food = Math.max(0, s.food + result.food);
    if (result.water) s.water = Math.max(0, s.water + result.water);
    if (result.firewood) s.firewood = Math.max(0, s.firewood + result.firewood);
    if (result.shelter) s.shelter = Math.min(100, Math.max(0, s.shelter + result.shelter));
    if (result.bonusActionSlot) s.bonusActionSlotNextDay = true;
    if (result.huntFailed) narrativeLines.push('The hunt failed. You return empty-handed.');
    if (result.triggerExploreEvent) {
      const ev = EXPLORE_EVENTS[Math.floor(Math.random() * EXPLORE_EVENTS.length)];
      narrativeLines.push(ev.narrative);
      s = applyEffect(s, ev.effect);
    }
  }

  // 2. Fire random world event
  const worldEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  narrativeLines.push(worldEvent.narrative);
  s = applyEffect(s, worldEvent.effect);

  // 3. Daily consumption
  s.food = Math.max(0, s.food - RESOURCE_DRAIN.food);
  s.water = Math.max(0, s.water - RESOURCE_DRAIN.water);
  if (s.firewood > 0) {
    s.firewood = Math.max(0, s.firewood - RESOURCE_DRAIN.firewood);
  }
  s.shelter = Math.max(0, s.shelter - RESOURCE_DRAIN.shelter);

  // 4. Death tracking
  s.daysWithoutFood = s.food <= 0 ? (s.daysWithoutFood || 0) + 1 : 0;
  s.daysWithoutWater = s.water <= 0 ? (s.daysWithoutWater || 0) + 1 : 0;
  const isDead = s.daysWithoutFood >= 2 || s.daysWithoutWater >= 2;

  // 5. Advance day
  const completedDay = s.day;
  s.day = s.day + 1;
  s.chosenActions = [];
  s.bonusActionSlotToday = s.bonusActionSlotNextDay || false;
  s.bonusActionSlotNextDay = false;

  // 6. Append to log
  const logEntry = [`Day ${completedDay}`, ...narrativeLines, '---'];
  s.actionLog = [...(s.actionLog || []), ...logEntry];

  if (isDead) s.isDead = true;

  return { newState: s, isDead, narrativeLines };
};
```

- [ ] **Step 2: Commit**

```bash
git add app/survival/gameActions.js && git commit -m "feat(survival): add game actions — queue, dequeue, resolveDay" && git push
```

---

### Task 12: Create app/survival/NarrativeIntro.js

**Files:**
- Create: `app/survival/NarrativeIntro.js`

- [ ] **Step 1: Create the file**

```jsx
// app/survival/NarrativeIntro.js
'use client';

export default function NarrativeIntro({ onDismiss }) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 100,
      }}
    >
      <div style={{
        maxWidth: '420px',
        padding: '40px',
        textAlign: 'center',
        fontFamily: "'SF Mono', Monaco, 'Inconsolata', monospace",
        color: '#d4c5a0',
      }}>
        <p style={{ fontSize: '13px', lineHeight: '2.4', marginBottom: '40px' }}>
          Day 1.<br />
          You don&apos;t know how long you were in there.<br />
          The sun is real. The air is cold.<br />
          You have nothing.<br />
          Survive.
        </p>
        <p style={{ fontSize: '11px', opacity: 0.4 }}>
          click to begin
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/survival/NarrativeIntro.js && git commit -m "feat(survival): add narrative intro screen" && git push
```

---

### Task 13: Create app/survival/ResourcePanel.js

**Files:**
- Create: `app/survival/ResourcePanel.js`

- [ ] **Step 1: Create the file**

```jsx
// app/survival/ResourcePanel.js
'use client';

const ResourceBar = ({ label, value, max = 20, warn = 5, critical = 2 }) => {
  const pct = Math.min(100, (value / max) * 100);
  const color = value <= critical ? '#cc4444' : value <= warn ? '#cc8844' : '#6aaa6a';

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        marginBottom: '4px',
        fontFamily: "'SF Mono', Monaco, monospace",
        color: '#b0a88a',
      }}>
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div style={{
        height: '4px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: color,
          transition: 'width 0.3s ease, background-color 0.3s ease',
        }} />
      </div>
    </div>
  );
};

export default function ResourcePanel({ state }) {
  return (
    <div style={{
      padding: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      fontFamily: "'SF Mono', Monaco, monospace",
    }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '16px' }}>
        Day {state.day} — Resources
      </div>
      <ResourceBar label="FOOD" value={state.food} warn={3} critical={1} />
      <ResourceBar label="WATER" value={state.water} warn={3} critical={1} />
      <ResourceBar label="FIREWOOD" value={state.firewood} warn={2} critical={1} />
      <ResourceBar label="SHELTER" value={state.shelter} max={100} warn={20} critical={10} />
      {(state.daysWithoutFood > 0 || state.daysWithoutWater > 0) && (
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#cc4444' }}>
          {state.daysWithoutFood > 0 && <div>Starving: day {state.daysWithoutFood} of 2</div>}
          {state.daysWithoutWater > 0 && <div>Dehydrated: day {state.daysWithoutWater} of 2</div>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/survival/ResourcePanel.js && git commit -m "feat(survival): add resource panel with bars" && git push
```

---

### Task 14: Create app/survival/DayPanel.js

**Files:**
- Create: `app/survival/DayPanel.js`

- [ ] **Step 1: Create the file**

```jsx
// app/survival/DayPanel.js
'use client';
import { ACTIONS, DAY_CONFIG } from './constants';

export default function DayPanel({ state, onQueueAction, onDequeueAction, onEndDay }) {
  const totalSlots = DAY_CONFIG.baseActionSlots + (state.bonusActionSlotToday ? 1 : 0);
  const usedSlots = state.chosenActions.reduce((sum, id) => {
    const a = ACTIONS.find(x => x.id === id);
    return sum + (a?.slots || 1);
  }, 0);
  const remainingSlots = totalSlots - usedSlots;

  // Count queued occurrences per action
  const queueCounts = {};
  state.chosenActions.forEach(id => {
    queueCounts[id] = (queueCounts[id] || 0) + 1;
  });

  return (
    <div style={{
      padding: '20px',
      fontFamily: "'SF Mono', Monaco, monospace",
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5 }}>
          Actions — {usedSlots}/{totalSlots} slots
        </div>
        <button
          onClick={onEndDay}
          disabled={usedSlots === 0}
          style={{
            background: usedSlots > 0 ? 'rgba(180, 140, 80, 0.15)' : 'transparent',
            border: `1px solid ${usedSlots > 0 ? '#b48c50' : 'rgba(255,255,255,0.15)'}`,
            color: usedSlots > 0 ? '#b48c50' : 'rgba(255,255,255,0.3)',
            padding: '6px 14px',
            cursor: usedSlots > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            fontSize: '11px',
            transition: 'all 0.2s',
          }}
        >
          END DAY
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ACTIONS.map(action => {
          const canAdd = action.slots <= remainingSlots;
          const queued = queueCounts[action.id] || 0;

          return (
            <div
              key={action.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: queued > 0 ? 'rgba(180,140,80,0.08)' : 'transparent',
                transition: 'background-color 0.2s',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#c8bfa0', marginBottom: '3px' }}>
                  {action.label}
                  <span style={{ opacity: 0.5, marginLeft: '6px', fontSize: '10px' }}>
                    [{action.slots} slot{action.slots > 1 ? 's' : ''}]
                  </span>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.5 }}>{action.desc}</div>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {queued > 0 && (
                  <button
                    onClick={() => onDequeueAction(action.id)}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#b48c50',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    -
                  </button>
                )}
                {queued > 0 && (
                  <span style={{ fontSize: '11px', color: '#b48c50', minWidth: '12px', textAlign: 'center' }}>
                    {queued}
                  </span>
                )}
                <button
                  onClick={() => canAdd && onQueueAction(action.id)}
                  disabled={!canAdd}
                  style={{
                    background: 'none',
                    border: `1px solid ${canAdd ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    color: canAdd ? '#c8bfa0' : 'rgba(255,255,255,0.2)',
                    width: '24px',
                    height: '24px',
                    cursor: canAdd ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/survival/DayPanel.js && git commit -m "feat(survival): add day panel with action queue" && git push
```

---

### Task 15: Create app/survival/EventLog.js

**Files:**
- Create: `app/survival/EventLog.js`

- [ ] **Step 1: Create the file**

```jsx
// app/survival/EventLog.js
'use client';
import { useEffect, useRef } from 'react';

export default function EventLog({ log }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      fontFamily: "'SF Mono', Monaco, monospace",
      fontSize: '12px',
      lineHeight: '1.8',
      color: '#a09880',
    }}>
      {log.length === 0 && (
        <div style={{ opacity: 0.4, fontStyle: 'italic' }}>The log is empty. Begin your first day.</div>
      )}
      {log.map((line, i) => (
        <div
          key={i}
          style={{
            color: line.startsWith('Day ') ? '#d4c5a0' : line === '---' ? 'rgba(255,255,255,0.1)' : '#a09880',
            borderTop: line === '---' ? '1px solid rgba(255,255,255,0.06)' : 'none',
            paddingTop: line === '---' ? '10px' : '0',
            marginTop: line === '---' ? '10px' : '0',
            marginBottom: line.startsWith('Day ') ? '4px' : '0',
            fontWeight: line.startsWith('Day ') ? 'bold' : 'normal',
          }}
        >
          {line !== '---' && line}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/survival/EventLog.js && git commit -m "feat(survival): add event log component" && git push
```

---

### Task 16: Create app/survival/SurvivalGame.js

**Files:**
- Create: `app/survival/SurvivalGame.js`

- [ ] **Step 1: Create the file**

```jsx
// app/survival/SurvivalGame.js
'use client';
import { useState } from 'react';
import ResourcePanel from './ResourcePanel';
import DayPanel from './DayPanel';
import EventLog from './EventLog';
import { queueAction, dequeueAction, resolveDay } from './gameActions';
import { saveSurvivalState, clearSurvivalSave } from './saveSystem';
import { INITIAL_SURVIVAL_STATE } from './constants';

export default function SurvivalGame({ initialState }) {
  const [state, setState] = useState(initialState || INITIAL_SURVIVAL_STATE);

  const handleQueueAction = (actionId) => {
    setState(prev => queueAction(prev, actionId));
  };

  const handleDequeueAction = (actionId) => {
    setState(prev => dequeueAction(prev, actionId));
  };

  const handleEndDay = () => {
    const { newState } = resolveDay(state);
    saveSurvivalState(newState);
    setState(newState);
  };

  const handleRestart = () => {
    clearSurvivalSave();
    const fresh = { ...INITIAL_SURVIVAL_STATE, introSeen: true };
    saveSurvivalState(fresh);
    setState(fresh);
  };

  if (state.isDead) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'SF Mono', Monaco, monospace",
      }}>
        <div style={{ textAlign: 'center', maxWidth: '360px', padding: '40px' }}>
          <div style={{ fontSize: '14px', color: '#cc4444', marginBottom: '24px', letterSpacing: '2px' }}>
            YOU DIDN&apos;T MAKE IT
          </div>
          <div style={{ fontSize: '12px', color: '#8a8070', marginBottom: '32px', lineHeight: '1.8' }}>
            You survived {state.day - 1} day{state.day - 1 !== 1 ? 's' : ''}.
            <br />
            {state.daysWithoutFood >= 2 ? 'Starvation.' : 'Dehydration.'}
          </div>
          <button
            onClick={handleRestart}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#c8bfa0',
              padding: '10px 24px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '12px',
              letterSpacing: '1px',
            }}
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '680px',
      margin: '0 auto',
    }}>
      <ResourcePanel state={state} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <EventLog log={state.actionLog} />
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <DayPanel
          state={state}
          onQueueAction={handleQueueAction}
          onDequeueAction={handleDequeueAction}
          onEndDay={handleEndDay}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/survival/SurvivalGame.js && git commit -m "feat(survival): add SurvivalGame shell with day resolution" && git push
```

---

### Task 17: Create app/survival/page.js

**Files:**
- Create: `app/survival/page.js`

- [ ] **Step 1: Create the file**

```jsx
// app/survival/page.js
'use client';
import { useState, useEffect } from 'react';
import SurvivalGame from './SurvivalGame';
import NarrativeIntro from './NarrativeIntro';
import { loadSurvivalState, saveSurvivalState } from './saveSystem';
import { INITIAL_SURVIVAL_STATE } from './constants';

export default function SurvivalPage() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = loadSurvivalState();
    if (saved) {
      setGameState(saved);
    } else {
      const fresh = { ...INITIAL_SURVIVAL_STATE };
      setGameState(fresh);
    }
    setLoading(false);
  }, []);

  const handleIntroComplete = () => {
    setGameState(prev => {
      const next = { ...prev, introSeen: true };
      saveSurvivalState(next);
      return next;
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'SF Mono', Monaco, monospace",
        color: '#6a6050',
        fontSize: '12px',
      }}>
        loading...
      </div>
    );
  }

  if (!gameState?.introSeen) {
    return <NarrativeIntro onDismiss={handleIntroComplete} />;
  }

  return <SurvivalGame initialState={gameState} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/survival/page.js && git commit -m "feat(survival): add survival page entry point" && git push
```

---

### Task 18: Create app/survival/CLAUDE.md

**Files:**
- Create: `app/survival/CLAUDE.md`

- [ ] **Step 1: Create the file**

```markdown
# CLAUDE.md — Survival Module

**Route:** `/survival`
**Stack:** Next.js 15, React 19, localStorage save
**Independence:** No imports from `app/game/`. Fully standalone.

---

## Game Loop

Each day:
1. Player queues actions via DayPanel (up to `DAY_CONFIG.baseActionSlots` slots)
2. Player clicks "End Day"
3. `resolveDay()` in `gameActions.js` runs:
   - Applies queued actions (resources gained, flags set)
   - Fires one random world event from `EVENTS`
   - Applies daily resource drain (`RESOURCE_DRAIN`)
   - Checks death conditions (2 consecutive days at 0 food OR water)
   - Advances `state.day`, clears `chosenActions`, appends to `actionLog`
4. State saved to localStorage via `saveSurvivalState()`
5. If `isDead`, SurvivalGame renders death screen

---

## Save State Schema

```js
{
  day: number,              // Current day (starts at 1)
  food: number,             // Food units remaining
  water: number,            // Water units remaining
  firewood: number,         // Firewood units remaining
  shelter: number,          // Shelter integrity 0-100
  daysWithoutFood: number,  // Consecutive days at 0 food
  daysWithoutWater: number, // Consecutive days at 0 water
  actionLog: string[],      // Full narrative history
  chosenActions: string[],  // Action IDs queued for current day
  bonusActionSlotNextDay: boolean,
  bonusActionSlotToday: boolean,
  isDead: boolean,
  introSeen: boolean,
}
```

localStorage key: `officeHorror_survival`

---

## How to Add a New Resource

1. Add to `INITIAL_SURVIVAL_STATE` in `constants.js` with a default value
2. Add to `RESOURCE_DRAIN` if it drains per day
3. Add a display row in `ResourcePanel.js`
4. Update `applyEffect()` in `gameActions.js` to handle the new key

---

## How to Add a New Action

In `constants.js`, add an entry to the `ACTIONS` array:

```js
{
  id: 'unique_id',
  label: 'Display Name',
  slots: 1,                 // how many action slots it costs
  desc: 'Flavor text.',
  resolve: (state) => ({    // return an object with resource deltas
    food: 2,
    water: -1,
  }),
}
```

`resolve()` receives current state and returns a partial state delta. Supported keys: `food`, `water`, `firewood`, `shelter`, `bonusActionSlot` (boolean), `huntFailed` (boolean), `triggerExploreEvent` (boolean).

---

## How to Add a New Random Event

In `constants.js`, add to `EVENTS` or `EXPLORE_EVENTS`:

```js
{ id: 'event_id', narrative: 'Text shown in the log.', effect: { water: 1 } }
```

`effect` supports the same keys as `resolve()` minus flags.

---

## How to Add a New System Module

Create a new file (e.g. `WeatherSystem.js`). Export a function that takes state and returns modified state. Import and call it inside `resolveDay()` in `gameActions.js` at the appropriate step. No existing files need structural changes.

Example integration point in `resolveDay()`:

```js
// After step 2 (world event), before step 3 (drain):
import { applyWeather } from './WeatherSystem';
s = applyWeather(s, narrativeLines);
```

---

## Pixel Art Assets

Stored in `public/survival/sprites/`. Animated via CSS `steps()`:

```css
.sprite {
  background-image: url('/survival/sprites/campfire.png');
  width: 32px;
  height: 32px;
  animation: sprite-play 0.6s steps(4) infinite;
}
@keyframes sprite-play {
  from { background-position: 0 0; }
  to { background-position: -128px 0; }
}
```

Generate assets using Nano Banana Pro:
- **Sprite Sheet for 2D NES Platformer** prompt → character/creature sprites
- **Pixel Art Animal Grid for APNG** prompt → animated grid frames (convert to sprite sheet)
- **NES BG Dot Art Conversion** prompt → background scenes (provide reference image)
```

- [ ] **Step 2: Commit**

```bash
git add app/survival/CLAUDE.md && git commit -m "docs(survival): add CLAUDE.md module reference" && git push
```

---

### Task 19: Final build verification and browser test

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: 0 errors.

- [ ] **Step 2: Run dev and test the survival game**

```bash
npm run dev
```

Navigate to `http://localhost:3000/survival`:

- [ ] NarrativeIntro screen shows with Day 1 text
- [ ] Clicking dismisses intro and shows game
- [ ] ResourcePanel shows Food 3, Water 3, Firewood 2, Shelter 10
- [ ] All 7 actions are listed with slot costs
- [ ] Clicking + on Forage adds it to queue, slot counter increments
- [ ] Clicking - removes it
- [ ] Hunt correctly costs 2 slots
- [ ] END DAY button is disabled with 0 slots used
- [ ] END DAY with queued actions resolves — resources change, narrative appears in log
- [ ] State persists after page refresh
- [ ] Starving to death (manually set food=0 and end 2 days) shows death screen with correct message
- [ ] TRY AGAIN resets state and returns to game

- [ ] **Step 3: Test transition from /game**

In the game at `/game`, use the debug panel to grant yourself singularity_collapse + 5M PP + required materials. Verify:
- [ ] Tear the Veil appears in dimensional upgrades
- [ ] Purchase triggers cinematic overlay
- [ ] `/survival` loads correctly after transition

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "feat: complete survival mode — cleanup, tear the veil, /survival game" && git push
```
```
