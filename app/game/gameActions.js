import {
  INITIAL_GAME_STATE,
  LOCATIONS,
  UPGRADES,
  ACHIEVEMENTS,
  EVENTS,
  DEBUG_CHALLENGES,
  EMPLOYEE_0_FILE
} from './constants';
import {
  calculateEffectivePPPerClick,
  calculateEffectivePPPerSecond,
  calculateMaxEnergy,
  calculateEnergyRegen
} from './skillSystemHelpers';
import {
  getRandomDimensionalMaterial
} from './dimensionalConstants';
import {
  canAddMoreBuffs,
  generateProphecy,
  calculatePaperQuality,
  canPrintDocumentTier,
  getTierData,
  rollQualityOutcome
} from './sanityPaperHelpers';
import { TIER_MASTERY_WEIGHTS, XP_REWARDS } from './constants'; // Assuming these are here

/**
 * Game Action Handlers
 *
 * Contains all game actions that modify game state.
 * Actions are created via factory function to access setState, addMessage, etc.
 */
export const createGameActions = (setGameState, addMessage, checkAchievements, grantXP) => {

  const triggerScreenEffect = (effect) => {
    setGameState(prev => ({ ...prev, screenEffect: effect }));
    setTimeout(() => setGameState(prev => ({ ...prev, screenEffect: null })), 500);
  };

  const sortPapers = () => {
    setGameState(prev => {
      if (prev.energy < 2) {
        addMessage("Too exhausted.");
        return prev;
      }
      const ppGain = calculateEffectivePPPerClick(prev);
      return {
        ...prev,
        pp: prev.pp + ppGain,
        energy: prev.energy - 2,
        sortCount: (prev.sortCount || 0) + 1
      };
    });
  };

  const rest = () => {
    setGameState(prev => {
      const maxEnergy = calculateMaxEnergy(prev);
      if (prev.energy >= maxEnergy) {
        addMessage("Fully rested.");
        return prev;
      }
      const regen = calculateEnergyRegen(prev);
      return {
        ...prev,
        energy: Math.min(maxEnergy, prev.energy + regen)
      };
    });
  };

  const startMeditation = () => {
    setGameState(prev => ({ ...prev, meditating: true }));
  };

  const breatheAction = () => {
    // Placeholder
  };

  const cancelMeditation = () => {
    setGameState(prev => ({ ...prev, meditating: false }));
  };

  const startDebugSession = () => {
    setGameState(prev => ({ ...prev, debugMode: true }));
  };

  const submitDebug = () => {
    // Placeholder
  };

  const updateDebugCode = (code) => {
    // Placeholder
  };

  const cancelDebug = () => {
    setGameState(prev => ({ ...prev, debugMode: false }));
  };

  const changeLocation = (loc) => {
    setGameState(prev => ({ ...prev, location: loc }));
  };

  const examineItem = (item) => {
    setGameState(prev => ({ ...prev, examiningItem: item }));
  };

  const closeExamine = () => {
    setGameState(prev => ({ ...prev, examiningItem: null }));
  };

  const buyUpgrade = (upgradeId) => {
    setGameState(prev => {
      const upgrade = UPGRADES.find(u => u.id === upgradeId);
      if (!upgrade) return prev;

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
      messages.reverse().forEach(msg => addMessage(msg));

      grantXP(10);
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

      const paperQuality = calculatePaperQuality ? calculatePaperQuality(prev) : 50;
      const basePaperGain = prev.paperPerPrint || 1;

      let message = "The printer hums.";
      if (paperQuality < 20) message = "The printer screams.";
      else if (paperQuality > 80) message = "Perfect output.";

      addMessage(message);
      const newState = {
        ...prev,
        paper: prev.paper + basePaperGain,
        energy: Math.max(0, prev.energy - energyCost),
        printCount: (prev.printCount || 0) + 1,
        paperQuality: paperQuality
      };

      grantXP(5);
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

      if (upgrade.effect === 'printerQuality') {
        newState.printerQuality = Math.min(100, (prev.printerQuality || 0) + upgrade.value);
      } else if (upgrade.effect === 'paperPerPrint') {
        newState.paperPerPrint = (prev.paperPerPrint || 1) + upgrade.value;
        if (upgrade.id === 'reality_printer') {
          newState.paperPerSecond = (prev.paperPerSecond || 0) + 1;
        }
      } else if (upgrade.effect === 'paperPerSecond') {
        newState.paperPerSecond = (prev.paperPerSecond || 0) + upgrade.value;
      }

      newState.recentMessages = [`Installed: ${upgrade.name}`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);

      grantXP(10);
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

  const printDocument = (docType, tierNumber) => {
    setGameState(prev => {
      const checkResult = canPrintDocumentTier ? canPrintDocumentTier(docType, tierNumber, prev) : { canPrint: true };
      if (!checkResult.canPrint) {
        addMessage(checkResult.reason);
        return prev;
      }

      const tierData = getTierData ? getTierData(docType, tierNumber) : { name: 'Unknown', cost: {}, outcomes: {} };
      if (!tierData) return prev;

      const paperQuality = calculatePaperQuality ? calculatePaperQuality(prev) : 50;
      const qualityOutcome = rollQualityOutcome ? rollQualityOutcome(paperQuality) : 'standard';
      const outcome = tierData.outcomes[qualityOutcome] || {};

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

      const masteryGain = (TIER_MASTERY_WEIGHTS && TIER_MASTERY_WEIGHTS[tierNumber]) || 1;

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

      setTimeout(() => {
        if (qualityOutcome === 'corrupted') {
          triggerScreenEffect('shake');
        }
      }, 100);

      addMessage(`${tierData.name} [${qualityOutcome.toUpperCase()}] created!`);
      return newState;
    });
  };

  const openJournal = () => {
    setGameState(prev => ({ ...prev, journalOpen: true }));
  };

  const closeJournal = () => {
    setGameState(prev => ({ ...prev, journalOpen: false }));
  };

  const switchJournalTab = (tabId) => {
    setGameState(prev => ({ ...prev, journalTab: tabId }));
  };

  const openFileDrawer = () => {
    setGameState(prev => ({ ...prev, fileDrawerOpen: true }));
  };

  const closeFileDrawer = () => {
    setGameState(prev => ({ ...prev, fileDrawerOpen: false }));
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
    setGameState(prev => ({ ...prev, documentSortBy: sortBy }));
  };

  const shredDocument = (docId) => {
    setGameState(prev => {
      const doc = prev.storedDocuments.find(d => d.id === docId);
      if (!doc) return prev;
      addMessage(`Shredded ${doc.tierName}`);
      return {
        ...prev,
        storedDocuments: prev.storedDocuments.filter(d => d.id !== docId),
        paper: prev.paper + 5
      };
    });
  };

  const shredAllNonStarred = () => {
    setGameState(prev => {
      const docsToShred = prev.storedDocuments.filter(d => !d.important);
      if (docsToShred.length === 0) return prev;
      addMessage(`Shredded ${docsToShred.length} documents.`);
      return {
        ...prev,
        storedDocuments: prev.storedDocuments.filter(d => d.important),
        paper: prev.paper + (docsToShred.length * 5)
      };
    });
  };

  const consumeDocument = (docId) => {
    setGameState(prev => {
      const doc = prev.storedDocuments.find(d => d.id === docId);
      if (!doc) return prev;

      const outcome = doc.outcome || {};
      const newState = {
        ...prev,
        storedDocuments: prev.storedDocuments.filter(d => d.id !== docId)
      };

      if (outcome.pp) newState.pp = (prev.pp || 0) + outcome.pp;
      if (outcome.sanity) newState.sanity = Math.min(100, (prev.sanity || 0) + outcome.sanity);
      if (outcome.energy) newState.energy = Math.min(100, (prev.energy || 0) + outcome.energy);

      if (outcome.buff) {
        if (canAddMoreBuffs && canAddMoreBuffs(prev)) {
          const buff = { ...outcome.buff, id: Date.now(), expiresAt: Date.now() + (outcome.buff.duration * 1000) };
          newState.activeReportBuffs = [...(prev.activeReportBuffs || []), buff];
          addMessage("Buff applied.");
        } else {
          addMessage("Buff limit reached.");
        }
      }

      addMessage(`Consumed ${doc.tierName}`);
      return newState;
    });
  };

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

  const replaceBuff = (buffIdToReplace) => {
    setGameState(prev => {
      if (!prev.pendingBuff) return prev;
      const filteredBuffs = (prev.activeReportBuffs || []).filter(buff => buff.id !== buffIdToReplace);
      const newBuff = { ...prev.pendingBuff, expiresAt: Date.now() + (prev.pendingBuff.duration * 1000) };
      return {
        ...prev,
        activeReportBuffs: [...filteredBuffs, newBuff],
        pendingBuff: null,
        pendingBuffDocument: null
      };
    });
  };

  const cancelBuffReplacement = () => {
    setGameState(prev => {
      addMessage('Buff ignored.');
      return {
        ...prev,
        pendingBuff: null,
        pendingBuffDocument: null
      };
    });
  };

  const searchArchive = (query) => {
    const normalizedQuery = query.toUpperCase().trim();
    const validQueries = ['CASE-882', 'CASE 882', '882', 'CASE882'];

    if (validQueries.includes(normalizedQuery)) {
      triggerScreenEffect('flash');

      setGameState(prev => {
        if (prev.employee0Found) return prev;

        const newSanity = Math.min(100, prev.sanity + 20);
        return {
          ...prev,
          employee0Found: true,
          sanity: newSanity,
          ppPerSecond: prev.ppPerSecond + 0.5,
          examinedItems: [...prev.examinedItems, EMPLOYEE_0_FILE.id]
        };
      });

      addMessage('ACCESS GRANTED. RESTRICTED FILE "EMPLOYEE 0" RETRIEVED.');
      addMessage('Sanity restored +20. Reality stabilizes (+0.5 PP/sec).');
      grantXP(50);

      setTimeout(() => {
        examineItem(EMPLOYEE_0_FILE);
      }, 500);

      return { success: true };
    } else {
      addMessage('No records found for that query.');
      return { success: false };
    }
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
    buyUpgrade,
    printPaper,
    buyPrinterUpgrade,
    enterPrinterRoom,
    triggerScreenEffect,
    printDocument,
    openFileDrawer,
    closeFileDrawer,
    consumeDocument,
    shredDocument,
    shredAllNonStarred,
    toggleDocumentImportant,
    sortDocuments,
    removeActiveBuff,
    replaceBuff,
    cancelBuffReplacement,
    openJournal,
    closeJournal,
    switchJournalTab,
    searchArchive
  };
};