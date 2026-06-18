import React, { useEffect } from 'react';
import EventLog from './EventLog';
import NotificationPopup from './NotificationPopup';
import FactorySprite from './FactorySprite';
import { formatPP } from './gameUtils';
import {
  getFactoryStats,
  getMachineBuildCost,
  getMachineCount,
  isBlueprintResearched,
  canBuildMachine,
  canResearchBlueprint,
} from './factoryHelpers';
import { FACTORY_MACHINES } from './constants';

/**
 * Factory Panel ("The Construct", Chapter 2 Phase 2)
 *
 * Research blueprints with Intelligence, build machines with Lucidity. Generators
 * make Power; Extractors mine Substrate; Converters turn Substrate + Power into
 * existing resources. Everything runs on the game tick (idle), this is just the UI.
 */
function FactoryPanel({ gameState, actions, onClose, notifications, onDismissNotification }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const stats = getFactoryStats(gameState);
  const lucidity = Math.floor(gameState.lucidity || 0);
  const intelligence = Math.floor(gameState.intelligence || 0);
  const overloaded = stats.powerDemand > stats.powerProduced;
  const starved = stats.subEff < 0.999 && stats.subDemandPerSec > 0;

  const fmtRate = (resource, perSec) => {
    if (perSec <= 0) return null;
    if (resource === 'pp') return `+${formatPP(perSec)} PP/s`;
    if (resource === 'material') return `+${perSec.toFixed(3)} mat/s`;
    return `+${perSec.toFixed(2)} ${resource}/s`;
  };

  const headerStat = (label, value, sub, color) => (
    <div style={{
      flex: '1 1 140px',
      border: '1px solid var(--border-color)',
      padding: '12px',
      backgroundColor: 'var(--bg-color)',
    }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: color || 'inherit', marginTop: '4px' }}>{value}</div>
      {sub && <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>{sub}</div>}
    </div>
  );

  const costLabel = (cost) =>
    Object.entries(cost).map(([res, amt]) => `${amt} ${res}`).join(' + ');

  return (
    <>
      <EventLog messages={gameState.recentMessages} />
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
        minHeight: '100vh',
        color: 'var(--text-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '22px', letterSpacing: '2px', textTransform: 'uppercase' }}>The Construct</div>
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
              Research with intelligence. Build with lucidity. Let it run.
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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          {headerStat('Power', `${stats.powerProduced} / ${stats.powerDemand}`,
            overloaded ? `Overloaded \u2014 ${Math.round(stats.powerEff * 100)}% output` : 'produced / used',
            overloaded ? '#ff6b6b' : '#9fe8ff')}
          {headerStat('Substrate', Math.floor(stats.substrate),
            `${stats.subNetPerSec >= 0 ? '+' : ''}${stats.subNetPerSec.toFixed(2)}/s${starved ? ' \u2014 starved' : ''}`,
            starved ? '#ff6b6b' : '#c46bff')}
          {headerStat('Lucidity', lucidity, null, '#00d0ff')}
          {headerStat('Intelligence', intelligence, null, '#ffd060')}
        </div>

        <div style={{
          fontSize: '11px', opacity: 0.7, marginBottom: '24px', padding: '8px 12px',
          border: '1px solid var(--border-color)', backgroundColor: 'var(--hover-color)',
        }}>
          Producing:{' '}
          {['pp', 'paper', 'lucidity', 'intelligence', 'material']
            .map((r) => fmtRate(r, stats.outputs[r]))
            .filter(Boolean)
            .join('  \u2022  ') || 'nothing yet \u2014 build extractors and converters'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {FACTORY_MACHINES.map((machine) => {
            const owned = getMachineCount(gameState, machine.id);
            const researched = isBlueprintResearched(machine, gameState);
            const buildCost = getMachineBuildCost(machine, gameState);
            const buildable = canBuildMachine(machine, gameState);
            const researchable = canResearchBlueprint(machine, gameState);

            const effects = [];
            if (machine.power > 0) effects.push(`+${machine.power} power`);
            if (machine.power < 0) effects.push(`${machine.power} power`);
            if (machine.substrate > 0) effects.push(`+${machine.substrate} substrate/s`);
            if (machine.substrate < 0) effects.push(`${machine.substrate} substrate/s`);
            if (machine.output) {
              effects.push(`+${machine.output.rate} ${machine.output.resource}/s${machine.output.scalesWithPPTier ? ' x tier' : ''}`);
            }

            return (
              <div key={machine.id} style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--hover-color)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                opacity: researched ? 1 : 0.85,
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '72px', height: '72px', flexShrink: 0, backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                    <FactorySprite machineId={machine.id} display={72} animate={researched && owned > 0} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{machine.name}</span>
                      <span style={{ fontSize: '13px', opacity: 0.8 }}>x{owned}</span>
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px', lineHeight: '1.4' }}>{machine.desc}</div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', opacity: 0.75, marginBottom: '10px' }}>
                  {effects.join('  \u2022  ')}
                </div>

                {!researched ? (
                  <button
                    onClick={() => actions.researchBlueprint(machine.id)}
                    disabled={!researchable}
                    style={{
                      marginTop: 'auto',
                      background: researchable ? '#ffd060' : 'none',
                      border: '1px solid var(--border-color)',
                      color: researchable ? '#1a1a1a' : 'var(--text-color)',
                      padding: '10px',
                      cursor: researchable ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      letterSpacing: '1px',
                      opacity: researchable ? 1 : 0.5,
                    }}
                  >
                    RESEARCH ({machine.blueprint.intelligence} intelligence)
                  </button>
                ) : (
                  <button
                    onClick={() => actions.buildMachine(machine.id)}
                    disabled={!buildable}
                    style={{
                      marginTop: 'auto',
                      background: buildable ? 'var(--accent-color)' : 'none',
                      border: '1px solid var(--border-color)',
                      color: buildable ? 'var(--bg-color)' : 'var(--text-color)',
                      padding: '10px',
                      cursor: buildable ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      letterSpacing: '1px',
                      opacity: buildable ? 1 : 0.5,
                    }}
                  >
                    BUILD ({costLabel(buildCost)})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <NotificationPopup notifications={notifications} onDismiss={onDismissNotification} />
    </>
  );
}

FactoryPanel.displayName = 'FactoryPanel';
export default React.memo(FactoryPanel);
