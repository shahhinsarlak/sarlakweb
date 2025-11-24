'use client';
import { useState, useEffect } from 'react';
import { DOCUMENT_TYPES, TIER_MASTERY_WEIGHTS } from './constants';
import {
  calculatePaperQuality,
  canPrintDocument,
  getSanityTier,
  getUnlockedTiers,
  getTierProgress,
  canPrintDocumentTier,
  getTierData
} from './sanityPaperHelpers';
import NotificationPopup from './NotificationPopup';

export default function PrinterRoom({ gameState, setGameState, onExit, grantXP, actions, notifications, onDismissNotification }) {
  const [printing, setPrinting] = useState(false);
  const [printedPapers, setPrintedPapers] = useState([]);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [selectedDocType, setSelectedDocType] = useState('memo');
  const [selectedTier, setSelectedTier] = useState(1);

  // Printing animation effect
  useEffect(() => {
    if (!printing) return;

    const timer = setTimeout(() => {
      setPrinting(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [printing]);

  // Continuous animation for printer
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 4);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handlePrint = () => {
    if (gameState.energy < 3) {
      return;
    }

    setPrinting(true);

    // Calculate gains
    const basePaperGain = gameState.paperPerPrint || 1;
    const ppGain = gameState.printerUpgrades?.reality_printer ? 5 : 0;
    const quality = gameState.printerQuality || 0;

    // Generate distorted paper
    const paper = generateDistortedPaper(quality);
    setPrintedPapers(prev => [paper, ...prev.slice(0, 4)]);

    // Update game state
    setGameState(prev => ({
      ...prev,
      paper: prev.paper + basePaperGain,
      pp: prev.pp + ppGain,
      energy: Math.max(0, prev.energy - 3),
      printCount: (prev.printCount || 0) + 1
    }));

    grantXP(2);
  };

  const generateDistortedPaper = (quality) => {
    const lines = [];
    const numLines = 8;

    for (let i = 0; i < numLines; i++) {
      let line = '';
      const lineLength = Math.floor(Math.random() * 20) + 30;

      for (let j = 0; j < lineLength; j++) {
        if (quality < 20) {
          // Very distorted
          const chars = '▓▒░█▀▄│─┼╬═║╗╔╚╝';
          line += chars[Math.floor(Math.random() * chars.length)];
        } else if (quality < 50) {
          // Moderately distorted
          const chars = '█▓▒░/\\|-_=+~';
          line += chars[Math.floor(Math.random() * chars.length)];
        } else if (quality < 80) {
          // Slightly distorted
          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789 ';
          line += chars[Math.floor(Math.random() * chars.length)];
        } else {
          // Clean text
          const chars = 'PRODUCTIVITY REPORT ';
          line += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      lines.push(line);
    }

    return lines;
  };

  const getPrinterASCII = () => {
    const quality = gameState.printerQuality || 0;

    if (quality < 20) {
      // Broken/glitched printer
      if (animationFrame === 0 || animationFrame === 2) {
        return `
    ┌─────────────────────┐
    │ P̷R̷I̷N̷T̷E̷R̷  [${printing ? '█████' : '░░░░░'}] │
    │  ╔═══════════════╗  │
    │  ║ ▓▒░█ ERROR ▓▒░║  │
    │  ║ ░▒▓█ ▓▒░█ ░▒▓ ║  │
    │  ║ ████ ▓▒░█ ░▒▓ ║  │
    │  ╚═══════════════╝  │
    │   ║║║  ║║║  ║║║     │
    │   ▼▼▼  ▼▼▼  ▼▼▼     │
${printing ? '    │  ░▒▓█▓▒░▓█░▒▓█░▒   │' : '    │                     │'}
${printing ? '    │  ▓░█▒▓░█▒░▓█▒░▓   │' : '    │                     │'}
    └─────────────────────┘`;
      } else {
        return `
    ┌─────────────────────┐
    │ P̸R̸I̸N̸T̸E̸R̸  [${printing ? '█████' : '░░░░░'}] │
    │  ╔═══════════════╗  │
    │  ║ █▓▒░ ERROR ▓░▒║  │
    │  ║ ▓▒░█ ▓░▒█ ▓▒░ ║  │
    │  ║ ▒░▓█ ░▓▒█ ▒░▓ ║  │
    │  ╚═══════════════╝  │
    │   ║║║  ║║║  ║║║     │
    │   ▼▼▼  ▼▼▼  ▼▼▼     │
${printing ? '    │  ▒░▓█░▒▓░█▒░▓█▒░   │' : '    │                     │'}
${printing ? '    │  █░▒▓█░▒░▓█▒░▓█   │' : '    │                     │'}
    └─────────────────────┘`;
      }
    } else if (quality < 50) {
      // Partially working printer
      return `
    ┌─────────────────────┐
    │ PRINTER   [${printing ? '█████' : '░░░░░'}] │
    │  ╔═══════════════╗  │
    │  ║ ████████████  ║  │
    │  ║ ████████████  ║  │
    │  ║ ██░░░░██████  ║  │
    │  ╚═══════════════╝  │
    │   ║║║  ║║║  ║║║     │
    │   ▼▼▼  ▼▼▼  ▼▼▼     │
${printing ? '    │  ═══════════════   │' : '    │                     │'}
${printing ? '    │  ───────────────   │' : '    │                     │'}
    └─────────────────────┘`;
    } else if (quality < 80) {
      // Good quality printer
      return `
    ┌─────────────────────┐
    │ PRINTER   [${printing ? '█████' : '░░░░░'}] │
    │  ╔═══════════════╗  │
    │  ║ ▓▓▓▓▓▓▓▓▓▓▓▓  ║  │
    │  ║ ▓▓▓▓▓▓▓▓▓▓▓▓  ║  │
    │  ║ ▓▓▓▓▓▓▓▓▓▓▓▓  ║  │
    │  ╚═══════════════╝  │
    │   ║║║  ║║║  ║║║     │
    │   ▼▼▼  ▼▼▼  ▼▼▼     │
${printing ? '    │  ══════════════════ │' : '    │                     │'}
${printing ? '    │  ────────────────── │' : '    │                     │'}
    └─────────────────────┘`;
    } else {
      // Perfect printer
      return `
    ┌─────────────────────┐
    │ PRINTER ✓ [${printing ? '█████' : '░░░░░'}] │
    │  ╔═══════════════╗  │
    │  ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓ ║  │
    │  ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓ ║  │
    │  ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓ ║  │
    │  ╚═══════════════╝  │
    │   ║║║  ║║║  ║║║     │
    │   ▼▼▼  ▼▼▼  ▼▼▼     │
${printing ? '    │  ═══════════════════ │' : '    │                     │'}
${printing ? '    │  ─────────────────── │' : '    │                     │'}
    └─────────────────────┘`;
    }
  };

  return (
    <>
    <div style={{
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      padding: '40px 60px',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)'
    }}>
      <div style={{
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '20px',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
            PRINTER ROOM
          </div>
          <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.5 }}>
            {gameState.printerQuality < 20 && 'The machines scream. Reality bleeds through the paper.'}
            {gameState.printerQuality >= 20 && gameState.printerQuality < 50 && 'The printer hums. Some clarity returns.'}
            {gameState.printerQuality >= 50 && gameState.printerQuality < 80 && 'Professional quality output. Each page identical.'}
            {gameState.printerQuality >= 80 && 'Perfect precision. The text is too perfect. Forever.'}
          </div>
        </div>
        <button
          onClick={onExit}
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: '60fr 40fr',
        gap: '40px'
      }}>
        {/* Left Column - Printer & Document System */}
        <div>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.6,
            marginBottom: '20px'
          }}>
            THE PRINTER
          </div>

          <div style={{
            border: '1px solid var(--border-color)',
            padding: '30px',
            backgroundColor: 'var(--hover-color)',
            marginBottom: '30px'
          }}>
            <pre style={{
              fontSize: '11px',
              lineHeight: '1.3',
              margin: 0,
              fontFamily: 'inherit',
              whiteSpace: 'pre',
              textAlign: 'center',
              filter: gameState.printerQuality < 20 ? 'blur(0.5px)' : 'none',
              transform: gameState.printerQuality < 20 ? 'skew(-0.5deg)' : 'none'
            }}>
              {getPrinterASCII()}
            </pre>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '30px'
          }}>
            <button
              onClick={handlePrint}
              disabled={gameState.energy < 3 || printing}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                padding: '20px 40px',
                cursor: gameState.energy >= 3 && !printing ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontFamily: 'inherit',
                letterSpacing: '0.5px',
                transition: 'all 0.2s',
                opacity: gameState.energy >= 3 && !printing ? 1 : 0.4
              }}
            >
              {printing ? 'PRINTING...' : 'PRINT PAPERS'}
              <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '6px' }}>
                [+{gameState.paperPerPrint || 1} PAPER, -3 ENERGY]
              </div>
            </button>
          </div>

          {/* Document System - Moved to left column for primary action focus */}
          <div style={{
            border: '1px solid var(--border-color)',
            padding: '20px',
            marginBottom: '30px',
            backgroundColor: 'var(--hover-color)'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
              DOCUMENT SYSTEM
            </div>

            {/* Paper Quality Display */}
            <div style={{ fontSize: '10px', marginBottom: '16px', padding: '10px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Paper Quality:</span>
                <span style={{ fontWeight: 'bold' }}>{calculatePaperQuality(gameState)}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginTop: '6px'
              }}>
                <div style={{
                  width: `${calculatePaperQuality(gameState)}%`,
                  height: '100%',
                  backgroundColor: 'var(--accent-color)',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            {/* Document Type Tabs */}
            <div style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '12px',
              borderBottom: '1px solid var(--border-color)',
              flexWrap: 'wrap'
            }}>
              {Object.entries(DOCUMENT_TYPES)
                .filter(([id]) => {
                  // Hide contracts until portal is unlocked
                  if (id === 'contract' && !gameState.portalUnlocked) return false;
                  // Hide prophecy entirely (removed from game)
                  if (id === 'prophecy') return false;
                  return true;
                })
                .map(([id, data]) => {
                const progress = getTierProgress(id, gameState);
                const isSelected = selectedDocType === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedDocType(id);
                      setSelectedTier(1); // Reset to tier 1 when changing doc type
                    }}
                    style={{
                      flex: '1 1 auto',
                      minWidth: '60px',
                      background: isSelected ? 'var(--accent-color)' : 'none',
                      border: 'none',
                      borderBottom: isSelected ? '2px solid var(--accent-color)' : '2px solid transparent',
                      color: isSelected ? 'var(--bg-color)' : 'var(--text-color)',
                      padding: '8px 6px',
                      cursor: 'pointer',
                      fontSize: '9px',
                      fontFamily: 'inherit',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      transition: 'all 0.2s',
                      opacity: isSelected ? 1 : 0.7
                    }}
                  >
                    <div>{data.name}</div>
                    <div style={{ fontSize: '8px', opacity: 0.8, marginTop: '2px' }}>({progress.current})</div>
                  </button>
                );
              })}
            </div>

            {/* Tier Buttons */}
            {(() => {
              const docData = DOCUMENT_TYPES[selectedDocType];
              const unlockedTiers = getUnlockedTiers(selectedDocType, gameState);
              const progress = getTierProgress(selectedDocType, gameState);

              return (
                <>
                  {/* Mastery Progress Bar */}
                  <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {docData.name} Mastery: Tier {unlockedTiers.length}/5
                    </div>
                    <div style={{ fontSize: '8px', opacity: 0.7, marginBottom: '4px' }}>
                      {progress.current} printed • {progress.nextTier ? `${progress.next - progress.current} more for Tier ${progress.nextTier}` : 'All tiers unlocked!'}
                    </div>
                    <div style={{ height: '4px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${progress.nextTier ? (progress.current / progress.next * 100) : 100}%`,
                        backgroundColor: 'var(--accent-color)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Tier Selection Buttons */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Select Tier:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                      {docData.tiers.map(tier => {
                        const isUnlocked = unlockedTiers.some(t => t.tier === tier.tier);
                        const isSelected = selectedTier === tier.tier;

                        if (!isUnlocked) {
                          return (
                            <button
                              key={tier.tier}
                              disabled
                              style={{
                                background: 'var(--bg-color)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-color)',
                                padding: '6px 4px',
                                fontSize: '8px',
                                fontFamily: 'inherit',
                                cursor: 'not-allowed',
                                opacity: 0.3,
                                textAlign: 'center'
                              }}
                            >
                              <div style={{ fontWeight: 'bold' }}>T{tier.tier}</div>
                              <div style={{ fontSize: '7px', marginTop: '2px' }}>LOCKED</div>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={tier.tier}
                            onClick={() => setSelectedTier(tier.tier)}
                            style={{
                              background: isSelected ? 'var(--accent-color)' : 'var(--bg-color)',
                              border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                              color: isSelected ? 'var(--bg-color)' : 'var(--text-color)',
                              padding: '6px 4px',
                              fontSize: '8px',
                              fontFamily: 'inherit',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'center',
                              fontWeight: isSelected ? 'bold' : 'normal'
                            }}
                          >
                            <div style={{ fontWeight: 'bold' }}>T{tier.tier}</div>
                            <div style={{ fontSize: '7px', marginTop: '2px', opacity: 0.8 }}>{tier.cost.paper}p</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Tier Details & Print Button */}
                  {(() => {
                    const selectedTierData = docData.tiers.find(t => t.tier === selectedTier);
                    const check = canPrintDocumentTier(selectedDocType, selectedTier, gameState);

                    if (!selectedTierData) return null;

                    return (
                      <>
                        {/* Selected Tier Info */}
                        <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>
                            Tier {selectedTier}: {selectedTierData.name}
                          </div>
                          <div style={{ fontSize: '9px', opacity: 0.7, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span>Cost: {selectedTierData.cost.paper} Paper</span>
                            {selectedTierData.cost.energy && <span>• {selectedTierData.cost.energy} Energy</span>}
                            {selectedTierData.cost.sanity && <span>• {selectedTierData.cost.sanity} Sanity</span>}
                          </div>
                          <div style={{ fontSize: '8px', opacity: 0.6, marginTop: '4px' }}>
                            +{TIER_MASTERY_WEIGHTS[selectedTier] || 1} Mastery Progress
                          </div>
                        </div>

                        {/* Print Button */}
                        <button
                          onClick={() => actions.printDocument(selectedDocType, selectedTier)}
                          disabled={!check.canPrint}
                          style={{
                            width: '100%',
                            background: check.canPrint ? 'var(--accent-color)' : 'none',
                            border: '1px solid var(--border-color)',
                            color: check.canPrint ? 'var(--bg-color)' : 'var(--text-color)',
                            padding: '12px',
                            cursor: check.canPrint ? 'pointer' : 'not-allowed',
                            fontSize: '10px',
                            fontFamily: 'inherit',
                            fontWeight: 'bold',
                            letterSpacing: '0.5px',
                            opacity: check.canPrint ? 1 : 0.5,
                            transition: 'all 0.2s'
                          }}
                        >
                          {check.canPrint ? `PRINT ${selectedTierData.name.toUpperCase()}` : check.reason}
                        </button>

                        {!check.canPrint && check.reason && (
                          <div style={{ fontSize: '8px', opacity: 0.6, marginTop: '6px', textAlign: 'center', fontStyle: 'italic' }}>
                            {check.reason}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              );
            })()}
          </div>

          {/* Printed Papers */}
          {printedPapers.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <div style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.6,
                marginBottom: '16px'
              }}>
                RECENT PRINTS
              </div>
              <div style={{
                border: '1px solid var(--border-color)',
                padding: '16px',
                backgroundColor: 'var(--hover-color)',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {printedPapers.map((paper, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '16px',
                      paddingBottom: '16px',
                      borderBottom: index < printedPapers.length - 1 ? '1px solid var(--border-color)' : 'none',
                      opacity: 1 - (index * 0.2)
                    }}
                  >
                    <div style={{ fontSize: '9px', opacity: 0.5, marginBottom: '8px' }}>
                      [PAGE {printedPapers.length - index}]
                    </div>
                    <pre style={{
                      fontSize: '8px',
                      lineHeight: '1.2',
                      margin: 0,
                      fontFamily: 'inherit',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all'
                    }}>
                      {paper.map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Stats & Info */}
        <div>
          <div style={{
            border: '1px solid var(--border-color)',
            padding: '24px',
            marginBottom: '30px',
            backgroundColor: 'var(--hover-color)'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '20px' }}>
              RESOURCES
            </div>
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span>PAPER</span>
                <strong style={{ fontSize: '18px' }}>{gameState.paper.toFixed(1)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span>PP</span>
                <strong style={{ fontSize: '18px' }}>{gameState.pp.toFixed(1)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span>ENERGY</span>
                <strong style={{ fontSize: '18px' }}>{gameState.energy.toFixed(1)}%</strong>
              </div>
            </div>
          </div>

          <div style={{
            border: '1px solid var(--border-color)',
            padding: '24px',
            marginBottom: '30px',
            backgroundColor: 'var(--hover-color)'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '20px' }}>
              PRINTER STATUS
            </div>
            <div style={{ fontSize: '12px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Quality</span>
                  <strong>{gameState.printerQuality || 0}%</strong>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${gameState.printerQuality || 0}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-color)',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <span>Paper/Print</span>
                <strong>{gameState.paperPerPrint || 1}</strong>
              </div>
              {gameState.paperPerSecond > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <span>Auto-Print</span>
                  <strong>+{gameState.paperPerSecond.toFixed(1)}/sec</strong>
                </div>
              )}
              {gameState.printerUpgrades?.reality_printer && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <span>PP Gain</span>
                  <strong>+5 PP/print</strong>
                </div>
              )}
            </div>
          </div>

          {/* Event Log - Moved to right column for consistency with main page */}
          <div style={{
            border: '1px solid var(--border-color)',
            padding: '16px',
            marginBottom: '30px',
            backgroundColor: 'var(--hover-color)'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>
              EVENT LOG
            </div>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {(gameState.recentMessages || []).slice(0, 15).map((msg, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: '10px',
                    padding: '6px 0',
                    borderBottom: index < 14 ? '1px dotted var(--border-color)' : 'none',
                    opacity: 1 - (index * 0.05),
                    lineHeight: '1.4'
                  }}
                >
                  {msg}
                </div>
              ))}
              {(!gameState.recentMessages || gameState.recentMessages.length === 0) && (
                <div style={{ fontSize: '10px', opacity: 0.5, fontStyle: 'italic' }}>
                  No recent events...
                </div>
              )}
            </div>
          </div>

          <div style={{
            padding: '16px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--hover-color)',
            fontSize: '10px',
            opacity: 0.7,
            lineHeight: '1.6'
          }}>
            <div style={{ marginBottom: '8px', fontWeight: '500' }}>NOTICE:</div>
            The printer operates at {gameState.printerQuality || 0}% quality.
            {gameState.printerQuality < 20 && ' Output may contain dimensional anomalies.'}
            {gameState.printerQuality >= 80 && ' Maximum precision achieved. Pages are identical to reality itself.'}
            <div style={{ marginTop: '12px', fontSize: '9px', opacity: 0.5 }}>
              Total prints: {gameState.printCount || 0}
            </div>
          </div>
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
