/**
 * Factory sprite helpers.
 *
 * Decodes the compact RLE/palette-indexed sprite data (factorySpriteData.js) into
 * the PXLS data model so it can be drawn with the existing PXLS renderer
 * (compositeToCanvas) and, if wanted, opened/edited in the /pxls editor.
 */

import { FACTORY_SPRITES } from './factorySpriteData';

/** Expand an RLE frame ([index,count] pairs) into a flat palette-index array. */
export const decodeFrame = (rle, length) => {
  const out = new Array(length).fill(0);
  let i = 0;
  for (const [value, count] of rle) {
    for (let k = 0; k < count && i < length; k += 1, i += 1) out[i] = value;
  }
  return out;
};

/**
 * Convert a decoded frame into a PXLS cells array. Index 0 is transparent; vivid
 * accent indices (sprite.glowIndices) get a soft glow effect for the material bits.
 */
const frameToCells = (indices, palette, glowIndices) =>
  indices.map((idx) => {
    if (idx === 0 || !palette[idx]) return { color: null, alpha: 0, effect: null };
    const effect = glowIndices.includes(idx) ? { type: 'glow', intensity: 0.5 } : null;
    return { color: palette[idx], alpha: 1, effect };
  });

/**
 * Build a minimal PXLS project for a single animation frame, ready for
 * compositeToCanvas.
 * @returns {Object|null}
 */
export const spriteFrameToProject = (machineId, frameIndex) => {
  const sprite = FACTORY_SPRITES[machineId];
  if (!sprite) return null;
  const length = sprite.size * sprite.size;
  const frame = sprite.frames[frameIndex % sprite.frames.length];
  const cells = frameToCells(decodeFrame(frame, length), sprite.palette, sprite.glowIndices || []);
  return {
    width: sprite.size,
    height: sprite.size,
    seed: 1,
    layers: [{ id: `${machineId}_${frameIndex}`, name: 'frame', visible: true, opacity: 1, cells }],
  };
};

/** Number of animation frames a sprite has. */
export const spriteFrameCount = (machineId) => FACTORY_SPRITES[machineId]?.frames.length || 1;

/** Frames-per-second for a sprite's animation. */
export const spriteFps = (machineId) => FACTORY_SPRITES[machineId]?.fps || 4;

/**
 * Build a full PXLS project with every animation frame as a layer. Useful for
 * exporting a sprite into the /pxls editor for hand-tweaking.
 * @returns {Object|null}
 */
export const spriteToPxlsProject = (machineId) => {
  const sprite = FACTORY_SPRITES[machineId];
  if (!sprite) return null;
  const length = sprite.size * sprite.size;
  const layers = sprite.frames.map((frame, i) => ({
    id: `${machineId}_frame_${i}`,
    name: `Frame ${i + 1}`,
    visible: i === 0,
    opacity: 1,
    cells: frameToCells(decodeFrame(frame, length), sprite.palette, sprite.glowIndices || []),
  }));
  return {
    id: `factory_${machineId}`,
    name: `Factory ${machineId}`,
    width: sprite.size,
    height: sprite.size,
    layers,
    activeLayerId: layers[0].id,
    palette: sprite.palette.filter(Boolean),
    seed: 1,
    version: 1,
  };
};
