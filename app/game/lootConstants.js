/**
 * Loot Generation Constants
 *
 * Defines the Borderlands-style loot system:
 * - LOOT_PREFIXES: Modifiers that enhance base stats
 * - VOID_IMBUEMENTS: Random enchantments for items
 * - LOOT_DROP_RATES: Rarity chances for drops
 * - BASE_LOOT_ITEMS: Core items that can drop with random stats
 */

import { RARITY } from './equipmentConstants';

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

// Base loot items (core items that can spawn)
export const BASE_LOOT_ITEMS = {
  // Weapons
  weapons: [
    {
      id: 'stapler_shiv',
      name: 'Stapler Shiv',
      type: 'weapon',
      baseDamage: 8,
      baseCritChance: 0.05,
      baseCritMultiplier: 1.5,
      ascii: `  ┌─┐
  │▓│
  └─┘
   ║`,
      lore: 'Improvised from office supplies. Sharp enough to cause existential dread.'
    },
    {
      id: 'shard_blade',
      name: 'Glitch Shard Blade',
      type: 'weapon',
      baseDamage: 15,
      baseCritChance: 0.12,
      baseCritMultiplier: 1.8,
      ascii: `    ◢
   ◢█◣
  ◢███◣
 ◢█████◣
◢███████◣
   ║║║`,
      lore: 'Forged from reality\'s broken edges.'
    },
    {
      id: 'void_cleaver',
      name: 'Void Cleaver',
      type: 'weapon',
      baseDamage: 22,
      baseCritChance: 0.10,
      baseCritMultiplier: 2.0,
      ascii: `╔═══╗
║▓▓▓║
║▓█▓║
║▓▓▓║
╚═╦═╝
  ║
  ║`,
      lore: 'Carved from pure absence. Where it strikes, things cease to have been.'
    },
    {
      id: 'temporal_edge',
      name: 'Temporal Edge',
      type: 'weapon',
      baseDamage: 18,
      baseCritChance: 0.20,
      baseCritMultiplier: 1.9,
      ascii: `   ⟨━⟩
  ⟨━━━⟩
 ⟨━━━━━⟩
⟨━━━━━━━⟩
    ║
    ║`,
      lore: 'Each strike exists in multiple timelines.'
    },
    {
      id: 'reality_render',
      name: 'Reality Render',
      type: 'weapon',
      baseDamage: 30,
      baseCritChance: 0.15,
      baseCritMultiplier: 2.5,
      ascii: `  ╔═══╗
  ║ ⊗ ║
╔═╬═══╬═╗
║▓▓▓▓▓▓▓║
╚═╬═══╬═╝
  ║   ║
  ║   ║`,
      lore: 'The office\'s final secret. It doesn\'t destroy enemies - it removes them from the narrative.'
    }
  ],

  // Armor
  armor: [
    {
      id: 'standard_headset',
      name: 'Standard Headset',
      type: 'armor',
      slot: 'head',
      baseDefense: 2,
      ascii: `┌─┐ ┌─┐
│ ╰─╯ │
└─────┘`,
      lore: 'Noise-cancelling. Blocks out the screaming.'
    },
    {
      id: 'void_visor',
      name: 'Void Visor',
      type: 'armor',
      slot: 'head',
      baseDefense: 5,
      baseSanityResist: 0.15,
      ascii: `╔═════╗
║█▓▓▓█║
╚══╦══╝
   ║`,
      lore: 'See through the veil. The truth is worse than you imagined.'
    },
    {
      id: 'dress_shirt',
      name: 'Dress Shirt',
      type: 'armor',
      slot: 'chest',
      baseDefense: 3,
      ascii: `┌─┬─┐
│ │ │
├─┼─┤
│ │ │
└─┴─┘`,
      lore: 'Business casual. The uniform of corporate servitude.'
    },
    {
      id: 'crystalline_suit',
      name: 'Crystalline Suit',
      type: 'armor',
      slot: 'chest',
      baseDefense: 10,
      baseDamageReflect: 0.10,
      ascii: `╔═◊═╗
║◊█◊║
╠═◊═╣
║◊◊◊║
╚═══╝`,
      lore: 'Woven from static crystals. Reality bends around you.'
    },
    {
      id: 'id_badge',
      name: 'Employee ID Badge',
      type: 'armor',
      slot: 'accessory',
      baseDefense: 0,
      basePPBonus: 0.10,
      ascii: `┌───┐
│███│
│   │
└───┘`,
      lore: 'Your identity. Or someone\'s. The photo doesn\'t look like you.'
    },
    {
      id: 'temporal_watch',
      name: 'Temporal Watch',
      type: 'armor',
      slot: 'accessory',
      baseDefense: 2,
      baseXPBonus: 0.15,
      ascii: `╔═══╗
║⌚⚙║
╚═══╝`,
      lore: 'Time moves differently when you wear it.'
    }
  ],

  // Anomalies
  anomalies: [
    {
      id: 'coffee_stain',
      name: 'Eternal Coffee Stain',
      type: 'anomaly',
      baseEnergyRegen: 0.1,
      ascii: `  ╭─╮
  │░│
  ╰─╯
 ░░░░`,
      lore: 'From your first day. It\'s never dried.'
    },
    {
      id: 'forgotten_memo',
      name: 'Forgotten Memo',
      type: 'anomaly',
      baseXPBonus: 0.12,
      ascii: `┌─────┐
│█████│
│░░░░░│
│░░░░░│
└─────┘`,
      lore: 'You can\'t read it. The text shifts every time you look.'
    },
    {
      id: 'glitched_keycard',
      name: 'G̷l̷i̷t̷c̷h̷e̷d̷ Keycard',
      type: 'anomaly',
      baseCritChance: 0.08,
      ascii: `┌─▓─┐
│▓█▓│
│█▓█│
└─▓─┘`,
      lore: 'Opens doors that don\'t exist. Closes doors that do.'
    },
    {
      id: 'void_fragment_shard',
      name: 'Void Fragment Shard',
      type: 'anomaly',
      baseDamageBonus: 0.15,
      ascii: `   ◢
  ◢▓◣
 ◢▓█▓◣
◢▓███▓◣`,
      lore: 'A piece of pure nothing. It weighs impossibly heavy.'
    },
    {
      id: 'singularity_core',
      name: 'Singularity Core Fragment',
      type: 'anomaly',
      baseAllStats: 0.20,
      ascii: `  ⊗
 ⊗█⊗
⊗███⊗
 ⊗█⊗
  ⊗`,
      lore: 'The office\'s heart. It consumes everything.'
    }
  ]
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
