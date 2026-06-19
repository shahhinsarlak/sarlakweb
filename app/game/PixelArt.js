import React, { useEffect, useMemo, useRef } from 'react';

/**
 * PixelArt — renders a 128x128 procedural pixel-art sprite (painted by a `paint`
 * callback) onto a scaled, crisp canvas. When `building` is set it plays a
 * dissolve "materialise" reveal: the finished pixels appear in random order out
 * of an accent-tinted glow, the same idea as the weapon-roll fabrication but at
 * full 128 resolution.
 *
 * Props:
 *   paintKey  - string identity for the art (memoises the offscreen buffer)
 *   paint     - (ctx128) => void  draws the sprite at 128x128
 *   size      - display size in px (scaled with nearest-neighbour)
 *   building  - play the materialise animation once
 *   accent    - glow colour for the materialise
 */
export const RES = 128;

function PixelArt({ paintKey, paint, size = 128, building = false, accent = '#9fe8ff' }) {
  const ref = useRef(null);
  const startRef = useRef(0);
  const buildingRef = useRef(building);
  buildingRef.current = building;

  // Offscreen finished sprite + shuffled list of opaque pixel indices.
  const buf = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const off = document.createElement('canvas');
    off.width = RES;
    off.height = RES;
    const octx = off.getContext('2d');
    octx.imageSmoothingEnabled = false;
    paint(octx);
    const img = octx.getImageData(0, 0, RES, RES);
    const filled = [];
    for (let i = 0; i < RES * RES; i += 1) {
      if (img.data[i * 4 + 3] > 12) filled.push(i);
    }
    for (let i = filled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = filled[i];
      filled[i] = filled[j];
      filled[j] = tmp;
    }
    return { off, img, filled };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paintKey]);

  useEffect(() => { startRef.current = performance.now(); }, [building, paintKey]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !buf) return undefined;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    let raf;
    const work = document.createElement('canvas');
    work.width = RES;
    work.height = RES;
    const wctx = work.getContext('2d');
    const wimg = wctx.createImageData(RES, RES);
    let revealed = 0;

    const draw = () => {
      const elapsed = performance.now() - startRef.current;
      const bt = buildingRef.current ? Math.min(1, elapsed / 900) : 1;
      ctx.clearRect(0, 0, size, size);
      if (!buildingRef.current || bt >= 1) {
        ctx.drawImage(buf.off, 0, 0, size, size);
        return;
      }
      const target = Math.floor(bt * buf.filled.length);
      for (; revealed < target; revealed += 1) {
        const idx = buf.filled[revealed] * 4;
        wimg.data[idx] = buf.img.data[idx];
        wimg.data[idx + 1] = buf.img.data[idx + 1];
        wimg.data[idx + 2] = buf.img.data[idx + 2];
        wimg.data[idx + 3] = buf.img.data[idx + 3];
      }
      wctx.putImageData(wimg, 0, 0);
      ctx.drawImage(work, 0, 0, size, size);
      ctx.globalAlpha = (1 - bt) * 0.4;
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, size, size);
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [buf, size, accent, building]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px`, imageRendering: 'pixelated', flexShrink: 0 }}
    />
  );
}

PixelArt.displayName = 'PixelArt';
export default PixelArt;
