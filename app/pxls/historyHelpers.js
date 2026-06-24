/**
 * PXLS History Helpers
 *
 * Undo / redo stack for the active layer. Each entry is a snapshot of a layer's
 * cells plus the frame id and layer id it belongs to. The stack is capped at
 * HISTORY_CAP.
 *
 * History is intentionally per stroke: callers push one snapshot of the state
 * BEFORE a stroke begins, so undo restores the pre stroke state.
 */

import { HISTORY_CAP } from './constants';
import { cloneCells } from './pxlsModel';

/**
 * Creates an empty history object.
 * @returns {{ past: Object[], future: Object[] }}
 */
export const createHistory = () => ({ past: [], future: [] });

/**
 * Pushes a snapshot of a layer onto the past stack and clears the redo future.
 * @param {Object} history
 * @param {string} frameId
 * @param {string} layerId
 * @param {Object[]} cells - the cells BEFORE the change
 * @returns {Object} new history
 */
export const pushHistory = (history, frameId, layerId, cells) => {
  const past = [...history.past, { frameId, layerId, cells: cloneCells(cells) }];
  if (past.length > HISTORY_CAP) past.shift();
  return { past, future: [] };
};

/**
 * Undo: pops the last past snapshot. Returns the snapshot to apply and the
 * new history, after moving the CURRENT cells onto the future stack.
 * @param {Object} history
 * @param {Function} getCurrentCells - (frameId, layerId) => cells | null
 * @returns {{ snapshot: Object|null, history: Object }}
 */
export const undo = (history, getCurrentCells) => {
  if (history.past.length === 0) return { snapshot: null, history };
  const past = [...history.past];
  const snapshot = past.pop();
  const currentCells = getCurrentCells(snapshot.frameId, snapshot.layerId);
  const future = currentCells
    ? [{ frameId: snapshot.frameId, layerId: snapshot.layerId, cells: cloneCells(currentCells) }, ...history.future]
    : history.future;
  return { snapshot, history: { past, future } };
};

/**
 * Redo: pops the first future snapshot, pushing current cells back onto past.
 * @param {Object} history
 * @param {Function} getCurrentCells - (frameId, layerId) => cells | null
 * @returns {{ snapshot: Object|null, history: Object }}
 */
export const redo = (history, getCurrentCells) => {
  if (history.future.length === 0) return { snapshot: null, history };
  const future = [...history.future];
  const snapshot = future.shift();
  const currentCells = getCurrentCells(snapshot.frameId, snapshot.layerId);
  const past = currentCells
    ? [...history.past, { frameId: snapshot.frameId, layerId: snapshot.layerId, cells: cloneCells(currentCells) }]
    : history.past;
  return { snapshot, history: { past, future } };
};

export const canUndo = (history) => history.past.length > 0;
export const canRedo = (history) => history.future.length > 0;
