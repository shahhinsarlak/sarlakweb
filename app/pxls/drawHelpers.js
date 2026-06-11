/**
 * PXLS Draw Helpers
 *
 * Pure functions that operate on a layer's flat cells array. None of these
 * mutate their input; they all return a NEW cells array. Coordinates are
 * clamped/ignored when out of bounds.
 *
 * index = y * width + x
 */

import { emptyCell, createCell, isEmptyCell } from './pxlsModel';

/**
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
const inBounds = (x, y, width, height) => x >= 0 && y >= 0 && x < width && y < height;

/**
 * Builds the value a brush writes for the current tool/brush settings.
 * @param {Object} brush - { tool, color, alpha, effect }
 * @returns {Object} a cell value
 */
const brushCell = (brush) => {
  if (brush.tool === 'eraser') return emptyCell();
  return createCell(brush.color, brush.alpha, brush.effect);
};

/**
 * Returns the set of mirrored points for a coordinate given a mirror mode.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} mirror - 'none'|'x'|'y'|'both'
 * @returns {Array<[number, number]>}
 */
export const mirrorPoints = (x, y, width, height, mirror) => {
  const points = [[x, y]];
  const mx = width - 1 - x;
  const my = height - 1 - y;
  if (mirror === 'x' || mirror === 'both') points.push([mx, y]);
  if (mirror === 'y' || mirror === 'both') points.push([x, my]);
  if (mirror === 'both') points.push([mx, my]);
  return points;
};

/**
 * Applies a brush dab (respecting brush size as a square) at a point, with
 * mirroring. For the effects tool only the effect is changed, colour kept.
 * @param {Object[]} cells
 * @param {Object} dims - { width, height }
 * @param {number} cx - centre x
 * @param {number} cy - centre y
 * @param {Object} brush - { tool, color, alpha, effect, size, mirror }
 * @returns {Object[]} new cells
 */
export const applyBrush = (cells, dims, cx, cy, brush) => {
  const { width, height } = dims;
  const next = cells.slice();
  const half = Math.floor((brush.size - 1) / 2);
  const value = brushCell(brush);

  for (let dy = -half; dy <= brush.size - 1 - half; dy += 1) {
    for (let dx = -half; dx <= brush.size - 1 - half; dx += 1) {
      const px = cx + dx;
      const py = cy + dy;
      for (const [mxp, myp] of mirrorPoints(px, py, width, height, brush.mirror)) {
        if (!inBounds(mxp, myp, width, height)) continue;
        const idx = myp * width + mxp;
        if (brush.tool === 'effects') {
          const existing = next[idx];
          if (isEmptyCell(existing)) continue;
          next[idx] = {
            color: existing.color,
            alpha: existing.alpha,
            effect: brush.effect ? { ...brush.effect } : null,
          };
        } else {
          next[idx] = { color: value.color, alpha: value.alpha, effect: value.effect };
        }
      }
    }
  }
  return next;
};

/**
 * Flood fill (4 neighbour) from a point with the brush value.
 * @param {Object[]} cells
 * @param {Object} dims - { width, height }
 * @param {number} sx
 * @param {number} sy
 * @param {Object} brush - { color, alpha, effect, tool }
 * @returns {Object[]} new cells
 */
