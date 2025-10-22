/**
 * Equipment System Constants
 *
 * Defines weapons, armor, and anomalies (relics) for the armory system:
 * - WEAPON_RARITY: Rarity tiers with glow colors
 * - WEAPONS: All available weapons with ASCII art, stats, and lore
 * - ARMOR: Defensive equipment
 * - ANOMALIES: Strange relics with unique effects
 */

// Rarity system
export const RARITY = {
  common: {
    id: 'common',
    name: 'Common',
    color: '#888888',
    glowIntensity: 0.2,
    textColor: '#cccccc'
  },
  uncommon: {
    id: 'uncommon',
    name: 'Uncommon',
    color: '#4CAF50',
    glowIntensity: 0.4,
    textColor: '#66ff66'
  },
  rare: {
    id: 'rare',
    name: 'Rare',
    color: '#2196F3',
    glowIntensity: 0.6,
    textColor: '#66b3ff'
  },
  epic: {
    id: 'epic',
    name: 'Epic',
    color: '#9C27B0',
    glowIntensity: 0.8,
    textColor: '#d966ff'
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary',
    color: '#FF9800',
    glowIntensity: 1.0,
    textColor: '#ffcc66'
  },
  mythic: {
    id: 'mythic',
    name: 'Mythic',
    color: '#ff0000',
    glowIntensity: 1.2,
    textColor: '#ff6666'
  }
};

// Weapons
export const WEAPONS = {
  // Starting weapon
  stapler_shiv: {
    id: 'stapler_shiv',
    name: 'Stapler Shiv',
    rarity: RARITY.common,
    ascii: `  ┌─┐
  │▓│
  └─┘
   ║`,
    damage: 8,
    critChance: 0.05,
    critMultiplier: 1.5,
    unlockCondition: null, // Always available
    dimensionalUpgrade: null,
    lore: 'Improvised from office supplies. Sharp enough to cause existential dread.'
  },

  // Dimensional weapons
  shard_blade: {
    id: 'shard_blade',
    name: 'Glitch Shard Blade',
    rarity: RARITY.rare,
    ascii: `    ◢
   ◢█◣
  ◢███◣
 ◢█████◣
◢███████◣
   ║║║`,
    damage: 18,
    critChance: 0.15,
    critMultiplier: 2.0,
    unlockCondition: null,
    dimensionalUpgrade: 'shard_weapon',
    lore: 'Forged from reality\'s broken edges. It cuts through both matter and meaning.'
  },

  void_cleaver: {
    id: 'void_cleaver',
    name: 'Void Cleaver',
    rarity: RARITY.epic,
    ascii: `╔═══╗
║▓▓▓║
║▓█▓║
║▓▓▓║
╚═╦═╝
  ║
  ║`,
    damage: 25,
    critChance: 0.12,
    critMultiplier: 2.5,
    unlockCondition: null,
    dimensionalUpgrade: 'void_cleaver_craft',
    lore: 'Carved from pure absence. Where it strikes, things cease to have been.'
  },

  temporal_edge: {
    id: 'temporal_edge',
    name: 'Temporal Edge',
    rarity: RARITY.legendary,
    ascii: `   ⟨━⟩
  ⟨━━━⟩
 ⟨━━━━━⟩
⟨━━━━━━━⟩
    ║
    ║`,
    damage: 22,
    critChance: 0.25,
    critMultiplier: 2.0,
    unlockCondition: null,
    dimensionalUpgrade: 'temporal_blade_craft',
    lore: 'Each strike exists in multiple timelines. Your enemies are defeated before you swing.'
  },

  reality_render: {
    id: 'reality_render',
    name: 'Reality Render',
    rarity: RARITY.mythic,
    ascii: `  ╔═══╗
  ║ ⊗ ║
╔═╬═══╬═╗
║▓▓▓▓▓▓▓║
╚═╬═══╬═╝
  ║   ║
  ║   ║`,
    damage: 35,
    critChance: 0.20,
    critMultiplier: 3.0,
    unlockCondition: null,
    dimensionalUpgrade: 'reality_weapon_craft',
    lore: 'The office\'s final secret. It doesn\'t destroy enemies - it removes them from the narrative.'
  }
};

