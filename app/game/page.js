'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MeditationModal from './MeditationModal';
import DebugModal from './DebugModal';
import DebugPanel from './DebugPanel';
import ColleagueModal from './ColleagueModal';
import ExamineModal from './ExamineModal';
import DimensionalArea from './DimensionalArea';
import DimensionalUpgradesDisplay from './DimensionalUpgradesDisplay';
import SkillTreeModal from './SkillTreeModal';
import PrinterRoom from './PrinterRoom';
import CombatModal from './CombatModal';
import Armory from './Armory';
import HelpPopup from './HelpPopup';
import { createGameActions } from './gameActions';
import { getDistortionStyle, distortText, getClockTime, createLevelUpParticles, createSkillPurchaseParticles, createScreenShake } from './gameUtils';
import { saveGame, loadGame, exportToClipboard, importFromClipboard } from './saveSystem';
import { addExperience, purchaseSkill, getActiveSkillEffects, getModifiedPortalCooldown, getModifiedCapacity } from './skillSystemHelpers';
import { SKILLS, LEVEL_SYSTEM, XP_REWARDS } from './skillTreeConstants';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';
import { getPlayerCombatStats } from './combatConstants';
import { getSanityTierDisplay } from './sanityPaperHelpers';
import {
  INITIAL_GAME_STATE,
  LOCATIONS,
  UPGRADES,
  ACHIEVEMENTS,
  EVENTS,
  STRANGE_COLLEAGUE_DIALOGUES,
  PRINTER_UPGRADES,
  HELP_POPUPS,
  HELP_TRIGGERS
} from './constants';

