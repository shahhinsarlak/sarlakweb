'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Game() {
  const [gameState, setGameState] = useState({
    stage: 'void',
    resources: {
      awareness: 0,
      compassion: 0,
      wisdom: 0,
      courage: 0,
      peace: 0
    },
    inventory: [],
    unlockedActions: ['breathe'],
    messages: [],
    discoveries: []
  });

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [gameState.messages]);

  // Initialize game
  useEffect(() => {
    const initMessages = [
      { text: "You find yourself in a vast emptiness...", type: "system" },
      { text: "There is only darkness, and the faint rhythm of your breath.", type: "system" },
      { text: "Type 'breathe' to center yourself.", type: "hint" }
    ];
    
    setGameState(prev => ({
      ...prev,
      messages: initMessages.map((msg, index) => ({ 
        ...msg, 
        id: `init-${index}` 
      }))
    }));
  }, []);

  const addMessage = (text, type = "normal") => {
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, { text, type, id: Date.now() + Math.random() }]
    }));
  };

  const updateResources = (updates) => {
    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        ...updates
      }
    }));
  };

  const unlockAction = (action) => {
    setGameState(prev => ({
      ...prev,
      unlockedActions: [...new Set([...prev.unlockedActions, action])]
    }));
  };

  const addToInventory = (item) => {
    setGameState(prev => ({
      ...prev,
      inventory: [...prev.inventory, item]
    }));
  };

  const changeStage = (newStage) => {
    setGameState(prev => ({ ...prev, stage: newStage }));
  };

  const addDiscovery = (discovery) => {
    setGameState(prev => ({
      ...prev,
      discoveries: [...new Set([...prev.discoveries, discovery])]
    }));
  };

  const gameActions = {
    breathe: () => {
      if (gameState.resources.awareness < 5) {
        const messages = [
          "You take a deep breath. The darkness feels less overwhelming.",
          "Your breath creates ripples in the void. You feel slightly more present.",
          "Inhale... exhale... A tiny spark of awareness flickers within.",
          "With each breath, you anchor yourself to this moment.",
          "Your breathing steadies. Something stirs in the emptiness."
        ];
        addMessage(messages[gameState.resources.awareness] || messages[4], "action");
        updateResources({ awareness: gameState.resources.awareness + 1 });
        
        if (gameState.resources.awareness === 1) {
          unlockAction('listen');
          addMessage("You can now 'listen' to the silence.", "hint");
        }
        if (gameState.resources.awareness === 3) {
          unlockAction('feel');
          addMessage("You can now 'feel' what's around you.", "hint");
        }
      } else {
        addMessage("Your breath is steady and centered. You've mastered this practice.", "action");
      }
    },

    listen: () => {
      if (gameState.resources.awareness < 2) {
        addMessage("You need to breathe more before you can truly listen.", "system");
        return;
      }
      
      if (gameState.resources.compassion < 3) {
        const messages = [
          "In the silence, you hear a faint whisper... your own heartbeat.",
          "Listening deeper, you hear echoes of forgotten dreams.",
          "The void carries the sound of your own inner voice, long suppressed."
        ];
        addMessage(messages[gameState.resources.compassion], "action");
        updateResources({ compassion: gameState.resources.compassion + 1 });
        
        if (gameState.resources.compassion === 1) {
          unlockAction('forgive');
          addMessage("You can now 'forgive' yourself.", "hint");
        }
      } else {
        addMessage("You listen with perfect attention, hearing the harmony of existence.", "action");
      }
    },

    feel: () => {
      if (gameState.resources.awareness < 3) {
        addMessage("You must breathe more deeply before you can truly feel.", "system");
        return;
      }

      if (gameState.resources.courage < 3) {
        const messages = [
          "You feel the weight of old pain, but also strength beneath it.",
          "Your hands touch invisible walls built from past fears.",
          "You sense the warmth of your own resilience, long dormant."
        ];
        addMessage(messages[gameState.resources.courage], "action");
        updateResources({ courage: gameState.resources.courage + 1 });
        
        if (gameState.resources.courage === 1) {
          unlockAction('face');
          addMessage("You can now 'face' your shadows.", "hint");
        }
      } else {
        addMessage("You feel completely present, connected to your authentic self.", "action");
      }
    },

    forgive: () => {
      if (gameState.resources.compassion < 1) {
        addMessage("You need to listen more deeply before you can forgive.", "system");
        return;
      }

      if (gameState.resources.peace < 3) {
        const messages = [
          "You whisper forgiveness to your past self. A weight lifts slightly.",
          "Forgiving your mistakes, you feel chains of guilt beginning to dissolve.",
          "With compassion, you embrace all parts of yourself - light and shadow alike."
        ];
        addMessage(messages[gameState.resources.peace], "action");
        updateResources({ peace: gameState.resources.peace + 1 });
        addToInventory("Self-Compassion");
        
        if (gameState.resources.peace === 2) {
          unlockAction('illuminate');
          addMessage("You can now 'illuminate' your path.", "hint");
        }
      } else {
        addMessage("You radiate forgiveness, healing old wounds with love.", "action");
      }
    },

    face: () => {
      if (gameState.resources.courage < 1) {
        addMessage("You need more courage before you can face your shadows.", "system");
        return;
      }

      if (gameState.resources.wisdom < 3) {
        const messages = [
          "You turn toward your darkest fears. They seem smaller than expected.",
          "Facing your shadow, you see it holds gifts you've long denied.",
          "In the darkness of your fears, you find seeds of untapped potential."
        ];
        addMessage(messages[gameState.resources.wisdom], "action");
        updateResources({ wisdom: gameState.resources.wisdom + 1 });
        addToInventory("Shadow Integration");
        
        if (gameState.resources.wisdom === 2) {
          unlockAction('transcend');
          addMessage("You can now 'transcend' your limitations.", "hint");
        }
      } else {
        addMessage("You face all aspects of yourself with unwavering presence.", "action");
      }
    },

    illuminate: () => {
      if (gameState.resources.peace < 2) {
        addMessage("You need more inner peace to illuminate your path.", "system");
        return;
      }

      if (gameState.stage === 'void') {
        addMessage("A gentle light begins to emanate from within you...", "system");
        addMessage("The void transforms. You see a path of starlight stretching ahead.", "system");
        changeStage('path');
        unlockAction('walk');
        addMessage("You can now 'walk' the illuminated path.", "hint");
        addDiscovery("Inner Light");
      } else {
        addMessage("Your inner light shines brightly, revealing hidden truths.", "action");
      }
    },

    transcend: () => {
      if (gameState.resources.wisdom < 2) {
        addMessage("You need more wisdom to transcend your limitations.", "system");
        return;
      }

      addMessage("You rise above the illusions that once bound you...", "action");
      addMessage("Your consciousness expands beyond the boundaries of self.", "system");
      updateResources({ 
        awareness: Math.min(5, gameState.resources.awareness + 1),
        compassion: Math.min(5, gameState.resources.compassion + 1),
        wisdom: Math.min(5, gameState.resources.wisdom + 1)
      });
      addDiscovery("Transcendence");
    },

    walk: () => {
      if (gameState.stage !== 'path') {
        addMessage("There's nowhere to walk in this emptiness.", "system");
        return;
      }

      addMessage("You walk along the starlit path. Each step brings new understanding.", "action");
      addMessage("The path leads to a garden where all possibilities bloom.", "system");
      changeStage('garden');
      unlockAction('plant');
      unlockAction('tend');
      addMessage("You can now 'plant' seeds of intention and 'tend' to your growth.", "hint");
    },

    plant: () => {
      if (gameState.stage !== 'garden') {
        addMessage("You have no soil to plant in yet.", "system");
        return;
      }

      addMessage("You plant a seed of pure intention. It glows with potential.", "action");
      updateResources({ wisdom: Math.min(5, gameState.resources.wisdom + 1) });
      addToInventory("Intention Seed");
    },

    tend: () => {
      if (gameState.stage !== 'garden') {
        addMessage("There's nothing to tend here.", "system");
        return;
      }

      addMessage("You nurture your inner garden with presence and care.", "action");
      updateResources({ 
        compassion: Math.min(5, gameState.resources.compassion + 1),
        peace: Math.min(5, gameState.resources.peace + 1)
      });
    },

    inventory: () => {
      if (gameState.inventory.length === 0) {
        addMessage("Your spiritual inventory is empty.", "system");
      } else {
        addMessage(`You carry: ${gameState.inventory.join(', ')}`, "system");
      }
    },

    stats: () => {
      const { awareness, compassion, wisdom, courage, peace } = gameState.resources;
      addMessage(`Awareness: ${awareness} | Compassion: ${compassion} | Wisdom: ${wisdom} | Courage: ${courage} | Peace: ${peace}`, "system");
    },

    help: () => {
      addMessage(`Available actions: ${gameState.unlockedActions.join(', ')}`, "hint");
    },

    discoveries: () => {
      if (gameState.discoveries.length === 0) {
        addMessage("You haven't made any profound discoveries yet.", "system");
      } else {
        addMessage(`Discoveries: ${gameState.discoveries.join(', ')}`, "system");
      }
    }
  };

  const handleCommand = (command) => {
    const action = command.toLowerCase().trim();
    addMessage(`> ${command}`, "input");
    
    if (gameActions[action]) {
      gameActions[action]();
    } else {
      addMessage("You cannot do that here, or perhaps you haven't learned how yet.", "system");
      addMessage("Type 'help' to see available actions.", "hint");
    }
    
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleCommand(inputValue);
    }
  };

  const getStageDescription = () => {
    switch (gameState.stage) {
      case 'void':
        return "The Void";
      case 'path':
        return "The Starlit Path";
      case 'garden':
        return "The Inner Garden";
      default:
        return "Unknown realm";
    }
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <section className="section">
          <h1 className="page-title">Inner Light</h1>
          <p className="intro-text">
            A text-based journey of self-discovery and spiritual growth. 
            Find yourself through mindful exploration of the inner landscape.
          </p>
          <div className="status">
            <span className="status-dot"></span>
            Currently in: {getStageDescription()}
          </div>
        </section>

        <section className="section">
          <div className="game-container">
            {/* Game Terminal */}
            <div className="game-terminal">
              <div className="terminal-header">
                <div className="terminal-title">Inner Light Console</div>
              </div>
              <div className="terminal-content">
                {gameState.messages.map((msg) => (
                  <div key={msg.id} className={`message message-${msg.type}`}>
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Command Input */}
              <div className="terminal-input">
                <span className="prompt">&gt;</span>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="command-input"
                  placeholder="Enter command..."
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (inputValue.trim()) {
                      handleCommand(inputValue);
                    }
                  }}
                  className="submit-button"
                >
                  Enter
                </button>
              </div>
              
              <div className="terminal-hint">
                Available: {gameState.unlockedActions.slice(0, 4).join(', ')}, help, stats
              </div>
            </div>

            {/* Game Stats Sidebar */}
            <div className="game-sidebar">
              {/* Resources */}
              <div className="stat-card">
                <div className="stat-title">Inner Resources</div>
                {Object.entries(gameState.resources).map(([key, value]) => (
                  <div key={key} className="stat-row">
                    <span className="stat-label">{key}</span>
                    <div className="stat-bar">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`stat-dot ${i < value ? 'filled' : ''}`}>
                          •
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Inventory */}
              <div className="stat-card">
                <div className="stat-title">Spiritual Inventory</div>
                {gameState.inventory.length === 0 ? (
                  <div className="empty-text">Empty</div>
                ) : (
                  gameState.inventory.map((item, index) => (
                    <div key={index} className="inventory-item">
                      {item}
                    </div>
                  ))
                )}
              </div>

              {/* Discoveries */}
              <div className="stat-card">
                <div className="stat-title">Discoveries</div>
                {gameState.discoveries.length === 0 ? (
                  <div className="empty-text">None yet</div>
                ) : (
                  gameState.discoveries.map((discovery, index) => (
                    <div key={index} className="discovery-item">
                      ✦ {discovery}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style jsx>{`
        .page-title {
          font-size: 24px;
          font-weight: 400;
          letter-spacing: 1px;
          margin-bottom: 16px;
          color: var(--accent-color);
        }

        .game-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
          margin-bottom: 40px;
        }

        .game-terminal {
          border: 1px solid var(--border-color);
          background: var(--bg-color);
        }

        .terminal-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          background: var(--hover-color);
        }

        .terminal-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--accent-color);
        }

        .terminal-content {
          height: 400px;
          padding: 16px;
          overflow-y: auto;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 13px;
          line-height: 1.5;
        }

        .message {
          margin-bottom: 8px;
        }

        .message-system {
          color: var(--accent-color);
          font-style: italic;
          opacity: 0.8;
        }

        .message-action {
          color: var(--text-color);
        }

        .message-input {
          color: var(--accent-color);
          opacity: 0.7;
        }

        .message-hint {
          color: var(--text-color);
          opacity: 0.5;
          font-size: 11px;
        }

        .terminal-input {
          padding: 12px 16px;
          border-top: 1px solid var(--border-color);
          background: var(--hover-color);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .prompt {
          color: var(--accent-color);
          font-family: inherit;
          font-size: 13px;
        }

        .command-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-color);
          font-family: inherit;
          font-size: 13px;
          outline: none;
        }

        .submit-button {
          background: var(--accent-color);
          color: var(--bg-color);
          border: none;
          padding: 4px 8px;
          font-family: inherit;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: var(--transition);
        }

        .submit-button:hover {
          opacity: 0.8;
        }

        .terminal-hint {
          padding: 8px 16px;
          font-size: 10px;
          opacity: 0.5;
          color: var(--text-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .game-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .stat-card {
          border: 1px solid var(--border-color);
          padding: 20px;
        }

        .stat-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--accent-color);
          margin-bottom: 16px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 11px;
          text-transform: capitalize;
          color: var(--text-color);
          opacity: 0.7;
        }

        .stat-bar {
          display: flex;
          gap: 2px;
        }

        .stat-dot {
          font-size: 12px;
          color: var(--border-color);
          transition: var(--transition);
        }

        .stat-dot.filled {
          color: var(--accent-color);
        }

        .empty-text {
          font-size: 11px;
          color: var(--text-color);
          opacity: 0.5;
          font-style: italic;
        }

        .inventory-item {
          font-size: 11px;
          color: var(--text-color);
          margin-bottom: 4px;
          opacity: 0.8;
        }

        .discovery-item {
          font-size: 11px;
          color: var(--accent-color);
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .game-container {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .terminal-content {
            height: 300px;
          }
          
          .terminal-input {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          
          .submit-button {
            align-self: flex-end;
            padding: 8px 12px;
          }
        }
      `}</style>
    </>
  );
}