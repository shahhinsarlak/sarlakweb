# Zayaani Idle Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-screen ASCII idle game at the unlisted `/zayaani` route — character creator, 3D ASCII room, passive credits, furniture shop, and job offer system — integrated into the existing sarlakweb Next.js 15 project.

**Architecture:** Eight focused files in `app/zayaani/`. All state lives in a `useReducer` hook (`useGameState.js`). ASCII art data is plain objects in `asciiAssets.js` — each asset has a `compact` string (used in-game) and a `detailed` string (used in the creator zoom panel). Components are stateless display layers that fire dispatchers.

**Tech Stack:** Next.js 15, React 19, JavaScript ES6+, CSS Modules, localStorage

---

## File Map

| File | Role |
|---|---|
| `app/zayaani/page.js` | Thin server shell, no Header/Footer |
| `app/zayaani/ZayaaniGame.js` | Top-level `use client` orchestrator |
| `app/zayaani/CharacterCreator.js` | Full-screen creation flow |
| `app/zayaani/ZayaaniRoom.js` | ASCII room + idle animation + furniture overlays |
| `app/zayaani/ShopPanel.js` | Left sidebar — credits, active jobs, furniture shop |
| `app/zayaani/JobNotification.js` | Job offer toast |
| `app/zayaani/useGameState.js` | Reducer, game loop (tick/job/save), localStorage |
| `app/zayaani/asciiAssets.js` | All ASCII art + FURNITURE + JOBS catalogues |
| `app/zayaani/zayaani.module.css` | Scoped styles |

---

### Task 1: ASCII Assets

**Files:**
- Create: `app/zayaani/asciiAssets.js`

Pure data — no imports, no logic. Every component reads from here. Do this first so subsequent tasks have real content to render.

- [ ] **Step 1: Create `app/zayaani/asciiAssets.js` with HEADS**

