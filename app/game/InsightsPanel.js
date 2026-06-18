import React, { useEffect } from 'react';
import EventLog from './EventLog';
import NotificationPopup from './NotificationPopup';
import { INSIGHTS, CLARITY_BUFF, LUCID_ANCHOR_FLOORS } from './constants';

/**
 * Insights Panel (Chapter 2, Phase 1)
 *
 * Spend Lucidity and Intelligence to research insights: Lucid Anchors (permanent
 * sanity floors) and the Clarity Technique (a craftable decay-pausing buff).
 * This is the seed of the Phase 2 factory/automation layer.
 *
 * @param {Object} gameState - Current game state
 * @param {Object} actions - Game actions (researchInsight, craftClarity)
 * @param {Function} onClose - Close the panel
 */
function InsightsPanel({ gameState, actions, onClose, notifications, onDismissNotification }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const researched = gameState.researchedInsights || [];
  const lucidity = Math.floor(gameState.lucidity || 0);
  const intelligence = Math.floor(gameState.intelligence || 0);
  const anchorFloor = LUCID_ANCHOR_FLOORS[gameState.lucidAnchorTier || 0] || 0;
  const hasClarityRecipe = researched.includes('clarity_recipe');
  const canAffordClarity = lucidity >= CLARITY_BUFF.lucidityCost;

  const isResearched = (insight) => researched.includes(insight.id);
  const requirementsMet = (insight) =>
    (insight.requires || []).every((r) => researched.includes(r));
  const canAfford = (insight) =>
    (gameState.intelligence || 0) >= (insight.cost.intelligence || 0) &&
    (gameState.lucidity || 0) >= (insight.cost.lucidity || 0);

  const resourceBox = (label, value, color) => (
    <div style={{
      flex: 1,
      border: '1px solid var(--border-color)',
      padding: '14px',
      backgroundColor: 'var(--bg-color)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color, marginTop: '6px' }}>{value}</div>
    </div>
  );

  return (
    <>
      <EventLog messages={gameState.recentMessages} />
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '720px',
        margin: '0 auto',
        padding: '40px 24px',
        minHeight: '100vh',
        color: 'var(--text-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '22px', letterSpacing: '2px', textTransform: 'uppercase' }}>Insights</div>
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
              Build a way through. Spend what you have perceived and understood.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'inherit',
              letterSpacing: '1px',
            }}
          >
            CLOSE
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          {resourceBox('Lucidity', lucidity, '#00d0ff')}
          {resourceBox('Intelligence', intelligence, '#ffd060')}
        </div>

        <div style={{
          fontSize: '12px',
          opacity: 0.7,
          marginBottom: '24px',
          padding: '10px 12px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--hover-color)',
        }}>
          Current sanity floor: <strong>{anchorFloor > 0 ? `${anchorFloor}%` : 'none'}</strong>
          {anchorFloor > 0 && ' — your clarity holds here without upkeep.'}
        </div>

        {INSIGHTS.map((insight) => {
          const done = isResearched(insight);
          const unlocked = requirementsMet(insight);
          const affordable = canAfford(insight);
          const isClarity = insight.id === 'clarity_recipe';

          return (
            <div
              key={insight.id}
              style={{
                border: '1px solid var(--border-color)',
                padding: '16px',
                marginBottom: '12px',
                backgroundColor: 'var(--hover-color)',
                opacity: unlocked || done ? 1 : 0.5,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {insight.name}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.75, lineHeight: '1.5' }}>{insight.desc}</div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '8px' }}>
                    Cost:
                    {insight.cost.intelligence ? ` ${insight.cost.intelligence} intelligence` : ''}
                    {insight.cost.intelligence && insight.cost.lucidity ? ' +' : ''}
                    {insight.cost.lucidity ? ` ${insight.cost.lucidity} lucidity` : ''}
                  </div>
                </div>
                <div style={{ minWidth: '130px', textAlign: 'right' }}>
                  {done ? (
                    <div style={{ fontSize: '12px', color: '#00d0ff', letterSpacing: '1px' }}>RESEARCHED</div>
                  ) : !unlocked ? (
                    <div style={{ fontSize: '11px', opacity: 0.6 }}>Requires prior insight</div>
                  ) : (
                    <button
                      onClick={() => actions.researchInsight(insight.id)}
                      disabled={!affordable}
                      style={{
                        background: affordable ? 'var(--accent-color)' : 'none',
                        border: '1px solid var(--border-color)',
                        color: affordable ? 'var(--bg-color)' : 'var(--text-color)',
                        padding: '10px 16px',
                        cursor: affordable ? 'pointer' : 'not-allowed',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        letterSpacing: '1px',
                        opacity: affordable ? 1 : 0.5,
                      }}
                    >
                      RESEARCH
                    </button>
                  )}
                </div>
              </div>

              {isClarity && done && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => actions.craftClarity()}
                    disabled={!canAffordClarity}
                    style={{
                      background: canAffordClarity ? 'var(--accent-color)' : 'none',
                      border: '1px solid var(--border-color)',
                      color: canAffordClarity ? 'var(--bg-color)' : 'var(--text-color)',
                      padding: '10px 16px',
                      cursor: canAffordClarity ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      letterSpacing: '1px',
                      opacity: canAffordClarity ? 1 : 0.5,
                    }}
                  >
                    CRAFT CLARITY ({CLARITY_BUFF.lucidityCost} LUCIDITY)
                  </button>
                  <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: '12px' }}>
                    Halts lucid decay for {CLARITY_BUFF.duration / 60} minutes.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <NotificationPopup notifications={notifications} onDismiss={onDismissNotification} />
    </>
  );
}

InsightsPanel.displayName = 'InsightsPanel';
export default React.memo(InsightsPanel);
