/**
 * PXLS Render Helpers
 *
 * Composites a project's layers onto a canvas at a given cell size. Used for
 * both the on screen editor canvas and PNG export. Per cell effects (glow,
 * dither, noise) are applied here so the editor preview matches the export.
 *
 * Rendering is deterministic: noise uses a seeded PRNG keyed by the project
 * seed plus cell position, so an exported frame matches what is on screen.
 */

import { isEmptyCell } from './pxlsModel';

/**
 * Parses a hex colour into rgb components.
 * @param {string} hex - '#rrggbb'
 * @returns {{ r: number, g: number, b: number }}
 */
export const hexToRgb = (hex) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

/**
 * Clamps a number to 0..255 and rounds.
 * @param {number} v
 * @returns {number}
 */
const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(v)));

/**
 * Deterministic 32 bit hash to a 0..1 float.
 * @param {number} a
 * @returns {number}
 */
const hash01 = (a) => {
  let x = a | 0;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};

/**
 * Resolves a cell's effective rgb after noise + dither effects.
 * @param {Object} cell
 * @param {Object} rightCell - neighbour to the right (for dither) or null
 * @param {number} seed
 * @param {number} idx - cell flat index
 * @returns {{ r: number, g: number, b: number }}
 */
const effectiveRgb = (cell, rightCell, seed, idx) => {
  let { r, g, b } = hexToRgb(cell.color);
  if (cell.effect && cell.effect.type === 'noise') {
    const amount = 60 * cell.effect.intensity;
    const j = (hash01(seed + idx * 2654435761) - 0.5) * 2 * amount;
    r = clamp255(r + j);
    g = clamp255(g + j);
    b = clamp255(b + j);
  }
  if (cell.effect && cell.effect.type === 'dither' && rightCell && !isEmptyCell(rightCell)) {
    const n = hexToRgb(rightCell.color);
    const w = 0.5 * cell.effect.intensity;
    r = clamp255(r * (1 - w) + n.r * w);
    g = clamp255(g * (1 - w) + n.g * w);
    b = clamp255(b * (1 - w) + n.b * w);
  }
  return { r, g, b };
};

/**
 * Public wrapper to resolve a cell's display rgb (noise + dither baked).
 * Used by SVG export to match the canvas preview.
 * @param {Object} cell
 * @param {Object|null} rightCell
 * @param {number} seed
 * @param {number} idx
 * @param {boolean} includeEffects
 * @returns {{ r: number, g: number, b: number }}
 */
export const resolveRgb = (cell, rightCell, seed, idx, includeEffects) =>
  (includeEffects ? effectiveRgb(cell, rightCell, seed, idx) : hexToRgb(cell.color));

/**
 * Draws a single layer onto a 2d context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} layer
 * @param {Object} dims - { width, height }
 * @param {number} cellSize
 * @param {number} seed
 * @param {boolean} includeEffects
 */
const drawLayer = (ctx, layer, dims, cellSize, seed, includeEffects) => {
  const { width, height } = dims;
  const { cells, opacity } = layer;

  // Glow pre pass (additive) so halos sit behind solid pixels.
  if (includeEffects) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const cell = cells[y * width + x];
        if (isEmptyCell(cell) || !cell.effect || cell.effect.type !== 'glow') continue;
        const { r, g, b } = hexToRgb(cell.color);
        const radius = cellSize * (0.6 + cell.effect.intensity * 1.4);
        const px = x * cellSize + cellSize / 2;
        const py = y * cellSize + cellSize / 2;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
        const a = 0.55 * cell.effect.intensity * cell.alpha * opacity;
        grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
      }
    }
    ctx.restore();
  }

  // Solid cells.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      const cell = cells[idx];
      if (isEmptyCell(cell)) continue;
      const a = cell.alpha * opacity;
      const right = x + 1 < width ? cells[idx + 1] : null;
      const { r, g, b } = includeEffects
        ? effectiveRgb(cell, right, seed, idx)
        : hexToRgb(cell.color);

      const dither = includeEffects && cell.effect && cell.effect.type === 'dither'
        && cellSize >= 2;
      if (dither && right && !isEmptyCell(right)) {
        // Draw base in a 2x2 checker against the neighbour colour for a true
        // dithered look when the cell is large enough to show sub pixels.
        const n = hexToRgb(right.color);
        const sub = cellSize / 2;
        const base = `rgba(${hexToRgb(cell.color).r},${hexToRgb(cell.color).g},${hexToRgb(cell.color).b},${a})`;
        const alt = `rgba(${n.r},${n.g},${n.b},${a})`;
        const bx = x * cellSize;
        const by = y * cellSize;
        ctx.fillStyle = base;
        ctx.fillRect(bx, by, Math.ceil(sub), Math.ceil(sub));
        ctx.fillRect(bx + Math.floor(sub), by + Math.floor(sub), Math.ceil(sub), Math.ceil(sub));
        ctx.fillStyle = alt;
        ctx.fillRect(bx + Math.floor(sub), by, Math.ceil(sub), Math.ceil(sub));
        ctx.fillRect(bx, by + Math.floor(sub), Math.ceil(sub), Math.ceil(sub));
      } else {
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
};

/**
 * Composites all visible layers of a project onto a canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} project
 * @param {number} cellSize - device pixels per art pixel
 * @param {Object} [opts]
 * @param {boolean} [opts.includeEffects=true]
 * @param {string|null} [opts.background=null] - hex fill or null for transparent
 */
export const compositeToCanvas = (canvas, project, cellSize, opts = {}) => {
  const { includeEffects = true, background = null } = opts;
  const { width, height, layers, seed } = project;
  const w = width * cellSize;
  const h = height * cellSize;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
  }

  const dims = { width, height };
  for (const layer of layers) {
    if (!layer.visible) continue;
    drawLayer(ctx, layer, dims, cellSize, seed, includeEffects);
  }
};

/**
 * Draws a faint pixel grid overlay (editor only, never exported).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} dims - { width, height }
 * @param {number} cellSize
 * @param {string} color - rgba/hex line colour
 */
export const drawGrid = (ctx, dims, cellSize, color) => {
  const { width, height } = dims;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 1) {
    ctx.moveTo(x * cellSize + 0.5, 0);
    ctx.lineTo(x * cellSize + 0.5, height * cellSize);
  }
  for (let y = 0; y <= height; y += 1) {
    ctx.moveTo(0, y * cellSize + 0.5);
    ctx.lineTo(width * cellSize, y * cellSize + 0.5);
  }
  ctx.stroke();
  ctx.restore();
};

/**
 * Draws a checkerboard transparency backdrop (editor only).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} tile
 * @param {[string, string]} colors
 */
export const drawCheckerboard = (ctx, w, h, tile, colors) => {
  for (let y = 0; y < h; y += tile) {
    for (let x = 0; x < w; x += tile) {
      ctx.fillStyle = ((x / tile) + (y / tile)) % 2 === 0 ? colors[0] : colors[1];
      ctx.fillRect(x, y, tile, tile);
    }
  }
};
