'use client';

/**
 * PXLS Canvas
 *
 * Renders the project onto stacked canvases (transparency backdrop, art, and a
 * grid + shape preview overlay) and translates pointer input into draw helper
 * calls. Shape tools (line, rect, ellipse) preview on the overlay and commit on
 * release. The move tool lifts a selected block and repositions it.
 *
 * @param {Object} props
 * @param {Object} props.project
 * @param {Object} props.brush - { tool, color, alpha, effect, size, mirror }
 * @param {Function} props.onPushHistory - snapshot active layer before a change
 * @param {Function} props.onSetCells - replace active layer cells (no history)
 * @param {Function} props.onEyedrop - (cell) => void
 * @param {Function} props.onHover - (x, y) => void
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  applyBrush, floodFill, linePoints, rectPoints, ellipsePoints, stampPoints,
  extractBlock, clearRegion, pasteBlock, mirrorPoints,
} from './drawHelpers';
import { compositeToCanvas, drawCheckerboard } from './renderHelpers';
import { getActiveLayer } from './pxlsModel';
import styles from './page.module.css';

const TARGET_PX = 512;

export default function Canvas({ project, brush, onPushHistory, onSetCells, onEyedrop, onHover }) {
  const bgRef = useRef(null);
  const artRef = useRef(null);
  const overlayRef = useRef(null);
  const stageRef = useRef(null);
  const viewportRef = useRef(null);

  const { width, height } = project;
  const internalCell = Math.max(2, Math.floor(TARGET_PX / width));
  const pxW = width * internalCell;
  const pxH = height * internalCell;

  // Interaction state held in a ref so pointer handlers see fresh values.
  const drag = useRef(null);
  const [selection, setSelection] = useState(null); // { x, y, w, h }
  const float = useRef(null); // { block, bw, bh, baseCells, ox, oy }
  const hoverRef = useRef({ x: -1, y: -1 });
  // Pan / zoom of the canvas viewport. transformOrigin is the top left corner.
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 });

  const activeLayer = getActiveLayer(project);

  /** Maps a pointer event to integer cell coordinates. */
  const eventToCell = useCallback((e) => {
    const rect = artRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * height);
    return { x, y };
  }, [width, height]);

  // Render transparency backdrop once per size change.
  useEffect(() => {
    const bg = bgRef.current;
    bg.width = pxW;
    bg.height = pxH;
    const ctx = bg.getContext('2d');
    drawCheckerboard(ctx, pxW, pxH, internalCell, ['#bdbdbd', '#8f8f8f']);
  }, [pxW, pxH, internalCell]);

  // Render art whenever the project changes.
  useEffect(() => {
    compositeToCanvas(artRef.current, project, internalCell, { includeEffects: true });
  }, [project, internalCell]);

  // Draws grid, mirror axes, brush cursor, selection, and an optional preview.
  const renderOverlay = useCallback((previewPoints) => {
    const overlay = overlayRef.current;
    if (overlay.width !== pxW) overlay.width = pxW;
    if (overlay.height !== pxH) overlay.height = pxH;
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, pxW, pxH);

    // Mirror / symmetry axes: green lines showing where reflection happens.
    if (brush.mirror !== 'none') {
      ctx.save();
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (brush.mirror === 'x' || brush.mirror === 'both') {
        const mid = (width / 2) * internalCell;
        ctx.moveTo(mid, 0);
        ctx.lineTo(mid, pxH);
      }
      if (brush.mirror === 'y' || brush.mirror === 'both') {
        const mid = (height / 2) * internalCell;
        ctx.moveTo(0, mid);
        ctx.lineTo(pxW, mid);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (previewPoints) {
      ctx.fillStyle = 'rgba(255,0,77,0.6)';
      for (const [x, y] of previewPoints) {
        ctx.fillRect(x * internalCell, y * internalCell, internalCell, internalCell);
      }
    }

    // Brush cursor: outline of the footprint about to be painted, mirrored. It
    // stays visible (and follows the cursor) while drawing freehand.
    const hov = hoverRef.current;
    const showCursor = (!drag.current || drag.current.mode === 'freehand')
      && hov.x >= 0 && hov.y >= 0 && brush.tool !== 'move';
    if (showCursor) {
      const sized = brush.tool === 'pencil' || brush.tool === 'eraser' || brush.tool === 'effects';
      const footSize = sized ? brush.size : 1;
      const half = Math.floor((footSize - 1) / 2);
      const drawOutline = (cx, cy) => {
        const px = (cx - half) * internalCell;
        const py = (cy - half) * internalCell;
        const s = footSize * internalCell;
        ctx.strokeStyle = 'rgba(0,0,0,0.75)';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, py + 1, s - 2, s - 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
      };
      for (const [mx, my] of mirrorPoints(hov.x, hov.y, width, height, brush.mirror)) {
        drawOutline(mx, my);
      }
    }

    if (selection) {
      ctx.strokeStyle = '#ff004d';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(
        selection.x * internalCell + 0.5,
        selection.y * internalCell + 0.5,
        selection.w * internalCell,
        selection.h * internalCell,
      );
      ctx.setLineDash([]);
    }
  }, [pxW, pxH, internalCell, width, height, selection, brush.mirror, brush.size, brush.tool]);

  useEffect(() => {
    renderOverlay(null);
  }, [renderOverlay]);

  // Wheel zoom toward the cursor. Native non passive listener so the page does
  // not scroll while zooming over the canvas.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setView((prev) => {
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        const zoom = Math.max(1, Math.min(40, prev.zoom * factor));
        if (zoom === prev.zoom) return prev;
        // Keep the content point under the cursor fixed across the zoom change.
        const contentX = (cx - prev.x) / prev.zoom;
        const contentY = (cy - prev.y) / prev.zoom;
        let x = cx - contentX * zoom;
        let y = cy - contentY * zoom;
        if (zoom === 1) { x = 0; y = 0; }
        return { zoom, x, y };
      });
    };
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, []);

  /** Commits a freehand dab and tracks last position for gap free strokes. */
  const freehand = (x, y) => {
    const dims = { width, height };
    if (brush.tool === 'fill') {
      onSetCells(floodFill(activeLayer.cells, dims, x, y, brush));
      return;
    }
    let cells = activeLayer.cells;
    if (drag.current && drag.current.last) {
      const [lx, ly] = drag.current.last;
      cells = stampPoints(cells, dims, linePoints(lx, ly, x, y), brush);
    } else {
      cells = applyBrush(cells, dims, x, y, brush);
    }
    if (drag.current) drag.current.last = [x, y];
    onSetCells(cells);
  };

  const shapePreview = (start, end, tool) => {
    if (tool === 'line') return linePoints(start.x, start.y, end.x, end.y);
    if (tool === 'rect') return rectPoints(start.x, start.y, end.x, end.y);
    if (tool === 'ellipse') return ellipsePoints(start.x, start.y, end.x, end.y);
    return null;
  };

  const handlePointerDown = (e) => {
    // Right button pans the view.
    if (e.button === 2) {
      e.preventDefault();
      try { e.target.setPointerCapture(e.pointerId); } catch { /* synthetic / inactive pointer */ }
      drag.current = { mode: 'pan', lastX: e.clientX, lastY: e.clientY };
      return;
    }
    if (e.button !== 0) return;
    try { e.target.setPointerCapture(e.pointerId); } catch { /* synthetic / inactive pointer */ }
    const { x, y } = eventToCell(e);
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const tool = brush.tool;

    if (tool === 'eyedropper') {
      onEyedrop(activeLayer.cells[y * width + x]);
      return;
    }

    if (tool === 'move') {
      // If a lifted block exists and we click inside the selection, start moving.
      if (selection && x >= selection.x && x < selection.x + selection.w
        && y >= selection.y && y < selection.y + selection.h) {
        const dims = { width, height };
        const block = extractBlock(activeLayer.cells, dims, selection.x, selection.y, selection.w, selection.h);
        const baseCells = clearRegion(activeLayer.cells, dims, selection.x, selection.y, selection.w, selection.h);
        onPushHistory();
        float.current = { block, bw: selection.w, bh: selection.h, baseCells, startX: x, startY: y, selX: selection.x, selY: selection.y };
        drag.current = { mode: 'move' };
      } else {
        drag.current = { mode: 'select', start: { x, y } };
        setSelection({ x, y, w: 1, h: 1 });
      }
      return;
    }

    if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
      drag.current = { mode: 'shape', start: { x, y }, tool };
      renderOverlay(shapePreview({ x, y }, { x, y }, tool));
      return;
    }

    // Freehand tools: pencil, eraser, effects, fill.
    onPushHistory();
    drag.current = { mode: 'freehand', last: null };
    freehand(x, y);
  };

  const handlePointerMove = (e) => {
    if (drag.current && drag.current.mode === 'pan') {
      const d = drag.current;
      const dx = e.clientX - d.lastX;
      const dy = e.clientY - d.lastY;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      setView((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      return;
    }
    const { x, y } = eventToCell(e);
    if (onHover) onHover(x, y);
    const inBoundsCell = x >= 0 && y >= 0 && x < width && y < height;
    hoverRef.current = inBoundsCell ? { x, y } : { x: -1, y: -1 };

    if (!drag.current) {
      renderOverlay(null);
      return;
    }
    const d = drag.current;

    if (d.mode === 'freehand') {
      if (!inBoundsCell) return;
      freehand(x, y);
      renderOverlay(null);
    } else if (d.mode === 'shape') {
      renderOverlay(shapePreview(d.start, { x, y }, d.tool));
    } else if (d.mode === 'select') {
      const nx = Math.max(0, Math.min(x, width - 1));
      const ny = Math.max(0, Math.min(y, height - 1));
      const sx = Math.min(d.start.x, nx);
      const sy = Math.min(d.start.y, ny);
      setSelection({ x: sx, y: sy, w: Math.abs(nx - d.start.x) + 1, h: Math.abs(ny - d.start.y) + 1 });
    } else if (d.mode === 'move' && float.current) {
      const f = float.current;
      const dx = x - f.startX;
      const dy = y - f.startY;
      const dims = { width, height };
      const moved = pasteBlock(f.baseCells, dims, f.block, f.bw, f.bh, f.selX + dx, f.selY + dy);
      onSetCells(moved);
      setSelection({ x: f.selX + dx, y: f.selY + dy, w: f.bw, h: f.bh });
    }
  };

  const handlePointerUp = (e) => {
    const d = drag.current;
    if (!d) return;
    if (d.mode === 'pan') {
      drag.current = null;
      return;
    }
    const { x, y } = eventToCell(e);

    if (d.mode === 'shape') {
      const points = shapePreview(d.start, { x, y }, d.tool);
      if (points) {
        onPushHistory();
        onSetCells(stampPoints(activeLayer.cells, { width, height }, points, brush));
      }
      renderOverlay(null);
    } else if (d.mode === 'move' && float.current) {
      const f = float.current;
      const dx = x - f.startX;
      const dy = y - f.startY;
      float.current = { ...f, selX: f.selX + dx, selY: f.selY + dy, startX: 0, startY: 0 };
    }
    drag.current = null;
  };

  // Clear selection when leaving the move tool.
  useEffect(() => {
    if (brush.tool !== 'move' && selection) {
      setSelection(null);
      float.current = null;
    }
  }, [brush.tool, selection]);

  return (
    <>
      <div
        ref={viewportRef}
        className={styles.canvasViewport}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          ref={stageRef}
          className={styles.canvasStage}
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <canvas ref={bgRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          <canvas ref={artRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          <canvas
            ref={overlayRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => {
              if (onHover) onHover(-1, -1);
              hoverRef.current = { x: -1, y: -1 };
              if (!drag.current) renderOverlay(null);
            }}
          />
        </div>
      </div>
      <div className={styles.zoomBar}>
        <span>Right drag to pan, scroll to zoom</span>
        <span className={styles.spacer} />
        <span>{Math.round(view.zoom * 100)}%</span>
        <button
          type="button"
          className={styles.sizeBtn}
          onClick={() => setView({ zoom: 1, x: 0, y: 0 })}
        >
          Reset view
        </button>
      </div>
    </>
  );
}
