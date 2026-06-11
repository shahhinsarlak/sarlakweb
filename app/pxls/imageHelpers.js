/**
 * PXLS Image Helpers
 *
 * Converts an arbitrary raster image into the PXLS cell structure by box
 * sampling it down to the target canvas resolution. Source images of any size
 * are supported: the browser downsamples while drawing to a target sized
 * offscreen canvas, then each resulting pixel becomes one cell.
 */

import { emptyCell, createCell } from './pxlsModel';

// Pixels whose sampled alpha is below this (0..255) become empty cells.
const ALPHA_EMPTY = 8;

/**
 * Loads an image File into an HTMLImageElement.
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
export const loadImageFile = (file) => new Promise((resolve, reject) => {
  if (!file || !file.type.startsWith('image/')) {
    reject(new Error('That file is not an image.'));
    return;
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
  img.onerror = () => { reject(new Error('Could not read that image.')); URL.revokeObjectURL(url); };
  img.src = url;
});

/**
 * @param {number} v
 * @returns {string} two digit hex
 */
const toHex = (v) => v.toString(16).padStart(2, '0');

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string} '#rrggbb'
 */
const rgbToHex = (r, g, b) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;

/**
 * Computes the contain fit rectangle for a source image inside a target box.
 * @param {number} sw - source width
 * @param {number} sh - source height
 * @param {number} tw - target width
 * @param {number} th - target height
 * @returns {{ dx: number, dy: number, dw: number, dh: number }}
 */
const containRect = (sw, sh, tw, th) => {
  const scale = Math.min(tw / sw, th / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  return { dx: (tw - dw) / 2, dy: (th - dh) / 2, dw, dh };
};

/**
 * Downsamples an image into a cells array sized targetW * targetH. The image is
 * fit with "contain": the whole image is shown and any remaining area is left
 * transparent (empty cells). Each block's averaged colour is kept as true
 * colour with its alpha.
 * @param {HTMLImageElement} img
 * @param {number} targetW
 * @param {number} targetH
 * @returns {Object[]} cells (row major)
 */
export const imageToCells = (img, targetW, targetH) => {
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, targetW, targetH);

  const { dx, dy, dw, dh } = containRect(img.width, img.height, targetW, targetH);
  ctx.drawImage(img, dx, dy, dw, dh);

  const { data } = ctx.getImageData(0, 0, targetW, targetH);
  const cells = new Array(targetW * targetH);
  for (let i = 0; i < cells.length; i += 1) {
    const o = i * 4;
    const a = data[o + 3];
    cells[i] = a < ALPHA_EMPTY
      ? emptyCell()
      : createCell(rgbToHex(data[o], data[o + 1], data[o + 2]), a / 255, null);
  }
  return cells;
};
