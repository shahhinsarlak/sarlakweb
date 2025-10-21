/**
 * Combat System Constants
 *
 * Defines the turn-based combat system:
 * - ENEMY_ARCHETYPES: Base enemy types with different combat styles
 * - ENEMY_PREFIXES: Modifiers that scale enemy stats
 * - WEAPONS: Player weapons and their stats
 * - Combat mechanics and balance
 */

// Enemy base archetypes - different combat patterns
export const ENEMY_ARCHETYPES = {
  paper_pusher: {
    id: 'paper_pusher',
    name: 'Paper Pusher',
    type: 'swift',
    ascii: `┌─────┐
│ ○ ○ │
│  ─  │
│ └┬┘ │
└─────┘`,
    baseHP: 40,
    baseDamage: 8,
    attackSpeed: 1.5, // Attacks more frequently
    desc: 'Quick and relentless with paperwork',
    flavorText: [
      'shuffles papers menacingly',
      'staples with murderous intent',
      'files aggressively'
    ]
  },
  middle_manager: {
    id: 'middle_manager',
    name: 'Middle Manager',
    type: 'balanced',
    ascii: `╔═══╗
║● ●║
║ △ ║
║___║
╚═══╝`,
    baseHP: 60,
    baseDamage: 12,
    attackSpeed: 1.0, // Normal speed
    desc: 'Balanced in all aspects, corporate to the core',
    flavorText: [
      'schedules a meeting about your defeat',
      'uses corporate synergy',
      'leverages stakeholder engagement'
    ]
  },
  senior_analyst: {
    id: 'senior_analyst',
    name: 'Senior Analyst',
    type: 'glass_cannon',
    ascii: `┏━━━┓
┃⊙ ⊙┃
┃ ▬ ┃
┃╰─╯┃
┗━━━┛`,
    baseHP: 35,
    baseDamage: 20,
    attackSpeed: 0.9,
    desc: 'Fragile but devastatingly analytical',
    flavorText: [
      'critiques your methodology',
      'applies critical thinking',
      'analyzes your weaknesses'
    ]
  },
  hr_representative: {
    id: 'hr_representative',
    name: 'HR Representative',
    type: 'tank',
    ascii: `╭───╮
┃◉  ◉┃
┃  ▽ ┃
┃ ─── ┃
╰───╯`,
    baseHP: 100,
    baseDamage: 6,
    attackSpeed: 0.5, // Very slow
    desc: 'Armored in bureaucracy, hard to defeat',
    flavorText: [
      'files a complaint against you',
      'enforces company policy',
      'schedules mandatory training'
    ]
  },
  security_guard: {
    id: 'security_guard',
    name: 'Security Guard',
    type: 'brute',
    ascii: `∩＿＿∩
（ ＼  ／＼
｜  ●  ● ｜
｜   ▼   ｜
＼  ∧  ／
￣～～～￣`,
    baseHP: 80,
    baseDamage: 18,
    attackSpeed: 0.6,
    desc: 'Slow but incredibly powerful',
    flavorText: [
      'checks your ID badge violently',
      'enforces security protocol',
      'escorts you out forcefully'
    ]
  },
  glitched_colleague: {
    id: 'glitched_colleague',
    name: 'G̷l̷i̷t̷c̷h̷e̷d̷ Colleague',
    type: 'unstable',
    ascii: `?̴?̷?̸?̴?̷
?̸ ̷█̴ ̸█̷ ̴?̸
?̷ ̴ ̸ ̷ ̴ ̸?̷
?̸ ̷ ̴ ̸ ̷ ̴?̸
?̴?̷?̸?̴?̷`,
    baseHP: 50,
    baseDamage: 14,
    attackSpeed: 1.0,
    desc: 'Reality fails around them. Unpredictable.',
    flavorText: [
      'ẃ̷̨̢̛͎̹̹̹̹͎h̷̹̹i̴s̷̬p̷̹e̴r̷̹s̷̬ ̷̹i̴n̷̹ ̷̹s̷̬t̷̹a̴t̷̹i̴c̷̬',
      'phases through reality',
      'exists and doesn\'t exist simultaneously'
    ]
  }
};

// Enemy prefixes - modify base stats
export const ENEMY_PREFIXES = {
  none: {
    id: 'none',
    name: '',
    hpMultiplier: 1.0,
    damageMultiplier: 1.0,
    xpMultiplier: 1.0,
    color: 'var(--text-color)',
    rarity: 0.60 // 60% chance for no prefix
  },
  weak: {
    id: 'weak',
    name: 'Weak',
    hpMultiplier: 0.6,
    damageMultiplier: 0.7,
    xpMultiplier: 0.7,
    color: '#888888',
    rarity: 0.20 // 20% chance
  },
  badass: {
    id: 'badass',
    name: 'Badass',
    hpMultiplier: 1.5,
    damageMultiplier: 1.3,
    xpMultiplier: 1.5,
    color: '#ff9900',
    rarity: 0.12 // 12% chance
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    hpMultiplier: 2.0,
    damageMultiplier: 1.5,
    xpMultiplier: 2.0,
    color: '#9966ff',
    rarity: 0.06 // 6% chance
  },
  supreme: {
    id: 'supreme',
    name: 'Supreme',
    hpMultiplier: 3.0,
    damageMultiplier: 2.0,
    xpMultiplier: 3.0,
    color: '#ff0000',
    rarity: 0.015 // 1.5% chance
  },
  glitched: {
    id: 'glitched',
    name: 'G̷l̷i̷t̷c̷h̷e̷d̷',
    hpMultiplier: null, // Random 0.5-2.5x
    damageMultiplier: null, // Random 0.5-2.5x
    xpMultiplier: 2.5,
    color: '#00ffff',
    rarity: 0.005 // 0.5% chance (very rare)
  }
};

