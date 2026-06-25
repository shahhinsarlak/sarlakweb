/**
 * PXLS Model
 *
 * Pure factory and transform helpers for the PXLS data model:
 * - createCell / emptyCell
 * - createLayer / duplicateLayer / makeEmptyCells
 * - createProject
 * - cloneCells / resizeProject helpers
 * - validateProject for JSON import
 *
 * Coordinate convention: cells are a flat row major array, index = y * width + x.
 */

import { SCHEMA_VERSION, DEFAULT_PALETTE, DEFAULT_CANVAS_SIZE, DEFAULT_FPS, MIN_FPS, MAX_FPS } from './constants';

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
 * Generates a random 32 bit unsigned seed for per-cell noise grain.
 * @returns {number}
 */
export const makeNoiseSeed = () => Math.floor(Math.random() * 0xffffffff);

/**
 * Normalises an effect to a plain stored shape. Noise carries a per-cell random
 * seed so its grain belongs to the pixel and travels with it when moved; an
 * existing seed is preserved, otherwise a fresh one is generated.
 * @param {Object|null} effect - { type, intensity, seed? } or null
 * @returns {Object|null}
 */
export const normalizeEffect = (effect) => {
  if (!effect) return null;
  // Glow was removed as an effect; drop it from any older saved project.
  if (effect.type === 'glow') return null;
  if (effect.type === 'noise') {
    return {
      type: 'noise',
      intensity: effect.intensity,
      seed: typeof effect.seed === 'number' ? effect.seed : makeNoiseSeed(),
    };
  }
  return { type: effect.type, intensity: effect.intensity };
};

/**
 * Builds a fresh effect instance for a newly painted cell. Like normalizeEffect
 * but always assigns a NEW random seed to noise, so each painted pixel gets its
 * own grain rather than sharing one value across a stroke.
 * @param {Object|null} effect
 * @returns {Object|null}
 */
export const instanceEffect = (effect) => {
  if (!effect) return null;
  if (effect.type === 'glow') return null;
  if (effect.type === 'noise') {
    return { type: 'noise', intensity: effect.intensity, seed: makeNoiseSeed() };
  }
  return { type: effect.type, intensity: effect.intensity };
};

/**
 * Creates a painted cell.
 * @param {string} color - hex colour string
 * @param {number} alpha - 0..1
 * @param {Object|null} effect - { type, intensity, seed? } or null
 * @returns {Object}
 */
