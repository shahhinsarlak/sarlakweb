'use client';

/**
 * PXLS Export Modal
 *
 * Lets the user export the current project. Filename is fully user supplied
 * (the correct extension is appended if missing). PNG supports an integer
 * upscale and a white / black / transparent background. SVG and JSON reuse the
 * same filename field.
 *
 * @param {Object} props
 * @param {Object} props.project
 * @param {Function} props.onClose
 */

import { useEffect, useState } from 'react';
import {
  EXPORT_FORMATS, EXPORT_SCALES, EXPORT_BACKGROUNDS, MIN_FPS, MAX_FPS,
} from './constants';
import { exportPNG, exportSVG, exportJSON } from './exportHelpers';
import { exportGIF } from './animationHelpers';
import styles from './page.module.css';

export default function ExportModal({ project, onClose }) {
  const [filename, setFilename] = useState(project.name || 'pxls-art');
  const [format, setFormat] = useState('png');
  const [scale, setScale] = useState(8);
  const [background, setBackground] = useState('transparent');
  const [includeEffects, setIncludeEffects] = useState(true);
  const [fps, setFps] = useState(project.fps || 8);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const bgColor = EXPORT_BACKGROUNDS[background].color;
  const frameCount = project.frames.length;

  const handleExport = async () => {
    setError('');
    setBusy(true);
    try {
      if (format === 'png') {
        await exportPNG(project, { scale, background: bgColor, includeEffects, filename });
      } else if (format === 'gif') {
        exportGIF(project, {
          scale, background: bgColor, includeEffects, fps, filename,
        });
      } else if (format === 'svg') {
        exportSVG(project, { scale, background: bgColor, includeEffects, filename });
      } else {
        exportJSON(project, { filename });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Export failed.');
    } finally {
      setBusy(false);
    }
  };

  const showVisual = format !== 'json';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Export</h2>

        <div className={styles.field}>
          <label htmlFor="pxls-filename">Filename</label>
          <input
            id="pxls-filename"
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="my-art"
          />
        </div>

        <div className={styles.field}>
          <label>Format</label>
          <div className={styles.segmented}>
            {Object.values(EXPORT_FORMATS).map((f) => (
              <button
                key={f.id}
                type="button"
                className={format === f.id ? styles.segmentedActive : ''}
                onClick={() => setFormat(f.id)}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {showVisual && (
          <>
            <div className={styles.field}>
              <label htmlFor="pxls-scale">
                Scale ({project.width * scale}×{project.height * scale}px)
              </label>
              <select
                id="pxls-scale"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              >
                {EXPORT_SCALES.map((s) => (
                  <option key={s} value={s}>
                    {s}× ({project.width * s}×{project.height * s})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Background</label>
              <div className={styles.segmented}>
                {Object.values(EXPORT_BACKGROUNDS).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={background === b.id ? styles.segmentedActive : ''}
                    onClick={() => setBackground(b.id)}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={includeEffects}
                onChange={(e) => setIncludeEffects(e.target.checked)}
              />
              Bake cell effects into the export
            </label>

            {format === 'gif' && (
              <div className={styles.field}>
                <label htmlFor="pxls-export-fps">
                  Speed ({fps} fps, {frameCount} frame{frameCount === 1 ? '' : 's'})
                </label>
                <input
                  id="pxls-export-fps"
                  type="number"
                  min={MIN_FPS}
                  max={MAX_FPS}
                  value={fps}
                  onChange={(e) => setFps(Math.max(
                    MIN_FPS,
                    Math.min(MAX_FPS, Number(e.target.value) || MIN_FPS),
                  ))}
                />
                {frameCount === 1 && (
                  <p className={styles.effectDesc}>
                    This project has a single frame. Add frames in the timeline for animation.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {error && <div className={styles.errorText}>{error}</div>}

        <div className={styles.modalActions}>
          <button type="button" className={styles.barBtn} onClick={onClose}>Cancel</button>
          <button
            type="button"
            className={`${styles.barBtn} ${styles.barBtnPrimary}`}
            onClick={handleExport}
            disabled={busy}
          >
            {busy ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
