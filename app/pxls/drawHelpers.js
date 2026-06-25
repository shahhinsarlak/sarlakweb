/**
 * PXLS Draw Helpers
 *
 * Pure functions that operate on a layer's flat cells array. None of these
 * mutate their input; they all return a NEW cells array. Coordinates are
 * clamped/ignored when out of bounds.
 *
 * index = y * width + x
 */

import { emptyCell, createCell, isEmptyCell, instanceEffect } from './pxlsModel';

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
            effect: instanceEffect(brush.effect),
          };
        } else {
          // Fresh per-cell effect so each painted noise pixel gets its own grain.
          next[idx] = {
            color: value.color,
            alpha: value.alpha,
            effect: brush.tool === 'eraser' ? null : instanceEffect(brush.effect),
          };
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
    next[idx] = {
      color: value.color,
      alpha: value.alpha,
      effect: brush.tool === 'eraser' ? null : instanceEffect(brush.effect),
    };
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
 * Expands a set of outline points into every cell a brush would actually paint:
 * the square footprint of brush.size around each point plus its mirror images,
 * deduped and clipped to the canvas. Used so shape previews match the stamped
 * result (line thickness grows with brush size, mirroring is shown).
 * @param {Array<[number, number]>} points
 * @param {Object} dims - { width, height }
 * @param {Object} brush - { size, mirror }
 * @returns {Array<[number, number]>}
 */
export const footprintCells = (points, dims, brush) => {
  const { width, height } = dims;
  const size = brush.size || 1;
  const half = Math.floor((size - 1) / 2);
  const seen = new Set();
  const out = [];
  for (const [cx, cy] of points) {
    for (let dy = -half; dy <= size - 1 - half; dy += 1) {
      for (let dx = -half; dx <= size - 1 - half; dx += 1) {
        const px = cx + dx;
        const py = cy + dy;
        for (const [mx, my] of mirrorPoints(px, py, width, height, brush.mirror)) {
          if (!inBounds(mx, my, width, height)) continue;
          const key = my * width + mx;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push([mx, my]);
        }
      }
    }
  }
  return out;
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
 * Collects the non-empty pixels of a layer inside a rectangle as a movable
 * selection, using a tight bounding box around the selected pixels.
 * @param {Object[]} cells
 * @param {Object} dims - { width, height }
 * @param {number} rx
 * @param {number} ry
 * @param {number} rw
 * @param {number} rh
 * @returns {Object|null} { pixels: [{dx,dy,cell}], ax, ay, w, h, baseCells: null }
 */
export const collectSelectedPixels = (cells, dims, rx, ry, rw, rh) => {
  const { width, height } = dims;
  const found = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let y = ry; y < ry + rh; y += 1) {
    for (let x = rx; x < rx + rw; x += 1) {
      if (!inBounds(x, y, width, height)) continue;
      const cell = cells[y * width + x];
      if (isEmptyCell(cell)) continue;
      found.push({ x, y, cell: { ...cell } });
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (found.length === 0) return null;
  const pixels = found.map((p) => ({ dx: p.x - minX, dy: p.y - minY, cell: p.cell }));
  return { pixels, ax: minX, ay: minY, w: maxX - minX + 1, h: maxY - minY + 1, baseCells: null };
};

/**
 * Returns new cells with the given selection pixels removed (set empty).
 * @param {Object[]} cells
 * @param {Object} dims - { width, height }
 * @param {Array<{dx:number,dy:number}>} pixels
 * @param {number} ax - anchor x
 * @param {number} ay - anchor y
 * @returns {Object[]}
 */
export const removePixelsAt = (cells, dims, pixels, ax, ay) => {
  const { width, height } = dims;
  const next = cells.slice();
  for (const p of pixels) {
    const x = ax + p.dx;
    const y = ay + p.dy;
    if (inBounds(x, y, width, height)) next[y * width + x] = emptyCell();
  }
  return next;
};

/**
 * Returns new cells with the selection pixels pasted at an anchor (clipped).
 * @param {Object[]} cells
 * @param {Object} dims - { width, height }
 * @param {Array<{dx:number,dy:number,cell:Object}>} pixels
 * @param {number} ax
 * @param {number} ay
 * @returns {Object[]}
 */
export const pastePixelsAt = (cells, dims, pixels, ax, ay) => {
  const { width, height } = dims;
  const next = cells.slice();
  for (const p of pixels) {
    if (isEmptyCell(p.cell)) continue;
    const x = ax + p.dx;
    const y = ay + p.dy;
    if (inBounds(x, y, width, height)) next[y * width + x] = { ...p.cell };
  }
  return next;
};

/**
 * Builds a dense w*h grid (row major) of cells (or null) from a sparse list of
 * selection pixels. Used as the immutable source for transformed rasterising.
 * @param {Array<{dx:number,dy:number,cell:Object}>} pixels
 * @param {number} w
 * @param {number} h
 * @returns {Array<Object|null>}
 */
export const buildSrcGrid = (pixels, w, h) => {
  const grid = new Array(w * h).fill(null);
  for (const p of pixels) {
    if (p.dx < 0 || p.dy < 0 || p.dx >= w || p.dy >= h) continue;
    grid[p.dy * w + p.dx] = p.cell;
  }
  return grid;
};

/**
 * Rasterises a transformed floating selection onto a backdrop using inverse
 * nearest-neighbour sampling, so scaling up and free rotation leave no holes.
 * The selection's source rectangle (w x h) is scaled, rotated about its centre
 * and placed at (cx, cy) in cell coordinates.
 * @param {Object[]} baseCells - backdrop (layer with the selection removed)
 * @param {Object} dims - { width, height }
 * @param {Object} t - { srcGrid, w, h, cx, cy, scaleX, scaleY, angle }
 * @returns {Object[]} new cells
 */
export const pasteTransformed = (baseCells, dims, t) => {
  const { width, height } = dims;
  const { srcGrid, w, h, cx, cy, angle } = t;
  const scaleX = Math.abs(t.scaleX) < 1e-4 ? 1e-4 : t.scaleX;
  const scaleY = Math.abs(t.scaleY) < 1e-4 ? 1e-4 : t.scaleY;
  const next = baseCells.slice();
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Transformed-rectangle bounding box (in cell space) to bound the scan.
  const hw = (w / 2) * Math.abs(scaleX);
  const hh = (h / 2) * Math.abs(scaleY);
  const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [lx, ly] of corners) {
    const wx = cx + lx * cos - ly * sin;
    const wy = cy + lx * sin + ly * cos;
    if (wx < minX) minX = wx;
    if (wx > maxX) maxX = wx;
    if (wy < minY) minY = wy;
    if (wy > maxY) maxY = wy;
  }
  const x0 = Math.max(0, Math.floor(minX));
  const x1 = Math.min(width - 1, Math.ceil(maxX));
  const y0 = Math.max(0, Math.floor(minY));
  const y1 = Math.min(height - 1, Math.ceil(maxY));

  for (let ty = y0; ty <= y1; ty += 1) {
    for (let tx = x0; tx <= x1; tx += 1) {
      const wx = tx + 0.5 - cx;
      const wy = ty + 0.5 - cy;
      // Inverse rotate then inverse scale into source-centred coordinates.
      const rx = (wx * cos + wy * sin) / scaleX;
      const ry = (-wx * sin + wy * cos) / scaleY;
      const su = Math.floor(rx + w / 2);
      const sv = Math.floor(ry + h / 2);
      if (su < 0 || sv < 0 || su >= w || sv >= h) continue;
      const cell = srcGrid[sv * w + su];
      if (!cell || isEmptyCell(cell)) continue;
      next[ty * width + tx] = { ...cell };
    }
  }
  return next;
};

