// Game action handlers with full skill integration
import { LOCATIONS, UPGRADES, DEBUG_CHALLENGES } from './constants';
import { 
  getActiveSkillEffects, 
  applyEnergyCostReduction, 
  applyPPMultiplier,
  applyMeditationBonus,
  getModifiedSanityLoss 
} from './skillSystemHelpers';
import { XP_REWARDS } from './skillTreeConstants';

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
      
      if (prev.energy < 5) {
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
      setTimeout(() => checkAchievements(), 50);
      return newState;
    });
  };

  const rest = () => {
    setGameState(prev => {
      const effects = getActiveSkillEffects(prev);
      const baseCooldown = 30;
      const cooldownReduction = effects.restCooldownReduction || 0;
      const actualCooldown = Math.max(10, baseCooldown - cooldownReduction);
      
      if (prev.restCooldown > 0) {
        return {
          ...prev,
          recentMessages: ['Still recovering. Your body refuses to relax yet.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }
      
      const baseMaxEnergy = 100 + (prev.upgrades.energydrink ? 20 : 0);
      const maxEnergy = baseMaxEnergy + (effects.maxEnergy || 0);
      
      grantXP(XP_REWARDS.rest || 1);
      setTimeout(() => checkAchievements(), 50);
      return {
        ...prev,
        energy: maxEnergy,
        restCooldown: actualCooldown,
        recentMessages: ['You close your eyes. The fluorescent lights burn through your eyelids.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
      };
    });
  };

  const startMeditation = () => {
    setGameState(prev => {
      const effects = getActiveSkillEffects(prev);
      const baseEnergyCost = 10;
      const energyCost = applyEnergyCostReduction(baseEnergyCost, prev);
      
      if (prev.energy < energyCost) {
        return {
          ...prev,
          recentMessages: ['Not enough energy to meditate.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }
      
      const targetTime = 3000 + Math.random() * 2000;
      return {
        ...prev,
        meditating: true,
        breathCount: 0,
        meditationPhase: 'inhale',
        meditationStartTime: Date.now(),
        meditationTargetTime: targetTime,
        meditationScore: 0,
        meditationPerfectWindow: 300,
        energy: Math.max(0, prev.energy - energyCost),
        recentMessages: ['Close your eyes. Focus on your breathing.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
      };
    });
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
      
      const newBreathCount = prev.breathCount + (action === 'exhale' ? 1 : 0);
      const newScore = prev.meditationScore + points;
      
      if (newBreathCount >= 3) {
        const avgScore = newScore / 6;
        let baseSanityGain = 0;
        let message = '';
        
        if (avgScore >= 85) {
          baseSanityGain = 40;
          message = 'Perfect rhythm achieved. Your mind is completely clear.';
        } else if (avgScore >= 70) {
          baseSanityGain = 30;
          message = 'Excellent control. Reality feels more stable.';
        } else if (avgScore >= 50) {
          baseSanityGain = 20;
          message = 'Good effort. Some peace returns.';
        } else if (avgScore >= 30) {
          baseSanityGain = 12;
          message = 'Struggling to focus. The lights still intrude.';
        } else {
          baseSanityGain = 5;
          message = 'Your rhythm is chaotic. The fluorescent hum grows louder.';
        }
        
        // Apply meditation skill bonus
        const sanityGain = applyMeditationBonus(baseSanityGain, prev);
        
        grantXP(XP_REWARDS.completeMeditation || 15);
        setTimeout(() => checkAchievements(), 50);
        
        return {
          ...prev,
          meditating: false,
          sanity: Math.min(100, prev.sanity + sanityGain),
          recentMessages: [message, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }
      
      const nextPhase = action === 'inhale' ? 'exhale' : 'inhale';
      const newTargetTime = 3000 + Math.random() * 2000;
      
      return {
        ...prev,
        breathCount: newBreathCount,
        meditationPhase: nextPhase,
        meditationStartTime: currentTime,
        meditationTargetTime: newTargetTime,
        meditationScore: newScore
      };
    });
  };

  const cancelMeditation = () => {
    setGameState(prev => ({
      ...prev,
      meditating: false,
      recentMessages: ['You lose focus. The office returns.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
    }));
  };

  const startDebugSession = () => {
    setGameState(prev => {
      const baseEnergyCost = 10;
      const energyCost = applyEnergyCostReduction(baseEnergyCost, prev);
      
      if (prev.energy < energyCost) {
        return {
          ...prev,
          recentMessages: ['Not enough energy to debug.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }
      
      const randomBug = DEBUG_CHALLENGES[Math.floor(Math.random() * DEBUG_CHALLENGES.length)];
      return {
        ...prev,
        debugMode: true,
        currentBug: { ...randomBug, userCode: randomBug.code },
        energy: Math.max(0, prev.energy - energyCost),
        recentMessages: ['Debug console initialized. Fix the errors.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
      };
    });
  };

  const submitDebug = () => {
    setGameState(prev => {
      if (!prev.currentBug) return prev;
      
      const isCorrect = prev.currentBug.userCode.trim() === prev.currentBug.correct.trim();
      
      if (isCorrect) {
        const baseReward = Math.floor(200 + Math.random() * 300);
        const reward = applyPPMultiplier(baseReward, prev);
        
        grantXP(XP_REWARDS.completeDebug);
        setTimeout(() => checkAchievements(), 50);
        
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
      
      const baseEnergyCost = 5;
      const energyCost = applyEnergyCostReduction(baseEnergyCost, prev);
      
      const locationData = LOCATIONS[loc];
      if (!locationData || !locationData.atmosphere) return prev;
      const randomAtmo = locationData.atmosphere[Math.floor(Math.random() * locationData.atmosphere.length)];
      return { 
        ...prev, 
        location: loc, 
        energy: Math.max(0, prev.energy - energyCost),
        recentMessages: [randomAtmo, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
      };
    });
  };

  const examineItem = (item) => {
    setGameState(prev => {
      const newExaminedItems = (prev.examinedItems || 0) + 1;
      grantXP(XP_REWARDS.examineItem || 10);
      setTimeout(() => checkAchievements(), 50);
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
        const baseReward = Math.floor(300 + Math.random() * 500);
        const reward = applyPPMultiplier(baseReward, prev);
        
        grantXP(XP_REWARDS.defeatColleague);
        setTimeout(() => checkAchievements(), 50);
        
        // Apply skill effects to sanity loss
        const baseSanityLoss = 15;
        const sanityLoss = getModifiedSanityLoss(baseSanityLoss, prev);
        
        return {
          ...prev,
          pp: prev.pp + reward,
          strangeColleagueEvent: null,
          sanity: Math.max(0, prev.sanity - sanityLoss),
          recentMessages: [`He smiles. It doesn't reach his eyes. You receive: Existential Token (+${reward} PP)`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      } else {
        const wrongResponseIndex = responseIndex;
        const horribleReply = prev.strangeColleagueEvent.wrongResponses[wrongResponseIndex];
        
        // Apply skill effects to sanity loss
        const baseSanityLoss = 5;
        const sanityLoss = getModifiedSanityLoss(baseSanityLoss, prev);
        
        return {
          ...prev,
          sanity: Math.max(0, prev.sanity - sanityLoss),
          recentMessages: [`"${horribleReply}"`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
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
        } else if (upgrade.value === 'exploration') {
          newState.unlockedLocations = [...prev.unlockedLocations, 'breakroom'];
          messages.push('You can explore now. Why would you want to?');
        } else if (upgrade.value === 'serverroom') {
          newState.unlockedLocations = [...prev.unlockedLocations, 'serverroom'];
          messages.push('Access granted to: S̷E̷R̷V̷E̷R̷ ̷R̷O̷O̷M̷');
        } else if (upgrade.value === 'managers') {
          newState.unlockedLocations = [...prev.unlockedLocations, 'managers'];
          messages.push('The manager will see you now. The manager has always been seeing you.');
          grantXP(30);
        } else if (upgrade.value === 'basement') {
          newState.unlockedLocations = [...prev.unlockedLocations, 'basement'];
          messages.push('B7. You try to forget the number. The number remembers you.');
          newState.phase = 3;
          grantXP(30);
        } else if (upgrade.value === 'roof') {
          newState.unlockedLocations = [...prev.unlockedLocations, 'roof'];
          messages.push('Up. Finally, up.');
          grantXP(30);
        }
      }

      messages.push(`Acquired: ${upgrade.name}`);
      newState.recentMessages = [...messages.reverse(), ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
      
      grantXP(XP_REWARDS.purchaseUpgrade);
      setTimeout(() => checkAchievements(), 50);
      return newState;
    });
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
    triggerScreenEffect
  };
};