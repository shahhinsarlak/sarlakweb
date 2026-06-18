import React, { useEffect, useState } from 'react';
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
 * Power is a battery: generators trickle it in, capacitors raise capacity,
 * extractors/converters drain it. Shown as a glowing bar; at 0 power machines
 * stop. One machine is featured at a time; click the tabs or arrows to move
 * between them. Everything runs on the game tick (idle); this is just the UI.
 */
function FactoryPanel({ gameState, actions, onClose, notifications, onDismissNotification }) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') setSelected((s) => (s - 1 + FACTORY_MACHINES.length) % FACTORY_MACHINES.length);
      else if (e.key === 'ArrowRight') setSelected((s) => (s + 1) % FACTORY_MACHINES.length);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const stats = getFactoryStats(gameState);
  const lucidity = Math.floor(gameState.lucidity || 0);
  const intelligence = Math.floor(gameState.intelligence || 0);

  const starved = stats.powerEff < 0.999 && stats.powerUsePerSec > 0;
  const draining = stats.powerNetPerSec < 0 && stats.power > 0 && !starved;
  const powerPct = stats.powerCapacity > 0 ? Math.min(100, (stats.power / stats.powerCapacity) * 100) : 0;
  const powerColor = starved ? '#ff6b6b' : draining ? '#ffb454' : '#9fe8ff';
  const subStarved = stats.subEff < 0.999 && stats.subDemandPerSec > 0;

  const machine = FACTORY_MACHINES[selected];
  const owned = getMachineCount(gameState, machine.id);
  const researched = isBlueprintResearched(machine, gameState);
  const buildCost = getMachineBuildCost(machine, gameState);
  const buildable = canBuildMachine(machine, gameState);
  const researchable = canResearchBlueprint(machine, gameState);

  const effects = [];
  if (machine.powerGen) effects.push(`+${machine.powerGen} power/s`);
  if (machine.powerUse) effects.push(`-${machine.powerUse} power/s`);
  if (machine.powerCapacity) effects.push(`+${machine.powerCapacity} capacity`);
  if (machine.substrate > 0) effects.push(`+${machine.substrate} substrate/s`);
  if (machine.substrate < 0) effects.push(`${machine.substrate} substrate/s`);
  if (machine.output) effects.push(`+${machine.output.rate} ${machine.output.resource}/s${machine.output.scalesWithPPTier ? ' x tier' : ''}`);

  const fmtRate = (resource, perSec) => {
    if (perSec <= 0) return null;
    if (resource === 'pp') return `+${formatPP(perSec)} PP/s`;
    if (resource === 'material') return `+${perSec.toFixed(3)} mat/s`;
    return `+${perSec.toFixed(2)} ${resource}/s`;
  };

  const chip = (label, value, color) => (
    <span style={{ fontSize: '12px' }}>
      <span style={{ opacity: 0.6 }}>{label} </span>
      <strong style={{ color }}>{value}</strong>
    </span>
  );

  const go = (dir) => setSelected((s) => (s + dir + FACTORY_MACHINES.length) % FACTORY_MACHINES.length);

  const arrowBtn = (label, dir) => (
    <button
      onClick={() => go(dir)}
      aria-label={dir < 0 ? 'Previous machine' : 'Next machine'}
      style={{
        background: 'none',
        border: '1px solid var(--border-color)',
        color: 'var(--text-color)',
        width: '40px',
        height: '64px',
        cursor: 'pointer',
        fontSize: '20px',
        fontFamily: 'inherit',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <EventLog messages={gameState.recentMessages} />
      <style>{`
        @keyframes factoryPowerGlow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '760px',
        margin: '0 auto',
        padding: '32px 24px',
        minHeight: '100vh',
        color: 'var(--text-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '22px', letterSpacing: '2px', textTransform: 'uppercase' }}>The Construct</div>
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
              Research with intelligence. Build with lucidity. Let it run.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-color)',
              padding: '10px 20px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', letterSpacing: '1px',
            }}
          >
            CLOSE
          </button>
        </div>

        {/* Power bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
              Power {starved ? '\u2014 machines stalling' : draining ? '\u2014 draining' : '\u2014 charging'}
            </span>
            <span style={{ opacity: 0.8 }}>
              {Math.floor(stats.power)} / {stats.powerCapacity} &nbsp;
              <span style={{ color: stats.powerNetPerSec >= 0 ? '#6bff9f' : '#ffb454' }}>
                ({stats.powerNetPerSec >= 0 ? '+' : ''}{stats.powerNetPerSec.toFixed(1)}/s)
              </span>
            </span>
          </div>
          <div style={{
            position: 'relative', height: '18px', backgroundColor: 'var(--bg-color)',
            border: '1px solid var(--border-color)', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: `${powerPct}%`,
              backgroundColor: powerColor, transition: 'width 0.2s linear',
              boxShadow: `0 0 10px 1px ${powerColor}`,
              animation: 'factoryPowerGlow 1.6s ease-in-out infinite',
            }} />
          </div>
          <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
            {`Generating ${stats.powerGenPerSec}/s \u2022 Using ${stats.powerUsePerSec}/s`}
          </div>
        </div>

        {/* Resource chips + production summary */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center',
          padding: '10px 12px', border: '1px solid var(--border-color)',
          backgroundColor: 'var(--hover-color)', marginBottom: '8px',
        }}>
          {chip('Substrate', `${Math.floor(stats.substrate)}${subStarved ? ' (dry)' : ''}`, subStarved ? '#ff6b6b' : '#c46bff')}
          {chip('Lucidity', lucidity, '#00d0ff')}
          {chip('Intelligence', intelligence, '#ffd060')}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '20px' }}>
          Producing:{' '}
          {['pp', 'paper', 'lucidity', 'intelligence', 'material']
            .map((r) => fmtRate(r, stats.outputs[r]))
            .filter(Boolean)
            .join('  \u2022  ') || 'nothing yet \u2014 build extractors and converters'}
        </div>

        {/* Machine tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {FACTORY_MACHINES.map((m, i) => {
            const c = getMachineCount(gameState, m.id);
            const locked = m.blueprint && !(gameState.factoryBlueprints || []).includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => setSelected(i)}
                style={{
                  background: i === selected ? 'var(--accent-color)' : 'none',
                  border: `1px solid ${i === selected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  color: i === selected ? 'var(--bg-color)' : 'var(--text-color)',
                  padding: '6px 10px', cursor: 'pointer', fontSize: '10px', fontFamily: 'inherit',
                  letterSpacing: '0.5px', opacity: locked && i !== selected ? 0.5 : 1,
                }}
              >
                {m.name}{c > 0 ? ` x${c}` : ''}
              </button>
            );
          })}
        </div>

        {/* Featured machine */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '12px' }}>
          {arrowBtn('\u2039', -1)}
          <div style={{
            flex: 1, border: `1px solid ${machine.material}`, backgroundColor: 'var(--hover-color)',
            padding: '20px', display: 'flex', gap: '20px', alignItems: 'center',
          }}>
            <div style={{
              width: '180px', height: '180px', flexShrink: 0, backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FactorySprite machineId={machine.id} display={176} animate={researched && owned > 0} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{machine.name}</span>
                <span style={{ fontSize: '15px', opacity: 0.8 }}>owned: {owned}</span>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '8px', lineHeight: '1.5' }}>{machine.desc}</div>
              <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '12px' }}>{effects.join('  \u2022  ')}</div>

              <div style={{ marginTop: '20px' }}>
                {!researched ? (
                  <button
                    onClick={() => actions.researchBlueprint(machine.id)}
                    disabled={!researchable}
                    style={{
                      background: researchable ? '#ffd060' : 'none', border: '1px solid var(--border-color)',
                      color: researchable ? '#1a1a1a' : 'var(--text-color)', padding: '12px 18px',
                      cursor: researchable ? 'pointer' : 'not-allowed', fontSize: '13px', fontFamily: 'inherit',
                      letterSpacing: '1px', opacity: researchable ? 1 : 0.5,
                    }}
                  >
                    RESEARCH ({machine.blueprint.intelligence} intelligence)
                  </button>
                ) : (
                  <button
                    onClick={() => actions.buildMachine(machine.id)}
                    disabled={!buildable}
                    style={{
                      background: buildable ? 'var(--accent-color)' : 'none', border: '1px solid var(--border-color)',
                      color: buildable ? 'var(--bg-color)' : 'var(--text-color)', padding: '12px 18px',
                      cursor: buildable ? 'pointer' : 'not-allowed', fontSize: '13px', fontFamily: 'inherit',
                      letterSpacing: '1px', opacity: buildable ? 1 : 0.5,
                    }}
                  >
                    BUILD ({Object.entries(buildCost).map(([res, amt]) => `${amt} ${res}`).join(' + ')})
                  </button>
                )}
              </div>
            </div>
          </div>
          {arrowBtn('\u203a', 1)}
        </div>
      </div>

      <NotificationPopup notifications={notifications} onDismiss={onDismissNotification} />
    </>
  );
}

FactoryPanel.displayName = 'FactoryPanel';
export default React.memo(FactoryPanel);
