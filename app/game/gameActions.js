/**
 * Game Action Handlers
 *
 * Contains all game actions that modify game state.
 * Actions are created via factory function to access setState, addMessage, etc.
 *
 * Main actions:
 * - sortPapers: Main productivity action (costs energy, grants PP)
 * - rest: Restore energy (30s cooldown)
 * - meditation: Breathing rhythm minigame for sanity
 * - debug: Code debugging challenges
 * - locations: Navigate between office areas
 * - upgrades: Purchase permanent improvements
 * - printer: Paper generation system
 */
import { LOCATIONS, UPGRADES, DEBUG_CHALLENGES, PRINTER_UPGRADES } from './constants';
import {
  applyEnergyCostReduction,
  applyPPMultiplier
} from './skillSystemHelpers';
import { XP_REWARDS } from './skillTreeConstants';
import { generateEnemy, getPlayerCombatStats, COMBAT_MECHANICS } from './combatConstants';


export const createGameActions = (setGameState, addMessage, checkAchievements, grantXP) => {
  
  const triggerScreenEffect = (effectType) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      pointer-events: none;
    `;

    if (effectType === 'flash') {
      overlay.style.background = 'white';
      overlay.style.animation = 'flash 0.8s ease-out';
      const style = document.createElement('style');
      style.textContent = `
        @keyframes flash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    } else if (effectType === 'shake') {
      document.body.style.animation = 'shake 0.5s ease-in-out';
      const style = document.createElement('style');
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-5px, -5px); }
          20%, 40%, 60%, 80% { transform: translate(5px, 5px); }
        }
      `;
      document.head.appendChild(style);
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
    }

    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.remove();
    }, 1000);
  };
  
  const sortPapers = () => {
    setGameState(prev => {
      // Apply skill effects to energy cost
      const baseEnergyCost = 2;
      const energyCost = applyEnergyCostReduction(baseEnergyCost, prev);
      
      if (prev.energy < energyCost) {  // Changed from < 5
        return {
          ...prev,
          recentMessages: ['Too exhausted. Your hands won\'t move.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }
      
      // Apply skill effects to PP gain
      const basePP = prev.ppPerClick;
      const ppGain = applyPPMultiplier(basePP, prev);
      
      const newState = {
        ...prev,
        pp: prev.pp + ppGain,
        energy: Math.max(0, prev.energy - energyCost),
        sortCount: (prev.sortCount || 0) + 1
      };
      
      grantXP(XP_REWARDS.sortPapers);
      checkAchievements();
      return newState;
    });
  };

  const rest = () => {
    setGameState(prev => {
      if (prev.restCooldown > 0) {
        return {
          ...prev,
          recentMessages: ['Still recovering. Your body refuses to relax yet.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }
      const maxEnergy = 100 + (prev.upgrades.energydrink ? 20 : 0);
      checkAchievements();
      return {
        ...prev,
        energy: maxEnergy,
        restCooldown: 30,
        recentMessages: ['You close your eyes. The fluorescent lights burn through your eyelids.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
      };
    });
  };

  const startMeditation = () => {
    const targetTime = 1500 + Math.random() * 1000; // Reduced from 3000-5000
    setGameState(prev => ({
      ...prev,
      meditating: true,
      breathCount: 0,
      meditationPhase: 'inhale',
      meditationStartTime: Date.now(),
      meditationTargetTime: targetTime,
      meditationScore: 0,
      meditationPerfectWindow: 200, // Reduced from 300
      recentMessages: ['Close your eyes. Focus on your breathing.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
    }));
  };

  const breatheAction = (action) => {
    setGameState(prev => {
      if (!prev.meditating) return prev;
      
      const currentTime = Date.now();
      const elapsed = currentTime - prev.meditationStartTime;
      const target = prev.meditationTargetTime;
      const perfectWindow = prev.meditationPerfectWindow;
      
      const isCorrectAction = prev.meditationPhase === action;
      if (!isCorrectAction) {
        return {
          ...prev,
          meditationScore: prev.meditationScore - 20,
          recentMessages: ['Wrong action! Focus on the rhythm...', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }
      
      const difference = Math.abs(elapsed - target);
      
      let points = 0;
      if (difference <= perfectWindow) {
        points = 100;
      } else if (difference <= perfectWindow * 2) {
        points = 75;
      } else if (difference <= perfectWindow * 4) {
        points = 50;
      } else if (difference <= perfectWindow * 6) {
        points = 25;
      } else {
        points = 10;
      }
      
      const newScore = prev.meditationScore + points;
      
      // Increment breath count only when completing a full cycle (after exhale -> moving to next inhale)
      let newBreathCount = prev.breathCount;
      if (action === 'exhale') {
        newBreathCount = prev.breathCount + 1;
      }
      
      // Complete after 3 full breaths (after 3 exhales)
      if (newBreathCount >= 3) {
        const avgScore = newScore / 6;
        let sanityGain = 0;
        let message = '';
        
        if (avgScore >= 85) {
          sanityGain = 40;
          message = 'Perfect rhythm achieved. Your mind is completely clear.';
        } else if (avgScore >= 70) {
          sanityGain = 30;
          message = 'Excellent control. Reality feels more stable.';
        } else if (avgScore >= 50) {
          sanityGain = 20;
          message = 'Good effort. Some peace returns.';
        } else if (avgScore >= 30) {
          sanityGain = 12;
          message = 'Struggling to focus. The lights still intrude.';
        } else {
          sanityGain = 5;
          message = 'Your rhythm is chaotic. The fluorescent hum grows louder.';
        }
        
        return {
          ...prev,
          meditating: false,
          breathCount: 0,
          sanity: Math.min(100, prev.sanity + sanityGain),
          energy: Math.max(0, prev.energy - 10),
          meditationPhase: null,
          meditationStartTime: null,
          meditationTargetTime: null,
          meditationScore: 0,
          recentMessages: [message, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }
      
      let nextPhase;
      let nextTargetTime;
      
      if (action === 'inhale') {
        nextPhase = 'exhale';
        nextTargetTime = 1000 + Math.random() * 800; // Reduced from 2500-4000
      } else {
        nextPhase = 'inhale';
        nextTargetTime = 1500 + Math.random() * 1000; // Reduced from 3000-5000
      }
      
      return {
        ...prev,
        breathCount: action === 'exhale' ? prev.breathCount + 1 : prev.breathCount,
        meditationPhase: nextPhase,
        meditationStartTime: Date.now(),
        meditationTargetTime: nextTargetTime,
        meditationScore: newScore
      };
    });
  };

  const cancelMeditation = () => {
    setGameState(prev => ({
      ...prev,
      meditating: false,
      breathCount: 0,
      meditationPhase: null,
      meditationStartTime: null,
      meditationTargetTime: null,
      meditationScore: 0,
      recentMessages: ['You open your eyes. The fluorescent lights are still humming.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
    }));
  };

  const startDebugSession = () => {
    const randomBug = DEBUG_CHALLENGES[Math.floor(Math.random() * DEBUG_CHALLENGES.length)];
    setGameState(prev => ({
      ...prev,
      debugMode: true,
      currentBug: { ...randomBug, userCode: randomBug.code },
      energy: Math.max(0, prev.energy - 10),
      recentMessages: ['Debug console initialized. Fix the errors.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
    }));
  };

  const submitDebug = () => {
    setGameState(prev => {
      if (!prev.currentBug) return prev;
      
      const isCorrect = prev.currentBug.userCode.trim() === prev.currentBug.correct.trim();
      
      if (isCorrect) {
        const reward = Math.floor(200 + Math.random() * 300);
        grantXP(15); // XP_REWARDS.completeDebug
        return {
          ...prev,
          pp: prev.pp + reward,
          debugMode: false,
          currentBug: null,
          debugAttempts: 0,
          sanity: Math.min(100, prev.sanity + 5),
          recentMessages: [`DEBUG SUCCESS: +${reward} PP. The code compiles. Reality stabilizes.`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      } else {
        const newAttempts = prev.debugAttempts + 1;
        if (newAttempts >= 3) {
          return {
            ...prev,
            debugMode: false,
            currentBug: null,
            debugAttempts: 0,
            sanity: Math.max(0, prev.sanity - 10),
            recentMessages: ['DEBUG FAILED: Maximum attempts exceeded. The bugs remain.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
          };
        }
        return {
          ...prev,
          debugAttempts: newAttempts,
          recentMessages: [`ERROR: Compilation failed. ${3 - newAttempts} attempts remaining.`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }
    });
  };

  const updateDebugCode = (newCode) => {
    setGameState(prev => ({
      ...prev,
      currentBug: { ...prev.currentBug, userCode: newCode }
    }));
  };

  const cancelDebug = () => {
    setGameState(prev => ({
      ...prev,
      debugMode: false,
      currentBug: null,
      debugAttempts: 0,
      recentMessages: ['Debug session terminated. The errors persist.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
    }));
  };

  const changeLocation = (loc) => {
    setGameState(prev => {
      if (!prev.unlockedLocations.includes(loc)) return prev;
      const locationData = LOCATIONS[loc];
      if (!locationData || !locationData.atmosphere) return prev;
      const randomAtmo = locationData.atmosphere[Math.floor(Math.random() * locationData.atmosphere.length)];
      return { 
        ...prev, 
        location: loc, 
        energy: Math.max(0, prev.energy - 5),
        recentMessages: [randomAtmo, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
      };
    });
  };

  const examineItem = (item) => {
    setGameState(prev => {
      const newExaminedItems = (prev.examinedItems || 0) + 1;
      checkAchievements();
      return {
        ...prev,
        examiningItem: item,
        examinedItems: newExaminedItems
      };
    });
  };

  const closeExamine = () => {
    setGameState(prev => ({
      ...prev,
      examiningItem: null
    }));
  };

  const respondToColleague = (response, responseIndex) => {
    setGameState(prev => {
      if (!prev.strangeColleagueEvent) return prev;
      
      if (response === "Agree with him") {
        const reward = Math.floor(300 + Math.random() * 500);
        grantXP(25); // XP_REWARDS.defeatColleague
        
        checkAchievements();
        
        return {
          ...prev,
          pp: prev.pp + reward,
          strangeColleagueEvent: null,
          sanity: Math.max(0, prev.sanity - 15),
          recentMessages: [`He smiles. It doesn't reach his eyes. You receive: Existential Token (+${reward} PP)`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      } else {
        const horribleReply = prev.strangeColleagueEvent.wrongResponses[responseIndex];
        
        const newDisagreements = prev.disagreementCount + 1;
        const newState = {
          ...prev,
          sanity: Math.max(0, prev.sanity - 5),
          disagreementCount: newDisagreements,
          strangeColleagueEvent: {
            ...prev.strangeColleagueEvent,
            lastResponse: horribleReply
          }
        };

        if (newDisagreements === 20 && !prev.unlockedLocations.includes('archive')) {
          newState.unlockedLocations = [...prev.unlockedLocations, 'archive'];
          newState.strangeColleagueEvent = null;
          
          triggerScreenEffect('shake');
          
          setTimeout(() => {
            setGameState(prevState => ({
              ...prevState,
              recentMessages: ['Reality fractures. A door appears that was always there. THE ARCHIVE calls to you.', '🔓 NEW LOCATION: The Archive', ...prevState.recentMessages].slice(0, prevState.maxLogMessages || 15)
            }));
          }, 600);
        }

        checkAchievements();
        return newState;
      }
    });
  };

  const buyUpgrade = (upgrade) => {
    setGameState(prev => {
      if (prev.pp < upgrade.cost || prev.upgrades[upgrade.id]) return prev;

      const messages = [];
      const newState = {
        ...prev,
        pp: prev.pp - upgrade.cost,
        upgrades: { ...prev.upgrades, [upgrade.id]: true }
      };

      if (upgrade.effect === 'ppPerClick') {
        newState.ppPerClick += upgrade.value;
      } else if (upgrade.effect === 'ppPerSecond') {
        newState.ppPerSecond += upgrade.value;
      } else if (upgrade.effect === 'unlock') {
        if (upgrade.value === 'debug') {
          messages.push('Debug access granted. Fix the system. Or break it further.');
        } else if (upgrade.value === 'printer') {
          newState.printerUnlocked = true;
          messages.push('Printer Room unlocked. The machines await your command.');
        }
      }

      messages.push(`Acquired: ${upgrade.name}`);
      newState.recentMessages = [...messages.reverse(), ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);

      grantXP(10); // XP_REWARDS.purchaseUpgrade
      checkAchievements();
      return newState;
    });
  };

  const printPaper = () => {
    setGameState(prev => {
      if (!prev.printerUnlocked) {
        return {
          ...prev,
          recentMessages: ['The printer room is locked. You need access first.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }

      const energyCost = 3;
      if (prev.energy < energyCost) {
        return {
          ...prev,
          recentMessages: ['Too exhausted to operate the printer.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }

      // Calculate paper gain based on upgrades
      const basePaperGain = prev.paperPerPrint || 1;
      const ppGain = prev.printerUpgrades?.reality_printer ? 5 : 0;

      // Generate distorted message based on printer quality
      let message;
      const quality = prev.printerQuality || 0;
      if (quality < 20) {
        const distortedMessages = [
          'T̷h̷e̷ ̷p̷r̷i̷n̷t̷e̷r̷ ̷s̷c̷r̷e̷a̷m̷s̷.̷ ̷P̷a̷p̷e̷r̷ ̷e̷m̷e̷r̷g̷e̷s̷,̷ ̷w̷a̷r̷p̷e̷d̷.̷',
          'The pages are bleeding ink. Is this even text?',
          'P̸̢̛̹͎̺̹͎̹A̴̹̹P̴E̴R̴ ̴D̴I̴S̴T̴O̴R̴T̴E̴D̴',
          'The printer stutters. Reality bleeds onto each page.',
          'W̴͓͝h̷̹̃ă̷̹t̷̬̾ ̷͎̄ī̴̹s̷̬̾ ̷̹̈́t̴̬̔h̷͓̕i̷̹̚s̷̬͘?̷̹̈́'
        ];
        message = distortedMessages[Math.floor(Math.random() * distortedMessages.length)];
      } else if (quality < 50) {
        message = 'The printer hums. Text is mostly readable now.';
      } else if (quality < 80) {
        message = 'Clean print. Professional quality.';
      } else {
        message = 'Perfect output. Each page identical to the last. Forever.';
      }

      const newState = {
        ...prev,
        paper: prev.paper + basePaperGain,
        pp: prev.pp + ppGain,
        energy: Math.max(0, prev.energy - energyCost),
        printCount: (prev.printCount || 0) + 1,
        recentMessages: [message, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
      };

      grantXP(XP_REWARDS.sortPapers); // Same XP as sorting papers
      checkAchievements();
      return newState;
    });
  };

  const buyPrinterUpgrade = (upgrade) => {
    setGameState(prev => {
      const ppCost = upgrade.costs.pp;
      const paperCost = upgrade.costs.paper;

      if (prev.pp < ppCost || prev.paper < paperCost || prev.printerUpgrades?.[upgrade.id]) {
        return prev;
      }

      const newState = {
        ...prev,
        pp: prev.pp - ppCost,
        paper: prev.paper - paperCost,
        printerUpgrades: { ...(prev.printerUpgrades || {}), [upgrade.id]: true }
      };

      // Apply upgrade effects
      if (upgrade.effect === 'printerQuality') {
        newState.printerQuality = Math.min(100, (prev.printerQuality || 0) + upgrade.value);
      } else if (upgrade.effect === 'paperPerPrint') {
        newState.paperPerPrint = (prev.paperPerPrint || 1) + upgrade.value;
      } else if (upgrade.effect === 'paperPerSecond') {
        newState.paperPerSecond = (prev.paperPerSecond || 0) + upgrade.value;
      } else if (upgrade.effect === 'ppPerPrint') {
        // This is handled in printPaper action
      }

      newState.recentMessages = [`Installed: ${upgrade.name}`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);

      grantXP(10); // XP_REWARDS.purchaseUpgrade
      checkAchievements();
      return newState;
    });
  };

  const enterPrinterRoom = () => {
    setGameState(prev => ({
      ...prev,
      inPrinterRoom: true
    }));
  };

  // Combat Actions
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

  const playerAttack = () => {
    setGameState(prev => {
      if (!prev.isPlayerTurn || prev.combatEnded || !prev.currentEnemy) return prev;

      const playerStats = getPlayerCombatStats(prev);
      const enemy = { ...prev.currentEnemy };
      const log = [...prev.combatLog];

      // Calculate damage
      const isCrit = Math.random() < playerStats.critChance;
      let damage = playerStats.damage;

      if (isCrit) {
        damage = Math.floor(damage * playerStats.critMultiplier);
        log.push({
          type: 'critical',
          message: `💥 CRITICAL HIT! You strike for ${damage} damage!`
        });
      } else {
        log.push({
          type: 'damage_enemy',
          message: `⚔️ You attack for ${damage} damage.`
        });
      }

      enemy.currentHP = Math.max(0, enemy.currentHP - damage);

      // Check if enemy defeated
      if (enemy.currentHP <= 0) {
        log.push({
          type: 'victory',
          message: `🏆 Victory! ${enemy.displayName} has been defeated!`
        });
        log.push({
          type: 'reward',
          message: `Gained ${enemy.ppReward} PP and ${enemy.xpReward} XP!`
        });

        // Grant rewards
        grantXP(enemy.xpReward);

        setTimeout(() => checkAchievements(), 50);

        return {
          ...prev,
          pp: prev.pp + enemy.ppReward,
          currentEnemy: enemy,
          combatLog: log,
          combatEnded: true,
          isPlayerTurn: false,
          combatVictories: (prev.combatVictories || 0) + 1
        };
      }

      // Enemy turn
      const newState = {
        ...prev,
        currentEnemy: enemy,
        combatLog: log,
        isPlayerTurn: false
      };

      // Delay enemy attack
      setTimeout(() => {
        enemyAttack();
      }, 1000);

      return newState;
    });
  };

  const enemyAttack = () => {
    setGameState(prev => {
      if (prev.isPlayerTurn || prev.combatEnded || !prev.currentEnemy) return prev;

      const enemy = prev.currentEnemy;
      const log = [...prev.combatLog];

      const damage = enemy.damage;
      const newPlayerHP = Math.max(0, prev.playerCombatHP - damage);

      log.push({
        type: 'damage_player',
        message: `💢 ${enemy.displayName} attacks for ${damage} damage!`
      });

      // Check if player defeated
      if (newPlayerHP <= 0) {
        log.push({
          type: 'defeat',
          message: '☠️ You have been defeated. Your sanity shatters...'
        });

        return {
          ...prev,
          playerCombatHP: newPlayerHP,
          combatLog: log,
          combatEnded: true,
          isPlayerTurn: false,
          sanity: Math.max(0, prev.sanity - 20) // Lose sanity on defeat
        };
      }

      return {
        ...prev,
        playerCombatHP: newPlayerHP,
        combatLog: log,
        isPlayerTurn: true
      };
    });
  };

  const escapeCombat = () => {
    setGameState(prev => {
      if (!prev.isPlayerTurn || prev.combatEnded) return prev;

      const escapeRoll = Math.random();
      const log = [...prev.combatLog];

      if (escapeRoll < COMBAT_MECHANICS.escapeChance) {
        log.push({
          type: 'escape_success',
          message: '🏃 You successfully escaped the battle!'
        });

        return {
          ...prev,
          inCombat: false,
          currentEnemy: null,
          combatLog: [],
          combatEnded: false
        };
      } else {
        const damage = Math.floor(prev.playerCombatHP * COMBAT_MECHANICS.escapeFailureDamage);
        const newPlayerHP = Math.max(0, prev.playerCombatHP - damage);

        log.push({
          type: 'escape_fail',
          message: `❌ Escape failed! You take ${damage} damage in the panic!`
        });

        // Check if player died from escape damage
        if (newPlayerHP <= 0) {
          log.push({
            type: 'defeat',
            message: '☠️ You collapse while trying to flee...'
          });

          return {
            ...prev,
            playerCombatHP: newPlayerHP,
            combatLog: log,
            combatEnded: true,
            isPlayerTurn: false,
            sanity: Math.max(0, prev.sanity - 20)
          };
        }

        // Enemy gets a turn after failed escape
        const newState = {
          ...prev,
          playerCombatHP: newPlayerHP,
          combatLog: log,
          isPlayerTurn: false
        };

        setTimeout(() => {
          enemyAttack();
        }, 1000);

        return newState;
      }
    });
  };

  const endCombat = () => {
    setGameState(prev => ({
      ...prev,
      inCombat: false,
      currentEnemy: null,
      combatLog: [],
      combatEnded: false,
      isPlayerTurn: true
    }));
  };

  return {
    sortPapers,
    rest,
    startMeditation,
    breatheAction,
    cancelMeditation,
    startDebugSession,
    submitDebug,
    updateDebugCode,
    cancelDebug,
    changeLocation,
    examineItem,
    closeExamine,
    respondToColleague,
    buyUpgrade,
    printPaper,
    buyPrinterUpgrade,
    enterPrinterRoom,
    triggerScreenEffect,
    startCombat,
    playerAttack,
    escapeCombat,
    endCombat
  };
};