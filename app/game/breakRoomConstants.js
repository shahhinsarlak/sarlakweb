/**
 * Break Room System Constants
 *
 * Defines:
 * - COLLEAGUE_SCHEDULE: Scheduled colleague appearances by day of week
 * - BREAK_ROOM_SEARCHABLES: Objects that can be searched in the break room
 * - BREAK_ROOM_LOOT_TABLES: Context-aware loot generation
 * - MAX_TRUST_REWARDS: Permanent buffs unlocked at max colleague trust
 */

// Day of week schedule for colleague appearances
export const COLLEAGUE_SCHEDULE = {
  /**
   * Get scheduled colleague for a given day
   * @param {number} day - Game day number
   * @returns {string|null} Colleague ID or null
   */
  getScheduledColleague: (day) => {
    const dayOfWeek = day % 7;

    // Every 7 days: convergence event (all colleagues)
    if (day % 7 === 0 && day > 0) {
      return 'multiple';
    }

    // Weekend: empty but eerie
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return null;
    }

    // Monday-Friday schedule
    const weeklySchedule = {
      1: 'productivity_zealot',  // Monday
      2: 'void_clerk',           // Tuesday
      3: 'spiral_philosopher',   // Wednesday
      4: 'temporal_trapped',     // Thursday
      5: 'light_herald'          // Friday
    };

    return weeklySchedule[dayOfWeek] || null;
  },

  /**
   * Get all colleagues scheduled for today (for convergence events)
   * @param {number} day - Game day number
   * @returns {string[]} Array of colleague IDs
   */
  getAllScheduledColleagues: (day) => {
    if (day % 7 === 0 && day > 0) {
      return [
        'productivity_zealot',
        'void_clerk',
        'spiral_philosopher',
        'temporal_trapped',
        'light_herald'
      ];
    }
    const colleague = COLLEAGUE_SCHEDULE.getScheduledColleague(day);
    return colleague ? [colleague] : [];
  }
};

// Searchable objects in the break room
export const BREAK_ROOM_SEARCHABLES = {
  coffee_machine: {
    id: 'coffee_machine',
    name: 'Coffee Machine',
    description: 'An industrial coffee maker. The pot is always half-full. Or half-empty.',
    energyCost: 3,
    baseCooldown: 30, // seconds
    unlocked: true
  },
  fridge: {
    id: 'fridge',
    name: 'Refrigerator',
    description: 'Contains lunches. Some have names. Some have been here for months.',
    energyCost: 5,
    baseCooldown: 60,
    unlocked: true
  },
  vending_machine: {
    id: 'vending_machine',
    name: 'Vending Machine',
    description: 'Humming softly. Row B is slightly... off. The snacks inside watch you.',
    energyCost: 8,
    baseCooldown: 90,
    unlocked: true
  },
  bulletin_board: {
    id: 'bulletin_board',
    name: 'Bulletin Board',
    description: 'Cork board covered in notices. Safety memos. Missing person posters. Schedules.',
    energyCost: 5,
    baseCooldown: 120,
    unlocked: true
  },
  tables_chairs: {
    id: 'tables_chairs',
    name: 'Tables & Chairs',
    description: 'Scattered furniture. Items left behind. Forgotten things. Personal effects.',
    energyCost: 10,
    baseCooldown: 180,
    unlocked: true
  },
  supply_closet: {
    id: 'supply_closet',
    name: 'Supply Closet',
    description: 'The door was always locked. Until it wasn\'t. What changed?',
    energyCost: 15,
    baseCooldown: 300,
    unlocked: false // Unlocks at Day 10
  }
};

/**
 * Loot table categories and items
 * Context-aware generation based on sanity, day, mystery progress, etc.
 */
