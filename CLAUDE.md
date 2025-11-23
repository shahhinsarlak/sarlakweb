# CLAUDE.md - Development Ruleset for SarlakWeb Game

**Project:** Office Horror Incremental Game
**Framework:** Next.js 15.5.6 with React 19.1.0
**Language:** JavaScript (ES6+)
**Version:** 2.1
**Last Updated:** 2025-11-19

**Major Changes in v2.1:**
- Journal system for tracking discoveries (locations, colleagues, equipment, mechanics)
- Colleague relationship system with dynamic dialogues and trust tracking
- Mystery investigation system with clues and theories
- Player path/alignment system (seeker, rationalist, protector, convert, rebel)
- Story moments for mandatory narrative beats
- File drawer document management with consume/shred mechanics
- Colleague notification and briefing screens
- Context-aware dialogue based on relationship history
- Achievement modal for viewing all achievements

**Major Changes in v2.0:**
- Combat system added with turn-based mechanics
- Loot generation system for randomized equipment
- Sanity-paper mechanics with quality system
- Help/tutorial popup system
- Document creation system (memos, reports, contracts, prophecies)
- Equipment and armory systems
- Visual feedback patterns (screen shake, particles, flashes)

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
  /game                    # Main game application
    page.js                # Main game component (UI orchestrator)

    # Constants & Data
    constants.js           # Core game data: INITIAL_GAME_STATE, LOCATIONS, UPGRADES, ACHIEVEMENTS
    skillTreeConstants.js  # Skill tree definitions and XP system
    dimensionalConstants.js  # Dimensional mining materials
    combatConstants.js     # Combat system: enemies, mechanics, balance
    equipmentConstants.js  # Weapons, armor, and equipment definitions
    lootConstants.js       # Loot tables, rarities, prefixes, imbuements

    # Core Systems
    gameActions.js         # All game action handlers (factory pattern)
    skillSystemHelpers.js  # Skill tree logic and effect calculations
    sanityPaperHelpers.js  # Sanity-paper mechanics and quality system
    lootGenerationHelpers.js  # Loot generation algorithms
    journalHelpers.js      # Journal discovery tracking and queries
    colleagueHelpers.js    # Context-aware dialogue and relationship logic
    gameUtils.js           # Utility functions (distortion, particles, effects)
    saveSystem.js          # Save/load/export/import functionality

    # UI Components
    SkillTreeModal.js      # Skill tree interface
    MeditationModal.js     # Breathing meditation minigame
    DebugModal.js          # Code debugging challenges
    DebugPanel.js          # Developer debug tools
    ColleagueModal.js      # Colleague interaction dialogs
    ColleagueBriefingModal.js  # Warning screen before colleague encounters
    StoryMomentModal.js    # Mandatory narrative beat displays
    JournalModal.js        # Discovery journal with tabs for locations/colleagues/equipment
    AchievementsModal.js   # Achievement progress viewer
    ExamineModal.js        # Archive item examination
    CombatModal.js         # Turn-based combat interface
    Armory.js              # Equipment management UI
    PrinterRoom.js         # Paper printing system UI
    FileDrawer.js          # Document storage and management (inbox-like UI)
    DimensionalArea.js     # Dimensional mining UI
    DimensionalUpgradesDisplay.js  # Dimensional upgrade shop
    HelpPopup.js           # Context-aware tutorial system
    EventLog.js            # Message log display component
    NotificationBubble.js  # Colleague encounter notifications (top-left corner)
    CrystalOpeningModal.js # Loot reveal UI

  /apps                    # Apps showcase page
  page.js                  # Home page
  layout.js                # Root layout
  globals.css              # Global styles & CSS variables

/components
  Header.js                # Navigation & theme toggle
  Footer.js                # Footer component
  CursorShadow.js          # Custom cursor effect
  ConwaysGameOfLife.js     # Easter egg component

