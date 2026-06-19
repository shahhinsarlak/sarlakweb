import React, { useEffect, useMemo, useRef } from 'react';
import { getWeaponType, getWeaponRarity } from './expeditionHelpers';

/**
 * WeaponSprite — a procedural 16x16 pixel sprite for a weapon (type x rarity),
 * drawn crisp on a scaled canvas. Each weapon TYPE has a distinct office-junk
 * silhouette; RARITY tints the accents and adds a glow. When `building` is set
 * it plays a one-shot "fabrication" reveal (pixels coalesce out of rarity-tinted
 * static), used for the blueprint roll.
 */

const GRID = 16;

const darken = (hex, f) => {
  const n = parseInt(String(hex).replace('#', ''), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
};

// Build the pixel list for a weapon type. Each pixel: { x, y, t } where t is one
// of metal | dark | wood | accent.
const buildPixels = (typeId) => {
  const px = [];
  const P = (x, y, t) => {
    if (x >= 0 && x < GRID && y >= 0 && y < GRID) px.push({ x: Math.round(x), y: Math.round(y), t });
  };
  const line = (x0, y0, x1, y1, t) => {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= steps; i += 1) {
      P(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, t);
    }
  };
  const rect = (x, y, w, h, t) => {
    for (let yy = 0; yy < h; yy += 1) for (let xx = 0; xx < w; xx += 1) P(x + xx, y + yy, t);
  };

  switch (typeId) {
    case 'stapler_pike':
      line(3, 14, 10, 4, 'wood');
      line(4, 14, 11, 4, 'wood');
      P(10, 3, 'metal'); P(11, 3, 'metal'); P(11, 2, 'metal'); P(12, 2, 'metal');
      P(10, 4, 'metal'); P(12, 1, 'metal');
      P(7, 9, 'accent'); P(8, 8, 'accent');
      break;
    case 'guillotine_cutter':
      rect(2, 11, 3, 3, 'wood');
      for (let i = 0; i < 10; i += 1) line(5 + i, 10 - i, 5 + i, 10, 'metal');
      line(5, 10, 14, 1, 'accent');
      break;
    case 'letter_opener_fan':
      rect(6, 11, 3, 3, 'wood');
      line(7, 12, 2, 3, 'metal');
      line(7, 12, 7, 1, 'metal');
      line(7, 12, 12, 4, 'metal');
      P(2, 3, 'accent'); P(7, 1, 'accent'); P(12, 4, 'accent');
      break;
    case 'cubicle_maul':
      rect(7, 6, 2, 9, 'wood');
      rect(3, 2, 10, 5, 'metal');
      rect(4, 3, 8, 3, 'dark');
      rect(5, 4, 6, 1, 'accent');
      break;
    case 'toner_flail':
      rect(3, 11, 2, 3, 'wood');
      line(5, 11, 8, 7, 'dark');
      rect(8, 4, 5, 5, 'dark');
      rect(9, 5, 3, 3, 'metal');
      P(10, 6, 'accent');
      break;
    case 'cable_lash':
      rect(2, 12, 2, 2, 'wood');
      for (let i = 0; i < 13; i += 1) {
        const x = 4 + i;
        const y = 12 - i - Math.round(2 * Math.sin(i / 2));
        P(x, y, i % 2 ? 'metal' : 'dark');
      }
      P(15, 2, 'accent');
      break;
    case 'lucid_lance':
      line(2, 14, 11, 4, 'wood');
      line(3, 14, 12, 4, 'metal');
      rect(11, 2, 3, 3, 'accent');
      P(13, 1, 'accent'); P(10, 5, 'accent');
      break;
    case 'thermal_censer':
      for (let y = 1; y < 6; y += 1) P(8, y, 'dark');
      rect(5, 6, 7, 6, 'metal');
      rect(6, 7, 5, 2, 'dark');
      P(6, 12, 'metal'); P(10, 12, 'metal');
      P(7, 5, 'accent'); P(9, 4, 'accent'); P(8, 6, 'accent');
      break;
    default:
      rect(6, 4, 4, 8, 'metal');
      break;
  }
  return px;
};

function WeaponSprite({ typeId, rarityId, size = 48, building = false }) {
  const ref = useRef(null);
  const type = getWeaponType(typeId);
  const rarity = getWeaponRarity(rarityId);
  const pixels = useMemo(() => buildPixels(typeId), [typeId]);
  const startRef = useRef(0);
  const buildingRef = useRef(building);
  buildingRef.current = building;

  useEffect(() => { startRef.current = performance.now(); }, [building, typeId, rarityId]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const s = size / GRID;
    let raf;

    const metal = (type && type.color) || '#cccccc';
    const accent = (rarity && rarity.color) || '#cccccc';
    const colorFor = (t) => {
      if (t === 'metal') return metal;
      if (t === 'dark') return darken(metal, 0.5);
      if (t === 'wood') return '#6b4f3a';
      return accent;
    };

    const draw = () => {
      const t = performance.now();
      const elapsed = t - startRef.current;
      const buildT = buildingRef.current ? Math.min(1, elapsed / 1100) : 1;
      ctx.clearRect(0, 0, size, size);
      // ordered bottom-up reveal for the fabrication
      const reveal = Math.floor(buildT * pixels.length);
      pixels.forEach((p, i) => {
        let col;
        if (i < reveal || !buildingRef.current) {
          col = colorFor(p.t);
          if (p.t === 'accent') {
            const pulse = 0.7 + 0.3 * Math.sin(t / 200 + p.x);
            ctx.globalAlpha = pulse;
          }
        } else {
          // not-yet-formed: rarity static
          if (Math.random() > 0.55) { ctx.globalAlpha = 0.5; col = accent; } else { return; }
        }
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(p.x * s), Math.round(p.y * s), Math.ceil(s), Math.ceil(s));
        ctx.globalAlpha = 1;
      });
      if (buildingRef.current && buildT < 1) raf = requestAnimationFrame(draw);
      else if (pixels.some((p) => p.t === 'accent')) raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [pixels, size, type, rarity]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: 'pixelated',
        filter: rarity ? `drop-shadow(0 0 3px ${rarity.color})` : 'none',
        flexShrink: 0,
      }}
    />
  );
}

WeaponSprite.displayName = 'WeaponSprite';
export default WeaponSprite;
