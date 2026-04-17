# CLAUDE.md - Development Ruleset

**Project:** SarlakWeb
**Stack:** Next.js 15.5.6, React 19.1.0, JavaScript (ES6+)

---

## Writing Voice (Dev Log Posts)

When writing any dev log post in `content/posts/`, follow Shahhin's voice exactly:

- State context before action
- Specific humanising details over generic phrases
- No action-verb bullet openers
- Short declarative sentences for results
- Simple vocabulary over impressive
- Stop when the point lands
- No hyphenated words
- No em dashes
- No Oxford commas
- Close the loop back to the role explicitly

---

## Git Workflow (MANDATORY)

Automatically commit and push ALL changes immediately after making them. No exceptions.

```
git add [changed files] && git commit -m "descriptive message" && git push
```

---

## Architecture

```
app/game/         — incremental game (constants, helpers, modals — see source files)
app/wheel/        — spin wheel app (SpinWheel.js, wheelCache.js, API route)
app/log/          — dev log (markdown posts in content/posts/, rendered via lib/posts.js)
app/apps/         — apps directory page
app/survival/     — survival game
app/zayaani/      — Zayaani game
app/rayan/        — Rayan page
components/       — Header.js, Footer.js, CursorShadow.js, ConwaysGameOfLife.js
lib/posts.js      — gray-matter + remark markdown pipeline
content/posts/    — markdown source for dev log entries
```

### Core Principles
1. **Separation of concerns**: UI in components, logic in helpers, data in constants
2. **Single source of truth**: All game state in `INITIAL_GAME_STATE` (constants.js)
3. **Functional state updates**: Always use `setGameState(prev => ({...prev, ...changes}))`
4. **Event-driven**: No game loop — user actions trigger state updates
5. **Modal-based UI**: Each feature gets a dedicated modal component
6. **No emojis**: Minimalist horror aesthetic
7. **Cascading changes**: When modifying ANY system, update all related files (see checklist below)

---

## Critical Patterns

### State Updates (MUST follow)
```javascript
// ALWAYS functional setState - prevents race conditions
setGameState(prev => ({
  ...prev,
  pp: prev.pp + ppGain,
  energy: Math.max(0, prev.energy - cost),
  recentMessages: [msg, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
}));

// NEVER direct state reference in setState
setGameState({ ...gameState, pp: gameState.pp + 10 }); // WRONG - stale state
```

### Action Handlers (gameActions.js)
All actions go through the factory pattern. Never create standalone action functions.
```javascript
// Actions follow: validate -> calculate -> build state -> side effects
const actions = createGameActions(setGameState, addMessage, checkAchievements, grantXP);
actions.sortPapers();
```

Action structure inside factory:
```javascript
const someAction = () => {
  setGameState(prev => {
    if (prev.energy < cost) {                    // 1. Validate
      return { ...prev, recentMessages: ['Too exhausted.', ...prev.recentMessages].slice(0, 15) };
    }
    const gain = prev.ppPerClick;                // 2. Calculate
    const newState = { ...prev, pp: prev.pp + gain, energy: prev.energy - cost }; // 3. Build
    grantXP(XP_REWARDS.sortPapers);              // 4. Side effects
    setTimeout(() => checkAchievements(), 50);
    return newState;
  });
};
```

### Helper Functions
Pure functions. Take gameState as parameter, return values (not mutations).
```javascript
export const applyPPMultiplier = (basePP, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  return basePP * (1 + effects.ppMultiplier);
};
```

### Adding New State Properties
1. Add to `INITIAL_GAME_STATE` in constants.js with comment and correct type
2. Update save system compatibility if needed
3. Use exact property names — reference `INITIAL_GAME_STATE` for canonical names

Key property naming (DO NOT rename):
- `pp` (not productivityPoints), `location` (not currentLocation)
- `playerLevel` (not level), `playerXP` (not xp)
- `upgrades` / `printerUpgrades` / `dimensionalUpgrades` = `{ id: true }` objects
- `achievements` / `unlockedLocations` / `discoveredEvents` = arrays
- `recentMessages` = array, always `.slice(0, maxLogMessages || 15)` after prepend

