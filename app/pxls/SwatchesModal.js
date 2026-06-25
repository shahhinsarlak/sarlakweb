'use client';

/**
 * PXLS Swatches Modal
 *
 * Two tabs:
 * - Presets: locked, categorised starter palettes (PREMADE_SWATCH_GROUPS). Each
 *   colour can be selected for painting or the whole group imported into the
 *   current project palette. Presets are read-only.
 * - My Swatches: the user's own named swatches, organised into folders they
 *   create. Colours can be saved with a name, renamed, deleted, moved between
 *   folders, and imported into the project. Persisted in localStorage and shared
 *   across every project.
 *
 * @param {Object} props
 * @param {string} props.color - current brush colour
 * @param {string[]} props.projectSwatches - the current project's palette
 * @param {Function} props.onColor - (hex) => void, select a colour
 * @param {Function} props.onImportToProject - (colors[]) => void, merge into palette
 * @param {Function} props.onClose
 */

import { useEffect, useState } from 'react';
import {
  getCustomSwatches, addSwatchFolder, renameSwatchFolder, deleteSwatchFolder,
  addCustomSwatch, deleteCustomSwatch, renameCustomSwatch, moveCustomSwatch,
} from './storageHelpers';
import { PREMADE_SWATCH_GROUPS } from './constants';
import styles from './page.module.css';

