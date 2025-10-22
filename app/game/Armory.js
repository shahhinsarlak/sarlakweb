/**
 * Armory Component
 *
 * Equipment management interface with grid layout
 * - Weapons tab: All available weapons with ASCII art
 * - Armor tab: Head, Chest, Accessory slots
 * - Anomalies tab: Relic system (equip up to 3)
 * - Hover effects: Glow based on rarity, show lore
 * - Click to equip/unequip
 */

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EventLog from './EventLog';
import {
  getAllWeapons,
  getAllArmor,
  getAllAnomalies,
  isEquipmentUnlocked,
  RARITY
} from './equipmentConstants';

export default function Armory({ gameState, setGameState, onExit }) {
  const [activeTab, setActiveTab] = useState('weapons');
  const [hoveredItem, setHoveredItem] = useState(null);

  const equipWeapon = (weaponId) => {
    setGameState(prev => ({
      ...prev,
      equippedWeapon: weaponId,
      recentMessages: [`Equipped: ${getAllWeapons().find(w => w.id === weaponId)?.name}`, ...prev.recentMessages].slice(0, 15)
    }));
  };

  const equipArmor = (armorId, slot) => {
    setGameState(prev => ({
      ...prev,
      equippedArmor: {
        ...prev.equippedArmor,
        [slot]: armorId
      },
      recentMessages: [`Equipped: ${getAllArmor().find(a => a.id === armorId)?.name}`, ...prev.recentMessages].slice(0, 15)
    }));
  };

  const equipAnomaly = (anomalyId) => {
    setGameState(prev => {
      const currentAnomalies = prev.equippedAnomalies || [];

      // Toggle: if already equipped, unequip it
      if (currentAnomalies.includes(anomalyId)) {
        return {
          ...prev,
          equippedAnomalies: currentAnomalies.filter(id => id !== anomalyId),
          recentMessages: [`Unequipped: ${getAllAnomalies().find(a => a.id === anomalyId)?.name}`, ...prev.recentMessages].slice(0, 15)
        };
      }

      // Can only equip 3 anomalies
      if (currentAnomalies.length >= 3) {
        return {
          ...prev,
          recentMessages: ['Cannot equip more than 3 anomalies. Unequip one first.', ...prev.recentMessages].slice(0, 15)
        };
      }

      return {
        ...prev,
        equippedAnomalies: [...currentAnomalies, anomalyId],
        recentMessages: [`Equipped: ${getAllAnomalies().find(a => a.id === anomalyId)?.name}`, ...prev.recentMessages].slice(0, 15)
      };
    });
  };

  const renderWeaponsTab = () => {
    const weapons = getAllWeapons().filter(w => isEquipmentUnlocked(w, gameState));

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
        padding: '20px 0'
      }}>
        {weapons.map(weapon => {
          const isEquipped = gameState.equippedWeapon === weapon.id;
          const isHovered = hoveredItem === weapon.id;

          return (
            <div
              key={weapon.id}
              onClick={() => equipWeapon(weapon.id)}
              onMouseEnter={() => setHoveredItem(weapon.id)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                border: `2px solid ${isEquipped ? weapon.rarity.color : 'var(--border-color)'}`,
                padding: '20px',
                cursor: 'pointer',
                backgroundColor: isEquipped ? 'rgba(0, 0, 0, 0.1)' : 'var(--bg-color)',
                transition: 'all 0.3s ease',
                boxShadow: isHovered || isEquipped ?
                  `0 0 ${20 * weapon.rarity.glowIntensity}px ${weapon.rarity.color}` :
                  'none',
                position: 'relative'
              }}
            >
              {/* Rarity badge */}
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: '9px',
                padding: '4px 8px',
                backgroundColor: weapon.rarity.color,
                color: '#000',
                fontWeight: '500',
                letterSpacing: '0.5px'
              }}>
                {weapon.rarity.name.toUpperCase()}
              </div>

              {/* ASCII Art */}
              <div style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                whiteSpace: 'pre',
                lineHeight: '1.2',
                textAlign: 'center',
                marginBottom: '16px',
                color: weapon.rarity.textColor
              }}>
                {weapon.ascii}
              </div>

              {/* Name */}
              <div style={{
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '8px',
                color: weapon.rarity.textColor,
                textAlign: 'center'
              }}>
                {weapon.name}
              </div>

              {/* Stats */}
              <div style={{
                fontSize: '10px',
                opacity: 0.7,
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                ⚔️ DMG: {weapon.damage} | 🎯 CRIT: {(weapon.critChance * 100).toFixed(0)}%
              </div>

              {/* Lore (on hover) */}
              {isHovered && (
                <div style={{
                  fontSize: '11px',
                  opacity: 0.8,
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '12px',
                  marginTop: '8px',
                  color: weapon.rarity.textColor
                }}>
                  {weapon.lore}
                </div>
              )}

              {isEquipped && (
                <div style={{
                  marginTop: '12px',
                  padding: '6px',
                  backgroundColor: weapon.rarity.color,
                  color: '#000',
                  fontSize: '10px',
                  fontWeight: '500',
                  textAlign: 'center',
                  letterSpacing: '1px'
                }}>
                  EQUIPPED
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderArmorTab = () => {
    const armorPieces = getAllArmor().filter(a => isEquipmentUnlocked(a, gameState));
    const groupedBySlot = {
      head: armorPieces.filter(a => a.slot === 'head'),
      chest: armorPieces.filter(a => a.slot === 'chest'),
      accessory: armorPieces.filter(a => a.slot === 'accessory')
    };

    return (
      <div>
        {Object.entries(groupedBySlot).map(([slot, items]) => (
          <div key={slot} style={{ marginBottom: '40px' }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.6,
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {slot.toUpperCase()} SLOT
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {items.map(armor => {
                const isEquipped = gameState.equippedArmor?.[slot] === armor.id;
                const isHovered = hoveredItem === armor.id;

                return (
                  <div
                    key={armor.id}
                    onClick={() => equipArmor(armor.id, slot)}
                    onMouseEnter={() => setHoveredItem(armor.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      border: `2px solid ${isEquipped ? armor.rarity.color : 'var(--border-color)'}`,
                      padding: '20px',
                      cursor: 'pointer',
                      backgroundColor: isEquipped ? 'rgba(0, 0, 0, 0.1)' : 'var(--bg-color)',
                      transition: 'all 0.3s ease',
                      boxShadow: isHovered || isEquipped ?
                        `0 0 ${20 * armor.rarity.glowIntensity}px ${armor.rarity.color}` :
                        'none',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      fontSize: '9px',
                      padding: '4px 8px',
                      backgroundColor: armor.rarity.color,
                      color: '#000',
                      fontWeight: '500',
                      letterSpacing: '0.5px'
                    }}>
                      {armor.rarity.name.toUpperCase()}
                    </div>

                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      whiteSpace: 'pre',
                      lineHeight: '1.2',
                      textAlign: 'center',
                      marginBottom: '16px',
                      color: armor.rarity.textColor
                    }}>
                      {armor.ascii}
                    </div>

                    <div style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: armor.rarity.textColor,
                      textAlign: 'center'
                    }}>
                      {armor.name}
                    </div>

                    <div style={{
                      fontSize: '10px',
                      opacity: 0.7,
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      🛡️ DEF: {armor.defense}
                      {armor.specialEffect && ` | ✨ Special`}
                    </div>

                    {isHovered && (
                      <div style={{
                        fontSize: '11px',
                        opacity: 0.8,
                        fontStyle: 'italic',
                        lineHeight: '1.6',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '12px',
                        marginTop: '8px',
                        color: armor.rarity.textColor
                      }}>
                        {armor.lore}
                      </div>
                    )}

                    {isEquipped && (
                      <div style={{
                        marginTop: '12px',
                        padding: '6px',
                        backgroundColor: armor.rarity.color,
                        color: '#000',
                        fontSize: '10px',
                        fontWeight: '500',
                        textAlign: 'center',
                        letterSpacing: '1px'
                      }}>
                        EQUIPPED
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAnomaliesTab = () => {
    const anomalies = getAllAnomalies().filter(a => isEquipmentUnlocked(a, gameState));
    const equippedAnomalies = gameState.equippedAnomalies || [];

    return (
      <div>
        <div style={{
          fontSize: '11px',
          opacity: 0.6,
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          EQUIPPED: {equippedAnomalies.length} / 3
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {anomalies.map(anomaly => {
            const isEquipped = equippedAnomalies.includes(anomaly.id);
            const isHovered = hoveredItem === anomaly.id;

            return (
              <div
                key={anomaly.id}
                onClick={() => equipAnomaly(anomaly.id)}
                onMouseEnter={() => setHoveredItem(anomaly.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  border: `2px solid ${isEquipped ? anomaly.rarity.color : 'var(--border-color)'}`,
                  padding: '20px',
                  cursor: 'pointer',
                  backgroundColor: isEquipped ? 'rgba(0, 0, 0, 0.1)' : 'var(--bg-color)',
                  transition: 'all 0.3s ease',
                  boxShadow: isHovered || isEquipped ?
                    `0 0 ${20 * anomaly.rarity.glowIntensity}px ${anomaly.rarity.color}` :
                    'none',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontSize: '9px',
                  padding: '4px 8px',
                  backgroundColor: anomaly.rarity.color,
                  color: '#000',
                  fontWeight: '500',
                  letterSpacing: '0.5px'
                }}>
                  {anomaly.rarity.name.toUpperCase()}
                </div>

                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  whiteSpace: 'pre',
                  lineHeight: '1.2',
                  textAlign: 'center',
                  marginBottom: '16px',
                  color: anomaly.rarity.textColor
                }}>
                  {anomaly.ascii}
                </div>

                <div style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: anomaly.rarity.textColor,
                  textAlign: 'center'
                }}>
                  {anomaly.name}
                </div>

                <div style={{
                  fontSize: '10px',
                  opacity: 0.7,
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>
                  ✨ {anomaly.effect.toUpperCase().replace('_', ' ')}: +{(anomaly.effectValue * 100).toFixed(0)}%
                </div>

                {isHovered && (
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.8,
                    fontStyle: 'italic',
                    lineHeight: '1.6',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '12px',
                    marginTop: '8px',
                    color: anomaly.rarity.textColor
                  }}>
                    {anomaly.lore}
                  </div>
                )}

                {isEquipped && (
                  <div style={{
                    marginTop: '12px',
                    padding: '6px',
                    backgroundColor: anomaly.rarity.color,
                    color: '#000',
                    fontSize: '10px',
                    fontWeight: '500',
                    textAlign: 'center',
                    letterSpacing: '1px'
                  }}>
                    EQUIPPED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <EventLog messages={gameState.recentMessages} />
      <Header />
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 40px',
        minHeight: '100vh',
        fontSize: '14px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: '500',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              THE ARMORY
            </div>
            <div style={{
              fontSize: '12px',
              opacity: 0.6
            }}>
              Equip yourself for the battles ahead
            </div>
          </div>

          <button
            onClick={onExit}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit',
              letterSpacing: '1px'
            }}
          >
            ← EXIT
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px'
        }}>
          {['weapons', 'armor', 'anomalies'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'var(--accent-color)' : 'none',
                border: '1px solid var(--border-color)',
                color: activeTab === tab ? 'var(--bg-color)' : 'var(--text-color)',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'inherit',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'weapons' && renderWeaponsTab()}
        {activeTab === 'armor' && renderArmorTab()}
        {activeTab === 'anomalies' && renderAnomaliesTab()}
      </div>
      <Footer />
    </>
  );
}
