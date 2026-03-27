import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';

export default function GameSidebarExtras({ gameState }) {
  return (
    <>
      {Object.keys(gameState.dimensionalInventory || {}).length > 0 && (
        <div style={{
          border: '1px solid var(--border-color)',
          padding: '16px',
          marginBottom: '16px',
          backgroundColor: 'var(--hover-color)'
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '20px' }}>
            DIMENSIONAL MATERIALS
          </div>
          <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DIMENSIONAL_MATERIALS.map(material => {
              const count = gameState.dimensionalInventory[material.id] || 0;
              if (count === 0) return null;
              return (
                <div key={material.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: material.color,
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: `0 0 4px ${material.color}`
                    }} />
                    <span style={{ fontSize: '11px' }}>{material.name}</span>
                  </div>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Log */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>
          EVENT LOG
        </div>
        <div style={{
          border: '1px solid var(--border-color)',
          padding: '12px',
          backgroundColor: 'var(--hover-color)',
          fontSize: '11px',
          opacity: 0.7,
          lineHeight: '1.6',
          maxHeight: '200px',
          overflowY: 'auto',
          minHeight: '100px'
        }}>
          {gameState.recentMessages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: i < gameState.recentMessages.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