/public                    # Static assets (images, icons)
```

### Core Principles
1. **Separation of Concerns**: UI in components, logic in helpers, data in constants
2. **Single Source of Truth**: All game state lives in `INITIAL_GAME_STATE`
3. **Functional Programming**: Immutable state updates, pure functions where possible
4. **Event-Driven Architecture**: No game loop - actions trigger updates
5. **Modal-Based UI**: Complex interactions happen in dedicated modal components
6. **No Emojis**: Never use emojis in the game UI or code. This is a text-based horror game with minimalist aesthetics - emojis break immersion and tone
7. **Cascading Changes**: When modifying any game system, ALWAYS update ALL related documentation, help popups, journal entries, and UI displays. Changes must propagate throughout the entire codebase

### CRITICAL: Cascading Change Checklist
When making changes to ANY game system, you MUST verify and update ALL of the following:

**For System Changes (e.g., Skill Tree, Combat, Documents):**
- [ ] Core implementation files (constants, helpers, modals)
- [ ] Related help popups in `constants.js` → `HELP_POPUPS`
- [ ] Journal mechanic entries in `constants.js` → `MECHANICS_ENTRIES`
- [ ] UI displays showing affected values (resources panel, stats, etc.)
- [ ] Action handlers that use the system (`gameActions.js`)
- [ ] Achievement conditions that reference the system
- [ ] Tutorial/onboarding text

**For Stat/Value Changes (e.g., PP, Energy, Skills):**
- [ ] Calculation functions (e.g., `calculateEffectivePPPerClick`)
- [ ] Display components showing the value
- [ ] Breakdown/tooltip displays explaining the value
- [ ] Helper functions that modify the value
- [ ] Action handlers that generate/consume the value

**For UI Changes (e.g., New Modals, Redesigns):**
- [ ] Modal component implementation
- [ ] Button/trigger to open the modal
- [ ] Close/cancel functionality
- [ ] State management for modal visibility
- [ ] Related help popup explaining the feature
- [ ] Journal entry documenting the mechanic

**Examples of Cascading Changes:**
```
Example 1: Redesigning Skill Tree
✅ CORRECT Approach:
1. Update skillTreeConstants.js with new branches
2. Redesign SkillTreeModal.js UI
3. Update skillSystemHelpers.js effect calculations
4. Update HELP_POPUPS.skillTree in constants.js
5. Update MECHANICS_ENTRIES.skillTree in constants.js
6. Update PP/click and PP/sec displays to show new bonuses
7. Test all skill effects are working

