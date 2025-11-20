/**
 * Sanity-Paper System Helpers
 *
 * Helper functions for the unified sanity-paper mechanics:
 * - Sanity tier calculations
 * - Paper quality system
 * - Document generation and effects
 * - Reality modifiers based on sanity levels
 */

import { SANITY_TIERS, DOCUMENT_TYPES } from './constants';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';

/**
 * Get the current sanity tier based on sanity level
 * @param {number} sanity - Current sanity value (0-100)
 * @returns {Object} Sanity tier object with modifiers and effects
 */
export const getSanityTier = (sanity) => {
  if (sanity >= SANITY_TIERS.high.min) return SANITY_TIERS.high;
  if (sanity >= SANITY_TIERS.medium.min) return SANITY_TIERS.medium;
  if (sanity >= SANITY_TIERS.low.min) return SANITY_TIERS.low;
  return SANITY_TIERS.critical;
};

/**
 * Apply sanity-based modifier to PP generation
 * @param {number} basePP - Base PP value
 * @param {Object} gameState - Current game state
 * @returns {number} Modified PP value (with decimals)
 */
export const applySanityPPModifier = (basePP, gameState) => {
  const tier = getSanityTier(gameState.sanity);
  const sanityMod = tier.ppMultiplier;

  // Check for active buffs with ppMult modifier
  const activeBuffs = gameState.activeReportBuffs || [];
  const now = Date.now();
  const ppBuffs = activeBuffs.filter(b => b.expiresAt > now && b.ppMult);

  // Apply the highest PP multiplier if multiple buffs exist
  const buffMod = ppBuffs.length > 0 ? Math.max(...ppBuffs.map(b => b.ppMult)) : 1.0;

  return basePP * sanityMod * buffMod; // No floor - allow decimals
};

/**
 * Apply sanity-based modifier to XP generation
 * @param {number} baseXP - Base XP value
 * @param {Object} gameState - Current game state
 * @returns {number} Modified XP value (with decimals for accurate accumulation)
 */
export const applySanityXPModifier = (baseXP, gameState) => {
  const tier = getSanityTier(gameState.sanity);
  const sanityMod = tier.xpMultiplier;

  // Check for active buffs with xpMult modifier
  const activeBuffs = gameState.activeReportBuffs || [];
  const now = Date.now();
  const xpBuffs = activeBuffs.filter(b => b.expiresAt > now && b.xpMult);

  // Apply the highest XP multiplier if multiple buffs exist
  const buffMod = xpBuffs.length > 0 ? Math.max(...xpBuffs.map(b => b.xpMult)) : 1.0;

  return baseXP * sanityMod * buffMod; // No floor - allow decimals to accumulate
};

/**
 * Apply energy cost modifier from report buffs
 * @param {number} baseCost - Base energy cost
 * @param {Object} gameState - Current game state
 * @returns {number} Modified energy cost
 */
export const applyEnergyCostModifier = (baseCost, gameState) => {
  const activeBuffs = gameState.activeReportBuffs || [];
  const now = Date.now();
  const energyBuffs = activeBuffs.filter(b => b.expiresAt > now && b.energyCostMult);

  // Apply the lowest energy cost multiplier (best for player)
  const buffMod = energyBuffs.length > 0 ? Math.min(...energyBuffs.map(b => b.energyCostMult)) : 1.0;

  return Math.ceil(baseCost * buffMod);
};

/**
 * Calculate current paper quality based on sanity and printer upgrades
 * @param {Object} gameState - Current game state
 * @returns {number} Paper quality (0-100)
 */
export const calculatePaperQuality = (gameState) => {
  const printerQuality = gameState.printerQuality || 0;
  const sanity = gameState.sanity;

  // Paper quality is 70% printer quality, 30% sanity
  // At low sanity, paper degrades significantly
  const tier = getSanityTier(sanity);

  let sanityWeight = 0.3;
  let printerWeight = 0.7;

  // Critical sanity makes paper unreliable (more weight on sanity)
  if (tier === SANITY_TIERS.critical) {
    sanityWeight = 0.5;
    printerWeight = 0.5;
  } else if (tier === SANITY_TIERS.low) {
    sanityWeight = 0.4;
    printerWeight = 0.6;
  }

  const quality = Math.floor((printerQuality * printerWeight) + (sanity * sanityWeight));
  return Math.max(0, Math.min(100, quality));
};

/**
 * Check if a document type can be printed
 * @param {string} docType - Document type ID
 * @param {Object} gameState - Current game state
 * @returns {Object} { canPrint: boolean, reason: string }
 */
