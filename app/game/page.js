'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MeditationModal from './MeditationModal';
import DebugModal from './DebugModal';
import DebugPanel from './DebugPanel';
import ExamineModal from './ExamineModal';
import DimensionalArea from './DimensionalArea';
import DimensionalUpgradesDisplay from './DimensionalUpgradesDisplay';
import SkillTreeModal from './SkillTreeModal';
import PrinterRoom from './PrinterRoom';
import Armory from './Armory';
import FileDrawer from './FileDrawer';
import HelpPopup from './HelpPopup';
import AchievementsModal from './AchievementsModal';
import JournalModal from './JournalModal';
import BuffReplacementModal from './BuffReplacementModal';
import NotificationPopup from './NotificationPopup';
import { createGameActions } from './gameActions';
import { getDistortionStyle, distortText, getClockTime, createLevelUpParticles, createSkillPurchaseParticles, createScreenShake } from './gameUtils';
import { saveGame, loadGame, exportToClipboard, importFromClipboard } from './saveSystem';
import { addExperience, purchaseSkill, getActiveSkillEffects, getModifiedPortalCooldown, getModifiedCapacity, applyPPMultiplier, applyPPSMultiplier } from './skillSystemHelpers';
import { SKILLS, LEVEL_SYSTEM, XP_REWARDS } from './skillTreeConstants';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';
import { getSanityTierDisplay, isSanityDrainPaused, calculatePaperQuality, applySanityPPModifier, getActiveBuffPPMultiplier, getActiveBuffXPMultiplier, getActiveBuffEnergyCostMultiplier, getActiveBuffPPPerSecondMultiplier } from './sanityPaperHelpers';
import {
  INITIAL_GAME_STATE,
  LOCATIONS,
  UPGRADES,
  ACHIEVEMENTS,
  EVENTS,
  PRINTER_UPGRADES,
  DIMENSIONAL_UPGRADES,
  HELP_POPUPS,
  HELP_TRIGGERS,
  EMPLOYEE_0_FILE
} from './constants';

