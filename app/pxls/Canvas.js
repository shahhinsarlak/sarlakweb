'use client';

/**
 * PXLS Canvas
 *
 * Renders the project onto stacked canvases (transparency backdrop, art, and an
 * overlay for cursors, shape previews and selections) and translates pointer
 * input into draw helper calls. Shape tools preview on the overlay and commit on
 * release. The select tool marquees the active layer's pixels, lets them float
 * and be moved, and commits them back into the layer when the user clicks off.
 *
 * @param {Object} props
 * @param {Object} props.project
 * @param {Object|null} [props.onionProject] - previous frame view drawn faintly behind the art
 * @param {boolean} [props.interactive] - when false (e.g. during playback) drawing is disabled
 * @param {Object} props.brush - { tool, color, alpha, effect, size, mirror }
 * @param {Function} props.onPushHistory - snapshot active layer before a change
 * @param {Function} props.onSetCells - replace active layer cells (no history)
 * @param {Function} props.onEyedrop - (cell) => void
 * @param {Function} props.onHover - (x, y) => void
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  applyBrush, floodFill, linePoints, rectPoints, ellipsePoints, stampPoints,
  collectSelectedPixels, removePixelsAt, mirrorPoints, footprintCells,
  buildSrcGrid, pasteTransformed,
} from './drawHelpers';
import { compositeToCanvas, drawCheckerboard } from './renderHelpers';
import { getActiveLayer, cloneCells, isEmptyCell, pickTopCell } from './pxlsModel';
import { computeShadeRange, shadeShiftAt, shadeColor } from './shadingHelpers';
import styles from './page.module.css';

const TARGET_PX = 512;

// Extra distance (in cells) the rotate handle sits above the selection's top edge.
const ROTATE_GAP = 2;

/**
 * Computes a floating selection's transformed quad corners and rotate-handle
 * position in cell coordinates. Corners are ordered TL, TR, BR, BL.
 * @param {Object} s - selection { w, h, cx, cy, scaleX, scaleY, angle }
 * @returns {{ corners: Array<[number, number]>, rot: [number, number] }}
 */
const selQuad = (s) => {
  const hw = (s.w / 2) * s.scaleX;
  const hh = (s.h / 2) * s.scaleY;
  const cos = Math.cos(s.angle);
  const sin = Math.sin(s.angle);
  const toWorld = (lx, ly) => [s.cx + lx * cos - ly * sin, s.cy + lx * sin + ly * cos];
  const corners = [
    toWorld(-hw, -hh), toWorld(hw, -hh), toWorld(hw, hh), toWorld(-hw, hh),
  ];
  const rot = toWorld(0, -(hh + ROTATE_GAP));
  return { corners, rot };
};

/**
 * True when a cell-space point lies inside the selection's rotated rectangle.
 * @param {number} fx
 * @param {number} fy
 * @param {Object} s - selection
 * @returns {boolean}
 */
const pointInQuad = (fx, fy, s) => {
  const cos = Math.cos(s.angle);
  const sin = Math.sin(s.angle);
  const dx = fx - s.cx;
  const dy = fy - s.cy;
  const lx = dx * cos + dy * sin;
  const ly = -dx * sin + dy * cos;
  return Math.abs(lx) <= (s.w / 2) * s.scaleX && Math.abs(ly) <= (s.h / 2) * s.scaleY;
};

/**
 * Clamps a cell-space point into the canvas so transform handles stay grabbable
 * and visible even when the selection extends past an edge.
 * @param {[number, number]} p
 * @param {number} width
 * @param {number} height
 * @returns {[number, number]}
 */
const clampCell = (p, width, height) => [
  Math.max(0, Math.min(width, p[0])),
  Math.max(0, Math.min(height, p[1])),
];

