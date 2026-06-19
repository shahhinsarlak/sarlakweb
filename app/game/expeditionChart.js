/**
 * Expedition chart generation (Chapter 2, Phase B).
 *
 * A chart "page" is a 128x128 logical grid = one depth tier. Pages are generated
 * deterministically from a seed (so the same page always lays out the same), but
 * the mutable exploration state (discovered/cleared/looted) lives on the stored
 * node objects. Distance from the entry = local depth, which scales danger and
 * loot. Routes are visual only and generated from a seed in the renderer.
 */

import { EXPEDITION } from './constants';

export const PAGE_SIZE = 128;
export const ENTRY = { x: 64, y: 116 };

// Plan of node types per page (a single hidden Gateway leads deeper).
const NODE_PLAN = [
  ['cache', 4],
  ['haunt', 3],
  ['echo', 2],
  ['anomaly', 1],
  ['gateway', 1],
];

const FOE_IDS = ['swarm', 'bulwark', 'flicker', 'phantom', 'corruptor'];

// --- Seeded RNG (mulberry32) ---------------------------------------------

export const hashSeed = (n) => {
  let h = 2166136261;
  const s = String(n);
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// --- Page generation ------------------------------------------------------

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Build a chart page for a tier. Nodes are scattered with a depth gradient:
 * the Gateway sits near the far (top) edge; everything else fills the middle.
 */
export const createChartPage = (tier, seed) => {
  const rng = mulberry32(hashSeed(`${seed}:${tier}`));
  const nodes = [];
  let counter = 0;

  const place = (yMin, yMax) => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const x = 14 + Math.floor(rng() * (PAGE_SIZE - 28));
      const y = yMin + Math.floor(rng() * (yMax - yMin));
      const p = { x, y };
      if (dist(p, ENTRY) < 22) continue;
      if (nodes.every((n) => dist(n, p) > 18)) return p;
    }
    return { x: 14 + Math.floor(rng() * (PAGE_SIZE - 28)), y: yMin + Math.floor(rng() * (yMax - yMin)) };
  };

  let gatewayId = null;
  NODE_PLAN.forEach(([type, count]) => {
    for (let i = 0; i < count; i += 1) {
      counter += 1;
      const id = `t${tier}_${type}_${counter}`;
      const pos = type === 'gateway' ? place(10, 30) : place(28, 104);
      const node = {
        id,
        type,
        x: pos.x,
        y: pos.y,
        discovered: false,
        cleared: false,
        looted: false,
      };
      if (type === 'haunt') node.archetype = FOE_IDS[Math.floor(rng() * FOE_IDS.length)];
      if (type === 'anomaly') node.archetype = FOE_IDS[Math.floor(rng() * FOE_IDS.length)];
      if (type === 'gateway') gatewayId = id;
      nodes.push(node);
    }
  });

  return { tier, seed, nodes, gatewayId, breached: false };
};

// Local depth of a node within its page (0 at entry .. ~1 at the far edge).
export const nodeDepth = (node) => Math.max(0, Math.min(1, (ENTRY.y - node.y) / ENTRY.y));

// Threat profile (per axis) for a node, scaled by local depth and tier.
export const getNodeThreat = (node, tier) => {
  const depth = nodeDepth(node);
  const s = (0.55 + depth) * (1 + tier * 0.6);
  const corruptor = node.archetype === 'corruptor';
  switch (node.type) {
    case 'haunt':
      return { combat: 14 * s, dark: 4 * s, dread: 4 * s, corruption: (corruptor ? 12 : 4) * s };
    case 'cache':
      return { combat: 5 * s, dark: 8 * s, dread: 2 * s, corruption: 2 * s };
    case 'echo':
      return { combat: 2 * s, dark: 5 * s, dread: 12 * s, corruption: 8 * s };
    case 'anomaly':
      return { combat: 12 * s, dark: 10 * s, dread: 10 * s, corruption: 12 * s };
    case 'gateway':
      return { combat: 16 * s, dark: 6 * s, dread: 8 * s, corruption: 14 * s };
    default:
      return { combat: 4 * s, dark: 4 * s, dread: 4 * s, corruption: 4 * s };
  }
};

// The dimensional core a Gateway on this tier consumes when breached.
export const getGatewayCore = (tier) => {
  const cores = EXPEDITION.tierCores;
  return cores[Math.min(tier + 1, cores.length - 1)];
};

// Loot from successfully delving a node. Soft-currency rewards are expressed as
// SECONDS of the player's income (resolved against current income at finalize
// time, so they auto-scale like costs); dimensional materials stay absolute
// (their scarcity is the point).
export const getNodeLoot = (node, tier, rng) => {
  const depth = nodeDepth(node);
  const mag = (1 + depth) * (1 + tier * 0.8);
  const r = rng || Math.random;
  const loot = { resourceSec: {}, materials: {} };
  const addSec = (k, s) => { loot.resourceSec[k] = (loot.resourceSec[k] || 0) + s; };
  const addMat = (id, v) => { loot.materials[id] = (loot.materials[id] || 0) + Math.max(1, Math.round(v)); };
  const cores = EXPEDITION.tierCores;
  const tierMat = cores[Math.min(tier + 1, cores.length - 1)];

  switch (node.type) {
    case 'cache':
      addSec('pp', 90 * mag * (0.7 + r()));
      addSec('paper', 60 * mag);
      addMat(tierMat, 1 + Math.floor(r() * 2 * mag));
      break;
    case 'haunt':
      addMat(tierMat, 2 + Math.floor(r() * 3 * mag));
      addSec('lucidity', 75 * mag);
      break;
    case 'echo':
      addSec('intelligence', 90 * mag * (0.8 + r()));
      break;
    case 'anomaly': {
      const rareMat = cores[Math.min(tier + 2, cores.length - 1)];
      addMat(rareMat, 1 + Math.floor(r() * 2));
      addSec('lucidity', 110 * mag);
      addSec('intelligence', 110 * mag);
      break;
    }
    case 'gateway':
      addSec('intelligence', 90 * mag);
      break;
    default:
      break;
  }
  return loot;
};
