'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MeditationModal from './MeditationModal';
import DebugModal from './DebugModal';
import DebugPanel from './DebugPanel';
import ExamineModal from './ExamineModal';
import DimensionalArea from './DimensionalArea';
import SkillTreeModal from './SkillTreeModal';
import PrinterRoom from './PrinterRoom';
import FileDrawer from './FileDrawer';
import HelpPopup from './HelpPopup';
import AchievementsModal from './AchievementsModal';
import ArchiveModal from './ArchiveModal';
import JournalModal from './JournalModal';
import BuffReplacementModal from './BuffReplacementModal';
import NotificationPopup from './NotificationPopup';
import TierUnlockModal from './TierUnlockModal';
import Chapter2Intro from './Chapter2Intro';
import InsightsPanel from './InsightsPanel';
import FactoryPanel from './FactoryPanel';
import UndercroftPanel from './UndercroftPanel';
import GameActionsPanel from './GameActionsPanel';
import GameUpgradesPanel from './GameUpgradesPanel';
import GameStatsPanel from './GameStatsPanel';
import GameSidebarExtras from './GameSidebarExtras';
import { createGameActions } from './gameActions';
import { getDistortionStyle, distortText, getClockTime, createLevelUpParticles, createSkillPurchaseParticles, createScreenShake, formatPP } from './gameUtils';
import { saveGame, loadGame, exportToClipboard, importFromClipboard, saveToLocalStorage, loadFromLocalStorage } from './saveSystem';
import { computeClickPP, computePassivePPPerSecond } from './ppHelpers';
import { addExperience, purchaseSkill, getActiveSkillEffects, getModifiedPortalCooldown, getMaxSanity } from './skillSystemHelpers';
import { SKILLS, LEVEL_SYSTEM, XP_REWARDS } from './skillTreeConstants';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';
import { getSanityTierDisplay, isSanityDrainPaused, calculatePaperQuality, getSanityTier } from './sanityPaperHelpers';
import { computeFactoryTick, isBuilt, isPaused } from './factoryHelpers';
import { getInsightEffects } from './insightHelpers';
import {
  INITIAL_GAME_STATE,
  LOCATIONS,
  UPGRADES,
  ACHIEVEMENTS,
  EVENTS,
  PRINTER_UPGRADES,
  DIMENSIONAL_UPGRADES,
  HELP_POPUPS,
  HELP_TRIGGERS,
  MECHANICS_ENTRIES,
  PP_MULTIPLIER_TIERS,
  LUCID_ANCHOR_FLOORS,
  RESOURCE_DISCOVERY_GRANT,
  CORE_FACTORY_MACHINE_IDS,
  UNDERCROFT_BREAKTHROUGH_SECONDS
} from './constants';

const PORTAL_UNLOCK_ENTRIES = ['glitched', 'maintenance', 'encrypted_lights'];

// Chapter 2 begins once every upgrade across all three shops is owned.
const isChapter1Complete = (state) =>
  UPGRADES.every((u) => state.upgrades?.[u.id]) &&
  PRINTER_UPGRADES.every((u) => state.printerUpgrades?.[u.id]) &&
  DIMENSIONAL_UPGRADES.every((u) => state.dimensionalUpgrades?.[u.id]);

// Per-tick rate (100ms tick) at which sanity above 100% drifts back toward 100.
const LUCID_DECAY_PER_TICK = 0.02;

// Dev cheats (DebugPanel, +PP / +DAY buttons) only render outside production.
const SHOW_DEV_TOOLS = process.env.NODE_ENV !== 'production';