export default function Canvas({
  project, onionProject = null, interactive = true,
  brush, light, onLightMove, shadeLocked, shadeStrength,
  onPushHistory, onSetCells, onEyedrop, onHover,
}) {
  const bgRef = useRef(null);
  const onionRef = useRef(null);
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
  const [marquee, setMarquee] = useState(null); // { x, y, w, h } while dragging a rect
  const [sel, setSel] = useState(null); // floating selection: { pixels, srcGrid, w, h, ax0, ay0, cx, cy, scaleX, scaleY, angle, baseCells }
  const hoverRef = useRef({ x: -1, y: -1 });
  const shadeStroke = useRef(null); // { source, working, lx, ly, dmin, dmax, last }
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

  /** Maps a pointer event to fractional cell coordinates (for transform handles). */
  const eventToCellF = useCallback((e) => {
    const rect = artRef.current.getBoundingClientRect();
    const fx = ((e.clientX - rect.left) / rect.width) * width;
    const fy = ((e.clientY - rect.top) / rect.height) * height;
    return { fx, fy };
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

  // Render the onion-skin ghost (previous frame) when provided, else clear it.
  useEffect(() => {
    const c = onionRef.current;
    if (!c) return;
    if (c.width !== pxW) c.width = pxW;
    if (c.height !== pxH) c.height = pxH;
    if (onionProject) {
      compositeToCanvas(c, onionProject, internalCell, { includeEffects: true });
    } else {
      c.getContext('2d').clearRect(0, 0, pxW, pxH);
    }
  }, [onionProject, internalCell, pxW, pxH]);

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
      // Expand the outline to the actual brush footprint (+ mirror) so the
      // preview thickness matches what will be stamped on release.
      ctx.fillStyle = 'rgba(255,0,77,0.6)';
      const fp = footprintCells(previewPoints, { width, height }, { size: brush.size, mirror: brush.mirror });
      for (const [x, y] of fp) {
        ctx.fillRect(x * internalCell, y * internalCell, internalCell, internalCell);
      }
    }

    // Brush cursor: outline of the footprint about to be painted, mirrored. It
    // stays visible (and follows the cursor) while drawing freehand.
    const hov = hoverRef.current;
    const showCursor = (!drag.current || drag.current.mode === 'freehand' || drag.current.mode === 'shadeBrush')
      && hov.x >= 0 && hov.y >= 0 && brush.tool !== 'select'
      && (brush.tool !== 'shade' || shadeLocked);
    if (showCursor) {
      const sized = brush.tool === 'pencil' || brush.tool === 'eraser'
        || brush.tool === 'effects' || brush.tool === 'shade';
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

    // Selection marquee while dragging the rectangle.
    if (marquee) {
      ctx.strokeStyle = 'rgba(255,0,77,0.9)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(
        marquee.x * internalCell + 0.5,
        marquee.y * internalCell + 0.5,
        marquee.w * internalCell,
        marquee.h * internalCell,
      );
      ctx.setLineDash([]);
    }

    // Floating selection: transform box with corner (scale) and rotate handles.
    if (sel) {
      const ic = internalCell;
      const { corners, rot } = selQuad(sel);
      const pts = corners.map(([cxx, cyy]) => [cxx * ic, cyy * ic]);
      const topMid = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
      // Handle markers are clamped into the canvas so they stay grabbable/visible.
      const handlePts = corners.map((c) => clampCell(c, width, height)).map(([cxx, cyy]) => [cxx * ic, cyy * ic]);
      const rotHandle = clampCell(rot, width, height).map((v, i) => v * ic);

      const traceBox = () => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < 4; i += 1) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
      };

      ctx.save();
      // Box outline (dark under, dashed white over) plus the rotate stem.
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      traceBox();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(topMid[0], topMid[1]);
      ctx.lineTo(rotHandle[0], rotHandle[1]);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      traceBox();
      ctx.stroke();
      ctx.setLineDash([]);

      // Handles: square corners (scale), round top (rotate).
      const hs = Math.max(6, ic * 0.7);
      const drawHandle = (x, y, round) => {
        ctx.beginPath();
        if (round) ctx.arc(x, y, hs / 2, 0, Math.PI * 2);
        else ctx.rect(x - hs / 2, y - hs / 2, hs, hs);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.stroke();
      };
      for (const [x, y] of handlePts) drawHandle(x, y, false);
      drawHandle(rotHandle[0], rotHandle[1], true);
      ctx.restore();
    }

    // Light source marker (Shade tool only).
    if (brush.tool === 'shade' && light) {
      const lx = light.fx * pxW;
      const ly = light.fy * pxH;
      const r = Math.max(7, internalCell * 0.9);
      ctx.save();
      const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 2.2);
      glow.addColorStop(0, 'rgba(255, 236, 39, 0.55)');
      glow.addColorStop(1, 'rgba(255, 236, 39, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(lx - r * 2.2, ly - r * 2.2, r * 4.4, r * 4.4);
      ctx.beginPath();
      ctx.arc(lx, ly, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 236, 39, 0.95)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.stroke();
      ctx.restore();
    }
  }, [pxW, pxH, internalCell, width, height, marquee, sel,
    brush.mirror, brush.size, brush.tool, light, shadeLocked]);

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

  /** Bakes shading from the locked light into the brush footprint at a cell. */
  const shadeDab = (cx, cy) => {
    const st = shadeStroke.current;
    if (!st) return;
    const half = Math.floor((brush.size - 1) / 2);
    for (let dy = -half; dy <= brush.size - 1 - half; dy += 1) {
      for (let dx = -half; dx <= brush.size - 1 - half; dx += 1) {
        const px = cx + dx;
        const py = cy + dy;
        for (const [mx, my] of mirrorPoints(px, py, width, height, brush.mirror)) {
          if (mx < 0 || my < 0 || mx >= width || my >= height) continue;
          const idx = my * width + mx;
          const src = st.source[idx];
          if (isEmptyCell(src)) continue;
          const shift = shadeShiftAt(mx, my, st.lx, st.ly, st.dmin, st.dmax, shadeStrength);
          st.working[idx] = { ...src, color: shadeColor(src.color, shift) };
        }
      }
    }
    onSetCells(st.working.slice());
  };

  /** Commits a freehand dab and tracks last position for gap free strokes. */
  const freehand = (x, y) => {
    const dims = { width, height };
    if (brush.tool === 'fill') {
      // Fill the clicked region plus each mirrored seed so symmetry applies.
      const seeds = brush.mirror === 'none'
        ? [[x, y]]
        : mirrorPoints(x, y, width, height, brush.mirror);
      let cells = activeLayer.cells;
      for (const [sx, sy] of seeds) {
        cells = floodFill(cells, dims, sx, sy, brush);
      }
      onSetCells(cells);
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
    if (!interactive) return;
    try { e.target.setPointerCapture(e.pointerId); } catch { /* synthetic / inactive pointer */ }

    // Shade tool: unlocked light is dragged; locked light brushes shading on.
    if (brush.tool === 'shade') {
      if (!shadeLocked) {
        const rect = artRef.current.getBoundingClientRect();
        const fx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const fy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        onLightMove(fx, fy);
        drag.current = { mode: 'light' };
        return;
      }
      const { x: sx, y: sy } = eventToCell(e);
      if (sx < 0 || sy < 0 || sx >= width || sy >= height) return;
      onPushHistory();
      const source = activeLayer.cells;
      const lx = light.fx * width;
      const ly = light.fy * height;
      const { dmin, dmax } = computeShadeRange(source, { width, height }, lx, ly);
      shadeStroke.current = { source, working: cloneCells(source), lx, ly, dmin, dmax, last: [sx, sy] };
      drag.current = { mode: 'shadeBrush' };
      shadeDab(sx, sy);
      return;
    }

    // Select tool: interacting with an existing floating selection. The rotate
    // handle can sit above the canvas, so this runs before the in-bounds guard.
    if (brush.tool === 'select' && sel) {
      const dims = { width, height };
      const rect = artRef.current.getBoundingClientRect();
      const { corners, rot } = selQuad(sel);
      const toClient = ([ccx, ccy]) => [
        rect.left + (ccx / width) * rect.width,
        rect.top + (ccy / height) * rect.height,
      ];
      const near = (cl) => Math.hypot(e.clientX - cl[0], e.clientY - cl[1]) <= 11;
      // Lift the selection out of the layer on first manipulation (undoable).
      const startManip = (data) => {
        let base = sel.baseCells;
        if (!base) {
          onPushHistory();
          base = removePixelsAt(activeLayer.cells, dims, sel.pixels, sel.ax0, sel.ay0);
          setSel({ ...sel, baseCells: base });
          onSetCells(pasteTransformed(base, dims, sel));
        }
        drag.current = { ...data, base };
      };

      if (near(toClient(clampCell(rot, width, height)))) {
        startManip({
          mode: 'selRotate', cx: sel.cx, cy: sel.cy, srcGrid: sel.srcGrid,
          w: sel.w, h: sel.h, scaleX: sel.scaleX, scaleY: sel.scaleY,
        });
        return;
      }
      for (let i = 0; i < 4; i += 1) {
        if (near(toClient(clampCell(corners[i], width, height)))) {
          startManip({
            mode: 'selScale', anchor: corners[(i + 2) % 4], angle: sel.angle,
            w: sel.w, h: sel.h, srcGrid: sel.srcGrid,
          });
          return;
        }
      }
      const { fx, fy } = eventToCellF(e);
      if (pointInQuad(fx, fy, sel)) {
        startManip({
          mode: 'selMove', grabFx: fx, grabFy: fy, cx0: sel.cx, cy0: sel.cy,
          t: {
            srcGrid: sel.srcGrid, w: sel.w, h: sel.h,
            scaleX: sel.scaleX, scaleY: sel.scaleY, angle: sel.angle,
          },
        });
        return;
      }
      // Clicked away: commit the selection (already baked) then start a fresh
      // marquee via the in-bounds path below.
      setSel(null);
    }

    const { x, y } = eventToCell(e);
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const tool = brush.tool;

    if (tool === 'eyedropper') {
      // Sample the topmost visible pixel across all layers, not just the active one.
      onEyedrop(pickTopCell(project, x, y));
      return;
    }

    if (tool === 'select') {
      // Start a new rectangular marquee (existing-selection handled above).
      drag.current = { mode: 'marquee', start: { x, y } };
      setMarquee({ x, y, w: 1, h: 1 });
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
    if (drag.current && drag.current.mode === 'light') {
      const rect = artRef.current.getBoundingClientRect();
      const fx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const fy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      onLightMove(fx, fy);
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
    } else if (d.mode === 'shadeBrush') {
      if (!inBoundsCell) return;
      const st = shadeStroke.current;
      if (st && st.last) {
        for (const [px, py] of linePoints(st.last[0], st.last[1], x, y)) shadeDab(px, py);
      } else {
        shadeDab(x, y);
      }
      if (st) st.last = [x, y];
      renderOverlay(null);
    } else if (d.mode === 'shape') {
      renderOverlay(shapePreview(d.start, { x, y }, d.tool));
    } else if (d.mode === 'marquee') {
      const nx = Math.max(0, Math.min(x, width - 1));
      const ny = Math.max(0, Math.min(y, height - 1));
      const sx = Math.min(d.start.x, nx);
      const sy = Math.min(d.start.y, ny);
      setMarquee({ x: sx, y: sy, w: Math.abs(nx - d.start.x) + 1, h: Math.abs(ny - d.start.y) + 1 });
    } else if (d.mode === 'selMove') {
      const dims = { width, height };
      const { fx, fy } = eventToCellF(e);
      const ncx = d.cx0 + (fx - d.grabFx);
      const ncy = d.cy0 + (fy - d.grabFy);
      onSetCells(pasteTransformed(d.base, dims, { ...d.t, cx: ncx, cy: ncy }));
      setSel((s) => (s ? { ...s, cx: ncx, cy: ncy } : s));
    } else if (d.mode === 'selScale') {
      const dims = { width, height };
      const { fx, fy } = eventToCellF(e);
      const cos = Math.cos(d.angle);
      const sin = Math.sin(d.angle);
      const dx = fx - d.anchor[0];
      const dy = fy - d.anchor[1];
      // Project anchor->pointer onto the selection's rotated axes for new extents.
      const du = dx * cos + dy * sin;
      const dv = -dx * sin + dy * cos;
      const nScaleX = Math.max(0.03, Math.abs(du) / d.w);
      const nScaleY = Math.max(0.03, Math.abs(dv) / d.h);
      const ncx = d.anchor[0] + dx / 2;
      const ncy = d.anchor[1] + dy / 2;
      const t = {
        srcGrid: d.srcGrid, w: d.w, h: d.h,
        scaleX: nScaleX, scaleY: nScaleY, angle: d.angle, cx: ncx, cy: ncy,
      };
      onSetCells(pasteTransformed(d.base, dims, t));
      setSel((s) => (s ? { ...s, scaleX: nScaleX, scaleY: nScaleY, cx: ncx, cy: ncy } : s));
    } else if (d.mode === 'selRotate') {
      const dims = { width, height };
      const { fx, fy } = eventToCellF(e);
      const nAngle = Math.atan2(fx - d.cx, -(fy - d.cy));
      const t = {
        srcGrid: d.srcGrid, w: d.w, h: d.h,
        scaleX: d.scaleX, scaleY: d.scaleY, angle: nAngle, cx: d.cx, cy: d.cy,
      };
      onSetCells(pasteTransformed(d.base, dims, t));
      setSel((s) => (s ? { ...s, angle: nAngle } : s));
    }
  };

  const handlePointerUp = (e) => {
    const d = drag.current;
    if (!d) return;
    if (d.mode === 'pan' || d.mode === 'light') {
      drag.current = null;
      return;
    }
    if (d.mode === 'shadeBrush') {
      drag.current = null;
      shadeStroke.current = null;
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
    } else if (d.mode === 'marquee') {
      // Finalise the selection: only the active (non-empty) pixels inside the
      // rectangle become a movable / transformable floating selection.
      setMarquee(null);
      const nx = Math.max(0, Math.min(x, width - 1));
      const ny = Math.max(0, Math.min(y, height - 1));
      const rx = Math.min(d.start.x, nx);
      const ry = Math.min(d.start.y, ny);
      const rw = Math.abs(nx - d.start.x) + 1;
      const rh = Math.abs(ny - d.start.y) + 1;
      const picked = collectSelectedPixels(activeLayer.cells, { width, height }, rx, ry, rw, rh);
      if (picked) {
        setSel({
          pixels: picked.pixels,
          srcGrid: buildSrcGrid(picked.pixels, picked.w, picked.h),
          w: picked.w,
          h: picked.h,
          ax0: picked.ax,
          ay0: picked.ay,
          cx: picked.ax + picked.w / 2,
          cy: picked.ay + picked.h / 2,
          scaleX: 1,
          scaleY: 1,
          angle: 0,
          baseCells: null,
        });
      } else {
        setSel(null);
      }
    }
    // Transform modes (selMove/selScale/selRotate) just end here: the selection
    // stays floating (already baked into the layer) until clicked off.
    drag.current = null;
  };

  // Leaving the select tool commits any floating selection (it is already baked
  // into the layer at its current position) and clears the marquee.
  useEffect(() => {
    if (brush.tool !== 'select' && (sel || marquee)) {
      setSel(null);
      setMarquee(null);
    }
  }, [brush.tool, sel, marquee]);

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
          <canvas
            ref={onionRef}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              opacity: 0.35, pointerEvents: 'none',
            }}
          />
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
