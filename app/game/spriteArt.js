/**
 * spriteArt.js - procedural 128x128 pixel-art painters for the Expedition assets
 * (weapons, gear, provisions, shells, minds). Each painter draws onto a 128x128
 * canvas context with hard-edged primitives and simple shading (darker edges,
 * lighter highlights, an accent/glow), so everything reads as detailed pixel art
 * at full resolution. Rendered + animated by PixelArt.js.
 */
import { mulberry32, hashSeed } from './expeditionChart';

export const RES = 128;

const hexToRgb = (h) => {
  const n = parseInt(String(h).replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgb = (r, g, b) => `rgb(${r | 0},${g | 0},${b | 0})`;
const darken = (h, f) => { const [r, g, b] = hexToRgb(h); return rgb(r * f, g * f, b * f); };
const lighten = (h, f) => { const [r, g, b] = hexToRgb(h); return rgb(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f); };

const painter = (ctx) => {
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, Math.ceil(w), Math.ceil(h)); };
  const disc = (cx, cy, r, c) => {
    ctx.fillStyle = c;
    for (let y = -r; y <= r; y += 1) {
      const dx = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)));
      ctx.fillRect((cx - dx) | 0, (cy + y) | 0, 2 * dx + 1, 1);
    }
  };
  const ringPx = (cx, cy, r, w, c) => { disc(cx, cy, r, c); };
  const line = (x0, y0, x1, y1, w, c) => {
    const s = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    ctx.fillStyle = c;
    const hw = w / 2;
    for (let i = 0; i <= s; i += 1) {
      const x = x0 + ((x1 - x0) * i) / s;
      const y = y0 + ((y1 - y0) * i) / s;
      ctx.fillRect((x - hw) | 0, (y - hw) | 0, w, w);
    }
  };
  const quad = (pts, c) => {
    ctx.fillStyle = c;
    const ys = pts.map((p) => p[1]);
    const minY = Math.floor(Math.min(...ys));
    const maxY = Math.ceil(Math.max(...ys));
    for (let y = minY; y <= maxY; y += 1) {
      const xs = [];
      for (let i = 0; i < pts.length; i += 1) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
          xs.push(a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]));
        }
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) ctx.fillRect(Math.round(xs[k]), y, Math.round(xs[k + 1] - xs[k]) + 1, 1);
    }
  };
  return { rect, disc, ringPx, line, quad };
};

const WOOD = '#6b4f3a';
const pole = (p, x0, y0, x1, y1, w) => {
  p.line(x0, y0, x1, y1, w + 4, darken(WOOD, 0.4));
  p.line(x0, y0, x1, y1, w, WOOD);
  p.line(x0, y0, x1, y1, Math.max(2, w - 6), lighten(WOOD, 0.25));
};

