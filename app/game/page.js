'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';

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
    autoActions: {},
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
    addMessage("You find yourself in a vast emptiness...", "system");
    addMessage("There is only darkness, and the faint rhythm of your breath.", "system");
    addMessage("Type 'breathe' to center yourself.", "hint");
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
    // Stage: Void
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
        
        if (gameState.resources.awareness === 2) {
          unlockAction('listen');
          addMessage("You can now 'listen' to the silence.", "hint");
        }
        if (gameState.resources.awareness === 4) {
          unlockAction('feel');
          addMessage("You can now 'feel' what's around you.", "hint");
        }
      } else {
        addMessage("Your breath is steady and centered. You've mastered this practice.", "action");
      }
    },

    listen: () => {
      if (gameState.resources.awareness < 3) {
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
        
        if (gameState.resources.compassion === 2) {
          unlockAction('forgive');
          addMessage("You can now 'forgive' yourself.", "hint");
        }
      } else {
        addMessage("You listen with perfect attention, hearing the harmony of existence.", "action");
      }
    },

    feel: () => {
      if (gameState.resources.awareness < 4) {
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
        
        if (gameState.resources.courage === 2) {
          unlockAction('face');
          addMessage("You can now 'face' your shadows.", "hint");
        }
      } else {
        addMessage("You feel completely present, connected to your authentic self.", "action");
      }
    },

    forgive: () => {
      if (gameState.resources.compassion < 2) {
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
        
        if (gameState.resources.peace === 3) {
          unlockAction('illuminate');
          addMessage("You can now 'illuminate' your path.", "hint");
        }
      } else {
        addMessage("You radiate forgiveness, healing old wounds with love.", "action");
      }
    },

    face: () => {
      if (gameState.resources.courage < 2) {
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
        
        if (gameState.resources.wisdom === 3) {
          unlockAction('transcend');
          addMessage("You can now 'transcend' your limitations.", "hint");
        }
      } else {
        addMessage("You face all aspects of yourself with unwavering presence.", "action");
      }
    },

    illuminate: () => {
      if (gameState.resources.peace < 3) {
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
      if (gameState.resources.wisdom < 3) {
        addMessage("You need more wisdom to transcend your limitations.", "system");
        return;
      }

      addMessage("You rise above the illusions that once bound you...", "action");
      addMessage("Your consciousness expands beyond the boundaries of self.", "system");
      updateResources({ 
        awareness: gameState.resources.awareness + 2,
        compassion: gameState.resources.compassion + 1,
        wisdom: gameState.resources.wisdom + 1
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
      updateResources({ wisdom: gameState.resources.wisdom + 1 });
      addToInventory("Intention Seed");
    },

    tend: () => {
      if (gameState.stage !== 'garden') {
        addMessage("There's nothing to tend here.", "system");
        return;
      }

      addMessage("You nurture your inner garden with presence and care.", "action");
      updateResources({ 
        compassion: gameState.resources.compassion + 1,
        peace: gameState.resources.peace + 1 
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

  const getMessageStyle = (type) => {
    const baseStyle = {
      marginBottom: '8px',
      lineHeight: '1.6',
      fontSize: '13px'
    };
    
    switch (type) {
      case 'system': 
        return { ...baseStyle, color: '#c084fc', fontStyle: 'italic' };
      case 'action': 
        return { ...baseStyle, color: '#86efac' };
      case 'input': 
        return { ...baseStyle, color: '#93c5fd', fontFamily: 'monospace' };
      case 'hint': 
        return { ...baseStyle, color: '#fde047', fontSize: '12px', opacity: 0.8 };
      default: 
        return { ...baseStyle, color: '#d1d5db' };
    }
  };

  const getStageDescription = () => {
    switch (gameState.stage) {
      case 'void':
        return "The Void - A place of infinite potential";
      case 'path':
        return "The Path - Illuminated by inner light";
      case 'garden':
        return "The Garden - Where intentions bloom";
      default:
        return "Unknown realm";
    }
  };

  return (
    <>
      <Header />
      <div style={{ 
        minHeight: '100vh', 
        background: '#000000', 
        color: '#ffffff', 
        padding: '40px 20px' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            borderBottom: '1px solid #374151', 
            paddingBottom: '16px', 
            marginBottom: '24px' 
          }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontFamily: 'monospace', 
              color: '#c084fc', 
              marginBottom: '8px',
              fontWeight: '400'
            }}>
              Inner Light
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: '#9ca3af', 
              marginBottom: '4px' 
            }}>
              A journey of self-discovery
            </p>
            <p style={{ 
              fontSize: '12px', 
              color: '#6b7280' 
            }}>
              {getStageDescription()}
            </p>
          </div>

          {/* Game Interface */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth > 1024 ? '2fr 1fr' : '1fr',
            gap: '24px' 
          }}>
            {/* Main Game Area */}
            <div>
              <div style={{
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                height: '400px',
                overflowY: 'auto'
              }}>
                {gameState.messages.map((msg) => (
                  <div key={msg.id} style={getMessageStyle(msg.type)}>
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Command Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{
                    flex: 1,
                    background: '#1f2937',
                    border: '1px solid #4b5563',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Enter command..."
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (inputValue.trim()) {
                      handleCommand(inputValue);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#5b21b6'}
                  onMouseOut={(e) => e.target.style.background = '#7c3aed'}
                >
                  Enter
                </button>
              </div>

              <div style={{ 
                marginTop: '8px', 
                fontSize: '12px', 
                color: '#6b7280' 
              }}>
                Try: {gameState.unlockedActions.slice(0, 3).join(', ')}, help, stats, inventory
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Resources */}
              <div style={{
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontFamily: 'monospace', 
                  color: '#c084fc', 
                  marginBottom: '12px' 
                }}>
                  Inner Resources
                </h3>
                {Object.entries(gameState.resources).map(([key, value]) => (
                  <div key={key} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '12px', 
                    marginBottom: '4px' 
                  }}>
                    <span style={{ 
                      color: '#9ca3af', 
                      textTransform: 'capitalize' 
                    }}>
                      {key}
                    </span>
                    <span style={{ color: '#22c55e' }}>
                      {'●'.repeat(value)}{'○'.repeat(Math.max(0, 5-value))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Inventory */}
              <div style={{
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontFamily: 'monospace', 
                  color: '#c084fc', 
                  marginBottom: '12px' 
                }}>
                  Spiritual Inventory
                </h3>
                {gameState.inventory.length === 0 ? (
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    fontStyle: 'italic' 
                  }}>
                    Empty
                  </p>
                ) : (
                  gameState.inventory.map((item, index) => (
                    <div key={index} style={{ 
                      fontSize: '12px', 
                      color: '#d1d5db', 
                      marginBottom: '4px' 
                    }}>
                      • {item}
                    </div>
                  ))
                )}
              </div>

              {/* Discoveries */}
              <div style={{
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontFamily: 'monospace', 
                  color: '#c084fc', 
                  marginBottom: '12px' 
                }}>
                  Discoveries
                </h3>
                {gameState.discoveries.length === 0 ? (
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    fontStyle: 'italic' 
                  }}>
                    None yet
                  </p>
                ) : (
                  gameState.discoveries.map((discovery, index) => (
                    <div key={index} style={{ 
                      fontSize: '12px', 
                      color: '#fde047', 
                      marginBottom: '4px' 
                    }}>
                      ✦ {discovery}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
  }}