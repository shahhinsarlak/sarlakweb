import React, { useEffect, useState } from 'react';
import EventLog from './EventLog';
import NotificationPopup from './NotificationPopup';
import { formatPP } from './gameUtils';
import {
  GEAR_BLUEPRINTS,
  PROVISION_TYPES,
  EXPEDITION,
  ROLL_PITY_THRESHOLD,
} from './constants';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';
import {
  getWeaponType,
  getWeaponRarity,
  getWeaponMight,
  getWeaponCraftCost,
  parseBlueprintKey,
  getPrintCost,
  getTrait,
  canAffordCost,
  canAffordCraft,
} from './expeditionHelpers';

/**
 * The Undercroft (Chapter 2, Phase A).
 *
 * A tabbed console where the player prints minds, rolls weapon blueprints, and
 * crafts gear ahead of expeditions (dispatch arrives in Phase B). Text is kept
 * standard-coloured for readability; the only colour is rarity (the gacha
 * payoff) and functional state.
 */
function UndercroftPanel({ gameState, actions, onClose, notifications, onDismissNotification }) {
  const [rolling, setRolling] = useState(false);
  const tab = gameState.undercroftTab || 'roster';

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const matName = (id) => (DIMENSIONAL_MATERIALS.find((m) => m.id === id) || {}).name || id;
  const fmtCost = (cost) => {
    const parts = [];
    Object.entries(cost || {}).forEach(([r, a]) => {
      if (r === 'coreQty') return;
      if (r === 'core') { parts.push(`${cost.coreQty || 1} ${matName(a)}`); return; }
      parts.push(`${a} ${r === 'pp' ? 'PP' : r}`);
    });
    return parts.join(' + ');
  };

  const researched = gameState.researchedGear || [];
  const minds = gameState.minds || [];
  const weapons = gameState.weapons || [];
  const blueprints = gameState.weaponBlueprints || [];
  const rollCost = EXPEDITION.rollCost.intelligence;
  const canRoll = (gameState.intelligence || 0) >= rollCost;

  // ---- shared button helpers --------------------------------------------
  const tabBtn = (id, label) => (
    <button
      key={id}
      onClick={() => actions.switchUndercroftTab(id)}
      style={{
        background: tab === id ? 'var(--text-color)' : 'none',
        color: tab === id ? 'var(--bg-color)' : 'var(--text-color)',
        border: '1px solid var(--border-color)', padding: '8px 18px', cursor: 'pointer',
        fontSize: '12px', fontFamily: 'inherit', letterSpacing: '1px', textTransform: 'uppercase',
      }}
    >
      {label}
    </button>
  );

  const actBtn = (label, onClick, enabled) => (
    <button
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
      style={{
        background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-color)',
        padding: '8px 12px', cursor: enabled ? 'pointer' : 'not-allowed', fontSize: '11px',
        fontFamily: 'inherit', letterSpacing: '0.5px', opacity: enabled ? 1 : 0.4, whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );

  const chip = (label, value) => (
    <span style={{ fontSize: '12px', marginRight: '18px' }}>
      <span style={{ opacity: 0.55 }}>{label} </span>
      <strong>{value}</strong>
    </span>
  );

  const sectionTitle = (text, sub) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.85 }}>{text}</div>
      {sub && <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '3px' }}>{sub}</div>}
    </div>
  );

  // ---- ROSTER ------------------------------------------------------------
  const renderRoster = () => (
    <div>
      {sectionTitle('Roster', `Minds: ${minds.length} / ${gameState.printBeds || 3} print beds. A mind lost on an expedition is lost for good.`)}
      {minds.length === 0 && (
        <div style={{ fontSize: '12px', opacity: 0.6, padding: '16px 0' }}>
          You have not printed a mind yet. Go to the WORKBENCH and print a copy of yourself.
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
        {minds.map((m) => (
          <div key={m.id} style={{ border: '1px solid var(--border-color)', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: '14px', letterSpacing: '1px' }}>{m.designation}</strong>
              <span style={{ fontSize: '11px', opacity: 0.6 }}>Lv {m.level}</span>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>
              Resolve {Math.round(m.resolve)} &nbsp; Acuity {m.acuity} &nbsp; Will {m.will}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '6px', minHeight: '14px' }}>
              {(m.traits || []).length > 0
                ? (m.traits || []).map((t) => (getTrait(t) || {}).name).filter(Boolean).join(', ')
                : 'No traits yet'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
                {m.status === 'idle' ? 'Idle' : m.status}
              </span>
              {m.status === 'idle' && actBtn('RETIRE', () => actions.discardMind(m.id), true)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '28px' }}>
        {sectionTitle('Stores', 'Gear, weapons and provisions wait here until expeditions begin.')}
        <div style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1.9 }}>
          <div>
            <span style={{ opacity: 0.55 }}>Weapons forged: </span>
            <strong>{weapons.length}</strong>
            {weapons.length > 0 && (
              <span style={{ opacity: 0.6 }}>
                {' '}({weapons.slice(0, 6).map((w) => {
                  const t = getWeaponType(w.typeId); const r = getWeaponRarity(w.rarityId);
                  return `${r ? r.name : ''} ${t ? t.name : ''}`.trim();
                }).join(', ')}{weapons.length > 6 ? ', ...' : ''})
              </span>
            )}
          </div>
          <div>
            <span style={{ opacity: 0.55 }}>Gear: </span>
            <strong>
              {Object.entries(gameState.gearInventory || {}).filter(([, n]) => n > 0)
                .map(([id, n]) => `${(GEAR_BLUEPRINTS.find((g) => g.id === id) || {}).name || id} x${n}`)
                .join(', ') || 'none'}
            </strong>
          </div>
          <div>
            <span style={{ opacity: 0.55 }}>Provisions: </span>
            <strong>
              {Object.entries(gameState.provisions || {}).filter(([, n]) => n > 0)
                .map(([id, n]) => `${(PROVISION_TYPES.find((p) => p.id === id) || {}).name || id} x${n}`)
                .join(', ') || 'none'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );

  // ---- WORKBENCH ---------------------------------------------------------
  const renderPrintTier = (tier) => {
    const cost = getPrintCost(tier.id);
    const locked = tier.research && !researched.includes(tier.id);
    const bedsFull = minds.length >= (gameState.printBeds || 3);
    const affordable = canAffordCost(gameState, cost);
    return (
      <div key={tier.id} style={{ border: '1px solid var(--border-color)', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13px' }}><strong>{tier.name}</strong> <span style={{ opacity: 0.6, fontSize: '11px' }}>starts at level {tier.startLevel}{tier.extraTrait ? ', with a trait' : ''}</span></div>
          <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>Cost: {fmtCost(cost)}</div>
        </div>
        {locked
          ? actBtn(`RESEARCH (${fmtCost(tier.research)})`, () => actions.researchPrintTier(tier.id), canAffordCost(gameState, tier.research))
          : actBtn(bedsFull ? 'BEDS FULL' : 'PRINT', () => actions.printMind(tier.id), affordable && !bedsFull)}
      </div>
    );
  };

  const renderGearRow = (bp) => {
    const isResearched = researched.includes(bp.id);
    const owned = (gameState.gearInventory || {})[bp.id] || 0;
    return (
      <div key={bp.id} style={{ border: '1px solid var(--border-color)', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '13px' }}>
              <strong>{bp.name}</strong>
              {owned > 0 && <span style={{ opacity: 0.6, fontSize: '11px' }}> x{owned}</span>}
              <span style={{ opacity: 0.5, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '8px' }}>{bp.family}</span>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.65, marginTop: '4px' }}>{bp.desc}</div>
            <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
              {isResearched ? `Craft: ${fmtCost(bp.craft)}` : `Research: ${fmtCost(bp.research)}`}
            </div>
          </div>
          {isResearched
            ? actBtn('CRAFT', () => actions.craftGear(bp.id), canAffordCraft(gameState, bp.craft))
            : actBtn('RESEARCH', () => actions.researchGear(bp.id), canAffordCost(gameState, bp.research))}
        </div>
      </div>
    );
  };

  const renderProvision = (p) => {
    const owned = (gameState.provisions || {})[p.id] || 0;
    return (
      <div key={p.id} style={{ border: '1px solid var(--border-color)', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13px' }}><strong>{p.name}</strong>{owned > 0 && <span style={{ opacity: 0.6, fontSize: '11px' }}> x{owned}</span>}</div>
          <div style={{ fontSize: '11px', opacity: 0.65, marginTop: '4px' }}>{p.desc}</div>
          <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>Brew: {fmtCost(p.craft)}</div>
        </div>
        {actBtn('BREW', () => actions.brewProvision(p.id), canAffordCost(gameState, p.craft))}
      </div>
    );
  };

  const renderWorkbench = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div>
        {sectionTitle('Print a Mind', 'Copies of yourself, printed from paper, PP and lucidity. Premium processes start stronger.')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {EXPEDITION.printTiers.map(renderPrintTier)}
        </div>
      </div>
      <div>
        {sectionTitle('Craft Gear', 'Research a design with intelligence, then craft it with PP and a dimensional core.')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
          {GEAR_BLUEPRINTS.map(renderGearRow)}
        </div>
      </div>
      <div>
        {sectionTitle('Brew Provisions', 'One-shot consumables for an expedition. Clarity Charges pull a mind back from the brink.')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
          {PROVISION_TYPES.map(renderProvision)}
        </div>
      </div>
    </div>
  );

  // ---- BLUEPRINTS (the roll + library) -----------------------------------
  const last = gameState.lastRoll;
  const lastType = last ? getWeaponType(last.typeId) : null;
  const lastRarity = last ? getWeaponRarity(last.rarityId) : null;

  const renderReveal = () => {
    if (rolling) {
      return (
        <div style={{
          border: '1px solid var(--border-color)', padding: '22px', textAlign: 'center',
          animation: 'undercroftScan 0.5s linear infinite',
        }}>
          <div style={{ fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.8 }}>Decoding schematic</div>
          <div style={{ height: '10px', marginTop: '14px', background: 'linear-gradient(90deg, #9aa0a6, #4aa3ff, #b46bff, #ffb454, #ff5c5c, #9aa0a6)', backgroundSize: '300% 100%', animation: 'undercroftRoll 0.7s linear infinite' }} />
        </div>
      );
    }
    if (!last) {
      return (
        <div style={{ border: '1px dashed var(--border-color)', padding: '22px', textAlign: 'center', fontSize: '12px', opacity: 0.5 }}>
          Roll a schematic to discover a weapon blueprint. Every blueprint you find is yours forever.
        </div>
      );
    }
    return (
      <div style={{
        border: `2px solid ${lastRarity ? lastRarity.color : 'var(--border-color)'}`,
        boxShadow: `0 0 16px 1px ${lastRarity ? lastRarity.color : 'transparent'}`,
        padding: '18px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: lastRarity ? lastRarity.color : 'inherit' }}>
          {lastRarity ? lastRarity.name : ''}{last.dup ? ' (duplicate, salvaged)' : ''}
        </div>
        <div style={{ fontSize: '18px', letterSpacing: '1px', marginTop: '6px' }}>{lastType ? lastType.name : ''}</div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '6px' }}>Might {getWeaponMight(last.typeId, last.rarityId)}</div>
      </div>
    );
  };

  const renderLibrary = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
      {blueprints.length === 0 && (
        <div style={{ fontSize: '12px', opacity: 0.5 }}>No blueprints yet. Roll to begin your armoury.</div>
      )}
      {blueprints.map((key) => {
        const { typeId, rarityId } = parseBlueprintKey(key);
        const t = getWeaponType(typeId);
        const r = getWeaponRarity(rarityId);
        if (!t || !r) return null;
        const craftCost = getWeaponCraftCost(typeId, rarityId);
        const owned = weapons.filter((w) => w.typeId === typeId && w.rarityId === rarityId).length;
        return (
          <div key={key} style={{ border: `1px solid ${r.color}`, boxShadow: `0 0 8px -2px ${r.color}`, padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: '13px' }}>{t.name}</strong>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: r.color }}>{r.name}</span>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '6px' }}>Might {getWeaponMight(typeId, rarityId)}{owned > 0 ? ` \u2022 forged x${owned}` : ''}</div>
            <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '6px', minHeight: '30px' }}>{t.quirk}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '10px', opacity: 0.5 }}>{fmtCost(craftCost)}</span>
              {actBtn('FORGE', () => actions.craftWeapon(typeId, rarityId), canAffordCraft(gameState, craftCost))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const doRoll = () => {
    if (!canRoll || rolling) return;
    actions.rollBlueprint();
    setRolling(true);
    setTimeout(() => setRolling(false), 1300);
  };

  const renderBlueprints = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div>
        {sectionTitle('Schematic Roll', `Decode a random weapon blueprint with intelligence. Cost: ${rollCost} intelligence. A Rare or better is guaranteed at least every ${ROLL_PITY_THRESHOLD} rolls.`)}
        {renderReveal()}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
          {actBtn(rolling ? 'DECODING...' : `ROLL (${rollCost} INT)`, doRoll, canRoll && !rolling)}
          <span style={{ fontSize: '11px', opacity: 0.5 }}>Pity: {gameState.rollPity || 0} / {ROLL_PITY_THRESHOLD}</span>
        </div>
      </div>
      <div>
        {sectionTitle('Blueprint Library', `${blueprints.length} owned. Forge a physical weapon to carry on an expedition.`)}
        {renderLibrary()}
      </div>
    </div>
  );

  return (
    <>
      <EventLog messages={gameState.recentMessages} />
      <style>{`
        @keyframes undercroftRoll { 0% { background-position: 0% 0; } 100% { background-position: 300% 0; } }
        @keyframes undercroftScan { 0%,100% { opacity: 0.85; } 50% { opacity: 1; } }
      `}</style>
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '880px', margin: '0 auto', padding: '32px 24px', minHeight: '100vh', color: 'var(--text-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '22px', letterSpacing: '2px', textTransform: 'uppercase' }}>The Undercroft</div>
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
              Print minds, arm them, and prepare to go down into the dark. The way out is further in.
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

        <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 0', marginBottom: '18px' }}>
          {chip('PP', formatPP(Math.floor(gameState.pp || 0)))}
          {chip('Paper', Math.floor(gameState.paper || 0))}
          {chip('Lucidity', Math.floor(gameState.lucidity || 0))}
          {chip('Intelligence', Math.floor(gameState.intelligence || 0))}
          {chip('Energy', Math.floor(gameState.energy || 0))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
          {tabBtn('roster', 'Roster')}
          {tabBtn('workbench', 'Workbench')}
          {tabBtn('blueprints', 'Blueprints')}
        </div>

        {tab === 'roster' && renderRoster()}
        {tab === 'workbench' && renderWorkbench()}
        {tab === 'blueprints' && renderBlueprints()}
      </div>
      <NotificationPopup notifications={notifications} onDismiss={onDismissNotification} />
    </>
  );
}

UndercroftPanel.displayName = 'UndercroftPanel';
export default UndercroftPanel;
