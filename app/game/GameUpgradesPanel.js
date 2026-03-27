import VoidContractsDisplay from './VoidContractsDisplay';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';

export default function GameUpgradesPanel({
  gameState,
  selectedUpgradeType,
  setSelectedUpgradeType,
  hoveredUpgrade,
  setHoveredUpgrade,
  mousePos,
  setMousePos,
  availableUpgrades,
  actions,
  purchaseDimensionalUpgrade,
  getUpgradeTooltip,
  getPrinterUpgradeTooltip,
  UPGRADES,
  PRINTER_UPGRADES,
  DIMENSIONAL_UPGRADES,
}) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>
        UPGRADES
      </div>
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '16px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <button
          onClick={() => setSelectedUpgradeType('pp')}
          style={{
            background: selectedUpgradeType === 'pp' ? 'var(--accent-color)' : 'none',
            border: 'none',
            borderBottom: selectedUpgradeType === 'pp' ? '2px solid var(--accent-color)' : '2px solid transparent',
            color: selectedUpgradeType === 'pp' ? 'var(--bg-color)' : 'var(--text-color)',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
            opacity: selectedUpgradeType === 'pp' ? 1 : 0.7
          }}
        >
          PP
        </button>
        {gameState.printerUnlocked && (
          <button
            onClick={() => setSelectedUpgradeType('printer')}
            style={{
              background: selectedUpgradeType === 'printer' ? 'var(--accent-color)' : 'none',
              border: 'none',
              borderBottom: selectedUpgradeType === 'printer' ? '2px solid var(--accent-color)' : '2px solid transparent',
              color: selectedUpgradeType === 'printer' ? 'var(--bg-color)' : 'var(--text-color)',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'inherit',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
              opacity: selectedUpgradeType === 'printer' ? 1 : 0.7
            }}
          >
            PRINTER
          </button>
        )}
        {gameState.portalUnlocked && (
          <button
            onClick={() => setSelectedUpgradeType('dimensional')}
            style={{
              background: selectedUpgradeType === 'dimensional' ? 'var(--accent-color)' : 'none',
              border: 'none',
              borderBottom: selectedUpgradeType === 'dimensional' ? '2px solid var(--accent-color)' : '2px solid transparent',
              color: selectedUpgradeType === 'dimensional' ? 'var(--bg-color)' : 'var(--text-color)',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'inherit',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
              opacity: selectedUpgradeType === 'dimensional' ? 1 : 0.7
            }}
          >
            DIMENSIONAL
          </button>
        )}
      </div>

      {/* PP Upgrades */}
      {selectedUpgradeType === 'pp' && availableUpgrades.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {availableUpgrades.slice(0, 5).map(upgrade => (
            <div
              key={upgrade.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredUpgrade(upgrade.id)}
              onMouseLeave={() => setHoveredUpgrade(null)}
              onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
            >
              <button
                onClick={() => actions.buyUpgrade(upgrade)}
                disabled={gameState.pp < upgrade.cost}
                style={{
                  width: '100%',
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  padding: '16px',
                  cursor: gameState.pp >= upgrade.cost ? 'pointer' : 'not-allowed',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  opacity: gameState.pp >= upgrade.cost ? 1 : 0.4
                }}
              >
                <div style={{ fontWeight: '500', marginBottom: '8px', fontSize: '13px' }}>
                  {upgrade.name}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>
                  {upgrade.desc}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accent-color)' }}>
                  {upgrade.cost} PP
                </div>
              </button>

              {hoveredUpgrade === upgrade.id && (
                <div style={{
                  position: 'fixed',
                  left: `${mousePos.x + 15}px`,
                  top: `${mousePos.y + 15}px`,
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--accent-color)',
                  padding: '12px 16px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  whiteSpace: 'nowrap',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  pointerEvents: 'none'
                }}>
                  <div style={{
                    color: 'var(--accent-color)',
                    fontWeight: '500',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Effect:
                  </div>
                  <div style={{ color: 'var(--text-color)' }}>
                    {getUpgradeTooltip(upgrade)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Printer Upgrades */}
      {selectedUpgradeType === 'printer' && gameState.printerUnlocked && (
        <div>
          {gameState.printerQuality !== undefined && (
            <div style={{
              fontSize: '11px',
              marginBottom: '12px',
              padding: '8px',
              backgroundColor: 'var(--hover-color)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              Printer Quality: {gameState.printerQuality}%
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {PRINTER_UPGRADES.filter(u => !gameState.printerUpgrades?.[u.id]).slice(0, 5).map(upgrade => {
              const canAffordPP = gameState.pp >= upgrade.costs.pp;
              const canAffordPaper = gameState.paper >= upgrade.costs.paper;
              const canAfford = canAffordPP && canAffordPaper;

              return (
                <div
                  key={upgrade.id}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setHoveredUpgrade(`printer_${upgrade.id}`)}
                  onMouseLeave={() => setHoveredUpgrade(null)}
                  onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                >
                  <button
                    onClick={() => actions.buyPrinterUpgrade(upgrade)}
                    disabled={!canAfford}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-color)',
                      padding: '16px',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      opacity: canAfford ? 1 : 0.4
                    }}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '8px', fontSize: '13px' }}>
                      {upgrade.name}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>
                      {upgrade.desc}
                    </div>
                    <div style={{ fontSize: '12px', display: 'flex', gap: '12px' }}>
                      <span style={{ color: canAffordPP ? 'var(--accent-color)' : '#ff6666' }}>
                        {upgrade.costs.pp} PP
                      </span>
                      <span style={{ color: canAffordPaper ? 'var(--text-color)' : '#ff6666' }}>
                        {upgrade.costs.paper} Paper
                      </span>
                    </div>
                  </button>

                  {hoveredUpgrade === `printer_${upgrade.id}` && (
                    <div style={{
                      position: 'fixed',
                      left: `${mousePos.x + 15}px`,
                      top: `${mousePos.y + 15}px`,
                      backgroundColor: 'var(--bg-color)',
                      border: '1px solid var(--accent-color)',
                      padding: '12px 16px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      zIndex: 1000,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      pointerEvents: 'none'
                    }}>
                      <div style={{
                        color: 'var(--accent-color)',
                        fontWeight: '500',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Effect:
                      </div>
                      <div style={{ color: 'var(--text-color)' }}>
                        {getPrinterUpgradeTooltip(upgrade)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Void Contracts */}
      {selectedUpgradeType === 'dimensional' && Object.keys(gameState.dimensionalInventory || {}).some(key => gameState.dimensionalInventory[key] > 0) && (
        <VoidContractsDisplay
          gameState={gameState}
          onPurchase={actions.purchaseVoidContract}
        />
      )}

      {/* Dimensional Upgrades */}
      {selectedUpgradeType === 'dimensional' && Object.keys(gameState.dimensionalInventory || {}).some(key => gameState.dimensionalInventory[key] > 0) && (
        <div>
          {DIMENSIONAL_UPGRADES.filter(u => !gameState.dimensionalUpgrades?.[u.id]).slice(0, 5).map(upgrade => {
            // Safety check for materials
            if (!upgrade.materials || typeof upgrade.materials !== 'object') {
              return null;
            }

            const canAfford = Object.entries(upgrade.materials).every(([materialId, required]) =>
              (gameState.dimensionalInventory?.[materialId] || 0) >= required
            );

            return (
              <div
                key={upgrade.id}
                style={{ marginBottom: '12px' }}
              >
                <button
                  onClick={() => purchaseDimensionalUpgrade(upgrade)}
                  disabled={!canAfford}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '16px',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    opacity: canAfford ? 1 : 0.4
                  }}
                >
                  <div style={{ fontWeight: '500', marginBottom: '8px', fontSize: '13px' }}>
                    {upgrade.name}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>
                    {upgrade.desc}
                  </div>
                  <div style={{ fontSize: '11px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {Object.entries(upgrade.materials).map(([materialId, required]) => {
                      const materialDef = DIMENSIONAL_MATERIALS.find(m => m.id === materialId);
                      const has = gameState.dimensionalInventory?.[materialId] || 0;
                      const hasEnough = has >= required;
                      return (
                        <span key={materialId} style={{ color: hasEnough ? 'var(--accent-color)' : '#ff6666' }}>
                          {materialDef?.name || materialId}: {has}/{required}
                        </span>
                      );
                    })}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
