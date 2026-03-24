/**
 * Tier Unlock Modal
 *
 * Displayed when the player crosses a PP multiplier tier threshold.
 * Shows the new tier name, multiplier, desc, and a congratulatory message.
 * Auto-dismisses after 3 seconds. Fires particle effects on mount.
 */

import { useEffect } from 'react';
import { createLevelUpParticles } from './gameUtils';

export default function TierUnlockModal({ tierName, multiplier, tierDesc, onClose }) {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  // Fire particle effects on mount
  useEffect(() => {
    createLevelUpParticles();
  }, []);

  // Escape key dismiss
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
    <div style={{
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        border: '2px solid var(--accent-color)',
        padding: '40px',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          opacity: 0.6,
          marginBottom: '16px'
        }}>
          TIER UNLOCKED
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '12px',
          color: 'var(--accent-color)',
          letterSpacing: '2px'
        }}>
          {tierName}
        </div>
        <div style={{
          fontSize: '14px',
          opacity: 0.7,
          marginBottom: '12px',
          lineHeight: '1.6'
        }}>
          PP multiplier increased to {multiplier}x
        </div>
        <div style={{
          fontSize: '11px',
          opacity: 0.5,
          marginBottom: '24px',
          fontStyle: 'italic'
        }}>
          {tierDesc}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: '1px solid var(--accent-color)',
            color: 'var(--accent-color)',
            padding: '10px 32px',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'inherit',
            letterSpacing: '2px',
            transition: 'all 0.2s'
          }}
        >
          ACCEPT
        </button>
      </div>
    </div>
  );
}
