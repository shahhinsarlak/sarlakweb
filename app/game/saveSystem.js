/**
 * Save/Load System
 *
 * Handles game state persistence:
 * - saveGame: Downloads save file to disk
 * - loadGame: Loads save file from disk
 * - exportToClipboard: Copies save data to clipboard
 * - importFromClipboard: Loads save data from clipboard
 * - saveToLocalStorage / loadFromLocalStorage: autosave persistence
 *
 * Save format: { version: <number>, timestamp: <ms>, state: <gameState> }
 */

import { INITIAL_GAME_STATE } from './constants';

/**
 * Current numeric save version. Bump this whenever the shape of game state
 * changes in a way that needs migrating, then add a migration keyed by the
 * previous version in MIGRATIONS below.
 */
export const CURRENT_SAVE_VERSION = 2;

/** localStorage key used for autosave persistence. */
export const LOCAL_KEY = 'sarlak-office-horror-save';

/**
 * Migration pipeline.
 *
 * MIGRATIONS is keyed by the version a save is migrating FROM. Each function
 * takes the state at that version and returns the state shaped for the next
 * version (i.e. fromVersion + 1).
 *
 * To add a future migration: bump CURRENT_SAVE_VERSION, then add an entry
 * keyed by the version you are migrating FROM. For example, when moving from
 * version 2 to 3:
 *
 *   const MIGRATIONS = {
 *     1: (state) => state,
 *     2: (state) => {
 *       // reshape state for version 3, e.g. rename a key
 *       const { oldKey, ...rest } = state;
 *       return { ...rest, newKey: oldKey };
 *     },
 *   };
 *
 * migrateState applies these in order until the state reaches the current
 * version, so each migration only needs to handle a single version step.
 */
const MIGRATIONS = {
  // 1 -> 2: no structural change. Placeholder so the pipeline is in place.
  1: (state) => state,
};

/**
 * Runs a parsed save payload through the migration pipeline and merges the
 * result over INITIAL_GAME_STATE so brand new keys still receive defaults.
 *
 * @param {Object} saveData - Parsed save payload { version, timestamp, state }
 * @returns {Object} Fully migrated game state
 */
function migrateState(saveData) {
  // Defensive: missing or malformed payload falls back to a fresh state.
  if (!saveData || typeof saveData !== 'object' || !saveData.state || typeof saveData.state !== 'object') {
    return { ...INITIAL_GAME_STATE };
  }

  // Normalize legacy versions: string '1.0' or missing both become numeric 1.
  let version = saveData.version;
  if (typeof version === 'string') {
    version = parseInt(version, 10) || 1;
  }
  if (typeof version !== 'number' || Number.isNaN(version) || version < 1) {
    version = 1;
  }

  let state = saveData.state;
  while (version < CURRENT_SAVE_VERSION) {
    const migrate = MIGRATIONS[version];
    if (typeof migrate === 'function') {
      state = migrate(state);
    }
    version += 1;
  }

  // Merge over defaults so any newly introduced keys are present.
  return { ...INITIAL_GAME_STATE, ...state };
}

/**
 * Applies offline PP accumulation to a state object (Phase 20).
 *
 * Rules (unchanged): cap elapsed at 4 hours, only grant if elapsed > 60s and
 * ppPerSecond > 0, grant Math.floor(ppPerSecond * 0.5 * elapsedSeconds), push
 * a notification, and refresh lastSavedAt to now.
 *
 * @param {Object} state - Migrated game state
 * @returns {Object} New state with offline progress applied
 */
function applyOfflineProgress(state) {
  const newState = { ...state };
  const now = Date.now();

  if (newState.lastSavedAt && newState.lastSavedAt > 0) {
    const elapsedSeconds = Math.min((now - newState.lastSavedAt) / 1000, 14400); // cap 4h
    if (elapsedSeconds > 60 && newState.ppPerSecond > 0) {
      const offlinePP = Math.floor(newState.ppPerSecond * 0.5 * elapsedSeconds);
      newState.pp = (newState.pp || 0) + offlinePP;

      const hours = (elapsedSeconds / 3600).toFixed(1);
      let ppDisplay;
      if (offlinePP >= 1e12) ppDisplay = (offlinePP / 1e12).toFixed(1) + 'T';
      else if (offlinePP >= 1e9) ppDisplay = (offlinePP / 1e9).toFixed(1) + 'B';
      else if (offlinePP >= 1e6) ppDisplay = (offlinePP / 1e6).toFixed(1) + 'M';
      else if (offlinePP >= 1e3) ppDisplay = (offlinePP / 1e3).toFixed(1) + 'K';
      else ppDisplay = String(offlinePP);

      newState.notifications = [
        ...(newState.notifications || []),
        {
          id: `offline_${now}`,
          message: `You were away ${hours}h. Earned +${ppDisplay} PP while offline.`,
          timestamp: now,
        },
      ];
    }
  }
  newState.lastSavedAt = now;

  return newState;
}