// Armor
export const ARMOR = {
  // Head
  standard_headset: {
    id: 'standard_headset',
    name: 'Standard Headset',
    rarity: RARITY.common,
    slot: 'head',
    ascii: `┌─┐ ┌─┐
│ ╰─╯ │
└─────┘`,
    defense: 2,
    specialEffect: null,
    unlockCondition: null,
    dimensionalUpgrade: null,
    lore: 'Noise-cancelling. Blocks out the screaming.'
  },

  void_visor: {
    id: 'void_visor',
    name: 'Void Visor',
    rarity: RARITY.rare,
    slot: 'head',
    ascii: `╔═════╗
║█▓▓▓█║
╚══╦══╝
   ║`,
    defense: 5,
    specialEffect: 'sanity_resist',
    unlockCondition: null,
    dimensionalUpgrade: 'void_visor_craft',
    lore: 'See through the veil. The truth is worse than you imagined.'
  },

  // Chest
  dress_shirt: {
    id: 'dress_shirt',
    name: 'Dress Shirt',
    rarity: RARITY.common,
    slot: 'chest',
    ascii: `┌─┬─┐
│ │ │
├─┼─┤
│ │ │
└─┴─┘`,
    defense: 3,
    specialEffect: null,
    unlockCondition: null,
    dimensionalUpgrade: null,
    lore: 'Business casual. The uniform of corporate servitude.'
  },

  crystalline_suit: {
    id: 'crystalline_suit',
    name: 'Crystalline Suit',
    rarity: RARITY.epic,
    slot: 'chest',
    ascii: `╔═◊═╗
║◊█◊║
╠═◊═╣
║◊◊◊║
╚═══╝`,
    defense: 10,
    specialEffect: 'damage_reflect',
    unlockCondition: null,
    dimensionalUpgrade: 'crystal_armor_craft',
    lore: 'Woven from static crystals. Reality bends around you.'
  },

  // Accessory
  id_badge: {
    id: 'id_badge',
    name: 'Employee ID Badge',
    rarity: RARITY.common,
    slot: 'accessory',
    ascii: `┌───┐
│███│
│   │
└───┘`,
    defense: 0,
    specialEffect: 'pp_bonus',
    unlockCondition: null,
    dimensionalUpgrade: null,
    lore: 'Your identity. Or someone\'s. The photo doesn\'t look like you.'
  },

  temporal_watch: {
    id: 'temporal_watch',
    name: 'Temporal Watch',
    rarity: RARITY.legendary,
    slot: 'accessory',
    ascii: `╔═══╗
║⌚⚙║
╚═══╝`,
    defense: 2,
    specialEffect: 'time_bonus',
    unlockCondition: null,
    dimensionalUpgrade: 'temporal_accessory_craft',
    lore: 'Time moves differently when you wear it. Hours feel like minutes. Days like seconds.'
  }
};

// Anomalies (Relics) - Passive bonus items
export const ANOMALIES = {
  coffee_stain: {
    id: 'coffee_stain',
    name: 'Eternal Coffee Stain',
    rarity: RARITY.uncommon,
    ascii: `  ╭─╮
  │░│
  ╰─╯
 ░░░░`,
    effect: 'energy_regen',
    effectValue: 0.1,
    unlockCondition: null,
    dimensionalUpgrade: null,
    lore: 'From your first day. It\'s never dried. It pulses with forgotten caffeine.'
  },

  forgotten_memo: {
    id: 'forgotten_memo',
    name: 'Forgotten Memo',
    rarity: RARITY.rare,
    ascii: `┌─────┐
│█████│
│░░░░░│
│░░░░░│
└─────┘`,
    effect: 'xp_boost',
    effectValue: 0.15,
    unlockCondition: null,
    dimensionalUpgrade: 'forgotten_memo_find',
    lore: 'You can\'t read it. The text shifts every time you look. But you learn from it anyway.'
  },

  glitched_keycard: {
    id: 'glitched_keycard',
    name: 'G̷l̷i̷t̷c̷h̷e̷d̷ Keycard',
    rarity: RARITY.epic,
    ascii: `┌─▓─┐
│▓█▓│
│█▓█│
└─▓─┘`,
    effect: 'crit_chance',
    effectValue: 0.10,
    unlockCondition: null,
    dimensionalUpgrade: 'glitched_keycard_find',
    lore: 'Opens doors that don\'t exist. Closes doors that do. Reality is negotiable.'
  },

  void_fragment_shard: {
    id: 'void_fragment_shard',
    name: 'Void Fragment Shard',
    rarity: RARITY.legendary,
    ascii: `   ◢
  ◢▓◣
 ◢▓█▓◣
◢▓███▓◣`,
    effect: 'damage_boost',
    effectValue: 0.20,
    unlockCondition: null,
    dimensionalUpgrade: 'void_shard_collect',
    lore: 'A piece of pure nothing. It weighs impossibly heavy. It makes you stronger.'
  },

  singularity_core: {
    id: 'singularity_core',
    name: 'Singularity Core Fragment',
    rarity: RARITY.mythic,
    ascii: `  ⊗
 ⊗█⊗
⊗███⊗
 ⊗█⊗
  ⊗`,
    effect: 'all_stats',
    effectValue: 0.25,
    unlockCondition: null,
    dimensionalUpgrade: 'singularity_core_extract',
    lore: 'The office\'s heart. It consumes everything. Somehow, you hold it. It holds you back.'
  }
};

