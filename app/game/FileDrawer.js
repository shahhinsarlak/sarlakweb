/**
 * File Drawer Component
 * (Added 2025-11-04)
 *
 * Inbox-like UI for managing stored documents
 * Documents can be consumed (apply effects), shredded (get paper back),
 * or marked as important
 */

'use client';

export default function FileDrawer({ gameState, onClose, actions }) {
  // Get and sort documents
  const getSortedDocuments = () => {
    const docs = gameState.storedDocuments || [];
    const sortBy = gameState.documentSortBy || 'newest';

    const qualityOrder = { perfect: 4, pristine: 3, standard: 2, corrupted: 1 };

    const sorted = [...docs].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'quality':
          return qualityOrder[b.quality] - qualityOrder[a.quality];
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return b.createdAt - a.createdAt;
      }
    });

    // Important docs first
    return sorted.sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
  };

  const documents = getSortedDocuments();

  // Quality icons
  const qualityIcons = {
    corrupted: '💀',
    standard: '📄',
    pristine: '✨',
    perfect: '⭐'
  };

  // Document type icons
  const typeIcons = {
    memo: '📝',
    report: '📊',
    contract: '📜',
    prophecy: '🔮'
  };

  // Quality colors
  const qualityColors = {
    corrupted: '#888',
    standard: 'var(--text-color)',
    pristine: '#4a9eff',
    perfect: '#ffaa00'
  };

  // Calculate paper return for shredding
  const calculatePaperReturn = (doc) => {
    const qualityMultipliers = {
      corrupted: 0.1,
      standard: 0.3,
      pristine: 0.5,
      perfect: 0.7
    };

    const tierCosts = [0, 5, 10, 20, 35, 50];
    const basePaperCost = tierCosts[doc.tier] || 5;
    return Math.floor(basePaperCost * qualityMultipliers[doc.quality]);
  };

  return (
    <div style={{
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
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        border: '2px solid var(--border-color)',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--hover-color)'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' }}>
              📂 FILE DRAWER
            </div>
            <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
              {documents.length} document{documents.length !== 1 ? 's' : ''} stored
            </div>
          </div>
          <button
            onClick={onClose}
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
            CLOSE
          </button>
        </div>

        {/* Toolbar */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--hover-color)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '10px', opacity: 0.7 }}>SORT BY:</span>
          {['newest', 'oldest', 'quality', 'type'].map(sort => (
            <button
              key={sort}
              onClick={() => actions.sortDocuments(sort)}
              style={{
                background: gameState.documentSortBy === sort ? 'var(--accent-color)' : 'none',
                border: '1px solid var(--border-color)',
                color: gameState.documentSortBy === sort ? 'var(--bg-color)' : 'var(--text-color)',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '9px',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {sort}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', opacity: 0.7 }}>BULK:</span>
            <button
              onClick={() => actions.shredAllNonStarred()}
              style={{
                background: 'none',
                border: '1px solid #ff6b6b',
                color: '#ff6b6b',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '9px',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 'bold'
              }}
              title="Shred all documents that are not marked as important"
            >
              SHRED ALL NON-STARRED
            </button>
          </div>
        </div>

        {/* Document List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px'
        }}>
          {documents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              fontSize: '12px',
              opacity: 0.5
            }}>
              No documents in drawer. Print documents to store them here.
            </div>
          ) : (
            documents.map(doc => {
              const icon = qualityIcons[doc.quality];
              const typeIcon = typeIcons[doc.type];
              const color = qualityColors[doc.quality];
              const paperReturn = calculatePaperReturn(doc);
              const timeSince = Math.floor((Date.now() - doc.createdAt) / 1000 / 60);
              const timeDisplay = timeSince < 60
                ? `${timeSince}m ago`
                : `${Math.floor(timeSince / 60)}h ago`;

              return (
                <div
                  key={doc.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    marginBottom: '4px',
                    backgroundColor: 'var(--hover-color)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    gap: '12px',
                    fontSize: '11px'
                  }}
                >
                  {/* Important Star */}
                  <button
                    onClick={() => actions.toggleDocumentImportant(doc.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0',
                      opacity: doc.important ? 1 : 0.3
                    }}
                    title={doc.important ? 'Remove important flag' : 'Mark as important'}
                  >
                    {doc.important ? '⭐' : '☆'}
                  </button>

                  {/* Type Icon */}
                  <div style={{ fontSize: '14px' }}>
                    {typeIcon}
                  </div>

                  {/* Document Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: color
                    }}>
                      {icon} {doc.tierName} [{doc.quality.toUpperCase()}]
                    </div>
                    <div style={{
                      fontSize: '9px',
                      opacity: 0.6,
                      marginTop: '2px'
                    }}>
                      {doc.outcome.desc} • {timeDisplay}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => actions.consumeDocument(doc.id)}
                      style={{
                        background: 'var(--accent-color)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--bg-color)',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '9px',
                        fontFamily: 'inherit',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap'
                      }}
                      title="Apply document effects"
                    >
                      CONSUME
                    </button>
                    <button
                      onClick={() => actions.shredDocument(doc.id)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-color)',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '9px',
                        fontFamily: 'inherit',
                        letterSpacing: '0.5px',
                        opacity: 0.7,
                        whiteSpace: 'nowrap'
                      }}
                      title={`Shred for ${paperReturn} paper`}
                    >
                      SHRED (+{paperReturn}p)
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--hover-color)',
          fontSize: '9px',
          opacity: 0.6,
          lineHeight: '1.5'
        }}>
          💡 CONSUME documents to apply their effects. SHRED to recover paper based on quality.
          Star important documents to protect them from bulk shredding.
        </div>
      </div>
    </div>
  );
}