```js
// app/zayaani/asciiAssets.js

export const HEADS = [
  {
    id: 'head_emo',
    name: 'Emo Boy',
    traits: ['swept bang', 'lip ring', 'dead stare'],
    compact:
`  ////////////
  [==========]
  |/////  [O]|
  | /   ~    |
  |     .    |
  | [_*___]  |
  [==========]`,
    detailed:
`          //////////////////  ///
         ////////////////////  ///
        ///////////////////  /////
       //[==============================]
      ///|//////////////////////////     |
     ////|/////  ////////////////        |
    /////|////   //////////////   [( )]  |
   //////|///    ////////////     [~-~]  |
   //////|//     //////////              |
         |/      ////////    .   .       |
         |        //////      . .        |
         |         ////        .         |
         |          //                   |
         |           /    [ _ * _ _ _ ]  |
         |               [_ _ * _ _ _ _] |
         [==============================]`,
  },
  {
    id: 'head_punk',
    name: 'Punk Girl',
    traits: ['twin mohawk spikes', 'nose stud', 'intense glare'],
    compact:
`    | |  | |
   [|||||||||]
  [==========]
  |[>]    [<]|
  | ^      ^ |
  |    *.*   |
  |   [===]  |
  [==========]`,
    detailed:
`          | /\\  /\\ |
         |/  \\/  \\|
        [|||||||||||||]
       [===============]
       | [>>]     [<<] |
       |   ^^      ^^  |
       |     * . *     |
       |     *.*.*     |
       |    [=======]  |
       [===============]`,
  },
  {
    id: 'head_skater',
    name: 'Skater Dude',
    traits: ['double-brim beanie', 'half-lidded', 'nothing fazes him'],
    compact:
`  [##########]
  [==========]
  |[-]    [-]|
  | ~      ~ |
  |     .    |
  |   [___]  |
  [==========]`,
    detailed:
`  [##############]
  [##############]
  [==============]
  | [-]      [-] |
  |  ~        ~  |
  |       .      |
  |   [_______]  |
  [==============]`,
  },
  {
    id: 'head_scene',
    name: 'Scene Queen',
    traits: ['backcombed poof', 'star eyes', 'raccoon liner'],
    compact:
`((((((((((((((((
(( [==========]
   [==========]
   |[*]    [*]|
   | ^      ^ |
   |     .    |
   |  [o___o] |
   [==========]`,
    detailed:
`(((((((((((((((((((((
((((((((((((((((((((((
 ((( [===============] (((
     [===============]
     | [**]     [**] |
     |   ^       ^   |
     |       .       |
     |   [o_____o]   |
     [===============]`,
  },
];
```

- [ ] **Step 2: Add TOPS**

```js
export const TOPS = [
  {
    id: 'top_hoodie',
    name: 'Oversized Hoodie',
    traits: ['kangaroo pocket', 'drawcord', 'drop shoulder'],
    compact:
` [============]
 |\\ [======] /|
 | \\[HOOD   ]/ |
 |  [======]  |
 |            |
 |  [======]  |
 |  [POCKET]  |
 |  [======]  |
 [============]`,
    detailed:
`  [==================]
  |\\                /|
  | \\   [HOODIE]   / |
  |  [============]  |
  |  |            |  |
  |  |            |  |
  |  [============]  |
  |                  |
  |   [==========]   |
  |   [  POCKET  ]   |
  |   [==========]   |
  [==================]`,
  },
  {
    id: 'top_tee',
    name: 'Plain Tee',
    traits: ['crew neck', 'oversized fit', 'wrinkled hem'],
    compact:
`  [==========]
  |   [====]  |
  |   [    ]  |
  |           |
  |           |
  |  ~~~~~~~~ |
  [==========]`,
    detailed:
`    [==============]
    |    [======]   |
    |    [      ]   |
    |               |
    |               |
    |               |
    |   ~~~~~~~~~~  |
    [==============]`,
  },
  {
    id: 'top_zip',
    name: 'Zip-Up',
    traits: ['center zipper', 'ribbed collar', 'side seam pockets'],
    compact:
`  [==========]
  |  [||||||] |
  |  |      | |
  |  |      | |
  |  [||||||] |
  [==========]`,
    detailed:
`    [==============]
    |  [==========] |
    |  | zipper   | |
    |  | |||||||| | |
    |  | |||||||| | |
    |  | |||||||| | |
    |  [==========] |
    [==============]`,
  },
];
```

- [ ] **Step 3: Add PANTS**

```js
export const PANTS = [
  {
    id: 'pants_jeans',
    name: 'Baggy Jeans',
    traits: ['wide leg', 'coin pocket', 'raw hem'],
    compact:
`   [========]
   | (o)  (o)|
   |         |
  =|         |=
  =|         |=
 [====]  [====]
 |    |  |    |
 [====]  [====]`,
    detailed:
`     [============]
     |  (o)   (o)  |
     |              |
   ==|              |==
   ==|              |==
   --|              |--
  [======]      [======]
  |      |      |      |
  |      |      |      |
  [======]      [======]`,
  },
  {
    id: 'pants_cargo',
    name: 'Cargo Pants',
    traits: ['side cargo pockets', 'utility straps', 'tapered ankle'],
    compact:
`   [========]
   |         |
 [+|  [===]  |+]
 [+|  [CGO]  |+]
   |         |
 [====]  [====]
 |    |  |    |
 [====]  [====]`,
    detailed:
`     [============]
     |              |
 [+++|   [======]   |+++]
 [+++|   [CARGO ]   |+++]
 [+++|   [======]   |+++]
     |              |
  [======]      [======]
  |      |      |      |
  [======]      [======]`,
  },
  {
    id: 'pants_shorts',
    name: 'Shorts',
    traits: ['frayed hem', 'high waist', 'wide cut'],
    compact:
`   [========]
   | (o)  (o)|
   |         |
  =|         |=
   [====][====]`,
    detailed:
`     [============]
     |  (o)   (o)  |
     |              |
   ==|              |==
   --|              |--
   [======][=======]`,
  },
];
```

- [ ] **Step 4: Add SHOES**

```js
export const SHOES = [
  {
    id: 'shoes_chunky',
    name: 'Chunky Sneakers',
    traits: ['/\\/\\ lace pattern', 'platform sole', 'oversized toe'],
    compact:
` [=====] [=====]
 |/\\/\\/| |/\\/\\/|
 [_____] [_____]`,
    detailed:
`  [=========] [=========]
  | /\\/\\/\\/\\ | | /\\/\\/\\/\\ |
  |           | |           |
  [===========] [===========]
  [___________] [___________]`,
  },
  {
    id: 'shoes_boots',
    name: 'Boots',
    traits: ['block heel', 'lace-up shaft', 'square toe'],
    compact:
` [=====] [=====]
 |#####| |#####|
 [#####] [#####]
 [_____] [_____]`,
    detailed:
`  [=========] [=========]
  | |#######| | | |#######| |
  | |#######| | | |#######| |
  | |#######| | | |#######| |
  [===========] [===========]
  [___________] [___________]`,
  },
  {
    id: 'shoes_bare',
    name: 'Bare Feet',
    traits: ['toe spread', 'relaxed stance', 'grounded'],
    compact:
` \\___/   \\___/
  \\-/     \\-/`,
    detailed:
`  \\_______/ \\_______/
   \\  toes /   \\  toes /
    \\_____/     \\_____/`,
  },
];
```

- [ ] **Step 5: Add FURNITURE and JOBS**

```js
export const FURNITURE = [
  { id: 'desk',      name: 'Desk',         cost: 200, slot: 'back_left',    ascii: '[___DESK___]' },
  { id: 'lamp',      name: 'Floor Lamp',   cost: 80,  slot: 'back_right',   ascii: '  (\\ /)\n   |||' },
  { id: 'plant',     name: 'Potted Plant', cost: 60,  slot: 'front_right',  ascii: ' @@@\n |||' },
  { id: 'rug',       name: 'Rug',          cost: 150, slot: 'floor_centre', ascii: '[~~~~~~~~~]' },
  { id: 'poster',    name: 'Poster',       cost: 40,  slot: 'back_wall',    ascii: '[POSTER]' },
  { id: 'bookshelf', name: 'Bookshelf',    cost: 300, slot: 'back_right',   ascii: '[|||||||||]' },
];

export const JOBS = [
  { id: 'youtube',    name: 'YouTube Channel',   cps: 2, flavour: 'Upload one video. Monetise forever.' },
  { id: 'twitch',     name: 'Twitch Stream',      cps: 3, flavour: 'Just vibe on camera.' },
  { id: 'etsy',       name: 'Etsy Shop',          cps: 1, flavour: 'Sell the things you made at 2am.' },
  { id: 'freelance',  name: 'Freelance Dev',      cps: 5, flavour: 'Fix their WordPress. Again.' },
  { id: 'dogwalk',    name: 'Dog Walking App',    cps: 1, flavour: 'Dogs don\'t care about deadlines.' },
  { id: 'newsletter', name: 'Crypto Newsletter',  cps: 2, flavour: 'Write four sentences. Profit.' },
  { id: 'dropship',   name: 'Dropshipping Store', cps: 2, flavour: 'You don\'t even touch the product.' },
  { id: 'podcast',    name: 'Podcast',            cps: 1, flavour: 'Just two guys talking.' },
];
```

- [ ] **Step 6: Commit**

```bash
cd C:/Users/0blac/sarlakweb
git add app/zayaani/asciiAssets.js
git commit -m "feat(zayaani): add ASCII art assets, furniture, and jobs catalogues"
git push
```

---

### Task 2: CSS Module

**Files:**
- Create: `app/zayaani/zayaani.module.css`

- [ ] **Step 1: Create `app/zayaani/zayaani.module.css`**

```css
/* app/zayaani/zayaani.module.css */

/* ── Root & layout ───────────────────────────────────── */
.root {
  width: 100vw;
  height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  font-family: var(--font-mono);
  display: flex;
  overflow: hidden;
}

.gameLayout {
  display: flex;
  width: 100%;
  height: 100%;
}

/* ── Left sidebar ────────────────────────────────────── */
.sidebar {
  width: 220px;
  min-width: 220px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sideSection {
  border-bottom: 1px solid var(--border-color);
  padding: 14px;
}

.sideLabel {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--accent-color);
  margin-bottom: 10px;
}

/* ── Shop items ──────────────────────────────────────── */
.shopItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 6px;
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-mono);
  transition: var(--transition);
  background: transparent;
  color: var(--text-color);
  width: 100%;
  text-align: left;
}

.shopItem:hover:not(:disabled) {
  border-color: var(--accent-color);
  box-shadow: 0 0 8px var(--accent-glow);
}

.shopItem:disabled { opacity: 0.4; cursor: default; }
.shopItemCost { color: var(--accent-color); font-size: 11px; }

/* ── Active jobs ─────────────────────────────────────── */
.jobEntry {
  font-size: 11px;
  padding: 4px 0;
  display: flex;
  justify-content: space-between;
  color: #22c55e;
}

/* ── Room area ───────────────────────────────────────── */
.roomArea {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.creditsOverlay {
  position: absolute;
  top: 16px;
  left: 16px;
  font-size: 12px;
  color: var(--accent-color);
  border: 1px solid var(--border-color);
  background: var(--bg-elevated);
  padding: 5px 10px;
  z-index: 10;
}

/* ── ASCII shared ────────────────────────────────────── */
.ascii {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre;
  color: var(--text-color);
  margin: 0;
}

.asciiAccent { color: var(--accent-color); }

/* ── Job toast ───────────────────────────────────────── */
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  width: 280px;
  background: var(--bg-elevated);
  border: 1px solid var(--accent-color);
  box-shadow: 0 0 20px var(--accent-glow);
  padding: 16px;
  z-index: 200;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(320px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}

.toastTitle   { font-size: 13px; color: var(--accent-color); margin-bottom: 4px; }
.toastFlavour { font-size: 11px; color: var(--text-muted);   margin-bottom: 4px; }
.toastCps     { font-size: 11px; color: #22c55e;             margin-bottom: 12px; }
.toastActions { display: flex; gap: 8px; }

.toastBtn {
  flex: 1;
  padding: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-color);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: var(--transition);
}

.toastBtn:hover            { border-color: var(--accent-color); color: var(--accent-color); }
.toastBtnAccept:hover      { background: var(--accent-glow); }

/* ── Character creator ───────────────────────────────── */
.creatorRoot {
  width: 100vw;
  height: 100vh;
  background: var(--bg-color);
  font-family: var(--font-mono);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.creatorTitle {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: var(--accent-color);
  padding: 20px 24px 12px;
  border-bottom: 1px solid var(--border-color);
}

.creatorBody {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  overflow: hidden;
}

.creatorLeft {
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.creatorRight {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 10px;
  overflow: hidden;
}

.partLabel {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--accent-color);
  margin-bottom: 8px;
}

.partOptions { display: flex; flex-direction: column; gap: 6px; }

.partOption {
  border: 1px solid var(--border-color);
  padding: 8px 10px;
  cursor: pointer;
  transition: var(--transition);
  background: transparent;
  text-align: left;
  width: 100%;
  font-family: var(--font-mono);
}

.partOption:hover              { border-color: var(--accent-color); }
.partOptionSelected            { border-color: var(--accent-color); background: var(--bg-elevated); box-shadow: 0 0 8px var(--accent-glow); }
.partOptionName                { font-size: 12px; color: var(--text-color); margin-bottom: 2px; }
.partOptionTraits              { font-size: 10px; color: var(--text-muted); }

.detailName   { font-size: 14px; color: var(--accent-color); }
.detailTraits { font-size: 11px; color: var(--text-muted); text-align: center; }

.creatorFooter {
  border-top: 1px solid var(--border-color);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.confirmBtn {
  padding: 10px 32px;
  border: 1px solid var(--accent-color);
  background: transparent;
  color: var(--accent-color);
  font-family: var(--font-mono);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
  letter-spacing: 2px;
  text-transform: uppercase;
  white-space: nowrap;
}

.confirmBtn:hover { background: var(--accent-glow); box-shadow: 0 0 16px var(--accent-glow); }

/* ── Mobile ──────────────────────────────────────────── */
@media (max-width: 700px) {
  .sidebar    { display: none; }
  .creatorBody { grid-template-columns: 1fr; }
  .creatorRight { display: none; }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/zayaani/zayaani.module.css
git commit -m "feat(zayaani): add scoped CSS module"
git push
```

---

### Task 3: `useGameState` Hook

**Files:**
- Create: `app/zayaani/useGameState.js`

All game logic lives here. Components only call dispatchers.

- [ ] **Step 1: Create `app/zayaani/useGameState.js`**

```js
// app/zayaani/useGameState.js
'use client';
import { useReducer, useEffect, useRef } from 'react';
import { JOBS } from './asciiAssets';

const SAVE_KEY = 'zayaani_save';

const INITIAL_STATE = {
  phase: 'creation',
  character: { headId: 'head_emo', topId: 'top_hoodie', pantsId: 'pants_jeans', shoesId: 'shoes_chunky' },
  credits: 0,
  creditsPerSecond: 1,
  ownedFurniture: [],
  activeJobs: [],
  pendingJobOffer: null,
  stats: { totalEarned: 0, sessionStart: Date.now() },
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_SAVE':
      return {
        ...INITIAL_STATE,
        ...action.payload,
        stats: { ...INITIAL_STATE.stats, ...action.payload.stats, sessionStart: Date.now() },
      };

    case 'SET_CHARACTER_PART':
      return { ...state, character: { ...state.character, [action.part]: action.id } };

    case 'CONFIRM_CHARACTER':
      return { ...state, phase: 'game' };

    case 'TICK': {
      const gained = state.creditsPerSecond;
      return {
        ...state,
        credits: state.credits + gained,
        stats: { ...state.stats, totalEarned: state.stats.totalEarned + gained },
      };
    }

    case 'PURCHASE_FURNITURE': {
      const { item } = action;
      if (state.credits < item.cost || state.ownedFurniture.includes(item.id)) return state;
      return {
        ...state,
        credits: state.credits - item.cost,
        ownedFurniture: [...state.ownedFurniture, item.id],
      };
    }

    case 'SET_PENDING_JOB':
      return { ...state, pendingJobOffer: action.job };

    case 'ACCEPT_JOB': {
      const job = state.pendingJobOffer;
      if (!job) return state;
      return {
        ...state,
        pendingJobOffer: null,
        activeJobs: [...state.activeJobs, job],
        creditsPerSecond: state.creditsPerSecond + job.cps,
      };
    }

    case 'DECLINE_JOB':
      return { ...state, pendingJobOffer: null };

    default:
      return state;
  }
}

export default function useGameState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return INITIAL_STATE;
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_STATE,
        ...parsed,
        stats: { ...INITIAL_STATE.stats, ...parsed.stats, sessionStart: Date.now() },
      };
    } catch {
      return INITIAL_STATE;
    }
  });

  // Keep a ref so intervals always read fresh state without being in deps
  const stateRef = useRef(state);
  stateRef.current = state;

  const save = () => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateRef.current));
    } catch {
      // quota exceeded or private browsing — fail silently
    }
  };

  useEffect(() => {
    if (state.phase !== 'game') return;

    // 1. Credit tick
    const tickInterval = setInterval(() => dispatch({ type: 'TICK' }), 1000);

    // 2. Job offer — random delay between 90–180 seconds
    const jobOfferRef = { current: null };
    const scheduleJobOffer = () => {
      const delay = 90000 + Math.random() * 90000;
      jobOfferRef.current = setTimeout(() => {
        const current = stateRef.current;
        const activeIds = new Set(current.activeJobs.map(j => j.id));
        const available = JOBS.filter(j => !activeIds.has(j.id));
        if (available.length > 0 && !current.pendingJobOffer) {
          const pick = available[Math.floor(Math.random() * available.length)];
          dispatch({ type: 'SET_PENDING_JOB', job: pick });
        }
        scheduleJobOffer();
      }, delay);
    };
    scheduleJobOffer();

    // 3. Auto-save every 5 minutes
    const saveInterval = setInterval(save, 5 * 60 * 1000);

    // Save on tab close
    window.addEventListener('beforeunload', save);

    return () => {
      clearInterval(tickInterval);
      clearTimeout(jobOfferRef.current);
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', save);
    };
  }, [state.phase]);

  return { state, dispatch };
}
```

- [ ] **Step 2: Verify no build errors**

```bash
cd C:/Users/0blac/sarlakweb && npm run dev
```

Navigate to `http://localhost:3000` — confirm no red errors in the terminal output.

- [ ] **Step 3: Commit**

```bash
git add app/zayaani/useGameState.js
git commit -m "feat(zayaani): add game state hook with reducer, loop, and localStorage"
git push
```

---

### Task 4: `JobNotification` Component

**Files:**
- Create: `app/zayaani/JobNotification.js`

- [ ] **Step 1: Create `app/zayaani/JobNotification.js`**

```js
// app/zayaani/JobNotification.js
'use client';
import { useEffect } from 'react';
import styles from './zayaani.module.css';

export default function JobNotification({ job, onAccept, onDecline }) {
  // Auto-dismiss after 15 seconds
  useEffect(() => {
    if (!job) return;
    const timer = setTimeout(onDecline, 15000);
    return () => clearTimeout(timer);
  }, [job, onDecline]);

  if (!job) return null;

  return (
    <div className={styles.toast}>
      <div className={styles.toastTitle}>{job.name}</div>
      <div className={styles.toastFlavour}>{job.flavour}</div>
      <div className={styles.toastCps}>+{job.cps} cr/s</div>
      <div className={styles.toastActions}>
        <button
          className={`${styles.toastBtn} ${styles.toastBtnAccept}`}
          onClick={onAccept}
        >
          Accept
        </button>
        <button className={styles.toastBtn} onClick={onDecline}>
          Decline
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/zayaani/JobNotification.js
git commit -m "feat(zayaani): add job notification toast with 15s auto-dismiss"
git push
```

---

### Task 5: `ShopPanel` Component

**Files:**
- Create: `app/zayaani/ShopPanel.js`

- [ ] **Step 1: Create `app/zayaani/ShopPanel.js`**

```js
// app/zayaani/ShopPanel.js
'use client';
import styles from './zayaani.module.css';
import { FURNITURE } from './asciiAssets';

export default function ShopPanel({ credits, creditsPerSecond, activeJobs, ownedFurniture, onPurchase }) {
  return (
    <div className={styles.sidebar}>
      {/* Credits display */}
      <div className={styles.sideSection}>
        <div className={styles.sideLabel}>Credits</div>
        <div style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '4px' }}>
          {Math.floor(credits)}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {creditsPerSecond} cr/s
        </div>
      </div>

      {/* Active jobs */}
      {activeJobs.length > 0 && (
        <div className={styles.sideSection}>
          <div className={styles.sideLabel}>Income</div>
          {activeJobs.map(job => (
            <div key={job.id} className={styles.jobEntry}>
              <span>{job.name}</span>
              <span>+{job.cps}/s</span>
            </div>
          ))}
        </div>
      )}

      {/* Furniture shop */}
      <div className={styles.sideSection}>
        <div className={styles.sideLabel}>Shop</div>
        {FURNITURE.map(item => {
          const owned = ownedFurniture.includes(item.id);
          const canAfford = credits >= item.cost;
          return (
            <button
              key={item.id}
              className={styles.shopItem}
              onClick={() => onPurchase(item)}
              disabled={owned || !canAfford}
            >
              <span>{item.name}</span>
              <span className={styles.shopItemCost}>
                {owned ? 'owned' : `${item.cost}cr`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/zayaani/ShopPanel.js
git commit -m "feat(zayaani): add shop sidebar panel"
git push
```

---

### Task 6: `ZayaaniRoom` Component

**Files:**
- Create: `app/zayaani/ZayaaniRoom.js`

The room is a fixed ASCII string. The character is overlaid with CSS `position: absolute`. Idle animation uses a CSS `translateY` sway on a 1200ms interval — no ASCII manipulation needed. Furniture items are absolutely positioned overlays at named slot coordinates.

- [ ] **Step 1: Create `app/zayaani/ZayaaniRoom.js`**

```js
// app/zayaani/ZayaaniRoom.js
'use client';
import { useState, useEffect } from 'react';
import styles from './zayaani.module.css';
import { HEADS, TOPS, PANTS, SHOES, FURNITURE } from './asciiAssets';

const BASE_ROOM = `  \\================================================//
   \\                                              //
    \\                                            //
     \\____________________________________________//
     |                                            |
     |                                            |
     |                                            |
     |                                            |
     |                                            |
     |____________________________________________|`;

// Named slot positions — CSS absolute offsets within the room pre container
const SLOT_POSITIONS = {
  back_left:    { top: '24px',   left: '32px'                          },
  back_right:   { top: '24px',   right: '32px'                         },
  back_wall:    { top: '16px',   left: '50%', transform: 'translateX(-50%)' },
  front_right:  { bottom: '48px', right: '40px'                        },
  floor_centre: { bottom: '40px', left: '50%', transform: 'translateX(-50%)' },
};

export default function ZayaaniRoom({ character, ownedFurniture, credits, creditsPerSecond }) {
  const [sway, setSway] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setSway(s => !s), 1200);
    return () => clearInterval(interval);
  }, []);

  const head  = HEADS.find(h => h.id === character.headId)?.compact  ?? '';
  const top   = TOPS.find(t => t.id === character.topId)?.compact    ?? '';
  const pants = PANTS.find(p => p.id === character.pantsId)?.compact ?? '';
  const shoes = SHOES.find(s => s.id === character.shoesId)?.compact ?? '';

  const characterArt = [head, top, pants, shoes].join('\n');

  return (
    <div className={styles.roomArea}>
      <div className={styles.creditsOverlay}>
        {Math.floor(credits)} cr &nbsp;·&nbsp; {creditsPerSecond} cr/s
      </div>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Room walls */}
        <pre className={styles.ascii} style={{ opacity: 0.45 }}>
          {BASE_ROOM}
        </pre>

        {/* Furniture overlays */}
        {ownedFurniture.map(id => {
          const item = FURNITURE.find(f => f.id === id);
          if (!item) return null;
          const pos = SLOT_POSITIONS[item.slot] ?? { top: '20px', left: '20px' };
          return (
            <pre
              key={id}
              className={styles.ascii}
              style={{ position: 'absolute', fontSize: '11px', margin: 0, ...pos }}
            >
              {item.ascii}
            </pre>
          );
        })}

        {/* Character with idle sway */}
        <pre
          className={`${styles.ascii} ${styles.asciiAccent}`}
          style={{
            position: 'absolute',
            bottom: '52px',
            left: '50%',
            transform: `translateX(-50%) translateY(${sway ? '-3px' : '0px'})`,
            transition: 'transform 0.6s ease-in-out',
            margin: 0,
          }}
        >
          {characterArt}
        </pre>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/zayaani/ZayaaniRoom.js
git commit -m "feat(zayaani): add ASCII room with idle animation and furniture slots"
git push
```

---

### Task 7: `CharacterCreator` Component

**Files:**
- Create: `app/zayaani/CharacterCreator.js`

The detail panel on the right tracks which asset was most recently clicked via local `useState`. On first render it shows the default head's detailed art.

- [ ] **Step 1: Create `app/zayaani/CharacterCreator.js`**

```js
// app/zayaani/CharacterCreator.js
'use client';
import { useState } from 'react';
import styles from './zayaani.module.css';
import { HEADS, TOPS, PANTS, SHOES } from './asciiAssets';

const PARTS = [
  { key: 'headId',  label: 'Head',  assets: HEADS  },
  { key: 'topId',   label: 'Top',   assets: TOPS   },
  { key: 'pantsId', label: 'Pants', assets: PANTS  },
  { key: 'shoesId', label: 'Shoes', assets: SHOES  },
];

const ALL_ASSETS = [...HEADS, ...TOPS, ...PANTS, ...SHOES];

export default function CharacterCreator({ character, onSelect, onConfirm }) {
  const [focusedId, setFocusedId] = useState(character.headId);
  const focused = ALL_ASSETS.find(a => a.id === focusedId) ?? HEADS[0];

  const handleSelect = (part, id) => {
    onSelect(part, id);
    setFocusedId(id);
  };

  const head  = HEADS.find(h => h.id === character.headId);
  const top   = TOPS.find(t => t.id === character.topId);
  const pants = PANTS.find(p => p.id === character.pantsId);
  const shoes = SHOES.find(s => s.id === character.shoesId);

  const fullPreview = [head, top, pants, shoes]
    .filter(Boolean)
    .map(a => a.compact)
    .join('\n');

  return (
    <div className={styles.creatorRoot}>
      <div className={styles.creatorTitle}>// Character Creation</div>

      <div className={styles.creatorBody}>
        {/* Left: selectors */}
        <div className={styles.creatorLeft}>
          {PARTS.map(({ key, label, assets }) => (
            <div key={key}>
              <div className={styles.partLabel}>{label}</div>
              <div className={styles.partOptions}>
                {assets.map(asset => (
                  <button
                    key={asset.id}
                    className={`${styles.partOption} ${character[key] === asset.id ? styles.partOptionSelected : ''}`}
                    onClick={() => handleSelect(key, asset.id)}
                  >
                    <div className={styles.partOptionName}>{asset.name}</div>
                    <div className={styles.partOptionTraits}>{asset.traits.join(' · ')}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: detail zoom */}
        <div className={styles.creatorRight}>
          <pre className={`${styles.ascii} ${styles.asciiAccent}`}>
            {focused.detailed}
          </pre>
          <div className={styles.detailName}>{focused.name}</div>
          <div className={styles.detailTraits}>{focused.traits.join(' · ')}</div>
        </div>
      </div>

      {/* Footer: full-body preview + confirm */}
      <div className={styles.creatorFooter}>
        <pre className={`${styles.ascii} ${styles.asciiAccent}`} style={{ fontSize: '11px' }}>
          {fullPreview}
        </pre>
        <button className={styles.confirmBtn} onClick={onConfirm}>
          Confirm →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/zayaani/CharacterCreator.js
git commit -m "feat(zayaani): add character creator with detail zoom and full-body preview"
git push
```

---

### Task 8: `ZayaaniGame` Orchestrator + Route Shell

**Files:**
- Create: `app/zayaani/ZayaaniGame.js`
- Create: `app/zayaani/page.js`

- [ ] **Step 1: Create `app/zayaani/ZayaaniGame.js`**

```js
// app/zayaani/ZayaaniGame.js
'use client';
import useGameState from './useGameState';
import CharacterCreator from './CharacterCreator';
import ZayaaniRoom from './ZayaaniRoom';
import ShopPanel from './ShopPanel';
import JobNotification from './JobNotification';
import styles from './zayaani.module.css';

export default function ZayaaniGame() {
  const { state, dispatch } = useGameState();

  const handleSelectPart = (part, id) => dispatch({ type: 'SET_CHARACTER_PART', part, id });
  const handleConfirm    = ()          => dispatch({ type: 'CONFIRM_CHARACTER' });
  const handlePurchase   = (item)      => dispatch({ type: 'PURCHASE_FURNITURE', item });
  const handleAcceptJob  = ()          => dispatch({ type: 'ACCEPT_JOB' });
  const handleDeclineJob = ()          => dispatch({ type: 'DECLINE_JOB' });

  if (state.phase === 'creation') {
    return (
      <CharacterCreator
        character={state.character}
        onSelect={handleSelectPart}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.gameLayout}>
        <ShopPanel
          credits={state.credits}
          creditsPerSecond={state.creditsPerSecond}
          activeJobs={state.activeJobs}
          ownedFurniture={state.ownedFurniture}
          onPurchase={handlePurchase}
        />
        <ZayaaniRoom
          character={state.character}
          ownedFurniture={state.ownedFurniture}
          credits={state.credits}
          creditsPerSecond={state.creditsPerSecond}
        />
      </div>
      <JobNotification
        job={state.pendingJobOffer}
        onAccept={handleAcceptJob}
        onDecline={handleDeclineJob}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `app/zayaani/page.js`**

```js
// app/zayaani/page.js
import ZayaaniGame from './ZayaaniGame';

export const metadata = {
  title: 'Zayaani',
  robots: { index: false, follow: false },
};

export default function ZayaaniPage() {
  return <ZayaaniGame />;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/zayaani/ZayaaniGame.js app/zayaani/page.js
git commit -m "feat(zayaani): wire up orchestrator and /zayaani route"
git push
```

---

### Task 9: Integration Smoke Test

No new files. Verify the full end-to-end flow in the browser.

- [ ] **Step 1: Character creator loads**

Navigate to `http://localhost:3000/zayaani`.

Expected: full-screen creator with body part options on the left, detail panel on the right showing the Emo Boy head at high density, full-body preview in the footer.

- [ ] **Step 2: Selections update in real time**

Click each body part option in the left panel.

Expected: right panel updates to show the selected part&apos;s detailed art + name + traits. Footer full-body preview updates immediately.

- [ ] **Step 3: Transition to game**

Click **Confirm →**.

Expected: game screen appears — left sidebar shows credits (0) and 1 cr/s, ASCII room with character visible in the centre, credit overlay top-left of the room.

- [ ] **Step 4: Credits accumulate**

Wait 5 seconds.

Expected: credit counter in sidebar and overlay increases from 0 to ~5.

- [ ] **Step 5: Furniture purchase**

Wait until credits ≥ 40. Click **Poster** (40cr) in the shop.

Expected: credits decrease by 40, the poster ASCII appears in the room at the back wall, button label changes to &quot;owned&quot;.

- [ ] **Step 6: Job offer (speed test)**

Temporarily set the job offer delay to 3000ms. In `useGameState.js`, change:
```js
const delay = 90000 + Math.random() * 90000;
```
to:
```js
const delay = 3000;
```

Reload, confirm character, wait 3 seconds.

Expected: toast appears top-right with job name, flavour text, and cr/s bonus. Clicking Accept closes the toast, adds the job to the Income section, increases cr/s. **Revert this change before the final commit.**

- [ ] **Step 7: Persistence**

With some credits and owned furniture, close and reopen `http://localhost:3000/zayaani`.

Expected: game loads directly to the game screen (skipping character creation), credits and furniture are restored.

- [ ] **Step 8: Revert speed test change and final commit**

```bash
# Confirm useGameState.js has delay = 90000 + Math.random() * 90000
git add -A
git commit -m "feat(zayaani): complete idle game — character creator, room, shop, jobs, persistence"
git push
```
