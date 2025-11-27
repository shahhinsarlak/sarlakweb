import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DIMENSIONAL_MATERIALS,
  DIMENSIONAL_CAPACITY,
  generateEncryptedText,
  generateMaterialNodes
} from './dimensionalConstants';
import { getModifiedCapacity, getActiveSkillEffects, applySkillsToMaterialCollection } from './skillSystemHelpers';
import { XP_REWARDS } from './skillTreeConstants';
import { TEAR_CONFIG } from './lootConstants';
import { generateLootItem } from './lootGenerationHelpers';
import CrystalOpeningModal from './CrystalOpeningModal';
import { discoverEquipmentFromLoot } from './journalHelpers';
import NotificationPopup from './NotificationPopup';


export default function DimensionalArea({ gameState, setGameState, onExit, grantXP, notifications, onDismissNotification }) {
  const [collectedNodes, setCollectedNodes] = useState([]);
  const [currentInventory, setCurrentInventory] = useState({});
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showCrystalModal, setShowCrystalModal] = useState(false);
  const [currentLootItem, setCurrentLootItem] = useState(null);
  const [tearCollected, setTearCollected] = useState(false);
  const [glitchOverlays, setGlitchOverlays] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const effects = getActiveSkillEffects(gameState);
  const modifiedCapacity = getModifiedCapacity(DIMENSIONAL_CAPACITY, gameState);

  // Generate encrypted text once per portal entry
  const encryptedText = useMemo(() => generateEncryptedText(3000), []);

  // Generate material nodes once per portal entry (effects applied at generation time)
  // DO NOT add dependencies here - nodes should be static for each portal session
  const materialNodes = useMemo(() => {
    return generateMaterialNodes(encryptedText.length, {}, effects);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if armory is unlocked (bottom drawer opened)
  const armoryUnlocked = gameState.unlockedLocations?.includes('armory') || false;

  // Generate dimensional tear (if armory unlocked and random chance)
  const dimensionalTear = useMemo(() => {
    if (!armoryUnlocked) return null;

    // Debug mode: force spawn
    const forceTearSpawn = gameState.debugForceTearSpawn || false;

    const spawnRoll = Math.random();
    if (!forceTearSpawn && spawnRoll > TEAR_CONFIG.spawnChance) return null;

    // Random position in the text
    const position = Math.floor(Math.random() * (encryptedText.length - 1000)) + 500;

    // Random visual properties
    const colorIndex = Math.floor(Math.random() * TEAR_CONFIG.glowColors.length);
    const size = Math.floor(
      Math.random() * (TEAR_CONFIG.maxSize - TEAR_CONFIG.minSize + 1)
    ) + TEAR_CONFIG.minSize;

    return {
      id: 'tear_' + Date.now(),
      position,
      color: TEAR_CONFIG.glowColors[colorIndex],
      size
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armoryUnlocked, gameState.debugForceTearSpawn]); // Regenerate when armory unlocked or debug flag changes

  // Generate random particles for background
  const particles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: `particle_${i}`,
      left: Math.random() * 100,
      animationDelay: Math.random() * 10,
      animationDuration: 15 + Math.random() * 10,
      size: 1 + Math.random() * 2
    }));
  }, []);

  // Lightweight glitch effect - positioned overlays only
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      // Generate 10-15 random glitch overlays
      const numGlitches = Math.floor(Math.random() * 6) + 10;
      const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?█▓▒░';
      const glitchColors = ['#ff0000', '#ff00ff', '#00ffff', '#ffff00'];

      const newOverlays = Array.from({ length: numGlitches }, (_, i) => ({
        id: `glitch_${Date.now()}_${i}`,
        char: glitchChars[Math.floor(Math.random() * glitchChars.length)],
        color: glitchColors[Math.floor(Math.random() * glitchColors.length)],
        top: Math.random() * 80 + 10, // 10-90% of viewport
        left: Math.random() * 90 + 5,   // 5-95% of viewport
        size: Math.random() > 0.7 ? 16 : 12 // Occasionally larger glitches
      }));

      setGlitchOverlays(newOverlays);

      // Clear glitches after 80ms
      setTimeout(() => {
        setGlitchOverlays([]);
      }, 80);
    }, 800 + Math.random() * 1200); // Glitch every 0.8-2 seconds

    return () => clearInterval(glitchInterval);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleExit]);

  // Mouse tracking for distortion effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const currentCapacity = Object.values(currentInventory).reduce((sum, count) => sum + count, 0);
  const remainingCapacity = modifiedCapacity - currentCapacity;

  const collectMaterial = (node) => {
    if (remainingCapacity <= 0) return;

    const material = DIMENSIONAL_MATERIALS.find(m => m.id === node.materialId);
    let amount = applySkillsToMaterialCollection(node.materialId, 1, gameState);

    // Apply material multipliers from active buffs (contracts/reports)
    const activeBuffs = gameState.activeReportBuffs || [];
    const now = Date.now();
    const materialBuffs = activeBuffs.filter(b => b.expiresAt > now && b.materialMult);

    if (materialBuffs.length > 0) {
      // Take the highest multiplier if multiple buffs exist
      const maxMult = Math.max(...materialBuffs.map(b => b.materialMult));
      amount = Math.floor(amount * maxMult);
    }

    setCurrentInventory(prev => ({
      ...prev,
      [node.materialId]: (prev[node.materialId] || 0) + amount
    }));

    setCollectedNodes([...collectedNodes, node.id]);

    // Grant XP based on material rarity
    if (grantXP && XP_REWARDS.collectMaterial[node.materialId]) {
      grantXP(XP_REWARDS.collectMaterial[node.materialId] * amount);
    }
  };

  /**
   * Handle tear click - generate loot and show crystal opening modal
   */
  const handleTearClick = () => {
    if (tearCollected) return;

    // Generate random loot item at player's current level
    const lootItem = generateLootItem(null, gameState.playerLevel || 1);
    if (!lootItem) return;

    setCurrentLootItem(lootItem);
    setShowCrystalModal(true);
    setTearCollected(true);

    // Grant XP for finding a tear
    if (grantXP) {
      grantXP(50); // Base XP for finding tear
    }
  };

  /**
   * Handle loot item claim - add to inventory
   */
  const handleLootClaim = (lootItem) => {
    setGameState(prev => {
      const newLootInventory = [...(prev.lootInventory || []), lootItem];

      // Track equipment discovery for journal
      const equipmentDiscoveries = discoverEquipmentFromLoot(prev, lootItem);

      return {
        ...prev,
        lootInventory: newLootInventory,
        discoveredBaseWeapons: equipmentDiscoveries.weapons,
        discoveredBaseArmor: equipmentDiscoveries.armor,
        discoveredBaseAnomalies: equipmentDiscoveries.anomalies,
        recentMessages: [
          `Found: ${lootItem.displayName} [${lootItem.rarity.name}]`,
          ...prev.recentMessages
        ].slice(0, prev.maxLogMessages || 15)
      };
    });

    // Grant XP based on rarity
    const rarityXP = {
      common: 25,
      uncommon: 50,
      rare: 100,
      epic: 200,
      legendary: 400,
      mythic: 1000
    };

    if (grantXP) {
      grantXP(rarityXP[lootItem.rarity.id] || 25);
    }
  };

  const handleExit = useCallback(() => {
    setGameState(prev => {
      const newDimensionalInventory = { ...(prev.dimensionalInventory || {}) };

      // Build messages and notifications for collected materials
      const messages = [];
      const notifications = [];

      Object.keys(currentInventory).forEach(materialId => {
        const count = currentInventory[materialId];
        if (count > 0) {
          const material = DIMENSIONAL_MATERIALS.find(m => m.id === materialId);
          const message = `Collected: ${count}x ${material?.name || materialId}`;

          messages.push(message);
          notifications.push({
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message: message,
            timestamp: Date.now()
          });
        }

        newDimensionalInventory[materialId] = (newDimensionalInventory[materialId] || 0) + count;
      });

      // Add summary message if any materials were collected
      if (messages.length > 0) {
        messages.unshift('Portal exit: Materials transferred to inventory');
      }

      return {
        ...prev,
        dimensionalInventory: newDimensionalInventory,
        portalCooldown: 60,
        recentMessages: [...messages, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15),
        notifications: [...(prev.notifications || []), ...notifications]
      };
    });

    onExit();
  }, [currentInventory, setGameState, onExit]);

  const renderTextWithNodes = () => {
    const elements = [];
    let lastIndex = 0;

    // Combine material nodes and tear into a single sorted array
    const allNodes = [...materialNodes];
    if (dimensionalTear && !tearCollected) {
      allNodes.push({ ...dimensionalTear, isTear: true });
    }

    // Sort by position
    allNodes.sort((a, b) => a.position - b.position);

    allNodes.forEach((node, idx) => {
      // Skip collected material nodes
      if (!node.isTear && collectedNodes.includes(node.id)) return;

      // Add text before this node
      elements.push(
        <span key={`text-${idx}`}>
          {encryptedText.slice(lastIndex, node.position)}
        </span>
      );

      if (node.isTear) {
        // Render dimensional tear
        elements.push(
          <span
            key={node.id}
            onClick={handleTearClick}
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              display: 'inline-block',
              width: `${node.size}px`,
              height: `${node.size}px`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s',
              verticalAlign: 'middle',
              margin: '0 4px',
              border: `2px solid ${node.color}`,
              borderRadius: '50%',
              boxShadow: `0 0 ${node.size}px ${node.color}, inset 0 0 ${node.size/2}px ${node.color}`,
              transform: hoveredNode?.id === node.id ? 'scale(1.3)' : 'scale(1)',
              position: 'relative',
              animation: 'tearPulse 2s ease-in-out infinite'
            }}
          >
            {hoveredNode?.id === node.id && (
              <span style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#000000',
                border: `2px solid ${node.color}`,
                padding: '6px 12px',
                fontSize: '11px',
                fontFamily: "'SF Mono', monospace",
                color: node.color,
                whiteSpace: 'nowrap',
                marginBottom: '8px',
                pointerEvents: 'none',
                zIndex: 1000,
                boxShadow: `0 0 16px ${node.color}`,
                fontWeight: '500',
                letterSpacing: '1px'
              }}>
                DIMENSIONAL TEAR
              </span>
            )}
          </span>
        );
      } else {
        // Render material node
        const material = DIMENSIONAL_MATERIALS.find(m => m.id === node.materialId);

        elements.push(
          <span
            key={node.id}
            onClick={() => collectMaterial(node)}
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              display: 'inline-block',
              width: `${node.size}px`,
              height: `${node.size}px`,
              backgroundColor: node.color,
              cursor: remainingCapacity > 0 ? 'pointer' : 'not-allowed',
              opacity: remainingCapacity > 0 ? 1 : 0.5,
              transition: 'all 0.2s',
              verticalAlign: 'middle',
              margin: '0 2px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: hoveredNode?.id === node.id && remainingCapacity > 0
                ? `0 0 ${node.size * (node.glowIntensity || 1)}px ${node.color}`
                : `0 0 ${(node.size/2) * (node.glowIntensity || 1)}px ${node.color}`,
              transform: hoveredNode?.id === node.id && remainingCapacity > 0 ? 'scale(1.2)' : 'scale(1)',
              position: 'relative'
            }}
          >
            {hoveredNode?.id === node.id && (
              <span style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#000000',
                border: '1px solid #444444',
                padding: '4px 8px',
                fontSize: '10px',
                fontFamily: "'SF Mono', monospace",
                color: '#ffffff',
                whiteSpace: 'nowrap',
                marginBottom: '4px',
                pointerEvents: 'none',
                zIndex: 1000,
                boxShadow: `0 0 8px ${node.color}`
              }}>
                {material?.name}
              </span>
            )}
          </span>
        );
      }

      lastIndex = node.position;
    });

    elements.push(
      <span key="text-final">
        {encryptedText.slice(lastIndex)}
      </span>
    );

    return elements;
  };

  return (
    <>
      <style>{`
        body, html {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden;
        }

        @keyframes tearPulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes glitchFlicker {
          0% { opacity: 1; }
          25% { opacity: 0.3; }
          50% { opacity: 1; }
          75% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.15;
          }
          90% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }

        @keyframes portalPulse {
          0%, 100% {
            opacity: 0.03;
          }
          50% {
            opacity: 0.08;
          }
        }

        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }

        @keyframes staticNoise {
          0%, 100% {
            opacity: 0.02;
          }
          50% {
            opacity: 0.05;
          }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        color: '#333333',
        fontFamily: 'Times New Roman, serif',
        fontSize: '12px',
        lineHeight: '1.6',
        padding: '100px 20px 100px 20px',
        overflowY: 'auto',
        overflowX: 'hidden',
        margin: 0,
        boxSizing: 'border-box'
      }}>
      {/* Portal background effects */}
      {/* Animated gradient pulse */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(100, 0, 150, 0.1) 0%, transparent 70%)',
        animation: 'portalPulse 8s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Vignette effect */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.7) 100%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Scanline effect */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(to bottom, transparent, rgba(100, 0, 150, 0.3), transparent)',
        boxShadow: '0 0 20px rgba(100, 0, 150, 0.5)',
        animation: 'scanline 6s linear infinite',
        pointerEvents: 'none',
        zIndex: 10
      }} />

      {/* Static noise overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.05) 0px,
          rgba(255, 255, 255, 0.03) 1px,
          rgba(0, 0, 0, 0.05) 2px
        )`,
        animation: 'staticNoise 0.5s infinite',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.3
      }} />

      {/* Subtle particle background effect */}
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'fixed',
            left: `${particle.left}%`,
            bottom: 0,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: '#333333',
            borderRadius: '50%',
            opacity: 0,
            pointerEvents: 'none',
            animation: `particleFloat ${particle.animationDuration}s linear infinite`,
            animationDelay: `${particle.animationDelay}s`,
            zIndex: 1
          }}
        />
      ))}

      {/* Glitch overlays - positioned absolutely over text */}
      {glitchOverlays.map(glitch => (
        <div
          key={glitch.id}
          style={{
            position: 'fixed',
            left: `${glitch.left}%`,
            top: `${glitch.top}%`,
            color: glitch.color,
            textShadow: `0 0 6px ${glitch.color}, 0 0 12px ${glitch.color}`,
            fontSize: `${glitch.size}px`,
            fontFamily: 'Times New Roman, serif',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 999,
            animation: 'glitchFlicker 0.1s linear'
          }}
        >
          {glitch.char}
        </div>
      ))}

      {/* Mouse distortion effect - weird ripple that follows cursor */}
      <div
        style={{
          position: 'fixed',
          left: mousePos.x - 150,
          top: mousePos.y - 150,
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100, 0, 150, 0.2) 0%, rgba(100, 0, 150, 0.1) 30%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 5,
          mixBlendMode: 'screen',
          filter: 'blur(20px)',
          transition: 'left 0.1s ease-out, top 0.1s ease-out'
        }}
      />
      <div
        style={{
          position: 'fixed',
          left: mousePos.x - 100,
          top: mousePos.y - 100,
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '2px solid rgba(100, 0, 150, 0.3)',
          pointerEvents: 'none',
          zIndex: 5,
          boxShadow: '0 0 30px rgba(100, 0, 150, 0.5), inset 0 0 30px rgba(100, 0, 150, 0.3)',
          transition: 'left 0.15s ease-out, top 0.15s ease-out',
          animation: 'portalPulse 2s ease-in-out infinite'
        }}
      />
      <div
        style={{
          position: 'fixed',
          left: mousePos.x - 50,
          top: mousePos.y - 50,
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 0, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 6,
          filter: 'blur(10px)',
          mixBlendMode: 'color-dodge',
          transition: 'left 0.05s ease-out, top 0.05s ease-out'
        }}
      />

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000000',
        borderBottom: '1px solid #222222',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <button
          onClick={handleExit}
          style={{
            background: 'none',
            border: '1px solid #444444',
            color: '#888888',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: "'SF Mono', monospace",
            letterSpacing: '0.5px'
          }}
        >
          ← EXIT PORTAL
        </button>
        
        <div style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: '11px',
          color: '#666666',
          letterSpacing: '1px'
        }}>
          CAPACITY: {currentCapacity}/{modifiedCapacity}
          {remainingCapacity === 0 && <span style={{ color: '#ff0000', marginLeft: '16px' }}>FULL</span>}
        </div>
      </div>

      <div style={{
        wordWrap: 'break-word',
        userSelect: 'none'
      }}>
        {renderTextWithNodes()}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000000',
        borderTop: '1px solid #222222',
        padding: '16px 40px',
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        fontSize: '10px',
        fontFamily: "'SF Mono', monospace",
        color: '#666666',
        zIndex: 1000
      }}>
        {DIMENSIONAL_MATERIALS.map(material => {
          const count = currentInventory[material.id] || 0;
          return (
            <div key={material.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: material.color,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: `0 0 4px ${material.color}`
              }} />
              <span>{material.name}: {count}</span>
            </div>
          );
        })}
      </div>
    </div>

    {/* Crystal Opening Modal */}
    {showCrystalModal && currentLootItem && (
      <CrystalOpeningModal
        lootItem={currentLootItem}
        onComplete={handleLootClaim}
        onClose={() => setShowCrystalModal(false)}
        notifications={notifications}
        onDismissNotification={onDismissNotification}
      />
    )}

    {/* Notification Popup System */}
    <NotificationPopup
      notifications={notifications}
      onDismiss={onDismissNotification}
    />
    </>
  );
}