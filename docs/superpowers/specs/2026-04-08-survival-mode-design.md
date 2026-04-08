# Office Horror — Survival Mode Design Spec

**Date:** 2026-04-08
**Scope:** Journal revamp, armory removal, end-game breakthrough mechanic, `/survival` second game mode

---

## Overview

Three interconnected changes to the Office Horror game at `/game`, plus a brand new second game mode at `/survival`:

1. Remove the Armory system and all weapon/armor/loot code
2. Revamp the Journal (2 functional tabs replacing 3 broken ones)
3. Add a late-game "Tear the Veil" purchase that breaks through into survival mode
4. Build `/survival` — a light, earth-based, text-driven survival game with time/resource management

---

## Section 1 — Office Game Cleanup

### Armory Removal

Delete the following files entirely:
- `app/game/Armory.js`
- `app/game/equipmentConstants.js`
- `app/game/lootConstants.js`
- `app/game/lootGenerationHelpers.js`

Remove all imports and references to these files from:
- `app/game/gameActions.js`
- `app/game/DimensionalArea.js`
- `app/game/constants.js`
- `app/game/page.js`
- `app/game/journalHelpers.js`

The Armory journal entry lore text in `JOURNAL_ENTRIES.locations.armory` can remain as atmospheric flavour — the location nav entry is removed.

### Journal Revamp

**Before:** 3 tabs — Locations, Colleagues, Equipment
- Colleagues: helper functions defined in `journalHelpers.js` but never called anywhere — dead code
- Equipment: only tracked armory loot — removed with armory

**After:** 2 tabs — Locations + Mechanics

**Locations tab:** Unchanged. Already works correctly via `discoverLocation` in `gameActions.js`.

**Mechanics tab:** Uses existing `MECHANICS_ENTRIES` from `constants.js`. Mechanics entries are unlocked when the player dismisses help popups. This was already partially implemented but the tab was never surfaced.

**Removed from state and helpers:**
- `discoveredColleagues`
- `discoveredBaseWeapons`
- `discoveredBaseArmor`
- `discoveredBaseAnomalies`
- `discoverColleague()`
- `discoverEquipmentFromLoot()`
- `discoverEquipmentById()`
- `isEquipmentDiscovered()`
- `getDiscoveryCounts()` equipment fields

Default `journalTab` state value `'locations'` is unchanged. Remove the `'colleagues'` and `'equipment'` tab rendering branches from `JournalModal.js`.

---

## Section 2 — The Breakthrough Mechanic

### "Tear the Veil" Purchase

A new entry in the Dimensional Upgrades panel. Only visible after `singularity_collapse` has been crafted (the existing win condition).

**Cost:**
- 5,000,000 PP
- 10x Void Fragment
- 5x Static Crystal
- 3x Glitch Shard
- 2x Reality Dust
- 1x Temporal Core
- 1x Dimensional Essence
- 1x Singularity Node

**On purchase — cinematic transition:**
1. Full-screen overlay fades in over the office game (dark → black)
2. Text appears, horror tone dissolving:
   > *"The fluorescent lights flicker.*
   > *Then go out.*
   > *For the first time in years, you feel wind.*
   > *You don't look back."*
3. After ~3 seconds, `router.push('/survival')`

**Office save:** Preserved in localStorage under its own key (`officeHorror_save`). Not wiped. The player cannot navigate back — the survival page has no link to `/game`.

---

## Section 3 — Survival Game (`/survival`)

### Architecture

Fully independent Next.js page. No imports from `app/game/`. Own save key, own constants, own game loop.

```
app/survival/
  page.js              # Entry point, loads save or shows intro
  SurvivalGame.js      # Core game shell, renders all panels
  DayPanel.js          # Action slot allocation UI
  ResourcePanel.js     # Food, water, shelter, firewood display
  EventLog.js          # Scrolling text narrative output
  NarrativeIntro.js    # First-run intro screen (Day 1 flavour)
  constants.js         # Resources, actions, day config, events
  gameActions.js       # Action resolvers (forage, hunt, build, rest, explore)
  saveSystem.js        # Load/save to localStorage (key: officeHorror_survival)
  CLAUDE.md            # Survival module agent reference doc
```

