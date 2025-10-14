// Revamped Skill Tree System

export const SKILL_TREES = {
  REALITY: 'reality',
  VOID: 'void',
  TIME: 'time',
  MIND: 'mind'
};

export const TREE_INFO = {
  reality: {
    name: 'Reality Manipulation',
    color: '#4a90e2',
    description: 'Bend the fabric of existence to your will'
  },
  void: {
    name: 'Void Mastery',
    color: '#9b59b6',
    description: 'Harness the power of the endless abyss'
  },
  time: {
    name: 'Temporal Control',
    color: '#e74c3c',
    description: 'Command the flow of time itself'
  },
  mind: {
    name: 'Psychic Dominance',
    color: '#2ecc71',
    description: 'Master your consciousness and sanity'
  }
};

export const SKILLS = {
  // ===== REALITY TREE =====
  reality_sense: {
    id: 'reality_sense',
    name: 'Reality Sense',
    tree: 'reality',
    description: 'Perceive glitches in reality. Increase dimensional material spawn rate.',
    tier: 1,
    maxLevel: 5,
    minPlayerLevel: 1,
    requires: [],
    cost: (level) => level * 2,
    effect: (level) => ({
      materialSpawnRate: 0.15 * level,
      rarityBonus: 0.05 * level
    })
  },
  
  dimensional_anchor: {
    id: 'dimensional_anchor',
    name: 'Dimensional Anchor',
    tree: 'reality',
    description: 'Stabilize portals. Increase portal duration and capacity.',
    tier: 2,
    maxLevel: 5,
    minPlayerLevel: 5,
    requires: ['reality_sense'],
    cost: (level) => 2 + (level * 3),
    effect: (level) => ({
      portalDuration: 10 * level,
      capacityBonus: 15 * level
    })
  },
  
  matter_transmutation: {
    id: 'matter_transmutation',
    name: 'Matter Transmutation',
    tree: 'reality',
    description: 'Convert lower materials into higher ones. Unlock material conversion.',
    tier: 2,
    maxLevel: 3,
    minPlayerLevel: 8,
    requires: ['reality_sense'],
    cost: (level) => 3 + (level * 4),
    effect: (level) => ({
      conversionEnabled: true,
      conversionRate: 0.2 + (0.1 * level)
    })
  },
  
  reality_fracture: {
    id: 'reality_fracture',
    name: 'Reality Fracture',
    tree: 'reality',
    description: 'Chance to spawn multiple materials from a single node.',
    tier: 3,
    maxLevel: 5,
    minPlayerLevel: 12,
    requires: ['dimensional_anchor', 'matter_transmutation'],
    cost: (level) => 4 + (level * 5),
    effect: (level) => ({
      multiSpawnChance: 0.10 * level,
      multiSpawnAmount: 1 + Math.floor(level / 2)
    })
  },
  
  existential_mastery: {
    id: 'existential_mastery',
    name: 'Existential Mastery',
    tree: 'reality',
    description: 'Ultimate power over reality. Massively boost all dimensional activities.',
    tier: 4,
    maxLevel: 1,
    minPlayerLevel: 20,
    requires: ['reality_fracture'],
    cost: () => 20,
    effect: () => ({
      allMaterialsBonus: 0.50,
      portalCooldownReduction: 30,
      autoCollectRadius: 100
    })
  },

  // ===== VOID TREE =====
  void_touched: {
    id: 'void_touched',
    name: 'Void Touched',
    tree: 'void',
    description: 'Embrace the void. Reduce portal cooldown.',
    tier: 1,
    maxLevel: 5,
    minPlayerLevel: 1,
    requires: [],
    cost: (level) => level * 2,
    effect: (level) => ({
      portalCooldownReduction: 8 * level
    })
  },
  
  shadow_step: {
    id: 'shadow_step',
    name: 'Shadow Step',
    tree: 'void',
    description: 'Move through shadows. Reduce energy cost of all actions.',
    tier: 2,
    maxLevel: 5,
    minPlayerLevel: 5,
    requires: ['void_touched'],
    cost: (level) => 2 + (level * 3),
    effect: (level) => ({
      energyEfficiency: 0.12 * level
    })
  },
  
  void_contract: {
    id: 'void_contract',
    name: 'Void Contract',
    tree: 'void',
    description: 'Trade sanity for power. Lose sanity slower, gain PP faster.',
    tier: 2,
    maxLevel: 5,
    minPlayerLevel: 8,
    requires: ['void_touched'],
    cost: (level) => 3 + (level * 4),
    effect: (level) => ({
      sanityResistance: 0.15 * level,
      ppMultiplier: 0.20 * level
    })
  },
  
  abyssal_grasp: {
    id: 'abyssal_grasp',
    name: 'Abyssal Grasp',
    tree: 'void',
    description: 'Pull materials to you. Enable auto-collection with extended range.',
    tier: 3,
    maxLevel: 5,
    minPlayerLevel: 12,
    requires: ['shadow_step', 'void_contract'],
    cost: (level) => 4 + (level * 5),
    effect: (level) => ({
      autoCollect: true,
      hoverRadius: 40 + (level * 25)
    })
  },
  
  null_singularity: {
    id: 'null_singularity',
    name: 'Null Singularity',
    tree: 'void',
    description: 'Become one with the void. Transcendent void powers.',
    tier: 4,
    maxLevel: 1,
    minPlayerLevel: 20,
    requires: ['abyssal_grasp'],
    cost: () => 20,
    effect: () => ({
      voidMastery: true,
      ppPerSecond: 10,
      permanentPhase3: true
    })
  },

  // ===== TIME TREE =====
  chrono_awareness: {
    id: 'chrono_awareness',
    name: 'Chrono Awareness',
    tree: 'time',
    description: 'Perceive time differently. Increase action speed.',
    tier: 1,
    maxLevel: 5,
    minPlayerLevel: 1,
    requires: [],
    cost: (level) => level * 2,
    effect: (level) => ({
      actionSpeedBonus: 0.10 * level,
      restCooldownReduction: 5 * level
    })
  },
  
  temporal_echo: {
    id: 'temporal_echo',
    name: 'Temporal Echo',
    tree: 'time',
    description: 'Actions have a chance to repeat automatically.',
    tier: 2,
    maxLevel: 5,
    minPlayerLevel: 5,
    requires: ['chrono_awareness'],
    cost: (level) => 2 + (level * 3),
    effect: (level) => ({
      echoChance: 0.08 * level
    })
  },
  
  time_bank: {
    id: 'time_bank',
    name: 'Time Bank',
    tree: 'time',
    description: 'Store excess resources over cap. Increase all storage capacity.',
    tier: 2,
    maxLevel: 5,
    minPlayerLevel: 8,
    requires: ['chrono_awareness'],
    cost: (level) => 3 + (level * 4),
    effect: (level) => ({
      storageMultiplier: 0.25 * level,
      overCapEnabled: level >= 3
    })
  },
  
  accelerated_existence: {
    id: 'accelerated_existence',
    name: 'Accelerated Existence',
    tree: 'time',
    description: 'Live faster. Gain passive PP and XP over time.',
    tier: 3,
    maxLevel: 5,
    minPlayerLevel: 12,
    requires: ['temporal_echo', 'time_bank'],
    cost: (level) => 4 + (level * 5),
    effect: (level) => ({
      ppPerSecond: 2 * level,
      xpPerMinute: 5 * level
    })
  },
  
  temporal_sovereign: {
    id: 'temporal_sovereign',
    name: 'Temporal Sovereign',
    tree: 'time',
    description: 'Master of time. Ultimate temporal manipulation powers.',
    tier: 4,
    maxLevel: 1,
    minPlayerLevel: 20,
    requires: ['accelerated_existence'],
    cost: () => 20,
    effect: () => ({
      timeMastery: true,
      instantActions: true,
      doubleDay: true
    })
  },

  // ===== MIND TREE =====
  mental_clarity: {
    id: 'mental_clarity',
    name: 'Mental Clarity',
    tree: 'mind',
    description: 'Clear your thoughts. Improve meditation effectiveness.',
    tier: 1,
    maxLevel: 5,
    minPlayerLevel: 1,
    requires: [],
    cost: (level) => level * 2,
    effect: (level) => ({
      meditationBonus: 0.25 * level,
      sanityRegeneration: 0.05 * level
    })
  },
  
  psychic_shield: {
    id: 'psychic_shield',
    name: 'Psychic Shield',
    tree: 'mind',
    description: 'Protect your mind. Reduce sanity loss from all sources.',
    tier: 2,
    maxLevel: 5,
    minPlayerLevel: 5,
    requires: ['mental_clarity'],
    cost: (level) => 2 + (level * 3),
    effect: (level) => ({
      sanityResistance: 0.20 * level,
      minSanity: 5 * level
    })
  },
  
  thought_acceleration: {
    id: 'thought_acceleration',
    name: 'Thought Acceleration',
    tree: 'mind',
    description: 'Think faster. Gain bonus XP from all sources.',
    tier: 2,
    maxLevel: 5,
    minPlayerLevel: 8,
    requires: ['mental_clarity'],
    cost: (level) => 3 + (level * 4),
    effect: (level) => ({
      xpMultiplier: 0.15 * level
    })
  },
  
  mind_over_matter: {
    id: 'mind_over_matter',
    name: 'Mind Over Matter',
    tree: 'mind',
    description: 'Mental strength manifests physically. Boost all upgrades.',
    tier: 3,
    maxLevel: 5,
    minPlayerLevel: 12,
    requires: ['psychic_shield', 'thought_acceleration'],
    cost: (level) => 4 + (level * 5),
    effect: (level) => ({
      upgradeEfficiency: 0.15 * level,
      maxEnergy: 20 * level
    })
  },
  
  transcendent_consciousness: {
    id: 'transcendent_consciousness',
    name: 'Transcendent Consciousness',
    tree: 'mind',
    description: 'Achieve enlightenment. Supreme mental powers.',
    tier: 4,
    maxLevel: 1,
    minPlayerLevel: 20,
    requires: ['mind_over_matter'],
    cost: () => 20,
    effect: () => ({
      enlightened: true,
      immuneToSanityLoss: true,
      mentalDominance: true
    })
  }
};