export default function Game() {
  const [isMobile, setIsMobile] = useState(false);
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [hoveredUpgrade, setHoveredUpgrade] = useState(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedUpgradeType, setSelectedUpgradeType] = useState('pp'); // 'pp', 'printer', 'dimensional'
  const [buffTooltip, setBuffTooltip] = useState(null); // { buff, x, y }
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');

  // Initialize actions with current state
  const actions = createGameActions(
    setGameState,
    (msg, type) => setGameState(prev => ({ ...prev, recentMessages: [msg, ...prev.recentMessages].slice(0, 50) })),
    (id) => {
      if (!gameState.achievements.includes(id)) {
        setGameState(prev => ({ ...prev, achievements: [...prev.achievements, id] }));
      }
    },
    (amount) => addExperience(amount, gameState, setGameState)
  );

  // Calculate derived values
  const calculateEffectivePPPerClick = () => {
    let pp = gameState.ppPerClick;
    const effects = getActiveSkillEffects(gameState);

    // Apply skill multipliers
    pp *= (1 + effects.ppPerClickMultiplier);
    pp *= (1 + effects.ppMultiplier);

    // Apply sanity modifier
    const sanityTier = getSanityTierDisplay(gameState);
    pp *= sanityTier.ppModifier;

    // Apply buff multipliers
    pp *= getActiveBuffPPMultiplier(gameState);

    return Math.floor(pp * 10) / 10;
  };

  const getEffectivePPPerSecond = () => {
    let pps = gameState.ppPerSecond;
    const effects = getActiveSkillEffects(gameState);

    // Apply skill multipliers
    pps *= (1 + effects.ppPerSecondMultiplier);
    pps *= (1 + effects.ppMultiplier);

    // Apply sanity modifier
    const sanityTier = getSanityTierDisplay(gameState);
    pps *= sanityTier.ppModifier;

    // Apply buff multipliers
    pps *= getActiveBuffPPMultiplier(gameState);
    pps *= getActiveBuffPPPerSecondMultiplier(gameState);

    return Math.floor(pps * 10) / 10;
  };

  // Archive Search Handler
  const handleArchiveSearch = (e) => {
    e.preventDefault();
    if (!archiveSearchQuery.trim()) return;

    const result = actions.searchArchive(archiveSearchQuery);
    if (result && result.success) {
      setArchiveSearchQuery('');
    }
  };

  // Render
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />

      <main style={{ flex: 1, padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Game Content Here - Reconstructing Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 250px', gap: '20px' }}>

          {/* Left Column: Resources & Stats */}
          <div>
            <div style={{
              border: '1px solid var(--border-color)',
              padding: '16px',
              marginBottom: '16px',
              backgroundColor: 'var(--hover-color)'
            }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>
                PLAYER
              </div>
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>LEVEL</span>
                  <strong style={{ fontSize: '18px' }}>{gameState.playerLevel || 1}</strong>
                </div>
                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '4px' }}>
                  {(gameState.playerXP || 0).toFixed(1)} / {LEVEL_SYSTEM.getXPForLevel((gameState.playerLevel || 1) + 1).toFixed(1)} XP
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: `${((gameState.playerXP || 0) / LEVEL_SYSTEM.getXPForLevel((gameState.playerLevel || 1) + 1)) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-color)',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                  <span>SKILL POINTS</span>
                  <strong style={{ fontSize: '18px' }}>{gameState.skillPoints || 0}</strong>
                </div>
              </div>
            </div>

            <div style={{
              border: '1px solid var(--border-color)',
              padding: '16px',
              marginBottom: '16px',
              backgroundColor: 'var(--hover-color)'
            }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>
                RESOURCES
              </div>
              <div style={{ fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span>PP</span>
                  <strong style={{ fontSize: '18px' }}>{gameState.pp.toFixed(1)}</strong>
                </div>
                <div style={{
                  fontSize: '11px',
                  marginBottom: '16px',
                  padding: '8px',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '2px'
                }}>
                  <div style={{ opacity: 0.7, marginBottom: '2px' }}>PP per click:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                    +{calculateEffectivePPPerClick()} PP
                  </div>
                </div>
                {gameState.printerUnlocked && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span>PAPER</span>
                    <strong style={{ fontSize: '18px' }}>{gameState.paper.toFixed(1)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span>ENERGY</span>
                  <strong style={{ fontSize: '18px' }}>{gameState.energy.toFixed(1)}%</strong>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  color: gameState.sanity < 30 ? '#ff0000' : 'inherit'
                }}>
                  <span>SANITY</span>
                  <strong style={{ fontSize: '18px' }}>{gameState.sanity.toFixed(1)}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Main Game Area */}
          <div>
            {/* Location Header */}
            <div style={{
              border: '1px solid var(--border-color)',
              padding: '16px',
              marginBottom: '20px',
              backgroundColor: 'var(--hover-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {LOCATIONS[gameState.location]?.name || 'UNKNOWN'}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                DAY {gameState.day}
              </div>
            </div>

            {/* Location Content */}
            {gameState.location === 'cubicle' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  onClick={actions.sortPapers}
                  style={{
                    padding: '20px',
                    fontSize: '16px',
                    backgroundColor: 'var(--bg-color)',
                    border: '1px solid var(--accent-color)',
                    color: 'var(--text-color)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  Sort Papers
                </button>
                <button
                  onClick={actions.rest}
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    backgroundColor: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    cursor: 'pointer'
                  }}
                >
                  Rest (Restore Energy)
                </button>
              </div>
            )}

            {gameState.location === 'printerroom' && (
              <PrinterRoom gameState={gameState} actions={actions} />
            )}

            {gameState.location === 'archive' && (
              <div>
                {/* Archive Search - NEW FEATURE */}
                {gameState.archiveSearchUnlocked && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    border: '1px solid var(--accent-color)',
                    backgroundColor: 'rgba(0, 255, 0, 0.05)'
                  }}>
                    <div style={{ fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Secure File Search
                    </div>
                    <form onSubmit={handleArchiveSearch} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={archiveSearchQuery}
                        onChange={(e) => setArchiveSearchQuery(e.target.value)}
                        placeholder="Enter Case Number..."
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: 'var(--bg-color)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-color)',
                          fontFamily: 'inherit'
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'var(--accent-color)',
                          color: 'var(--bg-color)',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        SEARCH
                      </button>
                    </form>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                  {LOCATIONS.archive.items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => actions.examineItem(item)}
                      style={{
                        border: '1px solid var(--border-color)',
                        padding: '16px',
                        cursor: 'pointer',
                        opacity: gameState.examinedItems.includes(item.id) ? 0.5 : 1,
                        backgroundColor: 'var(--bg-color)'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{item.name}</div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>Click to examine</div>
                    </div>
                  ))}

                  {/* Employee 0 File - Conditional Render */}
                  {gameState.employee0Found && (
                    <div
                      onClick={() => actions.examineItem(EMPLOYEE_0_FILE)}
                      style={{
                        border: '1px solid var(--accent-color)',
                        padding: '16px',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        boxShadow: '0 0 10px rgba(255, 0, 0, 0.2)'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#ff4444' }}>{EMPLOYEE_0_FILE.name}</div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>RESTRICTED FILE</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {gameState.location === 'armory' && (
              <Armory gameState={gameState} setGameState={setGameState} />
            )}

            {gameState.location === 'dimensional' && (
              <DimensionalArea gameState={gameState} actions={actions} setGameState={setGameState} />
            )}
          </div>

          {/* Right Column: Event Log */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>
                EVENT LOG
              </div>
              <div style={{
                border: '1px solid var(--border-color)',
                padding: '12px',
                backgroundColor: 'var(--hover-color)',
                fontSize: '11px',
                opacity: 0.7,
                lineHeight: '1.6',
                maxHeight: '400px',
                overflowY: 'auto',
                minHeight: '200px'
              }}>
                {gameState.recentMessages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: i < gameState.recentMessages.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />

      {/* Modals */}
      {gameState.meditating && (
        <MeditationModal
          gameState={gameState}
          onComplete={(sanityRestored) => {
            setGameState(prev => ({
              ...prev,
              sanity: Math.min(100, prev.sanity + sanityRestored),
              meditating: false
            }));
          }}
          onCancel={() => setGameState(prev => ({ ...prev, meditating: false }))}
        />
      )}

      {gameState.examiningItem && (
        <ExamineModal
          item={gameState.examiningItem}
          onClose={actions.closeExamine}
        />
      )}

      {gameState.showSkillTree && (
        <SkillTreeModal
          gameState={gameState}
          onClose={() => setGameState(prev => ({ ...prev, showSkillTree: false }))}
          onPurchaseSkill={(skillId) => purchaseSkill(skillId, gameState, setGameState)}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          gameState={gameState}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {gameState.journalOpen && (
        <JournalModal
          gameState={gameState}
          onClose={actions.closeJournal}
          setGameState={setGameState}
        />
      )}

      <NotificationPopup
        notifications={gameState.notifications}
        onDismiss={(id) => setGameState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== id)
        }))}
      />

    </div>
  );
}