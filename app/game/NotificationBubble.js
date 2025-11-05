/**
 * Notification Bubble Component
 *
 * Displays colleague encounter notifications in top-left corner
 * Persistent until encounter is completed
 * Creates sense of anticipation and dread
 */

export default function NotificationBubble({ notification, onDismiss }) {
  if (!notification) return null;

  return (
    <>
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 9999,
        maxWidth: '320px',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        border: '1px solid #ff6b6b',
        padding: '16px 20px',
        boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)',
        animation: 'notificationFadeIn 0.4s ease-out, notificationPulse 3s ease-in-out infinite',
        backdropFilter: 'blur(4px)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          borderBottom: '1px solid rgba(255, 107, 107, 0.3)',
          paddingBottom: '8px'
        }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#ff6b6b',
            fontWeight: '600'
          }}>
            Notice
          </div>
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0',
              lineHeight: '1',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.5)'}
          >
            ×
          </button>
        </div>

        {/* Message */}
        <div style={{
          fontSize: '13px',
          lineHeight: '1.6',
          color: 'rgba(255, 255, 255, 0.95)',
          marginBottom: '12px'
        }}>
          {notification.message}
        </div>

        {/* Hint */}
        <div style={{
          fontSize: '11px',
          fontStyle: 'italic',
          color: 'rgba(255, 107, 107, 0.7)',
          textAlign: 'center',
          paddingTop: '8px',
          borderTop: '1px dotted rgba(255, 107, 107, 0.2)'
        }}>
          Visit the break room to respond
        </div>
      </div>

      <style jsx>{`
        @keyframes notificationFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes notificationPulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
          }
          50% {
            box-shadow: 0 4px 30px rgba(255, 107, 107, 0.7);
          }
        }
      `}</style>
    </>
  );
}
