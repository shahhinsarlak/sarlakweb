/**
 * Save/Load System
 *
 * Handles game state persistence:
 * - saveGame: Downloads save file to disk
 * - loadGame: Loads save file from disk
 * - exportToClipboard: Copies save data to clipboard
 * - importFromClipboard: Loads save data from clipboard
 *
 * Save format: JSON with version and timestamp
 */

import { INITIAL_GAME_STATE } from './constants';

/**
 * Saves current game state to a downloadable JSON file
 *
 * @param {Object} gameState - Current game state to save
 */
export const saveGame = (gameState) => {
    const saveData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      state: gameState
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

          if (!saveData.version || !saveData.state) {
            throw new Error('Invalid save file format');
          }

          // Merge loaded state with INITIAL_GAME_STATE defaults so old saves
          // receive all new properties introduced after the save was created.
          const mergedState = { ...INITIAL_GAME_STATE, ...saveData.state };

          // Offline PP accumulation (Phase 20)
          const now = Date.now();
          if (mergedState.lastSavedAt && mergedState.lastSavedAt > 0) {
            const elapsedSeconds = Math.min((now - mergedState.lastSavedAt) / 1000, 14400); // cap 4h
            if (elapsedSeconds > 60 && mergedState.ppPerSecond > 0) {
              const offlinePP = Math.floor(mergedState.ppPerSecond * 0.5 * elapsedSeconds);
              mergedState.pp = (mergedState.pp || 0) + offlinePP;

              const hours = (elapsedSeconds / 3600).toFixed(1);
              let ppDisplay;
              if (offlinePP >= 1e12) ppDisplay = (offlinePP / 1e12).toFixed(1) + 'T';
              else if (offlinePP >= 1e9) ppDisplay = (offlinePP / 1e9).toFixed(1) + 'B';
              else if (offlinePP >= 1e6) ppDisplay = (offlinePP / 1e6).toFixed(1) + 'M';
              else if (offlinePP >= 1e3) ppDisplay = (offlinePP / 1e3).toFixed(1) + 'K';
              else ppDisplay = String(offlinePP);

              mergedState.notifications = [
                ...(mergedState.notifications || []),
                {
                  id: `offline_${now}`,
                  message: `You were away ${hours}h. Earned +${ppDisplay} PP while offline.`,
                  timestamp: now,
                },
              ];
            }
          }
          mergedState.lastSavedAt = now;

          setGameState(mergedState);
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
      version: '1.0',
      timestamp: new Date().toISOString(),
      state: gameState
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
          if (!saveData.version || !saveData.state) {
            throw new Error('Invalid save data');
          }
          // Merge with INITIAL_GAME_STATE defaults for version migration
          const mergedState = { ...INITIAL_GAME_STATE, ...saveData.state };

          // Offline PP accumulation (Phase 20)
          const now = Date.now();
          if (mergedState.lastSavedAt && mergedState.lastSavedAt > 0) {
            const elapsedSeconds = Math.min((now - mergedState.lastSavedAt) / 1000, 14400); // cap 4h
            if (elapsedSeconds > 60 && mergedState.ppPerSecond > 0) {
              const offlinePP = Math.floor(mergedState.ppPerSecond * 0.5 * elapsedSeconds);
              mergedState.pp = (mergedState.pp || 0) + offlinePP;

              const hours = (elapsedSeconds / 3600).toFixed(1);
              let ppDisplay;
              if (offlinePP >= 1e12) ppDisplay = (offlinePP / 1e12).toFixed(1) + 'T';
              else if (offlinePP >= 1e9) ppDisplay = (offlinePP / 1e9).toFixed(1) + 'B';
              else if (offlinePP >= 1e6) ppDisplay = (offlinePP / 1e6).toFixed(1) + 'M';
              else if (offlinePP >= 1e3) ppDisplay = (offlinePP / 1e3).toFixed(1) + 'K';
              else ppDisplay = String(offlinePP);

              mergedState.notifications = [
                ...(mergedState.notifications || []),
                {
                  id: `offline_${now}`,
                  message: `You were away ${hours}h. Earned +${ppDisplay} PP while offline.`,
                  timestamp: now,
                },
              ];
            }
          }
          mergedState.lastSavedAt = now;

          setGameState(mergedState);
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