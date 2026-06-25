'use client';

/**
 * PXLS Editor (root)
 *
 * Orchestrates the whole editor: holds the project as the single source of
 * truth, manages brush settings, undo/redo history, keyboard shortcuts, layer
 * operations, localStorage autosave, and the gallery / export modals.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import ColorPanel from './ColorPanel';
import LayersPanel from './LayersPanel';
import Timeline from './Timeline';
import EffectsPanel from './EffectsPanel';
import ShadePanel from './ShadePanel';
import ExportModal from './ExportModal';
import ImageImportModal from './ImageImportModal';
import ProjectGallery from './ProjectGallery';
import SwatchesModal from './SwatchesModal';
import {
  createHistory, pushHistory as pushHist, undo as undoHist, redo as redoHist,
  canUndo, canRedo,
} from './historyHelpers';
import {
  createProject, createLayer, createLayerFromCells, getActiveFrame, getActiveFrameLayer,
  frameView, createFrame, duplicateFrame, duplicateLayer, makeEmptyCells, isEmptyCell,
  validateProject, cloneCells,
} from './pxlsModel';
import { saveProject, getLastOpenId, listProjects } from './storageHelpers';
import { applyShading } from './shadingHelpers';
import {
  TOOLS, TOOL_ORDER, MIRROR_MODES, MIN_BRUSH, MAX_BRUSH, MIN_FPS, MAX_FPS,
} from './constants';
import styles from './page.module.css';

const SHORTCUT_TOOLS = TOOL_ORDER.reduce((map, id) => {
  map[TOOLS[id].shortcut.toLowerCase()] = id;
  return map;
}, {});

export default function PxlsEditor() {
  const [project, setProject] = useState(null);
  const [activeTool, setActiveTool] = useState('pencil');
  const [color, setColor] = useState('#ff004d');
  const [alpha, setAlpha] = useState(1);
  const [effect, setEffect] = useState(null);
  const [brushSize, setBrushSize] = useState(1);
  const [mirror, setMirror] = useState('none');
  const [light, setLight] = useState({ fx: 0.25, fy: 0.2 });
  const [shadeStrength, setShadeStrength] = useState(0.5);
  const [shadeLocked, setShadeLocked] = useState(false);
  const [history, setHistory] = useState(createHistory());
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [swatchesOpen, setSwatchesOpen] = useState(false);
  const [hover, setHover] = useState({ x: -1, y: -1 });
  const [playing, setPlaying] = useState(false);
  const [previewFrameId, setPreviewFrameId] = useState(null);
  const [onion, setOnion] = useState(false);

  const projectRef = useRef(project);
  projectRef.current = project;
  const playIndexRef = useRef(0);

  // Load the last project or create a fresh one on mount.
  useEffect(() => {
    const lastId = getLastOpenId();
    const all = listProjects();
    const found = lastId ? all.find((p) => p.id === lastId) : null;
    setProject(found || all[0] || createProject({}));
  }, []);

  // Debounced autosave whenever the project changes.
  useEffect(() => {
    if (!project) return undefined;
    const t = setTimeout(() => saveProject(project), 600);
    return () => clearTimeout(t);
  }, [project]);

  // --- History ---------------------------------------------------------------

  const pushHistory = useCallback(() => {
    const p = projectRef.current;
    const frame = getActiveFrame(p);
    const layer = frame && frame.layers.find((l) => l.id === frame.activeLayerId);
    if (frame && layer) setHistory((h) => pushHist(h, frame.id, layer.id, layer.cells));
  }, []);

  const applyCellsToLayer = useCallback((frameId, layerId, cells) => {
    setProject((prev) => ({
      ...prev,
      frames: prev.frames.map((f) => (f.id === frameId
        ? { ...f, layers: f.layers.map((l) => (l.id === layerId ? { ...l, cells } : l)) }
        : f)),
    }));
  }, []);

  const setActiveCells = useCallback((cells) => {
    setProject((prev) => {
      const fId = prev.activeFrameId;
      return {
        ...prev,
        frames: prev.frames.map((f) => (f.id === fId
          ? { ...f, layers: f.layers.map((l) => (l.id === f.activeLayerId ? { ...l, cells } : l)) }
          : f)),
      };
    });
  }, []);

  const getCellsByLayer = useCallback((frameId, layerId) => {
    const frame = projectRef.current.frames.find((f) => f.id === frameId);
    const layer = frame && frame.layers.find((l) => l.id === layerId);
    return layer ? layer.cells : null;
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      const { snapshot, history: next } = undoHist(h, getCellsByLayer);
      if (snapshot) applyCellsToLayer(snapshot.frameId, snapshot.layerId, cloneCells(snapshot.cells));
      return next;
    });
  }, [getCellsByLayer, applyCellsToLayer]);

  const handleRedo = useCallback(() => {
    setHistory((h) => {
      const { snapshot, history: next } = redoHist(h, getCellsByLayer);
      if (snapshot) applyCellsToLayer(snapshot.frameId, snapshot.layerId, cloneCells(snapshot.cells));
      return next;
    });
  }, [getCellsByLayer, applyCellsToLayer]);

  // Updates the active frame via an updater function (frame -> frame).
  const setActiveFrame = useCallback((updater) => {
    setProject((prev) => {
      const fId = prev.activeFrameId;
      return { ...prev, frames: prev.frames.map((f) => (f.id === fId ? updater(f) : f)) };
    });
  }, []);

  // --- Layer operations ------------------------------------------------------

  const layerHandlers = {
    onSelect: (id) => setActiveFrame((f) => ({ ...f, activeLayerId: id })),
    onToggleVisible: (id) => setActiveFrame((f) => ({
      ...f,
      layers: f.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    })),
    onRename: (id, name) => setActiveFrame((f) => ({
      ...f,
      layers: f.layers.map((l) => (l.id === id ? { ...l, name } : l)),
    })),
    onAdd: () => setActiveFrame((f) => {
      const layer = createLayer(projectRef.current.width, projectRef.current.height, `Layer ${f.layers.length + 1}`);
      return { ...f, layers: [...f.layers, layer], activeLayerId: layer.id };
    }),
    onDuplicate: (id) => setActiveFrame((f) => {
      const source = f.layers.find((l) => l.id === id);
      if (!source) return f;
      const copy = duplicateLayer(source);
      const index = f.layers.findIndex((l) => l.id === id);
      const layers = [...f.layers];
      layers.splice(index + 1, 0, copy);
      return { ...f, layers, activeLayerId: copy.id };
    }),
    onClear: () => {
      const p = projectRef.current;
      const frame = getActiveFrame(p);
      const layer = frame && frame.layers.find((l) => l.id === frame.activeLayerId);
      if (!layer || layer.cells.every(isEmptyCell)) return;
      if (typeof window !== 'undefined'
        && !window.confirm('Clear this layer? You can undo this afterwards.')) {
        return;
      }
      pushHistory();
      applyCellsToLayer(frame.id, layer.id, makeEmptyCells(p.width, p.height));
    },
    onDelete: (id) => setActiveFrame((f) => {
      if (f.layers.length <= 1) return f;
      const layers = f.layers.filter((l) => l.id !== id);
      const activeLayerId = f.activeLayerId === id ? layers[layers.length - 1].id : f.activeLayerId;
      return { ...f, layers, activeLayerId };
    }),
    onMoveUp: (index) => setActiveFrame((f) => {
      if (index >= f.layers.length - 1) return f;
      const layers = [...f.layers];
      [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
      return { ...f, layers };
    }),
    onMoveDown: (index) => setActiveFrame((f) => {
      if (index <= 0) return f;
      const layers = [...f.layers];
      [layers[index], layers[index - 1]] = [layers[index - 1], layers[index]];
      return { ...f, layers };
    }),
    onReorder: (from, to) => setActiveFrame((f) => {
      if (from === to || from == null || to == null) return f;
      const layers = [...f.layers];
      const [moved] = layers.splice(from, 1);
      layers.splice(to, 0, moved);
      return { ...f, layers };
    }),
    onOpacity: (id, opacity) => setActiveFrame((f) => ({
      ...f,
      layers: f.layers.map((l) => (l.id === id ? { ...l, opacity } : l)),
    })),
  };

  // --- Frame operations ------------------------------------------------------

  const frameHandlers = {
    onSelectFrame: (id) => { setPlaying(false); setProject((p) => ({ ...p, activeFrameId: id })); },
    onAddFrame: () => { setPlaying(false); setProject((p) => {
      const frame = createFrame(p.width, p.height, `Frame ${p.frames.length + 1}`);
      const idx = p.frames.findIndex((f) => f.id === p.activeFrameId);
      const frames = [...p.frames];
      frames.splice(idx + 1, 0, frame);
      return { ...p, frames, activeFrameId: frame.id };
    }); },
    onDuplicateFrame: (id) => { setPlaying(false); setProject((p) => {
      const source = p.frames.find((f) => f.id === id);
      if (!source) return p;
      const copy = duplicateFrame(source);
      const idx = p.frames.findIndex((f) => f.id === id);
      const frames = [...p.frames];
      frames.splice(idx + 1, 0, copy);
      return { ...p, frames, activeFrameId: copy.id };
    }); },
    onDeleteFrame: (id) => { setPlaying(false); setProject((p) => {
      if (p.frames.length <= 1) return p;
      const idx = p.frames.findIndex((f) => f.id === id);
      const frames = p.frames.filter((f) => f.id !== id);
      const activeFrameId = p.activeFrameId === id
        ? frames[Math.max(0, idx - 1)].id
        : p.activeFrameId;
      return { ...p, frames, activeFrameId };
    }); },
    onReorderFrame: (from, to) => { setPlaying(false); setProject((p) => {
      if (from === to || from == null || to == null) return p;
      const frames = [...p.frames];
      const [moved] = frames.splice(from, 1);
      frames.splice(to, 0, moved);
      return { ...p, frames };
    }); },
    onSetFps: (fps) => setProject((p) => ({
      ...p, fps: Math.max(MIN_FPS, Math.min(MAX_FPS, Math.round(fps) || MIN_FPS)),
    })),
    onTogglePlay: () => setPlaying((pl) => !pl),
    onToggleOnion: () => setOnion((o) => !o),
  };

  // --- Playback --------------------------------------------------------------

  // Cycle the previewed frame while playing. Restarts on play toggle, fps change
  // or frame count change. previewFrameId stays null when stopped.
  useEffect(() => {
    if (!playing || !project || project.frames.length < 2) {
      setPreviewFrameId(null);
      return undefined;
    }
    playIndexRef.current = Math.max(0, project.frames.findIndex((f) => f.id === project.activeFrameId));
    setPreviewFrameId(project.frames[playIndexRef.current].id);
    const interval = setInterval(() => {
      const cur = projectRef.current;
      playIndexRef.current = (playIndexRef.current + 1) % cur.frames.length;
      setPreviewFrameId(cur.frames[playIndexRef.current].id);
    }, 1000 / project.fps);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, project?.fps, project?.frames.length]);

  // Frame-scoped views for the canvas + onion skin (memoised so the art canvas
  // does not redraw on unrelated re-renders such as hover).
  const activeFrameSafe = project ? getActiveFrame(project) : null;
  const displayFrameSafe = project
    ? ((playing && previewFrameId && project.frames.find((f) => f.id === previewFrameId))
      || activeFrameSafe)
    : null;
  const canvasProject = useMemo(
    () => (project && displayFrameSafe ? frameView(project, displayFrameSafe) : null),
    [project, displayFrameSafe],
  );
  const activeIndexSafe = project
    ? project.frames.findIndex((f) => f.id === project.activeFrameId)
    : -1;
  const onionFrameSafe = (project && onion && !playing
    && project.frames.length > 1 && activeIndexSafe > 0)
    ? project.frames[activeIndexSafe - 1]
    : null;
  const onionProject = useMemo(
    () => (project && onionFrameSafe ? frameView(project, onionFrameSafe) : null),
    [project, onionFrameSafe],
  );

  // --- Colour / swatches -----------------------------------------------------

  const handleAddSwatch = (c) => setProject((p) => (
    p.palette.includes(c) ? p : { ...p, palette: [...p.palette, c].slice(-16) }
  ));

  // Removes a single swatch from the current project's palette by index.
  const handleRemoveSwatch = (index) => setProject((p) => ({
    ...p,
    palette: p.palette.filter((_, i) => i !== index),
  }));

  // Merge colours from the global swatch library into the project palette.
  const handleImportSwatches = (colors) => {
    setProject((p) => {
      const merged = [...p.palette];
      for (const c of colors) {
        const hex = typeof c === 'string' ? c.toLowerCase() : null;
        if (hex && !merged.includes(hex)) merged.push(hex);
      }
      return { ...p, palette: merged.slice(-32) };
    });
    setSwatchesOpen(false);
  };

  const handleEyedrop = (cell) => {
    if (cell && cell.color) {
      setColor(cell.color);
      setAlpha(cell.alpha);
      setEffect(cell.effect ? { ...cell.effect } : null);
    }
  };

  // --- Project open / import -------------------------------------------------

  const openProject = (next) => {
    setPlaying(false);
    setProject(next);
    setHistory(createHistory());
    saveProject(next);
    setGalleryOpen(false);
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        openProject(validateProject(data));
      } catch (err) {
        window.alert(`Could not import project: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleAddImageLayer = (name, cells) => {
    setProject((prev) => {
      const fId = prev.activeFrameId;
      const layer = createLayerFromCells(name, cells);
      return {
        ...prev,
        frames: prev.frames.map((f) => (f.id === fId
          ? { ...f, layers: [...f.layers, layer], activeLayerId: layer.id }
          : f)),
      };
    });
  };

  const handleApplyShading = () => {
    const layer = getActiveFrameLayer(projectRef.current);
    if (!layer) return;
    pushHistory();
    const shaded = applyShading(
      layer.cells,
      { width: project.width, height: project.height },
      light.fx * project.width,
      light.fy * project.height,
      shadeStrength,
    );
    setActiveCells(shaded);
  };

  // --- Keyboard shortcuts ----------------------------------------------------

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || exportOpen || galleryOpen || imageOpen || swatchesOpen) {
        return;
      }
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo(); else handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        setExportOpen(true);
        return;
      }
      if (e.ctrlKey || e.metaKey) return;
      if (key === 'x') {
        setMirror((m) => MIRROR_MODES[(MIRROR_MODES.indexOf(m) + 1) % MIRROR_MODES.length]);
        return;
      }
      if (key === '[') {
        setBrushSize((s) => Math.max(MIN_BRUSH, s - 1));
        return;
      }
      if (key === ']') {
        setBrushSize((s) => Math.min(MAX_BRUSH, s + 1));
        return;
      }
      if (SHORTCUT_TOOLS[key]) setActiveTool(SHORTCUT_TOOLS[key]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo, handleRedo, exportOpen, galleryOpen, imageOpen, swatchesOpen]);

  if (!project) {
    return <div className={styles.pxls}><p className={styles.emptyNote}>Loading editor…</p></div>;
  }

  const brush = { tool: activeTool, color, alpha, effect, size: brushSize, mirror };

  const activeFrame = getActiveFrame(project);

  return (
    <div className={styles.pxls}>
      <div className={styles.topBar}>
        <span className={styles.brand}>
          PXLS<span className={styles.brandDot}>.</span>
        </span>
        <input
          className={styles.projectName}
          value={project.name}
          onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))}
          aria-label="Project name"
        />
        <span className={styles.spacer} />
        <button type="button" className={styles.barBtn} onClick={handleUndo} disabled={!canUndo(history)}>
          Undo
        </button>
        <button type="button" className={styles.barBtn} onClick={handleRedo} disabled={!canRedo(history)}>
          Redo
        </button>
        <button type="button" className={styles.barBtn} onClick={() => setImageOpen(true)}>
          Image
        </button>
        <button type="button" className={styles.barBtn} onClick={() => setSwatchesOpen(true)}>
          Swatches
        </button>
        <button type="button" className={styles.barBtn} onClick={() => setGalleryOpen(true)}>
          Projects
        </button>
        <button
          type="button"
          className={`${styles.barBtn} ${styles.barBtnPrimary}`}
          onClick={() => setExportOpen(true)}
        >
          Export
        </button>
      </div>

      <div className={styles.workspace}>
        <Toolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          brushSize={brushSize}
          onBrushSize={setBrushSize}
          mirror={mirror}
          onMirror={setMirror}
        />

        <div className={styles.canvasArea}>
          <Canvas
            project={canvasProject}
            onionProject={onionProject}
            interactive={!playing}
            brush={brush}
            light={light}
            onLightMove={(fx, fy) => setLight({ fx, fy })}
            shadeLocked={shadeLocked}
            shadeStrength={shadeStrength}
            onPushHistory={pushHistory}
            onSetCells={setActiveCells}
            onEyedrop={handleEyedrop}
            onHover={(x, y) => setHover({ x, y })}
          />
          <div className={styles.statusRow}>
            <span>{project.width}×{project.height}</span>
            <span>{TOOLS[activeTool].name}</span>
            <span>{hover.x >= 0 ? `${hover.x}, ${hover.y}` : '—'}</span>
          </div>
          <Timeline
            project={project}
            activeFrameId={project.activeFrameId}
            previewFrameId={playing ? previewFrameId : null}
            fps={project.fps}
            playing={playing}
            onion={onion}
            handlers={frameHandlers}
          />
        </div>

        <div className={styles.panels}>
          <ColorPanel
            color={color}
            onColor={setColor}
            alpha={alpha}
            onAlpha={setAlpha}
            swatches={project.palette}
            onAddSwatch={handleAddSwatch}
            onRemoveSwatch={handleRemoveSwatch}
          />
          <EffectsPanel effect={effect} onEffect={setEffect} />
          {activeTool === 'shade' && (
            <ShadePanel
              strength={shadeStrength}
              onStrength={setShadeStrength}
              light={light}
              locked={shadeLocked}
              onToggleLock={() => setShadeLocked((v) => !v)}
              onApply={handleApplyShading}
              onResetLight={() => setLight({ fx: 0.25, fy: 0.2 })}
            />
          )}
          <LayersPanel
            layers={activeFrame.layers}
            activeLayerId={activeFrame.activeLayerId}
            handlers={layerHandlers}
          />
        </div>
      </div>

      {galleryOpen && (
        <ProjectGallery
          onOpen={openProject}
          onClose={() => setGalleryOpen(false)}
          onImport={handleImport}
        />
      )}
      {exportOpen && (
        <ExportModal project={project} onClose={() => setExportOpen(false)} />
      )}
      {imageOpen && (
        <ImageImportModal
          project={project}
          onAddLayer={handleAddImageLayer}
          onClose={() => setImageOpen(false)}
        />
      )}
      {swatchesOpen && (
        <SwatchesModal
          color={color}
          projectSwatches={project.palette}
          onColor={setColor}
          onImportToProject={handleImportSwatches}
          onClose={() => setSwatchesOpen(false)}
        />
      )}
    </div>
  );
}
