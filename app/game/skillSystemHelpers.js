/**
 * Skill System Helpers
 *
 * Pure functions for skill tree logic:
 * - Experience and leveling calculations
 * - Skill purchasing and validation
 * - Active skill effect aggregation
 * - Skill effect application to game mechanics
 */

import { SKILLS, LEVEL_SYSTEM, XP_REWARDS } from './skillTreeConstants';

/**
 * Adds experience points and handles level ups
 *
 * @param {Object} gameState - Current game state
 * @param {number} xpAmount - Amount of XP to add
 * @param {Function} addMessage - Function to add message to event log
 * @returns {Object} Updated state properties: playerLevel, playerXP, skillPoints, leveledUp
 */
export const addExperience = (gameState, xpAmount, addMessage) => {
  const currentLevel = gameState.playerLevel || 1;
  const currentXP = gameState.playerXP || 0;
  const newXP = currentXP + xpAmount;
  
  let newLevel = currentLevel;
  let remainingXP = newXP;
  let skillPointsGained = 0;
  let levelsGained = 0;
  
  while (newLevel < LEVEL_SYSTEM.maxLevel) {
    const xpNeededForNextLevel = LEVEL_SYSTEM.getXPForLevel(newLevel + 1);
    
    if (remainingXP >= xpNeededForNextLevel) {
      remainingXP -= xpNeededForNextLevel;
      newLevel++;
      levelsGained++;
      skillPointsGained += LEVEL_SYSTEM.getSkillPointsPerLevel(newLevel);
    } else {
      break;
    }
  }
  
  const leveledUp = levelsGained > 0;
  
  if (leveledUp) {
    if (levelsGained === 1) {
      addMessage(`🎉 LEVEL UP! You are now level ${newLevel}. +${skillPointsGained} Skill Point${skillPointsGained > 1 ? 's' : ''}!`);
    } else {
      addMessage(`🎉 LEVEL UP! You gained ${levelsGained} levels and are now level ${newLevel}. +${skillPointsGained} Skill Points!`);
    }
  }
  
  return {
    playerLevel: newLevel,
    playerXP: remainingXP,
    skillPoints: (gameState.skillPoints || 0) + skillPointsGained,
    leveledUp
  };
};

/**
 * Attempts to purchase a skill level
 *
 * @param {Object} gameState - Current game state
 * @param {string} skillId - ID of skill to purchase
 * @param {Function} addMessage - Function to add message to event log
 * @returns {Object} Updated game state or unchanged state if purchase failed
 */
export const purchaseSkill = (gameState, skillId, addMessage) => {
  const skill = SKILLS[skillId];
  if (!skill) return gameState;

  const currentLevel = (gameState.skills || {})[skillId] || 0;
  const playerLevel = gameState.playerLevel || 1;
  const cost = 1;

  // Check if can afford
  if ((gameState.skillPoints || 0) < cost) {
    addMessage('Not enough skill points.');
    return gameState;
  }

  // Check if already maxed
  if (currentLevel >= skill.maxLevel) {
    addMessage('Skill already at max level.');
    return gameState;
  }

  // Check minimum level requirement
  if (skill.minLevel && playerLevel < skill.minLevel) {
    addMessage(`Requires Level ${skill.minLevel}.`);
    return gameState;
  }

  // Check requirements
  if (skill.requires && skill.requires.length > 0) {
    for (const reqSkillId of skill.requires) {
      if (((gameState.skills || {})[reqSkillId] || 0) < 1) {
        const reqSkill = SKILLS[reqSkillId];
        addMessage(`Requires ${reqSkill.name}.`);
        return gameState;
      }
    }
  }

  // Purchase skill
  const newSkills = { ...(gameState.skills || {}), [skillId]: currentLevel + 1 };

  return {
    ...gameState,
    skills: newSkills,
    skillPoints: gameState.skillPoints - cost
  };
};

/**
 * Aggregates all active skill effects from purchased skills
 *
 * @param {Object} gameState - Current game state
 * @returns {Object} Effect object with all bonuses
 */
