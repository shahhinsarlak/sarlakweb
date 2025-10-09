// Save/Load system for game state

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
  
  export const loadGame = (file, setGameState, addMessage) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const saveData = JSON.parse(e.target.result);
          
          if (!saveData.version || !saveData.state) {
            throw new Error('Invalid save file format');
          }
          
          setGameState(saveData.state);
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
  
  export const importFromClipboard = (setGameState, addMessage) => {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return navigator.clipboard.readText()
        .then(text => {
          const saveData = JSON.parse(text);
          if (!saveData.version || !saveData.state) {
            throw new Error('Invalid save data');
          }
          setGameState(saveData.state);
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