# Zayaani Idle Game — Design Spec
_Date: 2026-03-31_

## Overview

A single-page idle game at the unlisted route `/zayaani`. Built as a Next.js page using modular React components. The experience centres on ASCII art character customisation and room decoration, with passive credit accumulation and a job offer system that increases income over time. Matches the existing sarlakweb dark theme (orange accent, monospace font, `#0c0a09` background).

The page is not linked from the nav or home page — accessible only by direct URL.

---

## Architecture

```
app/zayaani/
  page.js                ← thin server shell, no Header/Footer
  ZayaaniGame.js         ← top-level 'use client' component, owns all state
  CharacterCreator.js    ← full-screen creation flow (phase: 'creation')
  ZayaaniRoom.js         ← ASCII room renderer + idle animation
  ShopPanel.js           ← left sidebar: credits, active jobs, furniture shop
  JobNotification.js     ← toast overlay for incoming job offers
  useGameState.js        ← custom hook: useReducer + game loop + save/load
  asciiAssets.js         ← all ASCII art definitions (compact + detailed)
```

### Component responsibilities

- **`ZayaaniGame`** — reads phase from state, renders either `CharacterCreator` or the game layout (room + sidebar). Owns nothing except the state hook.
- **`CharacterCreator`** — stateless display component. Receives asset lists and current selections, fires callbacks on selection change and confirm.
- **`ZayaaniRoom`** — receives character and owned furniture, renders the ASCII room string with furniture injected at fixed slots, runs the idle animation loop.
- **`ShopPanel`** — receives credits, creditsPerSecond, activeJobs, ownedFurniture, furniture catalogue. Fires purchase and no other side effects.
- **`JobNotification`** — receives a single `pendingJobOffer` object. Renders a toast with accept/decline. Auto-dismisses after 15s via internal timer.
- **`useGameState`** — all game logic lives here. Returns state + dispatch. Never touches the DOM.
- **`asciiAssets`** — pure data, no logic. Exportable arrays of asset objects.

---

## State shape

Managed via `useReducer` inside `useGameState`:

```js
{
  phase: 'creation' | 'game',
  character: {
    headId: string,
    topId: string,
    pantsId: string,
    shoesId: string,
  },
  credits: number,
  creditsPerSecond: number,      // starts at 1, increases with each accepted job
  ownedFurniture: string[],      // array of furniture item IDs
  activeJobs: [{ id, name, cps }],
  pendingJobOffer: Job | null,   // single offer at a time
  stats: {
    totalEarned: number,
    sessionStart: number,        // Date.now() on load
  },
}
```

### Actions

`CONFIRM_CHARACTER`, `PURCHASE_FURNITURE`, `ACCEPT_JOB`, `DECLINE_JOB`, `SET_PENDING_JOB`, `TICK` (fires every second), `LOAD_SAVE`.

---

## Game loop

Three intervals run in a `useEffect` that cleans up on unmount:

1. **Credit tick** — every 1000ms, dispatches `TICK` which adds `creditsPerSecond` to `credits`.
2. **Job offer** — fires on a random interval between 90–180s. Picks a random job the player doesn't already have. If `pendingJobOffer` is already set, skips. Dispatches `SET_PENDING_JOB`.
3. **Auto-save** — every 5 minutes, writes state to `localStorage`.

A `beforeunload` listener (registered in the same `useEffect`) triggers an immediate save when the tab closes.

---

## Character creator

Full-screen overlay. Layout: two columns + a footer strip.

**Left column — selector panels (one per body part)**
Each panel shows all options for that part as compact ASCII thumbnails in a vertical list. Each option displays:
- The compact ASCII art in a bordered box
- Name (e.g., `Emo Boy`)
- Trait tags (e.g., `swept bang · lip ring`)

Clicking an option selects it and updates the right column.

**Right column — detail view**
Shows the currently selected option's `detailed` (4× density) ASCII art at normal font size. Below it: the full name and a one-line description of distinguishing features.

**Footer — full-body preview**
Compact art for all 4 layers stacked vertically, updating in real time as selections change. A `Confirm` button locks the character and transitions to `phase: 'game'`. Once confirmed, character cannot be changed.

---

## ASCII art system (`asciiAssets.js`)

Each asset entry:

