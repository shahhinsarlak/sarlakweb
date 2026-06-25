/**
 * PXLS Storage Helpers
 *
 * localStorage backed multi project gallery. All functions are guarded so a
 * disabled or full localStorage never throws into the UI.
 */

import { STORAGE_KEYS } from './constants';
import { validateProject, makeId } from './pxlsModel';

/**
 * Reads and parses all stored projects.
 * @returns {Object[]} array of projects (empty on error)
 */
export const listProjects = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.projects);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((p) => {
        try {
          return validateProject(p);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
};

/**
 * Writes the full project list.
 * @param {Object[]} projects
 * @returns {boolean} true on success
 */
const writeAll = (projects) => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    return true;
  } catch {
    return false;
  }
};

/**
 * Saves (inserts or updates) a single project, stamping updatedAt.
 * @param {Object} project
 * @returns {boolean} true on success
 */
export const saveProject = (project) => {
  const stamped = { ...project, updatedAt: Date.now() };
  const all = listProjects();
  const idx = all.findIndex((p) => p.id === stamped.id);
  if (idx >= 0) {
    all[idx] = stamped;
  } else {
    all.push(stamped);
  }
  const ok = writeAll(all);
  if (ok) setLastOpenId(stamped.id);
  return ok;
};

/**
 * Deletes a project by id.
 * @param {string} id
 * @returns {boolean}
 */
export const deleteProject = (id) => {
  const all = listProjects().filter((p) => p.id !== id);
  return writeAll(all);
};

/**
 * Records the last opened project id.
 * @param {string} id
 */
export const setLastOpenId = (id) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.lastOpenId, id);
  } catch {
    /* ignore quota / disabled storage */
  }
};

/**
 * Reads the last opened project id.
 * @returns {string|null}
 */
export const getLastOpenId = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEYS.lastOpenId);
  } catch {
    return null;
  }
};

const HEX_RE = /^#[0-9a-f]{6}$/;

/**
 * Reads the global swatch library: a flat list of hex colours shared across all
 * projects. Invalid entries are dropped.
 * @returns {string[]}
 */
export const getGlobalSwatches = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.swatches);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c) => typeof c === 'string' && HEX_RE.test(c.toLowerCase()));
  } catch {
    return [];
  }
};

/**
 * Overwrites the global swatch library.
 * @param {string[]} swatches
 * @returns {boolean} true on success
 */
export const setGlobalSwatches = (swatches) => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEYS.swatches, JSON.stringify(swatches));
    return true;
  } catch {
    return false;
  }
};

/**
 * Adds colours to the global library (lowercased, deduplicated, order kept).
 * @param {string[]} colors
 * @returns {string[]} the updated library
 */
export const addGlobalSwatches = (colors) => {
  const next = getGlobalSwatches();
  for (const c of colors) {
    if (typeof c !== 'string') continue;
    const hex = c.toLowerCase();
    if (HEX_RE.test(hex) && !next.includes(hex)) next.push(hex);
  }
  setGlobalSwatches(next);
  return next;
};

/**
 * Removes a colour from the global library.
 * @param {string} color
 * @returns {string[]} the updated library
 */
export const removeGlobalSwatch = (color) => {
  const next = getGlobalSwatches().filter((c) => c !== color.toLowerCase());
  setGlobalSwatches(next);
  return next;
};

/* -------------------------------------------------------------------------- */
/* Custom swatch library (named swatches organised into user folders).        */
/* Shape: { folders: [ { id, name, swatches: [ { id, hex, name } ] } ] }      */
/* -------------------------------------------------------------------------- */

/**
 * Coerces arbitrary parsed data into a valid custom-swatch structure, dropping
 * invalid entries and backfilling ids/names. Returns null if not an object with
 * a folders array (so the caller can fall back to migration / defaults).
 * @param {*} raw
 * @returns {{folders: Array}|null}
 */
const normalizeCustomData = (raw) => {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.folders)) return null;
  const folders = raw.folders
    .map((f) => {
      if (!f || typeof f !== 'object') return null;
      const swatches = Array.isArray(f.swatches)
        ? f.swatches
          .map((s) => {
            if (!s || typeof s.hex !== 'string') return null;
            const hex = s.hex.toLowerCase();
            if (!HEX_RE.test(hex)) return null;
            return {
              id: typeof s.id === 'string' && s.id ? s.id : makeId(),
              hex,
              name: typeof s.name === 'string' && s.name ? s.name : hex,
            };
          })
          .filter(Boolean)
        : [];
      return {
        id: typeof f.id === 'string' && f.id ? f.id : makeId(),
        name: typeof f.name === 'string' && f.name ? f.name : 'Folder',
        swatches,
      };
    })
    .filter(Boolean);
  return { folders };
};

