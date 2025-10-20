// Game action handlers
import { LOCATIONS, UPGRADES, DEBUG_CHALLENGES } from './constants';
import { 
  applyEnergyCostReduction,  // <- Add this
  applyPPMultiplier
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
        }
      }

      messages.push(`Acquired: ${upgrade.name}`);
      newState.recentMessages = [...messages.reverse(), ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
      
      grantXP(10); // XP_REWARDS.purchaseUpgrade
      checkAchievements();
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