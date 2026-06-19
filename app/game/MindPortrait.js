import React from 'react';
import PixelArt from './PixelArt';
import { paintMind } from './spriteArt';

/** MindPortrait - 128x128 procedural, seeded face per mind; scars + level marks. */
function MindPortrait({ mind, size = 48, building = false }) {
  if (!mind) return null;
  const scars = (mind.scars || []).length;
  return (
    <div style={{ display: 'inline-block', border: '1px solid var(--border-color)', lineHeight: 0 }}>
      <PixelArt
        paintKey={`m:${mind.id}:${mind.level}:${scars}`}
        paint={(ctx) => paintMind(ctx, mind)}
        size={size}
        building={building}
        accent={'#9aa0ac'}
      />
    </div>
  );
}

MindPortrait.displayName = 'MindPortrait';
export default MindPortrait;