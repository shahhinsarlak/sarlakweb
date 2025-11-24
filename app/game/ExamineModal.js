'use client';
import { useState } from 'react';
import { ARCHIVE_CASES } from './constants';
import NotificationPopup from './NotificationPopup';

export default function ExamineModal({ item, closeExamine, notifications, onDismissNotification, gameState, setGameState, actions }) {
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchInput, setSearchInput] = useState(gameState?.archiveSearchQuery || '');

  const handleSearch = () => {
    const caseNum = parseInt(searchInput);
    if (!isNaN(caseNum)) {
      actions.unlockCase(caseNum);
      // If case exists, show it
      if (ARCHIVE_CASES[caseNum]) {
        setTimeout(() => {
          setSelectedCase(ARCHIVE_CASES[caseNum]);
        }, 100);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // If examining a regular archive item (not a case)
  if (item) {
    return (
      <>
        <div style={{
          fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--bg-color)',
          zIndex: 1000,
          overflow: 'auto'
        }}>
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            padding: '60px 40px',
            fontSize: '14px'
          }}>
            <div style={{
              border: '1px solid var(--border-color)',
              padding: '32px',
              backgroundColor: 'var(--hover-color)'
            }}>
              <div style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.6,
                marginBottom: '20px'
              }}>
                EXAMINING: {item.name}
              </div>
              <div style={{
                fontSize: '15px',
                lineHeight: '1.8',
                marginBottom: '32px'
              }}>
                {item.story}
              </div>
              <button
                onClick={closeExamine}
                style={{
                  background: 'var(--accent-color)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--bg-color)',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  letterSpacing: '0.5px',
                  width: '100%'
                }}
              >
                CLOSE
              </button>
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

  // Archive search mode
  return (
    <>
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-color)',
        zIndex: 1000,
        overflow: 'auto'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '40px 30px',
          fontSize: '14px'
        }}>
          {/* Header */}
          <div style={{
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '20px',
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
                THE ARCHIVE
              </div>
              <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.5 }}>
                Files from employees who never were
              </div>
            </div>
            <button
              onClick={closeExamine}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'inherit',
                letterSpacing: '0.5px'
              }}
            >
              EXIT
            </button>
          </div>

          {/* Search Bar */}
          <div style={{
            border: '1px solid var(--border-color)',
            padding: '24px',
            marginBottom: '30px',
            backgroundColor: 'var(--hover-color)'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
              CASE NUMBER SEARCH
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter case number..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
                  fontSize: '14px',
                  letterSpacing: '0.5px'
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: '12px 32px',
                  backgroundColor: 'var(--accent-color)',
                  color: 'var(--bg-color)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px'
                }}
              >
                SEARCH
              </button>
            </div>
            <div style={{ fontSize: '9px', opacity: 0.5, marginTop: '12px', fontStyle: 'italic' }}>
              Case numbers can be discovered throughout the office
            </div>
          </div>

          {/* Case Display or Unlocked Cases List */}
          {selectedCase ? (
            // Display selected case
            <div style={{
              border: '1px solid var(--border-color)',
              padding: '32px',
              backgroundColor: 'var(--hover-color)',
              marginBottom: '30px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '1px', marginBottom: '8px' }}>
                    CASE #{selectedCase.id}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {selectedCase.title}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    opacity: 0.7,
                    letterSpacing: '0.5px',
                    color: selectedCase.classification.includes('SECRET') ? '#ff0000' : 'var(--text-color)'
                  }}>
                    {selectedCase.classification}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontFamily: 'inherit'
                  }}
                >
                  BACK
                </button>
              </div>
              <div style={{
                fontSize: '13px',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                fontFamily: "'Courier New', monospace",
                backgroundColor: 'var(--bg-color)',
                padding: '20px',
                border: '1px solid var(--border-color)',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {selectedCase.content}
              </div>
            </div>
          ) : null}
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
