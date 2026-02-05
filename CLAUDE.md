# CLAUDE.md - Development Ruleset

**Project:** Office Horror Incremental Game (SarlakWeb)
**Stack:** Next.js 15.5.6, React 19.1.0, JavaScript (ES6+)
**Version:** 2.0.5

---

## Git Workflow (MANDATORY)

Automatically commit and push ALL changes immediately after making them. No exceptions.

```
git add [changed files] && git commit -m "descriptive message" && git push
```

---

## Architecture Overview

```
app/game/
  page.js                     # Main game component (2123 lines - UI orchestrator, state, timers)

  # Data Layer (constants)
  constants.js                # INITIAL_GAME_STATE (141 props), LOCATIONS, UPGRADES, ACHIEVEMENTS,
                              # EVENTS, DOCUMENT_TYPES, SANITY_TIERS, HELP_POPUPS, HELP_TRIGGERS,
                              # JOURNAL_ENTRIES, MECHANICS_ENTRIES, DEBUG_CHALLENGES, ARCHIVE_CASES
  skillTreeConstants.js       # SKILLS (21), SKILL_BRANCHES (5), LEVEL_SYSTEM, XP_REWARDS
  equipmentConstants.js       # WEAPONS, ARMOR, ANOMALIES, RARITY + 8 helper functions
  lootConstants.js            # BASE_LOOT_ITEMS, LOOT_PREFIXES, VOID_IMBUEMENTS, LOOT_DROP_RATES
  dimensionalConstants.js     # DIMENSIONAL_MATERIALS (7), generateEncryptedText, generateMaterialNodes
  combatConstants.js          # Legacy - combat removed in v2.0.5, file still exists

  # Logic Layer (helpers)
  gameActions.js              # createGameActions factory -> 27+ action handlers
  skillSystemHelpers.js       # 16 exported functions (XP, skills, multipliers)
  sanityPaperHelpers.js       # 19 exported functions (tiers, quality, buffs, documents)
  lootGenerationHelpers.js    # 11 exported functions (generation, stats, display)
  journalHelpers.js           # 9 exported functions (discovery tracking)
  gameUtils.js                # Visual effects (distortion, particles, screen shake)
  saveSystem.js               # Save/load/export/import to localStorage/clipboard

  # UI Layer (18 modal/component files)
  SkillTreeModal.js           MeditationModal.js      DebugModal.js
  DebugPanel.js               JournalModal.js         AchievementsModal.js
  ExamineModal.js             ArchiveModal.js         Armory.js
  PrinterRoom.js              FileDrawer.js           DimensionalArea.js
  DimensionalUpgradesDisplay.js  HelpPopup.js         EventLog.js
  NotificationPopup.js        BuffReplacementModal.js CrystalOpeningModal.js

app/                          # Home page, layout, globals.css
components/                   # Header.js, Footer.js, CursorShadow.js, ConwaysGameOfLife.js
```

### Core Principles
1. **Separation of concerns**: UI in components, logic in helpers, data in constants
2. **Single source of truth**: All game state in `INITIAL_GAME_STATE` (constants.js)
3. **Functional state updates**: Always use `setGameState(prev => ({...prev, ...changes}))`
4. **Event-driven**: No game loop - user actions trigger state updates
5. **Modal-based UI**: Each feature gets a dedicated modal component
6. **No emojis**: Minimalist horror aesthetic - emojis break immersion
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
actions.sortPapers();  // Always call through actions object
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
3. Use exact property names - reference `INITIAL_GAME_STATE` for canonical names

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

---

## Game Systems Reference

### Sanity-Paper System
- 4 tiers: High (80-100, 1.0x), Medium (40-79, 1.15x), Low (10-39, 1.35x), Critical (0-9, 1.5x)
- Paper quality = `(printerQuality * 0.7) + (sanity * 0.3)` (shifts to 50/50 at critical)
- Documents: memos, reports, contracts, prophecies - each with 5 tiers and 4 quality outcomes
- Reports create timed buffs with `expiresAt` timestamps in `activeReportBuffs`

### Loot System
- Rarities: common, uncommon, rare, epic, legendary, mythic
- Items have: base stats, prefix modifier, void imbuements (count scales with rarity)
- Stored in `lootInventory` array, equipped via ID references

### Skill Tree
- 5 branches, 21 skills across 5 tiers
- Effects returned as objects from `skill.effect(level)` functions
- XP curve: `baseXP * (1.5 ^ (level - 1))`, max level 50

### Buff System
- Max 3 active buffs (configurable via `maxActiveBuffs`)
- `activeReportBuffs` array with `{ id, name, ppMult, expiresAt }` objects
- BuffReplacementModal handles slot management when at capacity

### Journal & Discovery
- Auto-tracks: locations visited, equipment found, mechanics learned
- State arrays: `discoveredLocations`, `discoveredBaseWeapons`, `discoveredBaseArmor`, etc.
- Mechanic discovery linked to help popup triggers

### File Drawer
- `storedDocuments` array: `{ id, type, tier, quality, outcome, createdAt, important }`
- Actions: consume (apply effects), shred (recover paper), star (mark important)

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

---

## Known Issues (Current Codebase)

These exist in the code today - be aware when working nearby:

1. **Emojis in UI**: JournalModal, FileDrawer, HelpPopup, AchievementsModal, skillSystemHelpers use emojis despite "no emojis" rule
2. **combatConstants.js**: Legacy file from removed combat system - still imported in some places
3. **equipmentConstants.js**: 11 equipment items reference `dimensionalUpgrade` IDs that don't exist in `DIMENSIONAL_UPGRADES` (e.g., `shard_weapon`, `void_cleaver_craft`) - `isEquipmentUnlocked()` is broken for these
4. **lootConstants.js BASE_LOOT_ITEMS**: Duplicates data from equipmentConstants.js (two sources of truth)
5. **EVENTS probability sum**: Probabilities in constants.js EVENTS array sum to ~1.28, not 1.0
6. **Dimensional rarity weights**: Sum to 1.0015 instead of 1.0
7. **LOOT_DROP_RATES**: Sum to 0.999 (0.1% gap)
8. **Screen effects split**: `triggerScreenEffect` in gameActions.js duplicates `createScreenShake` in gameUtils.js
9. **Particle memory leaks**: `createLevelUpParticles` creates 80 DOM elements + style tags per call without deduplication
10. **page.js size**: 2123 lines - needs decomposition into subcomponents
