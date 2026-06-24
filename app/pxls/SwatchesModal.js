'use client';

/**
 * PXLS Swatches Modal
 *
 * Manages the global swatch library: a flat list of colours stored in
 * localStorage and shared across every project. From here the user can save the
 * current colour or the whole project palette into the library, import the
 * library into the current project, select a saved colour, or delete saved
 * colours. The library persists independently of any single project.
 *
 * @param {Object} props
 * @param {string} props.color - current brush colour
 * @param {string[]} props.projectSwatches - the current project's saved swatches
 * @param {Function} props.onColor - (hex) => void, select a colour
 * @param {Function} props.onImportToProject - (colors[]) => void, merge into project palette
 * @param {Function} props.onClose
 */

import { useEffect, useState } from 'react';
import {
  getGlobalSwatches, addGlobalSwatches, removeGlobalSwatch, setGlobalSwatches,
} from './storageHelpers';
import styles from './page.module.css';

export default function SwatchesModal({
  color, projectSwatches, onColor, onImportToProject, onClose,
}) {
  const [library, setLibrary] = useState([]);

  useEffect(() => {
    setLibrary(getGlobalSwatches());
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleAddCurrent = () => setLibrary(addGlobalSwatches([color]));
  const handleSaveProject = () => setLibrary(addGlobalSwatches(projectSwatches));
  const handleDelete = (c) => setLibrary(removeGlobalSwatch(c));
  const handleClear = () => { setGlobalSwatches([]); setLibrary([]); };
  const handleImportAll = () => { if (library.length) onImportToProject(library); };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <h2 className={styles.modalTitle}>Swatch library</h2>

        <div className={styles.field}>
          <div className={styles.swatchModalRow}>
            <span className={styles.colorPreview} style={{ backgroundColor: color }} />
            <button type="button" className={styles.iconBtn} onClick={handleAddCurrent}>
              + Save current colour
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleSaveProject}
              disabled={projectSwatches.length === 0}
            >
              Save project swatches
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label>Saved swatches ({library.length})</label>
          {library.length === 0 ? (
            <p className={styles.emptyNote}>
              No saved swatches yet. Save a colour above to build a library that is shared
              across all of your projects.
            </p>
          ) : (
            <div className={styles.swatchGrid}>
              {library.map((c) => (
                <span key={c} className={styles.swatchLibCell}>
                  <button
                    type="button"
                    className={`${styles.swatch} ${color === c ? styles.swatchActive : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => onColor(c)}
                    title={`${c} (click to use)`}
                    aria-label={`Saved colour ${c}`}
                  />
                  <button
                    type="button"
                    className={styles.swatchDelete}
                    onClick={() => handleDelete(c)}
                    title="Remove from library"
                    aria-label={`Remove ${c}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.barBtn} onClick={handleClear} disabled={library.length === 0}>
            Clear library
          </button>
          <span className={styles.spacer} />
          <button type="button" className={styles.barBtn} onClick={onClose}>Close</button>
          <button
            type="button"
            className={`${styles.barBtn} ${styles.barBtnPrimary}`}
            onClick={handleImportAll}
            disabled={library.length === 0}
          >
            Import to project
          </button>
        </div>
      </div>
    </div>
  );
}
