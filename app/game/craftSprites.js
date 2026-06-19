/**
 * Procedural pixel art for crafted items (gear, provisions, shells). Each entry
 * returns a 16x16 pixel list (tokens a/b/c/d) plus a palette mapping those
 * tokens to colours. Rendered by CraftSprite.js, which shares the materialising
 * "fabrication" animation used by the weapon roll.
 */

const GRID = 16;

const canvas = () => {
  const px = [];
  const P = (x, y, t) => {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi >= 0 && xi < GRID && yi >= 0 && yi < GRID) px.push({ x: xi, y: yi, t });
  };
  const rect = (x, y, w, h, t) => { for (let j = 0; j < h; j += 1) for (let i = 0; i < w; i += 1) P(x + i, y + j, t); };
  const line = (x0, y0, x1, y1, t) => {
    const s = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= s; i += 1) P(x0 + ((x1 - x0) * i) / s, y0 + ((y1 - y0) * i) / s, t);
  };
  const disc = (cx, cy, r, t) => { for (let y = -r; y <= r; y += 1) for (let x = -r; x <= r; x += 1) if (x * x + y * y <= r * r) P(cx + x, cy + y, t); };
  const ring = (cx, cy, r, t) => { for (let a = 0; a < 360; a += 18) P(cx + Math.cos((a * Math.PI) / 180) * r, cy + Math.sin((a * Math.PI) / 180) * r, t); };
  return { px, P, rect, line, disc, ring };
};

// token -> colour palettes. a = body, b = shadow, c = accent/glow, d = highlight.
const PALETTES = {
  lantern: { a: '#caa66a', b: '#5a4a30', c: '#ffe08a', d: '#e8d8a8' },
  compass: { a: '#8a8f94', b: '#3a3a40', c: '#e06b6b', d: '#cfd6e0' },
  decoder: { a: '#6a8caf', b: '#2a3a4a', c: '#9fe8ff', d: '#cfd6e0' },
  ward_minor: { a: '#d8d2c0', b: '#8a8470', c: '#b46bff', d: '#ffffff' },
  ward_major: { a: '#5fd0ff', b: '#2a4a5a', c: '#ffffff', d: '#bdebff' },
  plating: { a: '#8a8f94', b: '#3a3a40', c: '#caa66a', d: '#cfd6e0' },
  rations: { a: '#9e6b4a', b: '#4a3020', c: '#e8995c', d: '#caa66a' },
  lucid_draught: { a: '#5fd0ff', b: '#2a4a5a', c: '#ffffff', d: '#bdebff' },
  clarity_charge: { a: '#cfd6e0', b: '#5a5a66', c: '#9fe8ff', d: '#ffffff' },
  shell: { a: '#8a8f94', b: '#3a3a40', c: '#6bd0a0', d: '#cfd6e0' },
};

const BUILDERS = {
  lantern: () => {
    const c = canvas();
    c.rect(6, 2, 4, 1, 'a'); // top ring
    c.P(7, 1, 'a'); c.P(8, 1, 'a');
    c.rect(5, 3, 6, 9, 'a'); // body frame
    c.rect(6, 4, 4, 7, 'c'); // glowing glass
    c.rect(7, 5, 2, 5, 'd');
    c.rect(5, 12, 6, 2, 'b'); // base
    return c.px;
  },
  compass: () => {
    const c = canvas();
    c.disc(8, 8, 6, 'a');
    c.ring(8, 8, 6, 'b');
    c.disc(8, 8, 4, 'b');
    c.line(8, 8, 11, 5, 'c'); // needle
    c.line(8, 8, 5, 11, 'd');
    c.P(8, 8, 'd');
    return c.px;
  },
  decoder: () => {
    const c = canvas();
    c.ring(6, 6, 4, 'a');
    c.disc(6, 6, 3, 'c');
    c.disc(6, 6, 2, 'd');
    c.line(9, 9, 13, 13, 'b'); // handle
    c.line(10, 9, 14, 13, 'b');
    return c.px;
  },
  ward_minor: () => {
    const c = canvas();
    // folded-paper diamond charm
    for (let i = 0; i < 5; i += 1) { c.line(8 - i, 3 + i, 8 + i, 3 + i, 'a'); }
    for (let i = 0; i < 5; i += 1) { c.line(8 - (4 - i), 8 + i, 8 + (4 - i), 8 + i, 'a'); }
    c.line(8, 3, 8, 12, 'b');
    c.P(8, 7, 'c'); c.P(7, 7, 'c'); c.P(9, 7, 'c');
    return c.px;
  },
  ward_major: () => {
    const c = canvas();
    c.ring(8, 8, 6, 'a');
    c.ring(8, 8, 6, 'a');
    for (let a = 0; a < 360; a += 45) c.P(8 + Math.cos((a * Math.PI) / 180) * 6, 8 + Math.sin((a * Math.PI) / 180) * 6, 'c');
    c.disc(8, 8, 2, 'c');
    c.P(8, 8, 'd');
    return c.px;
  },
  plating: () => {
    const c = canvas();
    c.rect(3, 3, 10, 10, 'a');
    c.rect(3, 3, 10, 1, 'd');
    c.rect(3, 12, 10, 1, 'b');
    c.P(5, 5, 'c'); c.P(10, 5, 'c'); c.P(5, 10, 'c'); c.P(10, 10, 'c'); // rivets
    return c.px;
  },
  rations: () => {
    const c = canvas();
    c.rect(5, 3, 6, 2, 'b'); // lid
    c.rect(5, 5, 6, 8, 'a'); // thermos body
    c.rect(6, 6, 4, 6, 'd');
    c.rect(5, 13, 6, 1, 'b');
    c.P(8, 2, 'c');
    return c.px;
  },
  lucid_draught: () => {
    const c = canvas();
    c.rect(5, 4, 6, 9, 'd'); // cup
    c.rect(6, 7, 4, 5, 'a'); // liquid
    c.rect(6, 6, 4, 1, 'c'); // surface glow
    c.rect(5, 13, 6, 1, 'b');
    c.P(8, 3, 'c'); c.P(7, 4, 'c');
    return c.px;
  },
  clarity_charge: () => {
    const c = canvas();
    c.disc(8, 8, 4, 'a');
    c.disc(8, 8, 3, 'd');
    c.P(7, 7, 'c'); c.P(9, 9, 'c');
    c.line(8, 2, 8, 4, 'c'); // spark
    c.line(8, 12, 8, 14, 'c');
    c.line(2, 8, 4, 8, 'c');
    c.line(12, 8, 14, 8, 'c');
    return c.px;
  },
  shell: () => {
    const c = canvas();
    c.disc(8, 4, 2, 'a'); // head
    c.rect(5, 6, 6, 6, 'a'); // torso carapace
    c.rect(6, 7, 4, 4, 'b');
    c.rect(4, 7, 1, 4, 'a'); c.rect(11, 7, 1, 4, 'a'); // arms
    c.rect(6, 12, 2, 2, 'a'); c.rect(8, 12, 2, 2, 'a'); // legs
    c.P(8, 8, 'c'); // core glow
    return c.px;
  },
};

export const getCraftSprite = (id) => {
  const build = BUILDERS[id];
  if (!build) return null;
  return { pixels: build(), palette: PALETTES[id] || { a: '#ccc', b: '#555', c: '#fff', d: '#eee' } };
};
