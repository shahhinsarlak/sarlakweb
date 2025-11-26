'use client';
import NotificationPopup from './NotificationPopup';

/**
 * Archive Modal Component
 *
 * Displays archive items as an ASCII bookshelf where each book
 * can be clicked to examine its contents. Replaces the simple
 * list view with an immersive library interface.
 *
 * @param {Array} items - Archive items from LOCATIONS.archive.items
 * @param {Function} onClose - Callback to close the archive modal
 * @param {Function} onExamineItem - Callback when a book is clicked
 * @param {Array} notifications - Array of notification objects
 * @param {Function} onDismissNotification - Callback for dismissing notifications
 * @param {number} examinedCount - Number of items already examined
 */
export default function ArchiveModal({
  items,
  onClose,
  onExamineItem,
  notifications,
  onDismissNotification,
  examinedCount
}) {
  // Create book representations for each archive item
  const createBook = (item, index, examined) => {
    const colors = [
      '#8B4513', // Brown
      '#654321', // Dark brown
      '#A0522D', // Sienna
      '#8B7355', // Burlywood
      '#704214', // Sepia
      '#654321', // Dark brown
      '#483C32'  // Taupe
    ];

    const bookColor = colors[index % colors.length];
    const isExamined = examined;

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
          margin: '0 4px',
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Book spine */}
        <div style={{
          width: '80px',
          height: '220px',
          backgroundColor: bookColor,
          border: '2px solid var(--border-color)',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          boxShadow: isExamined ? '0 0 10px rgba(255, 255, 255, 0.2)' : 'none',
          opacity: isExamined ? 1 : 0.7,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Book title (vertical text) */}
          <div style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: '10px',
            color: 'var(--bg-color)',
            fontWeight: 'bold',
            letterSpacing: '1px',
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            textTransform: 'uppercase'
          }}>
            {item.name}
          </div>

          {/* Book decorative lines */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '5px',
            right: '5px',
            height: '2px',
            backgroundColor: 'rgba(255,255,255,0.3)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '5px',
            right: '5px',
            height: '2px',
            backgroundColor: 'rgba(255,255,255,0.3)'
          }} />

          {/* Examined indicator */}
          {isExamined && (
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-color)',
              border: '1px solid var(--bg-color)'
            }} />
          )}
        </div>
      </button>
    );
  };

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
          padding: '60px 40px',
          minHeight: '100vh'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '4px',
              marginBottom: '16px',
              color: 'var(--text-color)'
            }}>
              ╔═══════════════════════════════════════╗
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              letterSpacing: '3px',
              marginBottom: '8px'
            }}>
              THE ARCHIVE
            </div>
            <div style={{
              fontSize: '12px',
              opacity: 0.6,
              letterSpacing: '2px',
              marginBottom: '16px'
            }}>
              FILES THAT SHOULD NOT EXIST
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '4px',
              color: 'var(--text-color)'
            }}>
              ╚═══════════════════════════════════════╝
            </div>
            <div style={{
              fontSize: '11px',
              opacity: 0.5,
              marginTop: '24px',
              letterSpacing: '1px'
            }}>
              EXAMINED: {examinedCount} / {items.length}
            </div>
          </div>

          {/* ASCII Bookshelf */}
          <div style={{
            border: '2px solid var(--border-color)',
            padding: '32px',
            backgroundColor: 'var(--hover-color)',
            position: 'relative'
          }}>
            {/* Top of bookshelf */}
            <div style={{
              fontSize: '14px',
              lineHeight: '1',
              marginBottom: '16px',
              opacity: 0.8,
              fontFamily: 'monospace',
              whiteSpace: 'pre'
            }}>
              {'┌────────────────────────────────────────────────────────────────────────────┐'}
            </div>

            {/* First shelf - Top row (4 books) */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              marginBottom: '32px',
              padding: '0 20px',
              borderBottom: '3px solid var(--border-color)',
              paddingBottom: '8px'
            }}>
              {items.slice(0, 4).map((item, index) =>
                createBook(item, index, index < examinedCount)
              )}
            </div>

            {/* Middle divider */}
            <div style={{
              fontSize: '14px',
              lineHeight: '1',
              margin: '24px 0',
              opacity: 0.6,
              fontFamily: 'monospace',
              whiteSpace: 'pre'
            }}>
              {'├────────────────────────────────────────────────────────────────────────────┤'}
            </div>

            {/* Second shelf - Bottom row (3 books) */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              marginBottom: '16px',
              padding: '0 20px',
              borderBottom: '3px solid var(--border-color)',
              paddingBottom: '8px'
            }}>
              {items.slice(4, 7).map((item, index) =>
                createBook(item, index + 4, (index + 4) < examinedCount)
              )}
            </div>

            {/* Bottom of bookshelf */}
            <div style={{
              fontSize: '14px',
              lineHeight: '1',
              marginTop: '16px',
              opacity: 0.8,
              fontFamily: 'monospace',
              whiteSpace: 'pre'
            }}>
              {'└────────────────────────────────────────────────────────────────────────────┘'}
            </div>
          </div>

          {/* Instructions */}
          <div style={{
            textAlign: 'center',
            marginTop: '40px',
            fontSize: '12px',
            opacity: 0.6,
            letterSpacing: '1px',
            lineHeight: '1.8'
          }}>
            <div>Click a book to read its contents</div>
            <div style={{ fontSize: '10px', marginTop: '8px' }}>
              Examined books glow with a faint light
            </div>
          </div>

          {/* Close button */}
          <div style={{
            marginTop: '48px',
            textAlign: 'center'
          }}>
            <button
              onClick={onClose}
              style={{
                background: 'var(--accent-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--bg-color)',
                padding: '16px 48px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'inherit',
                letterSpacing: '2px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
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