export default function Game() {
  const [isMobile, setIsMobile] = useState(false);
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [hoveredUpgrade, setHoveredUpgrade] = useState(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedUpgradeType, setSelectedUpgradeType] = useState('pp'); // 'pp', 'printer', 'dimensional'
  const [buffTooltip, setBuffTooltip] = useState(null); // { buff, x, y }
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tierUnlock, setTierUnlock] = useState(null); // { name, multiplier, desc } when tier crossed
  const clickTimestampsRef = useRef([]);

  const addMessage = useCallback((msg) => {
    setGameState(prev => {
      const maxMessages = prev.maxLogMessages || 15;
      const updatedMessages = [msg, ...prev.recentMessages];

      // Create notification popup for the message
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: msg,
        timestamp: Date.now()
      };

      return {
        ...prev,
        recentMessages: updatedMessages.slice(0, maxMessages),
        notifications: [...(prev.notifications || []), notification]
      };
    });
  }, []);

  const dismissNotification = useCallback((notificationId) => {
    setGameState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== notificationId)
    }));
  }, []);

  const grantXP = useCallback((amount, showParticles = true) => {
    setGameState(prev => {
      // Pass empty function to prevent addExperience from adding messages
      const xpResult = addExperience(prev, amount, () => {});

      // Manually add level-up message here to avoid duplicates
      const messages = [];
      if (xpResult.leveledUp) {
        const levelsGained = xpResult.playerLevel - prev.playerLevel;
        const skillPointsGained = xpResult.skillPoints - (prev.skillPoints || 0);

        if (levelsGained === 1) {
          messages.push(`LEVEL UP! You are now level ${xpResult.playerLevel}. +${skillPointsGained} Skill Point${skillPointsGained > 1 ? 's' : ''}!`);
        } else {
          messages.push(`LEVEL UP! You gained ${levelsGained} levels and are now level ${xpResult.playerLevel}. +${skillPointsGained} Skill Points!`);
        }

        if (showParticles) {
          setTimeout(() => {
            createLevelUpParticles();
          }, 100);
        }
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
          achievementMessages.push(`ACHIEVEMENT: ${achievement.name} (+${XP_REWARDS.completeAchievement} XP)`);
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

        // Create notifications for all achievement messages
        const newNotifications = achievementMessages.map(msg => ({
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: msg,
          timestamp: Date.now()
        }));

        return {
          ...prev,
          ...xpResult,
          achievements: newAchievements,
          recentMessages: [...achievementMessages.reverse(), ...prev.recentMessages].slice(0, prev.maxLogMessages || 15),
          notifications: [...(prev.notifications || []), ...newNotifications]
        };
      }
      return prev;
    });
  }, []);

  // Portal unlock: triggers when all three light-related archive entries have been read AND day >= 7
  useEffect(() => {
    setGameState(prev => {
      const hasAllEntries = PORTAL_UNLOCK_ENTRIES.every(id => prev.examinedArchiveItems.includes(id));
      if (hasAllEntries && prev.day >= 7 && !prev.portalUnlocked) {
        const messages = [
          'The lights respond to what you have read.',
          'Something tears open in the fabric of the office.',
          'NEW LOCATION: The Portal'
        ];
        setTimeout(() => createScreenShake(), 0);
        const newNotifications = messages.map(msg => ({
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: msg,
          timestamp: Date.now()
        }));
        return {
          ...prev,
          portalUnlocked: true,
          unlockedLocations: [...new Set([...prev.unlockedLocations, 'portal'])],
          sanity: Math.max(0, prev.sanity - 10),
          recentMessages: [...messages.reverse(), ...prev.recentMessages].slice(0, prev.maxLogMessages || 15),
          notifications: [...(prev.notifications || []), ...newNotifications]
        };
      }
      return prev;
    });
  }, [gameState.examinedArchiveItems]);

  // Reset upgrade type selection if it becomes unavailable
  useEffect(() => {
    if (selectedUpgradeType === 'printer' && !gameState.printerUnlocked) {
      setSelectedUpgradeType('pp');
    } else if (selectedUpgradeType === 'dimensional' && !gameState.portalUnlocked) {
      setSelectedUpgradeType('pp');
    }
  }, [selectedUpgradeType, gameState.printerUnlocked, gameState.portalUnlocked]);

  const actions = useMemo(
    () => createGameActions(setGameState, addMessage, checkAchievements, grantXP),
    [setGameState, addMessage, checkAchievements, grantXP]
  );

  // Keep a ref to the latest state for save-on-unload.
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  });

  // Restore the autosave on mount (migrated + offline progress applied).
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      setGameState(prev => ({ ...prev, ...saved }));
      setTimeout(() => addMessage('Progress restored from autosave.'), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave to localStorage every 15s and on tab close.
  useEffect(() => {
    const id = setInterval(() => {
      saveToLocalStorage(gameStateRef.current);
    }, 15000);
    const onUnload = () => saveToLocalStorage(gameStateRef.current);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  const handlePurchaseSkill = (skillId) => {
    setGameState(prev => {
      const result = purchaseSkill(prev, skillId, addMessage);

      // If purchase failed for any reason (returns same state)
      if (result === prev) {
        setTimeout(() => createScreenShake('small'), 0);
        return prev;
      }

      // If purchase was successful
      if (result !== prev) {
        const skill = SKILLS[skillId];
        const newLevel = result.skills?.[skillId] || 0;

        setTimeout(() => createSkillPurchaseParticles(), 0);

        return {
          ...result,
          recentMessages: [`Learned ${skill.name} (Level ${newLevel})!`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)
        };
      }

      return result;
    });
  };

  const handleSaveGame = () => {
    const stateToSave = { ...gameState, lastSavedAt: Date.now() };
    saveGame(stateToSave);
    setGameState(prev => ({ ...prev, lastSavedAt: stateToSave.lastSavedAt }));
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
    const stateToExport = { ...gameState, lastSavedAt: Date.now() };
    const success = await exportToClipboard(stateToExport);
    if (success) {
      setGameState(prev => ({ ...prev, lastSavedAt: stateToExport.lastSavedAt }));
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
      // Safety check for materials
      if (!upgrade.materials || typeof upgrade.materials !== 'object') {
        console.warn('[PURCHASE] Invalid materials for upgrade:', upgrade);
        return prev;
      }

      const materialAfford = Object.entries(upgrade.materials).every(
        ([id, req]) => (prev.dimensionalInventory?.[id] || 0) >= req
      );
      const ppAfford = !upgrade.ppCost || (prev.pp || 0) >= upgrade.ppCost;
      if (!materialAfford || !ppAfford || prev.dimensionalUpgrades?.[upgrade.id]) return prev;

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
      } else if (upgrade.effect === 'portalCooldown' || upgrade.effect === 'portalRespawn') {
        const newMaxCooldown = getModifiedPortalCooldown(60, newState);
        if (prev.portalCooldown > newMaxCooldown) {
          newState.portalCooldown = newMaxCooldown;
          newState.recentMessages = [`Crafted: ${upgrade.name}. Portal cooldown adjusted to ${newMaxCooldown}s.`, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
        }
      }

      if (upgrade.ppCost) {
        newState.pp = (prev.pp || 0) - upgrade.ppCost;
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
      effects.push('Debug rewards scale with passive income + a 5 min +25% PP buff; failures no longer drain sanity');
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
    } else if (upgrade.effect === 'portalScan') {
      effects.push('Rarer materials spawn far more often (+50% rarity odds)');
    }
    
    return effects.length > 0 ? effects.join(' • ') : 'Unknown effect';
  };

  // Calculate effective PP/s with all buffs applied (for display)
  const getEffectivePPPerSecond = () => computePassivePPPerSecond(gameState);

  // Calculate multiplier percentage for display
  const getPPPerSecondMultiplier = () => {
    if (gameState.ppPerSecond <= 0) return 0;
    const base = gameState.ppPerSecond;
    const effective = getEffectivePPPerSecond();
    return ((effective / base - 1) * 100);
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
          // Canonical passive chain (shared with the PP/sec display).
          // Divide by 10 because the interval runs 10x per second.
          newState.pp = prev.pp + computePassivePPPerSecond(prev) / 10;
        }

        if (prev.paperPerSecond > 0) {
          newState.paper = prev.paper + prev.paperPerSecond / 10;
        }

        newState.timeInOffice = prev.timeInOffice + 0.1;
        if (Math.floor(newState.timeInOffice) % 60 === 0 && Math.floor(newState.timeInOffice) !== Math.floor(prev.timeInOffice)) {
          newState.day = prev.day + 1;
        }

        // Sanity drain system - base drain reduced by upgrades
        // Phase 1 foreshadowing: very light drain begins at 20 PP
        if (prev.phase === 1 && prev.pp > 20) {
          if (!isSanityDrainPaused(prev)) {
            newState.sanity = Math.max(0, prev.sanity - 0.01);
          }
        }

        // Phase 2 full drain: triggered at 100 PP (lowered from 500 for earlier horror).
        // In Chapter 2, above 100% sanity the office no longer pulls at you — only
        // lucid decay applies up there (handled below), so skip this drain.
        if (prev.phase >= 2 && !((prev.chapter || 1) >= 2 && prev.sanity > 100)) {
          // Check if sanity drain is paused by stability report buff
          if (!isSanityDrainPaused(prev)) {
            let sanityDrainRate = 0.05; // Base drain rate

            // Pills reduce drain by 50%
            if (prev.upgrades.pills) {
              sanityDrainRate *= 0.5;
            }

            // Void Shield reduces drain by additional 50%
            if (prev.dimensionalUpgrades?.void_shield) {
              sanityDrainRate *= 0.5;
            }

            // Mental Fortitude skill slows sanity loss
            const sanityLossReduction = Math.min(0.9, getActiveSkillEffects(prev).sanityLossReduction || 0);
            if (sanityLossReduction > 0) {
              sanityDrainRate *= (1 - sanityLossReduction);
            }

            // Apply sanity drain
            newState.sanity = Math.max(0, prev.sanity - sanityDrainRate);
          }
        }

        // Update paper quality based on current sanity + printer quality
        if (prev.printerUnlocked) {
          newState.paperQuality = calculatePaperQuality(newState);
        }

        // Reality Anchor sets minimum sanity threshold
        if (prev.dimensionalUpgrades?.reality_anchor && newState.sanity < 20) {
          newState.sanity = 20;
        }

        // Chapter 2: above 100% sanity drifts back toward 100 (lucid decay), so
        // staying lucid takes upkeep. Clarity buffs (noSanityDrain) pause it, and
        // Steady Mind insights slow it.
        if ((prev.chapter || 1) >= 2 && newState.sanity > 100 && !isSanityDrainPaused(prev)) {
          const decay = LUCID_DECAY_PER_TICK * (1 - getInsightEffects(prev).lucidDecayReduction);
          newState.sanity = Math.max(100, newState.sanity - decay);
        }

        // Lucid Anchor sets a permanent high sanity floor once researched.
        const lucidFloor = LUCID_ANCHOR_FLOORS[prev.lucidAnchorTier || 0] || 0;
        if (lucidFloor > 0 && newState.sanity < lucidFloor) {
          newState.sanity = lucidFloor;
        }

        // Clamp sanity to its current cap. Chapter 1 uses the standard 100 cap (or
        // a Sanity Erosion contract's lowered cap); Chapter 2 lifts it to maxSanity.
        const maxSanityCap = (prev.chapter || 1) >= 2 ? (prev.maxSanity || 1000) : getMaxSanity(100, prev);
        if (newState.sanity > maxSanityCap) {
          newState.sanity = maxSanityCap;
        }

        // (File-drawer capacity is derived via getMaxStoredDocuments and enforced
        // in printDocument. The buff cap, gameState.maxActiveBuffs, is left alone.)

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
              if (event.sanity) {
                // Chapter 2 lifts the sanity cap, so don't snap a lucid climb back to 100.
                const sanityCap = (prev.chapter || 1) >= 2 ? (prev.maxSanity || 1000) : 100;
                newState.sanity = Math.max(0, Math.min(sanityCap, prev.sanity + event.sanity));
              }
              newState.discoveredEvents = [...prev.discoveredEvents, event.id];
            }
          }
        }

        if (prev.phase === 1 && prev.pp > 100) {
          newState.phase = 2;
          newState.recentMessages = ['Something has changed. Or has it always been this way?', ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
        }

        // --- Chapter 2: A Way Through ---
        // Trigger the intro cinematic once every upgrade is owned.
        if ((prev.chapter || 1) < 2 && !prev.chapter2IntroSeen && !prev.chapter2IntroActive && isChapter1Complete(prev)) {
          newState.chapter2IntroActive = true;
        }

        // While lucid (>100%), gather the new resources. They only accrue after
        // discovery; Perception/Cognition insights boost the rates.
        if ((prev.chapter || 1) >= 2 && prev.resourcesUnlocked && newState.sanity > 100) {
          const lucidTier = getSanityTier(newState.sanity);
          const ie = getInsightEffects(prev);
          newState.lucidity = (prev.lucidity || 0) + ((lucidTier.lucidityRate || 0) * (1 + ie.lucidityRateMult)) / 10;
          newState.intelligence = (prev.intelligence || 0) + ((lucidTier.intelRate || 0) * (1 + ie.intelRateMult)) / 10;
        }

        // Discovery: the first time sanity reaches 1000%, reveal the resources.
        // Check prev.sanity too: lucid decay (applied above) would otherwise nudge
        // a freshly-meditated 1000% down to 999.98 before this check ever sees it.
        if ((prev.chapter || 1) >= 2 && !prev.resourcesUnlocked && (newState.sanity >= 1000 || prev.sanity >= 1000)) {
          newState.resourcesUnlocked = true;
          newState.factoryUnlocked = true;
          newState.lucidity = (newState.lucidity ?? prev.lucidity ?? 0) + RESOURCE_DISCOVERY_GRANT.lucidity;
          newState.intelligence = (newState.intelligence ?? prev.intelligence ?? 0) + RESOURCE_DISCOVERY_GRANT.intelligence;
          newState.recentMessages = [
            'You see clearly now. LUCIDITY and INTELLIGENCE take shape in your mind. Beneath it all, machinery waits.',
            ...(newState.recentMessages || prev.recentMessages),
          ].slice(0, prev.maxLogMessages || 15);
        }

        // Factory ("The Construct"): run the production chain every tick, always
        // (true idle), once it has been discovered. Outputs add to whatever other
        // tick logic already set on newState (passive PP, lucidity gen, etc.).
        // Backfill: saves that reached the resources before this feature existed
        // have resourcesUnlocked but not factoryUnlocked — grant it on load.
        if (prev.resourcesUnlocked && !prev.factoryUnlocked) {
          newState.factoryUnlocked = true;
        }
        // Record The Construct as a discovered journal location (in the Locations tab).
        if ((newState.factoryUnlocked || prev.factoryUnlocked) && !(prev.discoveredLocations || []).includes('construct')) {
          newState.discoveredLocations = [...(prev.discoveredLocations || []), 'construct'];
        }
        if (prev.factoryUnlocked) {
          const f = computeFactoryTick(prev, 0.1);
          newState.power = f.newPower;
          newState.substrate = f.newSubstrate;
          newState.factoryMaterialAcc = f.materialAcc;
          newState.factoryTransmuteVoidAcc = f.transmuteVoidAcc;
          newState.factoryTransmuteOutAcc = f.transmuteOutAcc;
          if (f.pp) newState.pp = (newState.pp || 0) + f.pp;
          if (f.paper) newState.paper = (newState.paper || 0) + f.paper;
          if (f.lucidity) newState.lucidity = (newState.lucidity || 0) + f.lucidity;
          if (f.intelligence) newState.intelligence = (newState.intelligence || 0) + f.intelligence;
          // Apply dimensional-inventory changes (condenser adds Void Fragments;
          // the Transmuter consumes them and emits the chosen target material).
          if (f.dimDelta && Object.keys(f.dimDelta).length > 0) {
            const inv = { ...(newState.dimensionalInventory || prev.dimensionalInventory || {}) };
            Object.entries(f.dimDelta).forEach(([mid, d]) => {
              inv[mid] = Math.max(0, (inv[mid] || 0) + d);
            });
            newState.dimensionalInventory = inv;
          }

          // Chapter 2, Phase A: when every core machine is built and running at
          // once (nothing paused or halted) for a sustained window, the Extractor
          // breaks through the floor and reveals THE UNDERCROFT.
          if (!prev.undercroftUnlocked) {
            const status = f.status || {};
            const core = CORE_FACTORY_MACHINE_IDS;
            // These consumers running proves power + substrate are balanced. The
            // Transmuter is excluded from the "running" check because it halts
            // whenever Void Fragments momentarily hit 0 (a normal oscillation);
            // it (and the generator/capacitor) need only be built.
            const mustRun = ['extractor', 'conv_pp', 'conv_paper', 'conv_lucidity', 'conv_intelligence', 'conv_material'];
            const fullyRunning =
              core.every((id) => isBuilt(prev, id)) &&
              core.every((id) => !isPaused(prev, id)) &&
              mustRun.every((id) => status[id] === 'running');
            if (fullyRunning) {
              const secs = (prev.factoryFullRunSeconds || 0) + 0.1;
              newState.factoryFullRunSeconds = secs;
              if (secs >= UNDERCROFT_BREAKTHROUGH_SECONDS) {
                newState.undercroftUnlocked = true;
                newState.discoveredLocations = (prev.discoveredLocations || []).includes('undercroft')
                  ? prev.discoveredLocations
                  : [...(prev.discoveredLocations || []), 'undercroft'];
                newState.recentMessages = [
                  'The whole Construct runs as one. The floor gives way. Beneath it: more dark, and a way in. THE UNDERCROFT is open.',
                  ...(newState.recentMessages || prev.recentMessages),
                ].slice(0, prev.maxLogMessages || 15);
              }
            } else {
              newState.factoryFullRunSeconds = 0;
            }
          }
        }

        // PP tier multiplier check
        const currentTierCheck = newState.ppMultiplierTier || 0;
        const nextTierData = PP_MULTIPLIER_TIERS.find(t => t.tier === currentTierCheck + 1);
        if (nextTierData && newState.pp >= nextTierData.threshold) {
          newState.ppMultiplierTier = nextTierData.tier;
          setTimeout(() => {
            setTierUnlock({ name: nextTierData.name, multiplier: nextTierData.multiplier, desc: nextTierData.desc });
            addMessage(`TIER UNLOCKED: ${nextTierData.name}. PP multiplier is now ${nextTierData.multiplier}x. ${nextTierData.desc}`);
          }, 0);
        }

        // Focus Mode expiry check — clear buff once timestamp has passed
        if (prev.focusModeExpiry > 0 && Date.now() > prev.focusModeExpiry) {
          newState.focusModeExpiry = 0;
          setTimeout(() => addMessage('Focus Mode faded. The rhythm is broken.'), 0);
        }

        // Journal discovery: mechanics are "learned by experiencing them", so
        // record any mechanic whose trigger condition is currently satisfied —
        // independent of the help popups (which can be disabled or whose brief
        // low-sanity / low-quality windows are easy to miss).
        const learned = prev.discoveredMechanics || [];
        const newlyLearned = Object.keys(HELP_TRIGGERS).filter(
          (key) => MECHANICS_ENTRIES[key] && !learned.includes(key) && HELP_TRIGGERS[key](newState)
        );
        if (newlyLearned.length > 0) {
          newState.discoveredMechanics = [...learned, ...newlyLearned];
        }

        // Prune expired report buffs/debuffs and tell the player when each ends,
        // so timed effects never disappear silently.
        const nowTs = Date.now();
        const currentBuffs = prev.activeReportBuffs || [];
        const expiredBuffs = currentBuffs.filter(b => b.expiresAt <= nowTs);
        if (expiredBuffs.length > 0) {
          newState.activeReportBuffs = currentBuffs.filter(b => b.expiresAt > nowTs);
          expiredBuffs.forEach(b => {
            setTimeout(() => addMessage(`${b.name} wore off.`), 0);
          });
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

  // Keyboard shortcuts (Added 2025-10-31)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // 'J' key opens/closes journal
      if (e.key === 'j' || e.key === 'J') {
        setGameState(prev => ({
          ...prev,
          journalOpen: !prev.journalOpen
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    checkAchievements();
  }, [gameState.pp, gameState.day, gameState.sortCount, gameState.unlockedLocations.length, gameState.examinedItems, gameState.sanity, checkAchievements]);

  // Meditation unlock: Only unlock when sanity drops to 25% or below
  useEffect(() => {
    if (!gameState.meditationUnlocked && gameState.sanity <= 25) {
      setGameState(prev => ({
        ...prev,
        meditationUnlocked: true
      }));
    }
  }, [gameState.sanity, gameState.meditationUnlocked]);

  // Help system: surface the first help popup whose state-based condition is met
  // and that the player has not seen, then record it in the journal on dismiss
  // (see dismissHelpPopup). State-based, so milestones already passed on an
  // imported save still surface.
  const pendingHelpId = (gameState.helpEnabled && !gameState.currentHelpPopup)
    ? (Object.keys(HELP_TRIGGERS).find(
        (key) =>
          HELP_POPUPS[key] &&
          !gameState.shownHelpPopups.includes(key) &&
          HELP_TRIGGERS[key](gameState)
      ) || null)
    : null;

  useEffect(() => {
    if (!pendingHelpId) return;
    const timer = setTimeout(() => {
      setGameState(prev => {
        if (prev.currentHelpPopup || prev.shownHelpPopups.includes(pendingHelpId)) return prev;
        return { ...prev, currentHelpPopup: HELP_POPUPS[pendingHelpId] };
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [pendingHelpId]);


  const dismissHelpPopup = () => {
    setGameState(prev => {
      if (!prev.currentHelpPopup) return prev;

      return {
        ...prev,
        currentHelpPopup: null,
        shownHelpPopups: [...prev.shownHelpPopups, prev.currentHelpPopup.id],
        // Add mechanic to discovered list for journal (Added 2025-11-01)
        discoveredMechanics: [
          ...(prev.discoveredMechanics || []),
          ...(prev.discoveredMechanics?.includes(prev.currentHelpPopup.id) ? [] : [prev.currentHelpPopup.id])
        ]
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

  // Calculate effective PP per click with all modifiers - MATCHES ACTUAL GAME LOGIC
  const calculateEffectivePPPerClick = () => formatPP(computeClickPP(gameState));

  const handleSortPapers = () => {
    const now = Date.now();
    clickTimestampsRef.current.push(now);
    // Keep only clicks within the last 30 seconds
    clickTimestampsRef.current = clickTimestampsRef.current.filter(t => now - t <= 30000);

    if (clickTimestampsRef.current.length >= 20) {
      // Trigger or refresh Focus Mode — reset 30s expiry window. Announce only
      // on the inactive -> active transition so repeated sorts don't spam.
      setGameState(prev => {
        const wasActive = prev.focusModeExpiry > Date.now();
        const newState = { ...prev, focusModeExpiry: Date.now() + 30000 };
        if (!wasActive) {
          const msg = 'FOCUS MODE engaged. +50% PP while you keep sorting.';
          newState.recentMessages = [msg, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15);
          newState.notifications = [
            ...(prev.notifications || []),
            { id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, message: msg, timestamp: Date.now() }
          ];
        }
        return newState;
      });
    }

    actions.sortPapers();
  };

  const currentLocation = LOCATIONS[gameState.location];
  const availableUpgrades = UPGRADES.filter(u =>
    !gameState.upgrades[u.id] &&
    (u.effect !== 'unlock' || gameState.pp >= u.cost * 0.5) &&
    (!u.dayRequirement || gameState.day >= u.dayRequirement) &&
    (!u.requiresUpgrade || gameState.upgrades[u.requiresUpgrade])
  );

  const exitDimensionalArea = () => {
    setGameState(prev => {
      const effects = getActiveSkillEffects(prev);
      const cooldownTime = getModifiedPortalCooldown(35, prev);
      
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


  if (gameState.chapter2IntroActive) {
    return <Chapter2Intro onComplete={actions.startChapter2} />;
  }

  if (gameState.showSkillTree) {
    return (
      <SkillTreeModal
        gameState={gameState}
        onClose={() => setGameState(prev => ({ ...prev, showSkillTree: false }))}
        onPurchaseSkill={handlePurchaseSkill}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  if (showAchievements) {
    return (
      <AchievementsModal
        gameState={gameState}
        achievements={ACHIEVEMENTS}
        onClose={() => setShowAchievements(false)}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  if (gameState.journalOpen) {
    return (
      <JournalModal
        gameState={gameState}
        onClose={actions.closeJournal}
        onSwitchTab={actions.switchJournalTab}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  if (gameState.insightsOpen) {
    return (
      <InsightsPanel
        gameState={gameState}
        actions={actions}
        onClose={actions.closeInsights}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  if (gameState.factoryOpen) {
    return (
      <FactoryPanel
        gameState={gameState}
        actions={actions}
        onClose={actions.closeFactory}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  if (gameState.undercroftOpen) {
    return (
      <UndercroftPanel
        gameState={gameState}
        actions={actions}
        onClose={actions.closeUndercroft}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  if (gameState.pendingBuff) {
    return (
      <BuffReplacementModal
        gameState={gameState}
        pendingBuff={gameState.pendingBuff}
        onReplace={actions.replaceBuff}
        onCancel={actions.cancelBuffReplacement}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  if (gameState.inDimensionalArea) {
    return (
      <DimensionalArea
        gameState={gameState}
        setGameState={setGameState}
        onExit={exitDimensionalArea}
        grantXP={grantXP}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  if (gameState.inPrinterRoom) {
    return (
      <PrinterRoom
        gameState={gameState}
        setGameState={setGameState}
        onExit={() => setGameState(prev => ({ ...prev, inPrinterRoom: false }))}
        grantXP={grantXP}
        actions={actions}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  if (gameState.fileDrawerOpen) {
    return (
      <FileDrawer
        gameState={gameState}
        onClose={actions.closeFileDrawer}
        actions={actions}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  if (gameState.meditating) {
    return (
      <MeditationModal
        gameState={gameState}
        onComplete={actions.completeMeditation}
        onCancel={actions.cancelMeditation}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  if (gameState.debugMode && gameState.currentBug) {
    return (
      <DebugModal
        gameState={gameState}
        submitDebug={actions.submitDebug}
        updateDebugCode={actions.updateDebugCode}
        cancelDebug={actions.cancelDebug}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
      />
    );
  }

  // Check examiningItem first (takes priority over archive modal)
  if (gameState.examiningItem) {
    return (
      <ExamineModal
        item={gameState.examiningItem}
        closeExamine={actions.closeExamine}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
        gameState={gameState}
        setGameState={setGameState}
        actions={actions}
      />
    );
  }

  if (gameState.archiveOpen) {
    const archiveLocation = LOCATIONS.archive;
    return (
      <ArchiveModal
        items={archiveLocation.items}
        onClose={actions.closeArchive}
        onExamineItem={actions.examineItem}
        notifications={gameState.notifications}
        onDismissNotification={dismissNotification}
        examinedCount={gameState.examinedItems}
        examinedItems={gameState.examinedArchiveItems}
      />
    );
  }

  return (
    <>
      <Header />
      <div
        data-game-container
        style={{
          fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
          padding: isMobile ? '16px' : '20px 40px',
          minHeight: 'calc(100vh - 100px)',
          fontSize: '14px',
          maxWidth: '1400px',
          margin: '0 auto'
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
                border: '1px solid var(--accent-color)',
                color: 'var(--accent-color)',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'inherit',
                opacity: 0.8
              }}
            >
              SKILLS
            </button>
            <button
              onClick={() => setShowAchievements(true)}
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
              ACHIEVEMENTS
            </button>
            <button
              onClick={actions.openJournal}
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
              JOURNAL [J]
            </button>
            {gameState.printerUnlocked && (
              <button
                onClick={actions.openFileDrawer}
                style={{
                  background: 'none',
                  border: `1px solid ${(gameState.storedDocuments?.length || 0) > 0 ? '#ffaa00' : 'var(--accent-color)'}`,
                  color: (gameState.storedDocuments?.length || 0) > 0 ? '#ffaa00' : 'var(--accent-color)',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontFamily: 'inherit',
                  opacity: 0.8
                }}
              >
                FILE DRAWER {(gameState.storedDocuments?.length || 0) > 0 && `(${gameState.storedDocuments.length})`}
              </button>
            )}
            {gameState.resourcesUnlocked && (
              <button
                onClick={actions.openInsights}
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
                INSIGHTS
              </button>
            )}
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
              SAVE
            </button>
            <button
              onClick={toggleHelpSystem}
              style={{
                background: 'none',
                border: `1px solid ${gameState.helpEnabled ? 'var(--accent-color)' : '#666666'}`,
                color: gameState.helpEnabled ? 'var(--accent-color)' : '#666666',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'inherit',
                opacity: gameState.helpEnabled ? 0.8 : 0.4
              }}
            >
              {gameState.helpEnabled ? 'HELP' : 'HELP'}
            </button>
            {SHOW_DEV_TOOLS && (
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
                DEBUG
              </button>
            )}
            {SHOW_DEV_TOOLS && (
              <>
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
              </>
            )}
            <div style={{ fontSize: '12px', textAlign: 'right', opacity: 0.7 }}>
              <div>{getClockTime(gameState.timeInOffice)}</div>
              <div style={{ marginTop: '4px' }}>DAY {Math.floor(gameState.day)}</div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '24px' : '32px',
          alignItems: 'start'
        }}>
          <div>
            <GameActionsPanel
              gameState={gameState}
              isMobile={isMobile}
              currentLocation={currentLocation}
              actions={actions}
              handleSortPapers={handleSortPapers}
              getDistortionStyle={getDistortionStyle}
              distortText={distortText}
              getModifiedPortalCooldown={getModifiedPortalCooldown}
              LOCATIONS={LOCATIONS}
            />

            <GameUpgradesPanel
              gameState={gameState}
              selectedUpgradeType={selectedUpgradeType}
              setSelectedUpgradeType={setSelectedUpgradeType}
              hoveredUpgrade={hoveredUpgrade}
              setHoveredUpgrade={setHoveredUpgrade}
              mousePos={mousePos}
              setMousePos={setMousePos}
              availableUpgrades={availableUpgrades}
              actions={actions}
              purchaseDimensionalUpgrade={purchaseDimensionalUpgrade}
              getUpgradeTooltip={getUpgradeTooltip}
              getPrinterUpgradeTooltip={getPrinterUpgradeTooltip}
              UPGRADES={UPGRADES}
              PRINTER_UPGRADES={PRINTER_UPGRADES}
              DIMENSIONAL_UPGRADES={DIMENSIONAL_UPGRADES}
            />


          </div>

          <div>
            <GameStatsPanel
              gameState={gameState}
              calculateEffectivePPPerClick={calculateEffectivePPPerClick}
              getEffectivePPPerSecond={getEffectivePPPerSecond}
              formatPP={formatPP}
              buffTooltip={buffTooltip}
              setBuffTooltip={setBuffTooltip}
              actions={actions}
              LEVEL_SYSTEM={LEVEL_SYSTEM}
              PP_MULTIPLIER_TIERS={PP_MULTIPLIER_TIERS}
            />

            <GameSidebarExtras
              gameState={gameState}
            />
          </div>
        </div>

        {SHOW_DEV_TOOLS && showDebugPanel && (
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
                marginBottom: '16px',
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
                  SAVE TO FILE
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
                  LOAD FROM FILE
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
                  COPY TO CLIPBOARD
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
                  PASTE FROM CLIPBOARD
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

      {/* Notification Popup System */}
      <NotificationPopup
        notifications={gameState.notifications}
        onDismiss={dismissNotification}
      />

      {/* Tier Unlock Modal */}
      {tierUnlock && (
        <TierUnlockModal
          tierName={tierUnlock.name}
          multiplier={tierUnlock.multiplier}
          tierDesc={tierUnlock.desc}
          onClose={() => setTierUnlock(null)}
        />
      )}

      {/* Buff Tooltip that follows mouse */}
      {buffTooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${buffTooltip.x + 15}px`,
            top: `${buffTooltip.y + 15}px`,
            backgroundColor: 'var(--bg-color)',
            border: '2px solid var(--accent-color)',
            padding: '12px',
            fontSize: '11px',
            fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
            color: 'var(--text-color)',
            zIndex: 10000,
            maxWidth: '280px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>
            {buffTooltip.buff.name}
          </div>
          <div style={{ opacity: 0.9, marginBottom: '8px', fontSize: '10px', fontStyle: 'italic' }}>
            {buffTooltip.buff.desc}
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '4px', opacity: 0.7 }}>
              EFFECTS:
            </div>
            {buffTooltip.effects.map((effect, i) => (
              <div key={i} style={{ fontSize: '10px', opacity: 0.9, marginBottom: '2px' }}>
                • {effect}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '8px', opacity: 0.7, fontSize: '9px' }}>
            {Math.max(0, Math.ceil((buffTooltip.buff.expiresAt - Date.now()) / 1000))}s remaining
          </div>
        </div>
      )}
    </>
  );
}