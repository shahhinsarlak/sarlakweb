/**
 * Crystal Opening Modal Component
 *
 * Interactive 4-tap minigame for opening loot crystals:
 * - Tap 1-3: Crystal progressively cracks
 * - Tap 4: Crystal shatters, revealing loot item
 * - Shows item with rarity glow and all stats
 * - Adds item to player's loot inventory
 */

import { useState } from 'react';
import { formatImbuements } from './lootGenerationHelpers';

export default function CrystalOpeningModal({ lootItem, onComplete, onClose }) {
  const [tapCount, setTapCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  /**
   * Get readable text color for rarity - always use light colors since modal is always on black background
   */
  const getReadableRarityColor = (rarity) => {
    const voidColors = {
      common: '#cccccc',
      uncommon: '#66ff66',
      rare: '#66b3ff',
      epic: '#d966ff',
      legendary: '#ffcc66',
      mythic: '#ff6666'
    };
    return voidColors[rarity.id] || '#cccccc';
  };

  const handleTap = () => {
    if (isRevealing) return;

    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    if (newTapCount === 4) {
      // Final tap - reveal item
      setIsRevealing(true);
    }
  };

  const handleClaim = () => {
    onComplete(lootItem);
    onClose();
  };

  // Crystal ASCII based on crack level
  const getCrystalAscii = () => {
    if (tapCount === 0) {
      return `    ◢◣
   ◢███◣
  ◢█████◣
 ◢███████◣
◢█████████◣
 ╲███████╱
  ╲█████╱
   ╲███╱
    ╲█╱`;
    } else if (tapCount === 1) {
      return `    ◢◣
   ◢█│█◣
  ◢██│██◣
 ◢███│███◣
◢████│████◣
 ╲███│███╱
  ╲██│██╱
   ╲█│█╱
    ╲│╱`;
    } else if (tapCount === 2) {
      return `    ◢◣
   ◢█╱█◣
  ◢█╱│╲█◣
 ◢██╱│╲██◣
◢███╱│╲███◣
 ╲██╲│╱██╱
  ╲█╲│╱█╱
   ╲█╱█╱
    ╲│╱`;
    } else if (tapCount === 3) {
      return `    ◢◣
   ╱█╱█╲
  ╱█╱│╲█╲
 ╱█╱─│─╲█╲
◢█╱──│──╲█◣
 ╲╱──│──╲╱
  ╲─╱│╲─╱
   ╲╱█╲╱
    ╲│╱`;
    }
    return '';
  };

  if (!isRevealing) {
    return (
      <div
        onClick={handleTap}
        style={{
          fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          padding: '40px'
        }}>
          {/* Instructions */}
          <div style={{
            fontSize: '14px',
            marginBottom: '40px',
            color: '#888888',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Tap to break the crystal ({tapCount}/4)
          </div>

          {/* Crystal */}
          <div style={{
            fontFamily: 'monospace',
            fontSize: '20px',
            whiteSpace: 'pre',
            lineHeight: '1.2',
            color: getReadableRarityColor(lootItem.rarity),
            textShadow: `0 0 20px ${lootItem.rarity.color}`,
            marginBottom: '40px',
            animation: `crystalPulse ${2000 / (tapCount + 1)}ms ease-in-out infinite`,
            transform: `scale(${1 + tapCount * 0.1})`,
            transition: 'transform 0.3s ease'
          }}>
            {getCrystalAscii()}
          </div>

          {/* Tap indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '40px'
          }}>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: i <= tapCount ? lootItem.rarity.color : '#333333',
                  boxShadow: i <= tapCount ? `0 0 8px ${lootItem.rarity.color}` : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes crystalPulse {
            0%, 100% {
              filter: brightness(1);
            }
            50% {
              filter: brightness(1.3);
            }
          }
        `}</style>
      </div>
    );
  }

  // Reveal screen
  return (
    <div style={{
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'revealFlash 0.5s ease-out'
    }}>
      <div style={{
        maxWidth: '700px',
        width: '90%',
        border: `2px solid ${lootItem.rarity.color}`,
        padding: '40px',
        backgroundColor: '#000000',
        boxShadow: `0 0 40px ${lootItem.rarity.color}`,
        animation: 'revealZoom 0.5s ease-out'
      }}>
        {/* Rarity badge */}
        <div style={{
          textAlign: 'center',
          fontSize: '11px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: lootItem.rarity.color,
          marginBottom: '24px',
          fontWeight: '500'
        }}>
          {lootItem.rarity.name}
        </div>

        {/* Item ASCII */}
        <div style={{
          fontFamily: 'monospace',
          fontSize: '16px',
          whiteSpace: 'pre',
          lineHeight: '1.2',
          textAlign: 'center',
          marginBottom: '24px',
          color: getReadableRarityColor(lootItem.rarity),
          textShadow: `0 0 10px ${lootItem.rarity.color}`
        }}>
          {lootItem.ascii}
        </div>

        {/* Item name */}
        <div style={{
          fontSize: '18px',
          fontWeight: '500',
          marginBottom: '8px',
          color: getReadableRarityColor(lootItem.rarity),
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {lootItem.displayName}
        </div>

        {/* Item type/slot */}
        <div style={{
          fontSize: '11px',
          opacity: 0.6,
          marginBottom: '8px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {lootItem.type === 'armor' ? `${lootItem.slot} Armor` : lootItem.type}
        </div>

        {/* Item level */}
        {lootItem.itemLevel && (
          <div style={{
            fontSize: '11px',
            opacity: 0.6,
            marginBottom: '24px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Level {lootItem.itemLevel}
          </div>
        )}

        {/* Stats */}
        <div style={{
          border: '1px solid #333333',
          padding: '20px',
          marginBottom: '20px',
          fontSize: '12px',
          lineHeight: '1.8'
        }}>
          {lootItem.type === 'weapon' && (
            <>
              <div>⚔️  Damage: <span style={{ color: getReadableRarityColor(lootItem.rarity) }}>{lootItem.finalStats.damage}</span></div>
              <div>🎯 Crit Chance: <span style={{ color: getReadableRarityColor(lootItem.rarity) }}>{(lootItem.finalStats.critChance * 100).toFixed(1)}%</span></div>
              <div>💥 Crit Multiplier: <span style={{ color: getReadableRarityColor(lootItem.rarity) }}>{lootItem.finalStats.critMultiplier.toFixed(1)}x</span></div>
            </>
          )}
          {lootItem.type === 'armor' && (
            <>
              <div>🛡️  Defense: <span style={{ color: getReadableRarityColor(lootItem.rarity) }}>{lootItem.finalStats.defense}</span></div>
            </>
          )}

          {/* Bonus stats */}
          {lootItem.finalStats.damageBonus > 0 && (
            <div>💪 Damage Bonus: <span style={{ color: getReadableRarityColor(lootItem.rarity) }}>+{(lootItem.finalStats.damageBonus * 100).toFixed(0)}%</span></div>
          )}
          {lootItem.finalStats.ppBonus > 0 && (
            <div>📊 PP Bonus: <span style={{ color: getReadableRarityColor(lootItem.rarity) }}>+{(lootItem.finalStats.ppBonus * 100).toFixed(0)}%</span></div>
          )}
          {lootItem.finalStats.xpBonus > 0 && (
            <div>✨ XP Bonus: <span style={{ color: getReadableRarityColor(lootItem.rarity) }}>+{(lootItem.finalStats.xpBonus * 100).toFixed(0)}%</span></div>
          )}
          {lootItem.finalStats.energyRegen > 0 && (
            <div>⚡ Energy Regen: <span style={{ color: getReadableRarityColor(lootItem.rarity) }}>+{lootItem.finalStats.energyRegen.toFixed(1)}/s</span></div>
          )}
          {lootItem.finalStats.sanityRegen > 0 && (
            <div>🧠 Sanity Regen: <span style={{ color: getReadableRarityColor(lootItem.rarity) }}>+{lootItem.finalStats.sanityRegen.toFixed(1)}/s</span></div>
          )}
          {lootItem.finalStats.damageReflect > 0 && (
            <div>🔄 Damage Reflect: <span style={{ color: getReadableRarityColor(lootItem.rarity) }}>{(lootItem.finalStats.damageReflect * 100).toFixed(0)}%</span></div>
          )}
          {lootItem.finalStats.cooldownReduction > 0 && (
            <div>⏱️  Cooldown Reduction: <span style={{ color: getReadableRarityColor(lootItem.rarity) }}>-{(lootItem.finalStats.cooldownReduction * 100).toFixed(0)}%</span></div>
          )}
        </div>

        {/* Prefix */}
        {lootItem.prefix && (
          <div style={{
            marginBottom: '16px',
            fontSize: '11px',
            padding: '8px 12px',
            backgroundColor: '#111111',
            border: '1px solid #333333'
          }}>
            <span style={{ opacity: 0.6, marginRight: '8px' }}>PREFIX:</span>
            <span style={{ color: '#ffcc00' }}>{lootItem.prefix.name}</span>
          </div>
        )}

        {/* Imbuements */}
        {lootItem.imbuements && lootItem.imbuements.length > 0 && (
          <div style={{
            marginBottom: '24px',
            fontSize: '11px'
          }}>
            <div style={{ opacity: 0.6, marginBottom: '8px' }}>VOID IMBUEMENTS:</div>
            {lootItem.imbuements.map((imb, idx) => (
              <div
                key={idx}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#111111',
                  border: '1px solid #333333',
                  marginBottom: '4px',
                  color: '#9966ff'
                }}
              >
                {imb.name}: {imb.desc}
              </div>
            ))}
          </div>
        )}

        {/* Lore */}
        <div style={{
          fontSize: '11px',
          fontStyle: 'italic',
          opacity: 0.8,
          marginBottom: '24px',
          lineHeight: '1.6',
          textAlign: 'center',
          color: '#888888'
        }}>
          &ldquo;{lootItem.lore}&rdquo;
        </div>

        {/* Claim button */}
        <button
          onClick={handleClaim}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: lootItem.rarity.color,
            color: '#000000',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: 'inherit',
            boxShadow: `0 0 20px ${lootItem.rarity.color}`,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = `0 0 30px ${lootItem.rarity.color}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = `0 0 20px ${lootItem.rarity.color}`;
          }}
        >
          Claim Item
        </button>
      </div>

      <style jsx>{`
        @keyframes revealFlash {
          0% {
            backgroundColor: rgba(255, 255, 255, 0.3);
          }
          100% {
            backgroundColor: rgba(0, 0, 0, 0.95);
          }
        }
        @keyframes revealZoom {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
