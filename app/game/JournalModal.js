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
import { JOURNAL_ENTRIES, LOCATIONS, MECHANICS_ENTRIES } from './constants';
import NotificationPopup from './NotificationPopup';

export default function JournalModal({ gameState, onClose, onSwitchTab, notifications, onDismissNotification }) {
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

  // Render location tab
  const renderLocationsTab = () => {
    return (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>
          DISCOVERED LOCATIONS ({gameState.discoveredLocations?.length || 0}/{allLocationIds.length})
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
                &ldquo;{entry?.notes}&rdquo;
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render mechanics tab
  const renderMechanicsTab = () => {
    const discoveredMechanics = gameState.discoveredMechanics || [];
    const allMechanicIds = Object.keys(MECHANICS_ENTRIES);

    // Group by category
    const categories = {};
    allMechanicIds.forEach(mechanicId => {
      const mechanic = MECHANICS_ENTRIES[mechanicId];
      if (!categories[mechanic.category]) {
        categories[mechanic.category] = [];
      }
      categories[mechanic.category].push({ ...mechanic, id: mechanicId });
    });

    return (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>
          LEARNED MECHANICS ({discoveredMechanics.length}/{allMechanicIds.length})
        </h3>

        {Object.keys(categories).map(categoryName => (
          <div key={categoryName} style={{ marginBottom: '30px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px', opacity: 0.9 }}>
              {categoryName}
            </h4>

            {categories[categoryName].map(mechanic => {
              const isDiscovered = discoveredMechanics.includes(mechanic.id);

              if (!isDiscovered) {
                return (
                  <div
                    key={mechanic.id}
                    style={{
                      marginBottom: '15px',
                      padding: '12px',
                      border: '1px dashed var(--border-color)',
                      opacity: 0.3
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>??? UNDISCOVERED</div>
                    <div style={{ fontSize: '11px', marginTop: '5px', fontStyle: 'italic' }}>
                      Learn by experiencing this mechanic
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={mechanic.id}
                  style={{
                    marginBottom: '15px',
                    padding: '15px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
                    {mechanic.title}
                  </div>

                  <div style={{ fontSize: '11px', fontStyle: 'italic', opacity: 0.7, marginBottom: '10px' }}>
                    {mechanic.summary}
                  </div>

                  <div style={{ fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {mechanic.details}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
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
          <h2 style={{ margin: 0, fontSize: '18px' }}>JOURNAL</h2>
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
            { id: 'locations', label: 'Locations' },
            { id: 'mechanics', label: 'Mechanics' }
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
          {currentTab === 'mechanics' && renderMechanicsTab()}
        </div>
      </div>
    </div>

    {/* Notification Popup System */}
    <NotificationPopup
      notifications={notifications}
      onDismiss={onDismissNotification}
    />
    </>
  );
}
