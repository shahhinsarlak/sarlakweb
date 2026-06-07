'use client';
import React, { useEffect, useState } from 'react';
import NotificationPopup from './NotificationPopup';

function ExamineModal({ item, closeExamine, notifications, onDismissNotification }) {
  const [imageOk, setImageOk] = useState(true);

  // Reset image state when the examined item changes.
  useEffect(() => {
    setImageOk(true);
  }, [item?.id]);

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
          fontSize: '16px'
        }}>
          <div style={{
            border: '1px solid var(--border-color)',
            padding: '32px',
            backgroundColor: 'var(--hover-color)'
          }}>
            <div style={{
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.6,
              marginBottom: '20px'
            }}>
              EXAMINING: {item.name}
            </div>

            {/* Document scan (graceful fallback: hidden if the asset is missing) */}
            {imageOk && (
              <div style={{
                marginBottom: '28px',
                padding: '10px',
                backgroundColor: '#0a0a0a',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
              }}>
                <img
                  src={`/archive/${item.id}.png`}
                  alt={item.name}
                  onError={() => setImageOk(false)}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    filter: 'grayscale(0.25) contrast(1.05)'
                  }}
                />
              </div>
            )}

            <div style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.4,
              marginBottom: '10px'
            }}>
              Transcription
            </div>
            <div style={{
              fontSize: '17px',
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
                fontSize: '14px',
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

ExamineModal.displayName = 'ExamineModal';
export default React.memo(ExamineModal);
