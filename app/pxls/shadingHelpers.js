/**
 * PXLS Shading Helpers
 *
 * Distance based directional shading. Given a light source position, every
 * painted cell on a layer is shifted lighter or darker depending on how close
 * it is to the light: the nearest painted pixels are lightened the most and the
 * farthest are darkened the most, with a smooth falloff between. The shift is
 * baked directly into each cell's colour (one colour per cell).
 */

import { hexToRgb } from './renderHelpers';
import { isEmptyCell } from './pxlsModel';

/**
 * @param {number} v
 * @returns {string} clamped two digit hex
 */
const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');

const mix = (a, b, t) => a + (b - a) * t;

/**
 * Shifts a colour toward white (positive shift) or black (negative shift).
 * @param {string} hex - '#rrggbb'
 * @param {number} shift - -1..1 (toward black .. toward white)
 * @returns {string} '#rrggbb'
 */
export const shadeColor = (hex, shift) => {
  const { r, g, b } = hexToRgb(hex);
  const target = shift >= 0 ? 255 : 0;
  const t = Math.min(1, Math.abs(shift));
  return `#${toHex(mix(r, target, t))}${toHex(mix(g, target, t))}${toHex(mix(b, target, t))}`;
};

/**
 * Bakes distance based shading into a layer's cells.
 * @param {Object[]} cells
 * @param {Object} dims - { width, height }
 * @param {number} lx - light x in cell units
 * @param {number} ly - light y in cell units
 * @param {number} strength - 0..1 max lighten/darken at the extremes
 * @returns {Object[]} new cells (empty cells untouched)
 */
export const applyShading = (cells, dims, lx, ly, strength) => {
  const { width } = dims;
  const dist = new Array(cells.length);
  let dmin = Infinity;
  let dmax = -Infinity;

  for (let i = 0; i < cells.length; i += 1) {
    if (isEmptyCell(cells[i])) { dist[i] = -1; continue; }
    const x = i % width;
    const y = Math.floor(i / width);
    const dx = x + 0.5 - lx;
    const dy = y + 0.5 - ly;
    const d = Math.sqrt(dx * dx + dy * dy);
    dist[i] = d;
    if (d < dmin) dmin = d;
    if (d > dmax) dmax = d;
  }

  if (dmax < 0) return cells; // nothing painted
  const range = dmax - dmin || 1;

  const next = cells.slice();
  for (let i = 0; i < cells.length; i += 1) {
    if (dist[i] < 0) continue;
    const t = (dist[i] - dmin) / range; // 0 nearest, 1 farthest
    const shift = strength * (1 - 2 * t); // +strength nearest, -strength farthest
    next[i] = { ...cells[i], color: shadeColor(cells[i].color, shift) };
  }
  return next;
};
