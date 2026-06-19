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
  EXPEDITION,
  ROLL_PITY_THRESHOLD,
} from './constants';

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

// PP + core cost to craft a physical copy of an owned weapon blueprint.
export const getWeaponCraftCost = (typeId, rarityId) => {
  const type = getWeaponType(typeId);
  const ri = Math.max(0, rarityIndex(rarityId));
  return {
    pp: 150 + ri * 150,
    core: type ? type.craftCore : 'static_crystal',
    coreQty: 1 + ri,
  };
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

export const getPrintCost = (tierId) => {
  const tier = getPrintTier(tierId);
  const cost = {};
  Object.entries(EXPEDITION.printBase).forEach(([res, amt]) => {
    cost[res] = Math.round(amt * tier.costMult);
  });
  return cost;
};

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
