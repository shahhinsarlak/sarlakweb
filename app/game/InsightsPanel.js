import React, { useEffect } from 'react';
import EventLog from './EventLog';
import NotificationPopup from './NotificationPopup';
import { INSIGHTS, INSIGHT_CATEGORIES, CLARITY_BUFF } from './constants';
import {
  getInsight,
  isInsightResearched,
  insightRequirementsMet,
  canAffordInsight,
  getInsightEffects,
  insightEffectText,
  getInsightBonusSummary,
} from './insightHelpers';

/**
 * Insights Panel ("The Lucid Mind", Chapter 2)
 *
 * Chapter 2's research system: spend Intelligence (and some Lucidity) on permanent
 * mental upgrades, grouped into five branches. Tiers chain via requirements. Text
 * is standard-coloured for readability.
 */
function InsightsPanel({ gameState, actions, onClose, notifications, onDismissNotification }) {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const lucidity = Math.floor(gameState.lucidity || 0);
  const intelligence = Math.floor(gameState.intelligence || 0);
  const eff = getInsightEffects(gameState);
  const bonuses = getInsightBonusSummary(gameState);
  const floors = [0, 250, 500, 750];
  const anchorFloor = floors[gameState.lucidAnchorTier || 0] || 0;

  const hasClarity = (gameState.researchedInsights || []).includes('clarity_recipe');
  const clarityCost = Math.ceil(CLARITY_BUFF.lucidityCost * (1 - eff.clarityCostReduction));
  const clarityDuration = Math.round(CLARITY_BUFF.duration * (1 + eff.clarityDurationMult));
  const canCraftClarity = (gameState.lucidity || 0) >= clarityCost;

  const costLabel = (cost) =>
    Object.entries(cost).map(([res, amt]) => `${amt} ${res}`).join(' + ');

  const resourceBox = (label, value) => (
    <div style={{ flex: 1, border: '1px solid var(--border-color)', padding: '14px', backgroundColor: 'var(--bg-color)', textAlign: 'center' }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '6px' }}>{value}</div>
    </div>
  );

  return (
    <>
      <EventLog messages={gameState.recentMessages} />
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '820px', margin: '0 auto', padding: '40px 24px', minHeight: '100vh', color: 'var(--text-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '22px', letterSpacing: '2px', textTransform: 'uppercase' }}>The Lucid Mind</div>
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
              Spend what you perceive and understand to reshape your own mind.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '10px 20px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', letterSpacing: '1px' }}
          >
            CLOSE
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          {resourceBox('Lucidity', lucidity)}
          {resourceBox('Intelligence', intelligence)}
        </div>

        {/* Active bonuses + clarity craft */}
        <div style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--hover-color)', padding: '12px', marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '6px' }}>Active Bonuses</div>
          <div style={{ fontSize: '12px', opacity: 0.85, lineHeight: '1.7' }}>
            {anchorFloor > 0 && <span>Sanity floor {anchorFloor}%{bonuses.length > 0 ? '  \u2022  ' : ''}</span>}
            {bonuses.join('  \u2022  ') || (anchorFloor === 0 ? 'None yet \u2014 research insights below.' : '')}
          </div>
          {hasClarity && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => actions.craftClarity()}
                disabled={!canCraftClarity}
                style={btn(canCraftClarity)}
              >
                CRAFT CLARITY ({clarityCost} lucidity)
              </button>
              <span style={{ fontSize: '11px', opacity: 0.65 }}>
                Halts lucid decay for {(clarityDuration / 60).toFixed(1)} min.
              </span>
            </div>
          )}
        </div>

        {/* Branches */}
        {INSIGHT_CATEGORIES.map((category) => {
          const items = INSIGHTS.filter((i) => i.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category} style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.8, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '12px' }}>
                {category}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                {items.map((insight) => {
                  const researched = isInsightResearched(gameState, insight.id);
                  const reqMet = insightRequirementsMet(insight, gameState);
                  const affordable = canAffordInsight(insight, gameState);
                  const reqNames = (insight.requires || []).map((r) => getInsight(r)?.name).filter(Boolean);
                  return (
                    <div key={insight.id} style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--hover-color)', padding: '14px', opacity: researched || reqMet ? 1 : 0.55 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{insight.name}</span>
                        <span style={{ fontSize: '11px', opacity: 0.7, whiteSpace: 'nowrap' }}>{insightEffectText(insight)}</span>
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.65, fontStyle: 'italic', margin: '8px 0', lineHeight: '1.5' }}>{insight.desc}</div>
                      {researched ? (
                        <div style={{ fontSize: '12px', opacity: 0.7, letterSpacing: '1px' }}>{'\u2713 RESEARCHED'}</div>
                      ) : !reqMet ? (
                        <div style={{ fontSize: '11px', opacity: 0.6 }}>Requires: {reqNames.join(', ')}</div>
                      ) : (
                        <button
                          onClick={() => actions.researchInsight(insight.id)}
                          disabled={!affordable}
                          style={btn(affordable)}
                        >
                          RESEARCH ({costLabel(insight.cost)})
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <NotificationPopup notifications={notifications} onDismiss={onDismissNotification} />
    </>
  );
}

function btn(enabled) {
  return {
    background: enabled ? 'var(--accent-color)' : 'none',
    border: '1px solid var(--border-color)',
    color: enabled ? 'var(--bg-color)' : 'var(--text-color)',
    padding: '9px 14px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontSize: '12px',
    fontFamily: 'inherit',
    letterSpacing: '1px',
    opacity: enabled ? 1 : 0.5,
  };
}

InsightsPanel.displayName = 'InsightsPanel';
export default React.memo(InsightsPanel);