export const getActiveSkillEffects = (gameState) => {
  const skills = gameState.skills || {};
  const effects = {
    // Efficiency Branch
    ppPerClickMultiplier: 0,
    ppPerSecondMultiplier: 0,
    ppMultiplier: 0,

    // Admin Branch
    paperQualityBonus: 0,
    documentDurationMultiplier: 0,
    documentEffectMultiplier: 0,
    documentCostReduction: 0,
    maxStoredDocuments: 0,

    // Survival Branch
    energyCostReduction: 0,
    sanityLossReduction: 0,
    restCooldownReduction: 0,
    meditationBonus: 0,
    maxSanity: 0,

    // Occult Branch
    dimensionalMaterialBonus: 0,
    portalCooldownReduction: 0,
    rareMaterialChance: 0,
    portalDurationBonus: 0,

    // Forbidden Branch
    sanityChaosBonus: 0,
    freeActionChance: 0,
    sanityLossIncrease: 0,

    // Legacy effects (kept for compatibility)
    capacityBonus: 0,
    rarityBonus: 0,
    doubleChance: 0,
    attackDamage: 0,
    sanityResistance: 0,
    maxHealth: 0,
    critChance: 0,
    energyEfficiency: 0,
    upgradeEfficiency: 0
  };

  Object.entries(skills).forEach(([skillId, level]) => {
    if (level === 0) return;
    const skill = SKILLS[skillId];
    if (!skill) return;

    const skillEffects = skill.effect(level);
    Object.entries(skillEffects).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        effects[key] = effects[key] || value;
      } else {
        effects[key] = (effects[key] || 0) + value;
      }
    });
  });

  return effects;
};

/**
 * Applies skill bonuses to material collection
 *
 * @param {string} materialId - ID of material being collected
 * @param {number} baseAmount - Base amount before bonuses
 * @param {Object} gameState - Current game state
 * @returns {number} Final amount after skill bonuses applied
 */
export const applySkillsToMaterialCollection = (materialId, baseAmount, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  let amount = baseAmount;
  
  // Check for double yield
  if (Math.random() < effects.doubleChance) {
    amount *= 2;
  }
  
  return amount;
};

/**
 * Calculates portal cooldown with skill and upgrade modifiers
 *
 * @param {number} baseCooldown - Base cooldown in seconds (default 60)
 * @param {Object} gameState - Current game state
 * @returns {number} Modified cooldown (minimum 10 seconds)
 */
export const getModifiedPortalCooldown = (baseCooldown, gameState) => {
  let cooldown = baseCooldown;

  // Dimensional Anchor: sets cooldown to 30s
  if (gameState.dimensionalUpgrades?.dimensional_anchor) {
    cooldown = 30;
  }

  // Temporal Accelerator: reduces by additional 10s (stacks with anchor)
  if (gameState.dimensionalUpgrades?.temporal_accelerator) {
    cooldown -= 10;
  }

  // Apply skill reductions (percentage-based)
  // reality_anchor skill gives portalCooldownReduction as percentage (0.15 = 15%)
  const effects = getActiveSkillEffects(gameState);
  if (effects.portalCooldownReduction > 0) {
    cooldown = cooldown * (1 - effects.portalCooldownReduction);
  }

  // Minimum 10 seconds
  return Math.max(10, cooldown);
};

/**
 * Calculates dimensional inventory capacity with skill bonuses and dimensional upgrades
 *
 * @param {number} baseCapacity - Base capacity without bonuses
 * @param {Object} gameState - Current game state
 * @returns {number} Total capacity with skill bonuses and upgrades
 */
export const getModifiedCapacity = (baseCapacity, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  let capacity = baseCapacity + effects.capacityBonus;

  // Reality Stabilizer sets capacity to 40
  if (gameState.dimensionalUpgrades?.reality_stabilizer) {
    capacity = 40 + effects.capacityBonus;
  }

  return capacity;
};

/**
 * Applies skill-based PP per click multiplier to base PP gain
 *
 * @param {number} basePP - Base PP amount before multipliers
 * @param {Object} gameState - Current game state
 * @returns {number} PP amount after skill multipliers
 */
export const applyPPMultiplier = (basePP, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  // Apply both ppPerClickMultiplier (from sorting skills) and ppMultiplier (from overall bonuses)
  return basePP * (1 + effects.ppPerClickMultiplier) * (1 + effects.ppMultiplier);
};

