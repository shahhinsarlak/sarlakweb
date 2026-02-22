/**
 * Skill Tree Constants
 *
 * Defines the skill tree system:
 * - SKILLS: Skill definitions with effects
 * - LEVEL_SYSTEM: XP and leveling calculations
 * - XP_REWARDS: XP granted for various actions
 */

// Skill branch definitions for filing cabinet tabs
export const SKILL_BRANCHES = {
  efficiency: { name: 'EFFICIENCY', color: '#4a90e2', desc: 'Productivity and optimization protocols' },
  admin: { name: 'ADMIN', color: '#9b59b6', desc: 'Bureaucratic procedures and documentation' },
  occult: { name: 'OCCULT', color: '#e74c3c', desc: 'Dimensional and reality manipulation' },
  survival: { name: 'SURVIVAL', color: '#27ae60', desc: 'Energy and sanity management' },
  forbidden: { name: '[REDACTED]', color: '#000000', desc: '███████ ███████ ███████' }
};

export const SKILLS = {
  // ═══════════════════════════════════════════════════════
  // EFFICIENCY BRANCH - Productivity & PP Generation
  // ═══════════════════════════════════════════════════════

  efficient_sorting: {
    id: 'efficient_sorting',
    name: 'Efficient Sorting Protocol',
    desc: '+10% PP per click',
    branch: 'efficiency',
    tier: 1,
    maxLevel: 5,
    requires: [],
    effect: (level) => ({ ppPerClickMultiplier: 0.10 * level })
  },

  streamlined_workflow: {
    id: 'streamlined_workflow',
    name: 'Streamlined Workflow',
    desc: '+8% passive PP generation',
    branch: 'efficiency',
    tier: 1,
    maxLevel: 5,
    requires: [],
    effect: (level) => ({ ppPerSecondMultiplier: 0.08 * level })
  },

  productivity_metrics: {
    id: 'productivity_metrics',
    name: 'Productivity Metrics Analysis',
    desc: '+15% PP per click',
    branch: 'efficiency',
    tier: 2,
    maxLevel: 3,
    requires: ['efficient_sorting'],
    effect: (level) => ({ ppPerClickMultiplier: 0.15 * level })
  },

  automation_protocols: {
    id: 'automation_protocols',
    name: 'Automation Protocols',
    desc: '+12% passive PP generation',
    branch: 'efficiency',
    tier: 2,
    maxLevel: 3,
    requires: ['streamlined_workflow'],
    effect: (level) => ({ ppPerSecondMultiplier: 0.12 * level })
  },

  synergy_optimization: {
    id: 'synergy_optimization',
    name: 'Cross-Department Synergy',
    desc: '+20% PP from all sources',
    branch: 'efficiency',
    tier: 3,
    maxLevel: 3,
    requires: ['productivity_metrics', 'automation_protocols'],
    effect: (level) => ({ ppMultiplier: 0.20 * level })
  },

  // ═══════════════════════════════════════════════════════
  // ADMIN BRANCH - Paperwork & Documents
  // ═══════════════════════════════════════════════════════

  paper_pusher: {
    id: 'paper_pusher',
    name: 'Professional Paper Pusher',
    desc: '+5% paper quality',
    branch: 'admin',
    tier: 1,
    maxLevel: 5,
    requires: [],
    effect: (level) => ({ paperQualityBonus: 5 * level })
  },

  filing_expertise: {
    id: 'filing_expertise',
    name: 'Advanced Filing Techniques',
    desc: 'Documents last 20% longer',
    branch: 'admin',
    tier: 1,
    maxLevel: 3,
    requires: [],
    effect: (level) => ({ documentDurationMultiplier: 0.20 * level })
  },

  bureaucratic_mastery: {
    id: 'bureaucratic_mastery',
    name: 'Bureaucratic Mastery',
    desc: '+10% paper quality, +5% document effects',
    branch: 'admin',
    tier: 2,
    maxLevel: 3,
    requires: ['paper_pusher'],
    effect: (level) => ({
      paperQualityBonus: 10 * level,
      documentEffectMultiplier: 0.05 * level
    })
  },

  red_tape_navigation: {
    id: 'red_tape_navigation',
    name: 'Red Tape Navigation',
    desc: '-10% paper cost for documents',
    branch: 'admin',
    tier: 2,
    maxLevel: 3,
    requires: ['filing_expertise'],
    effect: (level) => ({ documentCostReduction: 0.10 * level })
  },

  executive_authority: {
    id: 'executive_authority',
    name: 'Executive Authority',
    desc: 'Can store +2 documents in file drawer',
    branch: 'admin',
    tier: 3,
    maxLevel: 5,
    requires: ['bureaucratic_mastery', 'red_tape_navigation'],
    effect: (level) => ({ maxStoredDocuments: 2 * level })
  },

  // ═══════════════════════════════════════════════════════
  // SURVIVAL BRANCH - Energy & Sanity
  // ═══════════════════════════════════════════════════════

  energy_conservation: {
    id: 'energy_conservation',
    name: 'Energy Conservation',
    desc: '-10% energy costs',
    branch: 'survival',
    tier: 1,
    maxLevel: 5,
    requires: [],
    effect: (level) => ({ energyCostReduction: 0.10 * level })
  },

  mental_fortitude: {
    id: 'mental_fortitude',
    name: 'Mental Fortitude',
    desc: 'Slow sanity loss by 15%',
    branch: 'survival',
    tier: 1,
    maxLevel: 5,
    requires: [],
    effect: (level) => ({ sanityLossReduction: 0.15 * level })
  },

  power_napping: {
    id: 'power_napping',
    name: 'Power Napping Techniques',
    desc: 'Rest cooldown -10 seconds',
    branch: 'survival',
    tier: 2,
    maxLevel: 3,
    requires: ['energy_conservation'],
    effect: (level) => ({ restCooldownReduction: 10 * level })
  },

  meditation_mastery: {
    id: 'meditation_mastery',
    name: 'Meditation Mastery',
    desc: 'Meditation restores +5 extra sanity',
    branch: 'survival',
    tier: 2,
    maxLevel: 5,
    requires: ['mental_fortitude'],
    effect: (level) => ({ meditationBonus: 5 * level })
  },

  resilient_mind: {
    id: 'resilient_mind',
    name: 'Resilient Mind',
    desc: 'Maximum sanity +10',
    branch: 'survival',
    tier: 3,
    maxLevel: 3,
    requires: ['power_napping', 'meditation_mastery'],
    effect: (level) => ({ maxSanity: 10 * level })
  },

  // ═══════════════════════════════════════════════════════
  // OCCULT BRANCH - Void & Dimensional Powers
  // ═══════════════════════════════════════════════════════

  void_attunement: {
    id: 'void_attunement',
    name: 'Void Attunement',
    desc: '+15% dimensional material gain',
    branch: 'occult',
    tier: 1,
    maxLevel: 5,
    requires: [],
    effect: (level) => ({ dimensionalMaterialBonus: 0.15 * level })
  },

  reality_anchor: {
    id: 'reality_anchor',
    name: 'Reality Anchor',
    desc: '-15% portal cooldown',
    branch: 'occult',
    tier: 1,
    maxLevel: 3,
    requires: [],
    effect: (level) => ({ portalCooldownReduction: 0.15 * level })
  },

  dimensional_sight: {
    id: 'dimensional_sight',
    name: 'Dimensional Sight',
    desc: '+10% chance for rare materials',
    branch: 'occult',
    tier: 2,
    maxLevel: 5,
    requires: ['void_attunement'],
    effect: (level) => ({ rareMaterialChance: 0.10 * level })
  },

  rift_walker: {
    id: 'rift_walker',
    name: 'Rift Walker',
    desc: 'Portal stays open +5 seconds',
    branch: 'occult',
    tier: 2,
    maxLevel: 3,
    requires: ['reality_anchor'],
    effect: (level) => ({ portalDurationBonus: 5 * level })
  },

  void_mastery: {
    id: 'void_mastery',
    name: 'Void Mastery',
    desc: '+25% dimensional material gain, +5% rare chance',
    branch: 'occult',
    tier: 3,
    maxLevel: 3,
    requires: ['dimensional_sight', 'rift_walker'],
    effect: (level) => ({
      dimensionalMaterialBonus: 0.25 * level,
      rareMaterialChance: 0.05 * level
    })
  },

  // ═══════════════════════════════════════════════════════
  // FORBIDDEN BRANCH - Dark Knowledge (High Level Required)
  // ═══════════════════════════════════════════════════════

  sanity_sacrifice: {
    id: 'sanity_sacrifice',
    name: '[FILE CORRUPTED]',
    desc: 'Trade sanity for power. +2% PP per 10 sanity lost',
    branch: 'forbidden',
    tier: 4,
    maxLevel: 3,
    minLevel: 20,
    requires: ['synergy_optimization', 'void_mastery'],
    effect: (level) => ({ sanityChaosBonus: 0.02 * level })
  },

  temporal_distortion: {
    id: 'temporal_distortion',
    name: 'Temporal Distortion',
    desc: 'Actions have 5% chance to not consume energy',
    branch: 'forbidden',
    tier: 4,
    maxLevel: 5,
    minLevel: 25,
    requires: ['resilient_mind', 'void_mastery'],
    effect: (level) => ({ freeActionChance: 0.05 * level })
  },

  reality_rejection: {
    id: 'reality_rejection',
    name: '███████ ██████',
    desc: 'You should not be reading this',
    branch: 'forbidden',
    tier: 5,
    maxLevel: 1,
    minLevel: 40,
    requires: ['sanity_sacrifice', 'temporal_distortion'],
    effect: (level) => ({
      ppMultiplier: 0.50 * level,
      dimensionalMaterialBonus: 0.50 * level,
      sanityLossIncrease: 0.50 * level
    })
  }
};

export const LEVEL_SYSTEM = {
  baseXP: 100,
  xpMultiplier: 1.5,
  maxLevel: 50,
  
  getXPForLevel: (level) => {
    return Math.floor(LEVEL_SYSTEM.baseXP * Math.pow(LEVEL_SYSTEM.xpMultiplier, level - 1));
  },
  
  getSkillPointsPerLevel: (level) => {
    if (level % 10 === 0) return 3;
    return 1;
  }
};

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
  purchaseUpgrade: 10,
  purchaseDimensionalUpgrade: 15,
  unlockLocation: 30,
  completeAchievement: 50
};