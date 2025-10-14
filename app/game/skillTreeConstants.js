// Skill Tree System Constants

export const SKILL_TREES = {
    SPEED: 'speed',
    LUCK: 'luck',
    COMBAT: 'combat',
    EFFICIENCY: 'efficiency'
  };
  
  export const SKILLS = {
    // SPEED TREE
    quick_hands: {
      id: 'quick_hands',
      name: 'Quick Hands',
      tree: 'speed',
      description: 'Reduce portal cooldown by 10 seconds',
      maxLevel: 5,
      baseCost: 1,
      costMultiplier: 1.5,
      requirements: {},
      effect: (level) => ({ portalCooldownReduction: 10 * level })
    },
    hover_collector: {
      id: 'hover_collector',
      name: 'Hover Collector',
      tree: 'speed',
      description: 'Automatically collect materials within cursor radius',
      maxLevel: 3,
      baseCost: 3,
      costMultiplier: 2,
      requirements: { quick_hands: 2 },
      effect: (level) => ({ 
        hoverRadius: 50 + (level * 30),
        autoCollect: true 
      })
    },
    rapid_mining: {
      id: 'rapid_mining',
      name: 'Rapid Mining',
      tree: 'speed',
      description: 'Increase dimensional capacity by 10',
      maxLevel: 5,
      baseCost: 2,
      costMultiplier: 1.8,
      requirements: { quick_hands: 1 },
      effect: (level) => ({ capacityBonus: 10 * level })
    },
    time_dilation: {
      id: 'time_dilation',
      name: 'Time Dilation',
      tree: 'speed',
      description: 'Portal stays open 15 seconds longer',
      maxLevel: 3,
      baseCost: 4,
      costMultiplier: 2,
      requirements: { hover_collector: 1, rapid_mining: 3 },
      effect: (level) => ({ portalDuration: 15 * level })
    },
  
    // LUCK TREE
    fortune_seeker: {
      id: 'fortune_seeker',
      name: 'Fortune Seeker',
      tree: 'luck',
      description: 'Increase rare material spawn rate by 15%',
      maxLevel: 5,
      baseCost: 1,
      costMultiplier: 1.5,
      requirements: {},
      effect: (level) => ({ rarityBonus: 0.15 * level })
    },
    treasure_sense: {
      id: 'treasure_sense',
      name: 'Treasure Sense',
      tree: 'luck',
      description: 'Rare materials glow brighter and are easier to spot',
      maxLevel: 3,
      baseCost: 2,
      costMultiplier: 1.8,
      requirements: { fortune_seeker: 2 },
      effect: (level) => ({ 
        glowIntensity: 1 + (level * 0.5),
        highlightRares: true 
      })
    },
    double_yield: {
      id: 'double_yield',
      name: 'Double Yield',
      tree: 'luck',
      description: '10% chance per level to get double materials',
      maxLevel: 5,
      baseCost: 3,
      costMultiplier: 2,
      requirements: { fortune_seeker: 1 },
      effect: (level) => ({ doubleChance: 0.10 * level })
    },
    jackpot: {
      id: 'jackpot',
      name: 'Jackpot',
      tree: 'luck',
      description: 'Very rare chance to get 5x materials from a single node',
      maxLevel: 3,
      baseCost: 5,
      costMultiplier: 2.5,
      requirements: { treasure_sense: 2, double_yield: 3 },
      effect: (level) => ({ jackpotChance: 0.02 * level })
    },
  
    // COMBAT TREE
    void_strike: {
      id: 'void_strike',
      name: 'Void Strike',
      tree: 'combat',
      description: 'Basic attack damage increased by 5',
      maxLevel: 10,
      baseCost: 1,
      costMultiplier: 1.3,
      requirements: {},
      effect: (level) => ({ attackDamage: 5 * level })
    },
    mental_fortitude: {
      id: 'mental_fortitude',
      name: 'Mental Fortitude',
      tree: 'combat',
      description: 'Reduce sanity loss from colleagues by 20%',
      maxLevel: 5,
      baseCost: 2,
      costMultiplier: 1.6,
      requirements: { void_strike: 2 },
      effect: (level) => ({ sanityResistance: 0.20 * level })
    },
    reality_shield: {
      id: 'reality_shield',
      name: 'Reality Shield',
      tree: 'combat',
      description: 'Block incoming attacks, max health +10',
      maxLevel: 5,
      baseCost: 2,
      costMultiplier: 1.7,
      requirements: { void_strike: 1 },
      effect: (level) => ({ 
        blockChance: 0.05 * level,
        maxHealth: 10 * level 
      })
    },
    critical_insight: {
      id: 'critical_insight',
      name: 'Critical Insight',
      tree: 'combat',
      description: '5% chance per level for critical hits (2x damage)',
      maxLevel: 5,
      baseCost: 3,
      costMultiplier: 2,
      requirements: { mental_fortitude: 1, reality_shield: 2 },
      effect: (level) => ({ critChance: 0.05 * level })
    },
    existential_dread: {
      id: 'existential_dread',
      name: 'Existential Dread',
      tree: 'combat',
      description: 'Ultimate ability: Stun all colleagues for 3 seconds',
      maxLevel: 1,
      baseCost: 10,
      costMultiplier: 1,
      requirements: { critical_insight: 3, mental_fortitude: 3 },
      effect: (level) => ({ 
        hasUltimate: true,
        ultCooldown: 60,
        ultDuration: 3 
      })
    },
  
    // EFFICIENCY TREE
    resource_master: {
      id: 'resource_master',
      name: 'Resource Master',
      tree: 'efficiency',
      description: 'PP generation increased by 10%',
      maxLevel: 5,
      baseCost: 1,
      costMultiplier: 1.5,
      requirements: {},
      effect: (level) => ({ ppMultiplier: 0.10 * level })
    },
    energy_conservation: {
      id: 'energy_conservation',
      name: 'Energy Conservation',
      tree: 'efficiency',
      description: 'Actions cost 10% less energy',
      maxLevel: 5,
      baseCost: 2,
      costMultiplier: 1.6,
      requirements: { resource_master: 2 },
      effect: (level) => ({ energyEfficiency: 0.10 * level })
    },
    meditation_expert: {
      id: 'meditation_expert',
      name: 'Meditation Expert',
      tree: 'efficiency',
      description: 'Meditation restores 20% more sanity',
      maxLevel: 3,
      baseCost: 2,
      costMultiplier: 1.8,
      requirements: { resource_master: 1 },
      effect: (level) => ({ meditationBonus: 0.20 * level })
    },
    synergy: {
      id: 'synergy',
      name: 'Synergy',
      tree: 'efficiency',
      description: 'All dimensional upgrades 10% more effective',
      maxLevel: 5,
      baseCost: 4,
      costMultiplier: 2,
      requirements: { energy_conservation: 2, meditation_expert: 2 },
      effect: (level) => ({ upgradeEfficiency: 0.10 * level })
    }
  };
  
  // Experience system
  export const LEVEL_SYSTEM = {
    baseXP: 100,
    xpMultiplier: 1.5,
    maxLevel: 50,
    
    // Calculate XP needed for next level
    getXPForLevel: (level) => {
      return Math.floor(LEVEL_SYSTEM.baseXP * Math.pow(LEVEL_SYSTEM.xpMultiplier, level - 1));
    },
    
    // Calculate total XP needed to reach a level
    getTotalXPForLevel: (level) => {
      let total = 0;
      for (let i = 1; i < level; i++) {
        total += LEVEL_SYSTEM.getXPForLevel(i);
      }
      return total;
    },
    
    // Get skill points awarded per level
    getSkillPointsPerLevel: (level) => {
      if (level % 10 === 0) return 3; // Bonus points every 10 levels
      return 1;
    }
  };
  
  // XP rewards for different actions
  export const XP_REWARDS = {
    sortPapers: 1,
    completeDebug: 15,
    collectMaterial: {
      void_fragment: 1,
      static_crystal: 2,
      glitch_shard: 3,
      reality_dust: 5,
      temporal_core: 10,
      dimensional_essence: 20,
      singularity_node: 50
    },
    defeatColleague: 25,
    purchaseUpgrade: 10,
    purchaseDimensionalUpgrade: 15,
    unlockLocation: 30,
    completeAchievement: 50
  };
  
  // Skill tree visual layout (positions for UI)
  export const SKILL_TREE_LAYOUT = {
    speed: {
      quick_hands: { x: 2, y: 0 },
      hover_collector: { x: 1, y: 1 },
      rapid_mining: { x: 3, y: 1 },
      time_dilation: { x: 2, y: 2 }
    },
    luck: {
      fortune_seeker: { x: 2, y: 0 },
      treasure_sense: { x: 1, y: 1 },
      double_yield: { x: 3, y: 1 },
      jackpot: { x: 2, y: 2 }
    },
    combat: {
      void_strike: { x: 2, y: 0 },
      mental_fortitude: { x: 1, y: 1 },
      reality_shield: { x: 3, y: 1 },
      critical_insight: { x: 2, y: 2 },
      existential_dread: { x: 2, y: 3 }
    },
    efficiency: {
      resource_master: { x: 2, y: 0 },
      energy_conservation: { x: 1, y: 1 },
      meditation_expert: { x: 3, y: 1 },
      synergy: { x: 2, y: 2 }
    }
  };