export const canPrintDocument = (docType, gameState) => {
  const docData = DOCUMENT_TYPES[docType];
  if (!docData) return { canPrint: false, reason: 'Invalid document type' };

  const paperQuality = calculatePaperQuality(gameState);

  // Check printer quality requirement
  if (paperQuality < docData.minPrinterQuality) {
    return {
      canPrint: false,
      reason: `Requires ${docData.minPrinterQuality}% paper quality. Current: ${paperQuality}%`
    };
  }

  // Check sanity requirement for prophecies
  if (docData.maxSanity && gameState.sanity > docData.maxSanity) {
    return {
      canPrint: false,
      reason: `Requires sanity ≤ ${docData.maxSanity}%. Current: ${Math.floor(gameState.sanity)}%`
    };
  }

  // Check resource costs
  const costs = docData.cost;
  if (costs.paper && gameState.paper < costs.paper) {
    return { canPrint: false, reason: `Need ${costs.paper} paper` };
  }
  if (costs.energy && gameState.energy < costs.energy) {
    return { canPrint: false, reason: `Need ${costs.energy} energy` };
  }
  if (costs.sanity && gameState.sanity < costs.sanity) {
    return { canPrint: false, reason: `Need ${costs.sanity} sanity` };
  }

  return { canPrint: true, reason: '' };
};

/**
 * Generate a random prophecy message based on game state
 * @param {Object} gameState - Current game state
 * @returns {string} Prophecy message
 */
export const generateProphecy = (gameState) => {
  const prophecies = [
    'T̴h̴e̴ ̴w̴a̴l̴l̴s̴ ̴h̴a̴v̴e̴ ̴m̴e̴m̴o̴r̴i̴e̴s̴.̴ Day 30 breaks them.',
    'The archive knows your name. It always has.',
    'Portal frequency: 20 toggles. The lights remember.',
    'Combat is negotiation. Agreement is survival. Disagreement is... something else.',
    'Paper begets paper. Print begets reality. Reality begets...?',
    'Dimensional essence sleeps in the void. Wake it with madness.',
    'The printer speaks: "Quality is sanity. Sanity is fiction."',
    'Your colleague was never real. But they remember you.',
    'T̷h̷e̷ ̷d̷r̷a̷w̷e̷r̷ ̷o̷p̷e̷n̷s̷ ̷w̷h̷e̷n̷ ̷y̷o̷u̷ ̷s̷t̷o̷p̷ ̷l̷o̷o̷k̷i̷n̷g̷.',
    'Meditation is remembering to forget. Or forgetting to remember?',
    'The fluorescent lights hum at 60Hz. That is the frequency of truth.',
    'Productivity points: your soul, measured in increments.',
    'The break room exists in all timelines. Choose carefully.',
    'Debug the code. Debug reality. Same thing. Different syntax.',
    'Sanity drains to reveal. Revelation drains to transform.',
    'Paper quality mirrors mind quality. Neither is real.'
  ];

  // Add context-specific prophecies based on game state
  if (gameState.portalUnlocked && !gameState.dimensionalUpgrades?.singularity_collapse) {
    prophecies.push('Two nodes. Collapse them. Escape awaits.');
  }

  if (gameState.disagreementCount >= 15 && gameState.disagreementCount < 20) {
    prophecies.push(`${20 - gameState.disagreementCount} more disagreements. Then: revelation.`);
  }

  if (!gameState.portalUnlocked && gameState.themeToggleCount >= 10) {
    prophecies.push(`Toggle ${20 - gameState.themeToggleCount} more times. Reality tears.`);
  }

  return prophecies[Math.floor(Math.random() * prophecies.length)];
};

/**
 * Get a random dimensional material for essence clause contract
 * @returns {string} Material ID
 */