/**
 * Persists the custom-swatch structure.
 * @param {{folders: Array}} data
 * @returns {boolean} true on success
 */
export const saveCustomSwatches = (data) => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEYS.customSwatches, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

/**
 * Reads the custom-swatch structure. On first run it migrates any legacy flat
 * swatch library into an "Imported" folder so older saves are not lost.
 * @returns {{folders: Array}}
 */
export const getCustomSwatches = () => {
  if (typeof window === 'undefined') return { folders: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.customSwatches);
    if (raw) {
      const norm = normalizeCustomData(JSON.parse(raw));
      if (norm) return norm;
    }
  } catch {
    /* fall through to migration / default */
  }
  const legacy = getGlobalSwatches();
  const folders = legacy.length
    ? [{
      id: makeId(),
      name: 'Imported',
      swatches: legacy.map((hex) => ({ id: makeId(), hex, name: hex })),
    }]
    : [];
  const data = { folders };
  saveCustomSwatches(data);
  return data;
};

/**
 * Adds a new (empty) folder.
 * @param {string} name
 * @returns {{folders: Array}} the updated structure
 */
export const addSwatchFolder = (name) => {
  const data = getCustomSwatches();
  data.folders.push({ id: makeId(), name: (name || '').trim() || 'New folder', swatches: [] });
  saveCustomSwatches(data);
  return data;
};

/**
 * Renames a folder.
 * @param {string} folderId
 * @param {string} name
 * @returns {{folders: Array}}
 */
export const renameSwatchFolder = (folderId, name) => {
  const data = getCustomSwatches();
  const folder = data.folders.find((f) => f.id === folderId);
  if (folder) folder.name = (name || '').trim() || folder.name;
  saveCustomSwatches(data);
  return data;
};

/**
 * Deletes a folder and everything in it.
 * @param {string} folderId
 * @returns {{folders: Array}}
 */
export const deleteSwatchFolder = (folderId) => {
  const data = getCustomSwatches();
  data.folders = data.folders.filter((f) => f.id !== folderId);
  saveCustomSwatches(data);
  return data;
};

/**
 * Adds a named swatch to a folder. If the folder is missing the first folder is
 * used, creating a default "My Swatches" folder when none exist yet.
 * @param {string} folderId
 * @param {string} hex
 * @param {string} name
 * @returns {{folders: Array}}
 */
export const addCustomSwatch = (folderId, hex, name) => {
  const data = getCustomSwatches();
  const h = typeof hex === 'string' ? hex.toLowerCase() : '';
  if (!HEX_RE.test(h)) return data;
  let folder = data.folders.find((f) => f.id === folderId);
  if (!folder) {
    [folder] = data.folders;
    if (!folder) {
      folder = { id: makeId(), name: 'My Swatches', swatches: [] };
      data.folders.push(folder);
    }
  }
  folder.swatches.push({ id: makeId(), hex: h, name: (name || '').trim() || h });
  saveCustomSwatches(data);
  return data;
};

/**
 * Removes a swatch from a folder.
 * @param {string} folderId
 * @param {string} swatchId
 * @returns {{folders: Array}}
 */
export const deleteCustomSwatch = (folderId, swatchId) => {
  const data = getCustomSwatches();
  const folder = data.folders.find((f) => f.id === folderId);
  if (folder) folder.swatches = folder.swatches.filter((s) => s.id !== swatchId);
  saveCustomSwatches(data);
  return data;
};

/**
 * Renames a swatch.
 * @param {string} folderId
 * @param {string} swatchId
 * @param {string} name
 * @returns {{folders: Array}}
 */
export const renameCustomSwatch = (folderId, swatchId, name) => {
  const data = getCustomSwatches();
  const folder = data.folders.find((f) => f.id === folderId);
  const swatch = folder && folder.swatches.find((s) => s.id === swatchId);
  if (swatch) swatch.name = (name || '').trim() || swatch.name;
  saveCustomSwatches(data);
  return data;
};

/**
 * Moves a swatch from one folder to another (appended to the end).
 * @param {string} fromFolderId
 * @param {string} swatchId
 * @param {string} toFolderId
 * @returns {{folders: Array}}
 */
export const moveCustomSwatch = (fromFolderId, swatchId, toFolderId) => {
  const data = getCustomSwatches();
  const from = data.folders.find((f) => f.id === fromFolderId);
  const to = data.folders.find((f) => f.id === toFolderId);
  if (!from || !to || from === to) return data;
  const idx = from.swatches.findIndex((s) => s.id === swatchId);
  if (idx < 0) return data;
  const [swatch] = from.swatches.splice(idx, 1);
  to.swatches.push(swatch);
  saveCustomSwatches(data);
  return data;
};
