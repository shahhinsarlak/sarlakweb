/**
 * Loot Generation Constants
 *
 * Defines the Borderlands-style loot system:
 * - LOOT_PREFIXES: Modifiers that enhance base stats
 * - VOID_IMBUEMENTS: Random enchantments for items
 * - LOOT_DROP_RATES: Rarity chances for drops
 * - BASE_LOOT_ITEMS: Core items that can drop with random stats
 */

import { RARITY, WEAPONS, ARMOR, ANOMALIES } from './equipmentConstants';

// Prefixes that modify item stats (% based)
export const LOOT_PREFIXES = {
  // Damage prefixes
  brutal: {
    id: 'brutal',
    name: 'Brutal',
    damageBonus: 0.25,
    weight: 10
  },
  savage: {
    id: 'savage',
    name: 'Savage',
    damageBonus: 0.35,
    weight: 5
  },
  devastating: {
    id: 'devastating',
    name: 'Devastating',
    damageBonus: 0.50,
    weight: 2
  },

  // Crit prefixes
  precise: {
    id: 'precise',
    name: 'Precise',
    critChanceBonus: 0.10,
    weight: 10
  },
  surgical: {
    id: 'surgical',
    name: 'Surgical',
    critChanceBonus: 0.15,
    critMultiplierBonus: 0.25,
    weight: 5
  },

  // Speed prefixes
  swift: {
    id: 'swift',
    name: 'Swift',
    cooldownReduction: 0.15,
    weight: 8
  },
  rapid: {
    id: 'rapid',
    name: 'Rapid',
    cooldownReduction: 0.25,
    weight: 4
  },

  // Defense prefixes
  fortified: {
    id: 'fortified',
    name: 'Fortified',
    defenseBonus: 0.30,
    weight: 10
  },
  reinforced: {
    id: 'reinforced',
    name: 'Reinforced',
    defenseBonus: 0.45,
    weight: 5
  },
  impenetrable: {
    id: 'impenetrable',
    name: 'Impenetrable',
    defenseBonus: 0.60,
    damageReflect: 0.10,
    weight: 2
  },

  // Hybrid prefixes (rare)
  unstable: {
    id: 'unstable',
    name: 'Unstable',
    damageBonus: 0.40,
    critChanceBonus: 0.15,
    defenseBonus: -0.20, // Negative defense!
    weight: 3
  },
  corrupted: {
    id: 'corrupted',
    name: 'Corrupted',
    damageBonus: 0.30,
    sanityDrainIncrease: 0.25,
    weight: 4
  },
  void_touched: {
    id: 'void_touched',
    name: 'Void-Touched',
    damageBonus: 0.20,
    defenseBonus: 0.20,
    voidAffinityBonus: 0.30,
    weight: 2
  },
  temporal: {
    id: 'temporal',
    name: 'Temporal',
    cooldownReduction: 0.30,
    xpBonus: 0.20,
    weight: 3
  },

  // No prefix option
  none: {
    id: 'none',
    name: null,
    weight: 15
  }
};

// Void Imbuements - Random enchantments on items
export const VOID_IMBUEMENTS = {
  // Combat imbuements
  vampiric: {
    id: 'vampiric',
    name: 'Vampiric',
    desc: 'Heals 3% of damage dealt',
    effectType: 'lifesteal',
    effectValue: 0.03,
    rarity: 'uncommon'
  },
  burning: {
    id: 'burning',
    name: 'Burning',
    desc: '+15% damage over time',
    effectType: 'dot',
    effectValue: 0.15,
    rarity: 'common'
  },
  freezing: {
    id: 'freezing',
    name: 'Freezing',
    desc: '10% chance to stun enemy',
    effectType: 'stun_chance',
    effectValue: 0.10,
    rarity: 'rare'
  },
  explosive: {
    id: 'explosive',
    name: 'Explosive',
    desc: '25% chance for +50% damage',
    effectType: 'explosive',
    effectValue: 0.50,
    effectChance: 0.25,
    rarity: 'rare'
  },

  // Resource imbuements
  energizing: {
    id: 'energizing',
    name: 'Energizing',
    desc: '+0.2 energy per second',
    effectType: 'energy_regen',
    effectValue: 0.2,
    rarity: 'uncommon'
  },
  focused: {
    id: 'focused',
    name: 'Focused',
    desc: '+0.1 sanity per second',
    effectType: 'sanity_regen',
    effectValue: 0.1,
    rarity: 'uncommon'
  },
  productive: {
    id: 'productive',
    name: 'Productive',
    desc: '+10% PP generation',
    effectType: 'pp_bonus',
    effectValue: 0.10,
    rarity: 'common'
  },

  // XP/Progression imbuements
  enlightening: {
    id: 'enlightening',
    name: 'Enlightening',
    desc: '+15% XP gain',
    effectType: 'xp_bonus',
    effectValue: 0.15,
    rarity: 'uncommon'
  },
  fortunate: {
    id: 'fortunate',
    name: 'Fortunate',
    desc: '+10% loot rarity',
    effectType: 'loot_rarity',
    effectValue: 0.10,
    rarity: 'rare'
  },

  // Dimensional imbuements
  void_infused: {
    id: 'void_infused',
    name: 'Void-Infused',
    desc: '+2 dimensional capacity',
    effectType: 'capacity_bonus',
    effectValue: 2,
    rarity: 'rare'
  },
  dimensional: {
    id: 'dimensional',
    name: 'Dimensional',
    desc: '-10% portal cooldown',
    effectType: 'portal_cooldown',
    effectValue: 0.10,
    rarity: 'uncommon'
  },

  // Unique/Legendary imbuements
  reality_bending: {
    id: 'reality_bending',
    name: 'Reality-Bending',
    desc: 'All stats +5%',
    effectType: 'all_stats',
    effectValue: 0.05,
    rarity: 'epic'
  },
  singularity: {
    id: 'singularity',
    name: 'Singularity',
    desc: 'Absorbs 20% of incoming damage',
    effectType: 'damage_absorption',
    effectValue: 0.20,
    rarity: 'legendary'
  },
  eternal: {
    id: 'eternal',
    name: 'Eternal',
    desc: '+30% XP and +15% all stats',
    effectType: 'eternal',
    xpBonus: 0.30,
    allStatsBonus: 0.15,
    rarity: 'mythic'
  }
};

