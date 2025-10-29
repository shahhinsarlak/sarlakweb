/**
 * Armory Component
 *
 * Equipment management interface for loot system:
 * - Weapons tab: All loot weapons from lootInventory
 * - Armor tab: All loot armor from lootInventory (by slot)
 * - Anomalies tab: All loot anomalies from lootInventory
 * - Shows randomized stats, prefixes, and void imbuements
 * - Borderlands-style loot display
 */

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EventLog from './EventLog';
import { compareItems } from './lootGenerationHelpers';

export default function Armory({ gameState, setGameState, onExit }) {
  const [activeTab, setActiveTab] = useState('weapons');
  const [hoveredItem, setHoveredItem] = useState(null);

  // Get loot items from inventory
  const lootInventory = gameState.lootInventory || [];
  const weapons = lootInventory.filter(item => item.type === 'weapon').sort(compareItems);
  const armor = lootInventory.filter(item => item.type === 'armor').sort(compareItems);
  const anomalies = lootInventory.filter(item => item.type === 'anomaly').sort(compareItems);

  /**
   * Get readable text color for rarity based on theme
   * Uses darker colors for light mode, lighter for dark mode
   */
  const getReadableRarityColor = (rarity) => {
    const darkModeColors = {
      common: '#cccccc',
      uncommon: '#66ff66',
      rare: '#66b3ff',
      epic: '#d966ff',
      legendary: '#ffcc66',
      mythic: '#ff6666'
    };

    const lightModeColors = {
      common: '#666666',
      uncommon: '#228822',
      rare: '#1a66cc',
      epic: '#7722cc',
      legendary: '#cc8800',
      mythic: '#cc2222'
    };

    // Detect theme by checking computed styles
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDarkMode ? darkModeColors[rarity.id] : lightModeColors[rarity.id];
  };

  const equipWeapon = (itemId) => {
    setGameState(prev => {
      const item = lootInventory.find(i => i.id === itemId);
      if (!item) return prev;

      return {
        ...prev,
        equippedLootWeapon: itemId,
        recentMessages: [`Equipped: ${item.displayName}`, ...prev.recentMessages].slice(0, 15)
      };
    });
  };

  const equipArmor = (itemId, slot) => {
    setGameState(prev => {
      const item = lootInventory.find(i => i.id === itemId);
      if (!item) return prev;

      return {
        ...prev,
        equippedLootArmor: {
          ...(prev.equippedLootArmor || {}),
          [slot]: itemId
        },
        recentMessages: [`Equipped: ${item.displayName}`, ...prev.recentMessages].slice(0, 15)
      };
    });
  };

  const equipAnomaly = (itemId) => {
    setGameState(prev => {
      const item = lootInventory.find(i => i.id === itemId);
      if (!item) return prev;

      const currentAnomalies = prev.equippedLootAnomalies || [];

      // Toggle: if already equipped, unequip it
      if (currentAnomalies.includes(itemId)) {
        return {
          ...prev,
          equippedLootAnomalies: currentAnomalies.filter(id => id !== itemId),
          recentMessages: [`Unequipped: ${item.displayName}`, ...prev.recentMessages].slice(0, 15)
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
        equippedLootAnomalies: [...currentAnomalies, itemId],
        recentMessages: [`Equipped: ${item.displayName}`, ...prev.recentMessages].slice(0, 15)
      };
    });
  };

  const renderWeaponsTab = () => {
    if (weapons.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          opacity: 0.6
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>No weapons found</div>
          <div style={{ fontSize: '11px' }}>Find dimensional tears in the void to discover weapons</div>
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        padding: '20px 0'
      }}>
        {weapons.map(weapon => {
          const isEquipped = gameState.equippedLootWeapon === weapon.id;
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
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
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

              <div style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                whiteSpace: 'pre',
                lineHeight: '1.2',
                textAlign: 'center',
                marginBottom: '12px',
                color: getReadableRarityColor(weapon.rarity)
              }}>
                {weapon.ascii}
              </div>

              <div style={{
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '4px',
                color: getReadableRarityColor(weapon.rarity),
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
                {weapon.displayName}
              </div>

              {weapon.itemLevel && (
                <div style={{
                  fontSize: '9px',
                  opacity: 0.5,
                  marginBottom: '12px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Level {weapon.itemLevel}
                </div>
              )}

              <div style={{
                fontSize: '10px',
                opacity: 0.8,
                marginBottom: '12px',
                lineHeight: '1.8',
                borderTop: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                paddingTop: '8px',
                paddingBottom: '8px'
              }}>
                <div>⚔️ Damage: <span style={{ color: getReadableRarityColor(weapon.rarity), fontWeight: '500' }}>{weapon.finalStats.damage}</span></div>
                <div>🎯 Crit Chance: <span style={{ color: getReadableRarityColor(weapon.rarity), fontWeight: '500' }}>{(weapon.finalStats.critChance * 100).toFixed(1)}%</span></div>
                <div>💥 Crit Multiplier: <span style={{ color: getReadableRarityColor(weapon.rarity), fontWeight: '500' }}>{weapon.finalStats.critMultiplier.toFixed(1)}x</span></div>
              </div>

              {weapon.imbuements && weapon.imbuements.length > 0 && (
                <div style={{
                  fontSize: '9px',
                  marginBottom: '12px',
                  color: '#9966ff',
                  lineHeight: '1.6'
                }}>
                  {weapon.imbuements.map((imb, idx) => (
                    <div key={idx} style={{ marginBottom: '4px' }}>
                      <span style={{ opacity: 0.8 }}>•</span> {imb.name}: {imb.desc}
                    </div>
                  ))}
                </div>
              )}

              {isEquipped && (
                <div style={{
                  marginTop: 'auto',
                  padding: '8px',
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
    if (armor.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          opacity: 0.6
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>No armor found</div>
          <div style={{ fontSize: '11px' }}>Find dimensional tears in the void to discover armor</div>
        </div>
      );
    }

    const groupedBySlot = {
      head: armor.filter(a => a.slot === 'head'),
      chest: armor.filter(a => a.slot === 'chest'),
      accessory: armor.filter(a => a.slot === 'accessory')
    };

    return (
      <div>
        {Object.entries(groupedBySlot).filter(([_, items]) => items.length > 0).map(([slot, items]) => (
          <div key={slot} style={{ marginBottom: '40px' }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.6,
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {slot.toUpperCase()} SLOT ({items.length})
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {items.map(armorItem => {
                const isEquipped = gameState.equippedLootArmor?.[slot] === armorItem.id;
                const isHovered = hoveredItem === armorItem.id;

                return (
                  <div
                    key={armorItem.id}
                    onClick={() => equipArmor(armorItem.id, slot)}
                    onMouseEnter={() => setHoveredItem(armorItem.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      border: `2px solid ${isEquipped ? armorItem.rarity.color : 'var(--border-color)'}`,
                      padding: '20px',
                      cursor: 'pointer',
                      backgroundColor: isEquipped ? 'rgba(0, 0, 0, 0.1)' : 'var(--bg-color)',
                      transition: 'all 0.3s ease',
                      boxShadow: isHovered || isEquipped ?
                        `0 0 ${20 * armorItem.rarity.glowIntensity}px ${armorItem.rarity.color}` :
                        'none',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      fontSize: '9px',
                      padding: '4px 8px',
                      backgroundColor: armorItem.rarity.color,
                      color: '#000',
                      fontWeight: '500',
                      letterSpacing: '0.5px'
                    }}>
                      {armorItem.rarity.name.toUpperCase()}
                    </div>

                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      whiteSpace: 'pre',
                      lineHeight: '1.2',
                      textAlign: 'center',
                      marginBottom: '12px',
                      color: getReadableRarityColor(armorItem.rarity)
                    }}>
                      {armorItem.ascii}
                    </div>

                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      marginBottom: '4px',
                      color: getReadableRarityColor(armorItem.rarity),
                      textAlign: 'center',
                      lineHeight: '1.4'
                    }}>
                      {armorItem.displayName}
                    </div>

                    {armorItem.itemLevel && (
                      <div style={{
                        fontSize: '9px',
                        opacity: 0.5,
                        marginBottom: '12px',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        Level {armorItem.itemLevel}
                      </div>
                    )}

                    <div style={{
                      fontSize: '10px',
                      opacity: 0.8,
                      marginBottom: '12px',
                      lineHeight: '1.8',
                      borderTop: '1px solid var(--border-color)',
                      borderBottom: '1px solid var(--border-color)',
                      paddingTop: '8px',
                      paddingBottom: '8px'
                    }}>
                      <div>🛡️ Defense: <span style={{ color: getReadableRarityColor(armorItem.rarity), fontWeight: '500' }}>{armorItem.finalStats.defense}</span></div>
                      {armorItem.finalStats.sanityResist > 0 && (
                        <div>🧠 Sanity Resist: <span style={{ color: getReadableRarityColor(armorItem.rarity), fontWeight: '500' }}>{(armorItem.finalStats.sanityResist * 100).toFixed(0)}%</span></div>
                      )}
                      {armorItem.finalStats.damageReflect > 0 && (
                        <div>🔄 Damage Reflect: <span style={{ color: getReadableRarityColor(armorItem.rarity), fontWeight: '500' }}>{(armorItem.finalStats.damageReflect * 100).toFixed(0)}%</span></div>
                      )}
                    </div>

                    {armorItem.imbuements && armorItem.imbuements.length > 0 && (
                      <div style={{
                        fontSize: '9px',
                        marginBottom: '12px',
                        color: '#9966ff',
                        lineHeight: '1.6'
                      }}>
                        {armorItem.imbuements.map((imb, idx) => (
                          <div key={idx} style={{ marginBottom: '4px' }}>
                            <span style={{ opacity: 0.8 }}>•</span> {imb.name}: {imb.desc}
                          </div>
                        ))}
                      </div>
                    )}

                    {isEquipped && (
                      <div style={{
                        marginTop: 'auto',
                        padding: '8px',
                        backgroundColor: armorItem.rarity.color,
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
    const equippedAnomalies = gameState.equippedLootAnomalies || [];

    if (anomalies.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          opacity: 0.6
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>No anomalies found</div>
          <div style={{ fontSize: '11px' }}>Find dimensional tears in the void to discover anomalies</div>
        </div>
      );
    }

    return (
      <div>
        <div style={{
          fontSize: '11px',
          opacity: 0.6,
          marginBottom: '20px',
          textAlign: 'center',
          letterSpacing: '1px'
        }}>
          EQUIPPED: {equippedAnomalies.length} / 3
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
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
                  marginBottom: '12px',
                  color: getReadableRarityColor(anomaly.rarity)
                }}>
                  {anomaly.ascii}
                </div>

                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  color: getReadableRarityColor(anomaly.rarity),
                  textAlign: 'center',
                  lineHeight: '1.4'
                }}>
                  {anomaly.displayName}
                </div>

                {anomaly.itemLevel && (
                  <div style={{
                    fontSize: '9px',
                    opacity: 0.5,
                    marginBottom: '12px',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Level {anomaly.itemLevel}
                  </div>
                )}

                <div style={{
                  fontSize: '10px',
                  opacity: 0.8,
                  marginBottom: '12px',
                  lineHeight: '1.8',
                  borderTop: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                  paddingTop: '8px',
                  paddingBottom: '8px'
                }}>
                  {anomaly.finalStats.xpBonus > 0 && (
                    <div>✨ XP Bonus: <span style={{ color: getReadableRarityColor(anomaly.rarity), fontWeight: '500' }}>+{(anomaly.finalStats.xpBonus * 100).toFixed(0)}%</span></div>
                  )}
                  {anomaly.finalStats.ppBonus > 0 && (
                    <div>📊 PP Bonus: <span style={{ color: getReadableRarityColor(anomaly.rarity), fontWeight: '500' }}>+{(anomaly.finalStats.ppBonus * 100).toFixed(0)}%</span></div>
                  )}
                  {anomaly.finalStats.energyRegen > 0 && (
                    <div>⚡ Energy Regen: <span style={{ color: getReadableRarityColor(anomaly.rarity), fontWeight: '500' }}>+{anomaly.finalStats.energyRegen.toFixed(1)}/s</span></div>
                  )}
                  {anomaly.finalStats.damageBonus > 0 && (
                    <div>💪 Damage Bonus: <span style={{ color: getReadableRarityColor(anomaly.rarity), fontWeight: '500' }}>+{(anomaly.finalStats.damageBonus * 100).toFixed(0)}%</span></div>
                  )}
                  {anomaly.finalStats.allStatsBonus > 0 && (
                    <div>🌟 All Stats: <span style={{ color: getReadableRarityColor(anomaly.rarity), fontWeight: '500' }}>+{(anomaly.finalStats.allStatsBonus * 100).toFixed(0)}%</span></div>
                  )}
                </div>

                {anomaly.imbuements && anomaly.imbuements.length > 0 && (
                  <div style={{
                    fontSize: '9px',
                    marginBottom: '12px',
                    color: '#9966ff',
                    lineHeight: '1.6'
                  }}>
                    {anomaly.imbuements.map((imb, idx) => (
                      <div key={idx} style={{ marginBottom: '4px' }}>
                        <span style={{ opacity: 0.8 }}>•</span> {imb.name}: {imb.desc}
                      </div>
                    ))}
                  </div>
                )}

                {isEquipped && (
                  <div style={{
                    marginTop: 'auto',
                    padding: '8px',
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
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '60px 40px',
        minHeight: '100vh',
        fontSize: '14px'
      }}>
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
              Loot discovered from dimensional tears
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
              {tab} ({tab === 'weapons' ? weapons.length : tab === 'armor' ? armor.length : anomalies.length})
            </button>
          ))}
        </div>

        {activeTab === 'weapons' && renderWeaponsTab()}
        {activeTab === 'armor' && renderArmorTab()}
        {activeTab === 'anomalies' && renderAnomaliesTab()}
      </div>
      <Footer />
    </>
  );
}
