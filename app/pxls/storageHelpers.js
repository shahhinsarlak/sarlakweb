/**
 * PXLS Storage Helpers
 *
 * localStorage backed multi project gallery. All functions are guarded so a
 * disabled or full localStorage never throws into the UI.
 */

import { STORAGE_KEYS } from './constants';
import { validateProject } from './pxlsModel';

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
