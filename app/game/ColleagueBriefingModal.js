/**
 * Colleague Briefing Modal
 *
 * Displays a warning screen before colleague encounters
 * Gives player option to approach or walk away
 */

export default function ColleagueBriefingModal({ colleague, onApproach, onWalkAway }) {
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
      zIndex: 2000
    }}>
      <div style={{
        maxWidth: '600px',
        width: '90%',
        border: '1px solid var(--border-color)',
        padding: '40px',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '24px',
          textAlign: 'center',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px'
        }}>
          ⚠️ Colleague Encounter
        </div>

        {/* Colleague preview */}
        <div style={{
          border: '1px solid rgba(255, 100, 100, 0.3)',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: '12px',
          whiteSpace: 'pre',
          lineHeight: '1.2',
          backgroundColor: 'rgba(255, 0, 0, 0.05)',
          maxHeight: '200px',
          overflow: 'hidden'
        }}>
          {colleague.ascii}
        </div>

        {/* Warning text */}
        <div style={{
          padding: '20px',
          marginBottom: '24px',
          backgroundColor: 'var(--hover-color)',
          border: '1px solid var(--border-color)',
          fontSize: '13px',
          lineHeight: '1.8'
        }}>
          <p style={{ marginBottom: '12px' }}>
            A colleague is approaching your location. They seem... unusual.
          </p>
          <p style={{ fontStyle: 'italic', opacity: 0.8 }}>
            You could engage with them, but their intentions are unclear.
            Or you could turn away and avoid the interaction entirely.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={onApproach}
            style={{
              background: 'var(--accent-color)',
              border: '2px solid var(--accent-color)',
              color: 'var(--bg-color)',
              padding: '16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'inherit',
              textAlign: 'center',
              letterSpacing: '1px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            👁️ Approach and Engage
          </button>

          <button
            onClick={onWalkAway}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '14px',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'inherit',
              textAlign: 'center',
              letterSpacing: '0.5px',
              opacity: 0.8,
              transition: 'all 0.2s'
            }}
          >
            🚪 Turn and Walk Away
          </button>
        </div>

        {/* Footer hint */}
        <div style={{
          marginTop: '24px',
          padding: '12px',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          fontSize: '11px',
          opacity: 0.6,
          textAlign: 'center',
          color: 'var(--text-color)'
        }}>
          These encounters can lead to rewards, but also risks.
        </div>
      </div>
    </div>
  );
}
