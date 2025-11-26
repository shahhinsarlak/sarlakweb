/**
 * Achievements Modal Component
 *
 * Displays all achievements (unlocked and locked) in a modal interface
 * Shows achievement name, description, and unlock status
 */

import { useEffect } from 'react';
import NotificationPopup from './NotificationPopup';

export default function AchievementsModal({ gameState, achievements, onClose, notifications, onDismissNotification }) {
  const unlockedAchievements = gameState.achievements || [];

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <>
    <div style={{
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        border: '1px solid var(--border-color)',
        padding: '32px',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '500',
              marginBottom: '8px',
              letterSpacing: '1px'
            }}>
              ACHIEVEMENTS
            </h2>
            <div style={{ fontSize: '12px', opacity: 0.6 }}>
              {unlockedAchievements.length} / {achievements.length} Unlocked
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
              transition: 'all 0.2s'
            }}
          >
            CLOSE
          </button>
        </div>

        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          {achievements.map(achievement => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);

            return (
              <div
                key={achievement.id}
                style={{
                  border: `1px solid ${isUnlocked ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  padding: '16px',
                  backgroundColor: isUnlocked ? 'var(--hover-color)' : 'transparent',
                  opacity: isUnlocked ? 1 : 0.4,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{
                    fontSize: '24px',
                    lineHeight: 1,
                    marginTop: '2px'
                  }}>
                    {isUnlocked ? '🏆' : '🔒'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      marginBottom: '6px',
                      color: isUnlocked ? 'var(--accent-color)' : 'var(--text-color)'
                    }}>
                      {achievement.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      opacity: 0.8,
                      lineHeight: '1.5'
                    }}>
                      {achievement.desc}
                    </div>
                    {!isUnlocked && (
                      <div style={{
                        fontSize: '10px',
                        marginTop: '8px',
                        opacity: 0.5,
                        fontStyle: 'italic'
                      }}>
                        Not yet unlocked
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
