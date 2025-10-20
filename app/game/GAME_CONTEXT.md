# GAME CONTEXT - Office Horror Incremental Game

## ⚠️ CRITICAL: Read this file before making ANY changes to the game code

This document defines the complete structure and patterns used throughout the game. Always verify changes against this document to maintain consistency.

---

## Game State Structure (INITIAL_GAME_STATE)

**Location:** `app/game/constants.js`

```javascript
{
  // Core Resources
  pp: number,                          // Productivity Points (main currency)
  energy: number,                      // 0-100, depletes with actions
  sanity: number,                      // 0-100, affects visual distortions
  ppPerClick: number,                  // PP gained per sort action
  ppPerSecond: number,                 // Passive PP generation
  
  // Location & Time
  location: string,                    // Current location key (see LOCATIONS)
  day: number,                         // Current day number
  timeInOffice: number,                // Time spent (affects clock display)
  
  // Progression
  upgrades: object,                    // { upgradeId: true, ... }
  unlockedLocations: array,            // ['cubicle', 'breakroom', ...]
  achievements: array,                 // ['first_day', 'week_one', ...]
  
  // Game Events
  discoveredEvents: array,             // IDs of triggered random events
  recentMessages: array,               // Last 15 game messages
  phase: number,                       // 1, 2, or 3 (game progression)
  
  // Debug System
  debugMode: boolean,                  // Active debug challenge
  currentBug: object,                  // { code, correct, userCode }
  debugAttempts: number,               // Failed debug attempts
  
  // Interaction States
  restCooldown: number,                // Seconds until rest available
  strangeColleagueEvent: object,       // Active colleague dialogue
  disagreementCount: number,           // Times disagreed with colleague
  examiningItem: object,               // Archive item being viewed
  sortCount: number,                   // Total papers sorted
  examinedItems: number,               // Archive items examined
  
  // Meditation
  meditating: boolean,                 // Active meditation session
  breathCount: number,                 // Successful breaths
  
  // UI Settings
  maxLogMessages: number,              // 15 (message history limit)
  themeToggleCount: number,            // Theme switches (easter egg)
  
  // Dimensional System
  portalUnlocked: boolean,             // Portal access granted
  inDimensionalArea: boolean,          // Currently in portal
  dimensionalInventory: object,        // { materialId: count, ... }
  portalCooldown: number,              // Seconds until portal reusable
  dimensionalUpgrades: object,         // { upgradeId: true, ... }
  timeRewindUsed: boolean,             // Temporal Rewind used
  
  // Skill System
  playerLevel: number,                 // Character level
  playerXP: number,                    // Current experience points
  skillPoints: number,                 // Unspent skill points
  purchasedSkills: object,             // { skillId: level, ... }
  showSkillTree: boolean               // Skill tree modal open
}
```

---

## Constants & Data Structures

### LOCATIONS
**Type:** Object with location keys  
**Properties:** `name`, `description`, `atmosphere` (array), optional `items` (array for archive)  
**Keys:** `cubicle`, `breakroom`, `serverroom`, `managers`, `basement`, `roof`, `archive`, `portal`, `drawer`

### UPGRADES
**Type:** Array of upgrade objects  
**Properties:** `id`, `name`, `desc`, `cost`, `effect`, optional `value`  
**Effects:** `ppPerClick`, `ppPerSecond`, `maxEnergy`, `unlock`

### ACHIEVEMENTS
**Type:** Array of achievement objects  
**Properties:** `id`, `name`, `desc`, `check` (function)

### EVENTS
**Type:** Array of random event objects  
**Properties:** `id`, `prob`, `message`, `minDay`, optional `pp`/`energy`/`sanity`

### DIMENSIONAL_MATERIALS
**Type:** Array of material objects  
**Properties:** `id`, `name`, `color`, `rarity`

### SKILLS
**Type:** Object with skill IDs as keys  
**Properties:** `id`, `name`, `tree`, `tier`, `maxLevel`, `cost` (function), `minPlayerLevel`, `requires` (array), `effects` (object)

---

## Action Pattern (CRITICAL)

**ALL game actions MUST use the actions object from createGameActions():**

```javascript
const actions = createGameActions(setGameState, addMessage, checkAchievements, grantXP);
```

