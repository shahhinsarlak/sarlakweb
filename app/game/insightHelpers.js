/**
 * Insight Helpers ("The Lucid Mind", Chapter 2)
 *
 * Aggregates the passive effects of researched insights (mirrors
 * getActiveSkillEffects) and provides lookup/affordability helpers for the
 * Insights panel. Anchors (sanity floors) are handled separately via
 * lucidAnchorTier; this only sums the `passive` effect contributions.
 */

import { INSIGHTS } from './constants';

export const LUCID_DECAY_REDUCTION_CAP = 0.9;

export const getInsight = (id) => INSIGHTS.find((i) => i.id === id) || null;

export const isInsightResearched = (state, id) => (state.researchedInsights || []).includes(id);

export const insightRequirementsMet = (insight, state) =>
  (insight.requires || []).every((r) => isInsightResearched(state, r));

export const canAffordInsight = (insight, state) =>
  (state.intelligence || 0) >= (insight.cost.intelligence || 0) &&
  (state.lucidity || 0) >= (insight.cost.lucidity || 0);

export const canResearchInsight = (insight, state) =>
  !isInsightResearched(state, insight.id) &&
  insightRequirementsMet(insight, state) &&
  canAffordInsight(insight, state);

/**
 * Sum all passive insight effects the player has researched.
 * @returns {Object} effect bag (all default 0)
 */
export const getInsightEffects = (state) => {
  const eff = {
    meditationGainMult: 0,
    lucidDecayReduction: 0,
    meditationLucidityMult: 0,
    lucidityRateMult: 0,
    intelRateMult: 0,
    intelGainMult: 0,
    clarityDurationMult: 0,
    clarityCostReduction: 0,
  };
  const researched = state.researchedInsights || [];
  INSIGHTS.forEach((insight) => {
    if (insight.type !== 'passive' || !insight.effect) return;
    if (!researched.includes(insight.id)) return;
    const { type, value } = insight.effect;
    if (eff[type] !== undefined) eff[type] += value;
  });
  eff.lucidDecayReduction = Math.min(LUCID_DECAY_REDUCTION_CAP, eff.lucidDecayReduction);
  return eff;
};

/** Human-readable one-line effect summary for an insight card. */
export const insightEffectText = (insight) => {
  if (insight.type === 'anchor') {
    const floors = [0, 250, 500, 750];
    return `Sanity floor ${floors[insight.anchorTier]}%`;
  }
  if (insight.type === 'recipe') return 'Unlocks the Clarity craft';
  const e = insight.effect || {};
  const pct = `${Math.round(e.value * 100)}%`;
  switch (e.type) {
    case 'meditationGainMult': return `+${pct} meditation sanity`;
    case 'lucidDecayReduction': return `-${pct} lucid decay`;
    case 'meditationLucidityMult': return `+${pct} meditation lucidity`;
    case 'lucidityRateMult': return `+${pct} passive lucidity`;
    case 'intelRateMult': return `+${pct} passive intelligence`;
    case 'intelGainMult': return `+${pct} Debug/Report intelligence`;
    case 'clarityDurationMult': return `+${pct} Clarity duration`;
    case 'clarityCostReduction': return `-${pct} Clarity cost`;
    default: return '';
  }
};

/** Active aggregated bonuses, as readable strings (non-zero only). */
export const getInsightBonusSummary = (state) => {
  const e = getInsightEffects(state);
  const out = [];
  if (e.meditationGainMult) out.push(`Meditation +${Math.round(e.meditationGainMult * 100)}%`);
  if (e.meditationLucidityMult) out.push(`Med. lucidity +${Math.round(e.meditationLucidityMult * 100)}%`);
  if (e.lucidDecayReduction) out.push(`Lucid decay -${Math.round(e.lucidDecayReduction * 100)}%`);
  if (e.lucidityRateMult) out.push(`Passive lucidity +${Math.round(e.lucidityRateMult * 100)}%`);
  if (e.intelRateMult) out.push(`Passive intelligence +${Math.round(e.intelRateMult * 100)}%`);
  if (e.intelGainMult) out.push(`Debug/Report intel +${Math.round(e.intelGainMult * 100)}%`);
  if (e.clarityDurationMult) out.push(`Clarity duration +${Math.round(e.clarityDurationMult * 100)}%`);
  if (e.clarityCostReduction) out.push(`Clarity cost -${Math.round(e.clarityCostReduction * 100)}%`);
  return out;
};
