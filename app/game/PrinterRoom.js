'use client';
import { useState, useEffect } from 'react';
import { DOCUMENT_TYPES } from './constants';
import { calculatePaperQuality, canPrintDocument, getSanityTier } from './sanityPaperHelpers';

export default function PrinterRoom({ gameState, setGameState, onExit, grantXP, actions }) {
  const [printing, setPrinting] = useState(false);
  const [printedPapers, setPrintedPapers] = useState([]);
  const [animationFrame, setAnimationFrame] = useState(0);

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

          {/* Document System */}
          <div style={{
            border: '1px solid var(--border-color)',
            padding: '24px',
            marginBottom: '30px',
            backgroundColor: 'var(--hover-color)'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '16px' }}>
              DOCUMENT SYSTEM
            </div>
            <div style={{ fontSize: '10px', marginBottom: '16px', padding: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <div>Paper Quality: {calculatePaperQuality(gameState)}%</div>
              <div style={{ opacity: 0.7, marginTop: '4px' }}>
                Depends on Sanity ({gameState.sanity.toFixed(0)}%) + Printer Quality ({gameState.printerQuality || 0}%)
              </div>
            </div>

            {/* Memo */}
            {(() => {
              const docData = DOCUMENT_TYPES.memo;
              const check = canPrintDocument('memo', gameState);
              return (
                <button
                  onClick={() => actions.printMemo()}
                  disabled={!check.canPrint}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '12px',
                    cursor: check.canPrint ? 'pointer' : 'not-allowed',
                    fontSize: '11px',
                    fontFamily: 'inherit',
                    marginBottom: '8px',
                    textAlign: 'left',
                    opacity: check.canPrint ? 1 : 0.4
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📝 {docData.name}</div>
                  <div style={{ fontSize: '9px', opacity: 0.7 }}>{docData.desc}</div>
                  <div style={{ fontSize: '9px', marginTop: '6px', opacity: 0.6 }}>
                    Cost: {docData.cost.paper} paper, {docData.cost.energy} energy
                  </div>
                  {!check.canPrint && (
                    <div style={{ fontSize: '9px', marginTop: '4px', color: '#ff4444' }}>{check.reason}</div>
                  )}
                </button>
              );
            })()}

            {/* Report */}
            {(() => {
              const docData = DOCUMENT_TYPES.report;
              const check = canPrintDocument('report', gameState);
              return (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    marginBottom: '6px',
                    padding: '8px',
                    backgroundColor: 'var(--bg-color)',
                    border: '1px solid var(--border-color)'
                  }}>
                    📊 {docData.name}
                    {!check.canPrint && (
                      <div style={{ fontSize: '9px', marginTop: '4px', color: '#ff4444', fontWeight: 'normal' }}>
                        {check.reason}
                      </div>
                    )}
                  </div>
                  {docData.buffs.map(buff => (
                    <button
                      key={buff.id}
                      onClick={() => actions.printReport(buff.id)}
                      disabled={!check.canPrint}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-color)',
                        padding: '8px',
                        cursor: check.canPrint ? 'pointer' : 'not-allowed',
                        fontSize: '9px',
                        fontFamily: 'inherit',
                        marginBottom: '4px',
                        textAlign: 'left',
                        opacity: check.canPrint ? 1 : 0.4
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{buff.name}</div>
                      <div style={{ opacity: 0.7 }}>{buff.desc}</div>
                    </button>
                  ))}
                  <div style={{ fontSize: '8px', marginTop: '4px', marginLeft: '8px', opacity: 0.6 }}>
                    Cost: {docData.cost.paper} paper, {docData.cost.energy} energy
                  </div>
                </div>
              );
            })()}

            {/* Contract */}
            {(() => {
              const docData = DOCUMENT_TYPES.contract;
              const check = canPrintDocument('contract', gameState);
              return (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    marginBottom: '6px',
                    padding: '8px',
                    backgroundColor: 'var(--bg-color)',
                    border: '1px solid var(--border-color)'
                  }}>
                    📜 {docData.name}
                    {!check.canPrint && (
                      <div style={{ fontSize: '9px', marginTop: '4px', color: '#ff4444', fontWeight: 'normal' }}>
                        {check.reason}
                      </div>
                    )}
                  </div>
                  {docData.contracts.map(contract => (
                    <button
                      key={contract.id}
                      onClick={() => actions.useContract(contract.id)}
                      disabled={!check.canPrint}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-color)',
                        padding: '8px',
                        cursor: check.canPrint ? 'pointer' : 'not-allowed',
                        fontSize: '9px',
                        fontFamily: 'inherit',
                        marginBottom: '4px',
                        textAlign: 'left',
                        opacity: check.canPrint ? 1 : 0.4
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{contract.name}</div>
                      <div style={{ opacity: 0.7 }}>{contract.desc}</div>
                    </button>
                  ))}
                  <div style={{ fontSize: '8px', marginTop: '4px', marginLeft: '8px', opacity: 0.6 }}>
                    Cost: {docData.cost.paper} paper, {docData.cost.energy} energy, {docData.cost.sanity} sanity
                  </div>
                </div>
              );
            })()}

            {/* Prophecy */}
            {(() => {
              const docData = DOCUMENT_TYPES.prophecy;
              const check = canPrintDocument('prophecy', gameState);
              return (
                <button
                  onClick={() => actions.printProphecy()}
                  disabled={!check.canPrint}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '12px',
                    cursor: check.canPrint ? 'pointer' : 'not-allowed',
                    fontSize: '11px',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    opacity: check.canPrint ? 1 : 0.4
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔮 {docData.name}</div>
                  <div style={{ fontSize: '9px', opacity: 0.7 }}>{docData.desc}</div>
                  <div style={{ fontSize: '9px', marginTop: '6px', opacity: 0.6 }}>
                    Cost: {docData.cost.paper} paper, {docData.cost.energy} energy
                  </div>
                  {!check.canPrint && (
                    <div style={{ fontSize: '9px', marginTop: '4px', color: '#ff4444' }}>{check.reason}</div>
                  )}
                </button>
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