export const floodFill = (cells, dims, sx, sy, brush) => {
  const { width, height } = dims;
  if (!inBounds(sx, sy, width, height)) return cells;
  const next = cells.slice();
  const startIdx = sy * width + sx;
  const target = next[startIdx];
  const value = brushCell(brush);

  const sameAsTarget = (cell) =>
    cell.color === target.color
    && cell.alpha === target.alpha
    && (cell.effect ? cell.effect.type : null) === (target.effect ? target.effect.type : null);

  const sameAsValue = value.color === target.color
    && value.alpha === target.alpha
    && (value.effect ? value.effect.type : null) === (target.effect ? target.effect.type : null);
  if (sameAsValue) return cells;

  const stack = [[sx, sy]];
  const seen = new Set();
  while (stack.length) {
    const [x, y] = stack.pop();
    if (!inBounds(x, y, width, height)) continue;
    const idx = y * width + x;
    if (seen.has(idx)) continue;
    if (!sameAsTarget(next[idx])) continue;
    seen.add(idx);
    next[idx] = { color: value.color, alpha: value.alpha, effect: value.effect };
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return next;
};

/**
 * Returns the integer points of a line via Bresenham.
 * @returns {Array<[number, number]>}
 */
export const linePoints = (x0, y0, x1, y1) => {
  const points = [];
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  while (true) {
    points.push([x, y]);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
  return points;
};

/**
 * Rectangle outline points.
 * @returns {Array<[number, number]>}
 */
export const rectPoints = (x0, y0, x1, y1) => {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  const points = [];
  for (let x = minX; x <= maxX; x += 1) {
    points.push([x, minY], [x, maxY]);
  }
  for (let y = minY + 1; y < maxY; y += 1) {
    points.push([minX, y], [maxX, y]);
  }
  return points;
};

/**
 * Ellipse outline points (midpoint algorithm) fit to the bounding box.
 * @returns {Array<[number, number]>}
 */
export const ellipsePoints = (x0, y0, x1, y1) => {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rx = (maxX - minX) / 2;
  const ry = (maxY - minY) / 2;
  const points = [];
  const add = (x, y) => points.push([Math.round(x), Math.round(y)]);
  if (rx === 0 || ry === 0) {
    return linePoints(minX, minY, maxX, maxY);
  }
  const steps = Math.max(8, Math.ceil((rx + ry) * 4));
  for (let i = 0; i < steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    add(cx + rx * Math.cos(t), cy + ry * Math.sin(t));
  }
  return points;
};

/**
 * Stamps a list of points onto cells with the brush value (size + mirror aware).
 * @param {Object[]} cells
 * @param {Object} dims
 * @param {Array<[number, number]>} points
 * @param {Object} brush
 * @returns {Object[]} new cells
 */
export const stampPoints = (cells, dims, points, brush) => {
  let next = cells;
  for (const [x, y] of points) {
    next = applyBrush(next, dims, x, y, brush);
  }
  return next;
};

/**
 * Extracts a rectangular block of cells (for Move). Cells outside bounds are empty.
 * @returns {Object[]} block cells row major of w*h
 */
export const extractBlock = (cells, dims, rx, ry, rw, rh) => {
  const { width } = dims;
  const block = [];
  for (let y = 0; y < rh; y += 1) {
    for (let x = 0; x < rw; x += 1) {
      const sx = rx + x;
      const sy = ry + y;
      const idx = sy * width + sx;
      const cell = cells[idx];
      block.push(cell ? { ...cell } : emptyCell());
    }
  }
  return block;
};

/**
 * Clears a rectangular region to empty.
 * @returns {Object[]} new cells
 */
export const clearRegion = (cells, dims, rx, ry, rw, rh) => {
  const { width, height } = dims;
  const next = cells.slice();
  for (let y = 0; y < rh; y += 1) {
    for (let x = 0; x < rw; x += 1) {
      const px = rx + x;
      const py = ry + y;
      if (!inBounds(px, py, width, height)) continue;
      next[py * width + px] = emptyCell();
    }
  }
  return next;
};

/**
 * Pastes a block of cells at a destination, skipping empty block cells.
 * @returns {Object[]} new cells
 */
export const pasteBlock = (cells, dims, block, bw, bh, dx, dy) => {
  const { width, height } = dims;
  const next = cells.slice();
  for (let y = 0; y < bh; y += 1) {
    for (let x = 0; x < bw; x += 1) {
      const cell = block[y * bw + x];
      if (isEmptyCell(cell)) continue;
      const px = dx + x;
      const py = dy + y;
      if (!inBounds(px, py, width, height)) continue;
      next[py * width + px] = { ...cell };
    }
  }
  return next;
};