**Available Actions:**
- `actions.sortPapers` - Main PP generation
- `actions.rest` - Restore energy (30s cooldown)
- `actions.startMeditation` - Begin meditation minigame
- `actions.breatheAction` - Meditation interaction
- `actions.cancelMeditation` - Exit meditation
- `actions.startDebugSession` - Begin debug challenge
- `actions.submitDebug` - Submit debug solution
- `actions.updateDebugCode` - Update debug code
- `actions.cancelDebug` - Exit debug mode
- `actions.changeLocation` - Move to new location
- `actions.examineItem` - View archive item
- `actions.closeExamine` - Close item view
- `actions.respondToColleague` - Reply to strange colleague
- `actions.buyUpgrade` - Purchase upgrade
- `actions.triggerScreenEffect` - Visual effect helper

**❌ NEVER create standalone action functions**  
**✅ ALWAYS use actions.actionName**

---

## Import Structure

### From `./constants.js`
```javascript
import { 
  INITIAL_GAME_STATE, 
  LOCATIONS, 
  UPGRADES, 
  ACHIEVEMENTS, 
  EVENTS,
  STRANGE_COLLEAGUE_DIALOGUES 
} from './constants';
```

### From `./skillSystemHelpers.js`
```javascript
import { 
  addExperience,           // XP and level management
  purchaseSkill,           // Buy/upgrade skills
  getActiveSkillEffects,   // Get all active skill bonuses
  getModifiedPortalCooldown,
  getModifiedCapacity,
  applyEnergyCostReduction,
  applyPPMultiplier,
  applyMeditationBonus,
  getModifiedSanityLoss
} from './skillSystemHelpers';
```

### From `./skillTreeConstants.js`
```javascript
import { 
  XP_REWARDS,    // XP amounts for actions
  LEVEL_SYSTEM,  // Level progression
  SKILLS         // Skill definitions
} from './skillTreeConstants';
```

### From `./dimensionalConstants.js`
```javascript
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';
```

### From `./gameActions.js`
```javascript
import { createGameActions } from './gameActions';
```

### From `./saveSystem.js`
```javascript
import { 
  saveGame, 
  loadGame, 
  exportToClipboard, 
  importFromClipboard 
} from './saveSystem';
```

### From `./gameUtils.js`
```javascript
import { 
  getDistortionStyle,  // Apply sanity-based visual effects
  distortText,         // Distort text based on sanity
  getClockTime         // Format time display
} from './gameUtils';
```

---

## Component Structure

### Main Page (page.js)
**State Variables:**
- `gameState` - Main game state
- `isMobile` - Responsive layout flag
- `showSaveMenu` - Save menu visibility
- `showDebugMenu` - Debug menu visibility
- `debugMaterialId` - Debug material selector
- `debugMaterialAmount` - Debug material amount
- `debugSanityLevel` - Debug sanity setter
- `hoveredUpgrade` - Currently hovered upgrade

**Key Functions:**
- `addMessage(msg)` - Add to message log
- `grantXP(amount)` - Award experience points
- `checkAchievements()` - Check for new achievements
- `handlePurchaseSkill(skillId)` - Purchase skill
- `enterDimensionalArea()` - Enter portal
- `exitDimensionalArea()` - Exit portal with cooldown
- `purchaseDimensionalUpgrade(upgrade)` - Craft dimensional item

### Modal Components
- `SkillTreeModal` - Skill tree interface
- `MeditationModal` - Meditation minigame
- `DebugModal` - Debug challenge
- `ColleagueModal` - Strange colleague dialogue
- `ExamineModal` - Archive item viewer
- `DimensionalArea` - Portal mining area

---

## Naming Conventions

### Property Names (CRITICAL - Must Match Exactly)
- ✅ `gameState.location` (NOT currentLocation)
- ✅ `gameState.upgrades` (object, NOT purchasedUpgrades array)
- ✅ `gameState.achievements` (array, NOT unlockedAchievements)
- ✅ `gameState.purchasedSkills` (object for skills)
- ✅ `gameState.dimensionalInventory` (materials)
- ✅ `gameState.dimensionalUpgrades` (crafted items)

### Function Names
- ✅ `actions.buyUpgrade` (NOT purchaseUpgrade)
- ✅ `purchaseSkill` (for skills only)
- ✅ `purchaseDimensionalUpgrade` (for dimensional crafting)

---

## Common Patterns

