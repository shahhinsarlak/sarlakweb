import React, { useEffect, useRef } from 'react';
import { compositeToCanvas } from '../pxls/renderHelpers';
import { spriteFrameToProject, spriteFrameCount, spriteFps, spriteSize } from './factorySpriteHelpers';

/**
 * Animated factory machine sprite.
 *
 * Renders a machine's PXLS sprite (base frame + attachments active at the given
 * upgrade `level`) to a canvas, cycling animation frames, reusing the PXLS
 * compositeToCanvas renderer. Displayed at `display` CSS px.
 *
 * @param {string} machineId - key into FACTORY_SPRITES
 * @param {number} [level=0] - machine upgrade level (controls which attachments show)
 * @param {number} [display=128] - on-screen size in CSS px
 * @param {boolean} [animate=true] - cycle frames (false = static first frame)
 */
function FactorySprite({ machineId, level = 0, display = 128, animate = true }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const frames = spriteFrameCount(machineId);
    const size = spriteSize(machineId);
    const cellSize = Math.max(1, Math.round(display / size));

    const render = (frameIndex) => {
      const project = spriteFrameToProject(machineId, frameIndex, level);
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
  }, [machineId, level, display, animate]);

  const size = spriteSize(machineId);
  const cellSize = Math.max(1, Math.round(display / size));
  const canvasPx = size * cellSize;

  return (
    <canvas
      ref={canvasRef}
      width={canvasPx}
      height={canvasPx}
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