---

## Coding Standards

### Formatting
- 2-space indent, semicolons always, single quotes (double in JSX attributes)
- Max 100 char line length (flexible for JSX)
- Trailing commas in multiline arrays/objects

### Naming
- `camelCase` variables/functions, `UPPER_SNAKE_CASE` constants, `PascalCase` components
- Boolean prefixes: `is`, `has`, `should` (`isUnlocked`, `hasUpgrade`)
- Handler prefixes: `handle` (`handleSaveGame`, `handlePurchaseSkill`)
- Files: `camelCase.js` for utilities, `PascalCase.js` for components

### Import Order
```javascript
import { useState, useEffect } from 'react';    // 1. React/Next.js
// 2. Third-party (currently: three.js only)
import SkillTreeModal from './SkillTreeModal';    // 3. Local components
import { createGameActions } from './gameActions'; // 4. Local helpers
import { INITIAL_GAME_STATE } from './constants';  // 5. Constants (last)
```

### Component Pattern
```javascript
export default function ExampleModal({ gameState, onClose, onAction }) {
  // Minimal local state, prefer props
  // ESC key handler via useEffect
  // CSS variables for theming: var(--bg-color), var(--text-color), var(--border-color)
  // Font: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace"
  // Modal overlay: position fixed, z-index 1000, rgba(0,0,0,0.8) backdrop
}
```

### Inline Styles
Use for: dynamic values, component-specific layout, modal overlays.
Avoid for: repeated patterns (use CSS classes), animations (use @keyframes).

### ESLint / JSX Compliance (enforced by AWS Amplify build)
- **Always escape special characters in JSX text.** Unescaped `'`, `"`, `>`, `}` cause build failures.
  - Apostrophes: use `&apos;`
  - Quotes: use `&quot;`
  - Left/right single quotes: use `&lsquo;` / `&rsquo;`
- Run `npm run build` locally before pushing to catch ESLint errors before Amplify does.
- The `react/no-unescaped-entities` rule is active — any raw `'` or `"` inside JSX elements will fail the build.

---

## Game Systems (read source for authoritative detail)

- **Sanity-Paper**: 4 tiers, quality formula — see `sanityPaperHelpers.js` + `constants.js`
- **Loot**: rarities, prefixes, void imbuements — see `lootConstants.js`, `lootGenerationHelpers.js`
- **Skill Tree**: 5 branches, 21 skills — see `skillTreeConstants.js`, `skillSystemHelpers.js`
- **Buffs**: max 3 active, `activeReportBuffs` array — see `gameActions.js`
- **Journal**: auto-discovery tracking — see `journalHelpers.js`
- **File Drawer**: `storedDocuments` array — see `FileDrawer.js`, `gameActions.js`

---

## Cascading Change Checklist

When modifying ANY game system, verify ALL of these:

**Always check:**
- [ ] `INITIAL_GAME_STATE` if new/changed state properties
- [ ] `HELP_POPUPS` and `HELP_TRIGGERS` in constants.js
- [ ] `MECHANICS_ENTRIES` in constants.js (journal mechanic docs)
- [ ] `ACHIEVEMENTS` check functions in constants.js
- [ ] Action handlers in `gameActions.js`
- [ ] UI displays showing affected values
- [ ] Both light and dark theme rendering

**When adding features:**
- [ ] State properties + initialization
- [ ] Help popup explaining the feature
- [ ] Journal mechanic entry
- [ ] Achievement(s) tied to the feature
- [ ] Modal component + trigger button + close handler

**When removing features:**
- [ ] Remove state properties, achievements, help popups, journal entries
- [ ] Remove UI components and action handlers
- [ ] Search codebase for remaining references (`grep -r "featureName"`)