export const createCell = (color, alpha = 1, effect = null) => ({
  color,
  alpha,
  effect: normalizeEffect(effect),
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
 * Duplicates a layer, deep cloning its cells and assigning a fresh id.
 * @param {Object} layer
 * @param {string} [name] - name for the copy (defaults to "<name> copy")
 * @returns {Object}
 */
export const duplicateLayer = (layer, name) => ({
  id: makeId(),
  name: name || `${layer.name} copy`,
  visible: layer.visible,
  opacity: layer.opacity,
  cells: cloneCells(layer.cells),
});

/**
 * Builds a fresh array of empty (transparent) cells for a width*height canvas.
 * @param {number} width
 * @param {number} height
 * @returns {Object[]}
 */
export const makeEmptyCells = (width, height) =>
  Array.from({ length: width * height }, emptyCell);

/**
 * Creates a blank frame containing a single layer.
 * @param {number} width
 * @param {number} height
 * @param {string} [name]
 * @returns {Object} { id, name, layers, activeLayerId }
 */
export const createFrame = (width, height, name = 'Frame 1') => {
  const layer = createLayer(width, height, 'Layer 1');
  return { id: makeId(), name, layers: [layer], activeLayerId: layer.id };
};

/**
 * Duplicates a frame, deep cloning every layer (fresh ids) and preserving which
 * layer is active by position.
 * @param {Object} frame
 * @param {string} [name] - name for the copy (defaults to "<name> copy")
 * @returns {Object}
 */
export const duplicateFrame = (frame, name) => {
  const activeIndex = Math.max(0, frame.layers.findIndex((l) => l.id === frame.activeLayerId));
  const layers = frame.layers.map((l) => ({
    id: makeId(),
    name: l.name,
    visible: l.visible,
    opacity: l.opacity,
    cells: cloneCells(l.cells),
  }));
  return {
    id: makeId(),
    name: name || `${frame.name} copy`,
    layers,
    activeLayerId: (layers[activeIndex] || layers[0]).id,
  };
};

/**
 * Creates a new project with a single frame (one blank layer).
 * @param {Object} [opts]
 * @param {string} [opts.name]
 * @param {number} [opts.size] - square dimension
 * @returns {Object}
 */
export const createProject = ({ name = 'Untitled', size = DEFAULT_CANVAS_SIZE } = {}) => {
  const frame = createFrame(size, size, 'Frame 1');
  const now = Date.now();
  return {
    id: makeId(),
    name,
    width: size,
    height: size,
    frames: [frame],
    activeFrameId: frame.id,
    fps: DEFAULT_FPS,
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
  effect: c.effect
    ? {
      type: c.effect.type,
      intensity: c.effect.intensity,
      ...(typeof c.effect.seed === 'number' ? { seed: c.effect.seed } : {}),
    }
    : null,
}));

/**
 * Returns the active layer of a frame-scoped project (one with a `layers`
 * array). Used by the canvas and renderer, which receive a frame view.
 * @param {Object} project
 * @returns {Object|undefined}
 */
export const getActiveLayer = (project) =>
  project.layers.find((l) => l.id === project.activeLayerId);

/**
 * Returns the active frame of a project (falls back to the first frame).
 * @param {Object} project
 * @returns {Object}
 */
export const getActiveFrame = (project) =>
  project.frames.find((f) => f.id === project.activeFrameId) || project.frames[0];

/**
 * Returns the active layer of the active frame.
 * @param {Object} project
 * @returns {Object|undefined}
 */
export const getActiveFrameLayer = (project) => {
  const frame = getActiveFrame(project);
  return frame && frame.layers.find((l) => l.id === frame.activeLayerId);
};

/**
 * Builds a frame-scoped project for rendering: a shallow project clone whose
 * `layers`/`activeLayerId` come from the given frame. Lets the renderer, canvas,
 * thumbnails and GIF export stay frame-agnostic.
 * @param {Object} project
 * @param {Object} frame
 * @returns {Object}
 */
export const frameView = (project, frame) => ({
  ...project,
  layers: frame.layers,
  activeLayerId: frame.activeLayerId,
});

/**
 * Picks the topmost visible, non-empty cell at (x, y) across all of a
 * frame-scoped project's layers (top layer wins). Used by the eyedropper so it
 * samples the composited art, not just the active layer.
 * @param {Object} project - a frame view (has `layers`)
 * @param {number} x
 * @param {number} y
 * @returns {Object|null}
 */
export const pickTopCell = (project, x, y) => {
  const idx = y * project.width + x;
  for (let i = project.layers.length - 1; i >= 0; i -= 1) {
    const layer = project.layers[i];
    if (!layer.visible) continue;
    const cell = layer.cells[idx];
    if (!isEmptyCell(cell)) return cell;
  }
  return null;
};

/**
 * Validates and normalises a single layer against a cell count.
 * @param {Object} layer
 * @param {number} i - index for error messages
 * @param {number} cellCount
 * @returns {Object}
 */
const normalizeLayer = (layer, i, cellCount) => {
  if (!layer || !Array.isArray(layer.cells) || layer.cells.length !== cellCount) {
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
};

/**
 * Validates a parsed JSON object as a PXLS project. Throws on invalid shape.
 * Legacy projects (top-level `layers`, no `frames`) are migrated into a single
 * frame so older saves and exports keep working.
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
  const cellCount = data.width * data.height;

  // Source frames: prefer `frames`, else migrate a legacy single layer set.
  let sourceFrames;
  if (Array.isArray(data.frames) && data.frames.length > 0) {
    sourceFrames = data.frames;
  } else if (Array.isArray(data.layers) && data.layers.length > 0) {
    sourceFrames = [{ name: 'Frame 1', layers: data.layers, activeLayerId: data.activeLayerId }];
  } else {
    throw new Error('Project has no frames or layers.');
  }

  const frames = sourceFrames.map((frame, fi) => {
    if (!frame || !Array.isArray(frame.layers) || frame.layers.length === 0) {
      throw new Error(`Frame ${fi + 1} has no layers.`);
    }
    const layers = frame.layers.map((layer, i) => normalizeLayer(layer, i, cellCount));
    const activeLayerId = layers.some((l) => l.id === frame.activeLayerId)
      ? frame.activeLayerId
      : layers[0].id;
    return {
      id: frame.id || makeId(),
      name: frame.name || `Frame ${fi + 1}`,
      layers,
      activeLayerId,
    };
  });

  const activeFrameId = frames.some((f) => f.id === data.activeFrameId)
    ? data.activeFrameId
    : frames[0].id;
  const fps = typeof data.fps === 'number'
    ? Math.max(MIN_FPS, Math.min(MAX_FPS, Math.round(data.fps)))
    : DEFAULT_FPS;
  const now = Date.now();
  return {
    id: data.id || makeId(),
    name: typeof data.name === 'string' ? data.name : 'Imported',
    width: data.width,
    height: data.height,
    frames,
    activeFrameId,
    fps,
    palette: Array.isArray(data.palette) ? data.palette.filter((p) => typeof p === 'string') : [],
    seed: typeof data.seed === 'number' ? data.seed : Math.floor(Math.random() * 1e9),
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : now,
    updatedAt: now,
    version: SCHEMA_VERSION,
  };
};

export { DEFAULT_PALETTE };
