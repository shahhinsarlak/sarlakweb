/**
 * Journal Modal Component
 *
 * Displays discovered locations, colleagues, and equipment
 * Three tabs: Locations, Colleagues, Equipment
 * Shows lore and flavor text for discovered items
 *
 * @param {Object} gameState - Current game state
 * @param {Function} onClose - Callback to close the journal
 * @param {Function} onSwitchTab - Callback to switch tabs
 */

'use client';

import { useEffect } from 'react';
import { JOURNAL_ENTRIES, LOCATIONS, STRANGE_COLLEAGUE_DIALOGUES } from './constants';
import { WEAPONS, ARMOR, ANOMALIES } from './equipmentConstants';
import { getColleagueRelationshipSummary } from './journalHelpers';

export default function JournalModal({ gameState, onClose, onSwitchTab }) {
  const currentTab = gameState.journalTab || 'locations';

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Get all location IDs
  const allLocationIds = Object.keys(LOCATIONS);

  // Get all colleague IDs
  const allColleagueIds = STRANGE_COLLEAGUE_DIALOGUES.map(c => c.id);

  // Get all equipment IDs
  const allWeaponIds = Object.keys(WEAPONS);
  const allArmorIds = Object.keys(ARMOR);
  const allAnomalyIds = Object.keys(ANOMALIES);

  // Render location tab
  const renderLocationsTab = () => {
    return (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>
          📍 DISCOVERED LOCATIONS ({gameState.discoveredLocations?.length || 0}/{allLocationIds.length})
        </h3>

        {allLocationIds.map(locationId => {
          const isDiscovered = (gameState.discoveredLocations || []).includes(locationId);
          const entry = JOURNAL_ENTRIES.locations[locationId];

          if (!isDiscovered) {
            return (
              <div
                key={locationId}
                style={{
                  marginBottom: '20px',
                  padding: '15px',
                  border: '1px dashed var(--border-color)',
                  opacity: 0.3
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>??? UNKNOWN LOCATION</div>
                <div style={{ fontSize: '12px', marginTop: '8px', fontStyle: 'italic' }}>
                  Not yet discovered
                </div>
              </div>
            );
          }

          return (
            <div
              key={locationId}
              style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid var(--border-color)',
                backgroundColor: gameState.location === locationId ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                {entry?.name || LOCATIONS[locationId].name}
                {gameState.location === locationId && <span style={{ marginLeft: '8px', fontSize: '12px' }}>[CURRENT]</span>}
              </div>

              <div style={{ fontSize: '11px', marginBottom: '8px', opacity: 0.7, fontStyle: 'italic' }}>
                {entry?.unlockHint}
              </div>

              <div style={{ fontSize: '12px', marginBottom: '8px', lineHeight: '1.6' }}>
                {entry?.lore}
              </div>

              <div style={{ fontSize: '11px', fontStyle: 'italic', opacity: 0.8, borderTop: '1px dotted var(--border-color)', paddingTop: '8px', marginTop: '8px' }}>
                "{entry?.notes}"
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render colleagues tab
  const renderColleaguesTab = () => {
    return (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>
          👥 MET COLLEAGUES ({gameState.discoveredColleagues?.length || 0}/{allColleagueIds.length})
        </h3>

        {allColleagueIds.map(colleagueId => {
          const isDiscovered = (gameState.discoveredColleagues || []).includes(colleagueId);
          const entry = JOURNAL_ENTRIES.colleagues[colleagueId];
          const colleague = STRANGE_COLLEAGUE_DIALOGUES.find(c => c.id === colleagueId);
          const relationship = getColleagueRelationshipSummary(gameState, colleagueId);

          if (!isDiscovered) {
            return (
              <div
                key={colleagueId}
                style={{
                  marginBottom: '20px',
                  padding: '15px',
                  border: '1px dashed var(--border-color)',
                  opacity: 0.3
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>??? UNKNOWN COLLEAGUE</div>
                <div style={{ fontSize: '12px', marginTop: '8px', fontStyle: 'italic' }}>
                  Not yet encountered
                </div>
              </div>
            );
          }

          return (
            <div
              key={colleagueId}
              style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid var(--border-color)'
              }}
            >
              {/* Colleague name and title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {entry?.name}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7, fontStyle: 'italic' }}>
                    {entry?.title}
                  </div>
                </div>

                {/* Relationship status */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: relationship.color, fontWeight: 'bold' }}>
                    {relationship.status}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>
                    Trust: {relationship.trustLevel > 0 ? '+' : ''}{relationship.trustLevel}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>
                    Encounters: {relationship.encounters}
                  </div>
                </div>
              </div>

              {/* ASCII art */}
              {colleague?.ascii && (
                <pre style={{
                  fontSize: '10px',
                  margin: '12px 0',
                  padding: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden'
                }}>
                  {colleague.ascii}
                </pre>
              )}

              {/* Lore */}
              <div style={{ fontSize: '12px', marginBottom: '8px', lineHeight: '1.6' }}>
                {entry?.lore}
              </div>

              {/* Personality */}
              <div style={{ fontSize: '11px', marginBottom: '8px', opacity: 0.8, borderTop: '1px dotted var(--border-color)', paddingTop: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>Personality:</span> {entry?.personality}
              </div>

              {/* First encounter note */}
              <div style={{ fontSize: '11px', fontStyle: 'italic', opacity: 0.7 }}>
                {entry?.firstMet}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render equipment tab
  const renderEquipmentTab = () => {
    const discoveredWeapons = gameState.discoveredBaseWeapons || [];
    const discoveredArmor = gameState.discoveredBaseArmor || [];
    const discoveredAnomalies = gameState.discoveredBaseAnomalies || [];

    // Categorize armor by slot
    const armorBySlot = {
      head: allArmorIds.filter(id => ARMOR[id].slot === 'head'),
      chest: allArmorIds.filter(id => ARMOR[id].slot === 'chest'),
      accessory: allArmorIds.filter(id => ARMOR[id].slot === 'accessory')
    };

    const renderEquipmentItem = (equipmentId, equipmentData, isDiscovered, category) => {
      const entry = JOURNAL_ENTRIES.equipment[equipmentId];

      // Check if equipped
      let isEquipped = false;
      if (category === 'weapon') {
        isEquipped = gameState.equippedWeapon === equipmentId;
      } else if (category === 'armor') {
        isEquipped = Object.values(gameState.equippedArmor || {}).includes(equipmentId);
      } else if (category === 'anomaly') {
        isEquipped = (gameState.equippedAnomalies || []).includes(equipmentId);
      }

      if (!isDiscovered) {
        return (
          <div
            key={equipmentId}
            style={{
              marginBottom: '15px',
              padding: '12px',
              border: '1px dashed var(--border-color)',
              opacity: 0.3
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>??? UNKNOWN</div>
            <div style={{ fontSize: '11px', marginTop: '5px', fontStyle: 'italic' }}>
              Not yet discovered
            </div>
          </div>
        );
      }

      const rarityColor = equipmentData.rarity?.color || '#888888';

      return (
        <div
          key={equipmentId}
          style={{
            marginBottom: '15px',
            padding: '12px',
            border: `1px solid ${rarityColor}`,
            backgroundColor: isEquipped ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            boxShadow: isEquipped ? `0 0 10px ${rarityColor}40` : 'none'
          }}
        >
          {/* Name and rarity */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: rarityColor }}>
              {equipmentData.name}
              {isEquipped && <span style={{ marginLeft: '8px', fontSize: '11px' }}>[EQUIPPED]</span>}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>
              {equipmentData.rarity?.name}
            </div>
          </div>

          {/* Category */}
          <div style={{ fontSize: '11px', opacity: 0.7, fontStyle: 'italic', marginBottom: '8px' }}>
            {entry?.category}
          </div>

          {/* ASCII art */}
          {equipmentData.ascii && (
            <pre style={{
              fontSize: '9px',
              margin: '8px 0',
              padding: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}>
              {equipmentData.ascii}
            </pre>
          )}

          {/* Stats */}
          <div style={{ fontSize: '11px', marginBottom: '8px' }}>
            {equipmentData.damage && <div>⚔️ Damage: {equipmentData.damage}</div>}
            {equipmentData.defense !== undefined && equipmentData.defense > 0 && <div>🛡️ Defense: {equipmentData.defense}</div>}
            {equipmentData.critChance && <div>💥 Crit Chance: {(equipmentData.critChance * 100).toFixed(0)}%</div>}
            {equipmentData.effect && <div>✨ Effect: {equipmentData.effect.replace('_', ' ')}</div>}
            {equipmentData.specialEffect && <div>✨ Special: {equipmentData.specialEffect.replace('_', ' ')}</div>}
          </div>

          {/* Lore */}
          <div style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '8px', borderTop: '1px dotted var(--border-color)', paddingTop: '8px' }}>
            {entry?.lore}
          </div>

          {/* Discovery note */}
          <div style={{ fontSize: '10px', fontStyle: 'italic', opacity: 0.7 }}>
            {entry?.discoveryNote}
          </div>
        </div>
      );
    };

    return (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
          ⚔️ DISCOVERED EQUIPMENT ({discoveredWeapons.length + discoveredArmor.length + discoveredAnomalies.length}/{allWeaponIds.length + allArmorIds.length + allAnomalyIds.length})
        </h3>

        {/* Weapons */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
            WEAPONS ({discoveredWeapons.length}/{allWeaponIds.length})
          </h4>
          {allWeaponIds.map(weaponId =>
            renderEquipmentItem(
              weaponId,
              WEAPONS[weaponId],
              discoveredWeapons.includes(weaponId),
              'weapon'
            )
          )}
        </div>

        {/* Armor */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
            ARMOR ({discoveredArmor.length}/{allArmorIds.length})
          </h4>

          {/* Head armor */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Head Slot</div>
            {armorBySlot.head.map(armorId =>
              renderEquipmentItem(
                armorId,
                ARMOR[armorId],
                discoveredArmor.includes(armorId),
                'armor'
              )
            )}
          </div>

          {/* Chest armor */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Chest Slot</div>
            {armorBySlot.chest.map(armorId =>
              renderEquipmentItem(
                armorId,
                ARMOR[armorId],
                discoveredArmor.includes(armorId),
                'armor'
              )
            )}
          </div>

          {/* Accessory armor */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.8 }}>Accessory Slot</div>
            {armorBySlot.accessory.map(armorId =>
              renderEquipmentItem(
                armorId,
                ARMOR[armorId],
                discoveredArmor.includes(armorId),
                'armor'
              )
            )}
          </div>
        </div>

        {/* Anomalies */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
            ANOMALIES ({discoveredAnomalies.length}/{allAnomalyIds.length})
          </h4>
          {allAnomalyIds.map(anomalyId =>
            renderEquipmentItem(
              anomalyId,
              ANOMALIES[anomalyId],
              discoveredAnomalies.includes(anomalyId),
              'anomaly'
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
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
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          border: '2px solid var(--border-color)',
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '2px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>📖 JOURNAL</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '5px 15px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '12px'
            }}
          >
            [ESC] CLOSE
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}>
          {[
            { id: 'locations', label: '📍 Locations' },
            { id: 'colleagues', label: '👥 Colleagues' },
            { id: 'equipment', label: '⚔️ Equipment' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onSwitchTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px',
                background: currentTab === tab.id ? 'var(--bg-color)' : 'transparent',
                border: 'none',
                borderRight: '1px solid var(--border-color)',
                color: currentTab === tab.id ? 'var(--text-color)' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px',
                fontWeight: currentTab === tab.id ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>
          {currentTab === 'locations' && renderLocationsTab()}
          {currentTab === 'colleagues' && renderColleaguesTab()}
          {currentTab === 'equipment' && renderEquipmentTab()}
        </div>
      </div>
    </div>
  );
}
