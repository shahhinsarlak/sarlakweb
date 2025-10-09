// Game action handlers
import { LOCATIONS, UPGRADES, DEBUG_CHALLENGES } from './constants';

export const createGameActions = (setGameState, addMessage, checkAchievements) => {
  
  const sortPapers = () => {
    setGameState(prev => {
      if (prev.energy < 5) {
        addMessage('Too exhausted. Your hands won\'t move.');
        return prev;
      }
      const newState = {
        ...prev,
        pp: prev.pp + prev.ppPerClick,
        energy: Math.max(0, prev.energy - 2),
        sortCount: (prev.sortCount || 0) + 1
      };
      setTimeout(() => checkAchievements(), 50);
      return newState;
    });
  };

  const rest = () => {
    setGameState(prev => {
      if (prev.restCooldown > 0) {
        addMessage('Still recovering. Your body refuses to relax yet.');
        return prev;
      }
      const maxEnergy = 100 + (prev.upgrades.energydrink ? 20 : 0);
      setTimeout(() => {
        addMessage('You close your eyes. The fluorescent lights burn through your eyelids.');
        checkAchievements();
      }, 50);
      return {
        ...prev,
        energy: maxEnergy,
        restCooldown: 30
      };
    });
  };

  const startMeditation = () => {
    const targetTime = 3000 + Math.random() * 2000;
    setGameState(prev => ({
      ...prev,
      meditating: true,
      breathCount: 0,
      meditationPhase: 'inhale',
      meditationStartTime: Date.now(),
      meditationTargetTime: targetTime,
      meditationScore: 0,
      meditationPerfectWindow: 300
    }));
    addMessage('Close your eyes. Focus on your breathing.');
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
        setTimeout(() => addMessage('Wrong action! Focus on the rhythm...'), 100);
        return {
          ...prev,
          meditationScore: prev.meditationScore - 20
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
      
      if (newBreathCount >= 5) {
        const avgScore = newScore / 10;
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
        
        setTimeout(() => addMessage(message), 100);
        return {
          ...prev,
          meditating: false,
          breathCount: 0,
          sanity: Math.min(100, prev.sanity + sanityGain),
          energy: Math.max(0, prev.energy - 10),
          meditationPhase: null,
          meditationStartTime: null,
          meditationTargetTime: null,
          meditationScore: 0
        };
      }
      
      let nextPhase;
      let nextTargetTime;
      
      if (action === 'inhale') {
        nextPhase = 'exhale';
        nextTargetTime = 2500 + Math.random() * 1500;
      } else {
        nextPhase = 'inhale';
        nextTargetTime = 3000 + Math.random() * 2000;
      }
      
      return {
        ...prev,
        breathCount: newBreathCount,
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
      meditationScore: 0
    }));
    addMessage('You open your eyes. The fluorescent lights are still humming.');
  };

  const startDebugSession = () => {
    const randomBug = DEBUG_CHALLENGES[Math.floor(Math.random() * DEBUG_CHALLENGES.length)];
    setGameState(prev => ({
      ...prev,
      debugMode: true,
      currentBug: { ...randomBug, userCode: randomBug.code },
      energy: Math.max(0, prev.energy - 10)
    }));
    addMessage('Debug console initialized. Fix the errors.');
  };

  const submitDebug = () => {
    setGameState(prev => {
      if (!prev.currentBug) return prev;
      
      const isCorrect = prev.currentBug.userCode.trim() === prev.currentBug.correct.trim();
      
      if (isCorrect) {
        const reward = Math.floor(200 + Math.random() * 300);
        addMessage(`DEBUG SUCCESS: +${reward} PP. The code compiles. Reality stabilizes.`);
        return {
          ...prev,
          pp: prev.pp + reward,
          debugMode: false,
          currentBug: null,
          debugAttempts: 0,
          sanity: Math.min(100, prev.sanity + 5)
        };
      } else {
        const newAttempts = prev.debugAttempts + 1;
        if (newAttempts >= 3) {
          addMessage('DEBUG FAILED: Maximum attempts exceeded. The bugs remain.');
          return {
            ...prev,
            debugMode: false,
            currentBug: null,
            debugAttempts: 0,
            sanity: Math.max(0, prev.sanity - 10)
          };
        }
        addMessage(`ERROR: Compilation failed. ${3 - newAttempts} attempts remaining.`);
        return {
          ...prev,
          debugAttempts: newAttempts
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
      debugAttempts: 0
    }));
    addMessage('Debug session terminated. The errors persist.');
  };

  const changeLocation = (loc) => {
    setGameState(prev => {
      if (!prev.unlockedLocations.includes(loc)) return prev;
      const locationData = LOCATIONS[loc];
      if (!locationData || !locationData.atmosphere) return prev;
      const randomAtmo = locationData.atmosphere[Math.floor(Math.random() * locationData.atmosphere.length)];
      setTimeout(() => addMessage(randomAtmo), 50);
      return { ...prev, location: loc, energy: Math.max(0, prev.energy - 5) };
    });
  };

  const examineItem = (item) => {
    setGameState(prev => {
      const newExaminedItems = (prev.examinedItems || 0) + 1;
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
      if (response === "Agree with him") {
        const reward = Math.floor(300 + Math.random() * 500);
        addMessage(`He smiles. It doesn't reach his eyes. You receive: Existential Token (+${reward} PP)`);
        setTimeout(() => checkAchievements(), 50);
        return {
          ...prev,
          pp: prev.pp + reward,
          strangeColleagueEvent: null,
          sanity: Math.max(0, prev.sanity - 15)
        };
      } else {
        const horribleReply = prev.strangeColleagueEvent.wrongResponses[responseIndex];
        addMessage(`"${horribleReply}"`);
        
        const newDisagreements = prev.disagreementCount + 1;
        const newState = {
          ...prev,
          sanity: Math.max(0, prev.sanity - 5),
          disagreementCount: newDisagreements
        };

        if (newDisagreements === 20 && !prev.unlockedLocations.includes('archive')) {
          newState.unlockedLocations = [...prev.unlockedLocations, 'archive'];
          setTimeout(() => {
            addMessage('Reality fractures. A door appears that was always there. THE ARCHIVE calls to you.');
            addMessage('🔓 NEW LOCATION: The Archive');
          }, 500);
        }

        setTimeout(() => checkAchievements(), 50);
        return newState;
      }
    });
  };

  const buyUpgrade = (upgrade) => {
    setGameState(prev => {
      if (prev.pp < upgrade.cost || prev.upgrades[upgrade.id]) return prev;
      
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
          addMessage('Debug access granted. Fix the system. Or break it further.');
        } else if (upgrade.value === 'exploration') {
          newState.unlockedLocations = [...prev.unlockedLocations, 'breakroom'];
          addMessage('You can explore now. Why would you want to?');
        } else if (upgrade.value === 'serverroom') {
          newState.unlockedLocations = [...prev.unlockedLocations, 'serverroom'];
          addMessage('Access granted to: S̷E̷R̷V̷E̷R̷ ̷R̷O̷O̷M̷');
        } else if (upgrade.value === 'managers') {
          newState.unlockedLocations = [...prev.unlockedLocations, 'managers'];
          addMessage('The manager will see you now. The manager has always been seeing you.');
        } else if (upgrade.value === 'basement') {
          newState.unlockedLocations = [...prev.unlockedLocations, 'basement'];
          addMessage('B7. You try to forget the number. The number remembers you.');
          newState.phase = 3;
        } else if (upgrade.value === 'roof') {
          newState.unlockedLocations = [...prev.unlockedLocations, 'roof'];
          addMessage('Up. Finally, up.');
        }
      }

      addMessage(`Acquired: ${upgrade.name}`);
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
    buyUpgrade
  };
};