```js
{
  id: 'head_emo',
  name: 'Emo Boy',
  traits: ['swept bang', 'lip ring', 'dead stare'],
  compact: `  ////////////\n  [==========]\n  |/////  [O]|\n  | /   ~    |\n  |     .    |\n  | [_*___]  |\n  [==========]`,
  detailed: `...multi-line dense version...`,
}
```

**Body parts and options:**

| Part | ID | Name | Distinguishing traits |
|---|---|---|---|
| Head | `head_emo` | Emo Boy | swept bang, lip ring |
| Head | `head_punk` | Punk Girl | twin mohawk spikes, nose stud |
| Head | `head_skater` | Skater Dude | double-brim beanie, half-lidded |
| Head | `head_scene` | Scene Queen | backcombed poof, star eyes |
| Top | `top_hoodie` | Oversized Hoodie | kangaroo pocket, drawcord |
| Top | `top_tee` | Plain Tee | simple crew neck |
| Top | `top_zip` | Zip-Up | vertical zipper line |
| Pants | `pants_jeans` | Baggy Jeans | pocket circles, wide leg |
| Pants | `pants_cargo` | Cargo Pants | side cargo pockets |
| Pants | `pants_shorts` | Shorts | half-height legs |
| Shoes | `shoes_chunky` | Chunky Sneakers | /\/\ lace pattern |
| Shoes | `shoes_boots` | Boots | solid block sole |
| Shoes | `shoes_bare` | Bare Feet | \_/\_/ toe shape |

Each entry has both `compact` (used in room + thumbnail) and `detailed` (used in creator zoom panel) ASCII strings.

---

## ASCII room

A fixed multi-line string representing a 3D perspective room (two visible walls + floor, drawn with box-drawing or slash/backslash characters). Six named furniture slots are defined as line/column offsets into the room string. When a piece of furniture is owned, its ASCII art is composited into the room at that slot's position.

**Furniture catalogue:**

| ID | Name | Cost | Slot |
|---|---|---|---|
| `desk` | Desk | 200cr | back-left |
| `lamp` | Floor Lamp | 80cr | back-right corner |
| `plant` | Potted Plant | 60cr | front-right |
| `rug` | Rug | 150cr | floor centre |
| `poster` | Poster | 40cr | back wall |
| `bookshelf` | Bookshelf | 300cr | back-right |

The character is always rendered at the centre-front position. Idle animation cycles two frames (subtle sway) on a 1200ms interval — only runs during `phase: 'game'`.

---

## Job system

Pool of 8 jobs. Each job can only be active once. A random interval (90–180s) triggers an offer for a job not yet owned. The toast shows the job name, flavour text, and cr/s increase. Accept adds to `activeJobs` and increases `creditsPerSecond`. Decline dismisses. Auto-dismisses after 15s with no action (treated as decline).

| ID | Name | cr/s bonus | Flavour |
|---|---|---|---|
| `youtube` | YouTube Channel | +2 | "Upload one video. Monetise forever." |
| `twitch` | Twitch Stream | +3 | "Just vibe on camera." |
| `etsy` | Etsy Shop | +1 | "Sell the things you made at 2am." |
| `freelance` | Freelance Dev | +5 | "Fix their WordPress. Again." |
| `dogwalk` | Dog Walking App | +1 | "Dogs don't care about deadlines." |
| `newsletter` | Crypto Newsletter | +2 | "Write four sentences. Profit." |
| `dropship` | Dropshipping Store | +2 | "You don't even touch the product." |
| `podcast` | Podcast | +1 | "Just two guys talking." |

---

## Persistence

`useGameState` serialises the full state object to `localStorage` under the key `zayaani_save` on every auto-save trigger and on window `beforeunload`. On mount, attempts to load and parse the saved JSON. If parsing fails or the save is missing, starts fresh with no error shown to the user. Fields added in future versions are merged safely with defaults.

---

## Visual design

- Inherits `--bg-color`, `--accent-color`, `--font-mono`, `--border-color` from `globals.css`
- ASCII art rendered in `<pre>` tags using `font-family: var(--font-mono)` with `white-space: pre`
- No Header or Footer — full-screen game layout
- Room panel takes remaining viewport height after sidebar
- Responsive: on mobile, sidebar collapses to a bottom sheet toggled by a button

---

## Out of scope

- Changing character after creation
- Draggable furniture placement (auto-place only)
- Nav link or home page listing
- Multiplayer or server-side state
