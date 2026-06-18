import React, { useEffect, useState } from 'react';
import EventLog from './EventLog';
import NotificationPopup from './NotificationPopup';
import FactorySprite from './FactorySprite';
import { formatPP } from './gameUtils';
import {
  getFactoryStats,
  getEffectiveMachineStats,
  getMachineLevel,
  isBuilt,
  isBlueprintResearched,
  canBuildMachine,
  canResearchBlueprint,
  canUpgradeMachine,
  getNextUpgrade,
  getUpgradeCost,
  MAX_UPGRADE_LEVEL,
} from './factoryHelpers';
import { FACTORY_MACHINES, FACTORY_UPGRADES } from './constants';

/**
 * Factory Panel ("The Construct", Chapter 2 Phase 2 / v2)
 *
 * Singular machines, each with a 10-step upgrade track. One machine is featured
 * at a time (click the tabs or arrows to move). Power is a glowing battery bar;
 * each machine drains its own power and HALTS when the battery can't cover it.
 */
function FactoryPanel({ gameState, actions, onClose, notifications, onDismissNotification }) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') setSelected((s) => (s - 1 + FACTORY_MACHINES.length) % FACTORY_MACHINES.length);
      else if (e.key === 'ArrowRight') setSelected((s) => (s + 1) % FACTORY_MACHINES.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const stats = getFactoryStats(gameState);
  const lucidity = Math.floor(gameState.lucidity || 0);
  const intelligence = Math.floor(gameState.intelligence || 0);

  const starved = stats.anyHalted;
  const draining = stats.powerNetPerSec < 0 && stats.power > 0;
  const powerPct = stats.powerCapacity > 0 ? Math.min(100, (stats.power / stats.powerCapacity) * 100) : 0;
  const powerColor = starved ? '#ff6b6b' : draining ? '#ffb454' : '#9fe8ff';
  const subStarved = stats.subNetPerSec < 0 && stats.substrate <= 0;

  const machine = FACTORY_MACHINES[selected];
  const built = isBuilt(gameState, machine.id);
  const researched = isBlueprintResearched(machine, gameState);
  const level = getMachineLevel(gameState, machine.id);
  const eff = getEffectiveMachineStats(gameState, machine);
  const isConsumer = machine.priority !== undefined;
  const runState = stats.status[machine.id];

  let statusLabel = 'NOT BUILT';
  let statusColor = 'var(--text-color)';
  if (built) {
    if (!isConsumer) { statusLabel = 'ACTIVE'; statusColor = '#6bff9f'; }
    else if (runState === 'running') { statusLabel = 'RUNNING'; statusColor = '#6bff9f'; }
    else { statusLabel = 'HALTED \u2014 low power/substrate'; statusColor = '#ff6b6b'; }
  }

  const machineEffects = [];
  if (eff.powerGen) machineEffects.push(`+${eff.powerGen.toFixed(1)} power/s`);
  if (eff.powerUse) machineEffects.push(`-${eff.powerUse.toFixed(1)} power/s`);
  if (eff.powerCapacity) machineEffects.push(`+${Math.round(eff.powerCapacity)} capacity`);
  if (eff.substrate > 0) machineEffects.push(`+${eff.substrate.toFixed(2)} substrate/s`);
  if (eff.substrate < 0) machineEffects.push(`${eff.substrate.toFixed(2)} substrate/s`);
  if (eff.output) machineEffects.push(`+${eff.output.rate.toFixed(2)} ${eff.output.resource}/s${eff.output.scalesWithPPTier ? ' x tier' : ''}`);

  const nextUpgrade = getNextUpgrade(gameState, machine.id);
  const upgradeCost = level < MAX_UPGRADE_LEVEL ? getUpgradeCost(level + 1) : null;
  const upgradeAffordable = canUpgradeMachine(gameState, machine.id);

  const fmtRate = (resource, perSec) => {
    if (perSec <= 0) return null;
    if (resource === 'pp') return `+${formatPP(perSec)} PP/s`;
    if (resource === 'material') return `+${perSec.toFixed(3)} mat/s`;
    return `+${perSec.toFixed(2)} ${resource}/s`;
  };
  const costLabel = (cost) => Object.entries(cost).map(([res, amt]) => `${amt} ${res}`).join(' + ');

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
        background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-color)',
        width: '40px', minHeight: '64px', cursor: 'pointer', fontSize: '20px', fontFamily: 'inherit', flexShrink: 0,
      }}
    >
      {label}
    </button>
  );

  const upgradeList = FACTORY_UPGRADES[machine.id] || [];

  return (
    <>
      <EventLog messages={gameState.recentMessages} />
      <style>{`@keyframes factoryPowerGlow { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }`}</style>
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '820px', margin: '0 auto', padding: '32px 24px', minHeight: '100vh', color: 'var(--text-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '22px', letterSpacing: '2px', textTransform: 'uppercase' }}>The Construct</div>
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
              One of each, cobbled from the office. Build, upgrade, and keep the power flowing.
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
              Power {starved ? '\u2014 machines halting' : draining ? '\u2014 draining' : '\u2014 charging'}
            </span>
            <span style={{ opacity: 0.8 }}>
              {Math.floor(stats.power)} / {Math.round(stats.powerCapacity)} &nbsp;
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
              boxShadow: `0 0 10px 1px ${powerColor}`, animation: 'factoryPowerGlow 1.6s ease-in-out infinite',
            }} />
          </div>
          <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
            {`Generating ${stats.powerGenPerSec.toFixed(1)}/s \u2022 Demand ${stats.powerUsePerSec.toFixed(1)}/s`}
          </div>
        </div>

        {/* Resource chips + production summary */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', padding: '10px 12px',
          border: '1px solid var(--border-color)', backgroundColor: 'var(--hover-color)', marginBottom: '8px',
        }}>
          {chip('Substrate', `${Math.floor(stats.substrate)}${subStarved ? ' (dry)' : ''}`, subStarved ? '#ff6b6b' : '#c46bff')}
          {chip('Lucidity', lucidity, '#00d0ff')}
          {chip('Intelligence', intelligence, '#ffd060')}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '18px' }}>
          Producing:{' '}
          {['pp', 'paper', 'lucidity', 'intelligence', 'material']
            .map((r) => fmtRate(r, stats.outputs[r]))
            .filter(Boolean)
            .join('  \u2022  ') || 'nothing yet \u2014 build a generator, extractor, and a converter'}
        </div>

        {/* Machine tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {FACTORY_MACHINES.map((m, i) => {
            const b = isBuilt(gameState, m.id);
            const lvl = getMachineLevel(gameState, m.id);
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
                  letterSpacing: '0.5px', opacity: locked && !b && i !== selected ? 0.5 : 1,
                }}
              >
                {m.name}{b ? ` L${lvl}` : ''}
              </button>
            );
          })}
        </div>

        {/* Featured machine */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '12px' }}>
          {arrowBtn('\u2039', -1)}
          <div style={{ flex: 1, border: `1px solid ${machine.material}`, backgroundColor: 'var(--hover-color)', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{
                width: '160px', height: '160px', flexShrink: 0, backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FactorySprite machineId={machine.id} display={156} animate={built && runState !== 'halted'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{machine.name}</span>
                  <span style={{ fontSize: '11px', color: statusColor, whiteSpace: 'nowrap' }}>{statusLabel}</span>
                </div>
                {built && (
                  <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>Level {level} / {MAX_UPGRADE_LEVEL}</div>
                )}
                <div style={{ fontSize: '11px', opacity: 0.65, fontStyle: 'italic', marginTop: '10px', lineHeight: '1.55' }}>
                  {machine.lore}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '12px' }}>{machineEffects.join('  \u2022  ')}</div>

                <div style={{ marginTop: '16px' }}>
                  {!built ? (
                    !researched ? (
                      <button
                        onClick={() => actions.researchBlueprint(machine.id)}
                        disabled={!canResearchBlueprint(machine, gameState)}
                        style={btnStyle(canResearchBlueprint(machine, gameState), '#ffd060', '#1a1a1a')}
                      >
                        RESEARCH ({machine.blueprint.intelligence} intelligence)
                      </button>
                    ) : (
                      <button
                        onClick={() => actions.buildMachine(machine.id)}
                        disabled={!canBuildMachine(machine, gameState)}
                        style={btnStyle(canBuildMachine(machine, gameState), 'var(--accent-color)', 'var(--bg-color)')}
                      >
                        BUILD ({costLabel(machine.buildCost)})
                      </button>
                    )
                  ) : nextUpgrade ? (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{nextUpgrade.name}</div>
                      <div style={{ fontSize: '11px', opacity: 0.7, margin: '4px 0 10px' }}>{nextUpgrade.desc}</div>
                      <button
                        onClick={() => actions.upgradeMachine(machine.id)}
                        disabled={!upgradeAffordable}
                        style={btnStyle(upgradeAffordable, machine.material, '#1a1a1a')}
                      >
                        UPGRADE ({costLabel(upgradeCost)})
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: machine.material }}>FULLY UPGRADED</div>
                  )}
                </div>
              </div>
            </div>

            {/* Upgrade track */}
            {built && upgradeList.length > 0 && (
              <div style={{ marginTop: '18px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '8px' }}>
                  Upgrades
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                  {upgradeList.map((u, i) => {
                    const done = i < level;
                    const isNext = i === level;
                    return (
                      <div key={i} style={{
                        fontSize: '11px', display: 'flex', justifyContent: 'space-between', gap: '8px',
                        opacity: done ? 0.9 : isNext ? 1 : 0.4,
                        color: done ? machine.material : 'var(--text-color)',
                      }}>
                        <span>{done ? '\u2713' : isNext ? '\u2192' : '\u2022'} {u.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {arrowBtn('\u203a', 1)}
        </div>
      </div>

      <NotificationPopup notifications={notifications} onDismiss={onDismissNotification} />
    </>
  );
}

function btnStyle(enabled, bg, fg) {
  return {
    background: enabled ? bg : 'none',
    border: '1px solid var(--border-color)',
    color: enabled ? fg : 'var(--text-color)',
    padding: '12px 18px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontSize: '13px',
    fontFamily: 'inherit',
    letterSpacing: '1px',
    opacity: enabled ? 1 : 0.5,
  };
}

FactoryPanel.displayName = 'FactoryPanel';
export default React.memo(FactoryPanel);
