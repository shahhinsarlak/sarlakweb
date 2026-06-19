import React, { useEffect, useRef } from 'react';
import { mulberry32, hashSeed } from './expeditionChart';

/**
 * MindPortrait — a small procedural pixel portrait, seeded from the mind's id so
 * each printed copy looks like an individual. Symmetric 16x16, deliberately
 * muted (greys with a faint tint); scars stamp red marks, so a veteran looks
 * weathered and a death-marker has a face.
 */
function MindPortrait({ mind, size = 48 }) {
  const ref = useRef(null);
  const scarCount = mind ? (mind.scars || []).length : 0;
  const key = mind ? `${mind.id}|${mind.level}|${scarCount}` : 'none';

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !mind) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const G = 16;
    const s = size / G;
    const rng = mulberry32(hashSeed(mind.id));

    const tints = ['#3a4250', '#3f3a4a', '#384a44', '#4a4440', '#404048'];
    const base = tints[Math.floor(rng() * tints.length)];
    const lighter = '#9aa0ac';
    const dark = '#15151c';

    ctx.fillStyle = dark;
    ctx.fillRect(0, 0, size, size);

    const set = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x * s), Math.round(y * s), Math.ceil(s), Math.ceil(s));
      ctx.fillRect(Math.round((G - 1 - x) * s), Math.round(y * s), Math.ceil(s), Math.ceil(s));
    };

    // head mass (rows 2..14), narrowing at top and chin
    for (let y = 2; y < 14; y += 1) {
      const inset = y < 4 ? 4 : y > 12 ? 4 : 2;
      for (let x = inset; x < 8; x += 1) set(x, y, base);
    }
    // faint shading speckle
    for (let i = 0; i < 14; i += 1) {
      const x = 2 + Math.floor(rng() * 6);
      const y = 3 + Math.floor(rng() * 10);
      if (rng() > 0.5) set(x, y, lighter);
    }
    // eyes (one of a few styles)
    const eyeY = 6 + Math.floor(rng() * 2);
    const eyeX = 3 + Math.floor(rng() * 1);
    set(eyeX, eyeY, dark);
    if (rng() > 0.5) set(eyeX, eyeY, '#cfd6e0'); // glint
    // brow / mark
    if (rng() > 0.5) set(eyeX, eyeY - 1, lighter);
    // mouth line
    const mY = 10 + Math.floor(rng() * 2);
    for (let x = 4; x < 7; x += 1) if (rng() > 0.35) set(x, mY, dark);
    // level notch (a small bright crown for higher levels)
    if (mind.level >= 6) { set(6, 2, lighter); }
    if (mind.level >= 12) { set(5, 2, lighter); }

    // scars: red marks at seeded spots
    for (let i = 0; i < scarCount; i += 1) {
      const sx = 2 + Math.floor(rng() * 5);
      const sy = 4 + Math.floor(rng() * 8);
      ctx.fillStyle = '#9e3b3b';
      ctx.fillRect(Math.round(sx * s), Math.round(sy * s), Math.ceil(s), Math.ceil(s * 2));
    }
  }, [key, size, mind]);

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
