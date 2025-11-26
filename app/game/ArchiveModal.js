'use client';
import { useMemo, useEffect } from 'react';
import NotificationPopup from './NotificationPopup';

/**
 * Archive Modal Component
 *
 * Displays archive items as an ASCII bookshelf where each book
 * can be clicked to examine its contents. Books are displayed
 * on multiple shelves with visual indicators for examined status.
 *
 * @param {Array} items - Archive items from LOCATIONS.archive.items
 * @param {Function} onClose - Callback to close the archive modal
 * @param {Function} onExamineItem - Callback when a book is clicked
 * @param {Array} notifications - Array of notification objects
 * @param {Function} onDismissNotification - Callback for dismissing notifications
 * @param {number} examinedCount - Number of items already examined
 * @param {Array} examinedItems - Array of item IDs that have been examined
 */
export default function ArchiveModal({
  items,
  onClose,
  onExamineItem,
  notifications,
  onDismissNotification,
  examinedCount,
  examinedItems = []
}) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  // Create book representations for each archive item
  const createBook = (item, index) => {
    const isExamined = examinedItems.includes(item.id);

    // Different colors for variety
    const colors = [
      '#6B4423', // Dark brown
      '#7B3F00', // Chocolate brown
      '#654321', // Dark brown 2
      '#8B4513', // Saddle brown
      '#A0522D', // Sienna
      '#704214', // Sepia
      '#5C4033', // Dark wood
      '#6F4E37', // Coffee brown
    ];

    const bookColor = colors[index % colors.length];

    return (
      <button
        key={item.id}
        onClick={() => onExamineItem(item)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0',
          margin: '0 2px',
          fontFamily: 'inherit',
          transition: 'all 0.3s ease',
          position: 'relative',
          width: '140px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Book */}
        <div style={{
          width: '100%',
          height: '180px',
          backgroundColor: bookColor,
          border: '2px solid var(--border-color)',
          borderRadius: '3px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 8px',
          boxShadow: isExamined
            ? '0 0 20px 4px rgba(255, 215, 0, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.3)'
            : '2px 2px 8px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden',
          background: isExamined
            ? `linear-gradient(135deg, ${bookColor} 0%, ${bookColor}dd 100%)`
            : bookColor
        }}>
          {/* Book title (horizontal, more readable) */}
          <div style={{
            fontSize: '11px',
            color: 'var(--bg-color)',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            textAlign: 'center',
            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
            lineHeight: '1.3',
            wordBreak: 'break-word',
            maxWidth: '100%',
            zIndex: 2
          }}>
            {isExamined ? item.name : '???'}
          </div>

          {/* Decorative book spine lines */}
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            zIndex: 1
          }} />
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            zIndex: 1
          }} />

          {/* Examined indicator - glowing badge */}
          {isExamined && (
            <div style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#FFD700',
              border: '2px solid var(--bg-color)',
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
              zIndex: 3
            }} />
          )}

          {/* Energy cost indicator for unexamined books */}
          {!isExamined && (
            <div style={{
              position: 'absolute',
              bottom: '6px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '9px',
              color: 'var(--bg-color)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              zIndex: 3
            }}>
              25 ENERGY
            </div>
          )}

          {/* Glow overlay for examined books */}
          {isExamined && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(255,215,0,0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 1
            }} />
          )}
        </div>
      </button>
    );
  };

  // Shuffle items for random positions (stable during component lifetime)
  const shuffledItems = useMemo(() => {
    const itemsCopy = [...items];
    // Fisher-Yates shuffle algorithm
    for (let i = itemsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [itemsCopy[i], itemsCopy[j]] = [itemsCopy[j], itemsCopy[i]];
    }
    return itemsCopy;
  }, [items]);

  // Split shuffled items into rows of 6
  const rows = [];
  for (let i = 0; i < shuffledItems.length; i += 6) {
    rows.push(shuffledItems.slice(i, i + 6));
  }

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
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px',
          minHeight: '100vh'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              letterSpacing: '4px',
              marginBottom: '16px',
              color: 'var(--text-color)'
            }}>
              ═══════════════════════════════════════
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '4px',
              marginBottom: '8px'
            }}>
              THE ARCHIVE
            </div>
            <div style={{
              fontSize: '11px',
              opacity: 0.6,
              letterSpacing: '2px',
              marginBottom: '16px'
            }}>
              FILES FROM EMPLOYEES WHO NEVER WERE
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              letterSpacing: '4px',
              color: 'var(--text-color)'
            }}>
              ═══════════════════════════════════════
            </div>
            <div style={{
              fontSize: '12px',
              opacity: 0.7,
              marginTop: '20px',
              letterSpacing: '1px'
            }}>
              EXAMINED: {examinedItems.length} / {items.length}
            </div>
            <div style={{
              fontSize: '10px',
              opacity: 0.5,
              marginTop: '8px',
              fontStyle: 'italic'
            }}>
              Examined books glow with golden light
            </div>
          </div>

          {/* Bookshelf */}
          <div style={{
            border: '3px solid var(--border-color)',
            padding: '32px 24px',
            backgroundColor: 'var(--hover-color)',
            position: 'relative'
          }}>
            {/* Top of bookshelf */}
            <div style={{
              fontSize: '14px',
              lineHeight: '1',
              marginBottom: '20px',
              opacity: 0.8,
              fontFamily: 'monospace',
              whiteSpace: 'pre',
              overflow: 'hidden'
            }}>
              {'┌' + '─'.repeat(110) + '┐'}
            </div>

            {/* Render all rows */}
            {rows.map((row, rowIndex) => (
              <div key={rowIndex}>
                {/* Books row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  marginBottom: '20px',
                  padding: '0 10px',
                  borderBottom: '3px solid var(--border-color)',
                  paddingBottom: '12px',
                  minHeight: '200px'
                }}>
                  {row.map((item, index) =>
                    createBook(item, rowIndex * 6 + index)
                  )}
                </div>

                {/* Shelf divider (except after last row) */}
                {rowIndex < rows.length - 1 && (
                  <div style={{
                    fontSize: '14px',
                    lineHeight: '1',
                    margin: '16px 0',
                    opacity: 0.6,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre',
                    overflow: 'hidden'
                  }}>
                    {'├' + '─'.repeat(110) + '┤'}
                  </div>
                )}
              </div>
            ))}

            {/* Bottom of bookshelf */}
            <div style={{
              fontSize: '14px',
              lineHeight: '1',
              marginTop: '20px',
              opacity: 0.8,
              fontFamily: 'monospace',
              whiteSpace: 'pre',
              overflow: 'hidden'
            }}>
              {'└' + '─'.repeat(110) + '┘'}
            </div>
          </div>

          {/* Instructions */}
          <div style={{
            textAlign: 'center',
            marginTop: '32px',
            fontSize: '11px',
            opacity: 0.6,
            letterSpacing: '1px',
            lineHeight: '2'
          }}>
            <div>Click a book to examine its contents</div>
            <div>First examination costs 25 energy • Re-reading is free</div>
            <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.5 }}>
              Most books are encrypted and unreadable
            </div>
          </div>

          {/* Close button */}
          <div style={{
            marginTop: '40px',
            textAlign: 'center'
          }}>
            <button
              onClick={onClose}
              style={{
                background: 'var(--accent-color)',
                border: '2px solid var(--border-color)',
                color: 'var(--bg-color)',
                padding: '16px 64px',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'inherit',
                letterSpacing: '2px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              LEAVE THE ARCHIVE
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
