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
- **Sprite Sheet for 2D NES Platformer** prompt — character/creature sprites
- **Pixel Art Animal Grid for APNG** prompt — animated grid frames (convert to sprite sheet)
- **NES BG Dot Art Conversion** prompt — background scenes (provide reference image)
