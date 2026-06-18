/**
 * Factory Helpers ("The Construct", Chapter 2 Phase 2 / v2)
 *
 * Singular machines: each machine is built once, then has a 10-step upgrade track
 * (FACTORY_UPGRADES). `state.factoryMachines[id]` holds the machine's upgrade
 * LEVEL (0..10); the key being present means it is built.
 *
 * Power is a battery. The Generator tops it up each tick; consumers draw in
 * `priority` order and each runs only if the battery can cover its FULL draw that
 * tick, otherwise it HALTS (no output, no draw). Converters also halt if their
 * substrate draw is not available. No throttling — binary on/off per machine.
 */

import { FACTORY_MACHINES, FACTORY_UPGRADES, FACTORY_BASE_POWER_CAPACITY, PP_MULTIPLIER_TIERS } from './constants';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';

const TRANSMUTER_ID = 'transmuter';

export const MAX_UPGRADE_LEVEL = 10;
export const MIN_OVERCLOCK = 50;
export const MAX_OVERCLOCK = 300;
export const OVERCLOCK_STEP = 25;

// Upgrade cost formula (level = the level being purchased, 1..10).
const UP_LUC_BASE = 40;
const UP_LUC_GROWTH = 1.55;
const UP_SUB_FROM = 4;
const UP_SUB_BASE = 15;
const UP_SUB_GROWTH = 1.5;
const UP_INT_FROM = 7;
const UP_INT_BASE = 25;
const UP_INT_GROWTH = 1.5;

/** Look up a machine definition by id. */
export const getMachine = (id) => FACTORY_MACHINES.find((m) => m.id === id) || null;

/** True if the machine has been built (key present, even at level 0). */
export const isBuilt = (state, id) =>
  Object.prototype.hasOwnProperty.call(state.factoryMachines || {}, id);

/** Current upgrade level (0..max) of a built machine; 0 if not built. */
export const getMachineLevel = (state, id) => (isBuilt(state, id) ? (state.factoryMachines[id] || 0) : 0);

/** Highest upgrade level a machine can reach (= number of upgrades it has). */
export const getMaxLevel = (id) => (FACTORY_UPGRADES[id] || []).length || MAX_UPGRADE_LEVEL;

/** True if the machine is paused (off: no power draw/gen, no output, no capacity). */
export const isPaused = (state, id) => !!(state.factoryPaused && state.factoryPaused[id]);

/** Index of a machine's Overclock Module upgrade, or -1 if it has none. */
export const getOverclockUpgradeIndex = (id) =>
  (FACTORY_UPGRADES[id] || []).findIndex((u) => u.effect && u.effect.type === 'overclock');

/** True if the machine's Overclock Module has been researched. */
export const isOverclockUnlocked = (state, id) => {
  const idx = getOverclockUpgradeIndex(id);
  return idx >= 0 && getMachineLevel(state, id) > idx;
};

/** Current overclock percent for a machine (100 if not unlocked), clamped to cap. */
export const getOverclock = (state, id) => {
  if (!isOverclockUnlocked(state, id)) return 100;
  const v = state.factoryOverclock?.[id] ?? 100;
  return Math.max(MIN_OVERCLOCK, Math.min(getOverclockCap(state), v));
};

/** True if any machine has its Overclock Module researched. */
export const hasAnyOverclock = (state) => FACTORY_MACHINES.some((m) => isOverclockUnlocked(state, m.id));

/** Current maximum overclock percent: base cap raised by the Overclock Regulator. */
export const getOverclockCap = (state) => {
  if (!isBuilt(state, 'overclocker')) return MAX_OVERCLOCK;
  const level = getMachineLevel(state, 'overclocker');
  const ups = FACTORY_UPGRADES.overclocker || [];
  let bonus = 0;
  for (let i = 0; i < level && i < ups.length; i += 1) {
    const e = ups[i].effect || {};
    if (e.type === 'overclockCapAdd') bonus += e.value;
  }
  return MAX_OVERCLOCK + bonus;
};

/** Whether a machine is available to build yet (some are gated by progress). */
export const isMachineAvailable = (state, machine) => {
  if (machine.availableWhen === 'anyOverclock') return hasAnyOverclock(state);
  return true;
};

// --- Material Transmuter (converts Void Fragments into rarer materials) ---

