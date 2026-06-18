import React, { useEffect, useState } from 'react';
import EventLog from './EventLog';
import NotificationPopup from './NotificationPopup';
import FactorySprite from './FactorySprite';
import { formatPP } from './gameUtils';
import {
  getFactoryStats,
  getEffectiveMachineStats,
  getMachineLevel,
  getMaxLevel,
  isBuilt,
  isPaused,
  isOverclockUnlocked,
  getOverclock,
  isBlueprintResearched,
  canBuildMachine,
  canResearchBlueprint,
  canUpgradeMachine,
  getNextUpgrade,
  getUpgradeCost,
  MIN_OVERCLOCK,
  MAX_OVERCLOCK,
  OVERCLOCK_STEP,
} from './factoryHelpers';
import { FACTORY_MACHINES, FACTORY_UPGRADES } from './constants';

/**
 * Factory Panel ("The Construct", Chapter 2 Phase 2 / v2)
 *
 * Singular machines, each with a 10-step upgrade track. One machine is featured
 * at a time (click the tabs or arrows to move). Power is a battery bar; each
 * machine drains its own power and HALTS when the battery can't cover it.
 *
 * Text is kept standard-coloured for readability; the only coloured element is
 * the functional power bar fill (charging / draining / halting).
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
  const maxLevel = getMaxLevel(machine.id);
  const eff = getEffectiveMachineStats(gameState, machine);
  const isConsumer = machine.priority !== undefined;
  const runState = stats.status[machine.id];
  const paused = isPaused(gameState, machine.id);
  const overclockUnlocked = isOverclockUnlocked(gameState, machine.id);
  const overclock = getOverclock(gameState, machine.id);

  let statusLabel = 'NOT BUILT';
  if (built) {
    if (paused) statusLabel = 'PAUSED';
    else if (!isConsumer) statusLabel = 'ACTIVE';
    else if (runState === 'running') statusLabel = 'RUNNING';
    else statusLabel = 'HALTED \u2014 low power/substrate';
  }

  const machineEffects = [];
  if (eff.powerGen) machineEffects.push(`+${eff.powerGen.toFixed(1)} power/s`);
  if (eff.powerUse) machineEffects.push(`-${eff.powerUse.toFixed(1)} power/s`);
  if (eff.powerCapacity) machineEffects.push(`+${Math.round(eff.powerCapacity)} capacity`);
  if (eff.substrate > 0) machineEffects.push(`+${eff.substrate.toFixed(2)} substrate/s`);
  if (eff.substrate < 0) machineEffects.push(`${eff.substrate.toFixed(2)} substrate/s`);
  if (eff.output) machineEffects.push(`+${eff.output.rate.toFixed(2)} ${eff.output.resource}/s${eff.output.scalesWithPPTier ? ' x tier' : ''}`);

  const nextUpgrade = getNextUpgrade(gameState, machine.id);
  const upgradeCost = level < maxLevel ? getUpgradeCost(level + 1) : null;
  const upgradeAffordable = canUpgradeMachine(gameState, machine.id);

  const fmtRate = (resource, perSec) => {
    if (perSec <= 0) return null;
    if (resource === 'pp') return `+${formatPP(perSec)} PP/s`;
    if (resource === 'material') return `+${perSec.toFixed(3)} mat/s`;
    return `+${perSec.toFixed(2)} ${resource}/s`;
  };
  const costLabel = (cost) => Object.entries(cost).map(([res, amt]) => `${amt} ${res}`).join(' + ');

  const chip = (label, value) => (
    <span style={{ fontSize: '12px' }}>
      <span style={{ opacity: 0.6 }}>{label} </span>
      <strong>{value}</strong>
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

        {/* Power bar (the fill colour is a functional indicator) */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
              Power {starved ? '\u2014 machines halting' : draining ? '\u2014 draining' : '\u2014 charging'}
            </span>
            <span style={{ opacity: 0.8 }}>
              {Math.floor(stats.power)} / {Math.round(stats.powerCapacity)} &nbsp;
              ({stats.powerNetPerSec >= 0 ? '+' : ''}{stats.powerNetPerSec.toFixed(1)}/s)
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
          {chip('Substrate', `${Math.floor(stats.substrate)}${subStarved ? ' (dry)' : ''}`)}
          {chip('Lucidity', lucidity)}
          {chip('Intelligence', intelligence)}
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
                  border: '1px solid var(--border-color)',
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
          <div style={{ flex: 1, border: '1px solid var(--border-color)', backgroundColor: 'var(--hover-color)', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{
                width: '208px', height: '208px', flexShrink: 0, backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FactorySprite machineId={machine.id} level={level} display={200} animate={built && !paused && runState !== 'halted'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{machine.name}</span>
                  <span style={{ fontSize: '11px', opacity: 0.75, whiteSpace: 'nowrap' }}>{statusLabel}</span>
                </div>
                {built && (
                  <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>Level {level} / {maxLevel}</div>
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
                        style={btnStyle(canResearchBlueprint(machine, gameState))}
                      >
                        RESEARCH ({machine.blueprint.intelligence} intelligence)
                      </button>
                    ) : (
                      <button
                        onClick={() => actions.buildMachine(machine.id)}
                        disabled={!canBuildMachine(machine, gameState)}
                        style={btnStyle(canBuildMachine(machine, gameState))}
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
                        style={btnStyle(upgradeAffordable)}
                      >
                        UPGRADE ({costLabel(upgradeCost)})
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>FULLY UPGRADED</div>
                  )}
                </div>

                {built && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      onClick={() => actions.toggleMachinePause(machine.id)}
                      style={{
                        background: paused ? 'var(--accent-color)' : 'none', border: '1px solid var(--border-color)',
                        color: paused ? 'var(--bg-color)' : 'var(--text-color)', padding: '8px 14px', cursor: 'pointer',
                        fontSize: '12px', fontFamily: 'inherit', letterSpacing: '1px', alignSelf: 'flex-start',
                      }}
                    >
                      {paused ? 'RESUME' : 'PAUSE'}
                    </button>
                    {overclockUnlocked && (
                      <div>
                        <div style={{ fontSize: '11px', opacity: 0.75, marginBottom: '6px' }}>
                          Overclock: <strong>{overclock}%</strong> power
                          {overclock !== 100 ? ` \u2014 \u00d7${(overclock / 100).toFixed(2)} output & drain` : ''}
                        </div>
                        <input
                          type="range"
                          min={MIN_OVERCLOCK}
                          max={MAX_OVERCLOCK}
                          step={OVERCLOCK_STEP}
                          value={overclock}
                          onChange={(e) => actions.setOverclock(machine.id, Number(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', opacity: 0.5 }}>
                          <span>{MIN_OVERCLOCK}%</span><span>100%</span><span>{MAX_OVERCLOCK}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                      <div key={i} style={{ fontSize: '11px', opacity: done ? 0.85 : isNext ? 1 : 0.4 }}>
                        {done ? '\u2713' : isNext ? '\u2192' : '\u2022'} {u.name}
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

function btnStyle(enabled) {
  return {
    background: enabled ? 'var(--accent-color)' : 'none',
    border: '1px solid var(--border-color)',
    color: enabled ? 'var(--bg-color)' : 'var(--text-color)',
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