// Experience and leveling system
export const LEVEL_SYSTEM = {
  baseXP: 100,
  xpMultiplier: 1.4,
  maxLevel: 50,
  
  getXPForLevel: (level) => {
    return Math.floor(LEVEL_SYSTEM.baseXP * Math.pow(LEVEL_SYSTEM.xpMultiplier, level - 1));
  },
  
  getTotalXPForLevel: (level) => {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += LEVEL_SYSTEM.getXPForLevel(i);
    }
    return total;
  },
  
  getSkillPointsForLevel: (level) => {
    if (level % 10 === 0) return 5; // Bonus every 10 levels
    if (level % 5 === 0) return 3;  // Bonus every 5 levels
    return 2; // Base per level
  }
};

// XP rewards
export const XP_REWARDS = {
  sortPapers: 2,
  rest: 1,
  completeDebug: 25,
  completeMeditation: 15,
  collectMaterial: {
    void_fragment: 2,
    static_crystal: 4,
    glitch_shard: 6,
    reality_dust: 10,
    temporal_core: 20,
    dimensional_essence: 40,
    singularity_node: 100
  },
  defeatColleague: 50,
  purchaseUpgrade: 15,
  purchaseDimensionalUpgrade: 25,
  unlockLocation: 50,
  completeAchievement: 100,
  examineItem: 10
};

// Visual layout for skill tree (grid positions)
export const SKILL_TREE_LAYOUT = {
  reality: {
    reality_sense: { x: 2, y: 0 },
    dimensional_anchor: { x: 1, y: 1 },
    matter_transmutation: { x: 3, y: 1 },
    reality_fracture: { x: 2, y: 2 },
    existential_mastery: { x: 2, y: 3 }
  },
  void: {
    void_touched: { x: 2, y: 0 },
    shadow_step: { x: 1, y: 1 },
    void_contract: { x: 3, y: 1 },
    abyssal_grasp: { x: 2, y: 2 },
    null_singularity: { x: 2, y: 3 }
  },
  time: {
    chrono_awareness: { x: 2, y: 0 },
    temporal_echo: { x: 1, y: 1 },
    time_bank: { x: 3, y: 1 },
    accelerated_existence: { x: 2, y: 2 },
    temporal_sovereign: { x: 2, y: 3 }
  },
  mind: {
    mental_clarity: { x: 2, y: 0 },
    psychic_shield: { x: 1, y: 1 },
    thought_acceleration: { x: 3, y: 1 },
    mind_over_matter: { x: 2, y: 2 },
    transcendent_consciousness: { x: 2, y: 3 }
  }
};