// ---- Weapons -------------------------------------------------------------
// Each painter receives (p, metal, accent) where metal is the type colour and
// accent is the rarity colour.
const WEAPON_ART = {
  stapler_pike: (p, m, a) => {
    pole(p, 40, 116, 84, 34, 12);
    p.quad([[84, 38], [78, 18], [108, 4], [98, 36]], darken(m, 0.6));
    p.quad([[84, 38], [80, 20], [104, 8], [96, 34]], m);
    p.quad([[88, 30], [84, 18], [100, 10]], lighten(m, 0.4));
    p.rect(52, 70, 26, 14, darken(m, 0.6));
    p.rect(54, 72, 22, 10, m);
    p.rect(56, 74, 18, 3, a);
  },
  guillotine_cutter: (p, m, a) => {
    pole(p, 20, 116, 40, 84, 14);
    p.quad([[36, 92], [120, 10], [120, 30], [44, 100]], darken(m, 0.55));
    p.quad([[40, 92], [116, 16], [116, 28], [46, 96]], m);
    p.quad([[40, 92], [116, 16], [116, 20], [44, 92]], a);
    p.rect(30, 84, 22, 10, darken(m, 0.7));
  },
  letter_opener_fan: (p, m, a) => {
    p.disc(60, 104, 12, darken(m, 0.6));
    p.disc(60, 104, 9, m);
    const blades = [[14, 22], [40, 8], [66, 6], [94, 18], [112, 40]];
    blades.forEach(([bx, by]) => {
      p.line(60, 100, bx, by, 9, darken(m, 0.55));
      p.line(60, 100, bx, by, 5, lighten(m, 0.2));
      p.disc(bx, by, 3, a);
    });
  },
  cubicle_maul: (p, m, a) => {
    pole(p, 64, 120, 64, 44, 14);
    p.rect(26, 18, 76, 36, darken(m, 0.55));
    p.rect(30, 22, 68, 28, m);
    p.rect(30, 22, 68, 7, lighten(m, 0.3));
    p.rect(30, 44, 68, 6, darken(m, 0.4));
    p.rect(40, 30, 48, 6, a);
  },
  toner_flail: (p, m, a) => {
    pole(p, 24, 118, 50, 78, 12);
    p.line(52, 76, 78, 50, 6, darken(m, 0.5));
    [[58, 70], [66, 62], [74, 54]].forEach(([cx, cy]) => p.disc(cx, cy, 4, darken(m, 0.3)));
    p.rect(70, 26, 40, 38, darken(m, 0.6));
    p.rect(74, 30, 32, 30, m);
    p.rect(74, 30, 32, 8, lighten(m, 0.2));
    p.disc(90, 46, 5, a);
  },
  cable_lash: (p, m, a) => {
    p.rect(18, 100, 16, 24, darken(WOOD, 0.4));
    p.rect(20, 102, 12, 20, WOOD);
    let px = 30;
    let py = 104;
    for (let i = 0; i < 26; i += 1) {
      const nx = 30 + i * 3.6;
      const ny = 104 - i * 3.6 + Math.sin(i / 2.2) * 16;
      p.line(px, py, nx, ny, i < 13 ? 8 : 5, i % 2 ? darken(m, 0.5) : m);
      px = nx; py = ny;
    }
    p.disc(px, py, 6, a);
  },
  lucid_lance: (p, m, a) => {
    pole(p, 16, 120, 96, 36, 11);
    p.line(20, 118, 100, 34, 6, lighten(m, 0.2));
    p.quad([[96, 40], [88, 20], [120, 6], [108, 38]], darken(m, 0.4));
    p.quad([[96, 40], [92, 22], [114, 12]], a);
    p.disc(104, 18, 8, lighten(a, 0.4));
    p.disc(104, 18, 4, '#ffffff');
  },
  thermal_censer: (p, m, a) => {
    for (let y = 6; y < 60; y += 8) p.disc(72, y, 3, darken(m, 0.4));
    p.disc(64, 84, 30, darken(m, 0.6));
    p.disc(64, 84, 26, m);
    p.disc(64, 78, 22, darken(m, 0.5));
    p.rect(40, 70, 48, 12, darken(m, 0.7));
    [[52, 86], [64, 92], [76, 86]].forEach(([cx, cy]) => p.disc(cx, cy, 5, a));
    p.disc(64, 84, 6, lighten(a, 0.5));
  },
};

export const paintWeapon = (ctx, typeId, metal, accent) => {
  const p = painter(ctx);
  const fn = WEAPON_ART[typeId] || ((pp, m, a) => { pp.rect(48, 24, 32, 80, m); });
  fn(p, metal || '#cccccc', accent || '#ffffff');
};

