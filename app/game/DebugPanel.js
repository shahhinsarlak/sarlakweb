/**
 * Comprehensive Debug Panel Component
 *
 * Provides thorough testing and debugging capabilities:
 * - Resource management (PP, Paper, Energy, Sanity)
 * - Progression control (Levels, XP, Skills)
 * - Unlock management (Locations, Upgrades, Achievements)
 * - Material management (Dimensional materials)
 * - State presets (Early/Mid/Late game scenarios)
 * - Event triggering and testing
 * - State export/import for testing
 */

import { useState } from 'react';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';
import { UPGRADES, PRINTER_UPGRADES, DIMENSIONAL_UPGRADES, ACHIEVEMENTS, EVENTS, LOCATIONS } from './constants';
import { SKILLS, LEVEL_SYSTEM } from './skillTreeConstants';

export default function DebugPanel({ gameState, setGameState, addMessage, onClose }) {
  const [activeTab, setActiveTab] = useState('resources');

  // Input states for manual entry
  const [ppInput, setPpInput] = useState('');
  const [paperInput, setPaperInput] = useState('');
  const [energyInput, setEnergyInput] = useState('');
  const [sanityInput, setSanityInput] = useState('');
  const [dayInput, setDayInput] = useState('');
  const [levelInput, setLevelInput] = useState('');
  const [xpInput, setXpInput] = useState('');
  const [skillPointsInput, setSkillPointsInput] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [materialAmount, setMaterialAmount] = useState('');

  // Tab styling
  const tabStyle = (isActive) => ({
    background: isActive ? 'var(--accent-color)' : 'none',
    border: '1px solid var(--border-color)',
    color: isActive ? 'var(--bg-color)' : 'var(--text-color)',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '10px',
    fontFamily: 'inherit',
    letterSpacing: '0.5px',
    flex: 1,
    minWidth: '80px',
    opacity: isActive ? 1 : 0.7
  });

  const buttonStyle = {
    background: 'none',
    border: '1px solid var(--border-color)',
    color: 'var(--text-color)',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'inherit',
    letterSpacing: '0.5px',
    width: '100%'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'var(--accent-color)',
    color: 'var(--bg-color)',
    fontWeight: '500'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    fontSize: '11px',
    fontFamily: 'inherit',
    backgroundColor: 'var(--hover-color)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-color)',
    marginBottom: '8px'
  };

  // Helper Functions
  const setResource = (resource, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setGameState(prev => ({
      ...prev,
      [resource]: Math.max(0, numValue)
    }));
    addMessage(`${resource.toUpperCase()} set to ${numValue}`);
  };

  const addResource = (resource, amount) => {
    setGameState(prev => ({
      ...prev,
      [resource]: prev[resource] + amount
    }));
    addMessage(`Added ${amount} ${resource.toUpperCase()}`);
  };

  const unlockAllLocations = () => {
    const allLocations = Object.keys(LOCATIONS);
    setGameState(prev => ({
      ...prev,
      unlockedLocations: allLocations,
      portalUnlocked: true
    }));
    addMessage('All locations unlocked');
  };

  const unlockAllUpgrades = () => {
    const allUpgrades = {};
    UPGRADES.forEach(upgrade => {
      allUpgrades[upgrade.id] = true;
    });
    setGameState(prev => ({
      ...prev,
      upgrades: allUpgrades,
      printerUnlocked: true
    }));
    addMessage('All upgrades unlocked');
  };

  const unlockAllPrinterUpgrades = () => {
    const allPrinterUpgrades = {};
    PRINTER_UPGRADES.forEach(upgrade => {
      allPrinterUpgrades[upgrade.id] = true;
    });
    setGameState(prev => ({
      ...prev,
      printerUpgrades: allPrinterUpgrades
    }));
    addMessage('All printer upgrades unlocked');
  };

  const unlockAllDimensionalUpgrades = () => {
    const allDimensionalUpgrades = {};
    DIMENSIONAL_UPGRADES.forEach(upgrade => {
      allDimensionalUpgrades[upgrade.id] = true;
    });
    setGameState(prev => ({
      ...prev,
      dimensionalUpgrades: allDimensionalUpgrades
    }));
    addMessage('All dimensional upgrades unlocked');
  };

  const unlockAllAchievements = () => {
    const allAchievements = ACHIEVEMENTS.map(a => a.id);
    setGameState(prev => ({
      ...prev,
      achievements: allAchievements
    }));
    addMessage('All achievements unlocked');
  };

  const maxAllSkills = () => {
    const maxedSkills = {};
    Object.keys(SKILLS).forEach(skillId => {
      maxedSkills[skillId] = SKILLS[skillId].maxLevel || 5;
    });
    setGameState(prev => ({
      ...prev,
      skills: maxedSkills
    }));
    addMessage('All skills maxed');
  };

  const resetCooldowns = () => {
    setGameState(prev => ({
      ...prev,
      restCooldown: 0,
      portalCooldown: 0
    }));
    addMessage('All cooldowns reset');
  };

  const maxAllMaterials = () => {
    const maxMaterials = {};
    DIMENSIONAL_MATERIALS.forEach(mat => {
      maxMaterials[mat.id] = 999;
    });
    setGameState(prev => ({
      ...prev,
      dimensionalInventory: maxMaterials
    }));
    addMessage('All materials set to 999');
  };

  const addMaterial = () => {
    if (!materialId || !materialAmount) return;
    const amount = parseInt(materialAmount);
    if (isNaN(amount)) return;

    setGameState(prev => ({
      ...prev,
      dimensionalInventory: {
        ...(prev.dimensionalInventory || {}),
        [materialId]: (prev.dimensionalInventory?.[materialId] || 0) + amount
      }
    }));

    const material = DIMENSIONAL_MATERIALS.find(m => m.id === materialId);
    addMessage(`Added ${amount} ${material?.name || materialId}`);
    setMaterialId('');
    setMaterialAmount('');
  };

  // Preset States
  const applyPreset = (presetName) => {
    const presets = {
      earlyGame: {
        pp: 500,
        paper: 50,
        energy: 100,
        sanity: 90,
        playerLevel: 3,
        playerXP: 0,
        skillPoints: 2,
        day: 3,
        upgrades: { stapler: true, coffee: true },
        unlockedLocations: ['cubicle']
      },
      midGame: {
        pp: 5000,
        paper: 500,
        energy: 100,
        sanity: 70,
        playerLevel: 10,
        playerXP: 0,
        skillPoints: 5,
        day: 10,
        upgrades: { stapler: true, coffee: true, keyboard: true, debugger: true, energydrink: true },
        unlockedLocations: ['cubicle', 'archive'],
        printerUnlocked: true
      },
      lateGame: {
        pp: 50000,
        paper: 5000,
        energy: 100,
        sanity: 50,
        playerLevel: 25,
        playerXP: 0,
        skillPoints: 15,
        day: 30,
        portalUnlocked: true,
        unlockedLocations: ['cubicle', 'archive', 'portal'],
        printerUnlocked: true,
        dimensionalInventory: {
          void_fragment: 30,
          static_crystal: 25,
          glitch_shard: 20,
          reality_dust: 15,
          temporal_core: 5
        }
      },
      endGame: {
        pp: 100000,
        paper: 10000,
        energy: 100,
        sanity: 30,
        playerLevel: 50,
        playerXP: 0,
        skillPoints: 30,
        day: 60,
        portalUnlocked: true,
        unlockedLocations: ['cubicle', 'archive', 'portal', 'drawer'],
        printerUnlocked: true,
        dimensionalInventory: {
          void_fragment: 100,
          static_crystal: 80,
          glitch_shard: 75,
          reality_dust: 60,
          temporal_core: 15,
          dimensional_essence: 5,
          singularity_node: 2
        }
      },
      testPortal: {
        pp: 10000,
        energy: 100,
        sanity: 80,
        day: 7,
        portalUnlocked: true,
        portalCooldown: 0,
        unlockedLocations: ['cubicle', 'portal'],
        dimensionalUpgrades: {
          dimensional_anchor: true,
          material_scanner: true
        }
      },
      testPrinter: {
        pp: 5000,
        paper: 1000,
        energy: 100,
        sanity: 90,
        printerUnlocked: true,
        printerQuality: 50,
        paperPerPrint: 5,
        paperPerSecond: 2
      }
    };

    const preset = presets[presetName];
    if (preset) {
      setGameState(prev => ({
        ...prev,
        ...preset
      }));
      addMessage(`Applied preset: ${presetName}`);
    }
  };

  const triggerRandomEvent = () => {
    const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    setGameState(prev => {
      const newState = { ...prev };
      if (randomEvent.pp) newState.pp = prev.pp + randomEvent.pp;
      if (randomEvent.energy) newState.energy = Math.max(0, Math.min(100, prev.energy + randomEvent.energy));
      if (randomEvent.sanity) newState.sanity = Math.max(0, Math.min(100, prev.sanity + randomEvent.sanity));
      newState.recentMessages = [randomEvent.message, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
      return newState;
    });
  };

  const exportGameState = () => {
    const stateJSON = JSON.stringify(gameState, null, 2);
    navigator.clipboard.writeText(stateJSON);
    addMessage('Game state copied to clipboard');
  };

  // Render Functions
  const renderResourcesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>PRODUCTIVITY POINTS</div>
        <input
          type="number"
          value={ppInput}
          onChange={(e) => setPpInput(e.target.value)}
          placeholder={`Current: ${gameState.pp.toFixed(1)}`}
          style={inputStyle}
        />
        <button onClick={() => setResource('pp', ppInput)} disabled={!ppInput} style={primaryButtonStyle}>
          SET PP
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <button onClick={() => addResource('pp', 1000)} style={buttonStyle}>+1K</button>
          <button onClick={() => addResource('pp', 10000)} style={buttonStyle}>+10K</button>
          <button onClick={() => addResource('pp', 100000)} style={buttonStyle}>+100K</button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>PAPER</div>
        <input
          type="number"
          value={paperInput}
          onChange={(e) => setPaperInput(e.target.value)}
          placeholder={`Current: ${gameState.paper?.toFixed(1) || 0}`}
          style={inputStyle}
        />
        <button onClick={() => setResource('paper', paperInput)} disabled={!paperInput} style={primaryButtonStyle}>
          SET PAPER
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <button onClick={() => addResource('paper', 100)} style={buttonStyle}>+100</button>
          <button onClick={() => addResource('paper', 1000)} style={buttonStyle}>+1K</button>
          <button onClick={() => addResource('paper', 10000)} style={buttonStyle}>+10K</button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>ENERGY</div>
        <input
          type="number"
          value={energyInput}
          onChange={(e) => setEnergyInput(e.target.value)}
          placeholder={`Current: ${gameState.energy.toFixed(1)}`}
          min="0"
          max="120"
          style={inputStyle}
        />
        <button onClick={() => setResource('energy', energyInput)} disabled={!energyInput} style={primaryButtonStyle}>
          SET ENERGY
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <button onClick={() => setResource('energy', 100)} style={buttonStyle}>RESTORE (100)</button>
          <button onClick={() => setResource('energy', 120)} style={buttonStyle}>MAX (120)</button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>SANITY</div>
        <input
          type="number"
          value={sanityInput}
          onChange={(e) => setSanityInput(e.target.value)}
          placeholder={`Current: ${gameState.sanity.toFixed(1)}`}
          min="0"
          max="100"
          style={inputStyle}
        />
        <button onClick={() => setResource('sanity', sanityInput)} disabled={!sanityInput} style={primaryButtonStyle}>
          SET SANITY
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <button onClick={() => setResource('sanity', 10)} style={buttonStyle}>LOW (10)</button>
          <button onClick={() => setResource('sanity', 50)} style={buttonStyle}>MED (50)</button>
          <button onClick={() => setResource('sanity', 100)} style={buttonStyle}>MAX (100)</button>
        </div>
      </div>
    </div>
  );

  const renderProgressionTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>DAY / TIME</div>
        <input
          type="number"
          value={dayInput}
          onChange={(e) => setDayInput(e.target.value)}
          placeholder={`Current Day: ${gameState.day}`}
          min="1"
          style={inputStyle}
        />
        <button
          onClick={() => {
            const numDay = parseInt(dayInput);
            if (!isNaN(numDay)) {
              setGameState(prev => ({
                ...prev,
                day: numDay,
                timeInOffice: numDay * 60
              }));
              addMessage(`Day set to ${numDay}`);
            }
          }}
          disabled={!dayInput}
          style={primaryButtonStyle}
        >
          SET DAY
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <button onClick={() => addResource('day', 1)} style={buttonStyle}>+1 DAY</button>
          <button onClick={() => addResource('day', 7)} style={buttonStyle}>+1 WEEK</button>
          <button onClick={() => addResource('day', 30)} style={buttonStyle}>+1 MONTH</button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>PLAYER LEVEL</div>
        <input
          type="number"
          value={levelInput}
          onChange={(e) => setLevelInput(e.target.value)}
          placeholder={`Current: ${gameState.playerLevel || 1}`}
          min="1"
          max="100"
          style={inputStyle}
        />
        <button
          onClick={() => {
            const level = parseInt(levelInput);
            if (!isNaN(level)) {
              setGameState(prev => ({
                ...prev,
                playerLevel: level,
                playerXP: 0
              }));
              addMessage(`Level set to ${level}`);
            }
          }}
          disabled={!levelInput}
          style={primaryButtonStyle}
        >
          SET LEVEL
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <button onClick={() => setGameState(prev => ({ ...prev, playerLevel: 10, playerXP: 0 }))} style={buttonStyle}>LVL 10</button>
          <button onClick={() => setGameState(prev => ({ ...prev, playerLevel: 25, playerXP: 0 }))} style={buttonStyle}>LVL 25</button>
          <button onClick={() => setGameState(prev => ({ ...prev, playerLevel: 50, playerXP: 0 }))} style={buttonStyle}>LVL 50</button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>EXPERIENCE POINTS</div>
        <input
          type="number"
          value={xpInput}
          onChange={(e) => setXpInput(e.target.value)}
          placeholder={`Current: ${gameState.playerXP || 0}`}
          min="0"
          style={inputStyle}
        />
        <button
          onClick={() => {
            const xp = parseInt(xpInput);
            if (!isNaN(xp)) {
              setGameState(prev => ({
                ...prev,
                playerXP: xp
              }));
              addMessage(`XP set to ${xp}`);
            }
          }}
          disabled={!xpInput}
          style={primaryButtonStyle}
        >
          SET XP
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <button onClick={() => addResource('playerXP', 100)} style={buttonStyle}>+100 XP</button>
          <button onClick={() => addResource('playerXP', 1000)} style={buttonStyle}>+1000 XP</button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>SKILL POINTS</div>
        <input
          type="number"
          value={skillPointsInput}
          onChange={(e) => setSkillPointsInput(e.target.value)}
          placeholder={`Current: ${gameState.skillPoints || 0}`}
          min="0"
          style={inputStyle}
        />
        <button
          onClick={() => {
            const sp = parseInt(skillPointsInput);
            if (!isNaN(sp)) {
              setGameState(prev => ({
                ...prev,
                skillPoints: sp
              }));
              addMessage(`Skill Points set to ${sp}`);
            }
          }}
          disabled={!skillPointsInput}
          style={primaryButtonStyle}
        >
          SET SKILL POINTS
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <button onClick={() => addResource('skillPoints', 5)} style={buttonStyle}>+5 SP</button>
          <button onClick={() => addResource('skillPoints', 20)} style={buttonStyle}>+20 SP</button>
          <button onClick={() => maxAllSkills()} style={buttonStyle}>MAX ALL</button>
        </div>
      </div>
    </div>
  );

  const renderUnlocksTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>LOCATIONS</div>
        <button onClick={unlockAllLocations} style={primaryButtonStyle}>
          UNLOCK ALL LOCATIONS
        </button>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.6 }}>
          Current: {gameState.unlockedLocations.join(', ')}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>UPGRADES</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button onClick={unlockAllUpgrades} style={buttonStyle}>
            ALL UPGRADES
          </button>
          <button onClick={unlockAllPrinterUpgrades} style={buttonStyle}>
            PRINTER UPGRADES
          </button>
          <button onClick={unlockAllDimensionalUpgrades} style={buttonStyle}>
            DIMENSIONAL
          </button>
          <button onClick={() => {
            setGameState(prev => ({ ...prev, printerUnlocked: true }));
            addMessage('Printer Room unlocked');
          }} style={buttonStyle}>
            PRINTER ROOM
          </button>
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.6 }}>
          Upgrades: {Object.keys(gameState.upgrades || {}).length} |
          Printer: {Object.keys(gameState.printerUpgrades || {}).length} |
          Dimensional: {Object.keys(gameState.dimensionalUpgrades || {}).length}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>ACHIEVEMENTS</div>
        <button onClick={unlockAllAchievements} style={primaryButtonStyle}>
          UNLOCK ALL ACHIEVEMENTS
        </button>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.6 }}>
          Unlocked: {gameState.achievements.length} / {ACHIEVEMENTS.length}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>QUICK UNLOCKS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button onClick={() => {
            setGameState(prev => ({ ...prev, portalUnlocked: true, unlockedLocations: [...new Set([...prev.unlockedLocations, 'portal'])] }));
            addMessage('Portal unlocked');
          }} style={buttonStyle}>
            PORTAL
          </button>
          <button onClick={() => {
            setGameState(prev => ({ ...prev, unlockedLocations: [...new Set([...prev.unlockedLocations, 'archive'])] }));
            addMessage('Archive unlocked');
          }} style={buttonStyle}>
            ARCHIVE
          </button>
          <button onClick={() => {
            setGameState(prev => ({ ...prev, unlockedLocations: [...new Set([...prev.unlockedLocations, 'drawer'])] }));
            addMessage('Bottom Drawer unlocked');
          }} style={buttonStyle}>
            DRAWER
          </button>
          <button onClick={() => {
            setGameState(prev => ({ ...prev, debugMode: true }));
            addMessage('Debug mode enabled');
          }} style={buttonStyle}>
            DEBUG MODE
          </button>
        </div>
      </div>
    </div>
  );

  const renderMaterialsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>ADD MATERIALS</div>
        <select
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Material</option>
          {DIMENSIONAL_MATERIALS.map(mat => (
            <option key={mat.id} value={mat.id}>{mat.name} ({mat.rarity})</option>
          ))}
        </select>
        <input
          type="number"
          value={materialAmount}
          onChange={(e) => setMaterialAmount(e.target.value)}
          placeholder="Amount"
          min="1"
          style={inputStyle}
        />
        <button onClick={addMaterial} disabled={!materialId || !materialAmount} style={primaryButtonStyle}>
          ADD MATERIAL
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>QUICK ACTIONS</div>
        <button onClick={maxAllMaterials} style={primaryButtonStyle}>
          MAX ALL MATERIALS (999)
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <button onClick={() => {
            setGameState(prev => ({
              ...prev,
              dimensionalInventory: {
                void_fragment: 50,
                static_crystal: 50,
                glitch_shard: 50,
                reality_dust: 50
              }
            }));
            addMessage('Common materials set to 50');
          }} style={buttonStyle}>
            COMMON (50)
          </button>
          <button onClick={() => {
            setGameState(prev => ({
              ...prev,
              dimensionalInventory: {
                ...prev.dimensionalInventory,
                temporal_core: 10,
                dimensional_essence: 5,
                singularity_node: 3
              }
            }));
            addMessage('Rare materials added');
          }} style={buttonStyle}>
            RARE MATERIALS
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>CURRENT INVENTORY</div>
        <div style={{
          fontSize: '10px',
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid var(--border-color)',
          padding: '8px',
          backgroundColor: 'var(--hover-color)'
        }}>
          {Object.keys(gameState.dimensionalInventory || {}).length === 0 ? (
            <div style={{ opacity: 0.6 }}>No materials collected</div>
          ) : (
            DIMENSIONAL_MATERIALS.map(mat => {
              const count = gameState.dimensionalInventory?.[mat.id] || 0;
              if (count === 0) return null;
              return (
                <div key={mat.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{mat.name}</span>
                  <strong>{count}</strong>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderPresetsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>GAME STATE PRESETS</div>
        <div style={{ fontSize: '9px', opacity: 0.5, marginBottom: '12px' }}>
          Load pre-configured game states for testing
        </div>
      </div>

      <button onClick={() => applyPreset('earlyGame')} style={buttonStyle}>
        EARLY GAME (Day 3, Level 3)
      </button>
      <button onClick={() => applyPreset('midGame')} style={buttonStyle}>
        MID GAME (Day 10, Level 10)
      </button>
      <button onClick={() => applyPreset('lateGame')} style={buttonStyle}>
        LATE GAME (Day 30, Level 25)
      </button>
      <button onClick={() => applyPreset('endGame')} style={buttonStyle}>
        END GAME (Day 60, Level 50)
      </button>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '8px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>FEATURE TESTING PRESETS</div>
      </div>

      <button onClick={() => applyPreset('testPortal')} style={buttonStyle}>
        TEST PORTAL (Day 7, Portal Ready)
      </button>
      <button onClick={() => applyPreset('testPrinter')} style={buttonStyle}>
        TEST PRINTER (Printer Unlocked)
      </button>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '8px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>STATE MANAGEMENT</div>
      </div>

      <button onClick={exportGameState} style={buttonStyle}>
        📋 EXPORT STATE TO CLIPBOARD
      </button>
    </div>
  );

  const renderUtilitiesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>COOLDOWNS</div>
        <button onClick={resetCooldowns} style={primaryButtonStyle}>
          RESET ALL COOLDOWNS
        </button>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.6 }}>
          Rest: {gameState.restCooldown?.toFixed(1) || 0}s | Portal: {gameState.portalCooldown?.toFixed(1) || 0}s
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>RESTORE ALL</div>
        <button onClick={() => {
          setGameState(prev => ({
            ...prev,
            energy: 100,
            sanity: 100,
            restCooldown: 0,
            portalCooldown: 0
          }));
          addMessage('Energy, Sanity, and Cooldowns restored');
        }} style={primaryButtonStyle}>
          FULL RESTORE
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>EVENTS & TRIGGERS</div>
        <button onClick={triggerRandomEvent} style={buttonStyle}>
          TRIGGER RANDOM EVENT
        </button>
        <button onClick={() => {
          setGameState(prev => ({
            ...prev,
            strangeColleagueEvent: null
          }));
        }} style={buttonStyle}>
          CLEAR COLLEAGUE EVENT
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>COUNTERS & FLAGS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button onClick={() => setGameState(prev => ({ ...prev, sortCount: 100 }))} style={buttonStyle}>
            SORT COUNT: 100
          </button>
          <button onClick={() => setGameState(prev => ({ ...prev, printCount: 100 }))} style={buttonStyle}>
            PRINT COUNT: 100
          </button>
          <button onClick={() => setGameState(prev => ({ ...prev, disagreementCount: 20 }))} style={buttonStyle}>
            DISAGREE: 20
          </button>
          <button onClick={() => setGameState(prev => ({ ...prev, examinedItems: 7 }))} style={buttonStyle}>
            EXAMINED: 7
          </button>
          <button onClick={() => setGameState(prev => ({ ...prev, themeToggleCount: 20 }))} style={buttonStyle}>
            THEME: 20
          </button>
          <button onClick={() => setGameState(prev => ({ ...prev, breathCount: 20 }))} style={buttonStyle}>
            BREATH: 20
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>PRINTER SETTINGS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button onClick={() => setGameState(prev => ({ ...prev, printerQuality: 50 }))} style={buttonStyle}>
            QUALITY: 50%
          </button>
          <button onClick={() => setGameState(prev => ({ ...prev, printerQuality: 100 }))} style={buttonStyle}>
            QUALITY: 100%
          </button>
          <button onClick={() => setGameState(prev => ({ ...prev, paperPerPrint: 10 }))} style={buttonStyle}>
            PAPER/PRINT: 10
          </button>
          <button onClick={() => setGameState(prev => ({ ...prev, paperPerSecond: 5 }))} style={buttonStyle}>
            PAPER/SEC: 5
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace"
    }}>
      <div style={{
        maxWidth: '700px',
        width: '95%',
        maxHeight: '90vh',
        border: '2px solid #00ff00',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #00ff00',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#00ff00',
            fontWeight: '500'
          }}>
            🛠 DEBUG PANEL
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid #ff0000',
              color: '#ff0000',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '10px',
              fontFamily: 'inherit',
              letterSpacing: '1px'
            }}
          >
            CLOSE [X]
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '12px',
          borderBottom: '1px solid var(--border-color)',
          overflowX: 'auto',
          flexWrap: 'wrap'
        }}>
          <button onClick={() => setActiveTab('resources')} style={tabStyle(activeTab === 'resources')}>
            RESOURCES
          </button>
          <button onClick={() => setActiveTab('progression')} style={tabStyle(activeTab === 'progression')}>
            PROGRESSION
          </button>
          <button onClick={() => setActiveTab('unlocks')} style={tabStyle(activeTab === 'unlocks')}>
            UNLOCKS
          </button>
          <button onClick={() => setActiveTab('materials')} style={tabStyle(activeTab === 'materials')}>
            MATERIALS
          </button>
          <button onClick={() => setActiveTab('presets')} style={tabStyle(activeTab === 'presets')}>
            PRESETS
          </button>
          <button onClick={() => setActiveTab('utilities')} style={tabStyle(activeTab === 'utilities')}>
            UTILITIES
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1,
          fontSize: '11px'
        }}>
          {activeTab === 'resources' && renderResourcesTab()}
          {activeTab === 'progression' && renderProgressionTab()}
          {activeTab === 'unlocks' && renderUnlocksTab()}
          {activeTab === 'materials' && renderMaterialsTab()}
          {activeTab === 'presets' && renderPresetsTab()}
          {activeTab === 'utilities' && renderUtilitiesTab()}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '9px',
          opacity: 0.5,
          textAlign: 'center'
        }}>
          COMPREHENSIVE DEBUG SYSTEM v2.0 | USE RESPONSIBLY
        </div>
      </div>
    </div>
  );
}
