/**
 * PXLS Animation Helpers
 *
 * Builds an animated GIF from a project's frames. Each frame is composited (with
 * its own layer stack and baked effects) onto an offscreen canvas at the chosen
 * integer scale, quantized to a 256 colour table, and written with a per frame
 * delay derived from the project fps. The GIF loops forever.
 *
 * GIF only supports 1 bit transparency, so a transparent background keeps fully
 * empty pixels clear and forces partial alpha to opaque; pick a solid white or
 * black background if you need smooth edges.
 */

import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { frameView } from './pxlsModel';
import { compositeToCanvas } from './renderHelpers';
import { withExtension } from './exportHelpers';

/**
 * Triggers a browser download for a byte array.
 * @param {Uint8Array} bytes
 * @param {string} mime
 * @param {string} filename
 */
const downloadBytes = (bytes, mime, filename) => {
  const blob = new Blob([bytes], { type: mime });
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
 * Encodes a project's frames into animated GIF bytes.
 * @param {Object} project
 * @param {Object} opts - { scale, background (hex|null), includeEffects, fps }
 * @returns {Uint8Array}
 */
export const buildGIF = (project, opts) => {
  const {
    scale = 1, background = null, includeEffects = true, fps = 8,
  } = opts;
  const w = project.width * scale;
  const h = project.height * scale;
  const delay = Math.max(10, Math.round(1000 / Math.max(1, fps)));
  const transparent = !background;

  const canvas = document.createElement('canvas');
  const gif = GIFEncoder();

  for (const frame of project.frames) {
    compositeToCanvas(canvas, frameView(project, frame), scale, { includeEffects, background });
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, w, h);

    if (transparent) {
      const palette = quantize(data, 256, {
        format: 'rgba4444', oneBitAlpha: true, clearAlpha: true,
      });
      const index = applyPalette(data, palette, 'rgba4444');
      const transparentIndex = palette.findIndex((c) => c.length === 4 && c[3] === 0);
      gif.writeFrame(index, w, h, {
        palette,
        delay,
        repeat: 0,
        transparent: transparentIndex >= 0,
        transparentIndex: transparentIndex >= 0 ? transparentIndex : 0,
      });
    } else {
      const palette = quantize(data, 256, { format: 'rgb565' });
      const index = applyPalette(data, palette, 'rgb565');
      gif.writeFrame(index, w, h, { palette, delay, repeat: 0 });
    }
  }

  gif.finish();
  return gif.bytes();
};

/**
 * Builds and downloads an animated GIF of the project.
 * @param {Object} project
 * @param {Object} opts - { scale, background, includeEffects, fps, filename }
 */
export const exportGIF = (project, opts) => {
  const bytes = buildGIF(project, opts);
  downloadBytes(bytes, 'image/gif', withExtension(opts.filename, 'gif'));
};
