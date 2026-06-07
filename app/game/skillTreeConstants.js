/**
 * Skill System Constants
 *
 * A flat list of standalone, high-impact skills (no branches, no prerequisites).
 * Every effect key here is consumed by a live helper — there are no placebo
 * skills. See skillSystemHelpers.js for where each effect is applied.
 *
 * - SKILLS: skill definitions (id, name, desc, maxLevel, effect(level))
 * - LEVEL_SYSTEM: XP curve (linear) and skill-point cadence
 * - XP_REWARDS: XP granted for various actions
 */

export const SKILLS = {
  // ── Productivity ────────────────────────────────────────
  efficient_sorting: {
    id: 'efficient_sorting',
    name: 'Efficient Sorting',
    desc: '+25% PP per click per level.',
    maxLevel: 5,
    effect: (level) => ({ ppPerClickMultiplier: 0.25 * level })
  },
  passive_systems: {
    id: 'passive_systems',
    name: 'Passive Systems',
    desc: '+20% passive PP per second per level.',
    maxLevel: 5,
    effect: (level) => ({ ppPerSecondMultiplier: 0.20 * level })
  },
  cross_synergy: {
    id: 'cross_synergy',
    name: 'Cross-Department Synergy',
    desc: '+15% to ALL PP (click and passive) per level.',
    maxLevel: 3,
    effect: (level) => ({ ppMultiplier: 0.15 * level })
  },

  // ── Resilience ──────────────────────────────────────────
  energy_conservation: {
    id: 'energy_conservation',
    name: 'Energy Conservation',
    desc: '-15% energy cost on every action per level.',
    maxLevel: 5,
    effect: (level) => ({ energyCostReduction: 0.15 * level })
  },
  mental_fortitude: {
    id: 'mental_fortitude',
    name: 'Mental Fortitude',
    desc: 'Sanity drains 20% slower per level.',
    maxLevel: 4,
    effect: (level) => ({ sanityLossReduction: 0.20 * level })
  },
  power_napping: {
    id: 'power_napping',
    name: 'Power Napping',
    desc: 'Rest cooldown -6 seconds per level.',
    maxLevel: 4,
    effect: (level) => ({ restCooldownReduction: 6 * level })
  },

  // ── The Other Office ────────────────────────────────────
  portal_attunement: {
    id: 'portal_attunement',
    name: 'Portal Attunement',
    desc: '-15% portal cooldown per level.',
    maxLevel: 4,
    effect: (level) => ({ portalCooldownReduction: 0.15 * level })
  },
  temporal_distortion: {
    id: 'temporal_distortion',
    name: 'Temporal Distortion',
    desc: '+8% chance an action costs no energy per level.',
    maxLevel: 5,
    effect: (level) => ({ freeActionChance: 0.08 * level })
  }
};

export const LEVEL_SYSTEM = {
  maxLevel: 50,

  // Linear XP curve — each level costs a steady, predictable amount more than
  // the last (no exponential wall, so skill points keep arriving past level 10).
  getXPForLevel: (level) => 50 * level,

  // 1 skill point per level, with a bonus +2 every 5th level.
  getSkillPointsPerLevel: (level) => (level % 5 === 0 ? 3 : 1)
};

export const XP_REWARDS = {
  sortPapers: 2,
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
