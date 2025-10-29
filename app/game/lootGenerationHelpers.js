/**
 * Loot Generation Helpers
 *
 * Functions for generating randomized loot items:
 * - generateLootItem: Creates a complete item with rarity, prefix, and imbuements
 * - calculateFinalStats: Computes final item stats from base + modifiers
 * - rollRarity: Determines item rarity based on drop rates
 * - rollPrefix: Selects a random prefix based on weights
 * - rollImbuements: Generates random void imbuements
 */

import { RARITY } from './equipmentConstants';
import {
  LOOT_PREFIXES,
  VOID_IMBUEMENTS,
  LOOT_DROP_RATES,
  IMBUEMENT_COUNTS,
  BASE_LOOT_ITEMS
} from './lootConstants';

/**
 * Roll for item rarity based on drop rates
 * @returns {Object} Rarity object from RARITY
 */
export const rollRarity = () => {
  const roll = Math.random();
  let cumulative = 0;

  // Check from rarest to most common
  const rarityOrder = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

  for (const rarityId of rarityOrder) {
    cumulative += LOOT_DROP_RATES[rarityId];
    if (roll <= cumulative) {
      return RARITY[rarityId];
    }
  }

  // Fallback to common
  return RARITY.common;
};

/**
 * Roll for a random prefix based on weights
 * @returns {Object|null} Prefix object or null if no prefix
 */
export const rollPrefix = () => {
  const prefixes = Object.values(LOOT_PREFIXES);
  const totalWeight = prefixes.reduce((sum, prefix) => sum + prefix.weight, 0);

  let roll = Math.random() * totalWeight;

  for (const prefix of prefixes) {
    roll -= prefix.weight;
    if (roll <= 0) {
      return prefix.id === 'none' ? null : prefix;
    }
  }

  return null;
};

/**
 * Roll for random void imbuements
 * @param {Object} rarity - Rarity object
 * @returns {Array} Array of imbuement objects
 */
export const rollImbuements = (rarity) => {
  const counts = IMBUEMENT_COUNTS[rarity.id];
  const imbuementCount = Math.floor(
    Math.random() * (counts.max - counts.min + 1)
  ) + counts.min;

  if (imbuementCount === 0) return [];

  const availableImbuements = Object.values(VOID_IMBUEMENTS);
  const selected = [];

  // Select unique random imbuements
  const shuffled = [...availableImbuements].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(imbuementCount, shuffled.length); i++) {
    selected.push(shuffled[i]);
  }

  return selected;
};

/**
 * Get a random base item by type
 * @param {string} type - 'weapon', 'armor', or 'anomaly'
 * @returns {Object} Base item object
 */
export const getRandomBaseItem = (type) => {
  let items = [];

  if (type === 'weapon') {
    items = BASE_LOOT_ITEMS.weapons;
  } else if (type === 'armor') {
    items = BASE_LOOT_ITEMS.armor;
  } else if (type === 'anomaly') {
    items = BASE_LOOT_ITEMS.anomalies;
  }

  if (items.length === 0) return null;

  return items[Math.floor(Math.random() * items.length)];
};

/**
 * Get random loot type (weapon, armor, or anomaly)
 * @returns {string} Loot type
 */
export const getRandomLootType = () => {
  const types = ['weapon', 'armor', 'anomaly'];
  const weights = [0.45, 0.35, 0.20]; // 45% weapon, 35% armor, 20% anomaly

  const roll = Math.random();
  let cumulative = 0;

  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i];
    if (roll <= cumulative) {
      return types[i];
    }
  }

  return 'weapon'; // Fallback
};

/**
 * Calculate rarity multiplier for stats
 * @param {Object} rarity - Rarity object
 * @returns {number} Multiplier for base stats
 */
export const getRarityMultiplier = (rarity) => {
  const multipliers = {
    common: 1.0,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2.0,
    legendary: 2.8,
    mythic: 4.0
  };

  return multipliers[rarity.id] || 1.0;
};

