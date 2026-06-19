import React from 'react';
import PixelArt from './PixelArt';
import { paintCraft, paintShell } from './spriteArt';

const ACCENTS = {
  lantern: '#ffe08a', compass: '#e06b6b', decoder: '#9fe8ff', ward_minor: '#b46bff',
  ward_major: '#9fe8ff', plating: '#caa66a', rations: '#e8995c', lucid_draught: '#9fe8ff',
  clarity_charge: '#9fe8ff', shell: '#6bd0a0',
};

/** CraftSprite - 128x128 procedural art for gear / provisions / shells. */
function CraftSprite({ id, size = 40, building = false }) {
  const paint = id === 'shell' ? ((ctx) => paintShell(ctx)) : ((ctx) => paintCraft(ctx, id));
  return (
    <PixelArt paintKey={`c:${id}`} paint={paint} size={size} building={building} accent={ACCENTS[id] || '#9fe8ff'} />
  );
}

CraftSprite.displayName = 'CraftSprite';
export default CraftSprite;