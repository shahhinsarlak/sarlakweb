/**
 * Factory Helpers ("The Construct", Chapter 2 Phase 2)
 *
 * Pure functions for the production chain: power balance, substrate flow,
 * per-machine scaling build cost, and a per-second production summary used by
 * both the UI and (mirrored) the 100ms tick.
 *
 * Chain: Generators make Power -> Extractors spend Power to mine Substrate ->
 * Converters spend Power + Substrate to output existing resources. Over-budget
 * power throttles all consumers proportionally; a dry substrate stockpile
 * throttles converters to the flow extraction can sustain.
 */

import { FACTORY_MACHINES, PP_MULTIPLIER_TIERS } from './constants';

/** Look up a machine definition by id. */
export const getMachine = (id) => FACTORY_MACHINES.find((m) => m.id === id) || null;

/** Number of a given machine the player owns. */
export const getMachineCount = (state, id) => (state.factoryMachines?.[id] || 0);

/**
 * Build cost for the NEXT copy of a machine (scales by costGrowth^owned).
 * @returns {Object} resource -> integer amount
 */
export const getMachineBuildCost = (machine, state) => {
  const count = getMachineCount(state, machine.id);
  const mult = Math.pow(machine.costGrowth || 1, count);
  const cost = {};
  Object.entries(machine.buildCost || {}).forEach(([res, amt]) => {
    cost[res] = Math.ceil(amt * mult);
  });
  return cost;
};

/** True if a machine's blueprint has been researched (or it needs none). */
export const isBlueprintResearched = (machine, state) =>
  !machine.blueprint || (state.factoryBlueprints || []).includes(machine.id);

/** Can the player afford to research this machine's blueprint? */
export const canResearchBlueprint = (machine, state) =>
  !!machine.blueprint &&
  !isBlueprintResearched(machine, state) &&
  (state.intelligence || 0) >= (machine.blueprint.intelligence || 0);

/** Can the player afford to build the next copy of this machine? */
export const canBuildMachine = (machine, state) => {
  if (!isBlueprintResearched(machine, state)) return false;
  const cost = getMachineBuildCost(machine, state);
  return Object.entries(cost).every(([res, amt]) => (state[res] || 0) >= amt);
};

/** PP multiplier tier factor (so factory PP stays relevant late-game). */
export const getPPTierMultiplier = (state) => {
  const tier = state.ppMultiplierTier || 0;
  if (tier <= 0) return 1;
  const data = PP_MULTIPLIER_TIERS.find((t) => t.tier === tier);
  return data ? data.multiplier : 1;
};

/**
 * Compute the full factory state: power balance, substrate flow, and per-second
 * outputs (after power + substrate throttling). dt scales the substrate flow used
 * for the throttle estimate; pass 1 for a per-second summary.
 *
 * @param {Object} state - game state
 * @returns {Object} {
 *   powerProduced, powerDemand, powerEff,
 *   substrate, subProducedPerSec, subDemandPerSec, subEff, subNetPerSec,
 *   outputs: { pp, paper, lucidity, intelligence, material }
 * }
 */
