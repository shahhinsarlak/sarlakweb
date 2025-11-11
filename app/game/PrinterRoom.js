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

export default function PrinterRoom({ gameState, setGameState, onExit, grantXP, actions }) {
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
        {/* Left Column - Printer */}
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

          {/* Event Log - Moved under print button for better visibility */}
          <div style={{
            marginBottom: '30px',
            border: '1px solid var(--border-color)',
            padding: '16px',
            backgroundColor: 'var(--hover-color)'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>
              EVENT LOG
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {(gameState.recentMessages || []).slice(0, 10).map((msg, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: '10px',
                    padding: '6px 0',
                    borderBottom: index < 9 ? '1px dotted var(--border-color)' : 'none',
                    opacity: 1 - (index * 0.08),
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

          {/* Printed Papers Output */}
          {printedPapers.length > 0 && (
            <div>
              <div style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.6,
                marginBottom: '16px'
              }}>
                OUTPUT TRAY
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

          {/* Document System - Condensed 2-Dropdown Design */}
          <div style={{
            border: '1px solid var(--border-color)',
            padding: '24px',
            marginBottom: '30px',
            backgroundColor: 'var(--hover-color)'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
              DOCUMENT SYSTEM
            </div>

            {/* Paper Quality Display */}
            <div style={{ fontSize: '10px', marginBottom: '16px', padding: '12px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
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

            {/* Dropdown 1: Document Type */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '9px', opacity: 0.7, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Document Type
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => {
                  setSelectedDocType(e.target.value);
                  setSelectedTier(1); // Reset to tier 1 when changing doc type
                }}
                style={{
                  width: '100%',
                  background: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  padding: '10px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                {Object.entries(DOCUMENT_TYPES).map(([id, data]) => {
                  const progress = getTierProgress(id, gameState);
                  return (
                    <option key={id} value={id}>
                      {data.name} ({progress.current} printed)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Dropdown 2: Tier Selection */}
            {(() => {
              const docData = DOCUMENT_TYPES[selectedDocType];
              const unlockedTiers = getUnlockedTiers(selectedDocType, gameState);

              return (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '9px', opacity: 0.7, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tier Level
                    </label>
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(Number(e.target.value))}
                      style={{
                        width: '100%',
                        background: 'var(--bg-color)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-color)',
                        padding: '10px',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                      }}
                    >
                      {docData.tiers.map(tier => {
                        const isUnlocked = unlockedTiers.some(t => t.tier === tier.tier);
                        if (!isUnlocked) return null;
                        return (
                          <option key={tier.tier} value={tier.tier}>
                            Tier {tier.tier} - {tier.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Mastery Progress */}
                  {(() => {
                    const progress = getTierProgress(selectedDocType, gameState);
                    return (
                      <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '6px' }}>
                          {docData.name} Mastery: Tier {unlockedTiers.length}/5
                        </div>
                        <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '6px' }}>
                          {progress.current} printed • {progress.nextTier ? `${progress.next - progress.current} more for Tier ${progress.nextTier}` : 'All tiers unlocked!'}
                        </div>
                        <div style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${progress.nextTier ? (progress.current / progress.next * 100) : 100}%`,
                            backgroundColor: 'var(--accent-color)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Cost & Print Button */}
                  {(() => {
                    const selectedTierData = docData.tiers.find(t => t.tier === selectedTier);
                    const check = canPrintDocumentTier(selectedDocType, selectedTier, gameState);

                    if (!selectedTierData) return null;

                    return (
                      <>
                        {/* Cost Display */}
                        <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '6px' }}>Cost:</div>
                          <div style={{ fontSize: '11px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <span>{selectedTierData.cost.paper} Paper</span>
                            {selectedTierData.cost.energy && <span>{selectedTierData.cost.energy} Energy</span>}
                            {selectedTierData.cost.sanity && <span>{selectedTierData.cost.sanity} Sanity</span>}
                          </div>
                          <div style={{ fontSize: '8px', opacity: 0.6, marginTop: '6px' }}>
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
                            padding: '14px',
                            cursor: check.canPrint ? 'pointer' : 'not-allowed',
                            fontSize: '11px',
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
                          <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '8px', textAlign: 'center', fontStyle: 'italic' }}>
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
  );
}
