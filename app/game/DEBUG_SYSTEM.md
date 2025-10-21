# Debug System Documentation

**Version:** 2.0
**Last Updated:** 2025-10-21
**Component:** `DebugPanel.js`

---

## Overview

The comprehensive debug system provides thorough testing and debugging capabilities for the Office Horror Incremental Game. It features a tabbed interface with categorized controls for all game aspects.

## Access

Click the `🛠 DEBUG` button in the top-right corner of the game interface (green button with 0.5 opacity).

---

## Features by Tab

### 1. RESOURCES Tab

Control all core game resources with precision.

**Features:**
- **PP (Productivity Points)**
  - Set to specific value
  - Quick add: +1K, +10K, +100K

- **Paper**
  - Set to specific value
  - Quick add: +100, +1K, +10K

- **Energy**
  - Set to specific value (0-120)
  - Restore to 100
  - Max at 120

- **Sanity**
  - Set to specific value (0-100)
  - Quick set: LOW (10), MED (50), MAX (100)

**Use Cases:**
- Test upgrade affordability
- Test low sanity effects (visual distortion, glitch messages)
- Test energy depletion mechanics
- Test paper-based printer upgrades

---

### 2. PROGRESSION Tab

Control player advancement and experience.

**Features:**
- **Day / Time**
  - Set specific day
  - Quick add: +1 DAY, +1 WEEK, +1 MONTH
  - Automatically adjusts `timeInOffice`

- **Player Level**
  - Set specific level (1-100)
  - Quick set: LVL 10, LVL 25, LVL 50
  - Resets XP to 0 when setting level

- **Experience Points**
  - Set specific XP amount
  - Quick add: +100 XP, +1000 XP

- **Skill Points**
  - Set specific skill point amount
  - Quick add: +5 SP, +20 SP
  - MAX ALL: Sets all skills to max level

**Use Cases:**
- Test level-up mechanics
- Test skill tree progression
- Test day-gated events
- Test XP reward calculations

---

### 3. UNLOCKS Tab

Unlock locations, upgrades, and achievements instantly.

**Features:**
- **Locations**
  - Unlock all locations at once
  - Shows current unlocked locations

- **Upgrades**
  - Unlock all standard upgrades
  - Unlock all printer upgrades
  - Unlock all dimensional upgrades
  - Unlock printer room specifically
  - Shows counts: Upgrades | Printer | Dimensional

- **Achievements**
  - Unlock all achievements
  - Shows current count vs. total

- **Quick Unlocks**
  - Portal (sets `portalUnlocked` and adds to locations)
  - Archive (adds to locations)
  - Bottom Drawer (adds to locations)
  - Debug Mode (enables debug challenges)

**Use Cases:**
- Test late-game content
- Test achievement unlock messages
- Test location-specific mechanics
- Test upgrade interactions

---

### 4. MATERIALS Tab

Manage dimensional materials inventory.

**Features:**
- **Add Materials**
  - Select from dropdown (shows name and rarity)
  - Enter amount
  - Add to inventory

- **Quick Actions**
  - MAX ALL MATERIALS: Sets all to 999
  - COMMON (50): Sets void_fragment, static_crystal, glitch_shard, reality_dust to 50
  - RARE MATERIALS: Adds 10 temporal_core, 5 dimensional_essence, 3 singularity_node

- **Current Inventory**
  - Scrollable list of all materials
  - Shows material name and count
  - Only displays materials with count > 0

**Use Cases:**
- Test dimensional upgrade crafting
- Test material rarity balance
- Test inventory capacity limits
- Test material collection UI

---

### 5. PRESETS Tab

Load pre-configured game states for testing specific scenarios.

**Game State Presets:**

1. **EARLY GAME (Day 3, Level 3)**
   - PP: 500
   - Paper: 50
   - Energy: 100, Sanity: 90
   - Skill Points: 2
   - Upgrades: stapler, coffee
   - Location: cubicle only

2. **MID GAME (Day 10, Level 10)**
   - PP: 5,000
   - Paper: 500
   - Energy: 100, Sanity: 70
   - Skill Points: 5
   - Upgrades: stapler, coffee, keyboard, debugger, energydrink
   - Locations: cubicle, archive
   - Printer unlocked

3. **LATE GAME (Day 30, Level 25)**
   - PP: 50,000
   - Paper: 5,000
   - Energy: 100, Sanity: 50
   - Skill Points: 15
   - Portal unlocked
   - Locations: cubicle, archive, portal
   - Dimensional materials: 30 void, 25 crystal, 20 glitch, 15 reality, 5 temporal

4. **END GAME (Day 60, Level 50)**
   - PP: 100,000
   - Paper: 10,000
   - Energy: 100, Sanity: 30
   - Skill Points: 30
   - All locations unlocked
   - Full dimensional inventory including 5 essence, 2 singularity

**Feature Testing Presets:**

5. **TEST PORTAL (Day 7, Portal Ready)**
   - PP: 10,000
   - Energy: 100, Sanity: 80
   - Portal unlocked with no cooldown
   - Dimensional upgrades: anchor, scanner

6. **TEST PRINTER (Printer Unlocked)**
   - PP: 5,000
   - Paper: 1,000
   - Energy: 100, Sanity: 90
   - Printer quality: 50%
   - Paper per print: 5
   - Paper per second: 2

**State Management:**
- **EXPORT STATE TO CLIPBOARD**: Copies entire `gameState` as JSON for custom presets

