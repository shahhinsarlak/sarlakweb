import React, { useEffect, useMemo, useRef } from 'react';
import { getCraftSprite } from './craftSprites';

/**
 * CraftSprite — renders a crafted item's pixel art (gear / provision / shell)
 * on a scaled canvas. When `building` is set it plays the same one-shot
 * "fabrication" reveal as the weapon roll: pixels coalesce out of accent-tinted
 * static into the finished sprite.
 */
const GRID = 16;

function CraftSprite({ id, size = 40, building = false }) {
  const ref = useRef(null);
  const data = useMemo(() => getCraftSprite(id), [id]);
  const startRef = useRef(0);
  const buildingRef = useRef(building);
  buildingRef.current = building;

  useEffect(() => { startRef.current = performance.now(); }, [building, id]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data) return undefined;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const s = size / GRID;
    const { pixels, palette } = data;
    const accent = palette.c || '#9fe8ff';
    const colorFor = (t) => palette[t] || '#cccccc';
    let raf;

    const draw = () => {
      const t = performance.now();
      const elapsed = t - startRef.current;
      const buildT = buildingRef.current ? Math.min(1, elapsed / 1100) : 1;
      ctx.clearRect(0, 0, size, size);
      const reveal = Math.floor(buildT * pixels.length);
      pixels.forEach((p, i) => {
        let col;
        if (i < reveal || !buildingRef.current) {
          col = colorFor(p.t);
          if (p.t === 'c') {
            ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t / 220 + p.x);
          }
        } else if (Math.random() > 0.55) {
          ctx.globalAlpha = 0.5;
          col = accent;
        } else {
          return;
        }
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(p.x * s), Math.round(p.y * s), Math.ceil(s), Math.ceil(s));
        ctx.globalAlpha = 1;
      });
      if (buildingRef.current && buildT < 1) raf = requestAnimationFrame(draw);
      else if (pixels.some((p) => p.t === 'c')) raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [data, size]);

  if (!data) return null;
  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px`, imageRendering: 'pixelated', flexShrink: 0 }}
    />
  );
}

CraftSprite.displayName = 'CraftSprite';
export default CraftSprite;
