/**
 * Canonical PP calculation.
 *
 * Before this module there were three different PP pipelines (manual click,
 * passive tick, auto-sort) plus a display calculator, and they disagreed.
 * Everything now routes through these two functions so the number you see is
 * the number you get.
 */

import { PP_MULTIPLIER_TIERS } from './constants';
import {
  applyPPMultiplier,
  applyPPSMultiplier,
  getChaosBonus,
  getAchievementBonuses,
} from './skillSystemHelpers';
import { applySanityPPModifier } from './sanityPaperHelpers';

const getPPTierMultiplier = (gameState) => {
  const tier = PP_MULTIPLIER_TIERS.find((t) => t.tier === (gameState.ppMultiplierTier || 0));
  return tier ? tier.multiplier : 1;
};

/**
 * Final PP gained from a single sort/click, with the full multiplier chain.
 * Used by sortPapers, auto-sort, and the click display.
 */
export const computeClickPP = (gameState) => {
  let pp = applyPPMultiplier(gameState.ppPerClick || 0, gameState); // skills (per-click + overall)
  pp = applySanityPPModifier(pp, gameState); // sanity tier x ppMult buffs
  pp *= getPPTierMultiplier(gameState); // PP tier (2x/5x/25x)

  const chaos = getChaosBonus(gameState); // Sanity Sacrifice skill
  if (chaos > 0) pp *= 1 + chaos;

  const ach = getAchievementBonuses(gameState);
  if (ach.ppMultiplier > 0) pp *= 1 + ach.ppMultiplier;

  if (gameState.focusModeExpiry > Date.now()) pp *= 1.5; // Focus Mode
  if (gameState.sanityErosionActive && gameState.sanity < 30) pp *= 3; // Sanity Erosion contract

  return pp;
};

/**
 * Final passive PP per second, with the full chain. Divide by 10 for the
 * 100 ms tick. Used by the tick and the PP/sec display.
 */
export const computePassivePPPerSecond = (gameState) => {
  if (!gameState.ppPerSecond || gameState.ppPerSecond <= 0) return 0;

  let pps = applyPPSMultiplier(gameState.ppPerSecond, gameState); // skills (per-second + overall)
  pps = applySanityPPModifier(pps, gameState); // sanity tier x ppMult buffs
  pps *= getPPTierMultiplier(gameState); // PP tier

  // ppPerSecond buffs/contracts: take the strongest active one.
  const now = Date.now();
  const ppSecBuffs = (gameState.activeReportBuffs || []).filter(
    (b) => b.expiresAt > now && b.ppPerSecondMult
  );
  if (ppSecBuffs.length > 0) {
    pps *= Math.max(...ppSecBuffs.map((b) => b.ppPerSecondMult));
  }

  if (gameState.temporalPactActive) pps *= 2; // Temporal Pact contract

  return pps;
};
