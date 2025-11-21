import { useState, useEffect, useMemo } from 'react';
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

  const handleExit = () => {
    setGameState(prev => {
      const newDimensionalInventory = { ...(prev.dimensionalInventory || {}) };
      
      Object.keys(currentInventory).forEach(materialId => {
        newDimensionalInventory[materialId] = (newDimensionalInventory[materialId] || 0) + currentInventory[materialId];
      });
      
      return {
        ...prev,
        dimensionalInventory: newDimensionalInventory,
        portalCooldown: 60
      };
    });
    
    onExit();
  };

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
                color: node.color,
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