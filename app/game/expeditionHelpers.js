/**
 * Expeditions / The Undercroft helpers (Chapter 2, Phase A).
 *
 * Pure functions for the weapon-blueprint ROLL (gacha), mind printing, gear
 * crafting costs, and capability math. UI and state mutation live elsewhere
 * (UndercroftPanel.js / gameActions.js); everything here takes state/ids and
 * returns values, never mutates.
 */

import {
  WEAPON_TYPES,
  WEAPON_RARITIES,
  FOE_ARCHETYPES,
  GEAR_BLUEPRINTS,
  PROVISION_TYPES,
  MIND_TRAITS,
  MIND_TRAIT_LEVELS,
  EXPEDITION,
  ROLL_PITY_THRESHOLD,
} from './constants';
import {
  ENTRY,
  mulberry32,
  hashSeed,
  nodeDepth,
  getNodeThreat,
  getNodeLoot,
  createChartPage,
} from './expeditionChart';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';
import { getFactoryStats } from './factoryHelpers';
import { getSanityTier } from './sanityPaperHelpers';
import { getInsightEffects } from './insightHelpers';

// Human-readable loot summary, e.g. "+412 PP, +30 paper, +2 Reality Dust".
const matName = (id) => (DIMENSIONAL_MATERIALS.find((m) => m.id === id) || {}).name || id;
export const formatLoot = (loot) => {
  const parts = [];
  Object.entries(loot.resources || {}).forEach(([k, v]) => {
    if (v >= 1) parts.push(`+${Math.round(v)} ${k === 'pp' ? 'PP' : k}`);
  });
  Object.entries(loot.materials || {}).forEach(([id, v]) => {
    if (v >= 1) parts.push(`+${v} ${matName(id)}`);
  });
  return parts.join(', ');
};

// Qualitative "what does this site tend to drop" hint for the pre-delve readout.
export const expectedLoot = (type) => ({
  cache: 'PP, paper, and a tier material',
  haunt: 'tier materials and lucidity',
  echo: 'intelligence, and a piece of the way out',
  anomaly: 'rare materials, lucidity and intelligence',
  gateway: 'a piece of the way out; opens the next tier',
}[type] || 'the unknown');

// ---- Production-time pricing -------------------------------------------------
// Soft-currency costs are priced as `sec` SECONDS of the player's CURRENT income
// for that resource, so they auto-scale at any magnitude (a roll always costs
// "about a minute of intelligence" whether you make 10/s or 100,000/s). `fixed`
// (energy = cadence) and `core`/`coreQty` (rare materials = depth) stay constant.
// `floor` gives an early-game minimum before income ramps up.
export const getIncomeRates = (state) => {
  let out = {};
  let subNet = 0;
  if (state.factoryUnlocked) {
    const f = getFactoryStats(state);
    out = f.outputs || {};
    subNet = f.subNetPerSec || 0;
  }
  let lucidT = 0;
  let intelT = 0;
  if ((state.chapter || 1) >= 2 && state.resourcesUnlocked && (state.sanity || 0) > 100) {
    const tier = getSanityTier(state.sanity);
    const ie = getInsightEffects(state);
    lucidT = (tier.lucidityRate || 0) * (1 + (ie.lucidityRateMult || 0));
    intelT = (tier.intelRate || 0) * (1 + (ie.intelRateMult || 0));
  }
  return {
    pp: (state.ppPerSecond || 0) + (out.pp || 0),
    paper: (state.paperPerSecond || 0) + (out.paper || 0),
    lucidity: (out.lucidity || 0) + lucidT,
    intelligence: (out.intelligence || 0) + intelT,
    substrate: Math.max(0, subNet),
    material: out.material || 0,
  };
};

export const resolveCost = (rates, spec, opts = {}) => {
  const secMult = opts.secMult || 1;
  const cost = {};
  if (spec.sec) {
    Object.entries(spec.sec).forEach(([res, sec]) => {
      const floor = (spec.floor && spec.floor[res]) || 0;
      cost[res] = Math.max(Math.round(floor * secMult), Math.ceil((rates[res] || 0) * sec * secMult));
    });
  }
  if (spec.fixed) Object.entries(spec.fixed).forEach(([res, amt]) => { cost[res] = amt; });
  if (spec.core) { cost.core = spec.core; cost.coreQty = spec.coreQty || 1; }
  return cost;
};

