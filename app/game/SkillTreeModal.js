import { useState } from 'react';
import { SKILLS, SKILL_TREE_LAYOUT, LEVEL_SYSTEM } from './skillTreeConstants';
import EventLog from './EventLog';

export default function SkillTreeModal({ gameState, onClose, onPurchaseSkill }) {
  const [selectedTree, setSelectedTree] = useState('speed');
  const [hoveredSkill, setHoveredSkill] = useState(null);
  
  const playerLevel = gameState.playerLevel || 1;
  const currentXP = gameState.playerXP || 0;
  const xpForNextLevel = LEVEL_SYSTEM.getXPForLevel(playerLevel + 1);
  const xpProgress = (currentXP / xpForNextLevel) * 100;
  const availableSkillPoints = gameState.skillPoints || 0;

  const canLearnSkill = (skill) => {
    const currentLevel = getSkillLevel(skill.id);
    if (currentLevel >= skill.maxLevel) return false;
    if (availableSkillPoints < 1) return false; // Always costs 1 SP
    if (playerLevel < skill.minLevel) return false;
    if (!skill.requires || skill.requires.length === 0) return true;
    return skill.requires.every(reqId => getSkillLevel(reqId) > 0);
  };

  const getSkillLevel = (skillId) => {
    // Check both purchasedSkills and skills for backwards compatibility
    return gameState.purchasedSkills?.[skillId] || gameState.skills?.[skillId] || 0;
  };

  const getSkillStatus = (skill) => {
    const currentLevel = getSkillLevel(skill.id);
    if (currentLevel >= skill.maxLevel) return 'maxed';
    if (currentLevel > 0) return 'learned';
    if (canLearnSkill(skill)) return 'available';
    return 'locked';
  };

  const renderSkillConnections = () => {
    const connections = [];
    const gridSize = 120;
    const offsetX = 60;
    const offsetY = 100;

    Object.values(SKILLS).filter(s => s.tree === selectedTree).forEach(skill => {
      if (!skill.requires || skill.requires.length === 0) return;
      
      const skillPos = SKILL_TREE_LAYOUT[selectedTree][skill.id];
      const skillX = skillPos.x * gridSize + offsetX;
      const skillY = skillPos.y * gridSize + offsetY;

      skill.requires.forEach(reqId => {
        const reqPos = SKILL_TREE_LAYOUT[selectedTree][reqId];
        const reqX = reqPos.x * gridSize + offsetX;
        const reqY = reqPos.y * gridSize + offsetY;

        const isActive = getSkillLevel(reqId) > 0;
        connections.push(
          <line
            key={`${reqId}-${skill.id}`}
            x1={reqX}
            y1={reqY}
            x2={skillX}
            y2={skillY}
            stroke={isActive ? '#4a90e2' : '#333'}
            strokeWidth="2"
            strokeDasharray={isActive ? '0' : '5,5'}
          />
        );
      });
    });
    
    return connections;
  };

  const getSkillTooltipContent = (skill) => {
    const currentLevel = getSkillLevel(skill.id);
    const lines = [];
    
    // Current effect
    if (currentLevel > 0) {
      if (skill.effect === 'portalCooldownReduction') {
        lines.push(`Portal cooldown reduced by ${skill.value * currentLevel}s`);
      } else if (skill.effect === 'capacityIncrease') {
        lines.push(`Capacity increased by ${skill.value * currentLevel}`);
      } else if (skill.effect === 'materialSpawnRate') {
        lines.push(`Material spawn rate +${skill.value * currentLevel}%`);
      } else if (skill.effect === 'materialGlow') {
        lines.push(`Materials glow ${skill.value * currentLevel}% brighter`);
      } else if (skill.effect === 'doubleChance') {
        lines.push(`${skill.value * currentLevel}% chance for double materials`);
      } else if (skill.effect === 'jackpot') {
        lines.push(`${skill.value}% chance for 10x materials`);
      } else if (skill.effect === 'ppMultiplier') {
        lines.push(`PP generation +${skill.value * currentLevel}%`);
      } else if (skill.effect === 'energyReduction') {
        lines.push(`Energy costs reduced by ${skill.value * currentLevel}%`);
      } else if (skill.effect === 'meditationBonus') {
        lines.push(`Meditation sanity gain +${skill.value * currentLevel}%`);
      } else if (skill.effect === 'upgradeEfficiency') {
        lines.push(`All upgrades ${skill.value * currentLevel}% more effective`);
      }
    }

    // Next level effect
    if (currentLevel < skill.maxLevel) {
      lines.push('');
      lines.push('Next level:');
      if (skill.effect === 'portalCooldownReduction') {
        lines.push(`Portal cooldown -${skill.value * (currentLevel + 1)}s`);
      } else if (skill.effect === 'capacityIncrease') {
        lines.push(`Capacity +${skill.value * (currentLevel + 1)}`);
      } else if (skill.effect === 'materialSpawnRate') {
        lines.push(`Spawn rate +${skill.value * (currentLevel + 1)}%`);
      } else if (skill.effect === 'materialGlow') {
        lines.push(`Glow +${skill.value * (currentLevel + 1)}%`);
      } else if (skill.effect === 'doubleChance') {
        lines.push(`Double chance ${skill.value * (currentLevel + 1)}%`);
      } else if (skill.effect === 'ppMultiplier') {
        lines.push(`PP generation +${skill.value * (currentLevel + 1)}%`);
      } else if (skill.effect === 'energyReduction') {
        lines.push(`Energy cost -${skill.value * (currentLevel + 1)}%`);
      } else if (skill.effect === 'meditationBonus') {
        lines.push(`Meditation +${skill.value * (currentLevel + 1)}%`);
      } else if (skill.effect === 'upgradeEfficiency') {
        lines.push(`Upgrades +${skill.value * (currentLevel + 1)}% effective`);
      }
    }

    // Requirements
    if (skill.requires && skill.requires.length > 0) {
      lines.push('');
      lines.push(`Requires: ${skill.requires.map(id => SKILLS[id].name).join(', ')}`);
    }

    if (skill.minLevel > 1) {
      lines.push(`Minimum level: ${skill.minLevel}`);
    }
    
    return lines;
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
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace"
      }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #333',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>
            SKILL TREE
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            Level {playerLevel} • {availableSkillPoints} Skill Points Available
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: '1px solid #555',
            color: '#aaa',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit'
          }}
        >
          ✕ CLOSE
        </button>
      </div>

      {/* XP Bar */}
      <div style={{
        padding: '16px 40px',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Experience: {currentXP} / {xpForNextLevel}
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${xpProgress}%`,
            height: '100%',
            backgroundColor: '#4a90e2',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* Tree Tabs */}
      <div style={{
        display: 'flex',
        gap: '2px',
        padding: '0 40px',
        borderBottom: '1px solid #333'
      }}>
        {['speed', 'luck', 'combat', 'efficiency'].map(treeId => {
          const treeName = treeId.charAt(0).toUpperCase() + treeId.slice(1);
          return (
            <button
              key={treeId}
              onClick={() => setSelectedTree(treeId)}
              style={{
                background: selectedTree === treeId ? '#1a1a1a' : 'none',
                border: 'none',
                borderBottom: selectedTree === treeId ? '2px solid #4a90e2' : '2px solid transparent',
                color: selectedTree === treeId ? '#fff' : '#666',
                padding: '16px 24px',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s'
              }}
            >
              {treeName}
            </button>
          );
        })}
      </div>

      {/* Skill Tree Canvas */}
      <div style={{
        flex: 1,
        padding: '40px',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#888',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          {selectedTree === 'speed' && 'Increase collection speed and reduce cooldowns'}
          {selectedTree === 'luck' && 'Improve drop rates and material quality'}
          {selectedTree === 'combat' && 'Prepare for colleague encounters and boost survivability'}
          {selectedTree === 'efficiency' && 'Optimize resource generation and energy usage'}
        </div>

        <div style={{
          position: 'relative',
          width: '600px',
          height: '500px',
          margin: '0 auto'
        }}>
          {/* SVG for connections */}
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}>
            {renderSkillConnections()}
          </svg>

          {/* Skill Nodes */}
          {treeSkills.map(skill => {
            const position = SKILL_TREE_LAYOUT[selectedTree][skill.id];
            const status = getSkillStatus(skill);
            const currentLevel = getSkillLevel(skill.id);
            const x = position.x * 120 + 30;
            const y = position.y * 120 + 70;

            let borderColor = '#333';
            let bgColor = '#0a0a0a';
            let textColor = '#666';
            
            if (status === 'maxed') {
              borderColor = '#00ff00';
              bgColor = '#001a00';
              textColor = '#00ff00';
            } else if (status === 'learned') {
              borderColor = '#4a90e2';
              bgColor = '#001a33';
              textColor = '#4a90e2';
            } else if (status === 'available') {
              borderColor = '#ffaa00';
              bgColor = '#1a1200';
              textColor = '#ffaa00';
            }

            return (
              <div
                key={skill.id}
                onMouseEnter={() => setHoveredSkill(skill.id)}
                onMouseLeave={() => setHoveredSkill(null)}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <button
                  onClick={() => status === 'available' && onPurchaseSkill(skill.id)}
                  disabled={status !== 'available'}
                  style={{
                    width: '100px',
                    height: '100px',
                    background: bgColor,
                    border: `2px solid ${borderColor}`,
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: status === 'available' ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    transition: 'all 0.2s',
                    opacity: status === 'locked' ? 0.3 : 1,
                    position: 'relative'
                  }}
                >
                  <div style={{
                    fontSize: '10px',
                    color: textColor,
                    textAlign: 'center',
                    fontWeight: '600',
                    lineHeight: '1.2'
                  }}>
                    {skill.name}
                  </div>
                  <div style={{
                    fontSize: '8px',
                    color: textColor,
                    textAlign: 'center',
                    opacity: 0.8,
                    marginTop: '4px'
                  }}>
                    Lv {currentLevel}/{skill.maxLevel}
                  </div>
                  <div style={{
                    fontSize: '7px',
                    color: textColor,
                    textAlign: 'center',
                    opacity: 0.6,
                    marginTop: '2px'
                  }}>
                    Cost: 1 SP
                  </div>
                  {status === 'available' && (
                    <div style={{
                      fontSize: '7px',
                      color: '#ffaa00',
                      marginTop: '4px',
                      fontWeight: '600'
                    }}>
                      CLICK
                    </div>
                  )}
                </button>

                {/* Tooltip */}
                {hoveredSkill === skill.id && (
                  <div style={{
                    position: 'absolute',
                    left: '110px',
                    top: '0',
                    backgroundColor: '#000',
                    border: '1px solid #4a90e2',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    pointerEvents: 'none',
                    minWidth: '220px'
                  }}>
                    <div style={{ 
                      color: '#4a90e2', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      fontSize: '11px'
                    }}>
                      {skill.name}
                    </div>
                    <div style={{ 
                      color: '#aaa',
                      marginBottom: '8px',
                      fontSize: '9px',
                      lineHeight: '1.4',
                      whiteSpace: 'normal'
                    }}>
                      {skill.desc}
                    </div>
                    <div style={{
                      borderTop: '1px solid #333',
                      paddingTop: '8px',
                      color: '#888',
                      fontSize: '9px',
                      lineHeight: '1.6'
                    }}>
                      {getSkillTooltipContent(skill).map((line, i) => (
                        <div key={i} style={{ 
                          marginBottom: line === '' ? '4px' : '2px',
                          color: line.startsWith('Next level') || line.startsWith('Requires') ? '#aaa' : '#888'
                        }}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          fontSize: '10px',
          color: '#888'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', border: '2px solid #333', borderRadius: '2px' }} />
            Locked
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', border: '2px solid #ffaa00', borderRadius: '2px' }} />
            Available
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', border: '2px solid #4a90e2', borderRadius: '2px' }} />
            Learned
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', border: '2px solid #00ff00', borderRadius: '2px' }} />
            Maxed
          </div>
        </div>
      </div>
    </div>
    </>
  );
}