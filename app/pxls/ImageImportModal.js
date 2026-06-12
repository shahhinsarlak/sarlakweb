'use client';

/**
 * PXLS Image Import Modal
 *
 * Loads an image (file picker or drag and drop), downsamples it to the current
 * canvas size, previews the result, and adds it as a new layer. The target size
 * is locked to the current canvas size; choosing another size shows a notice to
 * create a new project at that size instead.
 *
 * @param {Object} props
 * @param {Object} props.project
 * @param {Function} props.onAddLayer - (name, cells) => void
 * @param {Function} props.onClose
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { CANVAS_SIZES } from './constants';
import { loadImageFile, imageToCells } from './imageHelpers';
import { compositeToCanvas } from './renderHelpers';
import styles from './page.module.css';

export default function ImageImportModal({ project, onAddLayer, onClose }) {
  const canvasSize = project.width;
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const [cells, setCells] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [scale, setScale] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const fileRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Build the downsampled cells whenever the image or its transform changes.
  useEffect(() => {
    if (!image) { setCells(null); return; }
    setCells(imageToCells(image, canvasSize, canvasSize, {
      scale: scale / 100,
      offsetX: (offsetX / 100) * canvasSize,
      offsetY: (offsetY / 100) * canvasSize,
    }));
  }, [image, canvasSize, scale, offsetX, offsetY]);

  // Render the preview.
  useEffect(() => {
    if (!cells || !previewRef.current) return;
    const cell = Math.max(1, Math.floor(180 / canvasSize));
    const preview = {
      width: canvasSize,
      height: canvasSize,
      layers: [{ id: 'p', name: 'p', visible: true, opacity: 1, cells }],
      seed: 0,
    };
    compositeToCanvas(previewRef.current, preview, cell, { includeEffects: false });
  }, [cells, canvasSize]);

  const handleFile = useCallback(async (file) => {
    setError('');
    try {
      const img = await loadImageFile(file);
      setImage(img);
      setScale(100);
      setOffsetX(0);
      setOffsetY(0);
      setFileName(file.name.replace(/\.[^.]+$/, ''));
    } catch (err) {
      setError(err.message);
      setImage(null);
    }
  }, []);

  const onInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onSizeClick = (size) => {
    if (size === canvasSize) {
      setNotice('');
    } else {
      setNotice(`The image imports at the current canvas size (${canvasSize}×${canvasSize}). `
        + `To import at ${size}×${size}, create a new project at that size first.`);
    }
  };

  const handleAdd = () => {
    if (!cells) return;
    onAddLayer(fileName || 'Image', cells);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Import image</h2>

        <div
          className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {fileName ? `Loaded: ${fileName}` : 'Click to choose an image, or drop one here'}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onInputChange}
          />
        </div>

        {error && <div className={styles.errorText}>{error}</div>}

        <div className={styles.field} style={{ marginTop: '1rem' }}>
          <label>Target size</label>
          <div className={styles.segmented}>
            {CANVAS_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                className={s === canvasSize ? styles.segmentedActive : ''}
                onClick={() => onSizeClick(s)}
              >
                {s}×{s}
              </button>
            ))}
          </div>
          {notice && <div className={styles.noticeText}>{notice}</div>}
        </div>

        {cells && (
          <div className={styles.field}>
            <label>Preview ({canvasSize}×{canvasSize}, contain fit)</label>
            <div className={styles.previewWrap}>
              <canvas ref={previewRef} className={styles.previewCanvas} />
            </div>
          </div>
        )}

        {cells && (
          <div className={styles.field}>
            <div className={styles.rangeRow}>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, width: 52 }}>Scale</span>
              <input
                type="range"
                min={10}
                max={1000}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.7rem', width: 42, textAlign: 'right' }}>{scale}%</span>
            </div>
            <div className={styles.rangeRow}>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, width: 52 }}>Pos X</span>
              <input
                type="range"
                min={-100}
                max={100}
                value={offsetX}
                onChange={(e) => setOffsetX(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.7rem', width: 42, textAlign: 'right' }}>{offsetX}%</span>
            </div>
            <div className={styles.rangeRow}>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, width: 52 }}>Pos Y</span>
              <input
                type="range"
                min={-100}
                max={100}
                value={offsetY}
                onChange={(e) => setOffsetY(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.7rem', width: 42, textAlign: 'right' }}>{offsetY}%</span>
            </div>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => { setScale(100); setOffsetX(0); setOffsetY(0); }}
            >
              Reset transform
            </button>
          </div>
        )}

        <div className={styles.modalActions}>
          <button type="button" className={styles.barBtn} onClick={onClose}>Cancel</button>
          <button
            type="button"
            className={`${styles.barBtn} ${styles.barBtnPrimary}`}
            onClick={handleAdd}
            disabled={!cells}
          >
            Add as new layer
          </button>
        </div>
      </div>
    </div>
  );
}