### State Updates
Always use functional setState to avoid race conditions:
```javascript
setGameState(prev => ({
  ...prev,
  property: newValue,
  recentMessages: [newMessage, ...prev.recentMessages].slice(0, 15)
}));

## Skill System (Simplified)

The skill tree has **3 branches** with **4 tiers** each:

### Branches
1. **Efficiency** (📊) - PP generation, energy, meditation, upgrades
2. **Portal** (🌀) - Portal cooldown, capacity, rarity, double yield
3. **Survival** (🛡️) - Sanity resistance, health, attack, critical hits

### Progression
- Each tier requires the previous tier to be learned
- Skills can be leveled up multiple times (maxLevel varies)
- Cost: Always 1 Skill Point per level
- Skill Points earned: 1 per level, 3 every 10 levels

### Skill IDs
Format: `{branch}_{tier}` (e.g., `efficiency_1`, `portal_3`, `survival_4`)

### Using Skills
```javascript
import { SKILLS } from './skillTreeConstants';

// Get skill level
const level = gameState.skills?.efficiency_1 || 0;

// Get all active effects
const effects = getActiveSkillEffects(gameState);
// Returns: { ppMultiplier: 0.25, energyEfficiency: 0.10, ... }
```

### Message Adding
```javascript
const messages = [];
messages.push('Message text');
// Then add to state:
recentMessages: [...messages, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
```

### Achievement Checking
```javascript
grantXP(amount);
setTimeout(() => checkAchievements(), 50); // Delay to ensure state updates
```

### Skill Effects
```javascript
const effects = getActiveSkillEffects(gameState);
// Then use effects.propertyName
```

---

## File Organization

```
app/game/
├── page.js                      // Main game component
├── constants.js                 // Game data & INITIAL_GAME_STATE
├── gameActions.js               // Action creators
├── gameUtils.js                 // Utility functions
├── saveSystem.js                // Save/load logic
├── skillSystemHelpers.js        // Skill system logic
├── skillTreeConstants.js        // Skill definitions & XP
├── dimensionalConstants.js      // Dimensional materials
├── SkillTreeModal.js            // Skill tree UI
├── MeditationModal.js           // Meditation UI
├── DebugModal.js                // Debug UI
├── ColleagueModal.js            // Dialogue UI
├── ExamineModal.js              // Item viewer UI
├── DimensionalArea.js           // Portal UI
└── DimensionalUpgradesDisplay.js // Crafting UI
```

---

## Making Changes - Checklist

Before modifying ANY code:

1. ✅ Check this document for property names
2. ✅ Verify the property exists in INITIAL_GAME_STATE
3. ✅ Use actions.actionName (never create standalone actions)
4. ✅ Import from correct files
5. ✅ Use functional setState with prev =>
6. ✅ Test that new code doesn't break existing features
7. ✅ Add new properties to INITIAL_GAME_STATE if needed

---

## Example: Adding a New Feature

**Wrong Way:**
```javascript
// ❌ Creating standalone function
const newAction = () => {
  setGameState({ ...gameState, newProp: value }); // Direct state access
};

// ❌ Wrong property name
if (gameState.currentLocation === 'desk') // location doesn't exist as 'desk'
```

**Right Way:**
```javascript
// 1. Add to INITIAL_GAME_STATE in constants.js
export const INITIAL_GAME_STATE = {
  // ... existing properties
  newProp: 0,
};

// 2. Add action to gameActions.js
export const createGameActions = (...params) => {
  const newAction = () => {
    setGameState(prev => ({
      ...prev,
      newProp: prev.newProp + 1,
      recentMessages: ['Action performed', ...prev.recentMessages].slice(0, 15)
    }));
  };
  
  return {
    // ... existing actions
    newAction,
  };
};

// 3. Use in page.js
<button onClick={actions.newAction}>
  New Action
</button>
```

---

## Troubleshooting

**"Cannot read property X of undefined"**
→ Check INITIAL_GAME_STATE has the property
→ Verify property name matches exactly (case-sensitive)

**"actions.X is not a function"**
→ Check gameActions.js exports the action
→ Verify createGameActions returns the action

**State not updating**
→ Use functional setState: `prev => ({ ...prev, ... })`
→ Don't mutate state directly

**Skills not working**
→ Import purchaseSkill from './skillSystemHelpers'
→ Check SKILLS object in skillTreeConstants.js

---

## Version Info

- **Game Version:** 1.0
- **Last Updated:** 2025
- **Framework:** Next.js 15+ with React

---

**When in doubt, ALWAYS refer to this document before making changes.**