/** Aggregate the transmuter's upgrade effects (throughput + yield). */
const getTransmuterUpgradeEffects = (state) => {
  const level = getMachineLevel(state, TRANSMUTER_ID);
  const ups = FACTORY_UPGRADES[TRANSMUTER_ID] || [];
  let rateAdd = 0;
  let rateMult = 1;
  let effMult = 1;
  for (let i = 0; i < level && i < ups.length; i += 1) {
    const e = ups[i].effect || {};
    if (e.type === 'voidRateAdd') rateAdd += e.value;
    if (e.type === 'voidRateMult') rateMult *= e.value;
    if (e.type === 'transmuteEffMult') effMult *= e.value;
  }
  return { rateAdd, rateMult, effMult };
};

/** Void Fragments processed per second at full run. */
export const getTransmuterRate = (state) => {
  const base = getMachine(TRANSMUTER_ID)?.transmuteBase || 5;
  const { rateAdd, rateMult } = getTransmuterUpgradeEffects(state);
  return (base + rateAdd) * rateMult;
};

/** Base spawn rarity weight of a material (higher = more common). */
export const getMaterialRarity = (id) => {
  const m = DIMENSIONAL_MATERIALS.find((x) => x.id === id);
  return m ? m.rarity : 1;
};

/** The Transmuter's currently selected output material (validated). */
export const getTransmuteTarget = (state) => {
  const t = state.factoryTransmuteTarget;
  return getTransmutableTargets().some((m) => m.id === t) ? t : 'static_crystal';
};

/**
 * Void Fragments needed to make ONE unit of the target material. Rarity-aware:
 * cost = rarity(void) / rarity(target), so rarer targets cost far more. Reduced
 * by the transmuter's yield (efficiency) upgrades.
 */
export const getTransmuteCost = (state, targetId) => {
  const rarityVoid = getMaterialRarity('void_fragment');
  const rarityTarget = getMaterialRarity(targetId);
  if (rarityTarget <= 0) return Infinity;
  const { effMult } = getTransmuterUpgradeEffects(state);
  return (rarityVoid / rarityTarget) / effMult;
};

/** Materials the transmuter can produce (everything rarer than Void Fragment). */
export const getTransmutableTargets = () => DIMENSIONAL_MATERIALS.filter((m) => m.id !== 'void_fragment');

/** Per-second transmuter summary for the UI. */
export const getTransmuterStats = (state) => {
  const target = getTransmuteTarget(state);
  const rate = getTransmuterRate(state);
  const cost = getTransmuteCost(state, target);
  return { target, rate, cost, voidPerSec: rate, targetPerSec: cost > 0 && isFinite(cost) ? rate / cost : 0 };
};

/** True if a machine's blueprint has been researched (or it needs none). */
export const isBlueprintResearched = (machine, state) =>
  !machine.blueprint || (state.factoryBlueprints || []).includes(machine.id);

/** Can the player afford to research this machine's blueprint? */
export const canResearchBlueprint = (machine, state) =>
  !!machine.blueprint &&
  !isBlueprintResearched(machine, state) &&
  (state.intelligence || 0) >= (machine.blueprint.intelligence || 0);

/** Can the player afford to build this (unbuilt) machine? */
export const canBuildMachine = (machine, state) => {
  if (isBuilt(state, machine.id)) return false;
  if (!isBlueprintResearched(machine, state)) return false;
  return Object.entries(machine.buildCost || {}).every(([res, amt]) => (state[res] || 0) >= amt);
};

/** The next upgrade definition for a machine, or null if maxed / not built. */
export const getNextUpgrade = (state, id) => {
  if (!isBuilt(state, id)) return null;
  const level = getMachineLevel(state, id);
  if (level >= getMaxLevel(id)) return null;
  return (FACTORY_UPGRADES[id] || [])[level] || null;
};

/** Cost of upgrading a machine to `targetLevel` (1..10). */
export const getUpgradeCost = (targetLevel) => {
  const cost = { lucidity: Math.round(UP_LUC_BASE * Math.pow(UP_LUC_GROWTH, targetLevel - 1)) };
  if (targetLevel >= UP_SUB_FROM) {
    cost.substrate = Math.round(UP_SUB_BASE * Math.pow(UP_SUB_GROWTH, targetLevel - UP_SUB_FROM));
  }
  if (targetLevel >= UP_INT_FROM) {
    cost.intelligence = Math.round(UP_INT_BASE * Math.pow(UP_INT_GROWTH, targetLevel - UP_INT_FROM));
  }
  return cost;
};