export const getRandomDimensionalMaterial = () => {
  const materials = Object.keys(DIMENSIONAL_MATERIALS);
  // Weight towards more common materials
  const weights = materials.map(id => {
    const rarity = DIMENSIONAL_MATERIALS[id].rarity;
    if (rarity === 'common') return 10;
    if (rarity === 'uncommon') return 5;
    if (rarity === 'rare') return 2;
    if (rarity === 'epic') return 0.5;
    return 0.1; // legendary
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < materials.length; i++) {
    random -= weights[i];
    if (random <= 0) return materials[i];
  }

  return materials[0]; // Fallback
};

/**
 * Check if sanity drain should be paused (from stability report buff)
 * @param {Object} gameState - Current game state
 * @returns {boolean} True if sanity drain is paused
 */
export const isSanityDrainPaused = (gameState) => {
  const activeBuffs = gameState.activeReportBuffs || [];
  const now = Date.now();
  // Check if any active buff has noSanityDrain property set to true
  return activeBuffs.some(b => b.expiresAt > now && b.noSanityDrain === true);
};

/**
 * Clean up expired buffs from active report buffs
 * @param {Object} gameState - Current game state
 * @returns {Array} Filtered array of active buffs
 */
export const cleanExpiredBuffs = (gameState) => {
  const now = Date.now();
  return (gameState.activeReportBuffs || []).filter(buff => buff.expiresAt > now);
};

/**
 * Count the number of active (non-expired) buffs
 * @param {Object} gameState - Current game state
 * @returns {number} Number of active buffs
 */
export const countActiveBuffs = (gameState) => {
  const now = Date.now();
  const activeBuffs = (gameState.activeReportBuffs || []).filter(buff => buff.expiresAt > now);
  return activeBuffs.length;
};

/**
 * Check if player can add more buffs without replacement
 * @param {Object} gameState - Current game state
 * @returns {boolean} True if player can add more buffs
 */
export const canAddMoreBuffs = (gameState) => {
  const activeCount = countActiveBuffs(gameState);
  const maxBuffs = gameState.maxActiveBuffs || 3;
  return activeCount < maxBuffs;
};

/**
 * Get the current PP multiplier from active buffs
 * @param {Object} gameState - Current game state
 * @returns {number} The highest PP multiplier from active buffs (1.0 if none)
 */
export const getActiveBuffPPMultiplier = (gameState) => {
  const activeBuffs = gameState.activeReportBuffs || [];
  const now = Date.now();
  const ppBuffs = activeBuffs.filter(b => b.expiresAt > now && b.ppMult);
  return ppBuffs.length > 0 ? Math.max(...ppBuffs.map(b => b.ppMult)) : 1.0;
};

/**
 * Get the current XP multiplier from active buffs
 * @param {Object} gameState - Current game state
 * @returns {number} The highest XP multiplier from active buffs (1.0 if none)
 */
export const getActiveBuffXPMultiplier = (gameState) => {
  const activeBuffs = gameState.activeReportBuffs || [];
  const now = Date.now();
  const xpBuffs = activeBuffs.filter(b => b.expiresAt > now && b.xpMult);
  return xpBuffs.length > 0 ? Math.max(...xpBuffs.map(b => b.xpMult)) : 1.0;
};

/**
 * Get the current energy cost multiplier from active buffs
 * @param {Object} gameState - Current game state
 * @returns {number} The lowest energy cost multiplier from active buffs (1.0 if none)
 */
export const getActiveBuffEnergyCostMultiplier = (gameState) => {
  const activeBuffs = gameState.activeReportBuffs || [];
  const now = Date.now();
  const energyBuffs = activeBuffs.filter(b => b.expiresAt > now && b.energyCostMult);
  return energyBuffs.length > 0 ? Math.min(...energyBuffs.map(b => b.energyCostMult)) : 1.0;
};

/**
 * Get the current PP per second multiplier from active buffs (void contracts)
 * @param {Object} gameState - Current game state
 * @returns {number} The highest PP per second multiplier from active buffs (1.0 if none)
 */
export const getActiveBuffPPPerSecondMultiplier = (gameState) => {
  const activeBuffs = gameState.activeReportBuffs || [];
  const now = Date.now();
  const ppSecBuffs = activeBuffs.filter(b => b.expiresAt > now && b.ppPerSecondMult);
  return ppSecBuffs.length > 0 ? Math.max(...ppSecBuffs.map(b => b.ppPerSecondMult)) : 1.0;
};

/**
 * Get display info for current sanity tier
 * @param {Object} gameState - Current game state
 * @returns {Object} Display information
 */
export const getSanityTierDisplay = (gameState) => {
  const tier = getSanityTier(gameState.sanity);
  const paperQuality = calculatePaperQuality(gameState);

  return {
    tierName: tier.name,
    color: tier.color,
    description: tier.description,
    ppModifier: tier.ppMultiplier,
    xpModifier: tier.xpMultiplier,
    paperQuality: paperQuality,
    effects: tier.effects
  };
};

/**
 * Document Tier System Helpers (Added 2025-11-01)
 */

/**
 * Get all unlocked tiers for a document type
 * @param {string} docType - Document type ID ('memo', 'report', 'contract', 'prophecy')
 * @param {Object} gameState - Current game state
 * @returns {Array} Array of unlocked tier objects
 */
export const getUnlockedTiers = (docType, gameState) => {
  const docData = DOCUMENT_TYPES[docType];
  if (!docData || !docData.tiers) return [];

  const mastery = gameState.documentMastery?.[`${docType}s`] || 0;

  return docData.tiers.filter(tier => mastery >= tier.unlockAt);
};

/**
 * Get a specific tier's data
 * @param {string} docType - Document type ID
 * @param {number} tierNumber - Tier number (1-5)
 * @returns {Object|null} Tier data object or null if not found
 */
export const getTierData = (docType, tierNumber) => {
  const docData = DOCUMENT_TYPES[docType];
  if (!docData || !docData.tiers) return null;

  return docData.tiers.find(t => t.tier === tierNumber) || null;
};

/**
 * Check if a specific tier is unlocked
 * @param {string} docType - Document type ID
 * @param {number} tierNumber - Tier number (1-5)
 * @param {Object} gameState - Current game state
 * @returns {boolean} True if tier is unlocked
 */
export const isTierUnlocked = (docType, tierNumber, gameState) => {
  const tierData = getTierData(docType, tierNumber);
  if (!tierData) return false;

  const mastery = gameState.documentMastery?.[`${docType}s`] || 0;
  return mastery >= tierData.unlockAt;
};

/**
 * Roll quality outcome based on paper quality
 * @param {number} paperQuality - Current paper quality (0-100)
 * @returns {string} Outcome bracket: 'corrupted', 'standard', 'pristine', or 'perfect'
 */
export const rollQualityOutcome = (paperQuality) => {
  // Add some randomness to the quality roll (±10%)
  const variance = (Math.random() - 0.5) * 20; // -10 to +10
  const effectiveQuality = Math.max(0, Math.min(100, paperQuality + variance));

  if (effectiveQuality <= 30) return 'corrupted';
  if (effectiveQuality <= 60) return 'standard';
  if (effectiveQuality <= 90) return 'pristine';
  return 'perfect';
};

/**
 * Check if a document tier can be printed
 * @param {string} docType - Document type ID
 * @param {number} tierNumber - Tier number (1-5)
 * @param {Object} gameState - Current game state
 * @returns {Object} { canPrint: boolean, reason: string }
 */
export const canPrintDocumentTier = (docType, tierNumber, gameState) => {
  // Check if tier is unlocked
  if (!isTierUnlocked(docType, tierNumber, gameState)) {
    const tierData = getTierData(docType, tierNumber);
    return {
      canPrint: false,
      reason: `Locked: Need ${tierData?.unlockAt || 0} total ${docType}s printed`
    };
  }

  const tierData = getTierData(docType, tierNumber);
  if (!tierData) return { canPrint: false, reason: 'Invalid tier' };

  // Check sanity requirement for prophecies
  if (tierData.maxSanity !== undefined && gameState.sanity > tierData.maxSanity) {
    return {
      canPrint: false,
      reason: `Requires sanity ≤ ${tierData.maxSanity}%. Current: ${Math.floor(gameState.sanity)}%`
    };
  }

  // Check resource costs
  const costs = tierData.cost;
  if (costs.paper && gameState.paper < costs.paper) {
    return { canPrint: false, reason: `Need ${costs.paper} paper` };
  }
  if (costs.energy && gameState.energy < costs.energy) {
    return { canPrint: false, reason: `Need ${costs.energy} energy` };
  }
  if (costs.sanity && gameState.sanity < costs.sanity) {
    return { canPrint: false, reason: `Need ${costs.sanity} sanity` };
  }

  return { canPrint: true, reason: '' };
};

/**
 * Get progress to next tier unlock
 * @param {string} docType - Document type ID
 * @param {Object} gameState - Current game state
 * @returns {Object} { current: number, next: number, nextTier: number }
 */
export const getTierProgress = (docType, gameState) => {
  const mastery = gameState.documentMastery?.[`${docType}s`] || 0;
  const docData = DOCUMENT_TYPES[docType];

  if (!docData || !docData.tiers) {
    return { current: 0, next: 0, nextTier: null };
  }

  // Find next locked tier
  const nextTier = docData.tiers.find(tier => tier.unlockAt > mastery);

  return {
    current: mastery,
    next: nextTier ? nextTier.unlockAt : mastery,
    nextTier: nextTier ? nextTier.tier : null
  };
};
