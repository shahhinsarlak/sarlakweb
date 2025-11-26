import { useState } from 'react';
import { SKILLS, SKILL_BRANCHES, LEVEL_SYSTEM } from './skillTreeConstants';
import NotificationPopup from './NotificationPopup';

export default function SkillTreeModal({ gameState, onClose, onPurchaseSkill, notifications, onDismissNotification }) {
  const [activeTab, setActiveTab] = useState('efficiency');
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

    // Check minimum level requirement
    if (skill.minLevel && playerLevel < skill.minLevel) return false;

    // Check prerequisite skills
    return skill.requires.every(reqId => getSkillLevel(reqId) > 0);
  };

  const getSkillStatus = (skill) => {
    const currentLevel = getSkillLevel(skill.id);
    if (currentLevel >= skill.maxLevel) return 'maxed';
    if (currentLevel > 0) return 'learned';

    // Check if locked by level requirement
    if (skill.minLevel && playerLevel < skill.minLevel) return 'level-locked';

    if (canLearnSkill(skill)) return 'available';
    return 'locked';
  };

  // Check if branch should be unlocked
  const isBranchUnlocked = (branchId) => {
    if (branchId === 'efficiency') return true; // Always available
    if (branchId === 'admin') return playerLevel >= 5;
    if (branchId === 'survival') return playerLevel >= 5;
    if (branchId === 'occult') return gameState.portalUnlocked || false;
    if (branchId === 'forbidden') return playerLevel >= 20;
    return false;
  };

  // Get skills for current active tab
  const branchSkills = Object.values(SKILLS)
    .filter(s => s.branch === activeTab)
    .sort((a, b) => {
      // Sort by tier first, then by name
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.name.localeCompare(b.name);
    });

  // Group skills by tier
  const skillsByTier = branchSkills.reduce((acc, skill) => {
    if (!acc[skill.tier]) acc[skill.tier] = [];
    acc[skill.tier].push(skill);
    return acc;
  }, {});

  const renderSkillFile = (skill) => {
    const status = getSkillStatus(skill);
    const currentLevel = getSkillLevel(skill.id);

    let borderColor = 'var(--border-color)';
    let bgColor = 'var(--bg-color)';
    let textColor = 'var(--text-color)';
    let textOpacity = 0.5;
    let filePrefix = '[ ]';

    // Apply corruption effect for forbidden branch
    const isCorrupted = skill.branch === 'forbidden' && status === 'locked';
    const isRedacted = skill.branch === 'forbidden' && status === 'level-locked';

    if (status === 'maxed') {
      borderColor = '#00ff00';
      bgColor = 'rgba(0, 255, 0, 0.03)';
      textColor = '#00ff00';
      textOpacity = 1;
      filePrefix = '[✓]';
    } else if (status === 'learned') {
      borderColor = SKILL_BRANCHES[skill.branch].color;
      bgColor = `${SKILL_BRANCHES[skill.branch].color}08`;
      textColor = SKILL_BRANCHES[skill.branch].color;
      textOpacity = 1;
      filePrefix = '[•]';
    } else if (status === 'available') {
      borderColor = '#ffaa00';
      bgColor = 'rgba(255, 170, 0, 0.03)';
      textColor = '#ffaa00';
      textOpacity = 1;
      filePrefix = '[▸]';
    } else if (status === 'level-locked') {
      textOpacity = 0.3;
      filePrefix = '[✕]';
    }

    // Redaction effect for high-level locked skills
    const displayName = isRedacted ? '███████ ███████' : skill.name;
    const displayDesc = isRedacted ? '███████ ███████ ███████ ███████' : skill.desc;

    return (
      <div
        key={skill.id}
        style={{ position: 'relative', marginBottom: '8px' }}
        onMouseEnter={() => !isRedacted && setHoveredSkill(skill.id)}
        onMouseLeave={() => setHoveredSkill(null)}
      >
        <button
          onClick={() => (status === 'available' || status === 'learned') && onPurchaseSkill(skill.id)}
          disabled={status === 'locked' || status === 'maxed' || status === 'level-locked'}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
            color: textColor,
            cursor: (status === 'available' || status === 'learned') ? 'pointer' : 'default',
            fontSize: '10px',
            fontFamily: 'inherit',
            textAlign: 'left',
            transition: 'all 0.15s',
            opacity: textOpacity,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* File-style prefix */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              opacity: 0.7
            }}>
              {filePrefix}
            </span>
            <span style={{
              fontWeight: '600',
              fontSize: '11px',
              letterSpacing: '0.02em'
            }}>
              {displayName}
              {currentLevel > 0 && !isRedacted && (
                <span style={{
                  marginLeft: '6px',
                  opacity: 0.6,
                  fontSize: '9px'
                }}>
                  [{currentLevel}/{skill.maxLevel}]
                </span>
              )}
            </span>
          </div>

          {/* Description */}
          <div style={{
            fontSize: '9px',
            opacity: 0.7,
            paddingLeft: '20px',
            lineHeight: '1.4'
          }}>
            {displayDesc}
          </div>

          {/* Cost indicator */}
          {status === 'available' && (
            <div style={{
              fontSize: '8px',
              marginTop: '6px',
              paddingLeft: '20px',
              color: '#ffaa00',
              fontWeight: '600'
            }}>
              COST: 1 SP
            </div>
          )}

          {/* Level requirement indicator */}
          {status === 'level-locked' && skill.minLevel && (
            <div style={{
              fontSize: '8px',
              marginTop: '6px',
              paddingLeft: '20px',
              color: 'var(--text-color)',
              opacity: 0.5
            }}>
              REQUIRES LEVEL {skill.minLevel}
            </div>
          )}

          {/* Corruption effect for forbidden branch */}
          {isCorrupted && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
              pointerEvents: 'none'
            }} />
          )}
        </button>

        {/* Hover tooltip */}
        {hoveredSkill === skill.id && !isRedacted && (
          <div style={{
            position: 'absolute',
            left: '105%',
            top: '0',
            backgroundColor: 'var(--bg-color)',
            border: `2px solid ${SKILL_BRANCHES[skill.branch].color}`,
            padding: '14px',
            fontSize: '10px',
            zIndex: 2000,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)',
            minWidth: '240px',
            maxWidth: '300px',
            whiteSpace: 'normal'
          }}>
            <div style={{
              color: SKILL_BRANCHES[skill.branch].color,
              fontWeight: '700',
              marginBottom: '8px',
              fontSize: '11px',
              letterSpacing: '0.03em'
            }}>
              {skill.name}
            </div>
            <div style={{
              color: 'var(--text-color)',
              opacity: 0.8,
              marginBottom: '10px',
              lineHeight: '1.5',
              fontSize: '10px'
            }}>
              {skill.desc}
            </div>
            <div style={{
              color: 'var(--text-color)',
              opacity: 0.5,
              fontSize: '8px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '8px',
              marginTop: '8px'
            }}>
              TIER {skill.tier} • MAX LEVEL: {skill.maxLevel}
              {skill.minLevel && (
                <div style={{ marginTop: '4px' }}>
                  MIN LEVEL: {skill.minLevel}
                </div>
              )}
              {skill.requires.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  REQUIRES: {skill.requires.map(reqId => {
                    const reqSkill = SKILLS[reqId];
                    return reqSkill ? reqSkill.name : reqId;
                  }).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBranchContent = () => {
    if (!isBranchUnlocked(activeTab)) {
      let unlockMessage = 'This filing cabinet is locked.';

      if (activeTab === 'admin' || activeTab === 'survival') {
        unlockMessage = `Unlocks at Level 5 (Current: ${playerLevel})`;
      } else if (activeTab === 'occult') {
        unlockMessage = 'Requires dimensional portal access';
      } else if (activeTab === 'forbidden') {
        unlockMessage = `Access denied. Level ${playerLevel}/20 clearance.`;
      }

      return (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: 'var(--text-color)',
          opacity: 0.4,
          fontSize: '11px'
        }}>
          <div style={{
            fontSize: '40px',
            marginBottom: '16px',
            opacity: 0.3
          }}>
            🔒
          </div>
          <div>{unlockMessage}</div>
        </div>
      );
    }

    const tiers = Object.keys(skillsByTier).sort((a, b) => Number(a) - Number(b));

    return (
      <div style={{ padding: '20px' }}>
        {tiers.map(tier => (
          <div key={tier} style={{ marginBottom: '24px' }}>
            {/* Tier header */}
            <div style={{
              fontSize: '9px',
              fontWeight: '700',
              color: 'var(--text-color)',
              opacity: 0.4,
              marginBottom: '12px',
              letterSpacing: '0.1em',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '6px'
            }}>
              TIER {tier}
            </div>

            {/* Skills in this tier */}
            <div>
              {skillsByTier[tier].map(skill => renderSkillFile(skill))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-color)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        color: 'var(--text-color)'
      }}>
        {/* Header */}
        <div style={{
          borderBottom: '1px solid var(--border-color)',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '14px', marginBottom: '8px', letterSpacing: '0.05em' }}>
              PERSONNEL FILE SYSTEM
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-color)', opacity: 0.6 }}>
              Level {playerLevel} Clearance • {availableSkillPoints} Skill Point{availableSkillPoints !== 1 ? 's' : ''} Available
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'inherit',
              transition: 'all 0.15s'
            }}
          >
            CLOSE
          </button>
        </div>

        {/* XP Bar */}
        <div style={{ padding: '16px 40px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-color)', opacity: 0.5, marginBottom: '8px', letterSpacing: '0.03em' }}>
            EXPERIENCE: {currentXP} / {xpForNextLevel}
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--hover-color)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${xpProgress}%`,
              height: '100%',
              backgroundColor: '#4a90e2',
              transition: 'width 0.3s ease-out'
            }} />
          </div>
        </div>

        {/* Filing Cabinet Tabs */}
        <div style={{
          borderBottom: '2px solid var(--border-color)',
          backgroundColor: 'var(--hover-color)',
          display: 'flex',
          overflow: 'auto'
        }}>
          {Object.entries(SKILL_BRANCHES).map(([branchId, branch]) => {
            const isActive = activeTab === branchId;
            const isUnlocked = isBranchUnlocked(branchId);

            return (
              <button
                key={branchId}
                onClick={() => setActiveTab(branchId)}
                disabled={!isUnlocked}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '14px 20px',
                  border: 'none',
                  borderRight: '1px solid var(--border-color)',
                  borderBottom: isActive ? `3px solid ${branch.color}` : '3px solid transparent',
                  backgroundColor: isActive ? 'var(--bg-color)' : 'transparent',
                  color: isUnlocked ? (isActive ? branch.color : 'var(--text-color)') : 'var(--text-color)',
                  opacity: isUnlocked ? 1 : 0.3,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  fontSize: '10px',
                  fontWeight: '700',
                  fontFamily: 'inherit',
                  letterSpacing: '0.08em',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {branch.name}
                {!isUnlocked && (
                  <div style={{
                    fontSize: '12px',
                    marginTop: '2px',
                    opacity: 0.5
                  }}>
                    🔒
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Branch Description */}
        {isBranchUnlocked(activeTab) && (
          <div style={{
            padding: '12px 40px',
            fontSize: '9px',
            color: 'var(--text-color)',
            opacity: 0.6,
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--hover-color)',
            fontStyle: 'italic'
          }}>
            {SKILL_BRANCHES[activeTab].desc}
          </div>
        )}

        {/* Filing Cabinet Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 'var(--bg-color)'
        }}>
          {renderBranchContent()}
        </div>

        {/* Legend Footer */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          padding: '14px 40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          fontSize: '8px',
          color: 'var(--text-color)',
          opacity: 0.5,
          backgroundColor: 'var(--hover-color)',
          letterSpacing: '0.05em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px' }}>[ ]</span>
            LOCKED
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px' }}>[ ]</span>
            AVAILABLE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px' }}>[•]</span>
            LEARNED
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px' }}>[✓]</span>
            MAXED
          </div>
        </div>
      </div>

      {/* Notification Popup System */}
      <NotificationPopup
        notifications={notifications}
        onDismiss={onDismissNotification}
      />
    </>
  );
}