export default function DebugModal({ gameState, submitDebug, updateDebugCode, cancelDebug }) {
  if (!gameState.currentBug) return null;

  return (
    <div style={{
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 60px',
        minHeight: '100vh',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        <div style={{
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>
              DEBUG CONSOLE
            </span>
            <span style={{ fontSize: '11px', color: '#ff6b6b' }}>
              ● ERRORS DETECTED
            </span>
          </div>
          <button
            onClick={cancelDebug}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'inherit'
            }}
          >
            EXIT
          </button>
        </div>

        <div style={{
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '16px',
          paddingBottom: '0'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            borderTop: '1px solid var(--border-color)',
            borderLeft: '1px solid var(--border-color)',
            borderRight: '1px solid var(--border-color)',
            fontSize: '12px',
            backgroundColor: 'var(--hover-color)'
          }}>
            index.js
          </div>
        </div>

        <div style={{
          display: 'flex',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--hover-color)',
          marginBottom: '16px',
          position: 'relative'
        }}>
          <div style={{
            padding: '12px 8px',
            borderRight: '1px solid var(--border-color)',
            textAlign: 'right',
            color: '#666',
            fontSize: '12px',
            userSelect: 'none',
            minWidth: '40px'
          }}>
            {gameState.currentBug.userCode.split('\n').map((_, i) => (
              <div key={i} style={{ lineHeight: '1.6' }}>{i + 1}</div>
            ))}
          </div>
          
          <div style={{
            position: 'absolute',
            left: '48px',
            top: '0',
            padding: '12px',
            fontFamily: 'inherit',
            fontSize: '13px',
            lineHeight: '1.6',
            pointerEvents: 'none',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            color: 'transparent'
          }}>
            {gameState.currentBug.userCode.split('').map((char, i) => {
              const correctChar = gameState.currentBug.correct[i];
              let color = 'transparent';
              
              if (char === correctChar) {
                color = '#4ade80';
              } else if (correctChar !== undefined) {
                color = '#ef4444';
              }
              
              return (
                <span key={i} style={{ backgroundColor: color, opacity: 0.3 }}>
                  {char}
                </span>
              );
            })}
          </div>

          <textarea
            value={gameState.currentBug.userCode}
            onChange={(e) => updateDebugCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-color)',
              fontFamily: 'inherit',
              fontSize: '13px',
              lineHeight: '1.6',
              resize: 'none',
              outline: 'none',
              minHeight: '200px',
              position: 'relative',
              zIndex: 1
            }}
          />
        </div>

        <div style={{
          border: '1px solid var(--border-color)',
          padding: '12px',
          backgroundColor: 'var(--hover-color)',
          marginBottom: '16px',
          minHeight: '80px'
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '8px' }}>
            CONSOLE OUTPUT
          </div>
          <div style={{ color: '#ff6b6b', fontSize: '12px' }}>
            ⚠ {gameState.currentBug.hint}
          </div>
          <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
            Attempts remaining: {3 - gameState.debugAttempts}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={submitDebug}
            style={{
              background: 'var(--accent-color)',
              border: '1px solid var(--border-color)',
              color: 'var(--bg-color)',
              padding: '10px 24px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit',
              fontWeight: '500',
              letterSpacing: '0.5px',
              transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)'
            }}
          >
            RUN & SUBMIT
          </button>
        </div>

        <div style={{
          marginTop: '32px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '11px',
          opacity: 0.6,
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>ENERGY: {Math.floor(gameState.energy)}%</span>
          <span>REWARD: 200-500 PP</span>
        </div>
      </div>
    </div>
  );
}