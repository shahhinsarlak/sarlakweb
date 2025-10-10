import { useState, useEffect, useMemo } from 'react';
import { 
  DIMENSIONAL_MATERIALS, 
  DIMENSIONAL_CAPACITY,
  generateEncryptedText,
  generateMaterialNodes 
} from './dimensionalConstants';

export default function DimensionalArea({ gameState, setGameState, onExit }) {
  const [collectedNodes, setCollectedNodes] = useState([]);
  const [currentInventory, setCurrentInventory] = useState({});
  const [hoveredNode, setHoveredNode] = useState(null);
  
  const encryptedText = useMemo(() => generateEncryptedText(3000), []);
  const materialNodes = useMemo(() => generateMaterialNodes(encryptedText.length, gameState.dimensionalInventory || {}), [encryptedText.length, gameState.dimensionalInventory]);
  
  const currentCapacity = Object.values(currentInventory).reduce((sum, count) => sum + count, 0);
  const remainingCapacity = DIMENSIONAL_CAPACITY - currentCapacity;

  const collectMaterial = (node) => {
    if (remainingCapacity <= 0) return;
    
    setCurrentInventory(prev => ({
      ...prev,
      [node.materialId]: (prev[node.materialId] || 0) + 1
    }));
    
    setCollectedNodes([...collectedNodes, node.id]);
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
    
    materialNodes.forEach((node, idx) => {
      if (collectedNodes.includes(node.id)) return;
      
      elements.push(
        <span key={`text-${idx}`}>
          {encryptedText.slice(lastIndex, node.position)}
        </span>
      );
      
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
              ? `0 0 ${node.size}px ${node.color}` 
              : `0 0 ${node.size/2}px ${node.color}`,
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
          CAPACITY: {currentCapacity}/{DIMENSIONAL_CAPACITY}
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
    </>
  );
}