export default function SwatchesModal({
  color, projectSwatches, onColor, onImportToProject, onClose,
}) {
  const [tab, setTab] = useState('presets');
  const [data, setData] = useState({ folders: [] });
  const [saveName, setSaveName] = useState('');
  const [saveFolderId, setSaveFolderId] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    const loaded = getCustomSwatches();
    setData(loaded);
    if (loaded.folders[0]) setSaveFolderId(loaded.folders[0].id);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Applies an updated structure and keeps the save-target folder valid.
  const apply = (next) => {
    setData(next);
    if (!next.folders.some((f) => f.id === saveFolderId)) {
      setSaveFolderId(next.folders[0] ? next.folders[0].id : '');
    }
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    const next = addSwatchFolder(newFolderName);
    setData(next);
    const created = next.folders[next.folders.length - 1];
    if (created) setSaveFolderId(created.id);
    setNewFolderName('');
  };

  const handleSaveCurrent = () => {
    const next = addCustomSwatch(saveFolderId, color, saveName);
    setData(next);
    if (!saveFolderId && next.folders[0]) setSaveFolderId(next.folders[0].id);
    setSaveName('');
  };

  const handleSaveProjectPalette = () => {
    let next = data;
    for (const c of projectSwatches) next = addCustomSwatch(saveFolderId, c, '');
    setData(next);
    if (!saveFolderId && next.folders[0]) setSaveFolderId(next.folders[0].id);
  };

  const handleImportColors = (colors) => {
    if (colors.length) onImportToProject(colors);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <h2 className={styles.modalTitle}>Swatches</h2>

        <div className={styles.swTabs}>
          <button
            type="button"
            className={`${styles.swTab} ${tab === 'presets' ? styles.swTabActive : ''}`}
            onClick={() => setTab('presets')}
          >
            Presets
          </button>
          <button
            type="button"
            className={`${styles.swTab} ${tab === 'custom' ? styles.swTabActive : ''}`}
            onClick={() => setTab('custom')}
          >
            My Swatches
          </button>
        </div>

        {tab === 'presets' && (
          <div>
            <p className={styles.emptyNote}>
              Locked starter palettes. Click a colour to paint with it, or add a whole
              group to your project palette.
            </p>
            {PREMADE_SWATCH_GROUPS.map((group) => (
              <div key={group.id} className={styles.presetGroup}>
                <div className={styles.presetHead}>
                  <strong>{group.name}</strong>
                  <span className={styles.lockTag}>Locked</span>
                  <span className={styles.spacer} />
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => handleImportColors(group.colors.map((c) => c.hex))}
                  >
                    Use in project
                  </button>
                </div>
                <div className={styles.chipWrap}>
                  {group.colors.map((c) => (
                    <button
                      key={c.hex + c.name}
                      type="button"
                      className={`${styles.chip} ${color === c.hex ? styles.chipActive : ''}`}
                      onClick={() => onColor(c.hex)}
                      title={`${c.name} ${c.hex}`}
                    >
                      <span className={styles.chipColor} style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'custom' && (
          <div>
            <div className={styles.field}>
              <label>Save current colour</label>
              <div className={styles.swatchModalRow}>
                <span className={styles.colorPreview} style={{ backgroundColor: color }} />
                <input
                  type="text"
                  className={styles.hexInput}
                  placeholder={color}
                  value={saveName}
                  maxLength={32}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCurrent(); }}
                  aria-label="Swatch name"
                />
                <select
                  className={styles.swatchMove}
                  value={saveFolderId}
                  onChange={(e) => setSaveFolderId(e.target.value)}
                  aria-label="Target folder"
                >
                  {data.folders.length === 0 && <option value="">My Swatches (new)</option>}
                  {data.folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <button type="button" className={styles.iconBtn} onClick={handleSaveCurrent}>
                  Save
                </button>
              </div>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={handleSaveProjectPalette}
                disabled={projectSwatches.length === 0}
                style={{ marginTop: '0.4rem' }}
              >
                Save whole project palette
              </button>
            </div>

            <div className={styles.field}>
              <label>New folder</label>
              <div className={styles.swatchModalRow}>
                <input
                  type="text"
                  className={styles.hexInput}
                  placeholder="Folder name"
                  value={newFolderName}
                  maxLength={32}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddFolder(); }}
                  aria-label="New folder name"
                />
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={handleAddFolder}
                  disabled={!newFolderName.trim()}
                >
                  Add folder
                </button>
              </div>
            </div>

            {data.folders.length === 0 ? (
              <p className={styles.emptyNote}>
                No folders yet. Create one above, then save colours into it to build your
                own organised swatch library.
              </p>
            ) : (
              data.folders.map((folder) => (
                <div key={folder.id} className={styles.folderBlock}>
                  <div className={styles.folderHead}>
                    <input
                      type="text"
                      className={styles.folderNameInput}
                      defaultValue={folder.name}
                      maxLength={32}
                      aria-label="Folder name"
                      onBlur={(e) => apply(renameSwatchFolder(folder.id, e.target.value))}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                    />
                    <span className={styles.folderCount}>{folder.swatches.length}</span>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => handleImportColors(folder.swatches.map((s) => s.hex))}
                      disabled={folder.swatches.length === 0}
                    >
                      Use in project
                    </button>
                    <button
                      type="button"
                      className={styles.rowDelete}
                      onClick={() => apply(deleteSwatchFolder(folder.id))}
                      title="Delete folder"
                      aria-label={`Delete folder ${folder.name}`}
                    >
                      ×
                    </button>
                  </div>

                  {folder.swatches.length === 0 ? (
                    <p className={styles.emptyNote}>Empty. Save a colour into this folder.</p>
                  ) : (
                    folder.swatches.map((s) => (
                      <div key={s.id} className={styles.swatchRow}>
                        <button
                          type="button"
                          className={`${styles.swatchRowColor} ${color === s.hex ? styles.swatchActive : ''}`}
                          style={{ backgroundColor: s.hex }}
                          onClick={() => onColor(s.hex)}
                          title={`${s.hex} (click to use)`}
                          aria-label={`Use colour ${s.name}`}
                        />
                        <input
                          type="text"
                          className={styles.swatchRowName}
                          defaultValue={s.name}
                          maxLength={32}
                          aria-label="Swatch name"
                          onBlur={(e) => apply(renameCustomSwatch(folder.id, s.id, e.target.value))}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                        />
                        {data.folders.length > 1 && (
                          <select
                            className={styles.swatchMove}
                            value={folder.id}
                            onChange={(e) => apply(moveCustomSwatch(folder.id, s.id, e.target.value))}
                            title="Move to folder"
                            aria-label="Move swatch to folder"
                          >
                            {data.folders.map((f) => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        )}
                        <button
                          type="button"
                          className={styles.rowDelete}
                          onClick={() => apply(deleteCustomSwatch(folder.id, s.id))}
                          title="Remove swatch"
                          aria-label={`Remove ${s.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <div className={styles.modalActions}>
          <span className={styles.spacer} />
          <button type="button" className={styles.barBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
