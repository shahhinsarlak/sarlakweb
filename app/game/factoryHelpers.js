/**
 * Factory Helpers ("The Construct", Chapter 2 Phase 2)
 *
 * Pure functions for the production chain: a power BATTERY (generators trickle
 * power in, capacitors raise capacity, consumers drain it), substrate flow,
 * per-machine scaling build cost, and a per-second production summary used by
 * both the UI and (mirrored) the 100ms tick.
 *
 * Power: stored `power` is capped at capacity. Each tick, consumers run at
 * `powerEff` = how much of their demand the battery + incoming generation can
 * cover. At 0 stored power with no generation, powerEff = 0 and machines stop.
 * Substrate adds a second throttle (subEff) when the stockpile runs dry.
 */

import { FACTORY_MACHINES, FACTORY_BASE_POWER_CAPACITY, PP_MULTIPLIER_TIERS } from './constants';

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

/** Total battery capacity = base + capacitor contributions. */
export const getPowerCapacity = (state) => {
  const machines = state.factoryMachines || {};
  let cap = FACTORY_BASE_POWER_CAPACITY;
  FACTORY_MACHINES.forEach((m) => {
    if (m.powerCapacity) cap += m.powerCapacity * (machines[m.id] || 0);
  });
  return cap;
};

/** Power generation (per second) from all generators. */
export const getPowerGen = (state) => {
  const machines = state.factoryMachines || {};
  let gen = 0;
  FACTORY_MACHINES.forEach((m) => {
    if (m.powerGen) gen += m.powerGen * (machines[m.id] || 0);
  });
  return gen;
};

/** Power demand (per second) from all consumers. */
export const getPowerUse = (state) => {
  const machines = state.factoryMachines || {};
  let use = 0;
  FACTORY_MACHINES.forEach((m) => {
    if (m.powerUse) use += m.powerUse * (machines[m.id] || 0);
  });
  return use;
};

/**
 * Per-second factory summary for the UI. powerEff here is the steady-state
 * estimate: full while the battery holds charge or generation covers demand,
 * otherwise throttled to the share generation can sustain.
 */
export const getFactoryStats = (state) => {
  const machines = state.factoryMachines || {};
  const powerCapacity = getPowerCapacity(state);
  const powerGenPerSec = getPowerGen(state);
  const powerUsePerSec = getPowerUse(state);
  const stored = state.power || 0;

  let powerEff;
  if (powerUsePerSec <= 0) powerEff = 1;
  else if (stored > 0 || powerGenPerSec >= powerUsePerSec) powerEff = 1;
  else powerEff = powerGenPerSec / powerUsePerSec;

  // Substrate flow (throttled by power).
  let subProducedPerSec = 0;
  let subDemandPerSec = 0;
  FACTORY_MACHINES.forEach((m) => {
    const count = machines[m.id] || 0;
    if (count <= 0 || !m.substrate) return;
    if (m.substrate > 0) subProducedPerSec += m.substrate * count * powerEff;
    else subDemandPerSec += -m.substrate * count * powerEff;
  });
  const subAvailablePerSec = (state.substrate || 0) + subProducedPerSec;
  const subEff = subDemandPerSec > 0 ? Math.min(1, subAvailablePerSec / subDemandPerSec) : 1;
  const subNetPerSec = subProducedPerSec - subDemandPerSec * subEff;

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
    power: stored,
    powerCapacity,
    powerGenPerSec,
    powerUsePerSec,
    powerNetPerSec: powerGenPerSec - powerUsePerSec,
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
 * tick should apply. Power is a battery: stored power + incoming generation must
 * cover consumer demand; whatever fraction it covers is powerEff, and machines
 * (extraction, conversion) run at that rate. Materials are integers, so
 * fractional material output banks in factoryMaterialAcc until whole units pop.
 *
 * @returns {Object} { newPower, newSubstrate, materialAcc, wholeMaterials, pp, paper, lucidity, intelligence }
 */
export const computeFactoryTick = (state, dt) => {
  const machines = state.factoryMachines || {};
  const capacity = getPowerCapacity(state);
  const genPerSec = getPowerGen(state);
  const usePerSec = getPowerUse(state);
  const stored = state.power || 0;

  // Power battery: how much of this tick's demand can stored + generation cover?
  const availThisTick = stored + genPerSec * dt;
  const needThisTick = usePerSec * dt;
  const powerEff = needThisTick > 0 ? Math.min(1, availThisTick / needThisTick) : 1;
  const powerConsumed = needThisTick * powerEff;
  let newPower = stored + genPerSec * dt - powerConsumed;
  if (newPower < 0) newPower = 0;
  if (newPower > capacity) newPower = capacity;

  // Substrate flow this tick, throttled by power.
  let subProd = 0;
  let subDem = 0;
  FACTORY_MACHINES.forEach((m) => {
    const c = machines[m.id] || 0;
    if (!c || !m.substrate) return;
    if (m.substrate > 0) subProd += m.substrate * c * powerEff * dt;
    else subDem += -m.substrate * c * powerEff * dt;
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
    newPower,
    newSubstrate,
    materialAcc,
    wholeMaterials,
    pp: out.pp,
    paper: out.paper,
    lucidity: out.lucidity,
    intelligence: out.intelligence,
  };
};
