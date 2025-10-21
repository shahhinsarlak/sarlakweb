/**
 * Skill Tree Constants
 *
 * Defines the skill tree system:
 * - SKILLS: Skill definitions with effects
 * - LEVEL_SYSTEM: XP and leveling calculations
 * - XP_REWARDS: XP granted for various actions
 */

export const SKILLS = {
  test_skill_1: {
    id: 'test_skill_1',
    name: 'Test Skill',
    desc: '+10% PP generation',
    branch: 'efficiency',
    tier: 1,
    maxLevel: 5,
    requires: [],
    effect: (level) => ({ ppMultiplier: 0.10 * level })
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
  defeatColleague: 25,
  purchaseUpgrade: 10,
  purchaseDimensionalUpgrade: 15,
  unlockLocation: 30,
  completeAchievement: 50
};