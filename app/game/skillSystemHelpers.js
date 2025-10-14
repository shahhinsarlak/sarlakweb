// Revamped Skill System Helper Functions

import { SKILLS, LEVEL_SYSTEM } from './skillTreeConstants';

// Add XP and handle level ups
export const addExperience = (gameState, xpAmount, addMessage) => {
  const currentLevel = gameState.playerLevel || 1;
  const currentXP = gameState.playerXP || 0;
  
  // Apply XP multipliers from skills
  const xpMultiplier = 1 + (getActiveSkillEffects(gameState).xpMultiplier || 0);
  const adjustedXP = Math.floor(xpAmount * xpMultiplier);
  
  const newXP = currentXP + adjustedXP;
  
  let newLevel = currentLevel;
  let remainingXP = newXP;
  let skillPointsGained = 0;
  
  // Check for level ups (can level multiple times)
  while (remainingXP >= LEVEL_SYSTEM.getXPForLevel(newLevel + 1) && newLevel < LEVEL_SYSTEM.maxLevel) {
    remainingXP -= LEVEL_SYSTEM.getXPForLevel(newLevel + 1);
    newLevel++;
    const pointsThisLevel = LEVEL_SYSTEM.getSkillPointsForLevel(newLevel);
    skillPointsGained += pointsThisLevel;
  }
  
  const leveledUp = newLevel > currentLevel;
  
  // Don't add message here - let the caller handle it to avoid duplicates
  
  return {
    playerLevel: newLevel,
    playerXP: remainingXP,
    skillPoints: (gameState.skillPoints || 0) + skillPointsGained,
    leveledUp,
    skillPointsGained, // Return this so caller can create message if needed
    levelDiff: newLevel - currentLevel
  };
};

// Purchase or upgrade a skill
export const purchaseSkill = (gameState, skillId, addMessage) => {
  const skill = SKILLS[skillId];
  if (!skill) {
    addMessage('Invalid skill!');
    return gameState;
  }
  
  const currentSkills = gameState.purchasedSkills || {};
  const currentLevel = currentSkills[skillId] || 0;
  const nextLevel = currentLevel + 1;
  
  // Check if already maxed
  if (currentLevel >= skill.maxLevel) {
    addMessage(`${skill.name} is already at max level!`);
    return gameState;
  }
  
  // Calculate cost for next level
  const cost = skill.cost(nextLevel);
  
  // Check if can afford
  if ((gameState.skillPoints || 0) < cost) {
    addMessage(`Not enough skill points! Need ${cost}, have ${gameState.skillPoints || 0}`);
    return gameState;
  }
  
  // Check player level requirement
  if ((gameState.playerLevel || 1) < skill.minPlayerLevel) {
    addMessage(`Requires player level ${skill.minPlayerLevel}!`);
    return gameState;
  }
  
  // Check skill requirements
  if (skill.requires && skill.requires.length > 0) {
    for (const reqSkillId of skill.requires) {
      const reqLevel = currentSkills[reqSkillId] || 0;
      if (reqLevel === 0) {
        const reqSkill = SKILLS[reqSkillId];
        addMessage(`Requires ${reqSkill.name} first!`);
        return gameState;
      }
    }
  }
  
  // Purchase the skill
  const newSkills = { ...currentSkills, [skillId]: nextLevel };
  
  if (currentLevel === 0) {
    addMessage(`✨ Learned ${skill.name}!`);
  } else {
    addMessage(`⬆️ ${skill.name} upgraded to level ${nextLevel}!`);
  }
  
  // Special messages for ultimate skills
  if (skill.tier === 4 && currentLevel === 0) {
    addMessage(`🌟 ULTIMATE SKILL UNLOCKED: ${skill.name.toUpperCase()}!`);
  }
  
  return {
    ...gameState,
    purchasedSkills: newSkills,
    skillPoints: gameState.skillPoints - cost
  };
};