❌ WRONG Approach:
1. Only update skillTreeConstants.js and SkillTreeModal.js
2. Forget to update help popups (users see outdated info)
3. Forget to update skill bonus displays (users can't see effects)

Example 2: Adding New Stat Type
✅ CORRECT Approach:
1. Add to INITIAL_GAME_STATE
2. Create calculation helper functions
3. Add UI display in resources panel
4. Add breakdown/tooltip showing components
5. Create help popup explaining the stat
6. Add journal mechanic entry
7. Update any actions that modify the stat

❌ WRONG Approach:
1. Add to INITIAL_GAME_STATE
2. Add basic display
3. Forget helper functions (direct math in multiple places)
4. Forget documentation (users confused)
```

**Failure to follow cascading changes results in:**
- Inconsistent user experience
- Outdated documentation/tutorials
- Hidden or unclear game mechanics
- Broken displays showing incorrect values
- User frustration and confusion

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

// ❌ NEVER: Use emojis in code or UI
// This is a minimalist horror game - emojis break immersion
const message = '⚠️ Warning';  // WRONG
const message = 'Warning';     // CORRECT
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

// Collections (Objects, NOT Arrays unless specified)
gameState.upgrades        // { upgradeId: true }
gameState.printerUpgrades // { upgradeId: true }
gameState.dimensionalUpgrades  // { upgradeId: true }
gameState.dimensionalInventory // { materialId: count }
gameState.achievements    // Array of achievement IDs
gameState.unlockedLocations    // Array of location IDs
gameState.discoveredEvents     // Array of event IDs

// Flags & Counters
gameState.sortCount       // Number of times papers sorted
gameState.printCount      // Number of prints
gameState.disagreementCount  // Colleague disagreements
gameState.examinedItems   // Items examined in archive
gameState.themeToggleCount   // Theme toggle easter egg
gameState.combatVictories // Number of combat wins

// UI State
gameState.recentMessages  // Array of recent event log messages
gameState.showSkillTree   // Boolean flag
gameState.meditating      // Boolean flag
gameState.examiningItem   // Item object or null
gameState.inDimensionalArea  // Boolean flag
gameState.inPrinterRoom   // Boolean flag
gameState.inArmory        // Boolean flag
gameState.inCombat        // Boolean flag

// Cooldowns (in seconds)
gameState.restCooldown    // Rest action cooldown
gameState.portalCooldown  // Portal entry cooldown

// Per-Action Values
gameState.ppPerClick      // PP gained per sort action
gameState.ppPerSecond     // Passive PP generation
gameState.paperPerPrint   // Paper per print action
gameState.paperPerSecond  // Passive paper generation
gameState.printerQuality  // 0-100 quality percentage (printer upgrades only)
gameState.paperQuality    // 0-100 quality (70% printer, 30% sanity)

// Paper & Document System (Added 2025-10-26)
gameState.documents       // Object: { memos: 0, reports: 0, contracts: 0, prophecies: 0 }
gameState.activeReportBuffs  // Array of active buff objects with expiresAt timestamps
gameState.paperTrail      // Array tracking paper creation patterns (for secrets)

// Help System (Added 2025-10-26)
gameState.helpEnabled     // Boolean: Can be toggled by player
gameState.shownHelpPopups // Array of popup IDs that have been shown
gameState.currentHelpPopup // Object or null: { id, title, content }
gameState.meditationUnlocked  // Boolean: Meditation appears at <= 25% sanity

// Combat System (Added 2025-10-23)
gameState.currentEnemy    // Object or null: current enemy data
gameState.playerCombatHP  // Number: player HP during combat
gameState.combatLog       // Array of combat message objects
gameState.isPlayerTurn    // Boolean: whose turn it is
gameState.combatEnded     // Boolean: combat finished flag

// Equipment System (Added 2025-10-23)
gameState.equippedWeapon  // String: legacy weapon ID (for old system)
gameState.equippedArmor   // Object: { head: 'id', chest: 'id', accessory: 'id' }
gameState.equippedAnomalies  // Array of up to 3 anomaly IDs

// Loot System (Added 2025-10-23)
gameState.lootInventory   // Array of generated loot item objects
gameState.equippedLootWeapon  // String or null: ID of equipped loot weapon
gameState.equippedLootArmor   // Object: { head: null, chest: null, accessory: null }
gameState.equippedLootAnomalies  // Array of equipped loot anomaly IDs (max 3)

// Special Mechanics
gameState.strangeColleagueEvent  // Object or null: current colleague dialog
gameState.pendingColleagueEncounter  // Object or null: briefing screen before colleague interaction
gameState.colleagueNotification  // Object or null: { message, colleagueId, encounterId }
gameState.completedColleagueEncounters  // Array: completed encounter IDs
gameState.debugMode       // Boolean: debug challenge active
gameState.currentBug      // Object or null: current debug challenge
gameState.debugAttempts   // Number: attempts on current bug
gameState.breathCount     // Number: meditation breath counter
gameState.portalUnlocked  // Boolean: portal access flag
gameState.printerUnlocked // Boolean: printer room access
gameState.timeRewindUsed  // Boolean: temporal rewind used today flag
gameState.voidClauseActive  // Boolean: void contract buff active
gameState.voidClauseExpires  // Number: timestamp when void clause expires

// Colleague Relationship System (Added 2025-10-29)
gameState.colleagueRelationships  // Object: { colleagueId: { trust, encounters, lastResponseType } }
gameState.disagreementCount  // Number: total disagreements with colleagues
gameState.colleagueResponseCount  // Number: total responses (for archive unlock)

// Mystery & Path System (Added 2025-11-05)
gameState.mysteryProgress  // Number 0-100: how much truth has been uncovered
gameState.playerPath      // String or null: dominant path (seeker, rationalist, protector, convert, rebel)
gameState.pathScores      // Object: { seeker, rationalist, protector, convert, rebel }
gameState.investigation   // Object: { clues: [], theories: [] }

// Story Moments System (Added 2025-11-05)
gameState.completedStoryMoments  // Array: story moment IDs that have been seen
gameState.pendingStoryMoment  // Object or null: current forced story encounter

// Journal System (Added 2025-10-31, Revised 2025-11-01)
gameState.journalOpen     // Boolean: is journal UI visible
gameState.journalTab      // String: current tab (locations, colleagues, equipment, mechanics)
gameState.discoveredLocations  // Array: location IDs that have been visited
gameState.discoveredColleagues  // Array: colleague IDs that have been met
gameState.discoveredBaseWeapons  // Array: base weapon type IDs found
gameState.discoveredBaseArmor  // Array: base armor type IDs found
gameState.discoveredBaseAnomalies  // Array: base anomaly type IDs found
gameState.discoveredMechanics  // Array: mechanic IDs learned from help popups

// File Drawer System (Redesigned 2025-11-04)
gameState.storedDocuments  // Array: document objects with { id, type, tier, quality, outcome, createdAt, important }
gameState.fileDrawerOpen  // Boolean: is file drawer UI visible
gameState.documentSortBy  // String: sort order (newest, oldest, quality, type)
gameState.documentMastery  // Object: { memos: 0, reports: 0, contracts: 0, prophecies: 0 }

// Debug Flags (Development Only)
gameState.debugForceTearSpawn  // Boolean: Force 100% dimensional tear spawn rate
gameState.maxLogMessages  // Number: Max messages in event log (default 15)
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
// 1. Initial game state (ALWAYS FIRST)
export const INITIAL_GAME_STATE = { ... };

// 2. Dialogue & Interaction Data
export const STRANGE_COLLEAGUE_DIALOGUES = [ ... ];  // ASCII art + dialogue trees with relationship tracking
export const DEBUG_CHALLENGES = [ ... ];              // Code debugging puzzles

// 3. Location Data
export const LOCATIONS = { ... };  // Office locations with atmosphere arrays

// 4. Upgrade & Progression Data
export const UPGRADES = [ ... ];            // Core PP/energy upgrades
export const PRINTER_UPGRADES = [ ... ];    // Printer system upgrades
export const DIMENSIONAL_UPGRADES = [ ... ]; // Portal/dimensional upgrades

// 5. Event & Achievement Data
export const EVENTS = [ ... ];        // Random events with probabilities
export const ACHIEVEMENTS = [ ... ];  // Achievement definitions with check functions

// 6. Document System Data (Added 2025-10-26, Revised 2025-11-04)
export const DOCUMENT_TYPES = { ... };  // Memos, reports, contracts, prophecies
export const SANITY_TIERS = { ... };    // Sanity level tiers with modifiers

// 7. Help System Data (Added 2025-10-26)
export const HELP_POPUPS = { ... };    // Tutorial popup content
export const HELP_TRIGGERS = { ... };  // Conditions for showing help popups

// 8. Journal System Data (Added 2025-10-31)
export const JOURNAL_ENTRIES = { ... };    // Lore entries for locations, colleagues, equipment
export const MECHANICS_ENTRIES = { ... };  // Mechanic explanations for journal
```

### Other Constants Files Structure
```javascript
// skillTreeConstants.js
export const LEVEL_SYSTEM = { ... };  // XP curve and leveling rules
export const SKILLS = { ... };        // Skill definitions by ID
export const XP_REWARDS = { ... };    // XP amounts for different actions

// combatConstants.js
export const ENEMY_ARCHETYPES = { ... };  // Base enemy types
export const ENEMY_PREFIXES = { ... };    // Enemy modifiers by level
export const COMBAT_MECHANICS = { ... };  // Combat rules and balance

// equipmentConstants.js
export const WEAPONS = { ... };     // Weapon definitions
export const ARMOR = { ... };       // Armor definitions
export const ANOMALIES = { ... };   // Anomaly/accessory definitions
export const RARITY = { ... };      // Rarity tiers for loot

// lootConstants.js
export const BASE_LOOT_ITEMS = { ... };     // Base loot templates
export const LOOT_PREFIXES = { ... };       // Prefix modifiers
export const VOID_IMBUEMENTS = { ... };     // Special loot effects
export const LOOT_DROP_RATES = { ... };     // Rarity drop chances
export const IMBUEMENT_COUNTS = { ... };    // Imbuements by rarity

// dimensionalConstants.js
export const DIMENSIONAL_MATERIALS = { ... };  // Material definitions
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

// 3. Local components (alphabetically by type)
// Shared components
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Game modals & UI
import SkillTreeModal from './SkillTreeModal';
import MeditationModal from './MeditationModal';
import CombatModal from './CombatModal';
import Armory from './Armory';
import PrinterRoom from './PrinterRoom';
import HelpPopup from './HelpPopup';
// ... other modals

// 4. Local utilities & helpers (alphabetically)
import { createGameActions } from './gameActions';
import { getDistortionStyle, distortText, createLevelUpParticles } from './gameUtils';
import { saveGame, loadGame, exportToClipboard } from './saveSystem';
import { addExperience, purchaseSkill, getActiveSkillEffects } from './skillSystemHelpers';
import { getSanityTier, applySanityPPModifier } from './sanityPaperHelpers';
import { generateLootItem } from './lootGenerationHelpers';
import { generateEnemy, getPlayerCombatStats } from './combatConstants';

// 5. Constants (last, alphabetically by file)
import { INITIAL_GAME_STATE, LOCATIONS, UPGRADES, ACHIEVEMENTS } from './constants';
import { SKILLS, LEVEL_SYSTEM, XP_REWARDS } from './skillTreeConstants';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';
import { ENEMY_ARCHETYPES, COMBAT_MECHANICS } from './combatConstants';
import { WEAPONS, ARMOR, RARITY } from './equipmentConstants';
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

### Combat System Pattern (Added 2025-10-23)
```javascript
// Turn-based combat state machine
const startCombat = () => {
  setGameState(prev => {
    const enemy = generateEnemy(prev.playerLevel || 1);
    const playerStats = getPlayerCombatStats(prev);

    return {
      ...prev,
      inCombat: true,
      currentEnemy: enemy,
      playerCombatHP: playerStats.maxHP,
      combatLog: [],
      isPlayerTurn: true,
      combatEnded: false,
      strangeColleagueEvent: null // Clear colleague event
    };
  });
};

// Enemy generation uses level scaling
const enemy = generateEnemy(playerLevel);
// Returns: { displayName, currentHP, maxHP, damage, ppReward, xpReward }

// Player stats calculated from equipment
const playerStats = getPlayerCombatStats(gameState);
// Returns: { maxHP, damage, defense, critChance, critMultiplier }

// Combat actions update log and handle turn switching
const playerAttack = () => {
  setGameState(prev => {
    // Calculate damage with crit chance
    // Update enemy HP
    // Add to combat log
    // Check for victory/defeat
    // Switch turns
  });
};
```

### Loot Generation Pattern (Added 2025-10-23)
```javascript
// Loot items are generated with random stats
import { generateLootItem } from './lootGenerationHelpers';

const lootItem = generateLootItem('weapon', playerLevel);
// Returns object with: { id, name, type, rarity, stats, prefix, imbuements }

// Rarity affects stat ranges and imbuement count
// Common: 1 imbuement, 80-100% base stats
// Uncommon: 1 imbuement, 100-120% base stats
// Rare: 2 imbuements, 120-150% base stats
// Epic: 2 imbuements, 150-200% base stats
// Legendary: 3 imbuements, 200-300% base stats
// Mythic: 4 imbuements, 300-500% base stats

// Loot is stored in lootInventory array
setGameState(prev => ({
  ...prev,
  lootInventory: [...prev.lootInventory, newLootItem]
}));

// Equipped loot IDs reference inventory items
gameState.equippedLootWeapon  // Item ID from lootInventory
gameState.equippedLootArmor.head  // Item ID from lootInventory
```

### Sanity-Paper System Pattern (Added 2025-10-26)
```javascript
// Sanity tiers modify PP/XP gains
import { getSanityTier, applySanityPPModifier } from './sanityPaperHelpers';

const tier = getSanityTier(gameState.sanity);
// Returns: { name, ppMultiplier, xpMultiplier, effects, color }

// High sanity (80-100): 1.0x multiplier - safe but slow
// Medium sanity (40-79): 1.15x multiplier - normal gameplay
// Low sanity (10-39): 1.35x multiplier - risk vs reward
// Critical sanity (0-9): 1.5x multiplier - maximum chaos

// Paper quality depends on both printer and sanity
const paperQuality = calculatePaperQuality(gameState);
// Formula: (printerQuality * 0.7) + (sanity * 0.3)
// At critical sanity, weights shift to 50/50

// Document printing requires minimum quality
const checkResult = canPrintDocument('contract', gameState);
if (!checkResult.canPrint) {
  return { reason: checkResult.reason };
}

// Report buffs are timed effects stored in activeReportBuffs
const buff = {
  id: 'efficiency',
  name: 'Efficiency Report',
  ppMult: 1.15,
  expiresAt: Date.now() + (300 * 1000)  // 5 minutes
};
```

### Screen Effects Pattern (Added 2025-10-26)
```javascript
// Visual feedback for dramatic moments
const triggerScreenEffect = (effectType) => {
  if (effectType === 'flash') {
    // White flash for major events
  } else if (effectType === 'shake') {
    // Screen shake for reality breaks
  }
  // Creates temporary DOM overlay with animation
};

// Particle effects for level ups and skill purchases
import { createLevelUpParticles, createSkillPurchaseParticles } from './gameUtils';

setTimeout(() => {
  createLevelUpParticles();  // Celebration particles
}, 100);
```

### Help System Pattern (Added 2025-10-26)
```javascript
// Context-aware help popups with trigger conditions
import { HELP_POPUPS, HELP_TRIGGERS } from './constants';

// Triggers check game state changes
export const HELP_TRIGGERS = {
  welcome: (state, prevState) => state.sortCount === 1 && !prevState,
  lowSanity: (state, prevState) =>
    state.sanity <= 25 && (!prevState || prevState.sanity > 25),
  // ... more triggers
};

// Help popups displayed once per ID
if (!gameState.shownHelpPopups.includes(popupId)) {
  setGameState(prev => ({
    ...prev,
    currentHelpPopup: HELP_POPUPS[popupId],
    shownHelpPopups: [...prev.shownHelpPopups, popupId]
  }));
}
```

### Journal Discovery Pattern (Added 2025-10-31)
```javascript
// Track discoveries automatically when player encounters them
import { discoverLocation, discoverColleague, discoverEquipment } from './journalHelpers';

// Location discovery when changing locations
const changeLocation = (locationId) => {
  setGameState(prev => ({
    ...prev,
    location: locationId,
    discoveredLocations: discoverLocation(prev, locationId)
  }));
};

// Colleague discovery on first encounter
const encounterColleague = (colleagueId) => {
  setGameState(prev => ({
    ...prev,
    discoveredColleagues: discoverColleague(prev, colleagueId)
  }));
};

// Equipment discovery when looting items
const lootItem = (item) => {
  const baseId = extractBaseEquipmentId(item);
  const discoveryArray = item.type === 'weapon'
    ? 'discoveredBaseWeapons'
    : item.slot === 'anomaly' ? 'discoveredBaseAnomalies' : 'discoveredBaseArmor';

  setGameState(prev => ({
    ...prev,
    [discoveryArray]: prev[discoveryArray].includes(baseId)
      ? prev[discoveryArray]
      : [...prev[discoveryArray], baseId]
  }));
};

// Journal tabs: locations, colleagues, equipment, mechanics
// Player can view lore, relationship status, and learned mechanics
```

### Colleague Relationship Pattern (Added 2025-10-29)
```javascript
// Dynamic dialogue based on relationship history
import { getColleagueDialogue, getAvailableResponses } from './colleagueHelpers';

// Get context-aware dialogue
const colleague = STRANGE_COLLEAGUE_DIALOGUES.find(c => c.id === colleagueId);
const relationship = gameState.colleagueRelationships[colleagueId];
const dialogue = getColleagueDialogue(colleague, relationship);

// Response options filtered by game state (sanity, equipment, documents, etc.)
const responses = getAvailableResponses(colleague, gameState);

// Process response and update relationship
const respondToColleague = (responseOption) => {
  setGameState(prev => {
    const outcome = responseOption.outcome;
    const relationship = prev.colleagueRelationships[colleagueId];

    return {
      ...prev,
      colleagueRelationships: {
        ...prev.colleagueRelationships,
        [colleagueId]: {
          trust: relationship.trust + (outcome.trust || 0),
          encounters: relationship.encounters + 1,
          lastResponseType: responseOption.type
        }
      },
      // Apply outcome effects (pp, xp, sanity, clues, etc.)
      pp: prev.pp + (outcome.pp || 0),
      sanity: Math.max(0, Math.min(100, prev.sanity + (outcome.sanity || 0))),
      mysteryProgress: prev.mysteryProgress + (outcome.mysteryProgress || 0),
      pathScores: {
        ...prev.pathScores,
        [outcome.pathScore]: prev.pathScores[outcome.pathScore] + 1
      },
      // Add clue if provided
      investigation: outcome.clue ? {
        ...prev.investigation,
        clues: [...prev.investigation.clues, {
          ...outcome.clue,
          collectedOn: Date.now()
        }]
      } : prev.investigation
    };
  });

  // Grant XP
  if (outcome.xp) grantXP(outcome.xp);
};
```

### Story Moments Pattern (Added 2025-11-05)
```javascript
// Forced narrative encounters that override normal colleague events
// Story moments trigger at specific conditions (day, mystery progress, etc.)

// Check for pending story moments
const checkStoryMoments = () => {
  const storyMoment = STORY_MOMENTS.find(sm =>
    !gameState.completedStoryMoments.includes(sm.id) &&
    sm.trigger(gameState)
  );

  if (storyMoment) {
    setGameState(prev => ({
      ...prev,
      pendingStoryMoment: storyMoment,
      strangeColleagueEvent: null  // Clear normal colleague event
    }));
  }
};

// Complete story moment
const completeStoryMoment = (momentId) => {
  setGameState(prev => ({
    ...prev,
    completedStoryMoments: [...prev.completedStoryMoments, momentId],
    pendingStoryMoment: null
  }));
};

// Story moments are displayed in StoryMomentModal with dramatic presentation
// They cannot be avoided and ensure key narrative beats are experienced
```

### File Drawer Pattern (Added 2025-11-04)
```javascript
// Document storage and management system
// Documents are stored in storedDocuments array and can be consumed or shredded

// Store a document
const storeDocument = (document) => {
  const storedDoc = {
    id: generateId(),
    type: document.type,
    tier: document.tier,
    quality: document.quality,
    outcome: document.outcome,
    createdAt: Date.now(),
    important: false
  };

  setGameState(prev => ({
    ...prev,
    storedDocuments: [...prev.storedDocuments, storedDoc]
  }));
};

// Consume a document (apply its effects)
const consumeDocument = (documentId) => {
  setGameState(prev => {
    const doc = prev.storedDocuments.find(d => d.id === documentId);
    if (!doc) return prev;

    // Apply document effects based on type and tier
    const newState = {
      ...prev,
      storedDocuments: prev.storedDocuments.filter(d => d.id !== documentId)
    };

    // Reports create timed buffs
    if (doc.type === 'report') {
      newState.activeReportBuffs = [
        ...prev.activeReportBuffs,
        {
          id: doc.outcome.id,
          name: doc.outcome.name,
          ppMult: doc.outcome.ppMult,
          expiresAt: Date.now() + (doc.outcome.duration * 1000)
        }
      ];
    }

    return newState;
  });
};

// Shred a document (recover some paper)
const shredDocument = (documentId) => {
  setGameState(prev => {
    const doc = prev.storedDocuments.find(d => d.id === documentId);
    const paperReturn = calculateShredValue(doc);

    return {
      ...prev,
      storedDocuments: prev.storedDocuments.filter(d => d.id !== documentId),
      paper: prev.paper + paperReturn
    };
  });
};

// Sort documents (newest, oldest, quality, type)
// Important documents always appear first
```

### Mystery & Path Tracking Pattern (Added 2025-11-05)
```javascript
// Track player's investigation progress and narrative alignment

// Collect clues from colleague encounters, events, and discoveries
const addClue = (clue) => {
  setGameState(prev => ({
    ...prev,
    investigation: {
      ...prev.investigation,
      clues: [...prev.investigation.clues, {
        ...clue,
        collectedOn: Date.now()
      }]
    }
  }));
};

// Path scores determine player's alignment and ending
// Paths: seeker, rationalist, protector, convert, rebel
const updatePathScore = (pathType, points = 1) => {
  setGameState(prev => ({
    ...prev,
    pathScores: {
      ...prev.pathScores,
      [pathType]: prev.pathScores[pathType] + points
    }
  }));
};

// Determine dominant path
const getDominantPath = (pathScores) => {
  const entries = Object.entries(pathScores);
  const [dominantPath] = entries.reduce((max, entry) =>
    entry[1] > max[1] ? entry : max
  );
  return dominantPath;
};

// Mystery progress unlocks new story moments and endings
// Progress increases through clue collection and key discoveries
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

**State Management:**
- [ ] Added to `INITIAL_GAME_STATE` if new property needed
- [ ] Used functional `setState` pattern
- [ ] Used correct property names from state
- [ ] Validated inputs/costs before processing
- [ ] No direct state mutations (always spread objects/arrays)

**Game Logic:**
- [ ] Extracted magic numbers to named constants
- [ ] Added JSDoc comments to functions
- [ ] Added messages to event log with slice(0, 15)
- [ ] Called `grantXP()` for player actions
- [ ] Called `checkAchievements()` with 50ms delay
- [ ] Used setTimeout for side effects (XP, achievements)

**New Systems (if applicable):**
- [ ] Combat: Used turn-based state machine pattern
- [ ] Loot: Generated items stored in lootInventory array
- [ ] Sanity: Applied tier modifiers to PP/XP
- [ ] Paper Quality: Calculated with 70/30 printer/sanity split
- [ ] Buffs: Used expiresAt timestamps for timed effects
- [ ] Help: Added trigger condition to HELP_TRIGGERS
- [ ] Journal: Tracked discoveries in discovered* arrays
- [ ] Colleague Relationships: Updated trust, encounters, lastResponseType
- [ ] Mystery/Path: Added clues to investigation, updated pathScores
- [ ] Story Moments: Checked completedStoryMoments, set pendingStoryMoment
- [ ] File Drawer: Stored documents with createdAt timestamps
- [ ] Notifications: Used colleagueNotification for persistent alerts

**UI & Styling:**
- [ ] Used CSS variables for all colors
- [ ] Applied monospace font stack to all game UI
- [ ] Imported in correct order (React → Components → Utils → Constants)
- [ ] Tested with both light and dark themes
- [ ] Checked mobile responsiveness

**Code Quality:**
- [ ] No console.log statements left in code
- [ ] Error handling for file/API operations
- [ ] Performance: used useCallback/useMemo where appropriate
- [ ] File header comments present
- [ ] No nested ternaries or deeply nested conditionals

---

## Version History

**v2.1** (2025-11-19) - Narrative & Discovery Systems Update
- **Journal system**: Comprehensive discovery tracking for locations, colleagues, equipment, and mechanics
- **Colleague relationship system**: Dynamic trust tracking, repeat encounter dialogues, context-aware responses
- **Mystery investigation system**: Clue collection, theory building, and truth uncovering mechanics
- **Player path system**: Five alignment paths (seeker, rationalist, protector, convert, rebel) affecting endings
- **Story moments**: Mandatory narrative beats that trigger at key progression points
- **File drawer redesign**: Document storage with consume/shred mechanics, sorting, and importance flags
- **Colleague notifications**: Persistent notification system for upcoming encounters
- **Colleague briefing**: Warning screens before encounters with approach/walk away options
- **Achievement modal**: Dedicated UI for viewing all achievements (locked and unlocked)
- **New helper files**: journalHelpers.js and colleagueHelpers.js
- **New components**: JournalModal, StoryMomentModal, FileDrawer, AchievementsModal, ColleagueBriefingModal, NotificationBubble
- **State expansion**: Added 20+ new state properties for tracking discoveries, relationships, and narrative progress
- **Constants additions**: JOURNAL_ENTRIES and MECHANICS_ENTRIES for lore content
- **Enhanced colleague data**: firstEncounterDialogue, repeatDialogues, and outcome-based clue system
- **Pattern documentation**: Added 5 new game logic patterns for new systems

**v2.0** (2025-10-28) - Major Systems Update
- **Complete file structure audit**: Added 15+ new files to documentation
- **Comprehensive state properties**: Documented 60+ game state properties
- **Combat system**: Turn-based combat with enemy generation and equipment stats
- **Loot system**: Randomized loot generation with rarities, prefixes, and imbuements
- **Sanity-paper mechanics**: Multi-tier sanity system affecting PP/XP gains
- **Paper quality system**: Dynamic quality calculation (70% printer, 30% sanity)
- **Document system**: Memos, reports, contracts, and prophecies
- **Help system**: Context-aware tutorial popups with trigger conditions
- **Visual feedback**: Screen effects (shake, flash) and particle systems
- **Equipment system**: Weapons, armor, and anomalies with stat calculations
- **Buff/debuff system**: Timed effects with expiration timestamps
- **Updated constants organization**: Better categorization across 6 files
- **New helper patterns**: sanityPaperHelpers.js and lootGenerationHelpers.js
- **Enhanced checklist**: Added system-specific verification steps

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
