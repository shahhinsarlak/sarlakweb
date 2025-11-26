'use client';
import { useEffect } from 'react';
import NotificationPopup from './NotificationPopup';

export default function ExamineModal({ item, closeExamine, notifications, onDismissNotification }) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeExamine();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeExamine]);

  return (
    <>
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-color)',
        zIndex: 1000,
        overflow: 'auto'
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '60px 40px',
          fontSize: '14px'
        }}>
          <div style={{
            border: '1px solid var(--border-color)',
            padding: '32px',
            backgroundColor: 'var(--hover-color)'
          }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.6,
              marginBottom: '20px'
            }}>
              EXAMINING: {item.name}
            </div>
            <div style={{
              fontSize: '15px',
              lineHeight: '1.8',
              marginBottom: '32px'
            }}>
              {item.story}
            </div>
            <button
              onClick={closeExamine}
              style={{
                background: 'var(--accent-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--bg-color)',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'inherit',
                letterSpacing: '0.5px',
                width: '100%'
              }}
            >
              CLOSE
            </button>
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