export default function Game() {
  const [isMobile, setIsMobile] = useState(false);
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
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
      // Pass empty function to prevent addExperience from adding messages
      const xpResult = addExperience(prev, amount, () => {});
      
      // Manually add level-up message here to avoid duplicates
      const messages = [];
      if (xpResult.leveledUp) {
        const levelsGained = xpResult.playerLevel - prev.playerLevel;
        const skillPointsGained = xpResult.skillPoints - (prev.skillPoints || 0);
        
        if (levelsGained === 1) {
          messages.push(`🎉 LEVEL UP! You are now level ${xpResult.playerLevel}. +${skillPointsGained} Skill Point${skillPointsGained > 1 ? 's' : ''}!`);
        } else {
          messages.push(`🎉 LEVEL UP! You gained ${levelsGained} levels and are now level ${xpResult.playerLevel}. +${skillPointsGained} Skill Points!`);
        }
        
        setTimeout(() => {
          createLevelUpParticles();
        }, 100);
      }
      
      return {
        ...prev,
        ...xpResult,
        recentMessages: messages.length > 0 
          ? [...messages, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
          : prev.recentMessages
      };
    });
  }, []);

  const checkAchievements = useCallback(() => {
    setGameState(prev => {
      const newAchievements = [...prev.achievements];
      const achievementMessages = [];
      let hasNew = false;
      let totalXP = 0;
  
      ACHIEVEMENTS.forEach(achievement => {
        if (!newAchievements.includes(achievement.id) && achievement.check(prev)) {
          newAchievements.push(achievement.id);
          hasNew = true;
          achievementMessages.push(`🏆 ACHIEVEMENT: ${achievement.name} (+${XP_REWARDS.completeAchievement} XP)`);
          totalXP += XP_REWARDS.completeAchievement;
        }
      });
  
      if (hasNew) {
        // Pass a callback that adds to achievementMessages instead of directly calling addMessage
        const xpResult = addExperience(prev, totalXP, (msg) => {
          achievementMessages.push(msg);
        });
        
        if (xpResult.leveledUp) {
          setTimeout(() => {
            createLevelUpParticles();
          }, 0);
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
  }, []);

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

            // Trigger screen shake effect
            setTimeout(() => createScreenShake(), 0);

            return {
              ...prev,
              themeToggleCount: newCount,
              portalUnlocked: true,
              unlockedLocations: [...new Set([...prev.unlockedLocations, 'portal'])],
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
      const result = purchaseSkill(prev, skillId, addMessage);
      
      // If purchase failed (not enough points)
      if (result === prev && (prev.skillPoints || 0) < 1) {
        createScreenShake();
        return prev;
      }
      
      // If purchase was successful
      if (result !== prev) {
        const skill = SKILLS[skillId];
        const newLevel = result.skills?.[skillId] || 0;
        
        setTimeout(() => createSkillPurchaseParticles(), 0);
        
        return {
          ...result,
          recentMessages: [`✨ Learned ${skill.name} (Level ${newLevel})!`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
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
        if (upgrade.value === 'armory') {
          newState.unlockedLocations = [...new Set([...prev.unlockedLocations, 'armory'])];
          newState.recentMessages = ['The bottom drawer opens. Impossibly deep. An arsenal awaits.', '🔓 NEW LOCATION: The Armory', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
        }
      } else if (upgrade.effect === 'equipment') {
        // Equipment is unlocked via dimensional upgrades, message added
        newState.recentMessages = [`Crafted: ${upgrade.name}. Available in the Armory.`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
      }

      grantXP(XP_REWARDS.purchaseDimensionalUpgrade);
      setTimeout(() => checkAchievements(), 50);
      return newState;
    });
  };

  const getPrinterUpgradeTooltip = (upgrade) => {
    const effects = [];

    if (upgrade.effect === 'printerQuality') {
      effects.push(`+${upgrade.value}% printer quality`);
    } else if (upgrade.effect === 'paperPerPrint') {
      effects.push(`+${upgrade.value} Paper per print`);
    } else if (upgrade.effect === 'paperPerSecond') {
      effects.push(`+${upgrade.value} Paper per second (passive)`);
    } else if (upgrade.effect === 'ppPerPrint') {
      effects.push(`+${upgrade.value} PP per print`);
    }

    return effects.length > 0 ? effects.join(' • ') : 'Unknown effect';
  };

  const getUpgradeTooltip = (upgrade) => {
    const effects = [];

    if (upgrade.effect === 'ppPerClick') {
      effects.push(`+${upgrade.value} PP per click`);
    } else if (upgrade.effect === 'ppPerSecond') {
      effects.push(`+${upgrade.value} PP per second (passive income)`);
    } else if (upgrade.effect === 'maxEnergy') {
      effects.push(`Max energy +${upgrade.value}`);
    } else if (upgrade.effect === 'sanityDrain') {
      effects.push(`Sanity drains ${upgrade.value * 100}% slower`);
    } else if (upgrade.effect === 'unlock') {
      const unlockMap = {
        'debug': 'Unlocks Debug challenges',
        'archive': 'Unlocks The Archive',
        'armory': 'Unlocks The Armory',
        'converter': 'Unlocks Material Converter',
        'imbuing': 'Unlocks Weapon Imbuing',
        'lore': 'Unlocks Dimensional Codex',
        'ending': 'Unlocks Final Ending',
        'void': 'Unlocks The Void',
        'printer': 'Unlocks Printer Room'
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

        if (prev.paperPerSecond > 0) {
          newState.paper = prev.paper + (prev.paperPerSecond / 10);
        }

        newState.timeInOffice = prev.timeInOffice + 0.1;
        if (Math.floor(newState.timeInOffice) % 60 === 0 && Math.floor(newState.timeInOffice) !== Math.floor(prev.timeInOffice)) {
          newState.day = prev.day + 1;
        }

        // Sanity drain system - base drain reduced by upgrades
        if (prev.phase >= 2) {
          let sanityDrainRate = 0.05; // Base drain rate

          // Pills reduce drain by 50%
          if (prev.upgrades.pills) {
            sanityDrainRate *= 0.5;
          }

          // Void Shield reduces drain by additional 50%
          if (prev.dimensionalUpgrades?.void_shield) {
            sanityDrainRate *= 0.5;
          }

          // Apply sanity drain
          newState.sanity = Math.max(0, prev.sanity - sanityDrainRate);
        }

        // Reality Anchor sets minimum sanity threshold
        if (prev.dimensionalUpgrades?.reality_anchor && newState.sanity < 20) {
          newState.sanity = 20;
        }

        // Colleague events only trigger in Break Room
        const currentLoc = LOCATIONS[prev.location];
        if (!prev.strangeColleagueEvent && !prev.debugMode && !prev.meditating &&
            prev.day >= 3 && currentLoc?.allowColleagueEvents && Math.random() < 0.01) {
          const randomDialogue = STRANGE_COLLEAGUE_DIALOGUES[Math.floor(Math.random() * STRANGE_COLLEAGUE_DIALOGUES.length)];
          newState.strangeColleagueEvent = randomDialogue;
          addMessage('A colleague approaches. Their smile doesn\'t reach their eyes.');
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

  // Help system: Check for triggered popups
  useEffect(() => {
    if (!gameState.helpEnabled) return;

    // Use a ref to store previous state for comparisons
    const prevStateRef = {current: null};

    return () => {
      prevStateRef.current = gameState;
    };
  }, []);

  useEffect(() => {
    if (!gameState.helpEnabled || gameState.currentHelpPopup) return;

    // Check each trigger
    for (const [popupId, triggerFn] of Object.entries(HELP_TRIGGERS)) {
      // Skip if already shown
      if (gameState.shownHelpPopups.includes(popupId)) continue;

      // Get the popup data
      const popup = HELP_POPUPS[popupId];
      if (!popup) continue;

      // Check if trigger condition is met
      // We pass both current and a simple previous state (from a tick ago)
      if (triggerFn(gameState, null)) {
        // Trigger this popup
        setGameState(prev => ({
          ...prev,
          currentHelpPopup: popup
        }));
        break; // Only show one popup at a time
      }
    }
  }, [gameState, gameState.helpEnabled, gameState.currentHelpPopup, gameState.shownHelpPopups]);

  // Meditation unlock: Only unlock when sanity drops to 25% or below
  useEffect(() => {
    if (!gameState.meditationUnlocked && gameState.sanity <= 25) {
      setGameState(prev => ({
        ...prev,
        meditationUnlocked: true
      }));
    }
  }, [gameState.sanity, gameState.meditationUnlocked]);

  const dismissHelpPopup = () => {
    setGameState(prev => {
      if (!prev.currentHelpPopup) return prev;

      return {
        ...prev,
        currentHelpPopup: null,
        shownHelpPopups: [...prev.shownHelpPopups, prev.currentHelpPopup.id]
      };
    });
  };

  const toggleHelpSystem = () => {
    setGameState(prev => ({
      ...prev,
      helpEnabled: !prev.helpEnabled
    }));
    addMessage(gameState.helpEnabled ? 'Help popups disabled.' : 'Help popups enabled.');
  };

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


  if (gameState.showSkillTree) {
    return <SkillTreeModal gameState={gameState} onClose={() => setGameState(prev => ({ ...prev, showSkillTree: false }))} onPurchaseSkill={handlePurchaseSkill} />;
  }

  if (gameState.inDimensionalArea) {
    return <DimensionalArea gameState={gameState} setGameState={setGameState} onExit={exitDimensionalArea} grantXP={grantXP} />;
  }

  if (gameState.inPrinterRoom) {
    return <PrinterRoom gameState={gameState} setGameState={setGameState} onExit={() => setGameState(prev => ({ ...prev, inPrinterRoom: false }))} grantXP={grantXP} actions={actions} />;
  }

  if (gameState.inArmory) {
    return <Armory gameState={gameState} setGameState={setGameState} onExit={() => setGameState(prev => ({ ...prev, inArmory: false }))} />;
  }

  if (gameState.meditating) {
    return <MeditationModal gameState={gameState} breatheAction={actions.breatheAction} cancelMeditation={actions.cancelMeditation} />;
  }

  if (gameState.examiningItem) {
    return <ExamineModal item={gameState.examiningItem} closeExamine={actions.closeExamine} />;
  }

  if (gameState.inCombat) {
    const playerStats = getPlayerCombatStats(gameState);
    return (
      <CombatModal
        enemy={gameState.currentEnemy}
        playerStats={playerStats}
        onAttack={actions.playerAttack}
        onEscape={actions.escapeCombat}
        onEndCombat={actions.endCombat}
        combatLog={gameState.combatLog}
        isPlayerTurn={gameState.isPlayerTurn}
        combatEnded={gameState.combatEnded}
      />
    );
  }

  if (gameState.strangeColleagueEvent) {
    // Player has weapon if they have any weapons in loot inventory or equipped weapon is not the starter
    const hasLootWeapons = (gameState.lootInventory || []).some(item => item.type === 'weapon');
    const hasWeapon = hasLootWeapons || (gameState.equippedWeapon && gameState.equippedWeapon !== 'stapler_shiv');
    return (
      <ColleagueModal
        event={gameState.strangeColleagueEvent}
        recentMessages={gameState.recentMessages}
        respondToColleague={actions.respondToColleague}
        hasWeapon={hasWeapon}
        onStartCombat={actions.startCombat}
      />
    );
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
              onClick={toggleHelpSystem}
              style={{
                background: 'none',
                border: `1px solid ${gameState.helpEnabled ? '#ffaa00' : '#666666'}`,
                color: gameState.helpEnabled ? '#ffaa00' : '#666666',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'inherit',
                opacity: 0.8
              }}
            >
              {gameState.helpEnabled ? '📖 HELP' : '📕 HELP'}
            </button>
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
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
                {gameState.meditationUnlocked && (
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
                )}
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
                  <strong style={{ fontSize: '18px' }}>{gameState.pp.toFixed(1)}</strong>
                </div>
                {gameState.printerUnlocked && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span>PAPER</span>
                    <strong style={{ fontSize: '18px' }}>{gameState.paper.toFixed(1)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span>ENERGY</span>
                  <strong style={{ fontSize: '18px' }}>{gameState.energy.toFixed(1)}%</strong>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  color: gameState.sanity < 30 ? '#ff0000' : 'inherit'
                }}>
                  <span>SANITY</span>
                  <strong style={{ fontSize: '18px' }}>{gameState.sanity.toFixed(1)}%</strong>
                </div>
                {(() => {
                  const sanityDisplay = getSanityTierDisplay(gameState);
                  return (
                    <div style={{
                      fontSize: '10px',
                      marginBottom: '16px',
                      padding: '8px',
                      backgroundColor: 'var(--bg-color)',
                      border: `1px solid ${sanityDisplay.color}`,
                      borderRadius: '2px'
                    }}>
                      <div style={{ color: sanityDisplay.color, fontWeight: 'bold', marginBottom: '4px' }}>
                        {sanityDisplay.tierName}
                      </div>
                      <div style={{ opacity: 0.8, marginBottom: '4px' }}>
                        PP: {sanityDisplay.ppModifier >= 1 ? '+' : ''}{((sanityDisplay.ppModifier - 1) * 100).toFixed(0)}% |
                        XP: {sanityDisplay.xpModifier >= 1 ? '+' : ''}{((sanityDisplay.xpModifier - 1) * 100).toFixed(0)}%
                      </div>
                      {gameState.printerUnlocked && (
                        <div style={{ opacity: 0.8 }}>
                          Paper Quality: {sanityDisplay.paperQuality}%
                        </div>
                      )}
                    </div>
                  );
                })()}
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
                {gameState.paperPerSecond > 0 && (
                  <div style={{
                    paddingTop: gameState.ppPerSecond > 0 ? '8px' : '16px',
                    borderTop: gameState.ppPerSecond > 0 ? 'none' : '1px solid var(--border-color)',
                    textAlign: 'center',
                    opacity: 0.7,
                    fontSize: '12px'
                  }}>
                    +{gameState.paperPerSecond.toFixed(1)} Paper/sec
                  </div>
                )}
                {gameState.activeReportBuffs && gameState.activeReportBuffs.length > 0 && (
                  <div style={{
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-color)',
                    marginTop: '16px'
                  }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '8px' }}>
                      ACTIVE BUFFS
                    </div>
                    {gameState.activeReportBuffs.map((buff, idx) => {
                      const timeLeft = Math.max(0, Math.ceil((buff.expiresAt - Date.now()) / 1000));
                      if (timeLeft <= 0) return null;
                      return (
                        <div key={idx} style={{
                          fontSize: '10px',
                          padding: '6px',
                          backgroundColor: 'var(--bg-color)',
                          border: '1px solid #4a90e2',
                          borderRadius: '2px',
                          marginBottom: '4px'
                        }}>
                          <div style={{ color: '#4a90e2', fontWeight: 'bold' }}>{buff.name}</div>
                          <div style={{ opacity: 0.8 }}>{timeLeft}s remaining</div>
                        </div>
                      );
                    })}
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

            {gameState.printerUnlocked && PRINTER_UPGRADES.filter(u => !gameState.printerUpgrades?.[u.id]).length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
                  PRINTER UPGRADES
                </div>
                {gameState.printerQuality !== undefined && (
                  <div style={{
                    fontSize: '11px',
                    marginBottom: '12px',
                    padding: '8px',
                    backgroundColor: 'var(--hover-color)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    Printer Quality: {gameState.printerQuality}%
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {PRINTER_UPGRADES.filter(u => !gameState.printerUpgrades?.[u.id]).slice(0, 5).map(upgrade => {
                    const canAffordPP = gameState.pp >= upgrade.costs.pp;
                    const canAffordPaper = gameState.paper >= upgrade.costs.paper;
                    const canAfford = canAffordPP && canAffordPaper;

                    return (
                      <div
                        key={upgrade.id}
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setHoveredUpgrade(`printer_${upgrade.id}`)}
                        onMouseLeave={() => setHoveredUpgrade(null)}
                      >
                        <button
                          onClick={() => actions.buyPrinterUpgrade(upgrade)}
                          disabled={!canAfford}
                          style={{
                            width: '100%',
                            background: 'none',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-color)',
                            padding: '16px',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            opacity: canAfford ? 1 : 0.4
                          }}
                        >
                          <div style={{ fontWeight: '500', marginBottom: '8px', fontSize: '13px' }}>
                            {upgrade.name}
                          </div>
                          <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>
                            {upgrade.desc}
                          </div>
                          <div style={{ fontSize: '12px', display: 'flex', gap: '12px' }}>
                            <span style={{ color: canAffordPP ? 'var(--accent-color)' : '#ff6666' }}>
                              {upgrade.costs.pp} PP
                            </span>
                            <span style={{ color: canAffordPaper ? 'var(--text-color)' : '#ff6666' }}>
                              {upgrade.costs.paper} Paper
                            </span>
                          </div>
                        </button>

                        {hoveredUpgrade === `printer_${upgrade.id}` && (
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
                              {getPrinterUpgradeTooltip(upgrade)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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

        {showDebugPanel && (
          <DebugPanel
            gameState={gameState}
            setGameState={setGameState}
            addMessage={addMessage}
            onClose={() => setShowDebugPanel(false)}
          />
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

      {/* Help Popup System */}
      <HelpPopup
        popup={gameState.currentHelpPopup}
        onDismiss={dismissHelpPopup}
      />
    </>
  );
}