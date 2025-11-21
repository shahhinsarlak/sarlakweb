/**
 * Buff Replacement Modal Component
 *
 * Displayed when player tries to consume a document that would grant a buff,
 * but they already have the maximum number of active buffs.
 * Allows player to replace an existing buff or cancel the operation.
 *
 * @param {Object} gameState - Current game state
 * @param {Object} pendingBuff - The new buff waiting to be added
 * @param {Function} onReplace - Callback when player chooses to replace a buff (buffId)
 * @param {Function} onCancel - Callback when player cancels the operation
 */
import NotificationPopup from './NotificationPopup';

export default function BuffReplacementModal({ gameState, pendingBuff, onReplace, onCancel, notifications, onDismissNotification }) {
  if (!pendingBuff) return null;

  // Get active buffs (filter expired)
  const now = Date.now();
  const activeBuffs = (gameState.activeReportBuffs || []).filter(buff => buff.expiresAt > now);

  /**
   * Format buff effects for display
   * @param {Object} buff - Buff object
   * @returns {Array<string>} Array of effect descriptions
   */
  const formatBuffEffects = (buff) => {
    const effects = [];
    if (buff.ppMult) effects.push(`PP: +${((buff.ppMult - 1) * 100).toFixed(0)}%`);
    if (buff.xpMult) effects.push(`XP: +${((buff.xpMult - 1) * 100).toFixed(0)}%`);
    if (buff.ppPerSecondMult) effects.push(`PP/sec: ${buff.ppPerSecondMult}x`);
    if (buff.energyCostMult && buff.energyCostMult < 1) {
      effects.push(`Energy: -${((1 - buff.energyCostMult) * 100).toFixed(0)}%`);
    }
    if (buff.materialMult) effects.push(`Materials: ${buff.materialMult}x`);
    if (buff.noSanityDrain) effects.push('No sanity drain');
    return effects;
  };

  const pendingEffects = formatBuffEffects(pendingBuff);
  const pendingDuration = Math.ceil(pendingBuff.duration || 300); // Default 5 min if not set

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
      zIndex: 2000
    }}>
      <div style={{
        maxWidth: '700px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '2px solid var(--accent-color)',
        padding: '30px',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '12px'
        }}>
          BUFF LIMIT REACHED
        </div>

        <div style={{ opacity: 0.8, fontSize: '12px', marginBottom: '24px', lineHeight: '1.6' }}>
          You currently have {activeBuffs.length}/{gameState.maxActiveBuffs} active buffs.
          Choose a buff to replace, or cancel to keep your current buffs.
        </div>

        {/* New Pending Buff */}
        <div style={{
          marginBottom: '24px',
          border: '2px solid #4CAF50',
          padding: '16px',
          backgroundColor: 'rgba(76, 175, 80, 0.1)'
        }}>
          <div style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.6,
            marginBottom: '8px',
            color: '#4CAF50'
          }}>
            NEW BUFF
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>
            {pendingBuff.name}
          </div>
          <div style={{ opacity: 0.9, fontSize: '11px', fontStyle: 'italic', marginBottom: '12px' }}>
            {pendingBuff.desc}
          </div>
          <div style={{ fontSize: '11px', marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', opacity: 0.7, marginBottom: '4px' }}>EFFECTS:</div>
            {pendingEffects.map((effect, i) => (
              <div key={i} style={{ opacity: 0.9, marginBottom: '2px' }}>• {effect}</div>
            ))}
          </div>
          <div style={{ opacity: 0.7, fontSize: '10px' }}>
            Duration: {pendingDuration}s
          </div>
        </div>

        {/* Current Active Buffs */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.7,
            marginBottom: '12px'
          }}>
            REPLACE ONE OF THESE BUFFS:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeBuffs.map((buff, idx) => {
              const timeLeft = Math.ceil((buff.expiresAt - now) / 1000);
              const effects = formatBuffEffects(buff);

              return (
                <div
                  key={buff.id || idx}
                  style={{
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    backgroundColor: 'var(--hover-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onClick={() => onReplace(buff.id || idx)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                    {buff.name}
                  </div>
                  <div style={{ opacity: 0.8, fontSize: '10px', fontStyle: 'italic', marginBottom: '8px' }}>
                    {buff.desc}
                  </div>
                  <div style={{ fontSize: '10px', marginBottom: '6px' }}>
                    {effects.map((effect, i) => (
                      <div key={i} style={{ opacity: 0.8, marginBottom: '2px' }}>• {effect}</div>
                    ))}
                  </div>
                  <div style={{ opacity: 0.6, fontSize: '9px' }}>
                    {timeLeft}s remaining
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontSize: '9px',
                    opacity: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Click to Replace
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          style={{
            width: '100%',
            padding: '14px',
            fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: 'transparent',
            color: 'var(--text-color)',
            border: '2px solid var(--border-color)',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-color)';
            e.currentTarget.style.borderColor = 'var(--accent-color)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          Consume Without Buff - Keep Current Buffs
        </button>
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
