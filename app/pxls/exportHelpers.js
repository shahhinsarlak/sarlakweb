/**
 * PXLS Export Helpers
 *
 * Builds downloadable artefacts from a project:
 * - PNG at a chosen integer scale (nearest neighbour, crisp)
 * - SVG (one rect per non empty pixel, crispEdges)
 * - JSON (the re importable project)
 *
 * The user supplies the full filename; we only append the correct extension
 * when it is missing.
 */

import { compositeToCanvas, resolveRgb } from './renderHelpers';
import { isEmptyCell } from './pxlsModel';
import { EXPORT_FORMATS } from './constants';

/**
 * Ensures a filename ends with the right extension for a format.
 * @param {string} name
 * @param {string} format - 'png'|'svg'|'json'
 * @returns {string}
 */
export const withExtension = (name, format) => {
  const ext = EXPORT_FORMATS[format].ext;
  const trimmed = (name || '').trim() || 'pxls-art';
  const lower = trimmed.toLowerCase();
  return lower.endsWith(`.${ext}`) ? trimmed : `${trimmed}.${ext}`;
};

/**
 * Triggers a browser download for a blob.
 * @param {Blob} blob
 * @param {string} filename
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Exports the project as a PNG.
 * @param {Object} project
 * @param {Object} opts - { scale, background (hex|null), includeEffects, filename }
 * @returns {Promise<void>}
 */
export const exportPNG = (project, opts) => new Promise((resolve, reject) => {
  const { scale = 1, background = null, includeEffects = true, filename } = opts;
  const canvas = document.createElement('canvas');
  compositeToCanvas(canvas, project, scale, { includeEffects, background });
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error('Failed to render PNG.'));
      return;
    }
    downloadBlob(blob, withExtension(filename, 'png'));
    resolve();
  }, 'image/png');
});

/**
 * Builds an SVG string for the project.
 * @param {Object} project
 * @param {Object} opts - { scale, background, includeEffects }
 * @returns {string}
 */
export const buildSVG = (project, opts) => {
  const { scale = 1, background = null, includeEffects = true } = opts;
  const { width, height, layers, seed } = project;
  const w = width * scale;
  const h = height * scale;

  const rects = [];

  for (const layer of layers) {
    if (!layer.visible) continue;
    const { cells, opacity } = layer;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = y * width + x;
        const cell = cells[idx];
        if (isEmptyCell(cell)) continue;
        const right = x + 1 < width ? cells[idx + 1] : null;
        const { r, g, b } = resolveRgb(cell, right, seed, idx, width, includeEffects);
        const a = +(cell.alpha * opacity).toFixed(3);
        rects.push(
          `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" `
          + `fill="rgb(${r},${g},${b})"${a < 1 ? ` fill-opacity="${a}"` : ''}/>`,
        );
      }
    }
  }

  const bg = background
    ? `<rect x="0" y="0" width="${w}" height="${h}" fill="${background}"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `
    + `viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">`
    + `${bg}${rects.join('')}</svg>`;
};

/**
 * Exports the project as an SVG file.
 * @param {Object} project
 * @param {Object} opts - { scale, background, includeEffects, filename }
 */
export const exportSVG = (project, opts) => {
  const svg = buildSVG(project, opts);
  downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), withExtension(opts.filename, 'svg'));
};

/**
 * Exports the project as a re importable JSON file.
 * @param {Object} project
 * @param {Object} opts - { filename }
 */
export const exportJSON = (project, opts) => {
  const json = JSON.stringify(project, null, 2);
  downloadBlob(new Blob([json], { type: 'application/json' }), withExtension(opts.filename, 'json'));
};
