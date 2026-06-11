'use client';

/**
 * PXLS Project Gallery
 *
 * Lists saved projects from localStorage with thumbnails, lets the user open or
 * delete them, import a JSON project, and create a new project at a chosen size.
 *
 * @param {Object} props
 * @param {Function} props.onOpen - (project) => void
 * @param {Function} props.onClose
 * @param {Function} props.onImport - (file) => void
 */

import { useEffect, useRef, useState } from 'react';
import { CANVAS_SIZES, DEFAULT_CANVAS_SIZE } from './constants';
import { listProjects, deleteProject } from './storageHelpers';
import { createProject } from './pxlsModel';
import { compositeToCanvas } from './renderHelpers';
import styles from './page.module.css';

/** Small canvas that renders a project preview. */
function Thumb({ project }) {
  const ref = useRef(null);
  useEffect(() => {
    const cell = Math.max(1, Math.floor(96 / project.width));
    compositeToCanvas(ref.current, project, cell, { includeEffects: true });
  }, [project]);
  return (
    <canvas
      ref={ref}
      className={styles.galleryThumb}
      style={{
        backgroundImage:
          'linear-gradient(45deg,#bdbdbd 25%,transparent 25%),'
          + 'linear-gradient(-45deg,#bdbdbd 25%,transparent 25%),'
          + 'linear-gradient(45deg,transparent 75%,#bdbdbd 75%),'
          + 'linear-gradient(-45deg,transparent 75%,#bdbdbd 75%)',
        backgroundPosition: '0 0,0 5px,5px -5px,-5px 0',
      }}
    />
  );
}

export default function ProjectGallery({ onOpen, onClose, onImport }) {
  const [projects, setProjects] = useState([]);
  const [newSize, setNewSize] = useState(DEFAULT_CANVAS_SIZE);
  const fileRef = useRef(null);

  useEffect(() => {
    setProjects(listProjects());
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteProject(id);
    setProjects(listProjects());
  };

  const handleNew = () => {
    onOpen(createProject({ name: 'Untitled', size: newSize }));
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) onImport(file);
    e.target.value = '';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <h2 className={styles.modalTitle}>Projects</h2>

        <div className={styles.field}>
          <label>New canvas</label>
          <div className={styles.segmented}>
            {CANVAS_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                className={newSize === s ? styles.segmentedActive : ''}
                onClick={() => setNewSize(s)}
              >
                {s}×{s}
              </button>
            ))}
          </div>
          <div className={styles.modalActions} style={{ justifyContent: 'flex-start', marginTop: '0.75rem' }}>
            <button type="button" className={`${styles.barBtn} ${styles.barBtnPrimary}`} onClick={handleNew}>
              + New project
            </button>
            <button type="button" className={styles.barBtn} onClick={() => fileRef.current.click()}>
              Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Saved ({projects.length})</label>
          {projects.length === 0 ? (
            <p className={styles.emptyNote}>No saved projects yet. Create one above.</p>
          ) : (
            <div className={styles.galleryGrid}>
              {projects.map((p) => (
                <div key={p.id} className={styles.galleryCard} onClick={() => onOpen(p)}>
                  <Thumb project={p} />
                  <span className={styles.galleryName} title={p.name}>{p.name}</span>
                  <span className={styles.galleryMeta}>
                    <span>{p.width}×{p.height}</span>
                    <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </span>
                  <button
                    type="button"
                    className={styles.galleryDelete}
                    onClick={(e) => handleDelete(e, p.id)}
                  >
                    delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.barBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
