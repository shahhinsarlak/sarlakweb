/**
 * Factory sprite generator.
 *
 * Procedurally draws each factory machine as a 64x64 pixel-art sprite with 4
 * animation frames, then writes a compact (RLE, palette-indexed) data module to
 * app/game/factorySpriteData.js. The game decodes this into PXLS-format projects
 * and renders them with the existing PXLS compositeToCanvas (see FactorySprite).
 *
 * Aesthetic: muted slate machine bodies; the only vivid colour is each machine's
 * "material" accent (its power/substrate/output). Run with: node scripts/generateFactorySprites.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SIZE = 64;
const FRAMES = 4;

// Muted body palette (shared). Index 0 is transparent.
const BASE = {
  empty: 0,
  outline: '#23262b',
  bodyDark: '#34383f',
  bodyMid: '#454b54',
  bodyLight: '#565d68',
  panel: '#6b7280',
  floor: '#2b2e33',
};

// Machine accent (vivid material) colours.
const MACHINES = {
  generator: '#9fe8ff',
  extractor: '#c46bff',
  conv_pp: '#ffd24a',
  conv_paper: '#f2efe6',
  conv_lucidity: '#00d0ff',
  conv_intelligence: '#ffd060',
  conv_material: '#6bff9f',
};

const SUBSTRATE = '#c46bff';

// --- colour helpers ---
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};
const rgbToHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (hex, target, t) => {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  return rgbToHex({ r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t });
};
const lighten = (hex, t) => mix(hex, '#ffffff', t);
const darken = (hex, t) => mix(hex, '#000000', t);

// Build a per-sprite palette (array of hex; index 0 reserved for transparent).
const buildPalette = (accent) => [
  null, // 0 = empty
  BASE.outline, // 1
  BASE.bodyDark, // 2
  BASE.bodyMid, // 3
  BASE.bodyLight, // 4
  BASE.panel, // 5
  BASE.floor, // 6
  darken(accent, 0.35), // 7 accentDark
  accent, // 8 accent
  lighten(accent, 0.35), // 9 accentLight
  lighten(accent, 0.7), // 10 accentBright
  darken(SUBSTRATE, 0.3), // 11 substrateDark
  SUBSTRATE, // 12 substrate
  lighten(SUBSTRATE, 0.4), // 13 substrateLight
];
const P = {
  empty: 0, outline: 1, bodyDark: 2, bodyMid: 3, bodyLight: 4, panel: 5, floor: 6,
  accentDark: 7, accent: 8, accentLight: 9, accentBright: 10,
  subDark: 11, sub: 12, subLight: 13,
};

// --- grid drawing ---
const newGrid = () => new Array(SIZE * SIZE).fill(0);
const inb = (x, y) => x >= 0 && x < SIZE && y >= 0 && y < SIZE;
const put = (g, x, y, ci) => { if (inb(x, y)) g[y * SIZE + x] = ci; };
const rect = (g, x, y, w, h, ci) => {
  for (let j = 0; j < h; j += 1) for (let i = 0; i < w; i += 1) put(g, x + i, y + j, ci);
};
// Filled rect with a 1px outline colour.
const panel = (g, x, y, w, h, fill, line) => {
  rect(g, x, y, w, h, fill);
  for (let i = 0; i < w; i += 1) { put(g, x + i, y, line); put(g, x + i, y + h - 1, line); }
  for (let j = 0; j < h; j += 1) { put(g, x, y + j, line); put(g, x + w - 1, y + j, line); }
};
const disc = (g, cx, cy, r, ci) => {
  for (let y = -r; y <= r; y += 1) for (let x = -r; x <= r; x += 1) {
    if (x * x + y * y <= r * r) put(g, cx + x, cy + y, ci);
  }
};
const ring = (g, cx, cy, r, ci) => {
  for (let a = 0; a < 360; a += 6) {
    const x = Math.round(cx + Math.cos(a * Math.PI / 180) * r);
    const y = Math.round(cy + Math.sin(a * Math.PI / 180) * r);
    put(g, x, y, ci);
  }
};

// Shared floor shadow at the base of every machine.
const drawFloor = (g) => {
  for (let x = 10; x < 54; x += 1) {
    put(g, x, 59, P.floor);
    if (x > 13 && x < 51) put(g, x, 60, P.floor);
  }
};

// pulse index cycles accent shades for a soft glow over the 4 frames.
const pulse = (frame) => [P.accent, P.accentLight, P.accentBright, P.accentLight][frame % 4];

// --- per-machine drawing (returns a 64x64 grid for the given frame) ---
const drawGenerator = (frame) => {
  const g = newGrid();
  drawFloor(g);
  // Housing
  panel(g, 18, 20, 28, 36, P.bodyMid, P.outline);
  rect(g, 20, 22, 24, 6, P.bodyLight);
  // Vents
  for (let i = 0; i < 4; i += 1) rect(g, 22 + i * 5, 32, 3, 14, P.bodyDark);
  // Core
  const core = pulse(frame);
  disc(g, 32, 30, 4, P.accentDark);
  disc(g, 32, 30, 3, core);
  // Energy bolts up the sides, animated
  const off = frame % 4;
  for (let k = 0; k < 3; k += 1) {
    const yy = 24 + ((k * 6 + off * 3) % 30);
    put(g, 16, yy, P.accentLight); put(g, 17, yy + 1, P.accent);
    put(g, 47, yy, P.accentLight); put(g, 46, yy + 1, P.accent);
  }
  // Feet
  rect(g, 18, 55, 4, 3, P.bodyDark); rect(g, 42, 55, 4, 3, P.bodyDark);
  return g;
};

const drawExtractor = (frame) => {
  const g = newGrid();
  drawFloor(g);
  // Derrick legs
  for (let y = 18; y < 56; y += 1) {
    const spread = Math.round(((y - 18) / 38) * 10);
    put(g, 26 - spread, y, P.bodyMid);
    put(g, 38 + spread, y, P.bodyMid);
  }
  // Cross braces
  for (let y = 24; y < 54; y += 8) {
    for (let x = 22; x < 42; x += 1) put(g, x, y, P.bodyDark);
  }
  // Top housing
  panel(g, 24, 12, 16, 10, P.bodyLight, P.outline);
  // Central shaft + rising substrate, animated upward
  for (let y = 20; y < 56; y += 1) put(g, 32, y, P.bodyDark);
  for (let k = 0; k < 5; k += 1) {
    const yy = 54 - ((k * 7 + frame * 3) % 34);
    const c = k % 2 === 0 ? P.sub : P.subLight;
    put(g, 31, yy, c); put(g, 32, yy, P.subLight); put(g, 33, yy, c);
  }
  // Drill bit
  disc(g, 32, 56, 3, P.subDark);
  put(g, 32, 59, P.sub);
  return g;
};

const drawConverter = (frame) => {
  const g = newGrid();
  drawFloor(g);
  // Main body
  panel(g, 16, 24, 32, 30, P.bodyMid, P.outline);
  rect(g, 18, 26, 28, 4, P.bodyLight);
  // Hopper (substrate input) on top-left
  panel(g, 18, 14, 12, 10, P.bodyDark, P.outline);
  // Substrate falling into hopper, animated down
  for (let k = 0; k < 3; k += 1) {
    const yy = 8 + ((k * 4 + frame * 2) % 12);
    put(g, 23, yy, P.sub); put(g, 24, yy + 1, P.subLight);
  }
  // Output chute on the right with a pulsing orb (the produced material)
  rect(g, 46, 38, 8, 6, P.bodyDark);
  const core = pulse(frame);
  disc(g, 50, 41, 3, P.accentDark);
  disc(g, 50, 41, 2, core);
  // Output stream, animated outward
  for (let k = 0; k < 3; k += 1) {
    const xx = 54 + ((k * 3 + frame * 2) % 9);
    put(g, xx, 41, P.accentLight);
  }
  // Gauge dial that ticks each frame
  ring(g, 28, 40, 6, P.bodyDark);
  const ang = (frame / FRAMES) * Math.PI * 2 - Math.PI / 2;
  put(g, Math.round(28 + Math.cos(ang) * 4), Math.round(40 + Math.sin(ang) * 4), P.accent);
  disc(g, 28, 40, 1, P.accentLight);
  // Feet
  rect(g, 17, 53, 4, 3, P.bodyDark); rect(g, 43, 53, 4, 3, P.bodyDark);
  return g;
};

const DRAW = {
  generator: drawGenerator,
  extractor: drawExtractor,
  conv_pp: drawConverter,
  conv_paper: drawConverter,
  conv_lucidity: drawConverter,
  conv_intelligence: drawConverter,
  conv_material: drawConverter,
};

// RLE encode a grid: [ [index, count], ... ]
const encode = (grid) => {
  const out = [];
  let prev = grid[0];
  let count = 1;
  for (let i = 1; i < grid.length; i += 1) {
    if (grid[i] === prev) { count += 1; }
    else { out.push([prev, count]); prev = grid[i]; count = 1; }
  }
  out.push([prev, count]);
  return out;
};

const sprites = {};
for (const [id, accent] of Object.entries(MACHINES)) {
  const frames = [];
  for (let f = 0; f < FRAMES; f += 1) frames.push(encode(DRAW[id](f)));
  sprites[id] = {
    size: SIZE,
    fps: 4,
    // Vivid accent indices (7..10) glow softly; rendered via the PXLS glow effect.
    glowIndices: [8, 9, 10],
    palette: buildPalette(accent),
    frames,
  };
}

const header = `/**
 * Factory sprite data (generated by scripts/generateFactorySprites.mjs).
 *
 * Each machine: { size, fps, glowIndices, palette[], frames[] }. A frame is RLE
 * pairs [paletteIndex, count] over a size*size row-major grid; palette index 0 is
 * transparent. Decoded into a PXLS project and drawn by FactorySprite.js.
 *
 * Do not edit by hand; re-run the generator. Or open a converted project in /pxls.
 */
`;

const body = `export const FACTORY_SPRITES = ${JSON.stringify(sprites)};\n`;

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, '..', 'app', 'game', 'factorySpriteData.js');
writeFileSync(outPath, header + body);
const bytes = Buffer.byteLength(header + body);
console.log(`Wrote ${outPath} (${(bytes / 1024).toFixed(1)} KB, ${Object.keys(sprites).length} machines x ${FRAMES} frames)`);
