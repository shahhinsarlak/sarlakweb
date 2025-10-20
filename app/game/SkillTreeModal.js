import { useState } from 'react';
import { SKILLS, LEVEL_SYSTEM } from './skillTreeConstants';
import EventLog from './EventLog';

export default function SkillTreeModal({ gameState, onClose, onPurchaseSkill }) {
  const [selectedBranch, setSelectedBranch] = useState('efficiency');
  const [hoveredSkill, setHoveredSkill] = useState(null);
  
  const playerLevel = gameState.playerLevel || 1;
  const currentXP = gameState.playerXP || 0;
  const xpForNextLevel = LEVEL_SYSTEM.getXPForLevel(playerLevel + 1);
  const xpProgress = (currentXP / xpForNextLevel) * 100;
  const availableSkillPoints = gameState.skillPoints || 0;

  const getSkillLevel = (skillId) => {
    return gameState.skills?.[skillId] || 0;
  };

  const canLearnSkill = (skill) => {
    const currentLevel = getSkillLevel(skill.id);
    if (currentLevel >= skill.maxLevel) return false;
    if (availableSkillPoints < 1) return false;
    return skill.requires.every(reqId => getSkillLevel(reqId) > 0);
  };

  const getSkillStatus = (skill) => {
    const currentLevel = getSkillLevel(skill.id);
    if (currentLevel >= skill.maxLevel) return 'maxed';
    if (currentLevel > 0) return 'learned';
    if (canLearnSkill(skill)) return 'available';
    return 'locked';
  };

  const branchSkills = Object.values(SKILLS).filter(s => s.branch === selectedBranch);

  const renderBranch = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', maxWidth: '300px', margin: '0 auto' }}>
        {branchSkills.map(skill => {
          const status = getSkillStatus(skill);
          const currentLevel = getSkillLevel(skill.id);
          
          let borderColor = '#333';
          let bgColor = 'transparent';
          let textColor = '#666';
          
          if (status === 'maxed') {
            borderColor = '#00ff00';
            bgColor = 'rgba(0, 255, 0, 0.05)';
            textColor = '#00ff00';
          } else if (status === 'learned') {
            borderColor = '#4a90e2';
            bgColor = 'rgba(74, 144, 226, 0.05)';
            textColor = '#4a90e2';
          } else if (status === 'available') {
            borderColor = '#ffaa00';
            bgColor = 'rgba(255, 170, 0, 0.05)';
            textColor = '#ffaa00';
          }

          return (
            <div
              key={skill.id}
              style={{ position: 'relative', width: '100%' }}
              onMouseEnter={() => setHoveredSkill(skill.id)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <button
                onClick={() => (status === 'available' || status === 'learned') && onPurchaseSkill(skill.id)}
                disabled={status === 'locked' || status === 'maxed'}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: `2px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  color: textColor,
                  cursor: status === 'maxed' ? 'default' : 'pointer',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  opacity: status === 'locked' ? 0.3 : 1
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>
                  {skill.name} {currentLevel > 0 ? `[${currentLevel}/${skill.maxLevel}]` : ''}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>
                  {skill.desc}
                </div>
                {status === 'available' && (
                  <div style={{ fontSize: '9px', marginTop: '8px', color: '#ffaa00' }}>
                    Cost: 1 SP
                  </div>
                )}
              </button>

              {hoveredSkill === skill.id && (
                <div style={{
                  position: 'absolute',
                  left: '110%',
                  top: '0',
                  backgroundColor: '#000',
                  border: '1px solid #4a90e2',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                  minWidth: '200px',
                  whiteSpace: 'normal'
                }}>
                  <div style={{ color: '#4a90e2', fontWeight: '600', marginBottom: '8px' }}>
                    {skill.name}
                  </div>
                  <div style={{ color: '#aaa', marginBottom: '8px', lineHeight: '1.4' }}>
                    {skill.desc}
                  </div>
                  <div style={{ color: '#888', fontSize: '9px' }}>
                    Max Level: {skill.maxLevel}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

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
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              SKILL TREE
            </div>
            <div style={{ fontSize: '10px', color: '#888' }}>
              Level {playerLevel} • {availableSkillPoints} Skill Points Available
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid #666',
              color: '#fff',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'inherit'
            }}
          >
            CLOSE
          </button>
        </div>

        {/* XP Bar */}
        <div style={{ padding: '20px 40px', borderBottom: '1px solid #333' }}>
          <div style={{ fontSize: '9px', color: '#888', marginBottom: '8px' }}>
            XP: {currentXP} / {xpForNextLevel}
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

        {/* Branch Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #333'
        }}>
          {['efficiency', 'portal', 'survival'].map(branch => (
            <button
              key={branch}
              onClick={() => setSelectedBranch(branch)}
              style={{
                flex: 1,
                background: selectedBranch === branch ? '#1a1a1a' : 'none',
                border: 'none',
                borderBottom: selectedBranch === branch ? '2px solid #4a90e2' : '2px solid transparent',
                color: selectedBranch === branch ? '#fff' : '#666',
                padding: '16px',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.2s'
              }}
            >
              {branch === 'efficiency' ? '📊 Efficiency' : branch === 'portal' ? '🌀 Portal' : '🛡️ Survival'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '40px',
          overflowY: 'auto'
        }}>
          <div style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginBottom: '32px' }}>
            {selectedBranch === 'efficiency' && 'Optimize PP generation and resource usage'}
            {selectedBranch === 'portal' && 'Improve dimensional material collection'}
            {selectedBranch === 'survival' && 'Increase resilience and combat effectiveness'}
          </div>
          {renderBranch()}
        </div>

        {/* Legend */}
        <div style={{
          borderTop: '1px solid #333',
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          fontSize: '9px',
          color: '#888'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', border: '2px solid #333' }} />
            Locked
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', border: '2px solid #ffaa00' }} />
            Available
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', border: '2px solid #4a90e2' }} />
            Learned
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', border: '2px solid #00ff00' }} />
            Maxed
          </div>
        </div>
      </div>
    </>
  );
}