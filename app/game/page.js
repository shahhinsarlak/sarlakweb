'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MeditationModal from './MeditationModal';
import DebugModal from './DebugModal';
import ColleagueModal from './ColleagueModal';
import ExamineModal from './ExamineModal';
import DimensionalArea from './DimensionalArea';
import DimensionalUpgradesDisplay from './DimensionalUpgradesDisplay';
import SkillTreeModal from './SkillTreeModal';
import { createGameActions } from './gameActions';
import { getDistortionStyle, distortText, getClockTime, createLevelUpParticles } from './gameUtils';
import { saveGame, loadGame, exportToClipboard, importFromClipboard } from './saveSystem';
import { addExperience, purchaseSkill, getActiveSkillEffects, getModifiedPortalCooldown, getModifiedCapacity } from './skillSystemHelpers';
import { SKILLS, LEVEL_SYSTEM, XP_REWARDS } from './skillTreeConstants';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';
import { 
  INITIAL_GAME_STATE, 
  LOCATIONS, 
  UPGRADES, 
  ACHIEVEMENTS, 
  EVENTS,
  STRANGE_COLLEAGUE_DIALOGUES 
} from './constants';

export default function Game() {
  const [isMobile, setIsMobile] = useState(false);
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showDebugMenu, setShowDebugMenu] = useState(false);
  const [debugMaterialId, setDebugMaterialId] = useState('');
  const [debugMaterialAmount, setDebugMaterialAmount] = useState('');
  const [debugSanityLevel, setDebugSanityLevel] = useState('');
  const [hoveredUpgrade, setHoveredUpgrade] = useState(null);

  const addMessage = useCallback((msg) => {
    setGameState(prev => {
      const maxMessages = prev.maxLogMessages || 15;
      const updatedMessages = [msg, ...prev.recentMessages];
      return {
        ...prev,
        recentMessages: updatedMessages.slice(0, maxMessages)
      };
    });
  }, []);

  const grantXP = useCallback((amount) => {
    setGameState(prev => {
      const xpResult = addExperience(prev, amount, addMessage);
      
      // Trigger particle effect on level up
      if (xpResult.leveledUp) {
        setTimeout(() => {
          createLevelUpParticles();
        }, 100);
      }
      
      return {
        ...prev,
        ...xpResult
      };
    });
  }, [addMessage]);

  const checkAchievements = useCallback(() => {
    setGameState(prev => {
      const newAchievements = [...prev.achievements];
      const achievementMessages = [];
      let hasNew = false;
  
      ACHIEVEMENTS.forEach(achievement => {
        if (!newAchievements.includes(achievement.id) && achievement.check(prev)) {
          newAchievements.push(achievement.id);
          hasNew = true;
          achievementMessages.push(`🏆 ACHIEVEMENT: ${achievement.name}`);
        }
      });
  
      if (hasNew) {
        // Grant XP directly in the same state update
        const xpResult = addExperience(prev, XP_REWARDS.completeAchievement * achievementMessages.length, () => {});
        
        // Trigger particle effect if leveled up
        if (xpResult.leveledUp) {
          setTimeout(() => {
            createLevelUpParticles();
            addMessage(`🎉 LEVEL UP! You are now level ${xpResult.playerLevel}.`);
          }, 100);
        }
        
        return { 
          ...prev,
          ...xpResult,
          achievements: newAchievements,
          recentMessages: [...achievementMessages.reverse(), ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }
      return prev;
    });
  }, [addMessage]);

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.data && e.data.type === 'THEME_TOGGLE') {
        setGameState(prev => {
          const currentCount = prev.themeToggleCount || 0;
          const newCount = currentCount + 1;
          
          if (newCount === 20 && prev.day >= 7 && !prev.portalUnlocked) {
            const messages = [
              'Reality shivers. The lights... they respond to you now.',
              'Something tears open in the fabric of the office.',
              '🌀 NEW LOCATION: The Portal'
            ];
            
            return {
              ...prev,
              themeToggleCount: newCount,
              portalUnlocked: true,
              unlockedLocations: [...prev.unlockedLocations, 'portal'],
              sanity: Math.max(0, prev.sanity - 10),
              recentMessages: [...messages.reverse(), ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
            };
          }
          
          let newMessage = null;
          if (newCount === 10) {
            newMessage = prev.day >= 7 ? 'The lights flicker in response. They\'re watching...' : 'Progress tracked. Keep going...';
          } else if (newCount === 15) {
            newMessage = prev.day >= 7 ? 'Reality feels... thinner. Keep going?' : 'Almost there...';
          }
          
          if (newMessage) {
            return {
              ...prev,
              themeToggleCount: newCount,
              recentMessages: [newMessage, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
            };
          }
          
          return {
            ...prev,
            themeToggleCount: newCount
          };
        });
      }
    };

    window.addEventListener('message', handleThemeChange);
    return () => window.removeEventListener('message', handleThemeChange);
  }, [addMessage]);

  const actions = createGameActions(setGameState, addMessage, checkAchievements, grantXP);

  const handlePurchaseSkill = (skillId) => {
    setGameState(prev => {
      // Don't call addMessage here - let purchaseSkill handle it
      const result = purchaseSkill(prev, skillId, () => {}); // Empty callback to prevent double messages
      
      // If the purchase was successful, add the message here
      if (result !== prev) {
        const skill = SKILLS[skillId];
        const currentLevel = (prev.purchasedSkills?.[skillId] || prev.skills?.[skillId] || 0) + 1;
        
        return {
          ...result,
          recentMessages: [`✨ Learned ${skill.name} (Level ${currentLevel})!`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }
      
      return result;
    });
  };

  const handleSaveGame = () => {
    saveGame(gameState);
    addMessage('Game saved to file.');
    setShowSaveMenu(false);
  };

  const handleLoadGame = (e) => {
    const file = e.target.files[0];
    if (file) {
      loadGame(file, setGameState, addMessage);
      setShowSaveMenu(false);
    }
  };

  const handleExportClipboard = async () => {
    const success = await exportToClipboard(gameState);
    if (success) {
      addMessage('Save data copied to clipboard.');
    } else {
      addMessage('Failed to copy to clipboard.');
    }
    setShowSaveMenu(false);
  };

  const handleImportClipboard = async () => {
    try {
      await importFromClipboard(setGameState, addMessage);
      setShowSaveMenu(false);
    } catch (error) {
      // Error already handled
    }
  };

  const handleSetSanity = () => {
    const level = parseInt(debugSanityLevel);
    if (!isNaN(level) && level >= 0 && level <= 100) {
      setGameState(prev => ({ ...prev, sanity: level }));
      addMessage(`Sanity set to ${level}%.`);
      setDebugSanityLevel('');
    }
  };

  const purchaseDimensionalUpgrade = (upgrade) => {
    setGameState(prev => {
      const canAfford = Object.entries(upgrade.materials).every(([materialId, required]) => {
        return (prev.dimensionalInventory?.[materialId] || 0) >= required;
      });

      if (!canAfford || prev.dimensionalUpgrades?.[upgrade.id]) return prev;

      const newInventory = { ...prev.dimensionalInventory };
      Object.entries(upgrade.materials).forEach(([materialId, required]) => {
        newInventory[materialId] = (newInventory[materialId] || 0) - required;
      });

      const newState = {
        ...prev,
        dimensionalInventory: newInventory,
        dimensionalUpgrades: { ...(prev.dimensionalUpgrades || {}), [upgrade.id]: true },
        recentMessages: [`Crafted: ${upgrade.name}`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
      };

      if (upgrade.effect === 'ppPerSecond') {
        newState.ppPerSecond = (prev.ppPerSecond || 0) + upgrade.value;
      } else if (upgrade.effect === 'unlock') {
        if (upgrade.value === 'drawer') {
          newState.unlockedLocations = [...prev.unlockedLocations, 'drawer'];
        }
      }

      grantXP(XP_REWARDS.purchaseDimensionalUpgrade);
      setTimeout(() => checkAchievements(), 50);
      return newState;
    });
  };

  const getUpgradeTooltip = (upgrade) => {
    const effects = [];
    
    if (upgrade.effect === 'ppPerClick') {
      effects.push(`+${upgrade.value} PP per click`);
    } else if (upgrade.effect === 'ppPerSecond') {
      effects.push(`+${upgrade.value} PP per second (passive income)`);
    } else if (upgrade.effect === 'maxEnergy') {
      effects.push(`Max energy +${upgrade.value}`);
    } else if (upgrade.effect === 'sanityRegen') {
      effects.push(`+${upgrade.value} sanity regeneration per second`);
    } else if (upgrade.effect === 'unlock') {
      const unlockMap = {
        'debug': 'Unlocks Debug challenges',
        'exploration': 'Unlocks Breakroom',
        'serverroom': 'Unlocks Server Room',
        'managers': 'Unlocks Manager\'s Office',
        'basement': 'Unlocks B7 - Basement (Phase 3)',
        'roof': 'Unlocks Roof Access',
        'archive': 'Unlocks The Archive',
        'drawer': 'Unlocks Bottom Drawer',
        'converter': 'Unlocks Material Converter',
        'imbuing': 'Unlocks Weapon Imbuing',
        'lore': 'Unlocks Dimensional Codex',
        'ending': 'Unlocks Final Ending',
        'void': 'Unlocks The Void'
      };
      effects.push(unlockMap[upgrade.value] || `Unlocks: ${upgrade.value}`);
    } else if (upgrade.effect === 'maxLogMessages') {
      effects.push(`Increases event log to ${upgrade.value} messages`);
    } else if (upgrade.effect === 'debugBonus') {
      effects.push(`Debug rewards ×${upgrade.value}. First attempt always succeeds`);
    } else if (upgrade.effect === 'portalCooldown') {
      effects.push(`Portal cooldown reduced to ${upgrade.value}s`);
    } else if (upgrade.effect === 'capacity') {
      effects.push(`Dimensional capacity +${upgrade.value} items`);
    } else if (upgrade.effect === 'portalRespawn') {
      effects.push(`Materials regenerate faster in dimensional space`);
    } else if (upgrade.effect === 'meditationBonus') {
      effects.push(`Meditation grants ×${upgrade.value} sanity`);
    } else if (upgrade.effect === 'minSanity') {
      effects.push(`Sanity cannot drop below ${upgrade.value}%`);
    } else if (upgrade.effect === 'combat') {
      effects.push(`Combat enhancement: ${upgrade.value}`);
    } else if (upgrade.effect === 'timeTravel') {
      effects.push(`Undo the last 5 minutes (once per day)`);
    } else if (upgrade.effect === 'portalScan') {
      effects.push(`Materials glow brighter in dimensional space`);
    } else if (upgrade.effect === 'hiddenText') {
      effects.push(`See hidden messages between the lines`);
    }
    
    return effects.length > 0 ? effects.join(' • ') : 'Unknown effect';
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        let newState = { ...prev };
        
        if (prev.restCooldown > 0) {
          newState.restCooldown = Math.max(0, prev.restCooldown - 0.1);
        }
        
        if (prev.portalCooldown > 0) {
          newState.portalCooldown = Math.max(0, prev.portalCooldown - 0.1);
        }
        
        if (prev.ppPerSecond > 0) {
          newState.pp = prev.pp + (prev.ppPerSecond / 10);
        }

        newState.timeInOffice = prev.timeInOffice + 0.1;
        if (Math.floor(newState.timeInOffice) % 60 === 0 && Math.floor(newState.timeInOffice) !== Math.floor(prev.timeInOffice)) {
          newState.day = prev.day + 1;
        }

        if (prev.phase >= 2) {
          newState.sanity = Math.max(0, prev.sanity - 0.05);
        }

        if (prev.upgrades.pills && prev.sanity < 100) {
          newState.sanity = Math.min(100, prev.sanity + 0.05);
        }

        if (prev.dimensionalUpgrades?.void_shield && prev.sanity < 100) {
          newState.sanity = Math.min(100, prev.sanity + 0.05);
        }

        if (prev.dimensionalUpgrades?.reality_anchor && newState.sanity < 20) {
          newState.sanity = 20;
        }

        if (!prev.strangeColleagueEvent && prev.day >= 3 && prev.location !== 'portal' && Math.random() < 0.005) {
          const randomDialogue = STRANGE_COLLEAGUE_DIALOGUES[Math.floor(Math.random() * STRANGE_COLLEAGUE_DIALOGUES.length)];
          newState.strangeColleagueEvent = randomDialogue;
          addMessage('Someone approaches your desk. You don\'t recognize them.');
        }

        if (Math.random() < 0.02) {
          const availableEvents = EVENTS.filter(e => 
            prev.day >= e.minDay && !prev.discoveredEvents.includes(e.id)
          );
          
          if (availableEvents.length > 0 && Math.random() < 0.3) {
            const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
            if (Math.random() < event.prob) {
              addMessage(event.message);
              if (event.pp) newState.pp += event.pp;
              if (event.energy) newState.energy = Math.max(0, Math.min(100, prev.energy + event.energy));
              if (event.sanity) newState.sanity = Math.max(0, Math.min(100, prev.sanity + event.sanity));
              newState.discoveredEvents = [...prev.discoveredEvents, event.id];
            }
          }
        }

        if (prev.phase === 1 && prev.pp > 500) {
          newState.phase = 2;
          newState.recentMessages = ['Something has changed. Or has it always been this way?', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
        }

        if (prev.sanity < 30 && Math.random() < 0.1) {
          const glitchMessages = [
            'T̷h̷e̷ ̷w̷a̷l̷l̷s̷',
            'Your name is... what is your name?',
            '404: REALITY NOT FOUND',
            'You are doing great! You are doing great! You are doing great!',
            'The exit is everywhere and nowhere.'
          ];
          const selectedMessage = glitchMessages[Math.floor(Math.random() * glitchMessages.length)];
          newState.recentMessages = [selectedMessage, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
        }

        return newState;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [addMessage]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    checkAchievements();
  }, [gameState.pp, gameState.day, gameState.sortCount, gameState.unlockedLocations.length, gameState.disagreementCount, gameState.examinedItems, gameState.sanity, checkAchievements]);

  const currentLocation = LOCATIONS[gameState.location];
  const availableUpgrades = UPGRADES.filter(u => 
    !gameState.upgrades[u.id] && 
    (u.effect !== 'unlock' || gameState.pp >= u.cost * 0.5)
  );

  const enterDimensionalArea = () => {
    setGameState(prev => ({ ...prev, inDimensionalArea: true }));
  };

  const exitDimensionalArea = () => {
    setGameState(prev => {
      const effects = getActiveSkillEffects(prev);
      const cooldownTime = getModifiedPortalCooldown(60, prev);
      
      const newDimensionalInventory = { ...(prev.dimensionalInventory || {}) };
      
      Object.keys(prev.dimensionalInventory || {}).forEach(materialId => {
        newDimensionalInventory[materialId] = (newDimensionalInventory[materialId] || 0);
      });
      
      return {
        ...prev,
        dimensionalInventory: newDimensionalInventory,
        portalCooldown: cooldownTime,
        inDimensionalArea: false
      };
    });
  };

  const handleAddMaterial = () => {
    if (!debugMaterialId || !debugMaterialAmount) return;
    
    const amount = parseInt(debugMaterialAmount);
    if (isNaN(amount)) return;
    
    setGameState(prev => ({
      ...prev,
      dimensionalInventory: {
        ...(prev.dimensionalInventory || {}),
        [debugMaterialId]: (prev.dimensionalInventory?.[debugMaterialId] || 0) + amount
      }
    }));
    
    addMessage(`Added ${amount} ${DIMENSIONAL_MATERIALS.find(m => m.id === debugMaterialId)?.name}`);
    setDebugMaterialId('');
    setDebugMaterialAmount('');
  };

  if (gameState.showSkillTree) {
    return <SkillTreeModal gameState={gameState} onClose={() => setGameState(prev => ({ ...prev, showSkillTree: false }))} onPurchaseSkill={handlePurchaseSkill} />;
  }

  if (gameState.inDimensionalArea) {
    return <DimensionalArea gameState={gameState} setGameState={setGameState} onExit={exitDimensionalArea} grantXP={grantXP} />;
  }

  if (gameState.meditating) {
    return <MeditationModal gameState={gameState} breatheAction={actions.breatheAction} cancelMeditation={actions.cancelMeditation} />;
  }

  if (gameState.examiningItem) {
    return <ExamineModal item={gameState.examiningItem} closeExamine={actions.closeExamine} />;
  }

  if (gameState.strangeColleagueEvent) {
    return <ColleagueModal event={gameState.strangeColleagueEvent} recentMessages={gameState.recentMessages} respondToColleague={actions.respondToColleague} />;
  }

  if (gameState.debugMode && gameState.currentBug) {
    return <DebugModal gameState={gameState} submitDebug={actions.submitDebug} updateDebugCode={actions.updateDebugCode} cancelDebug={actions.cancelDebug} />;
  }

  return (
    <>
      <Header />
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        padding: isMobile ? '20px' : '40px 60px',
        minHeight: 'calc(100vh - 200px)',
        fontSize: '14px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '20px',
          marginBottom: '40px'
        }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
            {currentLocation.name}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              onClick={() => setGameState(prev => ({ ...prev, showSkillTree: true }))}
              style={{
                background: 'none',
                border: '1px solid #4a90e2',
                color: '#4a90e2',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'inherit',
                opacity: 0.8
              }}
            >
              ⚡ SKILLS
            </button>
            <button
              onClick={() => setShowSaveMenu(!showSaveMenu)}
              style={{
                background: 'none',
                border: '1px solid var(--accent-color)',
                color: 'var(--accent-color)',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'inherit',
                opacity: 0.8
              }}
            >
              💾 SAVE
            </button>
            <button
              onClick={() => setShowDebugMenu(!showDebugMenu)}
              style={{
                background: 'none',
                border: '1px solid #00ff00',
                color: '#00ff00',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'inherit',
                opacity: 0.5
              }}
            >
              🛠 DEBUG
            </button>
            <button
              onClick={() => setGameState(prev => ({ ...prev, pp: prev.pp + 100000 }))}
              style={{
                background: 'none',
                border: '1px solid #ff00ff',
                color: '#ff00ff',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'inherit',
                opacity: 0.5
              }}
            >
              +100K PP
            </button>
            <button
              onClick={() => setGameState(prev => ({ ...prev, day: prev.day + 1, timeInOffice: prev.day * 60 }))}
              style={{
                background: 'none',
                border: '1px solid #00ffff',
                color: '#00ffff',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'inherit',
                opacity: 0.5
              }}
            >
              +1 DAY
            </button>
            <div style={{ fontSize: '12px', textAlign: 'right', opacity: 0.7 }}>
              <div>{getClockTime(gameState.timeInOffice)}</div>
              <div style={{ marginTop: '4px' }}>DAY {Math.floor(gameState.day)}</div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '65fr 35fr',
          gap: '40px'
        }}>
          <div>
            <div style={{ marginBottom: '40px' }}>
              <p style={{ fontSize: '15px', marginBottom: '20px', opacity: 0.9 }}>
                {currentLocation.description}
              </p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
                EVENT LOG
              </div>
              <div style={{
                border: '1px solid var(--border-color)',
                padding: '16px',
                backgroundColor: 'var(--hover-color)',
                fontSize: '13px',
                opacity: 0.7,
                lineHeight: '1.8',
                maxHeight: '200px',
                overflowY: 'auto',
                minHeight: '120px'
              }}>
                {gameState.recentMessages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: i < gameState.recentMessages.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    {msg}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
                ACTIONS
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                <button
                  onClick={actions.sortPapers}
                  style={{
                    ...getDistortionStyle(gameState.sanity),
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s',
                    opacity: 1,
                    textAlign: 'center'
                  }}
                >
                  <div>{distortText('SORT PAPERS', gameState.sanity)}</div>
                  <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '6px' }}>[+{gameState.ppPerClick} PP]</div>
                </button>
                <button
                  onClick={actions.rest}
                  style={{
                    ...getDistortionStyle(gameState.sanity),
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s',
                    opacity: 1,
                    textAlign: 'center'
                  }}
                >
                  <div>{distortText('REST', gameState.sanity)}</div>
                  <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '6px' }}>
                    {gameState.restCooldown > 0 ? `[${Math.ceil(gameState.restCooldown)}s]` : '[RESTORE ENERGY]'}
                  </div>
                </button>
                <button
                  onClick={actions.startMeditation}
                  disabled={gameState.energy < 10}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '20px',
                    cursor: gameState.energy >= 10 ? 'pointer' : 'not-allowed',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s',
                    opacity: gameState.energy >= 10 ? 1 : 0.4,
                    textAlign: 'center'
                  }}
                >
                  <div>MEDITATE</div>
                  <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '6px' }}>[-10 ENERGY, +SANITY]</div>
                </button>
                {gameState.upgrades.debugger && (
                  <button
                    onClick={actions.startDebugSession}
                    disabled={gameState.energy < 10}
                    style={{
                      ...getDistortionStyle(gameState.sanity),
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-color)',
                      padding: '20px',
                      cursor: gameState.energy >= 10 ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      letterSpacing: '0.5px',
                      transition: 'all 0.2s',
                      opacity: gameState.energy >= 10 ? 1 : 0.4,
                      textAlign: 'center'
                    }}
                  >
                    <div>{distortText('DEBUG', gameState.sanity)}</div>
                    <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '6px' }}>[-10 ENERGY]</div>
                  </button>
                )}
                {gameState.location === 'portal' && (
                  <button
                    onClick={enterDimensionalArea}
                    disabled={gameState.portalCooldown > 0}
                    style={{
                      background: 'none',
                      border: '1px solid #00ffff',
                      color: '#00ffff',
                      padding: '20px',
                      cursor: gameState.portalCooldown > 0 ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      letterSpacing: '0.5px',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                      boxShadow: gameState.portalCooldown > 0 ? 'none' : '0 0 10px rgba(0, 255, 255, 0.3)',
                      opacity: gameState.portalCooldown > 0 ? 0.4 : 1
                    }}
                  >
                    <div>ENTER PORTAL</div>
                    <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '6px' }}>
                      {gameState.portalCooldown > 0 ? `[${Math.ceil(gameState.portalCooldown)}s]` : '[DIMENSIONAL MINING]'}
                    </div>
                  </button>
                )}
              </div>
            </div>

            {gameState.unlockedLocations.length > 1 && (
              <div style={{ marginBottom: '40px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
                  LOCATIONS
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '12px'
                }}>
                  {gameState.unlockedLocations.map(loc => (
                    <button
                      key={loc}
                      onClick={() => actions.changeLocation(loc)}
                      disabled={gameState.location === loc}
                      style={{
                        background: gameState.location === loc ? 'var(--accent-color)' : 'none',
                        border: '1px solid var(--border-color)',
                        color: gameState.location === loc ? 'var(--bg-color)' : 'var(--text-color)',
                        padding: '14px',
                        cursor: gameState.location === loc ? 'default' : 'pointer',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        letterSpacing: '0.5px',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }}
                    >
                      {LOCATIONS[loc]?.name || 'Unknown Location'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameState.location === 'archive' && currentLocation.items && (
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
                  ARCHIVED ITEMS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentLocation.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => actions.examineItem(item)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-color)',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        letterSpacing: '0.5px'
                      }}
                    >
                      📄 {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{
              border: '1px solid var(--border-color)',
              padding: '24px',
              marginBottom: '30px',
              backgroundColor: 'var(--hover-color)'
            }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '20px' }}>
                PLAYER
              </div>
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>LEVEL</span>
                  <strong style={{ fontSize: '18px', color: '#4a90e2' }}>{gameState.playerLevel || 1}</strong>
                </div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
                  {gameState.playerXP || 0} / {LEVEL_SYSTEM.getXPForLevel((gameState.playerLevel || 1) + 1)} XP
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: `${((gameState.playerXP || 0) / LEVEL_SYSTEM.getXPForLevel((gameState.playerLevel || 1) + 1)) * 100}%`,
                    height: '100%',
                    backgroundColor: '#4a90e2',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                  <span>SKILL POINTS</span>
                  <strong style={{ fontSize: '18px', color: '#ffaa00' }}>{gameState.skillPoints || 0}</strong>
                </div>
              </div>
            </div>

            <div style={{
              border: '1px solid var(--border-color)',
              padding: '24px',
              marginBottom: '30px',
              backgroundColor: 'var(--hover-color)'
            }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '20px' }}>
                RESOURCES
              </div>
              <div style={{ fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span>PP</span>
                  <strong style={{ fontSize: '18px' }}>{Math.floor(gameState.pp)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span>ENERGY</span>
                  <strong style={{ fontSize: '18px' }}>{Math.floor(gameState.energy)}%</strong>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  color: gameState.sanity < 30 ? '#ff0000' : 'inherit'
                }}>
                  <span>SANITY</span>
                  <strong style={{ fontSize: '18px' }}>{Math.floor(gameState.sanity)}%</strong>
                </div>
                {gameState.ppPerSecond > 0 && (
                  <div style={{
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-color)',
                    textAlign: 'center',
                    opacity: 0.7,
                    fontSize: '12px'
                  }}>
                    +{gameState.ppPerSecond.toFixed(1)} PP/sec
                  </div>
                )}
              </div>
            </div>

            {Object.keys(gameState.dimensionalInventory || {}).length > 0 && (
              <div style={{
                border: '1px solid var(--border-color)',
                padding: '24px',
                marginBottom: '30px',
                backgroundColor: 'var(--hover-color)'
              }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '20px' }}>
                  DIMENSIONAL MATERIALS
                </div>
                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {DIMENSIONAL_MATERIALS.map(material => {
                    const count = gameState.dimensionalInventory[material.id] || 0;
                    if (count === 0) return null;
                    return (
                      <div key={material.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: material.color,
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: `0 0 4px ${material.color}`
                          }} />
                          <span style={{ fontSize: '11px' }}>{material.name}</span>
                        </div>
                        <strong>{count}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {Object.keys(gameState.dimensionalInventory || {}).some(key => gameState.dimensionalInventory[key] > 0) && (
              <DimensionalUpgradesDisplay gameState={gameState} onPurchase={purchaseDimensionalUpgrade} />
            )}

            {availableUpgrades.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
                  UPGRADES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {availableUpgrades.slice(0, 5).map(upgrade => (
                    <div
                      key={upgrade.id}
                      style={{ position: 'relative' }}
                      onMouseEnter={() => setHoveredUpgrade(upgrade.id)}
                      onMouseLeave={() => setHoveredUpgrade(null)}
                    >
                      <button
                        onClick={() => actions.buyUpgrade(upgrade)}
                        disabled={gameState.pp < upgrade.cost}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-color)',
                          padding: '16px',
                          cursor: gameState.pp >= upgrade.cost ? 'pointer' : 'not-allowed',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          opacity: gameState.pp >= upgrade.cost ? 1 : 0.4
                        }}
                      >
                        <div style={{ fontWeight: '500', marginBottom: '8px', fontSize: '13px' }}>
                          {upgrade.name}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>
                          {upgrade.desc}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--accent-color)' }}>
                          {upgrade.cost} PP
                        </div>
                      </button>
                      
                      {hoveredUpgrade === upgrade.id && (
                        <div style={{
                          position: 'absolute',
                          left: '110%',
                          top: '0',
                          backgroundColor: 'var(--bg-color)',
                          border: '1px solid var(--accent-color)',
                          padding: '12px 16px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          zIndex: 1000,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                          pointerEvents: 'none'
                        }}>
                          <div style={{ 
                            color: 'var(--accent-color)', 
                            fontWeight: '500', 
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Effect:
                          </div>
                          <div style={{ color: 'var(--text-color)' }}>
                            {getUpgradeTooltip(upgrade)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
                ACHIEVEMENTS ({gameState.achievements.length}/{ACHIEVEMENTS.length})
              </div>
              <div style={{
                border: '1px solid var(--border-color)',
                padding: '16px',
                backgroundColor: 'var(--hover-color)',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {ACHIEVEMENTS.map(ach => {
                  const unlocked = gameState.achievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      style={{
                        marginBottom: '12px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid var(--border-color)',
                        opacity: unlocked ? 1 : 0.4,
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                        {unlocked ? '🏆' : '🔒'} {unlocked ? ach.name : '???'}
                      </div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>
                        {unlocked ? ach.desc : 'Hidden achievement'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {gameState.phase === 3 && gameState.sanity < 20 && (
          <div style={{
            marginTop: '40px',
            padding: '20px',
            border: '1px solid var(--border-color)',
            fontSize: '13px',
            opacity: 0.8,
            textAlign: 'center'
          }}>
            The roof. The answer is on the roof. Or is it?
          </div>
        )}

        {showDebugMenu && (
          <div style={{
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
              fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
              maxWidth: '500px',
              width: '90%',
              border: '1px solid var(--border-color)',
              padding: '40px',
              backgroundColor: 'var(--bg-color)'
            }}>
              <div style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.6,
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                DEBUG MENU
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', marginBottom: '12px', opacity: 0.7 }}>
                  SET SANITY LEVEL
                </div>
                <input
                  type="number"
                  value={debugSanityLevel}
                  onChange={(e) => setDebugSanityLevel(e.target.value)}
                  placeholder="0-100"
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '12px',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    backgroundColor: 'var(--hover-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)'
                  }}
                />
                <button
                  onClick={handleSetSanity}
                  disabled={!debugSanityLevel}
                  style={{
                    width: '100%',
                    background: 'var(--accent-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--bg-color)',
                    padding: '12px',
                    cursor: debugSanityLevel ? 'pointer' : 'not-allowed',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px',
                    opacity: debugSanityLevel ? 1 : 0.4
                  }}
                >
                  SET SANITY
                </button>
              </div>

              <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', marginBottom: '12px', opacity: 0.7 }}>
                  ADD DIMENSIONAL MATERIALS
                </div>
                <select
                  value={debugMaterialId}
                  onChange={(e) => setDebugMaterialId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '12px',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    backgroundColor: 'var(--hover-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)'
                  }}
                >
                  <option value="">Select Material</option>
                  {DIMENSIONAL_MATERIALS.map(mat => (
                    <option key={mat.id} value={mat.id}>{mat.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={debugMaterialAmount}
                  onChange={(e) => setDebugMaterialAmount(e.target.value)}
                  placeholder="Amount"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '12px',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    backgroundColor: 'var(--hover-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)'
                  }}
                />
                <button
                  onClick={handleAddMaterial}
                  disabled={!debugMaterialId || !debugMaterialAmount}
                  style={{
                    width: '100%',
                    background: 'var(--accent-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--bg-color)',
                    padding: '12px',
                    cursor: debugMaterialId && debugMaterialAmount ? 'pointer' : 'not-allowed',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px',
                    opacity: debugMaterialId && debugMaterialAmount ? 1 : 0.4
                  }}
                >
                  ADD MATERIAL
                </button>
              </div>

              <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', marginBottom: '12px', opacity: 0.7 }}>
                  QUICK ACTIONS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setGameState(prev => ({
                        ...prev,
                        sanity: 100,
                        energy: 100
                      }));
                      addMessage('Resources restored.');
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-color)',
                      padding: '12px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                      letterSpacing: '0.5px'
                    }}
                  >
                    RESTORE SANITY & ENERGY
                  </button>
                  <button
                    onClick={() => {
                      setGameState(prev => ({
                        ...prev,
                        portalCooldown: 0,
                        restCooldown: 0
                      }));
                      addMessage('Cooldowns reset.');
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-color)',
                      padding: '12px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                      letterSpacing: '0.5px'
                    }}
                  >
                    RESET COOLDOWNS
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowDebugMenu(false)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  padding: '12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  letterSpacing: '0.5px'
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        )}

        {showSaveMenu && (
          <div style={{
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
              fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
              maxWidth: '500px',
              width: '90%',
              border: '1px solid var(--border-color)',
              padding: '40px',
              backgroundColor: 'var(--bg-color)'
            }}>
              <div style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.6,
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                SAVE / LOAD GAME
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleSaveGame}
                  style={{
                    background: 'var(--accent-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--bg-color)',
                    padding: '16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px',
                    fontWeight: '500'
                  }}
                >
                  💾 SAVE TO FILE
                </button>

                <button
                  onClick={() => document.getElementById('file-input').click()}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px'
                  }}
                >
                  📁 LOAD FROM FILE
                </button>
                <input
                  id="file-input"
                  type="file"
                  accept=".json"
                  onChange={handleLoadGame}
                  style={{ display: 'none' }}
                />

                <button
                  onClick={handleExportClipboard}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px'
                  }}
                >
                  📋 COPY TO CLIPBOARD
                </button>

                <button
                  onClick={handleImportClipboard}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px'
                  }}
                >
                  📥 PASTE FROM CLIPBOARD
                </button>

                <button
                  onClick={() => setShowSaveMenu(false)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '12px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px',
                    marginTop: '12px'
                  }}
                >
                  CANCEL
                </button>
              </div>

              <div style={{
                marginTop: '30px',
                fontSize: '10px',
                opacity: 0.5,
                textAlign: 'center',
                lineHeight: '1.6'
              }}>
                Save files contain your complete game progress.<br/>
                Keep backups. Reality is fragile.
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}