/**
 * Calculate final item stats from base + rarity + prefix + imbuements
 * @param {Object} baseItem - Base item object
 * @param {Object} rarity - Rarity object
 * @param {Object|null} prefix - Prefix object or null
 * @param {Array} imbuements - Array of imbuement objects
 * @param {number} levelScaling - Level scaling multiplier (default 1.0)
 * @returns {Object} Final calculated stats
 */
export const calculateFinalStats = (baseItem, rarity, prefix, imbuements, levelScaling = 1.0) => {
  const rarityMultiplier = getRarityMultiplier(rarity);

  const stats = {
    // Base stats multiplied by level scaling and rarity
    damage: Math.floor((baseItem.baseDamage || 0) * levelScaling * rarityMultiplier),
    defense: Math.floor((baseItem.baseDefense || 0) * levelScaling * rarityMultiplier),
    critChance: (baseItem.baseCritChance || 0),
    critMultiplier: (baseItem.baseCritMultiplier || 1.0),

    // Bonus stats
    ppBonus: baseItem.basePPBonus || 0,
    xpBonus: baseItem.baseXPBonus || 0,
    energyRegen: baseItem.baseEnergyRegen || 0,
    sanityRegen: 0,
    sanityResist: baseItem.baseSanityResist || 0,
    damageReflect: baseItem.baseDamageReflect || 0,
    damageBonus: baseItem.baseDamageBonus || 0,
    cooldownReduction: 0,
    allStatsBonus: baseItem.baseAllStats || 0,

    // Special effects from imbuements
    lifesteal: 0,
    dotDamage: 0,
    stunChance: 0,
    explosiveChance: 0,
    explosiveDamage: 0,
    capacityBonus: 0,
    portalCooldownReduction: 0,
    lootRarityBonus: 0,
    damageAbsorption: 0
  };

  // Apply prefix bonuses
  if (prefix) {
    if (prefix.damageBonus) {
      stats.damage = Math.floor(stats.damage * (1 + prefix.damageBonus));
      stats.damageBonus += prefix.damageBonus;
    }
    if (prefix.defenseBonus) {
      stats.defense = Math.floor(stats.defense * (1 + prefix.defenseBonus));
    }
    if (prefix.critChanceBonus) {
      stats.critChance += prefix.critChanceBonus;
    }
    if (prefix.critMultiplierBonus) {
      stats.critMultiplier += prefix.critMultiplierBonus;
    }
    if (prefix.cooldownReduction) {
      stats.cooldownReduction += prefix.cooldownReduction;
    }
    if (prefix.damageReflect) {
      stats.damageReflect += prefix.damageReflect;
    }
    if (prefix.sanityDrainIncrease) {
      stats.sanityDrainIncrease = prefix.sanityDrainIncrease;
    }
    if (prefix.voidAffinityBonus) {
      stats.voidAffinityBonus = prefix.voidAffinityBonus;
    }
    if (prefix.xpBonus) {
      stats.xpBonus += prefix.xpBonus;
    }
  }

  // Apply imbuement effects
  imbuements.forEach(imbuement => {
    switch (imbuement.effectType) {
      case 'lifesteal':
        stats.lifesteal += imbuement.effectValue;
        break;
      case 'dot':
        stats.dotDamage += imbuement.effectValue;
        break;
      case 'stun_chance':
        stats.stunChance += imbuement.effectValue;
        break;
      case 'explosive':
        stats.explosiveChance = imbuement.effectChance;
        stats.explosiveDamage = imbuement.effectValue;
        break;
      case 'energy_regen':
        stats.energyRegen += imbuement.effectValue;
        break;
      case 'sanity_regen':
        stats.sanityRegen += imbuement.effectValue;
        break;
      case 'pp_bonus':
        stats.ppBonus += imbuement.effectValue;
        break;
      case 'xp_bonus':
        stats.xpBonus += imbuement.effectValue;
        break;
      case 'loot_rarity':
        stats.lootRarityBonus += imbuement.effectValue;
        break;
      case 'capacity_bonus':
        stats.capacityBonus += imbuement.effectValue;
        break;
      case 'portal_cooldown':
        stats.portalCooldownReduction += imbuement.effectValue;
        break;
      case 'all_stats':
        stats.allStatsBonus += imbuement.effectValue;
        break;
      case 'damage_absorption':
        stats.damageAbsorption += imbuement.effectValue;
        break;
      case 'eternal':
        stats.xpBonus += imbuement.xpBonus;
        stats.allStatsBonus += imbuement.allStatsBonus;
        break;
    }
  });

  return stats;
};