export const LOOT_CATEGORIES = {
  // Small rewards (common)
  MINOR_REWARDS: {
    weight: 40,
    items: [
      { type: 'pp', min: 100, max: 300, desc: 'Some loose staples and paper clips' },
      { type: 'pp', min: 200, max: 500, desc: 'A forgotten performance bonus voucher' },
      { type: 'paper', min: 5, max: 15, desc: 'Blank memo paper' },
      { type: 'paper', min: 10, max: 25, desc: 'Unused forms' }
    ]
  },

  // Energy restoration items
  ENERGY_ITEMS: {
    weight: 25,
    items: [
      { type: 'energy', amount: 10, desc: 'Lukewarm coffee. It helps.' },
      { type: 'energy', amount: 15, desc: 'Energy drink from vending machine' },
      { type: 'energy', amount: 20, desc: 'Someone\'s forgotten lunch (still good?)' },
      { type: 'energy', amount: 25, desc: 'Experimental corporate energy supplement' }
    ]
  },

  // Temporary buffs
  BUFFS: {
    weight: 15,
    items: [
      {
        type: 'buff',
        buffId: 'coffee_rush',
        name: 'Coffee Rush',
        ppMult: 1.15,
        duration: 180, // 3 minutes
        desc: 'Fresh coffee. You feel focused. For now.'
      },
      {
        type: 'buff',
        buffId: 'sugar_high',
        name: 'Sugar High',
        ppMult: 1.25,
        duration: 120, // 2 minutes
        desc: 'Candy bar from the vending machine. The crash will come later.'
      },
      {
        type: 'buff',
        buffId: 'break_room_clarity',
        name: 'Brief Clarity',
        ppMult: 1.20,
        duration: 240, // 4 minutes
        desc: 'Stepping away from your desk helps. The patterns become clearer.'
      }
    ]
  },

  // Clues and investigation items
  CLUES: {
    weight: 15,
    items: [
      {
        type: 'clue',
        id: 'coffee_stain_pattern',
        source: 'Break Room',
        text: 'The coffee stains on the counter form a pattern. A spiral. Always a spiral.',
        category: 'environmental'
      },
      {
        type: 'clue',
        id: 'old_memo',
        source: 'Break Room',
        text: 'An old HR memo: "Employees experiencing temporal displacement should report to Management immediately."',
        category: 'documents'
      },
      {
        type: 'clue',
        id: 'vending_machine_code',
        source: 'Break Room',
        text: 'Someone scratched numbers into the vending machine: "B7 B7 B7". Row B7 doesn\'t exist.',
        category: 'environmental'
      },
      {
        type: 'clue',
        id: 'missing_colleague_photo',
        source: 'Break Room',
        text: 'A photo on the bulletin board shows the office party. You recognize everyone. Including yourself. But you don\'t remember this party.',
        category: 'personal'
      },
      {
        type: 'clue',
        id: 'schedule_anomaly',
        source: 'Break Room',
        text: 'The break room schedule lists colleagues for each day. But there are 8 days in the week.',
        category: 'documents'
      },
      {
        type: 'clue',
        id: 'fridge_note',
        source: 'Break Room',
        text: 'A sticky note on someone\'s lunch: "If you\'re reading this, I\'ve already left. Don\'t eat the yogurt."',
        category: 'personal'
      },
      {
        type: 'clue',
        id: 'supply_closet_key',
        source: 'Break Room',
        text: 'The supply closet was locked for years. Now it opens freely. No one unlocked it. It just... decided to open.',
        category: 'environmental'
      }
    ]
  },

  // Trust-building items (to gift colleagues)
  TRUST_ITEMS: {
    weight: 10,
    items: [
      { type: 'trustItem', colleagueId: 'productivity_zealot', item: 'efficiency_report', desc: 'A perfectly formatted efficiency report' },
      { type: 'trustItem', colleagueId: 'void_clerk', item: 'void_touched_pen', desc: 'A pen that writes in darkness' },
      { type: 'trustItem', colleagueId: 'spiral_philosopher', item: 'coffee_spiral', desc: 'Coffee that spirals counterclockwise' },
      { type: 'trustItem', colleagueId: 'temporal_trapped', item: 'old_calendar', desc: 'A calendar from next year' },
      { type: 'trustItem', colleagueId: 'light_herald', item: 'fluorescent_bulb', desc: 'A bulb that never flickers' }
    ]
  },

  // Special items (rare, high sanity cost)
  SPECIAL: {
    weight: 5,
    items: [
      {
        type: 'special',
        id: 'reality_anchor',
        name: 'Reality Anchor',
        effect: 'sanity',
        value: 15,
        desc: 'A small object that feels... solid. Real. It grounds you.'
      },
      {
        type: 'special',
        id: 'time_fragment',
        name: 'Temporal Fragment',
        effect: 'xp',
        value: 100,
        desc: 'A moment crystallized. Experience without living it.'
      },
      {
        type: 'special',
        id: 'void_document',
        name: 'Void-Touched Document',
        effect: 'mystery',
        value: 5,
        desc: 'The words shift and change. But the meaning is clear. Too clear.'
      }
    ]
  }
};

