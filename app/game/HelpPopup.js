/**
 * HelpPopup Component
 *
 * Context-aware tutorial popup that appears at key moments
 * Provides guidance on new mechanics as they're introduced
 */

export default function HelpPopup({ popup, onDismiss }) {
  if (!popup) return null;

  return (
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
      zIndex: 10000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div style={{
        maxWidth: '600px',
        width: '90%',
        border: '2px solid var(--accent-color)',
        padding: '40px',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        animation: 'slideUp 0.3s ease-out',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Category badge */}
        <div style={{
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          opacity: 0.5,
          marginBottom: '16px',
          color: popup.category === 'warning' ? '#ff4444' :
                 popup.category === 'exploration' ? '#4a90e2' :
                 popup.category === 'progression' ? '#ffaa00' : 'var(--text-color)'
        }}>
          {popup.category === 'warning' ? '⚠️ WARNING' :
           popup.category === 'exploration' ? '🗺️ DISCOVERY' :
           popup.category === 'progression' ? '⬆️ PROGRESSION' :
           popup.category === 'mechanics' ? '⚙️ MECHANIC' : '📖 TUTORIAL'}
        </div>

        {/* Title */}
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '24px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px'
        }}>
          {popup.title}
        </div>

        {/* Content */}
        <div style={{
          fontSize: '13px',
          lineHeight: '1.8',
          marginBottom: '32px',
          whiteSpace: 'pre-line',
          opacity: 0.9
        }}>
          {popup.content}
        </div>

        {/* Dismiss button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: '1px solid var(--accent-color)',
              color: 'var(--accent-color)',
              padding: '12px 32px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--accent-color)';
              e.target.style.color = 'var(--bg-color)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--accent-color)';
            }}
          >
            I UNDERSTAND
          </button>
        </div>

        {/* Hint about disabling help */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '9px',
          textAlign: 'center',
          opacity: 0.4,
          letterSpacing: '0.5px'
        }}>
          Help popups can be toggled in the game menu
        </div>
      </div>
    </div>
  );
}