// Resolve a node's loot (resourceSec = seconds of income) into actual amounts at
// the player's current income, with a floor income so rewards never hit zero.
export const resolveLoot = (rates, loot) => {
  const resources = {};
  Object.entries(loot.resourceSec || {}).forEach(([k, sec]) => {
    const rate = Math.max(rates[k] || 0, (EXPEDITION.lootMinRate && EXPEDITION.lootMinRate[k]) || 0);
    resources[k] = Math.ceil(rate * sec);
  });
  return { resources, materials: loot.materials || {} };
};

export const getRollCost = (state, rates = getIncomeRates(state)) => resolveCost(rates, EXPEDITION.cost.roll);
export const getShellCost = (state, rates = getIncomeRates(state)) => resolveCost(rates, EXPEDITION.cost.shell);
export const getGearCraftCost = (state, bp, rates = getIncomeRates(state)) => resolveCost(rates, bp.craft);
export const getProvisionCost = (state, p, rates = getIncomeRates(state)) => resolveCost(rates, p.craft);

// Dispatch cost; the per-second portion scales with depth so deeper expeditions
// cost progressively more (energy stays fixed).
export const getDispatchCost = (state, kind, tier, rates = getIncomeRates(state)) =>
  resolveCost(rates, kind === 'delve' ? EXPEDITION.cost.delve : EXPEDITION.cost.survey, { secMult: (tier || 0) + 1 });

// Gear requirements to venture somewhere. Returns the unmet reasons (empty = ok),
// so certain sites/depths simply cannot be attempted without the right gear.
export const getExpeditionGate = (kit, kind, node, tier) => {
  const gear = kit.gear || [];
  const hasStat = (stat) => gear.some((id) => { const g = getGearBlueprint(id); return g && g.stat === stat; });
  const reasons = [];
  if ((tier || 0) >= 2 && !hasStat('sight')) {
    reasons.push('A Lantern or Compass (Sight) to navigate the deep dark.');
  }
  if (kind === 'delve' && node) {
    const corruptHeavy = node.type === 'anomaly' || node.type === 'gateway' || (node.type === 'haunt' && node.archetype === 'corruptor');
    if (corruptHeavy && !hasStat('wardstrength')) {
      reasons.push('A Ward against the Corruption that lairs here.');
    }
    if (node.type === 'echo' && !hasStat('decode')) {
      reasons.push('A Decoder Lens to read the Echo.');
    }
  }
  return { ok: reasons.length === 0, reasons };
};

// ---- Lookups -------------------------------------------------------------

export const getWeaponType = (id) => WEAPON_TYPES.find((w) => w.id === id) || null;
export const getWeaponRarity = (id) => WEAPON_RARITIES.find((r) => r.id === id) || null;
export const getFoeArchetype = (id) => FOE_ARCHETYPES.find((f) => f.id === id) || null;
export const getGearBlueprint = (id) => GEAR_BLUEPRINTS.find((g) => g.id === id) || null;
export const getProvisionType = (id) => PROVISION_TYPES.find((p) => p.id === id) || null;
export const getTrait = (id) => MIND_TRAITS.find((t) => t.id === id) || null;

// ---- Weapon blueprints ---------------------------------------------------

export const blueprintKey = (typeId, rarityId) => `${typeId}:${rarityId}`;

export const parseBlueprintKey = (key) => {
  const [typeId, rarityId] = String(key).split(':');
  return { typeId, rarityId };
};

// Effective Might of a (type, rarity): base type Might scaled by rarity.
export const getWeaponMight = (typeId, rarityId) => {
  const t = getWeaponType(typeId);
  const r = getWeaponRarity(rarityId);
  if (!t || !r) return 0;
  return Math.round(t.baseMight * r.mult);
};

const RARE_INDEX = WEAPON_RARITIES.findIndex((r) => r.id === 'rare');
const rarityIndex = (rarityId) => WEAPON_RARITIES.findIndex((r) => r.id === rarityId);

const pickRarity = (forceRarePlus) => {
  const pool = forceRarePlus ? WEAPON_RARITIES.slice(RARE_INDEX) : WEAPON_RARITIES;
  const total = pool.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i += 1) {
    roll -= pool[i].weight;
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
};

/**
 * Resolve one weapon-blueprint roll.
 * @param {number} pity - consecutive rolls so far without a Rare-or-better.
 * @returns {{ typeId, rarityId, rarePlus, newPity }}
 */
export const performRoll = (pity) => {
  const forceRarePlus = (pity || 0) + 1 >= ROLL_PITY_THRESHOLD;
  const type = WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)];
  const rarity = pickRarity(forceRarePlus);
  const rarePlus = rarityIndex(rarity.id) >= RARE_INDEX;
  return {
    typeId: type.id,
    rarityId: rarity.id,
    rarePlus,
    newPity: rarePlus ? 0 : (pity || 0) + 1,
  };
};