/**
 * Applies skill-based PP per second multiplier to base passive PP gain
 *
 * @param {number} basePPS - Base PP/sec before multipliers
 * @param {Object} gameState - Current game state
 * @returns {number} PP/sec amount after skill multipliers
 */
export const applyPPSMultiplier = (basePPS, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  // Apply both ppPerSecondMultiplier (from automation skills) and ppMultiplier (from overall bonuses)
  return basePPS * (1 + effects.ppPerSecondMultiplier) * (1 + effects.ppMultiplier);
};

/**
 * Reduces energy costs based on efficiency skills
 * IMPORTANT: Caps at -90% reduction (minimum 10% of base cost)
 *
 * @param {number} baseCost - Base energy cost
 * @param {Object} gameState - Current game state
 * @returns {number} Reduced energy cost (returns decimal value, minimum 10% of base)
 */
export const applyEnergyCostReduction = (baseCost, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  // Use new energyCostReduction, fallback to legacy energyEfficiency
  const reduction = effects.energyCostReduction || effects.energyEfficiency || 0;
  // Cap at 0.9 (90% reduction max) to prevent gaining energy
  const cappedReduction = Math.min(reduction, 0.9);
  return baseCost * (1 - cappedReduction);
};

/**
 * Applies meditation skill bonuses to sanity restoration
 *
 * @param {number} baseSanity - Base sanity restoration amount
 * @param {Object} gameState - Current game state
 * @returns {number} Final sanity amount with bonuses
 */
export const applyMeditationBonus = (baseSanity, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  return baseSanity * (1 + effects.meditationBonus);  // Return decimal value
};

// Modify material spawn rates based on luck skills
export const getModifiedMaterialRarity = (baseMaterial, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  
  return {
    ...baseMaterial,
    rarity: baseMaterial.rarity * (1 + effects.rarityBonus)
  };
};

/**
 * Get sanity loss modifier
 *
 * @param {number} baseLoss - Base sanity loss amount
 * @param {Object} gameState - Current game state
 * @returns {number} Modified sanity loss
 */
export const getModifiedSanityLoss = (baseLoss, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  // Use new sanityLossReduction, fallback to legacy sanityResistance
  const reduction = effects.sanityLossReduction || effects.sanityResistance || 0;
  // Also apply sanityLossIncrease from forbidden skills
  const increase = effects.sanityLossIncrease || 0;
  return Math.ceil(baseLoss * (1 - reduction + increase));
};

/**
 * Get modified rest cooldown
 *
 * @param {number} baseCooldown - Base rest cooldown in seconds
 * @param {Object} gameState - Current game state
 * @returns {number} Modified cooldown (minimum 5 seconds)
 */
export const getModifiedRestCooldown = (baseCooldown, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  return Math.max(5, baseCooldown - (effects.restCooldownReduction || 0));
};

/**
 * Get maximum sanity with skill bonuses
 *
 * @param {number} baseSanity - Base maximum sanity (usually 100)
 * @param {Object} gameState - Current game state
 * @returns {number} Maximum sanity with bonuses
 */
export const getMaxSanity = (baseSanity, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  return baseSanity + (effects.maxSanity || 0);
};

/**
 * Check if action should be free (temporal distortion skill)
 *
 * @param {Object} gameState - Current game state
 * @returns {boolean} True if action should not consume energy
 */
export const checkFreeAction = (gameState) => {
  const effects = getActiveSkillEffects(gameState);
  const chance = effects.freeActionChance || 0;
  return Math.random() < chance;
};

/**
 * Get chaos bonus from low sanity (sanity sacrifice skill)
 *
 * @param {Object} gameState - Current game state
 * @returns {number} PP multiplier from chaos (0 to max based on sanity lost)
 */
export const getChaosBonus = (gameState) => {
  const effects = getActiveSkillEffects(gameState);
  const chaosRate = effects.sanityChaosBonus || 0;
  if (chaosRate === 0) return 0;

  const sanityLost = 100 - (gameState.sanity || 100);
  return (Math.floor(sanityLost / 10) * chaosRate);
};