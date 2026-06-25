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
  // Chapter 2 lucid tiers (sanity > 100) take priority — checked high to low.
  if (sanity >= SANITY_TIERS.transcendent.min) return SANITY_TIERS.transcendent;
  if (sanity >= SANITY_TIERS.lucid4.min) return SANITY_TIERS.lucid4;
  if (sanity >= SANITY_TIERS.lucid3.min) return SANITY_TIERS.lucid3;
  if (sanity >= SANITY_TIERS.lucid2.min) return SANITY_TIERS.lucid2;
  if (sanity >= SANITY_TIERS.lucid1.min) return SANITY_TIERS.lucid1;
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

  // Stack buffs additively: extract bonus portions (mult - 1) and sum them
  // Example: 3 buffs of 2.5x each → (1.5 + 1.5 + 1.5) = 4.5 → final mult = 5.5x
  const totalBonus = ppBuffs.reduce((sum, b) => sum + (b.ppMult - 1), 0);
  const buffMod = 1 + totalBonus;

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

  // Stack buffs additively: extract bonus portions (mult - 1) and sum them
  const totalBonus = xpBuffs.reduce((sum, b) => sum + (b.xpMult - 1), 0);
  const buffMod = 1 + totalBonus;

  return baseXP * sanityMod * buffMod; // No floor - allow decimals to accumulate
};

/**
 * Apply energy cost modifier from report buffs
 * @param {number} baseCost - Base energy cost (can be decimal after skill reductions)
 * @param {Object} gameState - Current game state
 * @returns {number} Modified energy cost (decimal value, minimum enforced by caller)
 */
export const applyEnergyCostModifier = (baseCost, gameState) => {
  const activeBuffs = gameState.activeReportBuffs || [];
  const now = Date.now();
  const energyBuffs = activeBuffs.filter(b => b.expiresAt > now && b.energyCostMult);

  // Stack cost reductions additively: extract reduction portions (1 - mult) and sum them
  // Example: 2 buffs of 0.8x each → (0.2 + 0.2) = 0.4 → final mult = 0.6x (40% cost reduction)
  const totalReduction = energyBuffs.reduce((sum, b) => sum + (1 - b.energyCostMult), 0);
  const buffMod = 1 - totalReduction;

  return baseCost * buffMod;
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
 * Get a random dimensional material for essence clause contract
 * @returns {string} Material ID
 */
export const getRandomDimensionalMaterial = () => {
  const totalWeight = DIMENSIONAL_MATERIALS.reduce((sum, m) => sum + m.rarity, 0);
  let random = Math.random() * totalWeight;
  for (const material of DIMENSIONAL_MATERIALS) {
    random -= material.rarity;
    if (random <= 0) return material.id;
  }
  return DIMENSIONAL_MATERIALS[0].id;
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
 * Get the current PP multiplier from active buffs
 * @param {Object} gameState - Current game state
 * @returns {number} Stacked PP multiplier from active buffs (1.0 if none)
 */
export const getActiveBuffPPMultiplier = (gameState) => {
  const activeBuffs = gameState.activeReportBuffs || [];
  const now = Date.now();
  const ppBuffs = activeBuffs.filter(b => b.expiresAt > now && b.ppMult);
  // Stack buffs additively
  const totalBonus = ppBuffs.reduce((sum, b) => sum + (b.ppMult - 1), 0);
  return 1 + totalBonus;
};

/**
 * Get the current PP per second multiplier from active buffs (void contracts).
 * Must mirror computePassivePPPerSecond in ppHelpers.js, which applies only the
 * strongest active ppPerSecondMult buff (they do NOT stack). Returning anything
 * else here makes the stats breakdown disagree with the actual PP/sec headline.
 * @param {Object} gameState - Current game state
 * @returns {number} Strongest active PP/sec multiplier (1.0 if none)
 */
export const getActiveBuffPPPerSecondMultiplier = (gameState) => {
  const activeBuffs = gameState.activeReportBuffs || [];
  const now = Date.now();
  const ppSecBuffs = activeBuffs.filter(b => b.expiresAt > now && b.ppPerSecondMult);
  if (ppSecBuffs.length === 0) return 1;
  // Only the strongest contract applies (matches the canonical tick math).
  return Math.max(...ppSecBuffs.map(b => b.ppPerSecondMult));
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