/**
 * Generate a complete randomized loot item
 * @param {string|null} forceType - Optional: force a specific type ('weapon', 'armor', 'anomaly')
 * @param {number} playerLevel - Player's current level (default 1)
 * @returns {Object} Complete loot item with all properties
 */
export const generateLootItem = (forceType = null, playerLevel = 1) => {
  // Determine item type
  const type = forceType || getRandomLootType();

  // Get random base item
  const baseItem = getRandomBaseItem(type);
  if (!baseItem) return null;

  // Roll rarity
  const rarity = rollRarity();

  // Roll prefix
  const prefix = rollPrefix();

  // Roll imbuements based on rarity
  const imbuements = rollImbuements(rarity);

  // Calculate level scaling (25% increase per level, same as enemies)
  const levelScaling = 1 + ((playerLevel - 1) * 0.25);

  // Calculate final stats with level scaling
  const finalStats = calculateFinalStats(baseItem, rarity, prefix, imbuements, levelScaling);

  // Generate unique item ID
  const itemId = `${baseItem.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Build display name
  let displayName = baseItem.name;
  if (prefix && prefix.name) {
    displayName = `${prefix.name} ${displayName}`;
  }

  return {
    id: itemId,
    baseItemId: baseItem.id,
    type: baseItem.type,
    slot: baseItem.slot, // For armor
    displayName,
    baseName: baseItem.name,
    rarity,
    prefix,
    imbuements,
    finalStats,
    ascii: baseItem.ascii,
    lore: baseItem.lore,
    isEquipped: false,
    generatedAt: Date.now(),
    itemLevel: playerLevel,
    levelScaling: levelScaling
  };
};

/**
 * Format imbuements for display
 * @param {Array} imbuements - Array of imbuement objects
 * @returns {string} Formatted string
 */
export const formatImbuements = (imbuements) => {
  if (!imbuements || imbuements.length === 0) return 'None';
  return imbuements.map(imb => `${imb.name}: ${imb.desc}`).join(' | ');
};

/**
 * Get item display color based on rarity
 * @param {Object} rarity - Rarity object
 * @returns {string} Color hex code
 */
export const getItemDisplayColor = (rarity) => {
  return rarity.textColor;
};

/**
 * Get item glow intensity based on rarity
 * @param {Object} rarity - Rarity object
 * @returns {number} Glow intensity multiplier
 */
export const getItemGlowIntensity = (rarity) => {
  return rarity.glowIntensity;
};

/**
 * Compare two items for sorting (by rarity, then by stats)
 * @param {Object} itemA - First item
 * @param {Object} itemB - Second item
 * @returns {number} Comparison result
 */
export const compareItems = (itemA, itemB) => {
  const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const rarityIndexA = rarityOrder.indexOf(itemA.rarity.id);
  const rarityIndexB = rarityOrder.indexOf(itemB.rarity.id);

  if (rarityIndexA !== rarityIndexB) {
    return rarityIndexB - rarityIndexA; // Higher rarity first
  }

  // If same rarity, compare by total stats
  const totalStatsA = (itemA.finalStats.damage || 0) + (itemA.finalStats.defense || 0);
  const totalStatsB = (itemB.finalStats.damage || 0) + (itemB.finalStats.defense || 0);

  return totalStatsB - totalStatsA;
};