**Use Cases:**
- Quick access to different game phases
- Test feature progression
- Test balancing at different stages
- Create custom test scenarios (export state)

---

### 6. UTILITIES Tab

Miscellaneous tools and triggers.

**Features:**

**Cooldowns**
- Reset all cooldowns (rest, portal)
- Shows current cooldown values

**Restore All**
- Full restore: Energy to 100, Sanity to 100, all cooldowns to 0

**Events & Triggers**
- Trigger random event (from EVENTS array)
- Clear colleague event (dismisses strange colleague modal)

**Counters & Flags**
- Set counters to specific values:
  - Sort Count: 100
  - Print Count: 100
  - Disagreement Count: 20
  - Examined Items: 7
  - Theme Toggle Count: 20
  - Breath Count: 20

**Printer Settings**
- Set printer quality: 50% or 100%
- Set paper per print: 10
- Set paper per second: 5

**Use Cases:**
- Test event system
- Test achievement triggers (many require specific counts)
- Test cooldown mechanics
- Test printer quality effects on output

---

## Quick Debug Buttons (Always Visible)

Outside the debug panel, two quick debug buttons are available:

1. **+100K PP** (Magenta border)
   - Instantly adds 100,000 PP
   - Quick resource injection for testing

2. **+1 DAY** (Cyan border)
   - Advances day by 1
   - Adjusts `timeInOffice` to match

---

## Technical Details

### Component Structure

```javascript
<DebugPanel
  gameState={gameState}
  setGameState={setGameState}
  addMessage={addMessage}
  onClose={() => setShowDebugPanel(false)}
/>
```

### State Management

All debug actions use functional `setState` pattern:

```javascript
setGameState(prev => ({
  ...prev,
  [property]: newValue
}));
```

### Styling

- **Theme-aware**: Uses CSS variables (`var(--bg-color)`, `var(--text-color)`)
- **Monospace font**: Consistent with game aesthetic
- **Green accent**: `#00ff00` for debug theming
- **High z-index**: `2000` to overlay all other modals
- **Responsive**: Works on mobile and desktop

---

## Best Practices

### For Testing

1. **Start with Presets**: Use presets to quickly access game states
2. **Export States**: Export successful test states for reuse
3. **Incremental Testing**: Test one feature at a time
4. **Resource Balance**: Use Resources tab to test edge cases (0 PP, max energy, etc.)

### For Development

1. **Don't Leave Active**: Close debug panel when not testing
2. **Document Changes**: If adding new debug features, update this file
3. **Follow CLAUDE.md**: All debug code follows project standards
4. **No Production Code**: Debug panel is dev-only (marked with opacity 0.5)

---

## Adding New Debug Features

### Steps to Add New Debug Control

1. **Identify the state property** in `INITIAL_GAME_STATE` (constants.js)

2. **Choose appropriate tab** (or create new tab if needed)

3. **Add control in render function**:
   ```javascript
   const renderNewTab = () => (
     <div>
       <button onClick={() => {
         setGameState(prev => ({ ...prev, newProperty: value }));
         addMessage('Property set');
       }} style={buttonStyle}>
         BUTTON TEXT
       </button>
     </div>
   );
   ```

4. **Add tab button** in tabs section

5. **Add tab content** to main render switch

6. **Test thoroughly** before committing

---

## Keyboard Shortcuts

Currently none. Consider adding:
- `Ctrl+D`: Toggle debug panel
- `Esc`: Close debug panel
- Tab navigation between fields

---

## Known Limitations

1. **No Undo**: Debug actions are immediate (use Export State before risky changes)
2. **No Validation**: Most inputs don't validate ranges (can set negative values)
3. **No History**: Can't see previous debug actions
4. **No Persistence**: Debug panel state resets on close

---

## Future Enhancements

### Potential Features

1. **Debug History**: Log of all debug actions
2. **State Comparison**: Compare two game states
3. **Automated Testing**: Sequence of debug actions
4. **Custom Presets**: Save/load custom presets
5. **Search**: Search upgrades, achievements, skills
6. **Bulk Actions**: Select multiple items to unlock
7. **State Validator**: Check for invalid state combinations
8. **Performance Metrics**: Show FPS, render time, etc.

---

## Troubleshooting

### Debug Panel Won't Open
- Check browser console for errors
- Verify `DebugPanel.js` is imported correctly
- Ensure `showDebugPanel` state is working

### Buttons Don't Work
- Check that `setGameState` is passed correctly
- Verify functional setState pattern is used
- Check for console errors on click

### Style Issues
- Verify CSS variables are defined in `globals.css`
- Check z-index conflicts with other modals
- Test in both light and dark themes

---

## Version History

**v2.0** (2025-10-21)
- Complete redesign with tabbed interface
- Added 6 main tabs: Resources, Progression, Unlocks, Materials, Presets, Utilities
- Added 6 game state presets
- Added 2 feature testing presets
- Added state export functionality
- Added current inventory display
- Improved UX with categorization
- Added comprehensive documentation

**v1.0** (Previous)
- Basic debug menu with sanity and material controls
- Restore and cooldown reset buttons

---

## Contact

For bugs or feature requests related to the debug system:
1. Check this documentation
2. Review `CLAUDE.md` for coding standards
3. Test in both light/dark themes
4. Document any changes made

**Remember:** This is a development tool. Keep it accessible but don't rely on it for normal gameplay testing.
