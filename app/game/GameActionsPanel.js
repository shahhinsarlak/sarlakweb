export default function GameActionsPanel({
  gameState,
  isMobile,
  currentLocation,
  actions,
  handleSortPapers,
  getDistortionStyle,
  distortText,
  getModifiedPortalCooldown,
  LOCATIONS,
}) {
  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '15px', marginBottom: '20px', opacity: 0.9 }}>
          {currentLocation.description}
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>
          ACTIONS
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '10px'
        }}>
          <button
            onClick={handleSortPapers}
            style={{
              ...getDistortionStyle(gameState.sanity),
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit',
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
              opacity: 1,
              textAlign: 'center'
            }}
          >
            <div>{distortText('SORT PAPERS', gameState.sanity)}</div>
          </button>
          <button
            onClick={actions.rest}
            style={{
              ...getDistortionStyle(gameState.sanity),
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit',
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
              opacity: 1,
              textAlign: 'center'
            }}
          >
            <div>{distortText('REST', gameState.sanity)}</div>
            <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '6px' }}>
              {gameState.restCooldown > 0 ? `[${Math.ceil(gameState.restCooldown)}s]` : '[RESTORE ENERGY]'}
            </div>
          </button>
          {gameState.meditationUnlocked && (
            <button
              onClick={actions.startMeditation}
              disabled={gameState.energy < 10}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                padding: '20px',
                cursor: gameState.energy >= 10 ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontFamily: 'inherit',
                letterSpacing: '0.5px',
                transition: 'all 0.2s',
                opacity: gameState.energy >= 10 ? 1 : 0.4,
                textAlign: 'center'
              }}
            >
              <div>MEDITATE</div>
              <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '6px' }}>[-10 ENERGY, +SANITY]</div>
            </button>
          )}
          {gameState.upgrades.debugger && (
            <button
              onClick={actions.startDebugSession}
              disabled={gameState.energy < 10}
              style={{
                ...getDistortionStyle(gameState.sanity),
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                padding: '20px',
                cursor: gameState.energy >= 10 ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontFamily: 'inherit',
                letterSpacing: '0.5px',
                transition: 'all 0.2s',
                opacity: gameState.energy >= 10 ? 1 : 0.4,
                textAlign: 'center'
              }}
            >
              <div>{distortText('DEBUG', gameState.sanity)}</div>
              <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '6px' }}>[-10 ENERGY]</div>
            </button>
          )}
        </div>
      </div>

      {/* Locations Section */}
      {gameState.unlockedLocations.length > 1 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
            LOCATIONS
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            {gameState.unlockedLocations.map(loc => {
              const isPortal = loc === 'portal';
              const portalOnCooldown = isPortal && gameState.portalCooldown > 0;
              const isDisabled = gameState.location === loc || portalOnCooldown;
              const maxCooldown = getModifiedPortalCooldown(60, gameState);
              const cooldownProgress = isPortal && gameState.portalCooldown > 0
                ? ((maxCooldown - gameState.portalCooldown) / maxCooldown) * 100
                : 100;

              return (
                <button
                  key={loc}
                  onClick={() => actions.changeLocation(loc)}
                  disabled={isDisabled}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: gameState.location === loc ? 'var(--accent-color)' : 'none',
                    border: '1px solid var(--border-color)',
                    color: gameState.location === loc ? 'var(--bg-color)' : 'var(--text-color)',
                    padding: '14px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    opacity: portalOnCooldown ? 0.5 : 1
                  }}
                >
                  {isPortal && gameState.portalCooldown > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${cooldownProgress}%`,
                      backgroundColor: '#666666',
                      opacity: 0.3,
                      transition: 'width 0.1s linear',
                      zIndex: 0
                    }} />
                  )}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {LOCATIONS[loc]?.name || 'Unknown Location'}
                    {portalOnCooldown && (
                      <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '4px' }}>
                        [{Math.ceil(gameState.portalCooldown)}s]
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