// ---- Gear ----------------------------------------------------------------
const GEAR_ART = {
  lantern: (p) => {
    const m = '#caa66a';
    p.rect(50, 8, 28, 8, darken(m, 0.5));
    p.disc(64, 8, 6, m);
    p.disc(64, 8, 3, '#3a2f1c');
    p.rect(40, 24, 48, 76, darken(m, 0.55));
    p.rect(46, 30, 36, 64, '#ffe08a');
    p.rect(52, 36, 24, 52, '#fff2c0');
    for (let y = 30; y < 94; y += 12) p.rect(40, y, 48, 3, darken(m, 0.4));
    p.rect(36, 100, 56, 16, darken(m, 0.6));
    p.rect(40, 102, 48, 10, m);
  },
  compass: (p) => {
    const m = '#8a8f94';
    p.disc(64, 64, 50, darken(m, 0.5));
    p.disc(64, 64, 44, m);
    p.disc(64, 64, 36, '#2a2a32');
    p.disc(64, 64, 33, '#cfd6e0');
    p.disc(64, 64, 28, '#3a3a42');
    p.quad([[64, 64], [88, 40], [70, 64]], '#e06b6b');
    p.quad([[64, 64], [40, 88], [58, 64]], '#cfd6e0');
    p.disc(64, 64, 5, '#ffffff');
  },
  decoder: (p) => {
    const m = '#6a8caf';
    p.line(74, 74, 112, 112, 16, darken(m, 0.4));
    p.line(74, 74, 112, 112, 9, '#2a3a4a');
    p.disc(50, 50, 38, darken(m, 0.5));
    p.disc(50, 50, 31, m);
    p.disc(50, 50, 25, '#9fe8ff');
    p.disc(50, 50, 18, '#cdf3ff');
    p.disc(42, 42, 7, '#ffffff');
  },
  ward_minor: (p) => {
    const m = '#d8d2c0';
    p.quad([[64, 14], [104, 64], [64, 114], [24, 64]], darken(m, 0.5));
    p.quad([[64, 20], [98, 64], [64, 108], [30, 64]], m);
    p.line(64, 20, 64, 108, 3, darken(m, 0.35));
    p.line(30, 64, 98, 64, 3, darken(m, 0.35));
    p.disc(64, 64, 9, '#b46bff');
    p.disc(64, 64, 4, '#e8c8ff');
  },
  ward_major: (p) => {
    const m = '#5fd0ff';
    p.disc(64, 64, 50, darken(m, 0.45));
    p.disc(64, 64, 43, '#16323f');
    for (let A = 0; A < 360; A += 30) {
      const x = 64 + Math.cos((A * Math.PI) / 180) * 46;
      const y = 64 + Math.sin((A * Math.PI) / 180) * 46;
      p.disc(x, y, 6, m);
      p.disc(x, y, 3, '#ffffff');
    }
    p.disc(64, 64, 14, m);
    p.disc(64, 64, 7, '#ffffff');
  },
  plating: (p) => {
    const m = '#8a8f94';
    p.quad([[24, 20], [104, 20], [112, 64], [104, 108], [24, 108], [16, 64]], darken(m, 0.5));
    p.quad([[30, 26], [98, 26], [104, 64], [98, 102], [30, 102], [24, 64]], m);
    p.quad([[30, 26], [98, 26], [101, 50], [27, 50]], lighten(m, 0.25));
    [[40, 40], [88, 40], [40, 88], [88, 88], [64, 64]].forEach(([x, y]) => { p.disc(x, y, 6, darken(m, 0.6)); p.disc(x, y, 3, '#caa66a'); });
  },
};

// ---- Provisions ----------------------------------------------------------
const PROV_ART = {
  rations: (p) => {
    const m = '#9e6b4a';
    p.rect(40, 18, 48, 14, darken(m, 0.5));
    p.rect(44, 22, 40, 8, lighten(m, 0.2));
    p.rect(38, 32, 52, 76, darken(m, 0.55));
    p.rect(44, 38, 40, 64, m);
    p.rect(44, 38, 14, 64, lighten(m, 0.25));
    p.rect(38, 104, 52, 12, darken(m, 0.6));
    p.disc(64, 10, 5, '#e8995c');
  },
  lucid_draught: (p) => {
    const glass = '#bdebff';
    p.quad([[42, 30], [86, 30], [80, 112], [48, 112]], darken(glass, 0.6));
    p.quad([[46, 34], [82, 34], [77, 108], [51, 108]], glass);
    p.quad([[48, 60], [80, 60], [76, 106], [52, 106]], '#5fd0ff');
    p.rect(48, 58, 32, 6, '#ffffff');
    p.disc(60, 22, 5, '#9fe8ff');
    p.disc(72, 16, 3, '#ffffff');
  },
  clarity_charge: (p) => {
    const g = '#cfd6e0';
    for (let A = 0; A < 360; A += 45) {
      const x = 64 + Math.cos((A * Math.PI) / 180) * 50;
      const y = 64 + Math.sin((A * Math.PI) / 180) * 50;
      p.line(64, 64, x, y, 3, '#9fe8ff');
    }
    p.disc(64, 64, 32, darken(g, 0.5));
    p.disc(64, 64, 27, g);
    p.disc(58, 58, 12, '#ffffff');
    p.disc(64, 64, 6, '#9fe8ff');
  },
};

