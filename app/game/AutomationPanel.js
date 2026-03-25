'use client';
import { useEffect } from 'react';

export default function AutomationPanel({ gameState, setGameState, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleToggle = (key) => {
    setGameState(prev => ({
      ...prev,
      automation: { ...prev.automation, [key]: !prev.automation[key] }
    }));
  };

  const handleThresholdChange = (key, value) => {
    setGameState(prev => ({
      ...prev,
      automation: { ...prev.automation, [key]: parseInt(value, 10) }
    }));
  };

  const handleDocTypeChange = (value) => {
    setGameState(prev => ({
      ...prev,
      automation: { ...prev.automation, autoPrintDocType: value }
    }));
  };

  const automation = gameState.automation || {};

  const rowStyle = (unlocked) => ({
    padding: '10px 0',
    borderBottom: '1px solid var(--border-color, #333)',
    opacity: unlocked ? 1 : 0.35,
    pointerEvents: unlocked ? 'auto' : 'none',
  });

  const labelStyle = {
    fontSize: '11px',
    color: 'var(--text-color, #e0e0e0)',
    letterSpacing: '0.5px',
  };

  const checkboxStyle = {
    marginRight: '8px',
    cursor: 'pointer',
    accentColor: 'var(--accent-color, #f97316)',
  };

  const sliderStyle = {
    width: '100%',
    marginTop: '6px',
    accentColor: 'var(--accent-color, #f97316)',
    cursor: 'pointer',
  };

  const selectStyle = {
    marginTop: '6px',
    padding: '4px 6px',
    backgroundColor: 'var(--bg-color, #1a1a2e)',
    border: '1px solid var(--border-color, #333)',
    color: 'var(--text-color, #e0e0e0)',
    fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
    fontSize: '11px',
    cursor: 'pointer',
    width: '100%',
  };

  const isAutoSortUnlocked = gameState.upgrades?.robotic_assistant;
  const isAutoPrintUnlocked = gameState.upgrades?.document_automaton;
  const isAutoPortalUnlocked = gameState.upgrades?.void_protocol;

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      right: '10px',
      zIndex: 1500,
      backgroundColor: 'var(--bg-color, #1a1a2e)',
      border: '1px solid var(--border-color, #333)',
      padding: '16px',
      borderRadius: '8px',
      width: '320px',
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      color: 'var(--text-color, #e0e0e0)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        borderBottom: '1px solid var(--border-color, #333)',
        paddingBottom: '8px',
      }}>
        <span style={{ fontSize: '12px', letterSpacing: '1px', fontWeight: '600' }}>
          AUTOMATION PANEL
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-color, #e0e0e0)',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0 4px',
            lineHeight: 1,
          }}
        >
          X
        </button>
      </div>

      {/* Row 1 - autoSort */}
      <div style={rowStyle(isAutoSortUnlocked)}>
        {!isAutoSortUnlocked && (
          <div style={{ ...labelStyle, fontSize: '11px' }}>
            LOCKED - Robotic Assistant (5,000 PP)
          </div>
        )}
        {isAutoSortUnlocked && (
          <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={automation.autoSort || false}
                onChange={() => handleToggle('autoSort')}
                style={checkboxStyle}
              />
              Auto-sort papers
            </label>
            <div style={{ marginTop: '6px' }}>
              <span style={{ ...labelStyle, fontSize: '10px' }}>
                Auto-sort when energy &gt;= {automation.autoSortThreshold ?? 80}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={automation.autoSortThreshold ?? 80}
                onChange={(e) => handleThresholdChange('autoSortThreshold', e.target.value)}
                style={sliderStyle}
              />
            </div>
          </div>
        )}
      </div>

      {/* Row 2 - autoPrint */}
      <div style={rowStyle(isAutoPrintUnlocked)}>
        {!isAutoPrintUnlocked && (
          <div style={{ ...labelStyle, fontSize: '11px' }}>
            LOCKED - Document Automaton (15,000 PP)
          </div>
        )}
        {isAutoPrintUnlocked && (
          <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={automation.autoPrint || false}
                onChange={() => handleToggle('autoPrint')}
                style={checkboxStyle}
              />
              Auto-print documents
            </label>
            <div style={{ marginTop: '6px' }}>
              <span style={{ ...labelStyle, fontSize: '10px' }}>
                Auto-print when paper &gt;= {automation.autoPrintThreshold ?? 50}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={automation.autoPrintThreshold ?? 50}
                onChange={(e) => handleThresholdChange('autoPrintThreshold', e.target.value)}
                style={sliderStyle}
              />
            </div>
            <select
              value={automation.autoPrintDocType || 'memo'}
              onChange={(e) => handleDocTypeChange(e.target.value)}
              style={selectStyle}
            >
              <option value="memo">Memo</option>
              <option value="report">Report</option>
              <option value="contract">Contract</option>
              <option value="prophecy">Prophecy</option>
            </select>
          </div>
        )}
      </div>

      {/* Row 3 - autoPortal */}
      <div style={{ ...rowStyle(isAutoPortalUnlocked), borderBottom: 'none' }}>
        {!isAutoPortalUnlocked && (
          <div style={{ ...labelStyle, fontSize: '11px' }}>
            LOCKED - Void Protocol (50,000 PP)
          </div>
        )}
        {isAutoPortalUnlocked && (
          <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={automation.autoPortal || false}
                onChange={() => handleToggle('autoPortal')}
                style={checkboxStyle}
              />
              Auto-enter portal when cooldown ready
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