// Get all active skill effects combined
export const getActiveSkillEffects = (gameState) => {
  const purchasedSkills = gameState.purchasedSkills || {};
  const effects = {
    // Material/Portal effects
    materialSpawnRate: 0,
    rarityBonus: 0,
    portalDuration: 0,
    portalCooldownReduction: 0,
    capacityBonus: 0,
    conversionEnabled: false,
    conversionRate: 0,
    multiSpawnChance: 0,
    multiSpawnAmount: 0,
    allMaterialsBonus: 0,
    autoCollect: false,
    autoCollectRadius: 0,
    hoverRadius: 0,
    
    // Resource effects
    ppMultiplier: 0,
    ppPerSecond: 0,
    energyEfficiency: 0,
    maxEnergy: 0,
    
    // Time effects
    actionSpeedBonus: 0,
    restCooldownReduction: 0,
    echoChance: 0,
    storageMultiplier: 0,
    overCapEnabled: false,
    xpPerMinute: 0,
    
    // Mind effects
    meditationBonus: 0,
    sanityRegeneration: 0,
    sanityResistance: 0,
    minSanity: 0,
    xpMultiplier: 0,
    upgradeEfficiency: 0,
    
    // Special/Ultimate effects
    voidMastery: false,
    permanentPhase3: false,
    timeMastery: false,
    instantActions: false,
    doubleDay: false,
    enlightened: false,
    immuneToSanityLoss: false,
    mentalDominance: false
  };
  
  // Combine all skill effects
  Object.entries(purchasedSkills).forEach(([skillId, level]) => {
    const skill = SKILLS[skillId];
    if (!skill || level === 0) return;
    
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

// Get modified portal cooldown based on skills
export const getModifiedPortalCooldown = (baseCooldown, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  const reduction = effects.portalCooldownReduction || 0;
  const cooldown = Math.max(10, baseCooldown - reduction); // Minimum 10 seconds
  
  if (effects.timeMastery) {
    return Math.floor(cooldown * 0.5); // 50% faster with time mastery
  }
  
  return cooldown;
};

// Get modified capacity based on skills
export const getModifiedCapacity = (baseCapacity, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  const bonus = effects.capacityBonus || 0;
  const multiplier = 1 + (effects.storageMultiplier || 0);
  
  return Math.floor((baseCapacity + bonus) * multiplier);
};

// Apply material collection effects
export const applyCollectionEffects = (materialAmount, materialId, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  let finalAmount = materialAmount;
  
  // Multi-spawn chance
  if (effects.multiSpawnChance > 0 && Math.random() < effects.multiSpawnChance) {
    finalAmount += effects.multiSpawnAmount || 1;
  }
  
  // All materials bonus
  if (effects.allMaterialsBonus > 0) {
    finalAmount = Math.ceil(finalAmount * (1 + effects.allMaterialsBonus));
  }
  
  // Echo chance (repeat the action)
  if (effects.echoChance > 0 && Math.random() < effects.echoChance) {
    finalAmount *= 2;
  }
  
  return finalAmount;
};

// Alias for backwards compatibility
export const applySkillsToMaterialCollection = applyCollectionEffects;

// Calculate modified sanity loss
export const getModifiedSanityLoss = (baseLoss, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  
  if (effects.immuneToSanityLoss) return 0;
  
  const resistance = effects.sanityResistance || 0;
  const modifiedLoss = baseLoss * (1 - resistance);
  
  return Math.max(0, modifiedLoss);
};

// Apply skill effects to energy costs
export const applyEnergyCostReduction = (baseCost, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  const efficiency = effects.energyEfficiency || 0;
  return Math.ceil(baseCost * (1 - efficiency));
};

// Apply skill effects to PP generation
export const applyPPMultiplier = (basePP, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  const multiplier = effects.ppMultiplier || 0;
  return Math.floor(basePP * (1 + multiplier));
};

// Apply skill effects to meditation
export const applyMeditationBonus = (baseSanity, gameState) => {
  const effects = getActiveSkillEffects(gameState);
  const bonus = effects.meditationBonus || 0;
  return Math.floor(baseSanity * (1 + bonus));
};

// Get passive effects that tick over time
export const getPassiveEffects = (gameState, deltaTime) => {
  const effects = getActiveSkillEffects(gameState);
  const updates = {};
  
  // Passive PP generation
  if (effects.ppPerSecond > 0) {
    updates.pp = (gameState.pp || 0) + (effects.ppPerSecond * (deltaTime / 1000));
  }
  
  // Passive XP generation
  if (effects.xpPerMinute > 0) {
    updates.xp = effects.xpPerMinute * (deltaTime / 60000);
  }
  
  // Sanity regeneration
  if (effects.sanityRegeneration > 0 && gameState.sanity < 100) {
    const regenAmount = effects.sanityRegeneration * (deltaTime / 1000);
    updates.sanity = Math.min(100, gameState.sanity + regenAmount);
  }
  
  return updates;
};