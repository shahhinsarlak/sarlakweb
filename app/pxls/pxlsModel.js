/**
 * PXLS Model
 *
 * Pure factory and transform helpers for the PXLS data model:
 * - createCell / emptyCell
 * - createLayer
 * - createProject
 * - cloneCells / resizeProject helpers
 * - validateProject for JSON import
 *
 * Coordinate convention: cells are a flat row major array, index = y * width + x.
 */

import { SCHEMA_VERSION, DEFAULT_PALETTE, DEFAULT_CANVAS_SIZE } from './constants';

let idCounter = 0;

/**
 * Generates a short unique id. Combines time and a counter so ids stay unique
 * even when created in the same millisecond.
 * @returns {string}
 */
export const makeId = () => {
  idCounter += 1;
  return `${Date.now().toString(36)}${idCounter.toString(36)}`;
};

/**
 * Creates an empty (transparent) cell.
 * @returns {{ color: null, alpha: number, effect: null }}
 */
export const emptyCell = () => ({ color: null, alpha: 0, effect: null });

/**
 * Creates a painted cell.
 * @param {string} color - hex colour string
 * @param {number} alpha - 0..1
 * @param {Object|null} effect - { type, intensity } or null
 * @returns {Object}
 */
export const createCell = (color, alpha = 1, effect = null) => ({
  color,
  alpha,
  effect: effect ? { type: effect.type, intensity: effect.intensity } : null,
});

/**
 * True when a cell holds no paint.
 * @param {Object} cell
 * @returns {boolean}
 */
export const isEmptyCell = (cell) => !cell || cell.color === null || cell.alpha <= 0;

/**
 * Creates a blank layer sized to width*height.
 * @param {number} width
 * @param {number} height
 * @param {string} name
 * @returns {Object}
 */
export const createLayer = (width, height, name = 'Layer 1') => ({
  id: makeId(),
  name,
  visible: true,
  opacity: 1,
  cells: Array.from({ length: width * height }, emptyCell),
});

/**
 * Creates a layer from an existing cells array (e.g. an imported image).
 * @param {string} name
 * @param {Object[]} cells
 * @returns {Object}
 */
export const createLayerFromCells = (name, cells) => ({
  id: makeId(),
  name,
  visible: true,
  opacity: 1,
  cells,
});

/**
 * Creates a new project with a single blank layer.
 * @param {Object} [opts]
 * @param {string} [opts.name]
 * @param {number} [opts.size] - square dimension
 * @returns {Object}
 */
export const createProject = ({ name = 'Untitled', size = DEFAULT_CANVAS_SIZE } = {}) => {
  const layer = createLayer(size, size, 'Layer 1');
  const now = Date.now();
  return {
    id: makeId(),
    name,
    width: size,
    height: size,
    layers: [layer],
    activeLayerId: layer.id,
    palette: [],
    seed: Math.floor(Math.random() * 1e9),
    createdAt: now,
    updatedAt: now,
    version: SCHEMA_VERSION,
  };
};

/**
 * Deep clones a cells array (cells are shallow plain objects).
 * @param {Object[]} cells
 * @returns {Object[]}
 */
export const cloneCells = (cells) => cells.map((c) => ({
  color: c.color,
  alpha: c.alpha,
  effect: c.effect ? { type: c.effect.type, intensity: c.effect.intensity } : null,
}));

/**
 * Returns the active layer of a project.
 * @param {Object} project
 * @returns {Object|undefined}
 */
export const getActiveLayer = (project) =>
  project.layers.find((l) => l.id === project.activeLayerId);

/**
 * Validates a parsed JSON object as a PXLS project. Throws on invalid shape.
 * @param {any} data
 * @returns {Object} a normalised project
 */
export const validateProject = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('File is not a PXLS project.');
  }
  if (typeof data.width !== 'number' || typeof data.height !== 'number') {
    throw new Error('Project is missing canvas dimensions.');
  }
  if (!Array.isArray(data.layers) || data.layers.length === 0) {
    throw new Error('Project has no layers.');
  }
  const cellCount = data.width * data.height;
  const layers = data.layers.map((layer, i) => {
    if (!Array.isArray(layer.cells) || layer.cells.length !== cellCount) {
      throw new Error(`Layer ${i + 1} has the wrong number of cells.`);
    }
    return {
      id: layer.id || makeId(),
      name: layer.name || `Layer ${i + 1}`,
      visible: layer.visible !== false,
      opacity: typeof layer.opacity === 'number' ? layer.opacity : 1,
      cells: layer.cells.map((c) =>
        (c && c.color)
          ? createCell(c.color, typeof c.alpha === 'number' ? c.alpha : 1, c.effect)
          : emptyCell()),
    };
  });
  const activeLayerId = layers.some((l) => l.id === data.activeLayerId)
    ? data.activeLayerId
    : layers[0].id;
  const now = Date.now();
  return {
    id: data.id || makeId(),
    name: typeof data.name === 'string' ? data.name : 'Imported',
    width: data.width,
    height: data.height,
    layers,
    activeLayerId,
    palette: Array.isArray(data.palette) ? data.palette.filter((p) => typeof p === 'string') : [],
    seed: typeof data.seed === 'number' ? data.seed : Math.floor(Math.random() * 1e9),
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : now,
    updatedAt: now,
    version: SCHEMA_VERSION,
  };
};

export { DEFAULT_PALETTE };
