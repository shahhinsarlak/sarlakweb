# CLAUDE.md - Development Ruleset for SarlakWeb Game

**Project:** Office Horror Incremental Game
**Framework:** Next.js 15.5.6 with React 19.1.0
**Language:** JavaScript (ES6+)
**Version:** 1.0
**Last Updated:** 2025-10-21

---

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Coding Standards](#coding-standards)
3. [State Management Rules](#state-management-rules)
4. [File Organization](#file-organization)
5. [Naming Conventions](#naming-conventions)
6. [Import/Export Standards](#importexport-standards)
7. [Component Patterns](#component-patterns)
8. [Game Logic Patterns](#game-logic-patterns)
9. [Styling Guidelines](#styling-guidelines)
10. [Testing & Debugging](#testing--debugging)
11. [Performance Guidelines](#performance-guidelines)
12. [Documentation Requirements](#documentation-requirements)
13. [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)

---

## 1. Project Architecture

### Directory Structure
```
/app
  /game              # Main game application
    page.js          # Main game component (UI orchestrator)
    constants.js     # Game data: INITIAL_STATE, LOCATIONS, UPGRADES, etc.
    gameActions.js   # All game action handlers
    skillSystemHelpers.js    # Skill tree logic
    skillTreeConstants.js    # Skill definitions
    saveSystem.js    # Save/load functionality
    dimensionalConstants.js  # Dimensional mining data
    gameUtils.js     # Utility functions (distortion, particles, etc.)
    [Modal].js       # Modal components (SkillTreeModal, MeditationModal, etc.)
  /apps              # Apps showcase page
  page.js            # Home page
  layout.js          # Root layout
  globals.css        # Global styles & CSS variables

/components
  Header.js          # Navigation & theme toggle
  Footer.js          # Footer component
  [Other].js         # Shared components

/public              # Static assets (images, icons)
```

### Core Principles
1. **Separation of Concerns**: UI in components, logic in helpers, data in constants
2. **Single Source of Truth**: All game state lives in `INITIAL_GAME_STATE`
3. **Functional Programming**: Immutable state updates, pure functions where possible
4. **Event-Driven Architecture**: No game loop - actions trigger updates
5. **Modal-Based UI**: Complex interactions happen in dedicated modal components

---

## 2. Coding Standards

### General Rules
```javascript
// ✅ DO: Use descriptive variable names
const maxEnergyWithUpgrades = 100 + (upgrades.energyDrink ? 20 : 0);

// ❌ DON'T: Use single letters or abbreviations
const me = 100 + (u.ed ? 20 : 0);

// ✅ DO: Extract magic numbers to named constants
const ENERGY_COST_SORT_PAPERS = 2;
const ENERGY_COST_DEBUG = 10;

// ❌ DON'T: Use magic numbers directly
if (prev.energy < 5) { }  // What is 5?

// ✅ DO: Add JSDoc comments to all functions
/**
 * Sorts papers and grants PP based on player's click value
 * @returns {void}
 */
const sortPapers = () => { ... };

// ✅ DO: Use early returns for validation
if (!isValid) return prev;
if (energy < cost) {
  return { ...prev, recentMessages: ['Too exhausted', ...] };
}
// Continue with main logic

// ❌ DON'T: Nest conditions deeply
if (isValid) {
  if (energy >= cost) {
    // Main logic buried here
  }
}
```

### Code Formatting
- **Indentation**: 2 spaces (no tabs)
- **Line Length**: Maximum 100 characters (exceptions for JSX)
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings, except JSX attributes
- **Trailing Commas**: Use in multiline arrays/objects
- **Spacing**: Space after keywords (`if `, `for `, `function `)

### File Headers
Every file should start with a descriptive comment:
```javascript
/**
 * Game Action Handlers
 *
 * Contains all game actions that modify game state:
 * - sortPapers: Main productivity action
 * - rest: Restore energy
 * - meditation: Sanity restoration minigame
 * - etc.
 */
```

---

## 3. State Management Rules

### Critical Pattern: Functional setState
**ALWAYS** use functional setState to avoid race conditions:

```javascript
// ✅ CORRECT: Functional setState
setGameState(prev => ({
  ...prev,
  pp: prev.pp + 10,
  energy: Math.max(0, prev.energy - 5)
}));

// ❌ WRONG: Direct state mutation
setGameState({
  ...gameState,
  pp: gameState.pp + 10  // Uses stale state!
});
```

### State Property Names (EXACT)
These property names are **IMMUTABLE** - never rename them:

```javascript
// Core Resources
gameState.pp              // Productivity Points (NOT productivityPoints)
gameState.energy          // Energy level 0-100
gameState.sanity          // Sanity level 0-100
gameState.paper           // Paper currency (printer system)

// Player Progression
gameState.playerLevel     // Player level (NOT level, NOT characterLevel)
gameState.playerXP        // Experience points
gameState.skillPoints     // Available skill points
gameState.skills          // Object of skill levels: { skillId: level }

// Game State
gameState.location        // Current location (NOT currentLocation)
gameState.day             // Day counter
gameState.timeInOffice    // Time counter in seconds
gameState.phase           // Game phase (1, 2, etc.)

// Collections (Objects, NOT Arrays)
gameState.upgrades        // { upgradeId: true }
gameState.printerUpgrades // { upgradeId: true }
gameState.dimensionalUpgrades  // { upgradeId: true }
gameState.dimensionalInventory // { materialId: count }
gameState.achievements    // Array of achievement IDs

// Flags & Counters
gameState.sortCount       // Number of times papers sorted
gameState.printCount      // Number of prints
gameState.disagreementCount  // Colleague disagreements
gameState.examinedItems   // Items examined in archive
gameState.themeToggleCount   // Theme toggle easter egg

// UI State
gameState.recentMessages  // Array of recent event log messages
gameState.showSkillTree   // Boolean flag
gameState.meditating      // Boolean flag
gameState.examiningItem   // Item object or null
gameState.inDimensionalArea  // Boolean flag
gameState.inPrinterRoom   // Boolean flag

// Cooldowns (in seconds)
gameState.restCooldown    // Rest action cooldown
gameState.portalCooldown  // Portal entry cooldown

// Per-Action Values
gameState.ppPerClick      // PP gained per sort action
gameState.ppPerSecond     // Passive PP generation
gameState.paperPerPrint   // Paper per print action
gameState.paperPerSecond  // Passive paper generation
gameState.printerQuality  // 0-100 quality percentage
```

### Message System Pattern
```javascript
// Pattern for adding messages to event log
const messages = [];
messages.push('First message');
messages.push('Second message');

setGameState(prev => ({
  ...prev,
  recentMessages: [...messages, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
}));

// For single message:
setGameState(prev => ({
  ...prev,
  recentMessages: ['New message', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
}));
```

### Adding New State Properties
**MANDATORY STEPS:**
1. Add to `INITIAL_GAME_STATE` in `constants.js` first
2. Document the property's purpose with a comment
3. Initialize with the correct type (number, boolean, object, array)
4. Update save system if needed

```javascript
export const INITIAL_GAME_STATE = {
  // ... existing properties ...

  // New Property (Added 2025-10-21)
  // Tracks number of meditation sessions completed
  meditationSessions: 0,
};
```

---

## 4. File Organization

### constants.js Structure
```javascript
// 1. Initial game state (FIRST)
export const INITIAL_GAME_STATE = { ... };

// 2. Game data structures (alphabetically)
export const ACHIEVEMENTS = [ ... ];
export const DEBUG_CHALLENGES = [ ... ];
export const DIMENSIONAL_UPGRADES = [ ... ];
export const EVENTS = [ ... ];
export const LOCATIONS = { ... };
export const PRINTER_UPGRADES = [ ... ];
export const STRANGE_COLLEAGUE_DIALOGUES = [ ... ];
export const UPGRADES = [ ... ];
```

### gameActions.js Pattern
**CRITICAL: Use the actions object pattern**

```javascript
// Action handlers are created via factory function
export const createGameActions = (setGameState, addMessage, checkAchievements, grantXP) => {

  // Define all action handlers
  const sortPapers = () => { ... };
  const rest = () => { ... };
  const startMeditation = () => { ... };

  // Return actions object
  return {
    sortPapers,
    rest,
    startMeditation,
    // ... all other actions
  };
};

// Usage in page.js:
const actions = createGameActions(setGameState, addMessage, checkAchievements, grantXP);
// Then call: actions.sortPapers(), actions.rest(), etc.
```

**NEVER** create standalone action functions - always use the `actions` object.

### Helper Files Pattern
```javascript
// Pure functions only - no side effects
export const calculateDamage = (baseDamage, skills) => {
  return baseDamage * (1 + skills.attackBonus);
};

// Functions that need game state take it as parameter
export const addExperience = (gameState, xpAmount, addMessage) => {
  // Returns new state properties, doesn't mutate
  return {
    playerLevel: newLevel,
    playerXP: remainingXP,
    skillPoints: newSkillPoints
  };
};
```

---

## 5. Naming Conventions

### Variables & Functions
```javascript
// ✅ camelCase for variables and functions
const playerHealth = 100;
const maxEnergyLevel = 120;

function calculateTotalDamage() { }
function handleButtonClick() { }

// ✅ UPPER_SNAKE_CASE for constants
const MAX_ENERGY = 100;
const ENERGY_COST_SORT_PAPERS = 2;
const DEFAULT_MESSAGE_LIMIT = 15;

// ✅ PascalCase for React components
function SkillTreeModal() { }
function MeditationModal() { }

// ✅ Prefix booleans with is/has/should
const isUnlocked = true;
const hasUpgrade = false;
const shouldShowModal = false;

// ✅ Prefix handlers with handle
const handleSaveGame = () => { };
const handlePurchaseSkill = () => { };
```

### Files & Folders
```javascript
// ✅ camelCase for utility files
gameUtils.js
skillSystemHelpers.js
dimensionalConstants.js

// ✅ PascalCase for component files
SkillTreeModal.js
MeditationModal.js
PrinterRoom.js

// ✅ lowercase for Next.js routes
page.js
layout.js
```

### Constants Naming
```javascript
// ✅ Descriptive constant names
export const UPGRADES = [ ... ];
export const ACHIEVEMENTS = [ ... ];
export const INITIAL_GAME_STATE = { ... };

// ✅ Prefix related constants
export const ENERGY_COST_SORT = 2;
export const ENERGY_COST_DEBUG = 10;
export const ENERGY_COST_MEDITATION = 10;
export const ENERGY_RESTORE_REST = 100;

export const XP_REWARD_SORT_PAPERS = 1;
export const XP_REWARD_DEBUG = 15;
export const XP_REWARD_DEFEAT_COLLEAGUE = 25;
```

---

## 6. Import/Export Standards

### Import Order (Mandatory)
```javascript
// 1. React/Next.js imports
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// 2. Third-party libraries
// (none currently used)

// 3. Local components
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MeditationModal from './MeditationModal';

// 4. Local utilities & helpers
import { createGameActions } from './gameActions';
import { getDistortionStyle, distortText } from './gameUtils';
import { saveGame, loadGame } from './saveSystem';

// 5. Constants (last)
import { INITIAL_GAME_STATE, LOCATIONS, UPGRADES } from './constants';
import { SKILLS, LEVEL_SYSTEM } from './skillTreeConstants';
```

### Export Patterns
```javascript
// ✅ Named exports for utilities/helpers
export const addExperience = (gameState, xp) => { };
export const purchaseSkill = (gameState, skillId) => { };

// ✅ Default export for components
export default function SkillTreeModal({ gameState, onClose }) {
  return <div>...</div>;
}

// ✅ Named exports for constants
export const INITIAL_GAME_STATE = { ... };
export const UPGRADES = [ ... ];
```

---

## 7. Component Patterns

### Modal Component Template
```javascript
/**
 * [Modal Name] Component
 *
 * Description of what this modal does
 *
 * @param {Object} gameState - Current game state
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onAction - Callback for main action
 */
export default function ExampleModal({ gameState, onClose, onAction }) {
  // Local state (minimal - prefer props)
  const [localValue, setLocalValue] = useState(0);

  // Handlers
  const handleSubmit = () => {
    onAction(localValue);
    onClose();
  };

  // Render
  return (
    <div style={{
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '600px',
        width: '90%',
        border: '1px solid var(--border-color)',
        padding: '40px',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)'
      }}>
        {/* Modal content */}
      </div>
    </div>
  );
}
```

### Component Rules
1. **Stateless when possible**: Modals receive state as props
2. **Single responsibility**: One modal per feature
3. **CSS Variables**: Use `var(--bg-color)`, `var(--text-color)`, etc.
4. **Consistent font**: Always use the monospace font stack
5. **Accessibility**: Include proper ARIA labels and keyboard handlers

---

## 8. Game Logic Patterns

### Action Pattern (CRITICAL)
```javascript
const sortPapers = () => {
  setGameState(prev => {
    // 1. Validation first
    const energyCost = 2;
    if (prev.energy < energyCost) {
      return {
        ...prev,
        recentMessages: ['Too exhausted.', ...prev.recentMessages].slice(0, 15)
      };
    }

    // 2. Calculate changes
    const ppGain = prev.ppPerClick;

    // 3. Build new state
    const newState = {
      ...prev,
      pp: prev.pp + ppGain,
      energy: Math.max(0, prev.energy - energyCost),
      sortCount: (prev.sortCount || 0) + 1
    };

    // 4. Side effects AFTER state update
    grantXP(1);
    setTimeout(() => checkAchievements(), 50);

    return newState;
  });
};
```

### XP & Achievement Pattern
```javascript
// Grant XP immediately
grantXP(XP_REWARDS.sortPapers);

// Check achievements with delay (ensures state is updated)
setTimeout(() => checkAchievements(), 50);
```

### Upgrade Purchase Pattern
```javascript
const buyUpgrade = (upgrade) => {
  setGameState(prev => {
    // Check affordability
    if (prev.pp < upgrade.cost || prev.upgrades[upgrade.id]) return prev;

    // Build new state
    const newState = {
      ...prev,
      pp: prev.pp - upgrade.cost,
      upgrades: { ...prev.upgrades, [upgrade.id]: true }
    };

    // Apply upgrade effect
    if (upgrade.effect === 'ppPerClick') {
      newState.ppPerClick += upgrade.value;
    } else if (upgrade.effect === 'ppPerSecond') {
      newState.ppPerSecond += upgrade.value;
    }

    // Add message
    newState.recentMessages = [
      `Acquired: ${upgrade.name}`,
      ...prev.recentMessages
    ].slice(0, 15);

    // Grant XP and check achievements
    grantXP(XP_REWARDS.purchaseUpgrade);
    setTimeout(() => checkAchievements(), 50);

    return newState;
  });
};
```

### Skill System Pattern
```javascript
// Skills defined in skillTreeConstants.js
export const SKILLS = {
  efficiency_1: {
    id: 'efficiency_1',
    name: 'Efficient Worker',
    desc: '+10% PP generation',
    branch: 'efficiency',
    tier: 1,
    maxLevel: 5,
    requires: [],  // Array of skill IDs
    effect: (level) => ({
      ppMultiplier: 0.10 * level  // Returns effect object
    })
  }
};

// Using skills in helpers
export const applyPPMultiplier = (basePP, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  return basePP * (1 + effects.ppMultiplier);
};
```

---

## 9. Styling Guidelines

### CSS Variables (Theme System)
```css
/* Use CSS variables for all colors */
:root {
  --bg-color: #ffffff;
  --text-color: #1a1a1a;
  --border-color: #e0e0e0;
  --accent-color: #000000;
  --hover-color: #f8f8f8;
}

[data-theme="dark"] {
  --bg-color: #0a0a0a;
  --text-color: #e0e0e0;
  --border-color: #2a2a2a;
  --accent-color: #ffffff;
  --hover-color: #1a1a1a;
}
```

### Inline Styles (When to Use)
```javascript
// ✅ USE inline styles for:
// 1. Dynamic values
style={{ width: `${progress}%` }}

// 2. Component-specific layouts
style={{
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px'
}}

// 3. Modal overlays
style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  zIndex: 1000
}}

// ❌ AVOID inline styles for:
// 1. Repeated patterns (use CSS classes)
// 2. Complex responsive designs
// 3. Animations (use CSS @keyframes)
```

### Font Stack (Mandatory)
```javascript
// Always use this exact font stack:
fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace"
```

---

## 10. Testing & Debugging

### Debug Tools (Development Only)
```javascript
// Debug menu is included but should be clearly marked
// Located in main page.js around lines 1222-1425

// Debug buttons should:
// 1. Be visually distinct (different colors)
// 2. Have low opacity (0.5)
// 3. Not interfere with normal gameplay
// 4. Be documented in code comments

// Example:
<button
  onClick={() => setGameState(prev => ({ ...prev, pp: prev.pp + 100000 }))}
  style={{
    opacity: 0.5,  // Low opacity indicates debug
    border: '1px solid #ff00ff',
    color: '#ff00ff'
  }}
>
  +100K PP
</button>
```

### Console Logging Standards
```javascript
// ✅ Development logging (remove before production)
console.log('[DEBUG] Player leveled up:', newLevel);
console.warn('[WARNING] Energy depleted');
console.error('[ERROR] Failed to load save:', error);

// ❌ Don't leave production logs
console.log('test');
console.log(gameState);  // Logs entire state object

// ✅ Use structured logging for debugging
const debugLog = (category, message, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${category.toUpperCase()}]`, message, data);
  }
};
```

### Error Handling Pattern
```javascript
// ✅ Try-catch for file operations
try {
  const saveData = JSON.parse(fileContent);
  if (!saveData.version || !saveData.state) {
    throw new Error('Invalid save file format');
  }
  setGameState(saveData.state);
  addMessage('Save loaded successfully.');
} catch (error) {
  addMessage('Failed to load save file: ' + error.message);
  console.error('[SAVE_SYSTEM]', error);
}

// ✅ Validation in game actions
if (!upgrade || prev.upgrades[upgrade.id]) {
  return prev;  // Silent failure, no error message
}

if (prev.pp < upgrade.cost) {
  return {
    ...prev,
    recentMessages: ['Cannot afford upgrade.', ...]
  };
}
```

---

## 11. Performance Guidelines

### useCallback & useMemo
```javascript
// ✅ useCallback for functions passed to children
const addMessage = useCallback((msg) => {
  setGameState(prev => ({
    ...prev,
    recentMessages: [msg, ...prev.recentMessages].slice(0, 15)
  }));
}, []);

// ✅ useMemo for expensive calculations
const materialNodes = useMemo(
  () => generateMaterialNodes(encryptedText.length, gameState.dimensionalInventory),
  [encryptedText.length, gameState.dimensionalInventory]
);

// ❌ Don't overuse - only for actual performance issues
```

### Array Operations
```javascript
// ✅ Slice after concat to limit array size
recentMessages: [newMessage, ...prev.recentMessages].slice(0, 15)

// ✅ Filter before map when possible
const activeSkills = Object.entries(skills)
  .filter(([_, level]) => level > 0)
  .map(([id, level]) => ({ id, level }));

// ❌ Avoid nested loops in hot paths
```

### State Updates
```javascript
// ✅ Batch related updates together
setGameState(prev => ({
  ...prev,
  pp: prev.pp + ppGain,
  energy: prev.energy - energyCost,
  sortCount: prev.sortCount + 1,
  recentMessages: [message, ...prev.recentMessages].slice(0, 15)
}));

// ❌ Don't make multiple separate setState calls
setGameState(prev => ({ ...prev, pp: prev.pp + 10 }));
setGameState(prev => ({ ...prev, energy: prev.energy - 5 }));  // Bad!
```

---

## 12. Documentation Requirements

### Function Documentation (JSDoc)
```javascript
/**
 * Adds experience points and handles level ups
 *
 * @param {Object} gameState - Current game state
 * @param {number} xpAmount - Amount of XP to add
 * @param {Function} addMessage - Function to add message to event log
 * @returns {Object} Updated state properties (playerLevel, playerXP, skillPoints)
 */
export const addExperience = (gameState, xpAmount, addMessage) => {
  // Implementation
};
```

### Complex Logic Comments
```javascript
// Calculate XP needed for next level using exponential curve
// Formula: baseXP * (multiplier ^ (level - 1))
const xpNeeded = Math.floor(
  LEVEL_SYSTEM.baseXP * Math.pow(LEVEL_SYSTEM.xpMultiplier, level - 1)
);

// Portal cooldown is modified by skills and upgrades
// Base: 60s, can be reduced by dimensional anchor upgrade (to 30s)
// Skills can further reduce by portalCooldownReduction value
const cooldown = getModifiedPortalCooldown(60, gameState);
```

### Achievement & Upgrade Descriptions
```javascript
// ✅ Clear, concise descriptions
{
  id: 'stapler',
  name: 'Premium Stapler',
  cost: 50,
  effect: 'ppPerClick',
  value: 2,
  desc: 'It never jams. Never.'  // Flavor text fits theme
}

{
  id: 'first_day',
  name: 'First Day',
  desc: 'Survive Day 1',  // Clear condition
  check: (state) => state.day >= 2
}
```

### README & Onboarding
- Maintain GAME_CONTEXT.md for development context
- Document major systems (skill tree, dimensional mining, etc.)
- Include examples of common patterns
- Keep this CLAUDE.md file updated

---

## 13. Common Pitfalls to Avoid

### ❌ Race Conditions
```javascript
// ❌ WRONG: Using gameState directly
setGameState({
  ...gameState,
  pp: gameState.pp + 10  // Stale value!
});

// ✅ CORRECT: Functional setState
setGameState(prev => ({
  ...prev,
  pp: prev.pp + 10
}));
```

### ❌ Direct State Mutation
```javascript
// ❌ WRONG: Mutating objects
prev.upgrades['newUpgrade'] = true;
return prev;

// ✅ CORRECT: Create new object
return {
  ...prev,
  upgrades: { ...prev.upgrades, newUpgrade: true }
};
```

### ❌ Async setState Assumptions
```javascript
// ❌ WRONG: Assuming immediate update
setGameState(prev => ({ ...prev, pp: prev.pp + 10 }));
console.log(gameState.pp);  // Still old value!

// ✅ CORRECT: Use callback or effect
setGameState(prev => {
  const newPP = prev.pp + 10;
  console.log('New PP:', newPP);
  return { ...prev, pp: newPP };
});
```

### ❌ Missing Validation
```javascript
// ❌ WRONG: No validation
const buyUpgrade = (upgrade) => {
  setGameState(prev => ({
    ...prev,
    pp: prev.pp - upgrade.cost  // Could go negative!
  }));
};

// ✅ CORRECT: Validate first
const buyUpgrade = (upgrade) => {
  setGameState(prev => {
    if (prev.pp < upgrade.cost) return prev;
    return {
      ...prev,
      pp: prev.pp - upgrade.cost
    };
  });
};
```

### ❌ Incorrect Message Array Handling
```javascript
// ❌ WRONG: Forgetting to slice
recentMessages: [newMessage, ...prev.recentMessages]  // Grows forever!

// ✅ CORRECT: Always slice to limit
recentMessages: [newMessage, ...prev.recentMessages].slice(0, 15)
```

### ❌ Not Using Action Object
```javascript
// ❌ WRONG: Creating standalone functions
export const sortPapers = (setGameState) => {
  // ...
};

// Then importing individually
import { sortPapers } from './gameActions';

// ✅ CORRECT: Use createGameActions factory
const actions = createGameActions(setGameState, addMessage, checkAchievements, grantXP);
actions.sortPapers();
```

### ❌ Incorrect Property Names
```javascript
// ❌ WRONG: Made-up property names
gameState.currentLocation  // Should be 'location'
gameState.level           // Should be 'playerLevel'
gameState.xp              // Should be 'playerXP'

// ✅ CORRECT: Use exact names from INITIAL_GAME_STATE
gameState.location
gameState.playerLevel
gameState.playerXP
```

---

## Quick Reference Checklist

When implementing new features, verify:

- [ ] Added to `INITIAL_GAME_STATE` if new property needed
- [ ] Used functional `setState` pattern
- [ ] Extracted magic numbers to named constants
- [ ] Added JSDoc comments to functions
- [ ] Used correct property names from state
- [ ] Validated inputs/costs before processing
- [ ] Added messages to event log with slice(0, 15)
- [ ] Called `grantXP()` for player actions
- [ ] Called `checkAchievements()` with 50ms delay
- [ ] Used CSS variables for colors
- [ ] Imported in correct order (React → Components → Utils → Constants)
- [ ] Tested with both light and dark themes
- [ ] Checked mobile responsiveness
- [ ] No console.log statements left in code
- [ ] Error handling for file/API operations
- [ ] Performance: used useCallback/useMemo where appropriate

---

## Version History

**v1.0** (2025-10-21) - Initial ruleset creation
- Established coding standards
- Documented state management patterns
- Created component and action templates
- Defined naming conventions
- Documented all critical patterns

---

## Contact & Contributions

For questions about these standards or suggestions for improvements:
- Update this document with new patterns as they emerge
- Document breaking changes immediately
- Keep examples current with actual codebase
- Review and update quarterly

**Remember:** Consistency is more important than perfection. Follow these rules even if you disagree with specific choices. The goal is a maintainable, bug-free codebase.

---

**END OF CLAUDE.MD**
