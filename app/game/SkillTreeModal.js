import React, { useState, useEffect } from 'react';
import { SKILLS, LEVEL_SYSTEM } from './skillTreeConstants';
import NotificationPopup from './NotificationPopup';

function SkillTreeModal({ gameState, onClose, onPurchaseSkill, notifications, onDismissNotification }) {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const playerLevel = gameState.playerLevel || 1;
  const currentXP = gameState.playerXP || 0;
  const xpForNextLevel = LEVEL_SYSTEM.getXPForLevel(playerLevel + 1);
  const xpProgress = Math.min(100, (currentXP / xpForNextLevel) * 100);
  const availableSkillPoints = gameState.skillPoints || 0;

  const getSkillLevel = (skillId) => gameState.skills?.[skillId] || 0;

  const getStatus = (skill) => {
    const lvl = getSkillLevel(skill.id);
    if (lvl >= skill.maxLevel) return 'maxed';
    if (availableSkillPoints >= 1) return 'available';
    if (lvl > 0) return 'learned';
    return 'locked';
  };

  // Show the bonus this skill currently provides and what the next point adds.
  const effectSummary = (skill) => {
    const lvl = getSkillLevel(skill.id);
    const fmt = (effects) => {
      const [key, value] = Object.entries(effects)[0];
      const pct = (v) => `${Math.round(v * 100)}%`;
      switch (key) {
        case 'ppPerClickMultiplier': return `+${pct(value)} PP/click`;
        case 'ppPerSecondMultiplier': return `+${pct(value)} passive PP`;
        case 'ppMultiplier': return `+${pct(value)} all PP`;
        case 'energyCostReduction': return `-${pct(value)} energy cost`;
        case 'sanityLossReduction': return `-${pct(value)} sanity loss`;
        case 'restCooldownReduction': return `-${value}s rest cooldown`;
        case 'portalCooldownReduction': return `-${pct(value)} portal cooldown`;
        case 'freeActionChance': return `${pct(value)} free actions`;
        default: return '';
      }
    };
    const current = lvl > 0 ? fmt(skill.effect(lvl)) : null;
    const next = lvl < skill.maxLevel ? fmt(skill.effect(lvl + 1)) : null;
    return { current, next };
  };

  const renderSkill = (skill) => {
    const status = getStatus(skill);
    const lvl = getSkillLevel(skill.id);
    const { current, next } = effectSummary(skill);

    let borderColor = 'var(--border-color)';
    let accent = 'var(--text-color)';
    let prefix = '[ ]';
    let opacity = 0.6;

    if (status === 'maxed') {
      borderColor = '#22c55e'; accent = '#22c55e'; prefix = '[x]'; opacity = 1;
    } else if (status === 'learned') {
      borderColor = 'var(--accent-color)'; accent = 'var(--accent-color)'; prefix = '[*]'; opacity = 1;
    } else if (status === 'available') {
      borderColor = 'var(--accent-color)'; accent = 'var(--accent-color)'; prefix = '[+]'; opacity = 1;
    }

    const clickable = status === 'available';

    return (
      <div
        key={skill.id}
        style={{ position: 'relative', marginBottom: '10px' }}
        onMouseEnter={() => setHoveredSkill(skill.id)}
        onMouseLeave={() => setHoveredSkill(null)}
      >
        <button
          onClick={() => clickable && onPurchaseSkill(skill.id)}
          disabled={!clickable}
          style={{
            width: '100%',
            padding: '14px 18px',
            border: `1px solid ${borderColor}`,
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-color)',
            cursor: clickable ? 'pointer' : 'default',
            fontFamily: 'inherit',
            textAlign: 'left',
            transition: 'all 0.15s',
            opacity
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: accent, fontWeight: 700, fontSize: '15px' }}>{prefix}</span>
              <span style={{ fontWeight: 600, fontSize: '15px', color: accent, letterSpacing: '0.02em' }}>
                {skill.name}
              </span>
            </span>
            <span style={{ fontSize: '13px', opacity: 0.7 }}>
              {lvl}/{skill.maxLevel}
            </span>
          </div>

          <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '6px', paddingLeft: '23px', lineHeight: 1.5 }}>
            {skill.desc}
          </div>

          <div style={{ fontSize: '12px', marginTop: '8px', paddingLeft: '23px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {current && <span style={{ color: accent }}>NOW: {current}</span>}
            {status === 'available' && next && <span style={{ color: 'var(--accent-bright)' }}>NEXT: {next} &middot; 1 SP</span>}
            {status === 'locked' && next && <span style={{ opacity: 0.5 }}>NEXT: {next} (need a skill point)</span>}
            {status === 'maxed' && <span style={{ color: '#22c55e' }}>MAXED</span>}
          </div>
        </button>
      </div>
    );
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
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
            <div style={{ fontSize: '16px', marginBottom: '8px', letterSpacing: '0.05em' }}>
              PERSONNEL FILE SYSTEM
            </div>
            <div style={{ fontSize: '13px', opacity: 0.6 }}>
              Level {playerLevel} &middot; <span style={{ color: 'var(--accent-color)' }}>{availableSkillPoints} Skill Point{availableSkillPoints !== 1 ? 's' : ''}</span> available
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
              fontSize: '13px',
              fontFamily: 'inherit'
            }}
          >
            CLOSE
          </button>
        </div>

        {/* XP Bar */}
        <div style={{ padding: '16px 40px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '8px', letterSpacing: '0.03em' }}>
            EXPERIENCE: {Math.floor(currentXP)} / {xpForNextLevel} TO NEXT LEVEL
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
              backgroundColor: 'var(--accent-color)',
              transition: 'width 0.3s ease-out'
            }} />
          </div>
        </div>

        {/* Flat skill list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px', maxWidth: '760px', margin: '0 auto', width: '100%' }}>
          {Object.values(SKILLS).map(renderSkill)}
          <div style={{ fontSize: '12px', opacity: 0.4, marginTop: '8px', lineHeight: 1.6 }}>
            Skill points come from leveling up (1 per level, 3 every 5th). Skills are permanent within a
            run. Reality remembers your choices.
          </div>
        </div>
      </div>

      <NotificationPopup
        notifications={notifications}
        onDismiss={onDismissNotification}
      />
    </>
  );
}
SkillTreeModal.displayName = 'SkillTreeModal';
export default React.memo(SkillTreeModal);