### Core Loop

Each day the player has **4 action slots** (expandable later). They choose from available actions, then click **"End Day"**.

**Day resolution order:**
1. Apply chosen actions (resources added/built)
2. Fire one random event (can modify resources, add narrative)
3. Apply daily consumption (food -1, water -1, firewood -1 if cold)
4. Check death conditions
5. Increment day counter, log narrative line, save state

**Death conditions:**
- Food = 0 for 2 consecutive days
- Water = 0 for 2 consecutive days

On death: show a "You didn't make it" screen with days survived, then offer restart (wipes survival save, keeps office save).

### Resources

| Resource | Description | Starting Value |
|---|---|---|
| Food | Consumed 1/day. Gained by Forage/Hunt | 3 |
| Water | Consumed 1/day. Gained by Collect Water | 3 |
| Firewood | Consumed 1/day (cold nights). Gained by Gather Wood | 2 |
| Shelter | 0–100 integrity. Decays slowly. Gained by Build | 10 |
| Days Survived | Counter. Never decreases | 0 |

### Actions

| Action | Slots | Effect |
|---|---|---|
| Forage | 1 | +1–3 Food (randomised) |
| Collect Water | 1 | +2–4 Water |
| Gather Wood | 1 | +2–3 Firewood |
| Build Shelter | 1 | +5–10 Shelter integrity |
| Rest | 1 | Reduces next-day action cost for one action |
| Hunt | 2 | +3–6 Food, chance of failure |
| Explore | 1 | Triggers a discovery event (higher variance) |

### Narrative Intro (first run only)

Shown before the first day:

> *"Day 1.*
> *You don't know how long you were in there.*
> *The sun is real. The air is cold.*
> *You have nothing.*
> *Survive."*

Dismissed on click → game begins.

### Pixel Art Assets

Generated via Nano Banana Pro using the **Sprite Sheet for 2D NES Platformer** and **Pixel Art Animal Grid for APNG** prompts. Assets stored in `public/survival/sprites/`.

Animation via CSS `steps()` on sprite sheet images — no canvas required for basic animations. Each scene (forest, campfire, shelter) has a looping ambient sprite.

Recommended Nano Banana Pro prompts to generate:
- Forest scene background (use NES BG Dot Art Conversion with a forest reference image)
- Campfire sprite sheet (Pixel Art Animal Grid for APNG prompt, adapted)
- Shelter/cabin sprite (NES Platformer Sprite Sheet prompt)
- Resource icons: food, water, wood, shelter (custom prompt based on Pixel Art Animal Grid)

### Modularity Contract

`constants.js` is structured in named sections with clear extension points:

```js
// === RESOURCES === (add new resources here)
// === ACTIONS === (add new actions here)
// === EVENTS === (add new random events here)
// === DAY_CONFIG === (tweak day structure here)
```

Each future system is a new file:
- `WeatherSystem.js` — seasonal weather affecting resource drain
- `CraftingPanel.js` — combine resources into tools
- `NPCSystem.js` — encounter other survivors
- `AnimalSystem.js` — wildlife that affects hunt outcomes

No existing file needs modification to add a new system — new systems register themselves via a plugin pattern described in `CLAUDE.md`.

### `CLAUDE.md` Contents (survival module)

The file documents:
- Game loop overview (day structure, resolution order)
- Resource table and drain rates
- Action table and slot costs
- How to add a new resource
- How to add a new action
- How to add a new random event
- How to add a new system module
- Save state schema
- Pixel art asset locations and animation convention

---

## Implementation Notes

- `app/game/combatConstants.js` is a legacy dead file from a removed combat system — safe to delete during the cleanup pass
- The office game's existing prestige/dimensional systems are untouched beyond Tear the Veil addition and armory removal
- The `/survival` route should be excluded from the main site nav (not a portfolio page — accessed only via the breakthrough transition)
- Office save key: `officeHorror_save` (existing, unchanged)
- Survival save key: `officeHorror_survival` (new)