/** Can the player afford the next upgrade for a built, non-maxed machine? */
export const canUpgradeMachine = (state, id) => {
  if (!isBuilt(state, id)) return false;
  const level = getMachineLevel(state, id);
  if (level >= getMaxLevel(id)) return false;
  const cost = getUpgradeCost(level + 1);
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
 * Effective per-machine stats after applying its purchased upgrades.
 * @returns {Object} { powerGen, powerUse, powerCapacity, substrate, output }
 */
export const getEffectiveMachineStats = (state, machine) => {
  const level = getMachineLevel(state, machine.id);
  const upgrades = FACTORY_UPGRADES[machine.id] || [];

  let powerGen = machine.powerGen || 0;
  let powerCapacity = machine.powerCapacity || 0;
  let substrate = machine.substrate || 0;
  let powerUseMult = 1;
  let outputMult = 1;
  let outputAdd = 0;
  let substrateUseMult = 1;
  let substrateAdd = 0;

  for (let i = 0; i < level && i < upgrades.length; i += 1) {
    const e = upgrades[i].effect || {};
    if (e.powerGenAdd) powerGen += e.powerGenAdd;
    if (e.powerCapacityAdd) powerCapacity += e.powerCapacityAdd;
    if (e.substrateAdd) substrateAdd += e.substrateAdd;
    if (e.powerUseMult) powerUseMult *= e.powerUseMult;
    if (e.outputMult) outputMult *= e.outputMult;
    if (e.outputAdd) outputAdd += e.outputAdd;
    if (e.substrateUseMult) substrateUseMult *= e.substrateUseMult;
  }

  substrate += substrateAdd;
  if (substrate < 0) substrate *= substrateUseMult; // converters: reduce consumption magnitude

  // Overclock (if unlocked) scales power draw, output, and substrate throughput
  // together. Generator/Capacitor have no Overclock Module, so oc is 1 for them.
  const oc = getOverclock(state, machine.id) / 100;

  const powerUse = (machine.powerUse || 0) * powerUseMult * oc;
  substrate *= oc;
  const output = machine.output
    ? { ...machine.output, rate: (machine.output.rate + outputAdd) * outputMult * oc }
    : null;

  return { powerGen, powerUse, powerCapacity, substrate, output };
};

/** Total battery capacity = base floor + all built (non-paused) capacitors. */
export const getPowerCapacity = (state) => {
  let cap = FACTORY_BASE_POWER_CAPACITY;
  Object.keys(state.factoryMachines || {}).forEach((id) => {
    if (isPaused(state, id)) return;
    const m = getMachine(id);
    if (m) cap += getEffectiveMachineStats(state, m).powerCapacity || 0;
  });
  return cap;
};

/**
 * Simulate one tick of dt seconds. Shared by computeFactoryTick (authoritative)
 * and getFactoryStats (UI). Returns power/substrate after the tick, per-machine
 * run status, this-tick outputs, and the power balance.
 */
const simulate = (state, dt) => {
  const builtIds = Object.keys(state.factoryMachines || {});
  let capacity = FACTORY_BASE_POWER_CAPACITY;
  let genPerSec = 0;
  let demandPerSec = 0;

  const consumers = [];
  builtIds.forEach((id) => {
    if (isPaused(state, id)) return; // paused: contributes nothing this tick
    const m = getMachine(id);
    if (!m) return;
    const s = getEffectiveMachineStats(state, m);
    capacity += s.powerCapacity || 0;
    genPerSec += s.powerGen || 0;
    if (m.priority !== undefined) {
      demandPerSec += s.powerUse || 0;
      consumers.push({ m, s });
    }
  });
  consumers.sort((a, b) => a.m.priority - b.m.priority);

  // Top up the battery with this tick's generation.
  let battery = Math.min(capacity, (state.power || 0) + genPerSec * dt);

  let substrate = state.substrate || 0;
  const out = { pp: 0, paper: 0, lucidity: 0, intelligence: 0, material: 0 };
  const ppTierMult = getPPTierMultiplier(state);
  const status = {};
  let actualUsePerSec = 0;

  consumers.forEach(({ m, s }) => {
    const powerNeed = (s.powerUse || 0) * dt;
    if (battery < powerNeed) { status[m.id] = 'halted'; return; }

    // The Transmuter runs on Void Fragments (from inventory) rather than substrate.
    if (m.isTransmuter) {
      if ((state.dimensionalInventory?.void_fragment || 0) < 1) { status[m.id] = 'halted'; return; }
      battery -= powerNeed;
      actualUsePerSec += s.powerUse || 0;
      status[m.id] = 'running';
      return; // the actual conversion is applied in computeFactoryTick
    }

    // Converters need substrate; extractors produce it (and run first by priority).
    if (s.substrate < 0) {
      const subNeed = -s.substrate * dt;
      if (substrate < subNeed) { status[m.id] = 'halted'; return; }
      substrate -= subNeed;
    }

    battery -= powerNeed;
    actualUsePerSec += s.powerUse || 0;
    status[m.id] = 'running';

    if (s.substrate > 0) substrate += s.substrate * dt;
    if (s.output) {
      let r = s.output.rate * dt;
      if (s.output.scalesWithPPTier) r *= ppTierMult;
      out[s.output.resource] += r;
    }
  });

  const newPower = Math.max(0, Math.min(capacity, battery));
  const newSubstrate = Math.max(0, substrate);

  return { capacity, genPerSec, demandPerSec, actualUsePerSec, newPower, newSubstrate, out, status };
};

/**
 * Per-second factory summary for the UI (status + rates scaled from one tick).
 */
export const getFactoryStats = (state) => {
  const dt = 0.1;
  const sim = simulate(state, dt);
  const scale = 1 / dt;
  const outputs = {
    pp: sim.out.pp * scale,
    paper: sim.out.paper * scale,
    lucidity: sim.out.lucidity * scale,
    intelligence: sim.out.intelligence * scale,
    material: sim.out.material * scale,
  };
  const subNetPerSec = (sim.newSubstrate - (state.substrate || 0)) * scale;
  const anyHalted = Object.values(sim.status).some((v) => v === 'halted');
  const transmuter = { ...getTransmuterStats(state), running: sim.status[TRANSMUTER_ID] === 'running' };

  return {
    power: state.power || 0,
    powerCapacity: sim.capacity,
    powerGenPerSec: sim.genPerSec,
    powerUsePerSec: sim.demandPerSec,
    powerNetPerSec: sim.genPerSec - sim.actualUsePerSec,
    status: sim.status,
    anyHalted,
    substrate: state.substrate || 0,
    subNetPerSec,
    outputs,
    transmuter,
  };
};

/**
 * Advance the factory by dt seconds (authoritative tick math). Materials are
 * integers, so fractional output banks in accumulators until whole units pop.
 * Returns a dimensional-inventory delta (condenser adds Void Fragments; the
 * Transmuter consumes them and emits the chosen target material).
 */
export const computeFactoryTick = (state, dt) => {
  const sim = simulate(state, dt);
  let materialAcc = (state.factoryMaterialAcc || 0) + sim.out.material;
  const wholeVoid = Math.floor(materialAcc);
  materialAcc -= wholeVoid;

  const dimDelta = {};
  if (wholeVoid > 0) dimDelta.void_fragment = wholeVoid;

  // Transmuter: consume Void Fragments, emit the target material.
  let transmuteVoidAcc = state.factoryTransmuteVoidAcc || 0;
  let transmuteOutAcc = state.factoryTransmuteOutAcc || 0;
  if (sim.status[TRANSMUTER_ID] === 'running') {
    transmuteVoidAcc += getTransmuterRate(state) * dt;
    const target = getTransmuteTarget(state);
    const cost = getTransmuteCost(state, target);
    const availVoid = (state.dimensionalInventory?.void_fragment || 0) + (dimDelta.void_fragment || 0);
    const voidConsume = Math.min(Math.floor(transmuteVoidAcc), availVoid);
    if (voidConsume > 0 && Number.isFinite(cost) && cost > 0) {
      transmuteVoidAcc -= voidConsume;
      transmuteOutAcc += voidConsume / cost;
      const wholeOut = Math.floor(transmuteOutAcc);
      transmuteOutAcc -= wholeOut;
      dimDelta.void_fragment = (dimDelta.void_fragment || 0) - voidConsume;
      if (wholeOut > 0) dimDelta[target] = (dimDelta[target] || 0) + wholeOut;
    }
  }

  return {
    newPower: sim.newPower,
    newSubstrate: sim.newSubstrate,
    materialAcc,
    transmuteVoidAcc,
    transmuteOutAcc,
    dimDelta,
    pp: sim.out.pp,
    paper: sim.out.paper,
    lucidity: sim.out.lucidity,
    intelligence: sim.out.intelligence,
  };
};