// Production-time cost to craft a physical copy of an owned weapon blueprint.
export const getWeaponCraftCost = (state, typeId, rarityId, rates = getIncomeRates(state)) => {
  const type = getWeaponType(typeId);
  const ri = Math.max(0, rarityIndex(rarityId));
  return resolveCost(rates, {
    sec: { pp: 15 + ri * 15 },
    floor: { pp: 200 + ri * 200 },
    core: type ? type.craftCore : 'static_crystal',
    coreQty: 1 + ri,
  });
};

// ---- Minds ---------------------------------------------------------------

export const getMindStats = (level) => {
  const b = EXPEDITION.mindBase;
  const g = EXPEDITION.mindGrowth;
  const lv = Math.max(1, level) - 1;
  return {
    resolve: Math.round(b.resolve + g.resolve * lv),
    acuity: Math.round((b.acuity + g.acuity * lv) * 10) / 10,
    will: Math.round((b.will + g.will * lv) * 10) / 10,
  };
};

const ROMAN = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

export const toRoman = (n) => {
  let num = Math.max(1, Math.floor(n || 1));
  let out = '';
  for (let i = 0; i < ROMAN.length; i += 1) {
    while (num >= ROMAN[i][0]) {
      out += ROMAN[i][1];
      num -= ROMAN[i][0];
    }
  }
  return out;
};

export const mindDesignation = (serial) => `Copy ${toRoman(serial)}`;

export const getPrintTier = (tierId) =>
  EXPEDITION.printTiers.find((t) => t.id === tierId) || EXPEDITION.printTiers[0];

export const getPrintCost = (state, tierId, rates = getIncomeRates(state)) =>
  resolveCost(rates, EXPEDITION.cost.print, { secMult: getPrintTier(tierId).costMult });

/**
 * Build a fresh mind object for a print tier.
 * @param {number} serial - next mindCounter value (drives the designation).
 * @param {string} tierId - print-tier id.
 */
export const makeMind = (serial, tierId) => {
  const tier = getPrintTier(tierId);
  const level = tier.startLevel;
  const stats = getMindStats(level);
  const traits = [];
  if (tier.extraTrait) {
    const t = MIND_TRAITS[Math.floor(Math.random() * MIND_TRAITS.length)];
    if (t) traits.push(t.id);
  }
  return {
    id: `mind_${serial}_${Date.now()}`,
    designation: mindDesignation(serial),
    level,
    xp: 0,
    resolve: stats.resolve,
    acuity: stats.acuity,
    will: stats.will,
    traits,
    scars: [],
    status: 'idle',
  };
};

// ---- Cost helpers --------------------------------------------------------

// Plain resource cost (pp/paper/lucidity/intelligence/energy on the root state).
export const canAffordCost = (state, cost) =>
  Object.entries(cost || {}).every(([res, amt]) => (state[res] || 0) >= amt);

// Does the player hold qty of a dimensional core?
export const hasCore = (state, coreId, qty) =>
  ((state.dimensionalInventory || {})[coreId] || 0) >= (qty || 0);

// Gear/weapon craft cost = plain resources + an optional dimensional core.
export const canAffordCraft = (state, cost) => {
  const plain = Object.entries(cost || {}).every(([res, amt]) => {
    if (res === 'core' || res === 'coreQty') return true;
    return (state[res] || 0) >= amt;
  });
  if (cost && cost.core) return plain && hasCore(state, cost.core, cost.coreQty || 1);
  return plain;
};