/**
 * Get equipment by ID
 */
export const getWeapon = (id) => WEAPONS[id];
export const getArmor = (id) => ARMOR[id];
export const getAnomaly = (id) => ANOMALIES[id];

/**
 * Get all equipment of a type
 */
export const getAllWeapons = () => Object.values(WEAPONS);
export const getAllArmor = () => Object.values(ARMOR);
export const getAllAnomalies = () => Object.values(ANOMALIES);

/**
 * Check if equipment is unlocked based on game state
 */
export const isEquipmentUnlocked = (equipment, gameState) => {
  // Always unlocked items
  if (!equipment.unlockCondition && !equipment.dimensionalUpgrade) {
    return true;
  }

  // Check dimensional upgrade requirement
  if (equipment.dimensionalUpgrade) {
    return gameState.dimensionalUpgrades?.[equipment.dimensionalUpgrade] || false;
  }

  // Custom unlock conditions
  if (equipment.unlockCondition) {
    return equipment.unlockCondition(gameState);
  }

  return false;
};

/**
 * Calculate total player stats from equipped items
 */
export const calculateEquipmentStats = (gameState) => {
  const stats = {
    damage: 0,
    defense: 0,
    critChance: 0,
    critMultiplier: 1.0,
    ppBonus: 0,
    xpBonus: 0,
    energyRegen: 0,
    sanityResist: 0,
    damageReflect: 0
  };

  // Weapon stats
  if (gameState.equippedWeapon) {
    const weapon = WEAPONS[gameState.equippedWeapon];
    if (weapon) {
      stats.damage += weapon.damage;
      stats.critChance += weapon.critChance;
      stats.critMultiplier = Math.max(stats.critMultiplier, weapon.critMultiplier);
    }
  }

  // Armor stats
  ['head', 'chest', 'accessory'].forEach(slot => {
    const armorId = gameState.equippedArmor?.[slot];
    if (armorId) {
      const armor = ARMOR[armorId];
      if (armor) {
        stats.defense += armor.defense;

        // Special effects
        if (armor.specialEffect === 'sanity_resist') stats.sanityResist += 0.25;
        if (armor.specialEffect === 'damage_reflect') stats.damageReflect += 0.15;
        if (armor.specialEffect === 'pp_bonus') stats.ppBonus += 0.10;
        if (armor.specialEffect === 'time_bonus') stats.xpBonus += 0.20;
      }
    }
  });

  // Anomaly stats (can equip up to 3)
  if (gameState.equippedAnomalies) {
    gameState.equippedAnomalies.forEach(anomalyId => {
      const anomaly = ANOMALIES[anomalyId];
      if (anomaly) {
        switch (anomaly.effect) {
          case 'energy_regen':
            stats.energyRegen += anomaly.effectValue;
            break;
          case 'xp_boost':
            stats.xpBonus += anomaly.effectValue;
            break;
          case 'crit_chance':
            stats.critChance += anomaly.effectValue;
            break;
          case 'damage_boost':
            stats.ppBonus += anomaly.effectValue;
            break;
          case 'all_stats':
            stats.ppBonus += anomaly.effectValue;
            stats.xpBonus += anomaly.effectValue;
            stats.critChance += anomaly.effectValue * 0.5;
            break;
        }
      }
    });
  }

  return stats;
};
