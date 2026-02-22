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