// ===========================================================================
// Phase B: kit capabilities, encounters, risk, resolution, leveling
// ===========================================================================

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Weapon-type effectiveness vs a foe archetype (rarity scales raw Might
// separately). Bare hands are feeble; the wrong tool against a Phantom barely
// bites.
export const weaponArchetypeMod = (wt, archetype) => {
  if (!wt) return 0.4;
  let mod = 1.0;
  if (wt.strongVs === archetype) mod *= 1.6;
  if (wt.weakVs === archetype) mod *= 0.55;
  if (archetype === 'phantom' && wt.strongVs !== 'phantom') mod *= 0.4;
  return mod;
};

/**
 * Resolve a kit (mind + shell + weapon + gear ids + provisions) into the
 * capability numbers the resolution math uses.
 * kit = { mindId, shellId, weaponId, gear:[gearId...], provisions:{provId:qty} }
 */
export const getKitCapabilities = (state, kit) => {
  const mind = (state.minds || []).find((m) => m.id === kit.mindId) || null;
  const shell = (state.shells || []).find((s) => s.id === kit.shellId) || null;
  const weapon = (state.weapons || []).find((w) => w.id === kit.weaponId) || null;
  const wt = weapon ? getWeaponType(weapon.typeId) : null;
  const baseMight = weapon ? getWeaponMight(weapon.typeId, weapon.rarityId) : 0;

  let sight = EXPEDITION.baseSight;
  let wardstrength = 0;
  let plating = 0;
  let decode = 0;
  (kit.gear || []).forEach((id) => {
    const g = getGearBlueprint(id);
    if (!g) return;
    if (g.stat === 'sight') sight += g.value;
    if (g.stat === 'wardstrength') wardstrength += g.value;
    if (g.stat === 'shellhp') plating += g.value;
    if (g.stat === 'decode') decode += g.value;
  });

  const acuity = mind ? mind.acuity : 0;
  const will = mind ? mind.will : 0;
  sight *= 1 + acuity * EXPEDITION.acuityToSight;
  wardstrength *= 1 + will * EXPEDITION.willToWard;
  const traits = mind ? mind.traits || [] : [];
  if (traits.includes('warded')) wardstrength += 6;
  // Reclaimed "way out" fragments make the whole frontier a little more legible.
  const frags = state.wayOutFragments || 0;
  sight += frags * EXPEDITION.fragmentCapability;
  wardstrength += frags * EXPEDITION.fragmentCapability;

  const prov = kit.provisions || {};
  const lucidVal = (getProvisionType('lucid_draught') || {}).value || 0;
  const startResolve = (mind ? mind.resolve : 0) + (prov.lucid_draught || 0) * lucidVal + (prov.rations || 0) * 5;
  const startShellHp = (shell ? shell.maxHp : 0) + plating;

  return {
    mind,
    shell,
    weapon,
    weaponType: wt,
    might: baseMight,
    sight,
    wardstrength,
    decode,
    startResolve,
    startShellHp,
    traits,
    anchored: traits.includes('anchored'),
    hunter: traits.includes('hunter'),
    clarityCharges: prov.clarity_charge || 0,
  };
};

// Build the encounter list for delving a node (deterministic per seed; the
// combat archetype mod is baked in from the kit's weapon).
export const buildEncounters = (node, tier, caps, seed) => {
  const rng = mulberry32(hashSeed(`${seed}:enc`));
  const p = getNodeThreat(node, tier);
  const archetype = node.archetype || null;
  const bleeds = caps.weaponType && caps.weaponType.bleedsCorruption;
  const corrScale = bleeds ? 0.6 : 1;
  const combatMod = weaponArchetypeMod(caps.weaponType, archetype);
  const enc = [];
  const jit = (v) => v * (0.85 + rng() * 0.3);
  const push = (axis, intensity, n, mod) => {
    for (let k = 0; k < n; k += 1) enc.push({ axis, intensity: jit(intensity), mod });
  };
  switch (node.type) {
    case 'haunt':
      push('combat', p.combat, 3, combatMod);
      push('dread', p.dread, 1);
      if (archetype === 'corruptor') push('corruption', p.corruption * corrScale, 1);
      break;
    case 'cache':
      push('dark', p.dark, 1);
      push('combat', p.combat, 1, 1);
      break;
    case 'echo':
      push('dread', p.dread, 2);
      push('corruption', p.corruption * corrScale, 1);
      break;
    case 'anomaly':
      push('combat', p.combat, 2, combatMod);
      push('dark', p.dark, 1);
      push('dread', p.dread, 1);
      push('corruption', p.corruption * corrScale, 1);
      break;
    case 'gateway':
      push('combat', p.combat, 2, combatMod);
      push('corruption', p.corruption * corrScale, 1);
      push('dread', p.dread, 1);
      break;
    default:
      push('dark', p.dark, 1);
      break;
  }
  enc.forEach((e, i) => { e.at = (i + 1) / (enc.length + 1); });
  return enc;
};

// Lighter encounter list for a Survey at a chosen push depth (0..1).
export const buildSurveyEncounters = (tier, depth, caps, seed) => {
  const rng = mulberry32(hashSeed(`${seed}:sv`));
  const s = (0.4 + depth) * (1 + tier * 0.6);
  const jit = (v) => v * (0.85 + rng() * 0.3);
  const enc = [
    { axis: 'dark', intensity: jit(6 * s) },
    { axis: 'dark', intensity: jit(6 * s) },
    { axis: 'combat', intensity: jit(6 * s), mod: 1 },
    { axis: 'dread', intensity: jit(4 * s) },
  ];
  enc.forEach((e, i) => { e.at = (i + 1) / (enc.length + 1); });
  return enc;
};

// Apply one encounter to a running { shellHp, resolve, corruption } object.
// Returns a short log line. Pure aside from mutating rs.
export const applyEncounter = (rs, e, caps) => {
  const T = e.intensity;
  if (e.axis === 'combat') {
    const eff = (caps.might || 0) * (caps.hunter ? 1.2 : 1) * (e.mod || 1);
    const dmg = Math.max(0, T - eff) + T * 0.1;
    rs.shellHp -= dmg;
    rs.resolve -= Math.max(0, T - eff) * 0.1;
    return dmg > 1 ? `Combat: -${Math.round(dmg)} shell.` : 'Combat: held the line.';
  }
  if (e.axis === 'dark') {
    const sh = Math.max(0, T - (caps.sight || 0));
    rs.resolve -= sh * 0.3;
    return sh > 1 ? `Lost in the dark: -${Math.round(sh * 0.3)} resolve.` : 'Navigated cleanly.';
  }
  if (e.axis === 'dread') {
    const d = T * 0.7 * (caps.anchored ? 0.6 : 1);
    rs.resolve -= d;
    return `Dread presses: -${Math.round(d)} resolve.`;
  }
  if (e.axis === 'corruption') {
    const c = Math.max(0, T - (caps.wardstrength || 0)) * 0.8;
    rs.corruption += c;
    return c > 1 ? `Corruption seeps in: +${Math.round(c)}.` : 'The ward holds.';
  }
  return '';
};

// Deterministically run a kit through its encounters to a final outcome.
export const simulateOutcome = (caps, encounters) => {
  const rs = { shellHp: caps.startShellHp, resolve: caps.startResolve, corruption: 0 };
  let brink = false;
  let brinkAxis = null;
  for (let i = 0; i < encounters.length; i += 1) {
    applyEncounter(rs, encounters[i], caps);
    if ((rs.shellHp <= 0 && rs.resolve <= 0) || rs.corruption >= EXPEDITION.corruptionMax) {
      brink = true;
      brinkAxis = encounters[i].axis;
      break;
    }
  }
  return {
    survived: !brink,
    shellHp: Math.round(rs.shellHp),
    resolve: Math.round(rs.resolve),
    corruption: Math.round(rs.corruption),
    brink,
    brinkAxis,
  };
};

// Pre-launch risk readout: survival band + per-axis worst pressure.
export const computeRisk = (caps, encounters) => {
  const out = simulateOutcome(caps, encounters);
  const axes = { combat: 0, dark: 0, dread: 0, corruption: 0 };
  encounters.forEach((e) => {
    let cover;
    if (e.axis === 'combat') cover = (caps.might || 0) * (caps.hunter ? 1.2 : 1) * (e.mod || 1);
    else if (e.axis === 'dark') cover = caps.sight || 0;
    else if (e.axis === 'corruption') cover = caps.wardstrength || 0;
    else cover = caps.startResolve || 0;
    const pressure = clamp((e.intensity - cover) / Math.max(e.intensity, 1), 0, 1);
    axes[e.axis] = Math.max(axes[e.axis], pressure);
  });
  let band;
  if (!out.survived) band = 'Suicidal';
  else {
    const buffer = Math.min(out.shellHp, out.resolve, EXPEDITION.corruptionMax - out.corruption);
    if (buffer > 25) band = 'Safe';
    else if (buffer > 12) band = 'Risky';
    else band = 'Grave';
  }
  return { ...out, axes, band };
};

// XP curve + leveling. Returns the updated mind and any new traits.
export const xpForLevel = (level) => Math.max(1, level) * EXPEDITION.xpPerLevel;

export const applyMindXP = (mind, xp) => {
  if (!mind) return { mind, leveledTo: null, newTraits: [] };
  const m = { ...mind, xp: (mind.xp || 0) + xp, traits: [...(mind.traits || [])] };
  const startLevel = mind.level;
  const newTraits = [];
  while (m.xp >= xpForLevel(m.level)) {
    m.xp -= xpForLevel(m.level);
    m.level += 1;
    const stats = getMindStats(m.level);
    m.resolve = stats.resolve;
    m.acuity = stats.acuity;
    m.will = stats.will;
    if (MIND_TRAIT_LEVELS.includes(m.level) && m.traits.length < MIND_TRAIT_LEVELS.length) {
      const pool = MIND_TRAITS.filter((t) => !m.traits.includes(t.id));
      if (pool.length) {
        const t = pool[Math.floor(Math.random() * pool.length)];
        m.traits.push(t.id);
        newTraits.push(t.id);
      }
    }
  }
  return { mind: m, leveledTo: m.level !== startLevel ? m.level : null, newTraits };
};

// Build an expedition record (pure; caller applies costs + pushes to state).
export const createExpedition = (state, { kind, kit, node, tier, depth, serial }) => {
  const caps = getKitCapabilities(state, kit);
  const seed = `${serial}_${Date.now()}`;
  let encounters;
  let targetPoint;
  let routeDist;
  let usedDepth = depth || 0;
  if (kind === 'delve' && node) {
    encounters = buildEncounters(node, tier, caps, seed);
    targetPoint = { x: node.x, y: node.y };
    routeDist = Math.hypot(node.x - ENTRY.x, node.y - ENTRY.y) / 181;
    usedDepth = nodeDepth(node);
  } else {
    encounters = buildSurveyEncounters(tier, usedDepth, caps, seed);
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    targetPoint = {
      x: clamp(ENTRY.x + Math.cos(ang) * usedDepth * 90, 10, 118),
      y: clamp(ENTRY.y - usedDepth * 90, 10, 116),
    };
    routeDist = usedDepth;
  }
  const duration = EXPEDITION.baseDurationSec + EXPEDITION.distanceDurationSec * clamp(routeDist, 0, 1);
  return {
    id: `exp_${serial}_${Date.now()}`,
    kind,
    tier,
    seed,
    mindId: kit.mindId,
    shellId: kit.shellId,
    weaponId: kit.weaponId,
    gear: [...(kit.gear || [])],
    nodeId: node ? node.id : null,
    targetPoint,
    caps: {
      might: caps.might,
      sight: caps.sight,
      wardstrength: caps.wardstrength,
      hunter: caps.hunter,
      anchored: caps.anchored,
      startShellHp: caps.startShellHp,
      startResolve: caps.startResolve,
    },
    encounters,
    rs: { shellHp: caps.startShellHp, resolve: caps.startResolve, corruption: 0 },
    progress: 0,
    encIndex: 0,
    duration,
    log: [],
    outcome: null,
    finished: false,
    awaiting: false,
    autoClarity: !!(kit.provisions && (kit.provisions.clarity_charge || 0) > 0),
    depth: usedDepth,
  };
};

// Survival chance when you decline to spend a Clarity Charge at the brink.
export const getLetRideChance = (mind) => {
  const lvl = mind ? mind.level : 1;
  const will = mind ? mind.will : 0;
  return Math.max(0.1, Math.min(0.8, EXPEDITION.letRideBase + lvl * 0.012 + will * 0.006));
};

const SCAR_NAMES = ['Frostbitten', 'Hollow-eyed', 'Trembling', 'Marked', 'Unspooled', 'Half-there'];

/**
 * Apply a single expedition's outcome to a threaded context. Returns the new
 * { minds, chartPages, wayOutFragments } plus deltas to merge. Outcomes:
 *   'success' | 'retreat' (Clarity save) | 'survive' (let-it-ride win, scarred)
 *   | 'death' (permanent loss).
 * Used by both the tick and the brink-resolution action.
 */
export const finalizeExpedition = (ctx, e2, outcome) => {
  let minds = ctx.minds;
  let chartPages = ctx.chartPages;
  let wayOutFragments = ctx.wayOutFragments || 0;
  const resourceDelta = {};
  const materialDelta = {};
  const messages = [];
  const weaponsRemove = [];
  const shellsRemove = [];
  const gearRemove = [];
  const mindsRemove = [];
  let triggerEnding = false;
  const addRes = (k, v) => { resourceDelta[k] = (resourceDelta[k] || 0) + v; };
  const addMat = (id, v) => { materialDelta[id] = (materialDelta[id] || 0) + v; };
  const rates = ctx.rates || {};

  const mind = minds.find((m) => m.id === e2.mindId) || null;
  const desig = mind ? mind.designation : 'A mind';
  const page = chartPages.find((p) => p.tier === e2.tier) || null;

  const markNode = (patch) => {
    if (!page || !e2.nodeId) return;
    chartPages = chartPages.map((p) => (p.tier === e2.tier
      ? { ...p, nodes: p.nodes.map((n) => (n.id === e2.nodeId ? { ...n, ...patch } : n)) }
      : p));
  };
  const appendRoute = (routeOutcome) => {
    if (!page) return;
    const mark = { seed: e2.seed, target: e2.targetPoint, kind: e2.kind, outcome: routeOutcome };
    chartPages = chartPages.map((p) => (p.tier === e2.tier
      ? { ...p, routes: [...(p.routes || []), mark].slice(-40) }
      : p));
  };

  if (outcome === 'success') {
    if (e2.kind === 'delve' && page) {
      const node = page.nodes.find((n) => n.id === e2.nodeId);
      if (node && !node.cleared && !node.looted) {
        const rng = mulberry32(hashSeed(`${e2.seed}:loot`));
        const loot = resolveLoot(rates, getNodeLoot(node, e2.tier, rng));
        Object.entries(loot.resources).forEach(([k, v]) => addRes(k, v));
        Object.entries(loot.materials).forEach(([id, v]) => addMat(id, v));
        markNode({ discovered: true, cleared: true, looted: true });
        const lootStr = formatLoot(loot);
        if (node.type === 'echo') {
          wayOutFragments += 1;
          messages.push(`${desig} read the Echo${lootStr ? ` (${lootStr})` : ''}. A piece of the way out comes loose (${wayOutFragments}/${EXPEDITION.exitFragments}).`);
        } else if (node.type === 'gateway') {
          chartPages = chartPages.map((p) => (p.tier === e2.tier ? { ...p, breached: true } : p));
          wayOutFragments += 1;
          if (wayOutFragments >= EXPEDITION.exitFragments) {
            triggerEnding = true;
            messages.push(`${desig} breached the final Gateway. Beyond it, light. Or something shaped like light.`);
          } else {
            if (!chartPages.some((p) => p.tier === e2.tier + 1)) {
              chartPages = [...chartPages, createChartPage(e2.tier + 1, (page.seed || 1) + 777)];
            }
            messages.push(`${desig} breached the Gateway${lootStr ? ` (${lootStr})` : ''}. A piece of the way out, and a new page of the dark (${wayOutFragments}/${EXPEDITION.exitFragments}).`);
          }
        } else {
          messages.push(`${desig} returned from the ${node.type}: ${lootStr || 'nothing of worth'}.`);
        }
      }
    } else if (e2.kind === 'survey' && page) {
      const cart = mind && (mind.traits || []).includes('cartographer');
      const revealN = 3 + (cart ? 2 : 0);
      const tp = e2.targetPoint || ENTRY;
      const undisc = page.nodes
        .filter((n) => !n.discovered)
        .sort((a, b) => Math.hypot(a.x - tp.x, a.y - tp.y) - Math.hypot(b.x - tp.x, b.y - tp.y));
      const toReveal = undisc.slice(0, revealN).map((n) => n.id);
      if (toReveal.length) {
        chartPages = chartPages.map((p) => (p.tier === e2.tier
          ? { ...p, nodes: p.nodes.map((n) => (toReveal.includes(n.id) ? { ...n, discovered: true } : n)) }
          : p));
      }
      const surveyIntel = Math.ceil(Math.max(rates.intelligence || 0, (EXPEDITION.lootMinRate && EXPEDITION.lootMinRate.intelligence) || 2) * 20 * (1 + e2.tier));
      addRes('intelligence', surveyIntel);
      messages.push(`${desig} surveyed deeper. ${toReveal.length} new site(s) charted (+${surveyIntel} intelligence).`);
    }
    if (mind) {
      const xpGain = (e2.kind === 'delve' ? 60 : 25) * (1 + e2.tier * 0.5) * (1 + e2.depth);
      const res = applyMindXP(mind, Math.round(xpGain));
      minds = minds.map((m) => (m.id === mind.id ? res.mind : m));
      if (res.leveledTo) messages.push(`${desig} reached level ${res.leveledTo}.`);
    }
    appendRoute('success');
  } else if (outcome === 'retreat' || outcome === 'survive') {
    if (mind) {
      const scarred = outcome === 'survive';
      let m = { ...mind };
      if (scarred) {
        const scar = SCAR_NAMES[Math.floor(Math.random() * SCAR_NAMES.length)];
        m.scars = [...(m.scars || []), scar];
      }
      const res = applyMindXP(m, scarred ? 25 : 10);
      minds = minds.map((mm) => (mm.id === mind.id ? res.mind : mm));
    }
    if (e2.kind === 'delve') markNode({ discovered: true });
    appendRoute(outcome === 'survive' ? 'scarred' : 'retreat');
    messages.push(outcome === 'survive'
      ? `${desig} clawed back from the brink, badly scarred, but alive.`
      : `${desig} was pulled out at the brink. The shell is wrecked; the mind survives.`);
  } else if (outcome === 'death') {
    if (mind) mindsRemove.push(mind.id);
    if (e2.weaponId) weaponsRemove.push(e2.weaponId);
    if (e2.shellId) shellsRemove.push(e2.shellId);
    (e2.gear || []).forEach((id) => gearRemove.push(id));
    if (e2.kind === 'delve') markNode({ discovered: true });
    appendRoute('death');
    messages.push(`${desig} did not return. The dark kept the mind, the shell, and all it carried. A marker remains on the chart.`);
  }

  return { minds, chartPages, wayOutFragments, resourceDelta, materialDelta, weaponsRemove, shellsRemove, gearRemove, mindsRemove, messages, triggerEnding };
};

/**
 * Advance every active expedition by dt. Completed expeditions are finalized;
 * an expedition that hits the brink either auto-retreats (if a Clarity Charge
 * was pre-loaded) or PAUSES awaiting the player's choice. Returns a partial
 * state object to MERGE (or null if nothing changed).
 */
export const runExpeditionsTick = (state, dt) => {
  const exps = state.expeditions || [];
  if (exps.length === 0) return null;

  let minds = state.minds || [];
  let chartPages = state.chartPages || [];
  let wayOutFragments = state.wayOutFragments || 0;
  const rates = getIncomeRates(state);
  const resourceDelta = {};
  const materialDelta = {};
  const messages = [];
  const stillActive = [];
  let triggerEnding = false;
  const mergeDelta = (target, src) => { Object.entries(src).forEach(([k, v]) => { target[k] = (target[k] || 0) + v; }); };

  exps.forEach((exp) => {
    // A brink-paused expedition waits for the player; never advance it.
    if (exp.awaiting) { stillActive.push(exp); return; }

    const e2 = { ...exp, rs: { ...exp.rs }, log: exp.log || [] };
    e2.progress = Math.min(1.0001, e2.progress + dt / Math.max(1, e2.duration));
    while (!e2.finished && !e2.awaiting && e2.encIndex < e2.encounters.length && e2.encounters[e2.encIndex].at <= e2.progress) {
      const enc = e2.encounters[e2.encIndex];
      const line = applyEncounter(e2.rs, enc, e2.caps);
      e2.log = [...e2.log, line].slice(-12);
      e2.encIndex += 1;
      if ((e2.rs.shellHp <= 0 && e2.rs.resolve <= 0) || e2.rs.corruption >= EXPEDITION.corruptionMax) {
        if (e2.autoClarity) {
          e2.finished = true;
          e2.outcome = 'retreat';
        } else {
          e2.awaiting = true;
          e2.outcome = 'brink';
        }
      }
    }
    if (!e2.finished && !e2.awaiting && e2.progress >= 1) {
      e2.finished = true;
      e2.outcome = 'success';
    }

    if (e2.awaiting) {
      const m = minds.find((mm) => mm.id === e2.mindId);
      messages.push(`${m ? m.designation : 'A mind'} is at the BRINK. Spend a Clarity Charge to pull them out, or let it ride.`);
      stillActive.push(e2);
      return;
    }
    if (!e2.finished) {
      stillActive.push(e2);
      return;
    }

    const r = finalizeExpedition({ minds, chartPages, wayOutFragments, rates }, e2, e2.outcome);
    minds = r.minds;
    chartPages = r.chartPages;
    wayOutFragments = r.wayOutFragments;
    mergeDelta(resourceDelta, r.resourceDelta);
    mergeDelta(materialDelta, r.materialDelta);
    r.messages.forEach((mm) => messages.push(mm));
    if (r.triggerEnding) triggerEnding = true;
  });

  // Active expeditions advance every tick, so always return the updated list
  // (otherwise in-progress survey/delve progress would be discarded).
  const out = { expeditions: stillActive };
  out.minds = minds;
  out.chartPages = chartPages;
  out.wayOutFragments = wayOutFragments;
  if (triggerEnding) out.triggerEnding = true;
  if (Object.keys(resourceDelta).length) out.resourceDelta = resourceDelta;
  if (Object.keys(materialDelta).length) out.materialDelta = materialDelta;
  if (messages.length) out.messages = messages;
  return out;
};
