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
 * fit with "contain" by default; an optional scale and pixel offset let the user
 * resize and reposition it before import. Areas the image does not cover stay
 * transparent (empty cells). Each block's averaged colour is kept as true
 * colour with its alpha.
 * @param {HTMLImageElement} img
 * @param {number} targetW
 * @param {number} targetH
 * @param {Object} [opts]
 * @param {number} [opts.scale=1] - multiplier on the contain fit size
 * @param {number} [opts.offsetX=0] - horizontal offset in target pixels
 * @param {number} [opts.offsetY=0] - vertical offset in target pixels
 * @returns {Object[]} cells (row major)
 */
export const imageToCells = (img, targetW, targetH, opts = {}) => {
  const { scale = 1, offsetX = 0, offsetY = 0 } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, targetW, targetH);

  const base = containRect(img.width, img.height, targetW, targetH);
  const dw = base.dw * scale;
  const dh = base.dh * scale;
  const dx = (targetW - dw) / 2 + offsetX;
  const dy = (targetH - dh) / 2 + offsetY;
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
