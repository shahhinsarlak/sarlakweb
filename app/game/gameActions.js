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
import { LOCATIONS, UPGRADES, DEBUG_CHALLENGES, PRINTER_UPGRADES, DOCUMENT_TYPES, TIER_MASTERY_WEIGHTS } from './constants';
import {
  applyEnergyCostReduction,
  applyPPMultiplier
} from './skillSystemHelpers';
import { XP_REWARDS } from './skillTreeConstants';
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
  rollQualityOutcome,
  canAddMoreBuffs,
  countActiveBuffs
} from './sanityPaperHelpers';
import {
  discoverLocation
} from './journalHelpers';


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

      // Cap minimum energy cost at 10% of base (prevent gaining energy with buffs)
      energyCost = Math.max(energyCost, baseEnergyCost * 0.1);

      if (prev.energy < energyCost) {
        addMessage('Too exhausted. Your hands won\'t move.');
        return prev;
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
        addMessage('Still recovering. Your body refuses to relax yet.');
        return prev;
      }
      const maxEnergy = 100 + (prev.upgrades.energydrink ? 20 : 0);
      addMessage('You close your eyes. The fluorescent lights burn through your eyelids.');
      checkAchievements();
      return {
        ...prev,
        energy: maxEnergy,
        restCooldown: 30
      };
    });
  };

  const startMeditation = () => {
    const targetTime = 1500 + Math.random() * 1000; // Reduced from 3000-5000
    addMessage('Close your eyes. Focus on your breathing.');
    setGameState(prev => ({
      ...prev,
      meditating: true,
      breathCount: 0,
      meditationPhase: 'inhale',
      meditationStartTime: Date.now(),
      meditationTargetTime: targetTime,
      meditationScore: 0,
      meditationPerfectWindow: 200 // Reduced from 300
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
        addMessage('Wrong action! Focus on the rhythm...');
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

        addMessage(message);
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
    addMessage('You open your eyes. The fluorescent lights are still humming.');
    setGameState(prev => ({
      ...prev,
      meditating: false,
      breathCount: 0,
      meditationPhase: null,
      meditationStartTime: null,
      meditationTargetTime: null,
      meditationScore: 0
    }));
  };

  const startDebugSession = () => {
    const randomBug = DEBUG_CHALLENGES[Math.floor(Math.random() * DEBUG_CHALLENGES.length)];
    addMessage('Debug console initialized. Fix the errors.');
    setGameState(prev => ({
      ...prev,
      debugMode: true,
      currentBug: { ...randomBug, userCode: randomBug.code },
      energy: Math.max(0, prev.energy - 10)
    }));
  };

  const submitDebug = () => {
    setGameState(prev => {
      if (!prev.currentBug) return prev;

      const isCorrect = prev.currentBug.userCode.trim() === prev.currentBug.correct.trim();

      if (isCorrect) {
        const reward = Math.floor(200 + Math.random() * 300);
        addMessage(`DEBUG SUCCESS: +${reward} PP. The code compiles. Reality stabilizes.`);
        grantXP(15); // XP_REWARDS.completeDebug
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
    addMessage('Debug session terminated. The errors persist.');
    setGameState(prev => ({
      ...prev,
      debugMode: false,
      currentBug: null,
      debugAttempts: 0
    }));
  };

  const changeLocation = (loc) => {
    setGameState(prev => {
      if (!prev.unlockedLocations.includes(loc)) return prev;
      const locationData = LOCATIONS[loc];
      if (!locationData) return prev;

      // Track location discovery for journal
      const discoveredLocations = discoverLocation(prev, loc);

      // Break Room - Interactive exploration hub
      if (loc === 'breakroom') {
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

      addMessage(randomAtmo);
      return {
        ...prev,
        location: loc,
        energy: Math.max(0, prev.energy - 5),
        discoveredLocations
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
        } else if (upgrade.value === 'archive') {
          newState.unlockedLocations = [...new Set([...prev.unlockedLocations, 'archive'])];
          messages.push('The Archive opens. Files from impossible years await.');
        } else if (upgrade.value === 'breakroom') {
          newState.unlockedLocations = [...new Set([...prev.unlockedLocations, 'breakroom'])];
          messages.push('Break Room unlocked. Time to meet your colleagues.');
        }
      }

      messages.push(`Acquired: ${upgrade.name}`);

      // Add all messages to notifications (in reverse order so main message shows first)
      messages.reverse().forEach(msg => addMessage(msg));

      grantXP(10); // XP_REWARDS.purchaseUpgrade
      checkAchievements();
      return newState;
    });
  };

  const printPaper = () => {
    setGameState(prev => {
      if (!prev.printerUnlocked) {
        addMessage('The printer room is locked. You need access first.');
        return prev;
      }

      const energyCost = 3;
      if (prev.energy < energyCost) {
        addMessage('Too exhausted to operate the printer.');
        return prev;
      }

      // Calculate paper quality based on sanity + printer upgrades
      const paperQuality = calculatePaperQuality(prev);

      // Calculate paper gain based on upgrades
      const basePaperGain = prev.paperPerPrint || 1;

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

      addMessage(message);
      const newState = {
        ...prev,
        paper: prev.paper + basePaperGain,
        energy: Math.max(0, prev.energy - energyCost),
        printCount: (prev.printCount || 0) + 1,
        paperQuality: paperQuality // Update paper quality in state
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
        // Reality Printer also adds paperPerSecond
        if (upgrade.id === 'reality_printer') {
          newState.paperPerSecond = (prev.paperPerSecond || 0) + 1;
        }
      } else if (upgrade.effect === 'paperPerSecond') {
        newState.paperPerSecond = (prev.paperPerSecond || 0) + upgrade.value;
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
        addMessage(checkResult.reason);
        return prev;
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
        if (qualityOutcome === 'corrupted') {
          triggerScreenEffect('shake');
        }
      }, 100);

      // Notification message
      const icon = qualityIcons[qualityOutcome];
      const qualityLabel = qualityOutcome.toUpperCase();
      const message = `${icon} ${tierData.name} [${qualityLabel}] created! Check File Drawer to consume.`;

      addMessage(message);

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

      addMessage(`Shredded ${doc.tierName} [${doc.quality.toUpperCase()}] → +${paperReturn} paper`);
      return {
        ...prev,
        storedDocuments: prev.storedDocuments.filter(d => d.id !== docId),
        paper: prev.paper + paperReturn
      };
    });
  };

  const shredAllNonStarred = () => {
    setGameState(prev => {
      // Filter out non-important documents
      const docsToShred = prev.storedDocuments.filter(d => !d.important);

      if (docsToShred.length === 0) {
        addMessage('No non-starred documents to shred.');
        return prev;
      }

      // Calculate total paper return
      const qualityMultipliers = {
        corrupted: 0.1,
        standard: 0.3,
        pristine: 0.5,
        perfect: 0.7
      };

      const tierCosts = [0, 5, 10, 20, 35, 50];

      const totalPaperReturn = docsToShred.reduce((sum, doc) => {
        const basePaperCost = tierCosts[doc.tier] || 5;
        const paperReturn = Math.floor(basePaperCost * qualityMultipliers[doc.quality]);
        return sum + paperReturn;
      }, 0);

      // Keep only important documents
      const remainingDocuments = prev.storedDocuments.filter(d => d.important);

      addMessage(`Shredded ${docsToShred.length} document${docsToShred.length !== 1 ? 's' : ''} → +${totalPaperReturn} paper`);
      return {
        ...prev,
        storedDocuments: remainingDocuments,
        paper: prev.paper + totalPaperReturn
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
          duration: outcome.buff.duration,  // Store duration for later calculations
          expiresAt: Date.now() + (outcome.buff.duration * 1000),
          ...outcome.buff
        };

        // Check if player has room for more buffs
        if (canAddMoreBuffs(prev)) {
          // Add buff normally
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
        } else {
          // At max capacity - trigger replacement modal
          newState.pendingBuff = buff;
          newState.pendingBuffDocument = doc;
          messages.push('Buff limit reached. Choose a buff to replace.');

          // Don't remove the document yet - it will be removed when replacement happens
          // So we need to add it back to stored documents
          newState.storedDocuments = [...prev.storedDocuments, doc];
        }
      }

      // Handle debuffs
      if (outcome.debuff) {
        const debuff = {
          id: `debuff_${doc.type}_${doc.tier}_${Date.now()}`,
          name: `${doc.tierName} (CORRUPTED)`,
          desc: outcome.desc,
          duration: outcome.debuff.duration,  // Store duration for later calculations
          expiresAt: Date.now() + (outcome.debuff.duration * 1000),
          ...outcome.debuff
        };

        // Check if player has room for more buffs (debuffs count against limit too)
        if (canAddMoreBuffs(prev)) {
          // Add debuff normally
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
        } else {
          // At max capacity - trigger replacement modal
          newState.pendingBuff = debuff;
          newState.pendingBuffDocument = doc;
          messages.push('Buff limit reached. Choose a buff to replace.');

          // Don't remove the document yet - it will be removed when replacement happens
          // So we need to add it back to stored documents
          newState.storedDocuments = [...prev.storedDocuments, doc];
        }
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

      // Add all messages to notifications
      messages.forEach(msg => addMessage(msg));

      // Grant XP
      if (xpGain > 0) {
        setTimeout(() => grantXP(xpGain), 50);
      }
      setTimeout(() => checkAchievements(), 100);

      return newState;
    });
  };

  /**
   * Remove an active buff manually
   * @param {string} buffId - ID of buff to remove
   */
  const removeActiveBuff = (buffId) => {
    setGameState(prev => {
      const filteredBuffs = (prev.activeReportBuffs || []).filter(buff => buff.id !== buffId);

      addMessage('Buff removed.');
      return {
        ...prev,
        activeReportBuffs: filteredBuffs
      };
    });
  };

  /**
   * Replace an existing buff with the pending buff
   * @param {string} buffIdToReplace - ID of buff to replace
   */
  const replaceBuff = (buffIdToReplace) => {
    setGameState(prev => {
      if (!prev.pendingBuff) return prev;

      // Remove the buff being replaced
      const filteredBuffs = (prev.activeReportBuffs || []).filter(
        buff => buff.id !== buffIdToReplace
      );

      // Add the new buff with fresh expiresAt timestamp
      const newBuff = {
        ...prev.pendingBuff,
        expiresAt: Date.now() + (prev.pendingBuff.duration * 1000)
      };

      const messages = [];

      // Remove the pending document from storage (it's being consumed now)
      const updatedDocs = prev.storedDocuments.filter(d => d.id !== prev.pendingBuffDocument?.id);

      // Generate buff message
      const buffParts = [];
      if (newBuff.ppMult && newBuff.ppMult >= 1) {
        buffParts.push(`${((newBuff.ppMult - 1) * 100).toFixed(0)}% more PP`);
      }
      if (newBuff.xpMult && newBuff.xpMult >= 1) {
        buffParts.push(`${((newBuff.xpMult - 1) * 100).toFixed(0)}% more XP`);
      }
      if (newBuff.energyCostMult && newBuff.energyCostMult < 1) {
        const reduction = ((1 - newBuff.energyCostMult) * 100).toFixed(0);
        buffParts.push(`${reduction}% less energy cost`);
      }
      if (newBuff.noSanityDrain) buffParts.push('sanity drain paused');
      if (newBuff.materialMult) buffParts.push(`${newBuff.materialMult}x materials`);
      if (newBuff.ppPerSecondMult) buffParts.push(`PP/sec: ${newBuff.ppPerSecondMult}x`);

      // Check if it's a debuff (negative effects)
      const isDebuff = (newBuff.ppMult && newBuff.ppMult < 1) ||
        (newBuff.energyCostMult && newBuff.energyCostMult > 1);

      const duration = Math.floor(newBuff.duration / 60);
      if (isDebuff) {
        messages.push(`DEBUFF replaced: ${buffParts.join(', ')} for ${duration}min`);
      } else {
        messages.push(`BUFF replaced: ${buffParts.join(', ')} for ${duration}min`);
      }

      // Add all messages to notifications
      messages.forEach(msg => addMessage(msg));

      return {
        ...prev,
        activeReportBuffs: [...filteredBuffs, newBuff],
        pendingBuff: null,
        pendingBuffDocument: null,
        storedDocuments: updatedDocs
      };
    });
  };

  /**
   * Cancel buff replacement and keep current buffs
   * Consumes the document for immediate rewards but ignores the buff
   */
  const cancelBuffReplacement = () => {
    setGameState(prev => {
      // Remove the document from storage (it's being consumed for immediate rewards, just without the buff)
      const updatedDocs = prev.storedDocuments.filter(d => d.id !== prev.pendingBuffDocument?.id);

      addMessage('Document consumed. Buff ignored.');
      return {
        ...prev,
        pendingBuff: null,
        pendingBuffDocument: null,
        storedDocuments: updatedDocs
      };
    });
  };

  /**
   * Archive Search Action (Added 2025-11-24)
   * Handles the "CASE-882" printer clue secret
   */
  const searchArchive = (query) => {
    const normalizedQuery = query.toUpperCase().trim();
    const validQueries = ['CASE-882', 'CASE 882', '882', 'CASE882'];

    if (validQueries.includes(normalizedQuery)) {
      // Trigger screen flash effect
      triggerScreenEffect('flash');

      setGameState(prev => {
        // Don't grant rewards if already found
        if (prev.employee0Found) {
          // Still open the file for re-examination
          setTimeout(() => {
            const EMPLOYEE_0_FILE = {
              id: 'employee_0',
              name: 'CASE-882: "Employee 0"',
              story: 'SUBJECT: [REDACTED]\nSTATUS: TERMINATED/PROMOTED/NEVER EXISTED\n\n"We found him in the walls. Or rather, the walls found him. He had become the office. His skin was drywall. His blood was ink. He kept screaming about the printer. About the number 882. He said it was the key. He said it was the door. We didn\'t believe him until he printed himself out of existence."\n\nEFFECT: Permanent Sanity Regeneration (+0.5/sec) & Passive PP Generation (+0.5/sec).',
              reward: {
                sanityRegen: 0.5,
                ppPerSecond: 0.5
              }
            };
            examineItem(EMPLOYEE_0_FILE);
          }, 500);
          return prev;
        }

        // First-time discovery: grant rewards
        const newSanity = Math.min(100, prev.sanity + 20);
        const newState = {
          ...prev,
          employee0Found: true,
          sanity: newSanity,
          ppPerSecond: prev.ppPerSecond + 0.5,
          examinedItems: (prev.examinedItems || 0) + 1
        };

        // Show the file in ExamineModal
        setTimeout(() => {
          const EMPLOYEE_0_FILE = {
            id: 'employee_0',
            name: 'CASE-882: "Employee 0"',
            story: 'SUBJECT: [REDACTED]\nSTATUS: TERMINATED/PROMOTED/NEVER EXISTED\n\n"We found him in the walls. Or rather, the walls found him. He had become the office. His skin was drywall. His blood was ink. He kept screaming about the printer. About the number 882. He said it was the key. He said it was the door. We didn\'t believe him until he printed himself out of existence."\n\nEFFECT: Permanent Sanity Regeneration (+0.5/sec) & Passive PP Generation (+0.5/sec).',
            reward: {
              sanityRegen: 0.5,
              ppPerSecond: 0.5
            }
          };
          examineItem(EMPLOYEE_0_FILE);
        }, 500);

        return newState;
      });

      addMessage('ACCESS GRANTED. RESTRICTED FILE "EMPLOYEE 0" RETRIEVED.');
      addMessage('Sanity restored +20. Reality stabilizes (+0.5 PP/sec).');
      grantXP(50);
      setTimeout(() => checkAchievements(), 100);

      return { success: true };
    } else {
      addMessage('No records found for that query.');
      return { success: false };
    }
  };

  // Return all action handlers
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
    buyUpgrade,
    printPaper,
    buyPrinterUpgrade,
    enterPrinterRoom,
    triggerScreenEffect,
    // Document system actions (Revised 2025-11-01, Redesigned 2025-11-04)
    printDocument,
    // File drawer system actions (Added 2025-11-04)
    openFileDrawer,
    closeFileDrawer,
    consumeDocument,
    shredDocument,
    shredAllNonStarred,
    toggleDocumentImportant,
    sortDocuments,
    // Buff management actions (Added 2025-11-20)
    removeActiveBuff,
    replaceBuff,
    cancelBuffReplacement,
    // Journal system actions
    openJournal,
    closeJournal,
    switchJournalTab,
    // Archive search action (Added 2025-11-24)
    searchArchive
  };
};