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

  // Check for active report buffs
  const activeBuffs = gameState.activeReportBuffs || [];
  const efficiencyBuff = activeBuffs.find(b => b.id === 'efficiency' && b.expiresAt > Date.now());
  const buffMod = efficiencyBuff ? efficiencyBuff.ppMult : 1.0;

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
  return baseXP * tier.xpMultiplier; // No floor - allow decimals to accumulate
};

/**
 * Apply energy cost modifier from report buffs
 * @param {number} baseCost - Base energy cost
 * @param {Object} gameState - Current game state
 * @returns {number} Modified energy cost
 */
export const applyEnergyCostModifier = (baseCost, gameState) => {
  const activeBuffs = gameState.activeReportBuffs || [];
  const focusBuff = activeBuffs.find(b => b.id === 'focus' && b.expiresAt > Date.now());
  const buffMod = focusBuff ? focusBuff.energyCostMult : 1.0;

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
  const stabilityBuff = activeBuffs.find(b => b.id === 'stability' && b.expiresAt > Date.now());
  return stabilityBuff ? stabilityBuff.noSanityDrain : false;
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
