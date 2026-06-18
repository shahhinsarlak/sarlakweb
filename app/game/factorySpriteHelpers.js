/**
 * Factory sprite helpers.
 *
 * Decodes the compact RLE/palette-indexed sprite data (factorySpriteData.js) into
 * the PXLS data model so it can be drawn with the existing PXLS renderer
 * (compositeToCanvas) and, if wanted, opened/edited in the /pxls editor.
 *
 * Each machine has an animated base (4 frames) plus static attachment overlays
 * that turn on once the machine's upgrade level reaches each attachment's atLevel.
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

/** Native pixel size (square) of a sprite. */
export const spriteSize = (machineId) => FACTORY_SPRITES[machineId]?.size || 64;

/** Number of animation frames a sprite has. */
export const spriteFrameCount = (machineId) => FACTORY_SPRITES[machineId]?.baseFrames.length || 1;

/** Frames-per-second for a sprite's animation. */
export const spriteFps = (machineId) => FACTORY_SPRITES[machineId]?.fps || 4;

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

const makeLayer = (id, name, rle, sprite, palette) => ({
  id,
  name,
  visible: true,
  opacity: 1,
  cells: frameToCells(decodeFrame(rle, sprite.size * sprite.size), palette || sprite.palette, sprite.glowIndices || []),
});

// --- accent recolour (the Transmuter sprite reflects its target material) ---
const hexToRgb = (hex) => { const n = parseInt(hex.replace('#', ''), 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; };
const toHex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const x = hexToRgb(a); const y = hexToRgb(b); return toHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t }); };

/** Clone a sprite palette, overriding the accent shades (indices 19-22) with the given colour. */
const paletteWithAccent = (palette, accentColor) => {
  if (!accentColor) return palette;
  const p = [...palette];
  p[19] = mix(accentColor, '#000000', 0.4);
  p[20] = accentColor;
  p[21] = mix(accentColor, '#ffffff', 0.35);
  p[22] = mix(accentColor, '#ffffff', 0.7);
  return p;
};

/**
 * Build a PXLS project for a single animation frame at a given upgrade level:
 * the base frame plus every attachment whose atLevel <= level. An optional
 * accentColor recolours the vivid accent shades (used so the Transmuter shows the
 * colour of the material it is currently producing).
 * @returns {Object|null}
 */
export const spriteFrameToProject = (machineId, frameIndex, level = 0, accentColor = null) => {
  const sprite = FACTORY_SPRITES[machineId];
  if (!sprite) return null;
  const palette = paletteWithAccent(sprite.palette, accentColor);
  const frame = sprite.baseFrames[frameIndex % sprite.baseFrames.length];
  const layers = [makeLayer(`${machineId}_base_${frameIndex}`, 'base', frame, sprite, palette)];
  (sprite.attachments || []).forEach((att, i) => {
    if (level >= att.atLevel) {
      layers.push(makeLayer(`${machineId}_att_${i}`, `attachment ${att.atLevel}`, att.cells, sprite, palette));
    }
  });
  return { width: sprite.size, height: sprite.size, seed: 1, layers };
};

/**
 * Build a full PXLS project (base frames + every attachment as layers) for editing
 * a sprite in the /pxls editor.
 * @returns {Object|null}
 */
export const spriteToPxlsProject = (machineId) => {
  const sprite = FACTORY_SPRITES[machineId];
  if (!sprite) return null;
  const layers = sprite.baseFrames.map((frame, i) => ({
    ...makeLayer(`${machineId}_frame_${i}`, `Frame ${i + 1}`, frame, sprite),
    visible: i === 0,
  }));
  (sprite.attachments || []).forEach((att, i) => {
    layers.push(makeLayer(`${machineId}_att_${i}`, `Attachment L${att.atLevel}`, att.cells, sprite));
  });
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
