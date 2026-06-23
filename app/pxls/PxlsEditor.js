'use client';

/**
 * PXLS Editor (root)
 *
 * Orchestrates the whole editor: holds the project as the single source of
 * truth, manages brush settings, undo/redo history, keyboard shortcuts, layer
 * operations, localStorage autosave, and the gallery / export modals.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import ColorPanel from './ColorPanel';
import LayersPanel from './LayersPanel';
import EffectsPanel from './EffectsPanel';
import ShadePanel from './ShadePanel';
import ExportModal from './ExportModal';
import ImageImportModal from './ImageImportModal';
import ProjectGallery from './ProjectGallery';
import {
  createHistory, pushHistory as pushHist, undo as undoHist, redo as redoHist,
  canUndo, canRedo,
} from './historyHelpers';
import {
  createProject, createLayer, createLayerFromCells, getActiveLayer, validateProject, cloneCells,
  duplicateLayer, makeEmptyCells, isEmptyCell,
} from './pxlsModel';
import { saveProject, getLastOpenId, listProjects } from './storageHelpers';
import { applyShading } from './shadingHelpers';
import { TOOLS, TOOL_ORDER, MIRROR_MODES, MIN_BRUSH, MAX_BRUSH } from './constants';
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
  const [hover, setHover] = useState({ x: -1, y: -1 });

  const projectRef = useRef(project);
  projectRef.current = project;

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
    const layer = getActiveLayer(p);
    if (layer) setHistory((h) => pushHist(h, layer.id, layer.cells));
  }, []);

  const applyCellsToLayer = useCallback((layerId, cells) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === layerId ? { ...l, cells } : l)),
    }));
  }, []);

  const setActiveCells = useCallback((cells) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === prev.activeLayerId ? { ...l, cells } : l)),
    }));
  }, []);

  const getCellsByLayer = useCallback((layerId) => {
    const layer = projectRef.current.layers.find((l) => l.id === layerId);
    return layer ? layer.cells : null;
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      const { snapshot, history: next } = undoHist(h, getCellsByLayer);
      if (snapshot) applyCellsToLayer(snapshot.layerId, cloneCells(snapshot.cells));
      return next;
    });
  }, [getCellsByLayer, applyCellsToLayer]);

  const handleRedo = useCallback(() => {
    setHistory((h) => {
      const { snapshot, history: next } = redoHist(h, getCellsByLayer);
      if (snapshot) applyCellsToLayer(snapshot.layerId, cloneCells(snapshot.cells));
      return next;
    });
  }, [getCellsByLayer, applyCellsToLayer]);

  // --- Layer operations ------------------------------------------------------

  const layerHandlers = {
    onSelect: (id) => setProject((p) => ({ ...p, activeLayerId: id })),
    onToggleVisible: (id) => setProject((p) => ({
      ...p,
      layers: p.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    })),
    onRename: (id, name) => setProject((p) => ({
      ...p,
      layers: p.layers.map((l) => (l.id === id ? { ...l, name } : l)),
    })),
    onAdd: () => setProject((p) => {
      const layer = createLayer(p.width, p.height, `Layer ${p.layers.length + 1}`);
      return { ...p, layers: [...p.layers, layer], activeLayerId: layer.id };
    }),
    onDuplicate: (id) => setProject((p) => {
      const source = p.layers.find((l) => l.id === id);
      if (!source) return p;
      const copy = duplicateLayer(source);
      const index = p.layers.findIndex((l) => l.id === id);
      const layers = [...p.layers];
      layers.splice(index + 1, 0, copy);
      return { ...p, layers, activeLayerId: copy.id };
    }),
    onClear: () => {
      const p = projectRef.current;
      const layer = getActiveLayer(p);
      if (!layer || layer.cells.every(isEmptyCell)) return;
      if (typeof window !== 'undefined'
        && !window.confirm('Clear this layer? You can undo this afterwards.')) {
        return;
      }
      pushHistory();
      applyCellsToLayer(layer.id, makeEmptyCells(p.width, p.height));
    },
    onDelete: (id) => setProject((p) => {
      if (p.layers.length <= 1) return p;
      const layers = p.layers.filter((l) => l.id !== id);
      const activeLayerId = p.activeLayerId === id ? layers[layers.length - 1].id : p.activeLayerId;
      return { ...p, layers, activeLayerId };
    }),
    onMoveUp: (index) => setProject((p) => {
      if (index >= p.layers.length - 1) return p;
      const layers = [...p.layers];
      [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
      return { ...p, layers };
    }),
    onMoveDown: (index) => setProject((p) => {
      if (index <= 0) return p;
      const layers = [...p.layers];
      [layers[index], layers[index - 1]] = [layers[index - 1], layers[index]];
      return { ...p, layers };
    }),
    onReorder: (from, to) => setProject((p) => {
      if (from === to || from == null || to == null) return p;
      const layers = [...p.layers];
      const [moved] = layers.splice(from, 1);
      layers.splice(to, 0, moved);
      return { ...p, layers };
    }),
    onOpacity: (id, opacity) => setProject((p) => ({
      ...p,
      layers: p.layers.map((l) => (l.id === id ? { ...l, opacity } : l)),
    })),
  };

  // --- Colour / swatches -----------------------------------------------------

  const handleAddSwatch = (c) => setProject((p) => (
    p.palette.includes(c) ? p : { ...p, palette: [...p.palette, c].slice(-16) }
  ));

  const handleEyedrop = (cell) => {
    if (cell && cell.color) {
      setColor(cell.color);
      setAlpha(cell.alpha);
      setEffect(cell.effect ? { ...cell.effect } : null);
    }
  };

  // --- Project open / import -------------------------------------------------

  const openProject = (next) => {
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
      const layer = createLayerFromCells(name, cells);
      return { ...prev, layers: [...prev.layers, layer], activeLayerId: layer.id };
    });
  };

  const handleApplyShading = () => {
    const layer = getActiveLayer(projectRef.current);
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
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || exportOpen || galleryOpen || imageOpen) {
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
  }, [handleUndo, handleRedo, exportOpen, galleryOpen, imageOpen]);

  if (!project) {
    return <div className={styles.pxls}><p className={styles.emptyNote}>Loading editor…</p></div>;
  }

  const brush = { tool: activeTool, color, alpha, effect, size: brushSize, mirror };

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
            project={project}
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
        </div>

        <div className={styles.panels}>
          <ColorPanel
            color={color}
            onColor={setColor}
            alpha={alpha}
            onAlpha={setAlpha}
            swatches={project.palette}
            onAddSwatch={handleAddSwatch}
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
            layers={project.layers}
            activeLayerId={project.activeLayerId}
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
    </div>
  );
}