/**
 * Generate loot based on context
 * @param {Object} gameState - Current game state
 * @param {string} objectId - Which object was searched
 * @returns {Object} Loot item with type, value, description
 */
export const generateBreakRoomLoot = (gameState, objectId) => {
  const { sanity, day, mysteryProgress, breakRoomSupplyClosetUnlocked } = gameState;
  const dayOfWeek = day % 7;

  // Context modifiers
  const modifiers = {
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    isConvergenceDay: day % 7 === 0 && day > 0,
    lowSanity: sanity < 40,
    criticalSanity: sanity < 10,
    highMystery: mysteryProgress > 50,
    supplyClosetJustUnlocked: objectId === 'supply_closet' && !breakRoomSupplyClosetUnlocked
  };

  // Calculate weights based on context
  let weights = { ...LOOT_CATEGORIES };

  // Low sanity increases clue chance
  if (modifiers.lowSanity) {
    weights.CLUES.weight += 15;
    weights.MINOR_REWARDS.weight -= 10;
  }

  // Critical sanity guarantees special items
  if (modifiers.criticalSanity) {
    weights.SPECIAL.weight += 20;
    weights.MINOR_REWARDS.weight -= 15;
  }

  // Supply closet has better loot
  if (objectId === 'supply_closet') {
    weights.SPECIAL.weight += 15;
    weights.TRUST_ITEMS.weight += 10;
    weights.CLUES.weight += 10;
  }

  // Bulletin board favors clues and trust items
  if (objectId === 'bulletin_board') {
    weights.CLUES.weight += 20;
    weights.TRUST_ITEMS.weight += 10;

    // Special: finding the schedule
    if (!gameState.colleagueScheduleKnown && Math.random() < 0.6) {
      return {
        type: 'schedule',
        desc: 'A schedule posted on the bulletin board. It lists which colleagues visit the break room each day.',
        mysteryProgress: 3
      };
    }
  }

  // Coffee machine favors energy and buffs
  if (objectId === 'coffee_machine') {
    weights.ENERGY_ITEMS.weight += 15;
    weights.BUFFS.weight += 10;
  }

  // Vending machine favors energy and buffs
  if (objectId === 'vending_machine') {
    weights.ENERGY_ITEMS.weight += 10;
    weights.BUFFS.weight += 15;
  }

  // Tables/chairs favors trust items and clues
  if (objectId === 'tables_chairs') {
    weights.TRUST_ITEMS.weight += 15;
    weights.CLUES.weight += 10;
  }

  // Convergence days increase special item chance
  if (modifiers.isConvergenceDay) {
    weights.SPECIAL.weight += 10;
    weights.CLUES.weight += 10;
  }

  // Select category based on weighted random
  const totalWeight = Object.values(weights).reduce((sum, cat) => sum + cat.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedCategory = null;

  for (const [catName, catData] of Object.entries(weights)) {
    random -= catData.weight;
    if (random <= 0) {
      selectedCategory = LOOT_CATEGORIES[catName];
      break;
    }
  }

  // Select random item from category
  const items = selectedCategory.items;
  const item = items[Math.floor(Math.random() * items.length)];

  // Generate final loot object
  if (item.type === 'pp') {
    const amount = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
    return {
      type: 'pp',
      amount,
      desc: item.desc
    };
  } else if (item.type === 'paper') {
    const amount = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
    return {
      type: 'paper',
      amount,
      desc: item.desc
    };
  } else if (item.type === 'energy') {
    return {
      type: 'energy',
      amount: item.amount,
      desc: item.desc
    };
  } else if (item.type === 'buff') {
    return {
      type: 'buff',
      buffId: item.buffId,
      name: item.name,
      ppMult: item.ppMult,
      duration: item.duration,
      desc: item.desc
    };
  } else if (item.type === 'clue') {
    return {
      type: 'clue',
      clue: {
        id: item.id,
        source: item.source,
        text: item.text,
        category: item.category
      },
      desc: `You found a clue: ${item.text}`,
      mysteryProgress: modifiers.lowSanity ? 3 : 2
    };
  } else if (item.type === 'trustItem') {
    return {
      type: 'trustItem',
      colleagueId: item.colleagueId,
      item: item.item,
      desc: item.desc,
      trustGain: 2
    };
  } else if (item.type === 'special') {
    return {
      type: 'special',
      id: item.id,
      name: item.name,
      effect: item.effect,
      value: item.value,
      desc: item.desc
    };
  }

  // Fallback
  return {
    type: 'pp',
    amount: 100,
    desc: 'Nothing interesting. Just the usual break room detritus.'
  };
};

/**
 * Max trust rewards - permanent buffs unlocked when colleague trust reaches maximum
 */
export const MAX_TRUST_REWARDS = {
  productivity_zealot: {
    trust: 10, // Required trust level
    unlocked: false,
    name: 'Zealot\'s Efficiency',
    desc: '+25% PP generation. "Productivity is enlightenment."',
    effect: {
      ppMultiplier: 0.25
    }
  },
  void_clerk: {
    trust: 10,
    unlocked: false,
    name: 'Void Resonance',
    desc: 'Documents cost -20% paper. "The void provides."',
    effect: {
      paperCostReduction: 0.20
    }
  },
  spiral_philosopher: {
    trust: 10,
    unlocked: false,
    name: 'Spiral Understanding',
    desc: 'Sanity drains 30% slower. "Patterns within patterns."',
    effect: {
      sanityDrainReduction: 0.30
    }
  },
  temporal_trapped: {
    trust: 10,
    unlocked: false,
    name: 'Temporal Gift',
    desc: 'Can rewind time twice per day. "Time is negotiable."',
    effect: {
      timeRewindsPerDay: 2
    }
  },
  light_herald: {
    trust: 10,
    unlocked: false,
    name: 'Herald\'s Blessing',
    desc: '+15% XP gains. "The light shows the way forward."',
    effect: {
      xpMultiplier: 0.15
    }
  }
};

/**
 * Check if player has unlocked a max trust reward
 * @param {Object} gameState - Current game state
 * @param {string} colleagueId - Colleague ID
 * @returns {boolean}
 */
export const hasMaxTrustReward = (gameState, colleagueId) => {
  if (!gameState.colleagueMaxTrustRewards) return false;
  return gameState.colleagueMaxTrustRewards[colleagueId] === true;
};

/**
 * Get all active max trust effects
 * @param {Object} gameState - Current game state
 * @returns {Object} Combined effects
 */
export const getMaxTrustEffects = (gameState) => {
  const effects = {
    ppMultiplier: 0,
    paperCostReduction: 0,
    sanityDrainReduction: 0,
    timeRewindsPerDay: 0,
    xpMultiplier: 0
  };

  if (!gameState.colleagueMaxTrustRewards) return effects;

  Object.entries(gameState.colleagueMaxTrustRewards).forEach(([colleagueId, unlocked]) => {
    if (unlocked && MAX_TRUST_REWARDS[colleagueId]) {
      const reward = MAX_TRUST_REWARDS[colleagueId];
      Object.entries(reward.effect).forEach(([key, value]) => {
        effects[key] += value;
      });
    }
  });

  return effects;
};
