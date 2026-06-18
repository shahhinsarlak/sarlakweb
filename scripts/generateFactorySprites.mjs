/**
 * Factory sprite generator (Phase B: 128x128, office-junk aesthetic).
 *
 * Each machine looks cobbled together from things around the office. It has an
 * animated base (4 frames) plus up to three static ATTACHMENT overlays that turn
 * on as the player buys that machine's "visual" milestone upgrades (levels 3, 6,
 * 10 — matching the visual:true flags in FACTORY_UPGRADES).
 *
 * Output: app/game/factorySpriteData.js. Per machine:
 *   { size, fps, glowIndices, palette[], baseFrames[rle x4], attachments[{atLevel, cells:rle}] }
 * Frames/attachments are RLE [paletteIndex, count] over a size*size grid; index 0
 * is transparent. Decoded into PXLS projects and drawn by FactorySprite.js.
 *
 * Run: node scripts/generateFactorySprites.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SIZE = 128;
const FRAMES = 4;
const ATTACH_LEVELS = [3, 6, 10];

const MACHINES = {
  generator: '#9fe8ff',
  capacitor: '#ffe08a',
  extractor: '#c46bff',
  conv_pp: '#ffd24a',
  conv_paper: '#f2efe6',
  conv_lucidity: '#00d0ff',
  conv_intelligence: '#ffd060',
  conv_material: '#6bff9f',
  transmuter: '#b4b4c4',
  overclocker: '#ff8a5c',
};

// --- colour helpers ---
const hexToRgb = (hex) => { const n = parseInt(hex.replace('#', ''), 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; };
const toHex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const x = hexToRgb(a); const y = hexToRgb(b); return toHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t }); };
const lighten = (h, t) => mix(h, '#ffffff', t);
const darken = (h, t) => mix(h, '#000000', t);

// Shared palette (index 0 transparent). Accent shades fill 19-22 per machine.
const buildPalette = (accent) => [
  null,            // 0 empty
  '#1b1e23',       // 1 outline
  '#33373e',       // 2 metalDark
  '#474d57',       // 3 metalMid
  '#5c636f',       // 4 metalLight
  '#79818d',       // 5 metalHi
  '#5f5849',       // 6 plasticDark (beige/printer)
  '#867c69',       // 7 plastic
  '#a89c84',       // 8 plasticHi
  '#0d1014',       // 9 screenDark
  '#243041',       // 10 screenLit
  '#202022',       // 11 cable/rubber
  '#46362a',       // 12 woodDark
  '#6a5640',       // 13 wood
  '#3c6342',       // 14 plantDark
  '#5c8c50',       // 15 plantHi
  '#cfd0c8',       // 16 white/paper
  '#272a30',       // 17 panelInset
  '#23262b',       // 18 floor shadow
  darken(accent, 0.4),  // 19 accentDark
  accent,               // 20 accent
  lighten(accent, 0.35),// 21 accentLight
  lighten(accent, 0.7), // 22 accentBright
  '#7a4fd0',       // 23 substrateDark
  '#c46bff',       // 24 substrate
  '#e0b3ff',       // 25 substrateLight
  '#3a4d5e',       // 26 glass (bottle)
  '#587089',       // 27 glassHi
];
const P = {
  empty: 0, outline: 1, metalDark: 2, metalMid: 3, metalLight: 4, metalHi: 5,
  plasticDark: 6, plastic: 7, plasticHi: 8, screenDark: 9, screenLit: 10,
  cable: 11, woodDark: 12, wood: 13, plantDark: 14, plantHi: 15, white: 16,
  inset: 17, floor: 18, accentDark: 19, accent: 20, accentLight: 21, accentBright: 22,
  subDark: 23, sub: 24, subLight: 25, glass: 26, glassHi: 27,
};

// --- grid + primitives ---
const newGrid = () => new Array(SIZE * SIZE).fill(0);
const inb = (x, y) => x >= 0 && x < SIZE && y >= 0 && y < SIZE;
const put = (g, x, y, c) => { if (inb(x | 0, y | 0)) g[(y | 0) * SIZE + (x | 0)] = c; };
const rect = (g, x, y, w, h, c) => { for (let j = 0; j < h; j += 1) for (let i = 0; i < w; i += 1) put(g, x + i, y + j, c); };
const hline = (g, x, y, w, c) => { for (let i = 0; i < w; i += 1) put(g, x + i, y, c); };
const vline = (g, x, y, h, c) => { for (let j = 0; j < h; j += 1) put(g, x, y + j, c); };
const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y += 1) for (let x = -r; x <= r; x += 1) if (x * x + y * y <= r * r) put(g, cx + x, cy + y, c); };
const ring = (g, cx, cy, r, c) => { for (let a = 0; a < 360; a += 4) put(g, Math.round(cx + Math.cos(a * Math.PI / 180) * r), Math.round(cy + Math.sin(a * Math.PI / 180) * r), c); };
const line = (g, x0, y0, x1, y1, c) => { const dx = Math.abs(x1 - x0); const dy = Math.abs(y1 - y0); const sx = x0 < x1 ? 1 : -1; const sy = y0 < y1 ? 1 : -1; let err = dx - dy; let x = x0; let y = y0; for (;;) { put(g, x, y, c); if (x === x1 && y === y1) break; const e2 = 2 * err; if (e2 > -dy) { err -= dy; x += sx; } if (e2 < dx) { err += dx; y += sy; } } };

// Outlined, shaded box (top/left highlight, bottom/right shadow).
const box = (g, x, y, w, h, fill, hi, lo) => {
  rect(g, x, y, w, h, fill);
  for (let i = 0; i < w; i += 1) { put(g, x + i, y, P.outline); put(g, x + i, y + h - 1, P.outline); }
  for (let j = 0; j < h; j += 1) { put(g, x, y + j, P.outline); put(g, x + w - 1, y + j, P.outline); }
  for (let i = 1; i < w - 1; i += 1) { put(g, x + i, y + 1, hi); put(g, x + i, y + h - 2, lo); }
  for (let j = 1; j < h - 1; j += 1) { put(g, x + 1, y + j, hi); put(g, x + w - 2, y + j, lo); }
};
// Vertical cylinder (bottle/can) between x..x+w.
const cylinder = (g, x, y, w, h, dark, mid, hi) => {
  for (let j = 0; j < h; j += 1) for (let i = 0; i < w; i += 1) {
    const t = i / (w - 1);
    let c = mid; if (t < 0.18) c = dark; else if (t > 0.82) c = darken(mid, 0); // placeholder
    put(g, x + i, y + j, t < 0.2 ? dark : t > 0.78 ? hi : mid);
  }
  vline(g, x, y, h, P.outline); vline(g, x + w - 1, y, h, P.outline);
};
const screen = (g, x, y, w, h, frame) => {
  box(g, x, y, w, h, P.screenDark, P.metalDark, P.outline);
  // flickering static (a few lit pixels shift per frame)
  for (let j = 2; j < h - 2; j += 1) for (let i = 2; i < w - 2; i += 1) {
    if (((i * 7 + j * 13 + frame * 17) % 11) === 0) put(g, x + i, y + j, P.screenLit);
  }
};

const floorShadow = (g) => { for (let x = 16; x < 112; x += 1) { put(g, x, 116, P.floor); if (x > 22 && x < 106) put(g, x, 117, P.floor); } };
const pulse = (f) => [P.accent, P.accentLight, P.accentBright, P.accentLight][f % 4];

// fan blades (rotating) inside radius r at cx,cy
const fan = (g, cx, cy, r, frame, c) => {
  disc(g, cx, cy, r, P.metalDark);
  ring(g, cx, cy, r, P.outline);
  const base = (frame / FRAMES) * Math.PI * 2;
  for (let b = 0; b < 3; b += 1) {
    const a = base + b * (Math.PI * 2 / 3);
    line(g, cx, cy, Math.round(cx + Math.cos(a) * (r - 2)), Math.round(cy + Math.sin(a) * (r - 2)), c);
    line(g, cx, cy, Math.round(cx + Math.cos(a + 0.3) * (r - 3)), Math.round(cy + Math.sin(a + 0.3) * (r - 3)), c);
  }
  disc(g, cx, cy, 2, P.metalHi);
};

// ---------------- BASE SPRITES ----------------
const baseGenerator = (f) => {
  const g = newGrid(); floorShadow(g);
  box(g, 30, 30, 68, 78, P.metalMid, P.metalHi, P.metalDark); // vending-panel housing
  box(g, 34, 34, 60, 14, P.inset, P.metalDark, P.outline); // top vent
  for (let i = 0; i < 6; i += 1) vline(g, 38 + i * 9, 36, 10, P.metalDark);
  fan(g, 50, 70, 14, f, P.metalLight); // two desk fans
  fan(g, 80, 70, 14, (f + 2) % FRAMES, P.metalLight);
  // core light + arcs
  disc(g, 65, 96, 5, P.accentDark); disc(g, 65, 96, 3, pulse(f));
  for (let k = 0; k < 3; k += 1) { const y = 50 + ((k * 8 + f * 4) % 50); put(g, 28, y, P.accentLight); put(g, 29, y + 1, P.accent); put(g, 99, y, P.accentLight); put(g, 98, y + 1, P.accent); }
  // coiled extension cord
  for (let i = 0; i < 30; i += 1) put(g, 36 + i, 104 + Math.round(Math.sin(i / 2) * 2), P.cable);
  rect(g, 30, 104, 4, 4, P.metalDark); rect(g, 94, 104, 4, 4, P.metalDark);
  return g;
};
const baseCapacitor = (f) => {
  const g = newGrid(); floorShadow(g);
  box(g, 40, 28, 48, 84, P.metalMid, P.metalHi, P.metalDark); // filing cabinet
  for (let d = 0; d < 3; d += 1) { box(g, 43, 32 + d * 26, 42, 24, P.metalMid, P.metalHi, P.metalDark); rect(g, 58, 42 + d * 26, 12, 3, P.metalDark); } // drawers + handles
  // open top drawer reveals battery cells
  rect(g, 46, 34, 36, 8, P.inset);
  for (let i = 0; i < 6; i += 1) box(g, 47 + i * 6, 34, 5, 8, P.accentDark, P.accent, P.outline);
  // charge meter (vertical segments fill bottom-up, animated)
  box(g, 90, 36, 8, 70, P.inset, P.metalDark, P.outline);
  const lit = 1 + (f % 6);
  for (let s = 0; s < 6; s += 1) { const y = 98 - s * 11; rect(g, 92, y, 4, 8, s < lit ? (s === lit - 1 ? P.accentBright : P.accent) : P.metalDark); }
  return g;
};
const baseExtractor = (f) => {
  const g = newGrid(); floorShadow(g);
  // frame legs
  for (let y = 40; y < 110; y += 1) { const s = Math.round(((y - 40) / 70) * 14); put(g, 44 - s, y, P.metalMid); put(g, 84 + s, y, P.metalMid); }
  for (let y = 52; y < 104; y += 14) hline(g, 40, y, 48, P.metalDark);
  // inverted water-cooler bottle (glass, blue) at top
  box(g, 54, 22, 22, 8, P.glass, P.glassHi, P.outline); // cap
  for (let j = 0; j < 24; j += 1) for (let i = 0; i < 26; i += 1) put(g, 51 + i, 30 + j, i < 5 ? P.glass : i > 20 ? P.glassHi : mixGlass(i)); 
  // substrate level inside bottle
  rect(g, 54, 46, 20, 6, P.sub);
  // central shaft + rising substrate
  vline(g, 64, 54, 54, P.metalDark);
  for (let k = 0; k < 6; k += 1) { const y = 104 - ((k * 9 + f * 4) % 50); put(g, 63, y, P.sub); put(g, 64, y, P.subLight); put(g, 65, y, P.sub); }
  // drill bit (rotating-ish triangle)
  for (let j = 0; j < 8; j += 1) { const w = 8 - j; rect(g, 64 - Math.ceil(w / 2), 104 + j, w, 1, j % 2 === ((f) % 2) ? P.subLight : P.subDark); }
  return g;
};
function mixGlass(i) { return P.glass; }

const baseConverterBody = (g, accent) => {
  box(g, 26, 44, 76, 64, P.metalMid, P.metalHi, P.metalDark); // chassis
  box(g, 30, 48, 68, 8, P.inset, P.metalDark, P.outline); // top slot
};
const baseConvPP = (f) => {
  const g = newGrid(); floorShadow(g); baseConverterBody(g, MACHINES.conv_pp);
  // stapler on top (arm chunks down)
  const down = (f % 2);
  box(g, 40, 30 - (down ? 0 : 4), 36, 8, P.accentDark, P.accent, P.outline); // stapler arm
  box(g, 40, 38, 36, 6, P.metalDark, P.metalLight, P.outline); // base
  // keyboard
  box(g, 32, 92, 40, 12, P.metalDark, P.metalLight, P.outline);
  for (let r = 0; r < 2; r += 1) for (let c = 0; c < 9; c += 1) rect(g, 35 + c * 4, 94 + r * 5, 3, 3, P.metalMid);
  // in-tray with paper
  box(g, 78, 84, 22, 20, P.metalMid, P.metalHi, P.metalDark);
  rect(g, 81, 80 - (f % 2), 16, 8, P.white); // a sheet flying up
  // gauge
  ring(g, 60, 70, 9, P.metalDark); const a = (f / FRAMES) * Math.PI * 2 - Math.PI / 2; put(g, Math.round(60 + Math.cos(a) * 6), Math.round(70 + Math.sin(a) * 6), pulse(f)); disc(g, 60, 70, 2, P.accent);
  return g;
};
const baseConvPaper = (f) => {
  const g = newGrid(); floorShadow(g);
  box(g, 24, 40, 80, 56, P.plastic, P.plasticHi, P.plasticDark); // printer body
  box(g, 30, 36, 68, 8, P.plasticDark, P.plastic, P.outline); // lid
  // paper feeding out of front slot (moves down per frame)
  rect(g, 40, 92, 48, 3, P.metalDark);
  for (let k = 0; k < 3; k += 1) rect(g, 44, 96 + ((k * 6 + f * 3) % 18), 40, 4, P.white);
  // roller (spins: shifting dashes)
  for (let i = 0; i < 30; i += 1) put(g, 38 + i, 70, (i + f) % 3 === 0 ? P.accent : P.metalDark);
  ring(g, 36, 70, 4, P.metalLight); ring(g, 92, 70, 4, P.metalLight);
  // toner drum (accent)
  box(g, 78, 50, 18, 12, P.accentDark, P.accent, P.outline);
  // control LEDs
  for (let i = 0; i < 3; i += 1) disc(g, 32 + i * 5, 50, 1, i === (f % 3) ? P.accentBright : P.metalDark);
  return g;
};
const baseConvLucidity = (f) => {
  const g = newGrid(); floorShadow(g);
  box(g, 30, 64, 44, 44, P.metalMid, P.metalHi, P.metalDark); // humidifier base
  disc(g, 52, 64, 14, P.metalLight); ring(g, 52, 64, 14, P.outline); disc(g, 52, 64, 6, P.inset); // top vent
  // rising mist (accent), animated
  for (let k = 0; k < 7; k += 1) { const y = 60 - ((k * 7 + f * 5) % 44); const x = 52 + Math.round(Math.sin((y + f) / 6) * 6); put(g, x, y, P.accentLight); put(g, x + 1, y, P.accent); }
  // desk lamp (angled) glowing
  line(g, 82, 104, 82, 60, P.metalDark); line(g, 82, 60, 96, 50, P.metalDark);
  disc(g, 98, 49, 5, P.accentDark); disc(g, 98, 49, 3, pulse(f));
  // plant
  box(g, 30, 96, 14, 12, P.wood, P.plasticHi, P.woodDark);
  for (let b = 0; b < 5; b += 1) line(g, 37, 96, 30 + b * 4, 84 - (b % 2) * 4, P.plantDark);
  disc(g, 33, 84, 3, P.plantHi); disc(g, 41, 86, 3, P.plantHi); disc(g, 37, 80, 3, P.plantHi);
  return g;
};
const baseConvIntelligence = (f) => {
  const g = newGrid(); floorShadow(g);
  // 2x2 monitor cube
  screen(g, 34, 38, 30, 30, f);
  screen(g, 66, 38, 30, 30, (f + 1) % FRAMES);
  screen(g, 34, 70, 30, 30, (f + 2) % FRAMES);
  screen(g, 66, 70, 30, 30, (f + 3) % FRAMES);
  // server fan in centre seam
  fan(g, 65, 69, 7, f, P.accentLight);
  // accent power light
  disc(g, 65, 104, 3, pulse(f));
  return g;
};
const baseConvMaterial = (f) => {
  const g = newGrid(); floorShadow(g);
  box(g, 28, 44, 72, 60, P.metalMid, P.metalHi, P.metalDark); // microwave body
  box(g, 34, 50, 44, 48, P.screenDark, P.metalDark, P.outline); // window
  // material crystal inside, pulsing/compressing
  const r = 6 + (f % 2) * 2;
  disc(g, 56, 74, r, P.accentDark); disc(g, 56, 74, r - 2, pulse(f));
  // compression rings
  ring(g, 56, 74, 12 - (f % 3) * 2, P.accentLight);
  // control panel + magnet
  box(g, 82, 50, 14, 48, P.inset, P.metalDark, P.outline);
  for (let i = 0; i < 4; i += 1) disc(g, 89, 56 + i * 8, 1, i === (f % 4) ? P.accentBright : P.metalLight);
  // horseshoe magnet bottom
  ring(g, 56, 100, 7, P.accentDark); rect(g, 50, 100, 4, 8, P.accent); rect(g, 59, 100, 4, 8, P.metalLight);
  return g;
};

const baseTransmuter = (f) => {
  const g = newGrid(); floorShadow(g);
  // Funnel on top with grey Void Fragments pouring in
  for (let j = 0; j < 10; j += 1) { const w = Math.round(24 - j * 1.6); rect(g, 64 - (w >> 1), 24 + j, w, 1, j % 2 ? P.metalLight : P.metalDark); }
  for (let k = 0; k < 3; k += 1) { const y = 12 + ((k * 4 + f * 2) % 12); put(g, 63, y, P.metalDark); put(g, 64, y + 1, P.metalHi); put(g, 65, y, P.metalDark); }
  // Main vessel + window
  box(g, 34, 44, 60, 60, P.metalMid, P.metalHi, P.metalDark);
  box(g, 40, 50, 30, 30, P.screenDark, P.metalDark, P.outline);
  // Swirling transmutation inside (accent = target colour at render)
  const r = 6 + (f % 2) * 2;
  disc(g, 55, 65, r, P.accentDark); disc(g, 55, 65, r - 2, pulse(f));
  ring(g, 55, 65, 11 - (f % 3) * 2, P.accentLight);
  // Output spout + crystal on the right
  rect(g, 86, 70, 10, 6, P.metalDark);
  disc(g, 92, 73, 4, P.accentDark); disc(g, 92, 73, 2, pulse(f));
  for (let k = 0; k < 3; k += 1) { const x = 96 + ((k * 3 + f * 2) % 9); put(g, x, 73, P.accentLight); }
  // Heat flicker at the base
  for (let i = 0; i < 6; i += 1) { const fh = 2 + ((i + f) % 3); rect(g, 40 + i * 8, 104 - fh, 4, fh, (i + f) % 2 ? P.accent : P.accentDark); }
  rect(g, 36, 102, 4, 4, P.metalDark); rect(g, 88, 102, 4, 4, P.metalDark);
  return g;
};

const baseOverclocker = (f) => {
  const g = newGrid(); floorShadow(g);
  // Cooling fins on top
  for (let i = 0; i < 8; i += 1) rect(g, 32 + i * 8, 28, 5, 12, i % 2 ? P.metalDark : P.metalLight);
  box(g, 28, 40, 72, 66, P.metalMid, P.metalHi, P.metalDark); // regulator unit
  // Big gauge dial with a sweeping needle
  disc(g, 54, 70, 18, P.inset); ring(g, 54, 70, 18, P.outline);
  for (let a = -120; a <= 120; a += 30) {
    const rad = a * Math.PI / 180 - Math.PI / 2;
    put(g, Math.round(54 + Math.cos(rad) * 16), Math.round(70 + Math.sin(rad) * 16), P.metalHi);
  }
  const ang = (-120 + (f / FRAMES) * 240) * Math.PI / 180 - Math.PI / 2;
  line(g, 54, 70, Math.round(54 + Math.cos(ang) * 14), Math.round(70 + Math.sin(ang) * 14), pulse(f));
  disc(g, 54, 70, 3, P.accent);
  // Digital readout
  box(g, 80, 50, 16, 20, P.screenDark, P.metalDark, P.outline);
  for (let k = 0; k < 4; k += 1) rect(g, 82, 65 - k * 4, 12, 3, k <= (f % 4) ? P.accent : P.metalDark);
  // Accent vents along the bottom
  for (let i = 0; i < 5; i += 1) rect(g, 34 + i * 12, 99, 8, 3, (i + f) % 2 ? P.accentDark : P.accent);
  return g;
};

// ---------------- ATTACHMENTS (static overlays) ----------------
const A = {}; // A[machineId] = [fn, fn, fn] for levels 3,6,10
A.generator = [
  (g) => { box(g, 18, 92, 18, 12, P.cable, P.metalLight, P.outline); for (let i = 0; i < 3; i += 1) rect(g, 21 + i * 5, 95, 3, 5, P.accent); }, // power strip
  (g) => { box(g, 36, 20, 56, 8, P.metalLight, P.accentBright, P.metalDark); for (let i = 0; i < 10; i += 1) put(g, 40 + i * 5, 24, P.accent); }, // ballast tube
  (g) => { box(g, 96, 60, 22, 34, P.metalDark, P.metalLight, P.outline); ring(g, 107, 77, 7, P.accent); for (let i = 0; i < 4; i += 1) put(g, 99 + i * 5, 96, P.accentLight); }, // transformer
];
A.capacitor = [
  (g) => { box(g, 18, 70, 18, 36, P.plastic, P.plasticHi, P.plasticDark); rect(g, 22, 76, 10, 4, P.accent); rect(g, 22, 84, 10, 4, P.accent); }, // UPS brick
  (g) => { box(g, 90, 36, 16, 40, P.glass, P.glassHi, P.outline); rect(g, 93, 46, 10, 26, P.accentDark); }, // coolant tank (overlaps meter area -> place left)
  (g) => { for (let i = 0; i < 4; i += 1) box(g, 44 + i * 10, 96, 8, 12, P.accentDark, P.accentBright, P.outline); }, // extra glowing cells
];
A.extractor = [
  (g) => { for (let i = 0; i < 24; i += 1) put(g, 84 + Math.round(Math.sin(i / 3) * 4), 40 + i * 2.6, P.cable); box(g, 88, 92, 14, 16, P.metalDark, P.metalLight, P.outline); }, // vacuum hose + canister
  (g) => { rect(g, 20, 54, 24, 5, P.metalLight); disc(g, 22, 56, 5, P.metalDark); }, // counterweight arm
  (g) => { box(g, 84, 30, 20, 22, P.glass, P.glassHi, P.outline); rect(g, 87, 42, 14, 8, P.sub); vline(g, 94, 52, 50, P.metalDark); }, // second bottle + bore
];
A.conv_pp = [
  (g) => { screen(g, 96, 60, 24, 20, 0); }, // little monitor
  (g) => { box(g, 78, 62, 22, 18, P.metalMid, P.metalHi, P.metalDark); rect(g, 81, 66, 16, 6, P.white); }, // second in-tray
  (g) => { rect(g, 50, 18, 16, 4, P.accent); for (let j = 0; j < 8; j += 1) { const w = 8 - j; rect(g, 58 - (w >> 1), 22 + j, w, 1, P.accentBright); } disc(g, 58, 20, 3, P.accentLight); }, // trophy
];
A.conv_paper = [
  (g) => { for (let k = 0; k < 5; k += 1) rect(g, 16, 96 - k * 3, 18, 3, P.white); rect(g, 16, 96, 18, 2, P.plasticDark); }, // paper stack
  (g) => { box(g, 96, 78, 24, 20, P.plasticDark, P.plastic, P.outline); rect(g, 100, 82, 16, 10, P.white); }, // bulk tray
  (g) => { box(g, 30, 28, 24, 10, P.accentDark, P.accent, P.outline); for (let i = 0; i < 20; i += 1) put(g, 32 + i, 33, (i % 2) ? P.accentBright : P.accentDark); }, // second print head
];
A.conv_lucidity = [
  (g) => { box(g, 84, 96, 14, 12, P.wood, P.plasticHi, P.woodDark); for (let b = 0; b < 4; b += 1) line(g, 91, 96, 84 + b * 4, 86, P.plantDark); disc(g, 88, 86, 3, P.plantHi); }, // second plant
  (g) => { for (let j = 0; j < 12; j += 1) { const w = j < 6 ? j + 2 : 14 - j; rect(g, 56 - (w >> 1), 30 + j, w, 1, j % 2 ? P.accentLight : P.accent); } }, // crystal diffuser
  (g) => { ring(g, 52, 56, 18, P.accentBright); ring(g, 52, 56, 20, P.accentLight); }, // halo
];
A.conv_intelligence = [
  (g) => { screen(g, 50, 18, 30, 20, 0); }, // 5th monitor on top
  (g) => { box(g, 98, 50, 20, 52, P.metalDark, P.metalLight, P.outline); for (let i = 0; i < 6; i += 1) rect(g, 101, 54 + i * 8, 14, 4, P.accentDark); }, // server tower
  (g) => { disc(g, 50, 60, 3, P.accentBright); disc(g, 80, 60, 3, P.accentBright); line(g, 56, 84, 74, 84, P.accentLight); }, // face in static (eyes + mouth)
];
A.conv_material = [
  (g) => { ring(g, 92, 100, 6, P.accentDark); rect(g, 87, 100, 3, 7, P.accent); rect(g, 94, 100, 3, 7, P.metalLight); }, // second magnet
  (g) => { ring(g, 56, 74, 16, P.metalLight); for (let a = 0; a < 360; a += 30) put(g, Math.round(56 + Math.cos(a * Math.PI / 180) * 16), Math.round(74 + Math.sin(a * Math.PI / 180) * 16), P.accent); }, // staple ring
  (g) => { for (let j = 0; j < 10; j += 1) { const w = j < 5 ? j + 1 : 10 - j; rect(g, 110 - (w >> 1), 30 + j, w, 1, j % 2 ? P.accentBright : P.accent); } }, // floating crystal
];
A.transmuter = [
  (g) => { for (let j = 0; j < 60; j += 1) { put(g, 33, 44 + j, P.metalHi); put(g, 95, 44 + j, P.metalHi); } }, // reinforced lining
  (g) => { box(g, 96, 80, 20, 24, P.metalMid, P.metalHi, P.metalDark); disc(g, 106, 92, 5, P.accentDark); disc(g, 106, 92, 3, P.accent); }, // twin chamber
  (g) => { disc(g, 64, 18, 6, P.accentDark); disc(g, 64, 18, 4, P.accentBright); ring(g, 64, 18, 8, P.accentLight); }, // philosopher's stone
];
A.overclocker = [
  (g) => { box(g, 16, 54, 12, 44, P.metalDark, P.metalLight, P.outline); for (let k = 0; k < 5; k += 1) rect(g, 18, 58 + k * 8, 8, 3, P.accent); }, // voltage regulator (left)
  (g) => { disc(g, 110, 62, 11, P.metalDark); ring(g, 110, 62, 11, P.outline); for (let b = 0; b < 3; b += 1) { const a = b * 120 * Math.PI / 180; line(g, 110, 62, Math.round(110 + Math.cos(a) * 8), Math.round(62 + Math.sin(a) * 8), P.metalHi); } }, // chiller fan (right)
  (g) => { for (let x = 30; x < 98; x += 1) { put(g, x, 24, P.accentLight); if (x % 5 === 0) put(g, x, 22, P.accentBright); } }, // cryo frost rail
];

const BASE = {
  generator: baseGenerator, capacitor: baseCapacitor, extractor: baseExtractor,
  conv_pp: baseConvPP, conv_paper: baseConvPaper, conv_lucidity: baseConvLucidity,
  conv_intelligence: baseConvIntelligence, conv_material: baseConvMaterial,
  transmuter: baseTransmuter,
  overclocker: baseOverclocker,
};

// RLE encode
const encode = (grid) => {
  const out = []; let prev = grid[0]; let count = 1;
  for (let i = 1; i < grid.length; i += 1) { if (grid[i] === prev) count += 1; else { out.push([prev, count]); prev = grid[i]; count = 1; } }
  out.push([prev, count]); return out;
};

const sprites = {};
for (const [id, accent] of Object.entries(MACHINES)) {
  const baseFrames = [];
  for (let f = 0; f < FRAMES; f += 1) baseFrames.push(encode(BASE[id](f)));
  const attachments = (A[id] || []).map((fn, i) => { const g = newGrid(); fn(g); return { atLevel: ATTACH_LEVELS[i], cells: encode(g) }; });
  sprites[id] = { size: SIZE, fps: 4, glowIndices: [20, 21, 22], palette: buildPalette(accent), baseFrames, attachments };
}

const header = `/**
 * Factory sprite data (generated by scripts/generateFactorySprites.mjs).
 *
 * Per machine: { size, fps, glowIndices, palette[], baseFrames[rle x4],
 * attachments[{atLevel, cells:rle}] }. A frame/attachment is RLE [paletteIndex,
 * count] over size*size row-major; index 0 is transparent. Attachments overlay the
 * base once the machine's upgrade level reaches atLevel. Decoded to PXLS projects
 * and drawn by FactorySprite.js. Do not edit by hand; re-run the generator.
 */
`;
const body = `export const FACTORY_SPRITES = ${JSON.stringify(sprites)};\n`;
const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, '..', 'app', 'game', 'factorySpriteData.js');
writeFileSync(outPath, header + body);
console.log(`Wrote ${outPath} (${(Buffer.byteLength(header + body) / 1024).toFixed(1)} KB, ${Object.keys(sprites).length} machines @ ${SIZE}px)`);
