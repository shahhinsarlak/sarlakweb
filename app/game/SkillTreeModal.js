import { useState } from 'react';
import { SKILLS, SKILL_TREE_LAYOUT, LEVEL_SYSTEM, TREE_INFO } from './skillTreeConstants';
import EventLog from './EventLog';

export default function SkillTreeModal({ gameState, onClose, onPurchaseSkill }) {
  const [selectedTree, setSelectedTree] = useState('reality');
  const [hoveredSkill, setHoveredSkill] = useState(null);
  
  const playerLevel = gameState.playerLevel || 1;
  const currentXP = gameState.playerXP || 0;
  const xpForNextLevel = LEVEL_SYSTEM.getXPForLevel(playerLevel + 1);
  const xpProgress = playerLevel >= LEVEL_SYSTEM.maxLevel ? 100 : (currentXP / xpForNextLevel) * 100;
  const availableSkillPoints = gameState.skillPoints || 0;
  const purchasedSkills = gameState.purchasedSkills || {};

  const getSkillLevel = (skillId) => purchasedSkills[skillId] || 0;

  const canLearnSkill = (skill) => {
    const currentLevel = getSkillLevel(skill.id);
    
    // Check if maxed
    if (currentLevel >= skill.maxLevel) return false;
    
    // Check skill points
    const cost = skill.cost(currentLevel + 1);
    if (availableSkillPoints < cost) return false;
    
    // Check player level
    if (playerLevel < skill.minPlayerLevel) return false;
    
    // Check requirements
    if (skill.requires && skill.requires.length > 0) {
      return skill.requires.every(reqId => getSkillLevel(reqId) > 0);
    }
    
    return true;
  };

  const getSkillStatus = (skill) => {
    const currentLevel = getSkillLevel(skill.id);
    if (currentLevel >= skill.maxLevel) return 'maxed';
    if (currentLevel > 0) return 'learned';
    if (canLearnSkill(skill)) return 'available';
    return 'locked';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'maxed': return '#2ecc71';
      case 'learned': return TREE_INFO[selectedTree].color;
      case 'available': return '#f39c12';
      case 'locked': return '#555';
      default: return '#555';
    }
  };

  const renderSkillConnections = () => {
    const connections = [];
    const gridSize = 140;
    const offsetX = 70;
    const offsetY = 120;

    const treeSkills = Object.values(SKILLS).filter(s => s.tree === selectedTree);

    treeSkills.forEach(skill => {
      if (!skill.requires || skill.requires.length === 0) return;
      
      const skillPos = SKILL_TREE_LAYOUT[selectedTree][skill.id];
      const skillX = skillPos.x * gridSize + offsetX;
      const skillY = skillPos.y * gridSize + offsetY;

      skill.requires.forEach(reqId => {
        const reqPos = SKILL_TREE_LAYOUT[selectedTree][reqId];
        const reqX = reqPos.x * gridSize + offsetX;
        const reqY = reqPos.y * gridSize + offsetY;

        const isRequirementMet = getSkillLevel(reqId) > 0;
        const isLearned = getSkillLevel(skill.id) > 0;
        
        connections.push(
          <line
            key={`${reqId}-${skill.id}`}
            x1={reqX}
            y1={reqY}
            x2={skillX}
            y2={skillY}
            stroke={isLearned ? TREE_INFO[selectedTree].color : isRequirementMet ? '#888' : '#333'}
            strokeWidth="3"
            opacity={isLearned ? 0.8 : 0.4}
          />
        );
      });
    });

    return connections;
  };

  const renderSkillNode = (skill) => {
    const position = SKILL_TREE_LAYOUT[selectedTree][skill.id];
    const gridSize = 140;
    const offsetX = 70;
    const offsetY = 120;
    const x = position.x * gridSize + offsetX;
    const y = position.y * gridSize + offsetY;
    
    const currentLevel = getSkillLevel(skill.id);
    const status = getSkillStatus(skill);
    const statusColor = getStatusColor(status);
    const cost = skill.cost(currentLevel + 1);
    
    const isHovered = hoveredSkill === skill.id;
    const nodeSize = isHovered ? 70 : 60;
    
    return (
      <g key={skill.id}>
        {/* Skill circle */}
        <circle
          cx={x}
          cy={y}
          r={nodeSize / 2}
          fill={status === 'locked' ? '#1a1a1a' : '#2a2a2a'}
          stroke={statusColor}
          strokeWidth={status === 'maxed' ? 4 : 3}
          style={{
            cursor: status === 'locked' ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            filter: isHovered ? 'brightness(1.3)' : 'brightness(1)'
          }}
          onMouseEnter={() => setHoveredSkill(skill.id)}
          onMouseLeave={() => setHoveredSkill(null)}
          onClick={() => status === 'available' && onPurchaseSkill(skill.id)}
        />
        
        {/* Skill tier indicator */}
        {skill.tier === 4 && (
          <circle
            cx={x}
            cy={y}
            r={(nodeSize / 2) + 8}
            fill="none"
            stroke="#ffd700"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.8"
            style={{ pointerEvents: 'none' }}
          />
        )}
        
        {/* Level indicators */}
        {currentLevel > 0 && (
          <>
            {[...Array(skill.maxLevel)].map((_, i) => {
              const angle = (i * (360 / skill.maxLevel)) * (Math.PI / 180);
              const dotX = x + Math.cos(angle) * (nodeSize / 2 - 10);
              const dotY = y + Math.sin(angle) * (nodeSize / 2 - 10);
              
              return (
                <circle
                  key={i}
                  cx={dotX}
                  cy={dotY}
                  r={3}
                  fill={i < currentLevel ? statusColor : '#333'}
                  style={{ pointerEvents: 'none' }}
                />
              );
            })}
          </>
        )}
        
        {/* Skill name (abbreviated) */}
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fill={status === 'locked' ? '#666' : '#fff'}
          fontSize="11"
          fontWeight="bold"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {skill.name.split(' ')[0]}
        </text>
        
        {/* Level/Cost text */}
        <text
          x={x}
          y={y + nodeSize / 2 + 20}
          textAnchor="middle"
          fill={statusColor}
          fontSize="10"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {currentLevel > 0 ? `Lv ${currentLevel}/${skill.maxLevel}` : `${cost} SP`}
        </text>
      </g>
    );
  };

  const getSkillTooltip = () => {
    if (!hoveredSkill) return null;
    
    const skill = SKILLS[hoveredSkill];
    const currentLevel = getSkillLevel(skill.id);
    const nextLevel = currentLevel + 1;
    const cost = skill.cost(nextLevel);
    const status = getSkillStatus(skill);
    
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
        width: '300px',
        backgroundColor: '#1a1a1a',
        border: `2px solid ${TREE_INFO[selectedTree].color}`,
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1001
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: TREE_INFO[selectedTree].color,
          marginBottom: '8px'
        }}>
          {skill.name}
        </div>
        
        <div style={{
          fontSize: '11px',
          color: '#888',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Tier {skill.tier} • {skill.tree.toUpperCase()} TREE
        </div>
        
        <div style={{
          fontSize: '13px',
          lineHeight: '1.6',
          marginBottom: '12px',
          color: '#ccc'
        }}>
          {skill.description}
        </div>
        
        {currentLevel > 0 && (
          <div style={{
            padding: '8px',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            border: '1px solid rgba(46, 204, 113, 0.3)',
            borderRadius: '4px',
            marginBottom: '12px',
            fontSize: '12px',
            color: '#2ecc71'
          }}>
            ✓ Level {currentLevel}/{skill.maxLevel}
          </div>
        )}
        
        {currentLevel < skill.maxLevel && (
          <>
            <div style={{
              borderTop: '1px solid #333',
              paddingTop: '12px',
              marginTop: '12px',
              fontSize: '12px'
            }}>
              <div style={{ color: '#f39c12', marginBottom: '8px' }}>
                Cost: {cost} Skill Points
              </div>
              
              {playerLevel < skill.minPlayerLevel && (
                <div style={{ color: '#e74c3c', marginBottom: '8px' }}>
                  ⚠ Requires Level {skill.minPlayerLevel}
                </div>
              )}
              
              {skill.requires && skill.requires.length > 0 && (
                <div style={{ color: '#888', fontSize: '11px' }}>
                  Requires: {skill.requires.map(id => SKILLS[id].name).join(', ')}
                </div>
              )}
            </div>
            
            {status === 'available' && (
              <button
                onClick={() => onPurchaseSkill(skill.id)}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '10px',
                  backgroundColor: TREE_INFO[selectedTree].color,
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Learn Skill
              </button>
            )}
          </>
        )}
        
        {currentLevel >= skill.maxLevel && (
          <div style={{
            padding: '8px',
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            border: '1px solid #2ecc71',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#2ecc71'
          }}>
            ★ MASTERED ★
          </div>
        )}
      </div>
    );
  };

  const treeSkills = Object.values(SKILLS).filter(s => s.tree === selectedTree);

  return (
    <>
      <EventLog messages={gameState.recentMessages} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.97)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          borderBottom: '2px solid #333',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0a0a0a'
        }}>
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: TREE_INFO[selectedTree].color
            }}>
              SKILL TREE
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {TREE_INFO[selectedTree].description}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                LEVEL
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: TREE_INFO[selectedTree].color }}>
                {playerLevel}
              </div>
              <div style={{
                width: '120px',
                height: '6px',
                backgroundColor: '#222',
                borderRadius: '3px',
                marginTop: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${xpProgress}%`,
                  height: '100%',
                  backgroundColor: TREE_INFO[selectedTree].color,
                  transition: 'width 0.3s'
                }} />
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                {playerLevel >= LEVEL_SYSTEM.maxLevel ? 'MAX LEVEL' : `${currentXP} / ${xpForNextLevel} XP`}
              </div>
            </div>
            
            <div style={{
              padding: '16px 24px',
              backgroundColor: '#1a1a1a',
              border: '2px solid #f39c12',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                SKILL POINTS
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f39c12' }}>
                {availableSkillPoints}
              </div>
            </div>
            
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Tree selector */}
        <div style={{
          display: 'flex',
          gap: '0',
          borderBottom: '2px solid #333',
          backgroundColor: '#0a0a0a'
        }}>
          {Object.entries(TREE_INFO).map(([treeId, info]) => (
            <button
              key={treeId}
              onClick={() => setSelectedTree(treeId)}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: selectedTree === treeId ? '#1a1a1a' : 'transparent',
                color: selectedTree === treeId ? info.color : '#666',
                border: 'none',
                borderBottom: selectedTree === treeId ? `3px solid ${info.color}` : '3px solid transparent',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.2s'
              }}
            >
              {info.name}
            </button>
          ))}
        </div>

        {/* Skill tree canvas */}
        <div style={{
          flex: 1,
          position: 'relative',
          overflow: 'auto',
          padding: '40px'
        }}>
          <svg
            width="600"
            height="600"
            style={{
              margin: '0 auto',
              display: 'block'
            }}
          >
            {renderSkillConnections()}
            {treeSkills.map(skill => renderSkillNode(skill))}
          </svg>
        </div>

        {/* Tooltip */}
        {getSkillTooltip()}

        {/* Legend */}
        <div style={{
          padding: '16px 40px',
          borderTop: '2px solid #333',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          gap: '32px',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#2ecc71', borderRadius: '50%' }} />
            <span style={{ color: '#888' }}>MASTERED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: TREE_INFO[selectedTree].color, borderRadius: '50%' }} />
            <span style={{ color: '#888' }}>LEARNED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#f39c12', borderRadius: '50%' }} />
            <span style={{ color: '#888' }}>AVAILABLE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#555', borderRadius: '50%' }} />
            <span style={{ color: '#888' }}>LOCKED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <div style={{ width: '16px', height: '16px', border: '2px solid #ffd700', borderRadius: '50%' }} />
            <span style={{ color: '#ffd700', fontWeight: 'bold' }}>ULTIMATE SKILL</span>
          </div>
        </div>
      </div>
    </>
  );
}