// Player weapons - from dimensional upgrades
export const WEAPONS = {
  shard_blade: {
    id: 'shard_blade',
    name: 'Shard Blade',
    baseDamage: 15,
    critChance: 0.15, // 15% crit chance
    critMultiplier: 2.0,
    desc: 'Forged from glitch shards',
    upgradeId: 'shard_weapon' // Matches dimensional upgrade
  }
};

// Combat rewards
export const COMBAT_REWARDS = {
  baseXP: 30,
  basePP: 100,
  // Multiplied by enemy prefix multiplier and level scaling
};

// Combat mechanics
export const COMBAT_MECHANICS = {
  playerBaseHP: 100,
  turnDelay: 800, // ms between turns
  criticalHitMultiplier: 2.0,
  escapeChance: 0.5, // 50% base escape chance
  escapeFailureDamage: 0.2 // 20% of max HP if escape fails
};

/**
 * Generate a random enemy with archetype and prefix
 * @param {number} playerLevel - Used for scaling
 * @returns {Object} Generated enemy with stats
 */
export const generateEnemy = (playerLevel = 1) => {
  // Select random archetype
  const archetypeKeys = Object.keys(ENEMY_ARCHETYPES);
  const archetypeId = archetypeKeys[Math.floor(Math.random() * archetypeKeys.length)];
  const archetype = ENEMY_ARCHETYPES[archetypeId];

  // Select prefix based on rarity
  const prefixRoll = Math.random();
  let cumulativeChance = 0;
  let selectedPrefix = ENEMY_PREFIXES.none;

  for (const prefix of Object.values(ENEMY_PREFIXES)) {
    cumulativeChance += prefix.rarity;
    if (prefixRoll <= cumulativeChance) {
      selectedPrefix = prefix;
      break;
    }
  }

  // Calculate stats with aggressive level scaling
  // Scale more dramatically: 25% increase per level for better difficulty progression
  const levelScaling = 1 + ((playerLevel - 1) * 0.25);

  let hpMultiplier = selectedPrefix.hpMultiplier;
  let damageMultiplier = selectedPrefix.damageMultiplier;

  // Handle glitched prefix (random multipliers)
  if (selectedPrefix.id === 'glitched') {
    hpMultiplier = 0.5 + Math.random() * 2.0; // 0.5x to 2.5x
    damageMultiplier = 0.5 + Math.random() * 2.0;
  }

  const maxHP = Math.floor(archetype.baseHP * hpMultiplier * levelScaling);
  const damage = Math.floor(archetype.baseDamage * damageMultiplier * levelScaling);

  // Generate rewards
  const xpReward = Math.floor(COMBAT_REWARDS.baseXP * selectedPrefix.xpMultiplier * levelScaling);
  const ppReward = Math.floor(COMBAT_REWARDS.basePP * selectedPrefix.xpMultiplier * levelScaling);

  return {
    archetype: archetype,
    prefix: selectedPrefix,
    displayName: selectedPrefix.name ? `${selectedPrefix.name} ${archetype.name}` : archetype.name,
    maxHP: maxHP,
    currentHP: maxHP,
    damage: damage,
    attackSpeed: archetype.attackSpeed,
    xpReward: xpReward,
    ppReward: ppReward,
    level: playerLevel
  };
};

/**
 * Calculate player combat stats based on game state
 * @param {Object} gameState - Current game state
 * @returns {Object} Player combat stats
 */
export const getPlayerCombatStats = (gameState) => {
  // Get equipped weapon (fallback to stapler_shiv if none equipped)
  const weaponId = gameState.equippedWeapon || 'stapler_shiv';
  const weapon = WEAPONS[weaponId] || WEAPONS.stapler_shiv;

  // Base stats from weapon
  let maxHP = COMBAT_MECHANICS.playerBaseHP;
  let damage = weapon.baseDamage;
  let critChance = weapon.critChance;
  let critMultiplier = weapon.critMultiplier;

  // Equipment bonuses would be calculated here from equipmentConstants.js
  // For now, using weapon stats only

  return {
    maxHP: maxHP,
    currentHP: gameState.playerCombatHP || maxHP,
    damage: damage,
    critChance: critChance,
    critMultiplier: critMultiplier,
    weapon: weapon
  };
};
