'use client';

/**
 * PXLS Toolbar
 *
 * Tool selection, brush size, and mirror mode controls.
 *
 * @param {Object} props
 * @param {string} props.activeTool
 * @param {Function} props.onSelectTool
 * @param {number} props.brushSize
 * @param {Function} props.onBrushSize
 * @param {string} props.mirror
 * @param {Function} props.onMirror
 */

import { TOOLS, TOOL_ORDER, MIN_BRUSH, MAX_BRUSH } from './constants';
import styles from './page.module.css';

const MIRROR_LABELS = { none: 'Off', x: 'X', y: 'Y', both: 'XY' };

export default function Toolbar({
  activeTool, onSelectTool, brushSize, onBrushSize, mirror, onMirror,
}) {
  return (
    <div className={styles.toolbar}>
      {TOOL_ORDER.map((id) => {
        const tool = TOOLS[id];
        return (
          <button
            key={id}
            type="button"
            className={`${styles.toolBtn} ${activeTool === id ? styles.toolBtnActive : ''}`}
            onClick={() => onSelectTool(id)}
            title={`${tool.name} (${tool.shortcut})`}
          >
            <span>{tool.name}</span>
            <span className={styles.toolKey}>{tool.shortcut}</span>
          </button>
        );
      })}

      <div className={styles.toolMeta}>
        <span className={styles.metaLabel}>Brush size</span>
        <div className={styles.rangeRow}>
          <input
            type="range"
            min={MIN_BRUSH}
            max={MAX_BRUSH}
            value={brushSize}
            onChange={(e) => onBrushSize(Number(e.target.value))}
          />
          <span>{brushSize}px</span>
        </div>

        <span className={styles.metaLabel}>Mirror</span>
        <div className={styles.mirrorRow}>
          {Object.keys(MIRROR_LABELS).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`${styles.mirrorBtn} ${mirror === mode ? styles.mirrorBtnActive : ''}`}
              onClick={() => onMirror(mode)}
            >
              {MIRROR_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
