// Helper functions for the skill system

import { SKILLS, LEVEL_SYSTEM, XP_REWARDS } from './skillTreeConstants';

// Add XP and handle level ups
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

// Purchase a skill
export const purchaseSkill = (gameState, skillId, addMessage) => {
  const skill = SKILLS[skillId];
  if (!skill) return gameState;
  
  const currentLevel = (gameState.skills || {})[skillId] || 0;
  const cost = 1;
  
  // Check if can afford
  if ((gameState.skillPoints || 0) < cost) {
    addMessage('❌ Not enough skill points!');
    return gameState;
  }
  
  // Check if already maxed
  if (currentLevel >= skill.maxLevel) {
    addMessage('❌ Skill already at max level!');
    return gameState;
  }
  
  // Check requirements
  if (skill.requires && skill.requires.length > 0) {
    for (const reqSkillId of skill.requires) {
      if (((gameState.skills || {})[reqSkillId] || 0) < 1) {
        const reqSkill = SKILLS[reqSkillId];
        addMessage(`❌ Requires ${reqSkill.name}!`);
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

// Get all active skill effects
export const getActiveSkillEffects = (gameState) => {
  const skills = gameState.skills || {};
  const effects = {
    portalCooldownReduction: 0,
    capacityBonus: 0,
    rarityBonus: 0,
    doubleChance: 0,
    attackDamage: 0,
    sanityResistance: 0,
    maxHealth: 0,
    critChance: 0,
    ppMultiplier: 0,
    energyEfficiency: 0,
    meditationBonus: 0,
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
        effects[key] += value;
      }
    });
  });
  
  return effects;
};

// Apply skill effects to material collection
export const applySkillsToMaterialCollection = (materialId, baseAmount, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  let amount = baseAmount;
  
  // Check for double yield
  if (Math.random() < effects.doubleChance) {
    amount *= 2;
  }
  
  return amount;
};

// Apply skill effects to portal cooldown
export const getModifiedPortalCooldown = (baseCooldown, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  return Math.max(10, baseCooldown - effects.portalCooldownReduction);
};

// Apply skill effects to dimensional capacity
export const getModifiedCapacity = (baseCapacity, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  return baseCapacity + effects.capacityBonus;
};

// Apply skill effects to PP generation
export const applyPPMultiplier = (basePP, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  return basePP * (1 + effects.ppMultiplier);  // Return decimal value
};

// Apply skill effects to energy costs
export const applyEnergyCostReduction = (baseCost, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  return Math.ceil(baseCost * (1 - effects.energyEfficiency));
};

// Apply skill effects to meditation
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

// Get sanity loss modifier
export const getModifiedSanityLoss = (baseLoss, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  return Math.ceil(baseLoss * (1 - effects.sanityResistance));
};