/**
 * Saves current game state to a downloadable JSON file
 *
 * @param {Object} gameState - Current game state to save
 */
export const saveGame = (gameState) => {
    const saveData = {
      version: CURRENT_SAVE_VERSION,
      timestamp: Date.now(),
      // Stamp lastSavedAt so offline progress measures from the real save time.
      state: { ...gameState, lastSavedAt: Date.now() }
    };

    const json = JSON.stringify(saveData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `office-game-save-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

/**
 * Loads game state from a file
 *
 * @param {File} file - File object containing save data
 * @param {Function} setGameState - setState function to update game state
 * @param {Function} addMessage - Function to add message to event log
 * @returns {Promise<Object>} Resolves with save data or rejects with error
 */
export const loadGame = (file, setGameState, addMessage) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const saveData = JSON.parse(e.target.result);

          // Let migrateState normalize the version (it handles missing/legacy/0).
          if (!saveData || !saveData.state) {
            throw new Error('Invalid save file format');
          }

          const migratedState = migrateState(saveData);
          const finalState = applyOfflineProgress(migratedState);

          setGameState(finalState);
          addMessage('Save loaded successfully.');
          resolve(saveData);
        } catch (error) {
          addMessage('Failed to load save file: ' + error.message);
          reject(error);
        }
      };

      reader.onerror = () => {
        addMessage('Failed to read save file.');
        reject(new Error('File read error'));
      };

      reader.readAsText(file);
    });
  };

/**
 * Exports game state to clipboard as JSON string
 *
 * @param {Object} gameState - Current game state to export
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const exportToClipboard = (gameState) => {
    const saveData = {
      version: CURRENT_SAVE_VERSION,
      timestamp: Date.now(),
      state: { ...gameState, lastSavedAt: Date.now() }
    };

    const json = JSON.stringify(saveData);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(json)
        .then(() => true)
        .catch(() => false);
    }

    return Promise.resolve(false);
  };

/**
 * Imports game state from clipboard
 *
 * @param {Function} setGameState - setState function to update game state
 * @param {Function} addMessage - Function to add message to event log
 * @returns {Promise<Object>} Resolves with save data or rejects with error
 */
export const importFromClipboard = (setGameState, addMessage) => {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return navigator.clipboard.readText()
        .then(text => {
          const saveData = JSON.parse(text);
          if (!saveData || !saveData.state) {
            throw new Error('Invalid save data');
          }

          const migratedState = migrateState(saveData);
          const finalState = applyOfflineProgress(migratedState);

          setGameState(finalState);
          addMessage('Save imported from clipboard.');
          return saveData;
        })
        .catch(error => {
          addMessage('Failed to import: ' + error.message);
          throw error;
        });
    }

    return Promise.reject(new Error('Clipboard API not supported'));
  };

/**
 * Writes the given state to localStorage for autosave persistence.
 *
 * @param {Object} state - Current game state to persist
 * @returns {boolean} True if written successfully, false otherwise
 */
export function saveToLocalStorage(state) {
  if (typeof window === 'undefined') return false;
  try {
    const saveData = {
      version: CURRENT_SAVE_VERSION,
      timestamp: Date.now(),
      state: { ...state, lastSavedAt: Date.now() },
    };
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Reads the autosave from localStorage, migrates it, and applies offline
 * progress.
 *
 * @returns {Object|null} Ready-to-use game state, or null if none/invalid
 */
export function loadFromLocalStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;

    const saveData = JSON.parse(raw);
    const migratedState = migrateState(saveData);
    return applyOfflineProgress(migratedState);
  } catch (error) {
    return null;
  }
}

/**
 * Returns whether a local autosave exists.
 *
 * @returns {boolean}
 */
export function hasLocalSave() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(LOCAL_KEY) !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Removes the local autosave.
 */
export function clearLocalSave() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LOCAL_KEY);
  } catch (error) {
    // ignore
  }
}
