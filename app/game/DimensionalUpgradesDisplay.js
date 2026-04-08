import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';
import { DIMENSIONAL_UPGRADES } from './constants';

export default function DimensionalUpgradesDisplay({ gameState, onPurchase }) {
  const canAfford = (upgrade) => {
    if (!upgrade.materials || typeof upgrade.materials !== 'object') return false;
    const materialsOk = Object.entries(upgrade.materials).every(
      ([materialId, required]) => (gameState.dimensionalInventory?.[materialId] || 0) >= required
    );
    const ppOk = !upgrade.ppCost || (gameState.pp || 0) >= upgrade.ppCost;
    return materialsOk && ppOk;
  };

  // Portal-specific upgrades that should be hidden until portal is unlocked
  const portalUpgradeIds = [
    'dimensional_anchor',
    'reality_stabilizer',
    'temporal_accelerator',
    'material_scanner'
  ];

  const availableUpgrades = DIMENSIONAL_UPGRADES.filter(u => {
    if (gameState.dimensionalUpgrades?.[u.id]) return false;
    if (portalUpgradeIds.includes(u.id) && !gameState.portalUnlocked) return false;
    if (u.requiresUpgrade && !gameState.dimensionalUpgrades?.[u.requiresUpgrade]) return false;
    return true;
  });

  if (availableUpgrades.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '30px' }}>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
        DIMENSIONAL CRAFTING
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {availableUpgrades.slice(0, 5).map(upgrade => {
          const affordable = canAfford(upgrade);
          return (
            <button
              key={upgrade.id}
              onClick={() => onPurchase(upgrade)}
              disabled={!affordable}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                padding: '16px',
                cursor: affordable ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'all 0.2s',
                opacity: affordable ? 1 : 0.4
              }}
            >
              <div style={{ fontWeight: '500', marginBottom: '8px', fontSize: '13px' }}>
                {upgrade.name}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>
                {upgrade.desc}
              </div>
              <div style={{ fontSize: '11px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {upgrade.materials && Object.entries(upgrade.materials).map(([materialId, required]) => {
                  const material = DIMENSIONAL_MATERIALS.find(m => m.id === materialId);
                  const owned = gameState.dimensionalInventory?.[materialId] || 0;
                  const hasEnough = owned >= required;

                  if (!material) {
                    console.warn(`[DIMENSIONAL_UPGRADES] Material ID "${materialId}" not found in DIMENSIONAL_MATERIALS`);
                    return null;
                  }

                  return (
                    <span key={materialId} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: hasEnough ? 'var(--accent-color)' : '#ff6b6b'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: material.color,
                        border: '1px solid rgba(255,255,255,0.2)'
                      }} />
                      {owned}/{required}
                    </span>
                  );
                })}
                {upgrade.ppCost && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: (gameState.pp || 0) >= upgrade.ppCost ? 'var(--accent-color)' : '#ff6b6b'
                  }}>
                    PP: {Math.floor(gameState.pp || 0).toLocaleString()}/{upgrade.ppCost.toLocaleString()}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}