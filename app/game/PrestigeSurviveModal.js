/**
 * Prestige Survive Modal
 *
 * Full-screen dramatic overlay shown when player clicks "SURVIVE ANOTHER DAY".
 * Displays 5 path cards for the player to choose their prestige path.
 * Confirming a path calls onPrestige(pathId) and triggers a run reset.
 * Closing without choosing does nothing.
 */

import { useState, useEffect } from 'react';
import { PRESTIGE_PATHS } from './constants';

export default function PrestigeSurviveModal({ gameState, onPrestige, onClose }) {
  const [selectedPath, setSelectedPath] = useState(null);

  // ESC key closes without resetting
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      zIndex: 1200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        textAlign: 'center',
        color: 'var(--text-color)',
      }}>
        {/* Title */}
        <div style={{
          fontSize: '24px',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          color: 'var(--accent-color)',
          fontFamily: 'inherit',
          marginBottom: '8px',
          fontWeight: 'bold',
        }}>
          SURVIVE ANOTHER DAY
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: '12px',
          opacity: 0.6,
          marginBottom: '24px',
        }}>
          Reset your progress. Keep what matters. Choose your path.
        </div>

        {/* Info block */}
        <div style={{
          opacity: 0.5,
          fontSize: '10px',
          marginBottom: '24px',
          lineHeight: '1.7',
        }}>
          <span style={{ color: 'var(--accent-color)', opacity: 0.8 }}>RESETS:</span> resources, upgrades, rank, skills, energy, sanity
          {'  '}
          <span style={{ color: 'var(--accent-color)', opacity: 0.8 }}>PERSISTS:</span> achievements, path bonuses, prestige multiplier
        </div>

        {/* Path cards grid */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          {PRESTIGE_PATHS.map((path) => {
            const isSelected = selectedPath === path.id;
            return (
              <div
                key={path.id}
                onClick={() => setSelectedPath(path.id)}
                style={{
                  width: 'calc(50% - 6px)',
                  minWidth: '200px',
                  border: isSelected
                    ? '2px solid var(--accent-color)'
                    : '1px solid var(--border-color)',
                  backgroundColor: isSelected
                    ? 'rgba(249, 115, 22, 0.1)'
                    : 'transparent',
                  padding: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s',
                }}
              >
                {/* Path name */}
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'var(--accent-color)',
                  marginBottom: '6px',
                }}>
                  {path.name}
                </div>

                {/* Flavor text */}
                <div style={{
                  fontSize: '11px',
                  opacity: 0.7,
                  fontStyle: 'italic',
                  marginBottom: '8px',
                  lineHeight: '1.4',
                }}>
                  {path.desc}
                </div>

                {/* Bonus description */}
                <div style={{
                  fontSize: '11px',
                  color: '#f97316',
                  marginBottom: '6px',
                }}>
                  +{Math.abs(path.bonus.value * 100)}% {path.bonus.type}
                </div>

                {/* Current pathScore */}
                <div style={{
                  fontSize: '10px',
                  opacity: 0.5,
                }}>
                  Alignment: {gameState.pathScores?.[path.id] || 0}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm button — only when a path is selected */}
        {selectedPath !== null && (
          <button
            onClick={() => {
              onPrestige(selectedPath);
              onClose();
            }}
            style={{
              background: 'var(--accent-color)',
              color: '#000',
              border: 'none',
              padding: '12px 32px',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'inherit',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginTop: '16px',
              fontWeight: 'bold',
            }}
          >
            CHOOSE THIS PATH
          </button>
        )}

        {/* ESC hint */}
        <div style={{
          fontSize: '10px',
          opacity: 0.4,
          marginTop: '16px',
        }}>
          Press ESC to close without resetting
        </div>
      </div>
    </div>
  );
}