export const getFactoryStats = (state) => {
  const machines = state.factoryMachines || {};

  let powerProduced = 0;
  let powerDemand = 0;
  FACTORY_MACHINES.forEach((m) => {
    const count = machines[m.id] || 0;
    if (count <= 0) return;
    if (m.power > 0) powerProduced += m.power * count;
    else if (m.power < 0) powerDemand += -m.power * count;
  });
  const powerEff = powerDemand > 0 ? Math.min(1, powerProduced / powerDemand) : 1;

  // Substrate produced by extractors (per second), throttled by power.
  let subProducedPerSec = 0;
  FACTORY_MACHINES.forEach((m) => {
    const count = machines[m.id] || 0;
    if (count > 0 && m.substrate > 0) subProducedPerSec += m.substrate * count * powerEff;
  });

  // Substrate demanded by converters (per second), throttled by power.
  let subDemandPerSec = 0;
  FACTORY_MACHINES.forEach((m) => {
    const count = machines[m.id] || 0;
    if (count > 0 && m.substrate < 0) subDemandPerSec += -m.substrate * count * powerEff;
  });

  // Substrate efficiency: stockpile plus this second's production must cover demand.
  const subAvailablePerSec = (state.substrate || 0) + subProducedPerSec;
  const subEff = subDemandPerSec > 0 ? Math.min(1, subAvailablePerSec / subDemandPerSec) : 1;
  const subNetPerSec = subProducedPerSec - subDemandPerSec * subEff;

  // Converter outputs (per second), throttled by power then substrate.
  const ppTierMult = getPPTierMultiplier(state);
  const outputs = { pp: 0, paper: 0, lucidity: 0, intelligence: 0, material: 0 };
  FACTORY_MACHINES.forEach((m) => {
    const count = machines[m.id] || 0;
    if (count <= 0 || !m.output) return;
    let rate = m.output.rate * count * powerEff * subEff;
    if (m.output.scalesWithPPTier) rate *= ppTierMult;
    outputs[m.output.resource] = (outputs[m.output.resource] || 0) + rate;
  });

  return {
    powerProduced,
    powerDemand,
    powerEff,
    substrate: state.substrate || 0,
    subProducedPerSec,
    subDemandPerSec,
    subEff,
    subNetPerSec,
    outputs,
  };
};

/**
 * Advance the factory by dt seconds. Pure: reads `state`, returns the deltas the
 * tick should apply (it does not mutate). Materials are integers, so fractional
 * material output accumulates in factoryMaterialAcc until whole units pop out.
 *
 * @param {Object} state - game state (read from `prev` in the tick)
 * @param {number} dt - seconds elapsed (0.1 for the 100ms tick)
 * @returns {Object} { newSubstrate, materialAcc, wholeMaterials, pp, paper, lucidity, intelligence }
 */
export const computeFactoryTick = (state, dt) => {
  const machines = state.factoryMachines || {};

  let powerProduced = 0;
  let powerDemand = 0;
  FACTORY_MACHINES.forEach((m) => {
    const c = machines[m.id] || 0;
    if (!c) return;
    if (m.power > 0) powerProduced += m.power * c;
    else if (m.power < 0) powerDemand += -m.power * c;
  });
  const powerEff = powerDemand > 0 ? Math.min(1, powerProduced / powerDemand) : 1;

  let subProd = 0;
  let subDem = 0;
  FACTORY_MACHINES.forEach((m) => {
    const c = machines[m.id] || 0;
    if (!c) return;
    if (m.substrate > 0) subProd += m.substrate * c * powerEff * dt;
    else if (m.substrate < 0) subDem += -m.substrate * c * powerEff * dt;
  });
  const subAvail = (state.substrate || 0) + subProd;
  const subEff = subDem > 0 ? Math.min(1, subAvail / subDem) : 1;
  const subConsumed = subDem * subEff;
  let newSubstrate = (state.substrate || 0) + subProd - subConsumed;
  if (newSubstrate < 0) newSubstrate = 0;

  const ppTierMult = getPPTierMultiplier(state);
  const out = { pp: 0, paper: 0, lucidity: 0, intelligence: 0, material: 0 };
  FACTORY_MACHINES.forEach((m) => {
    const c = machines[m.id] || 0;
    if (!c || !m.output) return;
    let r = m.output.rate * c * powerEff * subEff * dt;
    if (m.output.scalesWithPPTier) r *= ppTierMult;
    out[m.output.resource] += r;
  });

  let materialAcc = (state.factoryMaterialAcc || 0) + out.material;
  const wholeMaterials = Math.floor(materialAcc);
  materialAcc -= wholeMaterials;

  return {
    newSubstrate,
    materialAcc,
    wholeMaterials,
    pp: out.pp,
    paper: out.paper,
    lucidity: out.lucidity,
    intelligence: out.intelligence,
  };
};