// Loot drop rates by rarity
export const LOOT_DROP_RATES = {
  common: 0.50,      // 50%
  uncommon: 0.30,    // 30%
  rare: 0.15,        // 15%
  epic: 0.04,        // 4%
  legendary: 0.009,  // 0.9%
  mythic: 0.001      // 0.1%
};

// Imbuement counts by rarity
export const IMBUEMENT_COUNTS = {
  common: { min: 0, max: 1 },
  uncommon: { min: 1, max: 1 },
  rare: { min: 1, max: 2 },
  epic: { min: 2, max: 2 },
  legendary: { min: 2, max: 3 },
  mythic: { min: 3, max: 3 }
};

// Base loot items — derived from equipmentConstants to eliminate duplication.
// Each item is mapped to the shape expected by lootGenerationHelpers.js.
export const BASE_LOOT_ITEMS = {
  weapons: Object.values(WEAPONS).map(w => ({
    id: w.id,
    name: w.name,
    type: 'weapon',
    baseDamage: w.damage,
    baseCritChance: w.critChance,
    baseCritMultiplier: w.critMultiplier,
    ascii: w.ascii,
    lore: w.lore
  })),

  armor: Object.values(ARMOR).map(a => ({
    id: a.id,
    name: a.name,
    type: 'armor',
    slot: a.slot,
    baseDefense: a.defense,
    // Map special effects to flat bonus fields for loot generation
    baseSanityResist: a.specialEffect === 'sanity_resist' ? 0.15 : undefined,
    basePPBonus: a.specialEffect === 'pp_bonus' ? 0.10 : undefined,
    baseXPBonus: a.specialEffect === 'time_bonus' ? 0.15 : undefined,
    baseDamageReflect: a.specialEffect === 'damage_reflect' ? 0.10 : undefined,
    ascii: a.ascii,
    lore: a.lore
  })),

  anomalies: Object.values(ANOMALIES).map(an => ({
    id: an.id,
    name: an.name,
    type: 'anomaly',
    // Map anomaly effects to flat bonus fields
    baseEnergyRegen: an.effect === 'energy_regen' ? an.effectValue : undefined,
    baseXPBonus: an.effect === 'xp_boost' ? an.effectValue : undefined,
    baseCritChance: an.effect === 'crit_chance' ? an.effectValue : undefined,
    baseDamageBonus: an.effect === 'damage_boost' ? an.effectValue : undefined,
    baseAllStats: an.effect === 'all_stats' ? an.effectValue : undefined,
    ascii: an.ascii,
    lore: an.lore
  }))
};

// Tear spawn configuration
export const TEAR_CONFIG = {
  spawnChance: 0.08,  // 8% chance per portal entry
  glowColors: ['#ff00ff', '#00ffff', '#ff0066', '#9900ff', '#ffcc00'],
  pulseSpeed: 2000,    // ms per pulse cycle
  minSize: 20,
  maxSize: 40
};

/**
 * Get all base items of a specific type
 */
export const getBaseItemsByType = (type) => {
  switch (type) {
    case 'weapon':
      return BASE_LOOT_ITEMS.weapons;
    case 'armor':
      return BASE_LOOT_ITEMS.armor;
    case 'anomaly':
      return BASE_LOOT_ITEMS.anomalies;
    default:
      return [];
  }
};

/**
 * Get all base items
 */
export const getAllBaseItems = () => {
  return [
    ...BASE_LOOT_ITEMS.weapons,
    ...BASE_LOOT_ITEMS.armor,
    ...BASE_LOOT_ITEMS.anomalies
  ];
};
