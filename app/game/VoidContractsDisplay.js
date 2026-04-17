'use client';
import { useState } from 'react';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';

const VOID_CONTRACTS = [
  {
    id: 'temporal_pact',
    name: 'Temporal Pact',
    materials: { temporal_core: 10 },
    benefit: '+2x PP/sec permanently',
    tradeoff: 'Can never use time rewind again',
    activeFlag: 'temporalPactActive',
  },
  {
    id: 'void_bargain',
    name: 'Void Bargain',
    materials: { void_fragment: 30, singularity_node: 5 },
    benefit: '+100% dimensional material drop rate',
    tradeoff: 'Portal cooldown permanently doubled',
    activeFlag: 'voidBargainActive',
  },
  {
    id: 'sanity_erosion',
    name: 'Sanity Erosion',
    materials: { glitch_shard: 20, reality_dust: 10 },
    benefit: 'Sanity below 30 grants +3x PP/click instead of penalty',
    tradeoff: 'Max sanity permanently capped at 60',
    activeFlag: 'sanityErosionActive',
  },
];

export default function VoidContractsDisplay({ gameState, onPurchase }) {
  const [confirmingId, setConfirmingId] = useState(null);

  const canAfford = (contract) => {
    return Object.entries(contract.materials).every(
      ([id, cost]) => (gameState.dimensionalInventory?.[id] || 0) >= cost
    );
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      <div style={{
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        opacity: 0.6,
        marginBottom: '16px'
      }}>
        VOID CONTRACTS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {VOID_CONTRACTS.map(contract => {
          const isActive = gameState[contract.activeFlag];
          const affordable = canAfford(contract);

          return (
            <div
              key={contract.id}
              style={{
                border: isActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                padding: '16px',
                background: isActive ? 'rgba(249, 115, 22, 0.05)' : 'none',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
                {contract.name}
              </div>

              {/* Material cost row */}
              <div style={{ fontSize: '11px', display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                {Object.entries(contract.materials).map(([materialId, required]) => {
                  const material = DIMENSIONAL_MATERIALS.find(m => m.id === materialId);
                  if (!material) return null;
                  const owned = gameState.dimensionalInventory?.[materialId] || 0;
                  const hasEnough = owned >= required;
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
                        border: '1px solid rgba(255,255,255,0.2)',
                        flexShrink: 0
                      }} />
                      {owned}/{required} {material.name}
                    </span>
                  );
                })}
              </div>

              {/* Benefit */}
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                {contract.benefit}
              </div>

              {/* Trade-off */}
              <div style={{ fontSize: '11px', color: '#ff6b6b', marginBottom: '12px' }}>
                Trade-off: {contract.tradeoff}
              </div>

              {/* Button area */}
              {isActive ? (
                <div style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.8,
                  color: 'var(--accent-color)'
                }}>
                  CONTRACT ACTIVE
                </div>
              ) : confirmingId === contract.id ? (
                <div>
                  <div style={{ color: '#ff6b6b', marginBottom: '8px', fontSize: '11px' }}>
                    This cannot be undone. Permanently lose: {contract.tradeoff}. Proceed?
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => { onPurchase(contract); setConfirmingId(null); }}
                      style={{
                        background: 'none',
                        border: '1px solid #ff6b6b',
                        color: '#ff6b6b',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        letterSpacing: '0.5px'
                      }}
                    >
                      CONFIRM PURCHASE
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--text-muted, #666)',
                        color: 'var(--text-muted, #666)',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        letterSpacing: '0.5px'
                      }}
                    >
                      KEEP CONTRACT
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingId(contract.id)}
                  disabled={!affordable}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '6px 12px',
                    cursor: affordable ? 'pointer' : 'not-allowed',
                    fontSize: '11px',
                    fontFamily: 'inherit',
                    opacity: affordable ? 1 : 0.5,
                    letterSpacing: '0.5px'
                  }}
                >
                  SEAL CONTRACT
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
