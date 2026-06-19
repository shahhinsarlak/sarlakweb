import React, { useEffect, useMemo, useRef } from 'react';
import { mulberry32, hashSeed } from './expeditionChart';

/**
 * MindPortrait - a small procedural pixel portrait, seeded from the mind's id so
 * each printed copy looks like an individual. Symmetric 16x16, deliberately
 * muted; scars stamp red marks. When `building` is set it plays the same
 * "fabrication" reveal as the weapon roll (used when a mind is freshly printed).
 */
const GRID = 16;

function MindPortrait({ mind, size = 48, building = false }) {
  const ref = useRef(null);
  const scarCount = mind ? (mind.scars || []).length : 0;
  const key = mind ? `${mind.id}|${mind.level}|${scarCount}` : 'none';
  const startRef = useRef(0);
  const buildingRef = useRef(building);
  buildingRef.current = building;

  const pixels = useMemo(() => {
    if (!mind) return [];
    const rng = mulberry32(hashSeed(mind.id));
    const list = [];
    const tints = ['#3a4250', '#3f3a4a', '#384a44', '#4a4440', '#404048'];
    const base = tints[Math.floor(rng() * tints.length)];
    const lighter = '#9aa0ac';
    const dark = '#15151c';
    const push = (x, y, color) => {
      list.push({ x, y, color });
      list.push({ x: GRID - 1 - x, y, color });
    };
    for (let y = 2; y < 14; y += 1) {
      const inset = y < 4 ? 4 : y > 12 ? 4 : 2;
      for (let x = inset; x < 8; x += 1) push(x, y, base);
    }
    for (let i = 0; i < 14; i += 1) {
      const x = 2 + Math.floor(rng() * 6);
      const y = 3 + Math.floor(rng() * 10);
      if (rng() > 0.5) push(x, y, lighter);
    }
    const eyeY = 6 + Math.floor(rng() * 2);
    const eyeX = 3 + Math.floor(rng() * 1);
    push(eyeX, eyeY, rng() > 0.5 ? '#cfd6e0' : dark);
    if (rng() > 0.5) push(eyeX, eyeY - 1, lighter);
    const mY = 10 + Math.floor(rng() * 2);
    for (let x = 4; x < 7; x += 1) if (rng() > 0.35) push(x, mY, dark);
    if (mind.level >= 6) push(6, 2, lighter);
    if (mind.level >= 12) push(5, 2, lighter);
    for (let i = 0; i < scarCount; i += 1) {
      const sx = 2 + Math.floor(rng() * 5);
      const sy = 4 + Math.floor(rng() * 8);
      list.push({ x: sx, y: sy, color: '#9e3b3b', tall: true });
    }
    return list;
  }, [key, mind, scarCount]);

  useEffect(() => { startRef.current = performance.now(); }, [building, key]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !mind) return undefined;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const s = size / GRID;
    let raf;

    const draw = () => {
      const t = performance.now();
      const elapsed = t - startRef.current;
      const buildT = buildingRef.current ? Math.min(1, elapsed / 1000) : 1;
      ctx.fillStyle = '#15151c';
      ctx.fillRect(0, 0, size, size);
      const reveal = Math.floor(buildT * pixels.length);
      pixels.forEach((p, i) => {
        let col;
        if (i < reveal || !buildingRef.current) {
          col = p.color;
        } else if (Math.random() > 0.5) {
          ctx.globalAlpha = 0.5;
          col = '#9aa0ac';
        } else {
          return;
        }
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(p.x * s), Math.round(p.y * s), Math.ceil(s), Math.ceil(p.tall ? s * 2 : s));
        ctx.globalAlpha = 1;
      });
      if (buildingRef.current && buildT < 1) raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [pixels, size, mind]);

  if (!mind) return null;
  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px`, imageRendering: 'pixelated', border: '1px solid var(--border-color)', flexShrink: 0 }}
    />
  );
}

MindPortrait.displayName = 'MindPortrait';
export default MindPortrait;