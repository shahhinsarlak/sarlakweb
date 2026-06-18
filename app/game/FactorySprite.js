import React, { useEffect, useRef } from 'react';
import { compositeToCanvas } from '../pxls/renderHelpers';
import { spriteFrameToProject, spriteFrameCount, spriteFps } from './factorySpriteHelpers';

/**
 * Animated factory machine sprite.
 *
 * Renders a 64x64 PXLS sprite to a canvas, cycling its animation frames, reusing
 * the PXLS compositeToCanvas renderer. Displayed at `display` px (default 128 =>
 * cellSize 2, crisp nearest-neighbour).
 *
 * @param {string} machineId - key into FACTORY_SPRITES
 * @param {number} [display=128] - on-screen size in CSS px
 * @param {boolean} [animate=true] - cycle frames (false = static first frame)
 */
function FactorySprite({ machineId, display = 128, animate = true }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const frames = spriteFrameCount(machineId);
    const cellSize = Math.max(1, Math.round(display / 64));

    const render = (frameIndex) => {
      const project = spriteFrameToProject(machineId, frameIndex);
      if (project) compositeToCanvas(canvas, project, cellSize, { includeEffects: true, background: null });
    };

    render(frameRef.current % frames);
    if (!animate || frames <= 1) return undefined;

    const intervalMs = 1000 / spriteFps(machineId);
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % frames;
      render(frameRef.current);
    }, intervalMs);
    return () => clearInterval(id);
  }, [machineId, display, animate]);

  return (
    <canvas
      ref={canvasRef}
      width={display}
      height={display}
      style={{
        width: `${display}px`,
        height: `${display}px`,
        imageRendering: 'pixelated',
        display: 'block',
      }}
    />
  );
}

FactorySprite.displayName = 'FactorySprite';
export default React.memo(FactorySprite);
