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
import { LOCATIONS, UPGRADES, DEBUG_CHALLENGES, PRINTER_UPGRADES, DOCUMENT_TYPES, STRANGE_COLLEAGUE_DIALOGUES, TIER_MASTERY_WEIGHTS } from './constants';
import { BREAK_ROOM_SEARCHABLES, generateBreakRoomLoot, MAX_TRUST_REWARDS, COLLEAGUE_SCHEDULE } from './breakRoomConstants';
import {
  applyEnergyCostReduction,
  applyPPMultiplier
} from './skillSystemHelpers';
import { XP_REWARDS } from './skillTreeConstants';
import { generateEnemy, getPlayerCombatStats, COMBAT_MECHANICS } from './combatConstants';
import {
  applySanityPPModifier,
  applySanityXPModifier,
  applyEnergyCostModifier,
  calculatePaperQuality,
  canPrintDocument,
  generateProphecy,
  getRandomDimensionalMaterial,
  cleanExpiredBuffs,
  getTierData,
  canPrintDocumentTier,
  rollQualityOutcome
} from './sanityPaperHelpers';
import {
  discoverLocation,
  discoverColleague
} from './journalHelpers';
import {
  processResponseOutcome
} from './colleagueHelpers';


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
      // Apply skill effects to energy cost, then report buff modifier
      const baseEnergyCost = 2;
      let energyCost = applyEnergyCostReduction(baseEnergyCost, prev);
      energyCost = applyEnergyCostModifier(energyCost, prev);

      if (prev.energy < energyCost) {
        return {
          ...prev,
          recentMessages: ['Too exhausted. Your hands won\'t move.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }

      // Apply skill effects to PP gain, then sanity-based modifier
      const basePP = prev.ppPerClick;
      const ppWithSkills = applyPPMultiplier(basePP, prev);
      const ppGain = applySanityPPModifier(ppWithSkills, prev);

      // Clean expired buffs
      const activeBuffs = cleanExpiredBuffs(prev);

      const newState = {
        ...prev,
        pp: prev.pp + ppGain,
        energy: Math.max(0, prev.energy - energyCost),
        sortCount: (prev.sortCount || 0) + 1,
        activeReportBuffs: activeBuffs
      };

      // Apply sanity modifier to XP as well - call after state update
      setTimeout(() => {
        const baseXP = XP_REWARDS.sortPapers;
        const xpGain = applySanityXPModifier(baseXP, prev);
        grantXP(xpGain);
        checkAchievements();
      }, 0);

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
      if (!locationData) return prev;

      // Track location discovery for journal
      const discoveredLocations = discoverLocation(prev, loc);

      // Break Room Calendar System (Added 2025-11-19)
      // Colleagues appear on scheduled days
      if (loc === 'breakroom') {
        // Priority 1: Existing colleague notification (from events/story moments)
        if (prev.colleagueNotification) {
          const colleague = STRANGE_COLLEAGUE_DIALOGUES.find(
            c => c.id === prev.colleagueNotification.colleagueId
          );

          if (colleague) {
            // Trigger encounter via briefing screen
            return {
              ...prev,
              location: loc,
              energy: Math.max(0, prev.energy - 5),
              discoveredLocations,
              pendingColleagueEncounter: colleague
            };
          }
        }

        // Priority 2: Check if a colleague is scheduled for today
        const scheduledColleagueId = COLLEAGUE_SCHEDULE.getScheduledColleague(prev.day);

        if (scheduledColleagueId && scheduledColleagueId !== 'multiple') {
          // Check if we should spawn this encounter
          // Only spawn if player hasn't visited break room yet today
          const shouldSpawnEncounter = prev.lastBreakRoomVisitDay !== prev.day;

          if (shouldSpawnEncounter) {
            const colleague = STRANGE_COLLEAGUE_DIALOGUES.find(c => c.id === scheduledColleagueId);

            if (colleague) {
              // Spawn scheduled colleague encounter
              return {
                ...prev,
                location: loc,
                energy: Math.max(0, prev.energy - 5),
                discoveredLocations,
                lastBreakRoomVisitDay: prev.day,
                pendingColleagueEncounter: colleague,
                recentMessages: [`${colleague.ascii.split('\n')[0]}... You sense a presence in the break room.`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
              };
            }
          }
        }

        // Priority 3: No encounter, open interactive break room UI
        return {
          ...prev,
          location: loc,
          inBreakRoom: true,
          energy: Math.max(0, prev.energy - 5),
          discoveredLocations,
          lastBreakRoomVisitDay: prev.day
        };
      }

      // Handle direct locations
      if (locationData.isDirect) {
        if (loc === 'portal') {
          return { ...prev, inDimensionalArea: true, discoveredLocations };
        } else if (loc === 'printerroom') {
          return { ...prev, inPrinterRoom: true, discoveredLocations };
        } else if (loc === 'armory') {
          return { ...prev, inArmory: true, discoveredLocations };
        }
      }

      // Regular location change
      const randomAtmo = locationData.atmosphere ?
        locationData.atmosphere[Math.floor(Math.random() * locationData.atmosphere.length)] :
        locationData.description;

      return {
        ...prev,
        location: loc,
        energy: Math.max(0, prev.energy - 5),
        discoveredLocations,
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

  const respondToColleague = (responseOption) => {
    setGameState(prev => {
      if (!prev.strangeColleagueEvent && !prev.pendingStoryMoment) return prev;

      const colleague = prev.strangeColleagueEvent || prev.pendingStoryMoment;
      const outcome = responseOption.outcome;
      const colleagueId = colleague.id;
      const isStoryMoment = !!prev.pendingStoryMoment;

      // Track colleague discovery for journal
      const discoveredColleagues = discoverColleague(prev, colleagueId);

      // Update colleague relationship
      const currentRelationship = prev.colleagueRelationships[colleagueId] || { trust: 0, encounters: 0, lastResponseType: null };
      const newRelationships = {
        ...prev.colleagueRelationships,
        [colleagueId]: {
          trust: currentRelationship.trust + (outcome.trust || 0),
          encounters: currentRelationship.encounters + 1,
          lastResponseType: responseOption.type
        }
      };

      // NO LONGER GRANT XP (Removed 2025-11-05 - colleague encounters are purely narrative)
      // grantXP(outcome.xp);

      // Process outcome for mystery/path system (PP/XP/sanity removed)
      const outcomeUpdates = processResponseOutcome(prev, outcome);

      // Check for endgame events based on new trust level
      const newRelationship = newRelationships[colleagueId];
      let endgameMessage = null;

      if (newRelationship.encounters >= 5) {
        if (newRelationship.trust >= 10) {
          // Ally path - they become helpful
          endgameMessage = `Your kindness has transformed them. They are no longer lost. They offer to help you.`;
        } else if (newRelationship.trust <= -8) {
          // Hostility path - triggers combat
          endgameMessage = `Your constant hostility has pushed them over the edge. Their eyes turn dark. Violence is inevitable.`;
        }
      }

      // Build new state
      const newState = {
        ...prev,
        ...outcomeUpdates, // Apply mystery/path updates
        colleagueRelationships: newRelationships,
        strangeColleagueEvent: null,
        pendingStoryMoment: null,
        disagreementCount: prev.disagreementCount + (responseOption.type === 'hostile' || responseOption.type === 'protector' ? 1 : 0),
        colleagueResponseCount: (prev.colleagueResponseCount || 0) + 1, // Track all responses
        discoveredColleagues,
        // Clear notification and mark encounter as completed (Added 2025-11-05)
        colleagueNotification: null,
        completedColleagueEncounters: prev.colleagueNotification
          ? [...prev.completedColleagueEncounters, prev.colleagueNotification.encounterId]
          : prev.completedColleagueEncounters,
        // Return player to cubicle after encounter (Added 2025-11-05)
        location: 'cubicle'
      };

      // Track completed story moment
      if (isStoryMoment && prev.pendingStoryMoment) {
        newState.completedStoryMoments = [...prev.completedStoryMoments, prev.pendingStoryMoment.id];
      }

      // Build messages
      const messages = [outcome.message];
      if (endgameMessage) {
        messages.push(endgameMessage);
      }

      // Add mystery progress notification if significant
      if (outcome.mysteryProgress && outcome.mysteryProgress >= 10) {
        messages.push(`Mystery deepens... (${newState.mysteryProgress}% uncovered)`);
      }

      // Add clue notification
      if (outcome.clue) {
        messages.push(`New clue discovered: "${outcome.clue.text}"`);
      }

      // Add path notification if path changed
      if (newState.playerPath && newState.playerPath !== prev.playerPath) {
        const pathNames = {
          seeker: 'Seeker of Truth',
          rationalist: 'Rational Denier',
          protector: 'Protector of Others',
          convert: 'Convert to Madness',
          rebel: 'Rebel Against the System'
        };
        messages.push(`Your path crystallizes: ${pathNames[newState.playerPath]}`);
      }

      newState.recentMessages = [...messages, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);

      // Archive unlock mechanic - triggers after collecting 5 archive-revealing clues (Redesigned 2025-11-05)
      // Player must piece together the mystery through colleague interactions
      const ARCHIVE_CLUES = [
        'eternal_productivity',     // Archives mentioned directly
        'building_predates_office', // Building has hidden history
        'productivity_documents',   // Secret documentation exists
        'surveillance_system',      // Everything is cataloged
        'sorting_purpose'           // Hidden sorting/filing system
      ];

      const collectedClues = newState.investigation?.clues?.map(c => c.id) || [];
      const archiveCluesCollected = ARCHIVE_CLUES.filter(clueId => collectedClues.includes(clueId));

      if (archiveCluesCollected.length >= 5 && !prev.unlockedLocations.includes('archive')) {
        newState.unlockedLocations = [...new Set([...prev.unlockedLocations, 'archive'])];

        triggerScreenEffect('shake');

        setTimeout(() => {
          setGameState(prevState => ({
            ...prevState,
            recentMessages: [
              'The pieces fall into place. The clues converge.',
              'Reality fractures. A door appears that was always there.',
              'THE ARCHIVE calls to you.',
              'NEW LOCATION: The Archive',
              ...prevState.recentMessages
            ].slice(0, prevState.maxLogMessages || 15)
          }));
        }, 600);
      }

      checkAchievements();
      return newState;
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
          newState.unlockedLocations = [...new Set([...prev.unlockedLocations, 'printerroom'])];
          messages.push('Printer Room unlocked. The machines await your command.');
        } else if (upgrade.value === 'breakroom') {
          newState.unlockedLocations = [...new Set([...prev.unlockedLocations, 'breakroom'])];
          messages.push('Break Room unlocked. Time to meet your colleagues.');
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

      // Calculate paper quality based on sanity + printer upgrades
      const paperQuality = calculatePaperQuality(prev);

      // Calculate paper gain based on upgrades
      const basePaperGain = prev.paperPerPrint || 1;
      const ppGain = prev.printerUpgrades?.reality_printer ? 5 : 0;

      // Generate distorted message based on paper quality (not just printer quality)
      let message;
      if (paperQuality < 20) {
        const distortedMessages = [
          'T̷h̷e̷ ̷p̷r̷i̷n̷t̷e̷r̷ ̷s̷c̷r̷e̷a̷m̷s̷.̷ ̷P̷a̷p̷e̷r̷ ̷e̷m̷e̷r̷g̷e̷s̷,̷ ̷w̷a̷r̷p̷e̷d̷.̷',
          'The pages are bleeding ink. Your mind bleeds with them.',
          'P̸̢̛̹͎̺̹͎̹A̴̹̹P̴E̴R̴ ̴D̴I̴S̴T̴O̴R̴T̴E̴D̴ ̴B̴Y̴ ̴M̴A̴D̴N̴E̴S̴S̴',
          'The printer stutters. Reality and sanity bleed onto each page.',
          'W̴͓͝h̷̹̃ă̷̹t̷̬̾ ̷͎̄ī̴̹s̷̬̾ ̷̹̈́r̴̬̔e̷͓̕a̷̹̚l̷̬͘?̷̹̈́'
        ];
        message = distortedMessages[Math.floor(Math.random() * distortedMessages.length)];
      } else if (paperQuality < 50) {
        message = 'The printer hums. Text wavers between clarity and chaos.';
      } else if (paperQuality < 80) {
        message = 'Clean print. Your mind and machine align.';
      } else {
        message = 'Perfect output. Sanity and precision in harmony. Forever.';
      }

      const newState = {
        ...prev,
        paper: prev.paper + basePaperGain,
        pp: prev.pp + ppGain,
        energy: Math.max(0, prev.energy - energyCost),
        printCount: (prev.printCount || 0) + 1,
        paperQuality: paperQuality, // Update paper quality in state
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
          message: `CRITICAL HIT! You strike for ${damage} damage!`
        });
      } else {
        log.push({
          type: 'damage_enemy',
          message: `You attack for ${damage} damage.`
        });
      }

      enemy.currentHP = Math.max(0, enemy.currentHP - damage);

      // Check if enemy defeated
      if (enemy.currentHP <= 0) {
        log.push({
          type: 'victory',
          message: `Victory! ${enemy.displayName} has been defeated!`
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
        message: `[Attack] ${enemy.displayName} attacks for ${damage} damage!`
      });

      // Check if player defeated
      if (newPlayerHP <= 0) {
        log.push({
          type: 'defeat',
          message: 'You have been defeated. Your sanity shatters...'
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
          message: 'You successfully escaped the battle!'
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
          message: `Escape failed! You take ${damage} damage in the panic!`
        });

        // Check if player died from escape damage
        if (newPlayerHP <= 0) {
          log.push({
            type: 'defeat',
            message: 'You collapse while trying to flee...'
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

  // Document System Actions
  /**
   * Document Tier System (Revised 2025-11-01)
   * Unified document printing with quality outcome rolls
   */
  /**
   * Print Document - Creates and stores document (Redesigned 2025-11-04)
   * Documents are stored in File Drawer instead of being consumed immediately
   */
  const printDocument = (docType, tierNumber) => {
    setGameState(prev => {
      // Check if tier can be printed
      const checkResult = canPrintDocumentTier(docType, tierNumber, prev);
      if (!checkResult.canPrint) {
        return {
          ...prev,
          recentMessages: [checkResult.reason, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }

      const tierData = getTierData(docType, tierNumber);
      if (!tierData) return prev;

      // Roll quality outcome
      const paperQuality = calculatePaperQuality(prev);
      const qualityOutcome = rollQualityOutcome(paperQuality);
      const outcome = tierData.outcomes[qualityOutcome];

      // Quality indicator icons
      const qualityIcons = {
        corrupted: '[CORRUPTED]',
        standard: '[STANDARD]',
        pristine: '[PRISTINE]',
        perfect: '[PERFECT]'
      };

      // Create document object to store
      const document = {
        id: `${docType}_${tierNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: docType,
        tier: tierNumber,
        tierName: tierData.name,
        quality: qualityOutcome,
        outcome: outcome,
        createdAt: Date.now(),
        important: false
      };

      // Deduct costs and store document
      // Use weighted mastery gain based on tier (higher tiers = more mastery)
      const masteryGain = TIER_MASTERY_WEIGHTS[tierNumber] || 1;

      const newState = {
        ...prev,
        paper: prev.paper - (tierData.cost.paper || 0),
        energy: Math.max(0, prev.energy - (tierData.cost.energy || 0)),
        sanity: Math.max(0, prev.sanity - (tierData.cost.sanity || 0)),
        documentMastery: {
          ...prev.documentMastery,
          [`${docType}s`]: (prev.documentMastery?.[`${docType}s`] || 0) + masteryGain
        },
        storedDocuments: [...(prev.storedDocuments || []), document]
      };

      // Visual effects based on quality
      setTimeout(() => {
        if (qualityOutcome === 'perfect') {
          triggerScreenEffect('flash');
        } else if (qualityOutcome === 'corrupted') {
          triggerScreenEffect('shake');
        }
      }, 100);

      // Notification message
      const icon = qualityIcons[qualityOutcome];
      const qualityLabel = qualityOutcome.toUpperCase();
      const message = `${icon} ${tierData.name} [${qualityLabel}] created! Check File Drawer to consume.`;

      newState.recentMessages = [message, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);

      setTimeout(() => checkAchievements(), 100);

      return newState;
    });
  };

  /**
   * Journal System Actions
   * (Added 2025-10-31)
   */

  const openJournal = () => {
    setGameState(prev => ({
      ...prev,
      journalOpen: true
    }));
  };

  const closeJournal = () => {
    setGameState(prev => ({
      ...prev,
      journalOpen: false
    }));
  };

  const switchJournalTab = (tabId) => {
    setGameState(prev => ({
      ...prev,
      journalTab: tabId
    }));
  };

  /**
   * File Drawer System Actions
   * (Added 2025-11-04)
   */

  const openFileDrawer = () => {
    setGameState(prev => ({
      ...prev,
      fileDrawerOpen: true
    }));
  };

  const closeFileDrawer = () => {
    setGameState(prev => ({
      ...prev,
      fileDrawerOpen: false
    }));
  };

  const toggleDocumentImportant = (docId) => {
    setGameState(prev => ({
      ...prev,
      storedDocuments: prev.storedDocuments.map(doc =>
        doc.id === docId ? { ...doc, important: !doc.important } : doc
      )
    }));
  };

  const sortDocuments = (sortBy) => {
    setGameState(prev => ({
      ...prev,
      documentSortBy: sortBy
    }));
  };

  const shredDocument = (docId) => {
    setGameState(prev => {
      const doc = prev.storedDocuments.find(d => d.id === docId);
      if (!doc) return prev;

      // Calculate paper return based on quality
      const qualityMultipliers = {
        corrupted: 0.1,
        standard: 0.3,
        pristine: 0.5,
        perfect: 0.7
      };

      const tierCosts = [0, 5, 10, 20, 35, 50]; // Approximate paper costs per tier
      const basePaperCost = tierCosts[doc.tier] || 5;
      const paperReturn = Math.floor(basePaperCost * qualityMultipliers[doc.quality]);

      return {
        ...prev,
        storedDocuments: prev.storedDocuments.filter(d => d.id !== docId),
        paper: prev.paper + paperReturn,
        recentMessages: [
          `Shredded ${doc.tierName} [${doc.quality.toUpperCase()}] → +${paperReturn} paper`,
          ...prev.recentMessages
        ].slice(0, prev.maxLogMessages || 15)
      };
    });
  };

  const consumeDocument = (docId) => {
    setGameState(prev => {
      const doc = prev.storedDocuments.find(d => d.id === docId);
      if (!doc) return prev;

      const outcome = doc.outcome;
      const newState = {
        ...prev,
        storedDocuments: prev.storedDocuments.filter(d => d.id !== docId)
      };

      const messages = [];
      let xpGain = 0;
      const effectDetails = [];

      // Apply outcome effects
      if (outcome.pp) {
        newState.pp = Math.max(0, prev.pp + outcome.pp);
        effectDetails.push(`${outcome.pp > 0 ? '+' : ''}${outcome.pp} PP`);
      }
      if (outcome.sanity) {
        newState.sanity = Math.max(0, Math.min(100, prev.sanity + outcome.sanity));
        effectDetails.push(`${outcome.sanity > 0 ? '+' : ''}${outcome.sanity} sanity`);
      }
      if (outcome.energy) {
        newState.energy = Math.max(0, Math.min(100, prev.energy + outcome.energy));
        effectDetails.push(`${outcome.energy > 0 ? '+' : ''}${outcome.energy} energy`);
      }
      if (outcome.xp) {
        xpGain = outcome.xp;
        effectDetails.push(`+${outcome.xp} XP`);
      }
      if (outcome.skillPoint) {
        newState.skillPoints = (prev.skillPoints || 0) + outcome.skillPoint;
        messages.push(`+${outcome.skillPoint} Skill Point${outcome.skillPoint > 1 ? 's' : ''}!`);
      }

      // Handle materials
      if (outcome.materials) {
        for (let i = 0; i < outcome.materials; i++) {
          const material = getRandomDimensionalMaterial();
          newState.dimensionalInventory = {
            ...newState.dimensionalInventory,
            [material]: (newState.dimensionalInventory?.[material] || 0) + 1
          };
        }
        effectDetails.push(`+${outcome.materials} material${outcome.materials > 1 ? 's' : ''}`);
      }

      // Handle buffs
      if (outcome.buff) {
        const buff = {
          id: `${doc.type}_${doc.tier}_${doc.quality}_${Date.now()}`,
          name: doc.tierName,
          desc: outcome.desc,
          expiresAt: Date.now() + (outcome.buff.duration * 1000),
          ...outcome.buff
        };
        newState.activeReportBuffs = [...(prev.activeReportBuffs || []), buff];

        const buffParts = [];
        if (buff.ppMult) buffParts.push(`${((buff.ppMult - 1) * 100).toFixed(0)}% more PP`);
        if (buff.xpMult) buffParts.push(`${((buff.xpMult - 1) * 100).toFixed(0)}% more XP`);
        if (buff.energyCostMult) {
          const reduction = ((1 - buff.energyCostMult) * 100).toFixed(0);
          buffParts.push(`${reduction}% less energy cost`);
        }
        if (buff.noSanityDrain) buffParts.push('sanity drain paused');
        if (buff.materialMult) buffParts.push(`${buff.materialMult}x materials`);

        const duration = Math.floor(buff.duration / 60);
        messages.push(`BUFF: ${buffParts.join(', ')} for ${duration}min`);
      }

      // Handle debuffs
      if (outcome.debuff) {
        const debuff = {
          id: `debuff_${doc.type}_${doc.tier}_${Date.now()}`,
          name: `${doc.tierName} (CORRUPTED)`,
          desc: outcome.desc,
          expiresAt: Date.now() + (outcome.debuff.duration * 1000),
          ...outcome.debuff
        };
        newState.activeReportBuffs = [...(prev.activeReportBuffs || []), debuff];

        const debuffParts = [];
        if (debuff.ppMult && debuff.ppMult < 1) {
          debuffParts.push(`${((1 - debuff.ppMult) * 100).toFixed(0)}% LESS PP`);
        }
        if (debuff.energyCostMult && debuff.energyCostMult > 1) {
          debuffParts.push(`${((debuff.energyCostMult - 1) * 100).toFixed(0)}% MORE energy cost`);
        }

        const duration = Math.floor(debuff.duration / 60);
        messages.push(`DEBUFF: ${debuffParts.join(', ')} for ${duration}min`);
      }

      // Handle permanent PP/sec increase
      if (outcome.permanentPPPerSec) {
        newState.ppPerSecond = (prev.ppPerSecond || 0) + outcome.permanentPPPerSec;
        messages.push(`PERMANENT +${outcome.permanentPPPerSec} PP/sec`);
      }

      // Handle lore/prophecy
      if (outcome.lore) {
        if (outcome.lore === 'static') {
          messages.push(outcome.desc);
        } else {
          const prophecyText = generateProphecy(prev);
          messages.push('PROPHECY:', prophecyText);
        }
      }

      // Handle locks
      if (outcome.portalLock) {
        newState.portalCooldown = outcome.portalLock;
        messages.push(`Portal locked for ${Math.floor(outcome.portalLock / 60)}min`);
      }
      if (outcome.allLocks) {
        newState.portalCooldown = outcome.allLocks;
        newState.restCooldown = outcome.allLocks;
        messages.push(`All actions locked for ${Math.floor(outcome.allLocks / 60)}min`);
      }

      // Quality indicator icons
      const qualityIcons = {
        corrupted: '[CORRUPTED]',
        standard: '[STANDARD]',
        pristine: '[PRISTINE]',
        perfect: '[PERFECT]'
      };

      // Main message with detailed effects
      const icon = qualityIcons[doc.quality];
      const qualityLabel = doc.quality.toUpperCase();
      const effectSummary = effectDetails.length > 0 ? ` [${effectDetails.join(', ')}]` : '';
      messages.unshift(`${icon} ${doc.tierName} [${qualityLabel}]: ${outcome.desc}${effectSummary}`);

      newState.recentMessages = [...messages, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);

      // Grant XP
      if (xpGain > 0) {
        setTimeout(() => grantXP(xpGain), 50);
      }
      setTimeout(() => checkAchievements(), 100);

      return newState;
    });
  };

  // Break Room System Actions (Added 2025-11-19)

  /**
   * Enter the break room UI
   */
  const enterBreakRoom = () => {
    setGameState(prev => ({
      ...prev,
      inBreakRoom: true,
      lastBreakRoomVisitDay: prev.day
    }));
  };

  /**
   * Leave the break room UI
   */
  const leaveBreakRoom = () => {
    setGameState(prev => ({
      ...prev,
      inBreakRoom: false
    }));
  };

  /**
   * Search a break room object
   * @param {string} objectId - ID of the object to search (from BREAK_ROOM_SEARCHABLES)
   */
  const searchBreakRoomObject = (objectId) => {
    setGameState(prev => {
      const searchable = BREAK_ROOM_SEARCHABLES[objectId];
      if (!searchable) return prev;

      // Unlock supply closet at Day 10
      if (objectId === 'supply_closet' && prev.day >= 10 && !prev.breakRoomSupplyClosetUnlocked) {
        return {
          ...prev,
          breakRoomSupplyClosetUnlocked: true,
          recentMessages: ['The supply closet door swings open. It was never locked.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }

      // Check if supply closet is locked
      if (objectId === 'supply_closet' && !prev.breakRoomSupplyClosetUnlocked && prev.day < 10) {
        return {
          ...prev,
          recentMessages: ['The supply closet is locked. Something tells you it will open soon.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }

      // Check energy cost
      if (prev.energy < searchable.energyCost) {
        return {
          ...prev,
          recentMessages: ['Too exhausted to search.', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }

      // Check cooldown
      const now = Date.now();
      const cooldownEnd = prev.breakRoomSearchCooldowns[objectId] || 0;
      if (now < cooldownEnd) {
        const remainingSeconds = Math.ceil((cooldownEnd - now) / 1000);
        return {
          ...prev,
          recentMessages: [`Wait ${remainingSeconds}s before searching again.`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }

      // Generate loot using context-aware function
      const loot = generateBreakRoomLoot(prev, objectId);

      // Build new state
      const newState = {
        ...prev,
        energy: prev.energy - searchable.energyCost,
        breakRoomSearchCooldowns: {
          ...prev.breakRoomSearchCooldowns,
          [objectId]: now + (searchable.baseCooldown * 1000)
        },
        breakRoomSearchHistory: [
          ...prev.breakRoomSearchHistory,
          { objectId, itemFound: loot.type, timestamp: now }
        ]
      };

      const messages = [];

      // Process loot outcome
      if (loot.type === 'pp') {
        newState.pp = prev.pp + loot.amount;
        messages.push(`+${loot.amount} PP: ${loot.desc}`);
      } else if (loot.type === 'paper') {
        newState.paper = (prev.paper || 0) + loot.amount;
        messages.push(`+${loot.amount} Paper: ${loot.desc}`);
      } else if (loot.type === 'energy') {
        newState.energy = Math.min(100, newState.energy + loot.amount);
        messages.push(`+${loot.amount} Energy: ${loot.desc}`);
      } else if (loot.type === 'buff') {
        const buffEndTime = now + (loot.duration * 1000);
        newState.activeReportBuffs = [
          ...prev.activeReportBuffs,
          {
            id: loot.buffId,
            name: loot.name,
            ppMult: loot.ppMult,
            expiresAt: buffEndTime
          }
        ];
        messages.push(`Buff Gained: ${loot.name}`);
        messages.push(loot.desc);
      } else if (loot.type === 'clue') {
        newState.investigation = {
          ...prev.investigation,
          clues: [...prev.investigation.clues, {
            ...loot.clue,
            collectedOn: now
          }]
        };
        if (loot.mysteryProgress) {
          newState.mysteryProgress = Math.min(100, prev.mysteryProgress + loot.mysteryProgress);
        }
        messages.push('Clue Found!');
        messages.push(loot.clue.text);
        setTimeout(() => grantXP(5), 50);
      } else if (loot.type === 'trustItem') {
        // Store trust item in inventory (not yet implemented, just show message)
        messages.push(`Trust Item: ${loot.desc}`);
        messages.push(`(Can be gifted to ${loot.colleagueId})`);
      } else if (loot.type === 'special') {
        if (loot.effect === 'sanity') {
          newState.sanity = Math.max(0, Math.min(100, prev.sanity + loot.value));
          messages.push(`+${loot.value} Sanity: ${loot.name}`);
        } else if (loot.effect === 'xp') {
          messages.push(`${loot.name} found!`);
          setTimeout(() => grantXP(loot.value), 50);
        } else if (loot.effect === 'mystery') {
          newState.mysteryProgress = Math.min(100, prev.mysteryProgress + loot.value);
          messages.push(`+${loot.value}% Mystery: ${loot.name}`);
        }
        messages.push(loot.desc);
      } else if (loot.type === 'schedule') {
        newState.colleagueScheduleKnown = true;
        if (loot.mysteryProgress) {
          newState.mysteryProgress = Math.min(100, prev.mysteryProgress + loot.mysteryProgress);
        }
        messages.push('Schedule Found!');
        messages.push(loot.desc);
        messages.push('Monday: Productivity Zealot | Tuesday: Void Clerk | Wednesday: Spiral Philosopher');
        messages.push('Thursday: Temporal Trapped | Friday: Light Herald | Weekends: Empty');
      }

      newState.recentMessages = [...messages, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);

      setTimeout(() => checkAchievements(), 100);

      return newState;
    });
  };

  // Dismiss colleague notification (Added 2025-11-05)
  const dismissNotification = () => {
    setGameState(prev => ({
      ...prev,
      colleagueNotification: null
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
    dismissNotification,
    buyUpgrade,
    printPaper,
    buyPrinterUpgrade,
    enterPrinterRoom,
    triggerScreenEffect,
    startCombat,
    playerAttack,
    escapeCombat,
    endCombat,
    // Document system actions (Revised 2025-11-01, Redesigned 2025-11-04)
    printDocument,
    // File drawer system actions (Added 2025-11-04)
    openFileDrawer,
    closeFileDrawer,
    consumeDocument,
    shredDocument,
    toggleDocumentImportant,
    sortDocuments,
    // Journal system actions
    openJournal,
    closeJournal,
    switchJournalTab,
    // Break room system actions (Added 2025-11-19)
    enterBreakRoom,
    leaveBreakRoom,
    searchBreakRoomObject
  };
};