export const paintCraft = (ctx, id) => {
  const p = painter(ctx);
  const fn = GEAR_ART[id] || PROV_ART[id];
  if (fn) fn(p);
  else p.rect(48, 48, 32, 32, '#cccccc');
};

export const paintShell = (ctx) => {
  const p = painter(ctx);
  const m = '#8a8f94';
  // head
  p.disc(64, 30, 18, darken(m, 0.5));
  p.disc(64, 30, 14, m);
  p.disc(58, 26, 5, lighten(m, 0.3));
  p.rect(56, 30, 16, 6, '#6bd0a0');
  // torso carapace
  p.quad([[40, 50], [88, 50], [96, 96], [80, 116], [48, 116], [32, 96]], darken(m, 0.55));
  p.quad([[46, 56], [82, 56], [88, 94], [76, 110], [52, 110], [40, 94]], m);
  p.quad([[46, 56], [82, 56], [85, 76], [43, 76]], lighten(m, 0.22));
  // arms
  p.rect(26, 56, 12, 44, darken(m, 0.5)); p.rect(28, 58, 8, 40, m);
  p.rect(90, 56, 12, 44, darken(m, 0.5)); p.rect(92, 58, 8, 40, m);
  // core
  p.disc(64, 82, 10, '#1f3a30');
  p.disc(64, 82, 6, '#6bd0a0');
  p.disc(64, 82, 3, '#bfffe0');
};

const SCAR_COL = '#9e3b3b';
export const paintMind = (ctx, mind) => {
  const p = painter(ctx);
  const rng = mulberry32(hashSeed(mind.id));
  const tints = ['#5a6472', '#5f5a6e', '#586a62', '#6a625a', '#606068'];
  const skin = tints[Math.floor(rng() * tints.length)];
  const dark = darken(skin, 0.55);
  const light = lighten(skin, 0.3);
  // head mass
  p.disc(64, 60, 40, darken(skin, 0.4));
  p.disc(64, 58, 37, skin);
  // right-side shading
  for (let y = -37; y <= 37; y += 1) {
    const dx = Math.floor(Math.sqrt(Math.max(0, 37 * 37 - y * y)));
    p.rect(64 + dx - 14, 58 + y, 14, 1, darken(skin, 0.78));
  }
  // forehead highlight
  p.disc(54, 44, 12, light);
  // speckle / texture
  for (let i = 0; i < 40; i += 1) {
    const x = 30 + Math.floor(rng() * 68);
    const y = 30 + Math.floor(rng() * 60);
    if (rng() > 0.6) p.rect(x, y, 2, 2, rng() > 0.5 ? light : dark);
  }
  // eyes
  const eyeY = 56 + Math.floor(rng() * 8);
  const open = rng() > 0.3;
  [[48, eyeY], [80, eyeY]].forEach(([ex, ey]) => {
    p.disc(ex, ey, 8, '#dfe6ee');
    p.disc(ex, ey, 5, open ? '#1a1a22' : dark);
    if (open) p.disc(ex - 1, ey - 1, 2, '#ffffff');
    p.rect(ex - 9, ey - 9, 18, 3, dark); // brow
  });
  // nose + mouth
  p.line(64, eyeY + 4, 62, eyeY + 18, 3, dark);
  const mY = eyeY + 28;
  p.rect(52, mY, 24, 3, dark);
  if (rng() > 0.5) p.rect(52, mY, 24, 1, darken(skin, 0.3));
  // level marks (a faint circlet)
  if (mind.level >= 6) p.rect(46, 24, 36, 3, light);
  if (mind.level >= 12) { p.disc(64, 22, 4, light); }
  // scars
  const scars = (mind.scars || []).length;
  for (let i = 0; i < scars; i += 1) {
    const sx = 40 + Math.floor(rng() * 48);
    const sy = 40 + Math.floor(rng() * 40);
    p.line(sx, sy, sx + 6, sy + 18, 3, SCAR_COL);
  }
};
