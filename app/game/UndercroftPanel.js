import React, { useEffect, useState } from 'react';
import EventLog from './EventLog';
import NotificationPopup from './NotificationPopup';
import ChartCanvas from './ChartCanvas';
import MindPortrait from './MindPortrait';
import { formatPP } from './gameUtils';
import {
  GEAR_BLUEPRINTS,
  PROVISION_TYPES,
  EXPEDITION,
  ROLL_PITY_THRESHOLD,
} from './constants';
import { DIMENSIONAL_MATERIALS } from './dimensionalConstants';
import { getGatewayCore, nodeDepth } from './expeditionChart';
import {
  getWeaponType,
  getWeaponRarity,
  getWeaponMight,
  getWeaponCraftCost,
  parseBlueprintKey,
  getPrintCost,
  getTrait,
  getProvisionType,
  getFoeArchetype,
  getKitCapabilities,
  buildEncounters,
  buildSurveyEncounters,
  computeRisk,
  getLetRideChance,
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
  const [selNode, setSelNode] = useState(null);
  const [kitMind, setKitMind] = useState(null);
  const [kitShell, setKitShell] = useState(null);
  const [kitWeapon, setKitWeapon] = useState(null);
  const [kitGear, setKitGear] = useState([]);
  const [prov, setProv] = useState({});
  const [surveyDepth, setSurveyDepth] = useState(0.5);
  const tab = gameState.undercroftTab || 'chart';

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
  const rosterBusy = new Set((gameState.expeditions || []).map((e) => e.mindId));
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
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <MindPortrait mind={m} size={40} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flex: 1 }}>
                <strong style={{ fontSize: '14px', letterSpacing: '1px' }}>{m.designation}</strong>
                <span style={{ fontSize: '11px', opacity: 0.6 }}>Lv {m.level}</span>
              </div>
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
                {rosterBusy.has(m.id) ? 'On expedition' : 'Idle'}
              </span>
              {!rosterBusy.has(m.id) && actBtn('RETIRE', () => actions.discardMind(m.id), true)}
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

  // ---- CHART (expeditions hub) -------------------------------------------
  const pages = gameState.chartPages || [];
  const tierSel = gameState.currentTier || 0;
  const page = pages.find((p) => p.tier === tierSel) || pages[0] || null;
  const activeExps = gameState.expeditions || [];
  const busyMind = new Set(activeExps.map((e) => e.mindId));
  const busyShell = new Set(activeExps.map((e) => e.shellId));
  const busyWeapon = new Set(activeExps.map((e) => e.weaponId).filter(Boolean));
  const availMinds = minds.filter((m) => !busyMind.has(m.id));
  const availShells = (gameState.shells || []).filter((s) => !busyShell.has(s.id));
  const availWeapons = weapons.filter((w) => !busyWeapon.has(w.id));
  const pageTier = page ? page.tier : tierSel;
  const node = page && selNode ? page.nodes.find((n) => n.id === selNode) : null;

  const kit = { mindId: kitMind, shellId: kitShell, weaponId: kitWeapon, gear: kitGear, provisions: prov };
  const caps = (kitMind && kitShell) ? getKitCapabilities(gameState, kit) : null;
  let risk = null;
  if (caps) {
    const enc = node
      ? buildEncounters(node, pageTier, caps, 'preview')
      : buildSurveyEncounters(pageTier, surveyDepth, caps, 'preview');
    risk = computeRisk(caps, enc);
  }

  const bandColor = (b) => ({ Safe: '#5fb878', Risky: '#ffb454', Grave: '#e8995c', Suicidal: '#ff5c5c' }[b] || 'var(--text-color)');
  const axisMark = (p) => (p < 0.15 ? '\u2713 ok' : p < 0.5 ? '\u26a0 weak' : '\u2717 exposed');
  const ownedGear = Object.entries(gameState.gearInventory || {}).filter(([, n]) => n > 0).map(([id]) => id);
  // A pre-loaded Clarity Charge auto-retreats the expedition at its first brink
  // (insurance). You can also keep charges in reserve and spend one reactively
  // when a brink prompt appears.
  const ownedProv = Object.entries(gameState.provisions || {}).filter(([, n]) => n > 0);
  const toggleGear = (id) => setKitGear((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  const setProvQty = (id, q, max) => setProv((p) => ({ ...p, [id]: Math.max(0, Math.min(max, q)) }));

  const pickChip = (label, active, onClick, color) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        background: active ? 'var(--text-color)' : 'none',
        color: active ? 'var(--bg-color)' : (color || 'var(--text-color)'),
        border: `1px solid ${active ? 'var(--text-color)' : (color || 'var(--border-color)')}`,
        padding: '5px 9px', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );

  const nodeHint = (n) => {
    const depthPct = Math.round(nodeDepth(n) * 100);
    if (n.type === 'haunt' || n.type === 'anomaly') {
      const foe = getFoeArchetype(n.archetype);
      return foe ? `Depth ${depthPct}%. ${foe.foeName} (${foe.name}): ${foe.desc}` : `Depth ${depthPct}%.`;
    }
    return `Depth ${depthPct}%. A ${n.type} waiting in the dark.`;
  };

  const launch = () => {
    if (!kitMind || !kitShell || !page) return;
    if (node) actions.dispatchDelve({ mindId: kitMind, shellId: kitShell, weaponId: kitWeapon, gear: kitGear, provisions: prov, tier: page.tier, nodeId: node.id });
    else actions.dispatchSurvey({ mindId: kitMind, shellId: kitShell, weaponId: kitWeapon, gear: kitGear, provisions: prov, tier: page.tier, depth: surveyDepth });
    setProv({});
  };

  const brinkExps = activeExps.filter((e) => e.awaiting);
  const clarityStock = (gameState.provisions || {}).clarity_charge || 0;

  const renderChart = () => {
    if (!page) return <div style={{ fontSize: '12px', opacity: 0.6 }}>The chart is still forming...</div>;
    return (
      <div>
      {brinkExps.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {brinkExps.map((e) => {
            const m = minds.find((mm) => mm.id === e.mindId);
            const odds = Math.round(getLetRideChance(m) * 100);
            return (
              <div key={e.id} style={{ border: '1px solid #c2353c', boxShadow: '0 0 12px -2px #c2353c', padding: '12px', marginBottom: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <MindPortrait mind={m} size={48} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px' }}><strong>{m ? m.designation : 'A mind'}</strong> is at the BRINK.</div>
                  <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '3px' }}>
                    Spend a Clarity Charge to pull them out safely, or let it ride ({odds}% they crawl back, scarred; otherwise lost for good).
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {actBtn(`SPEND CLARITY (${clarityStock})`, () => actions.resolveBrink(e.id, 'save'), clarityStock > 0)}
                    {actBtn('LET IT RIDE', () => actions.resolveBrink(e.id, 'risk'), true)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 360px', minWidth: '300px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {pages.map((p) => (
              <button
                key={p.tier}
                onClick={() => { actions.selectTier(p.tier); setSelNode(null); }}
                style={{ background: p.tier === pageTier ? 'var(--text-color)' : 'none', color: p.tier === pageTier ? 'var(--bg-color)' : 'var(--text-color)', border: '1px solid var(--border-color)', padding: '5px 12px', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' }}
              >
                Tier {p.tier + 1}{p.breached ? ' \u2713' : ''}
              </button>
            ))}
          </div>
          <ChartCanvas page={page} expeditions={activeExps.filter((e) => e.tier === pageTier)} selectedNodeId={selNode} onSelectNode={setSelNode} size={384} />
          <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '6px' }}>
            Click a charted site to plan a Delve. Click empty dark to plan a Survey.
          </div>
          <div style={{ marginTop: '16px' }}>
            {sectionTitle('In the dark', activeExps.length === 0 ? 'No active expeditions.' : null)}
            {activeExps.map((e) => {
              const m = minds.find((mm) => mm.id === e.mindId);
              const pct = Math.round((e.progress || 0) * 100);
              return (
                <div key={e.id} style={{ border: '1px solid var(--border-color)', padding: '8px 10px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>{m ? m.designation : 'A mind'} - {e.kind === 'delve' ? 'Delve' : 'Survey'} (T{e.tier + 1})</span>
                    <span style={{ opacity: 0.7 }}>{pct}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', marginTop: '4px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#9fe8ff' }} />
                  </div>
                  {(e.log || []).slice(-2).map((l, i) => (
                    <div key={i} style={{ fontSize: '10px', opacity: 0.55, marginTop: '3px' }}>{l}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: '1 1 300px', minWidth: '280px', border: '1px solid var(--border-color)', padding: '14px' }}>
          {sectionTitle(node ? `Delve: ${node.type}` : 'Survey the dark', node ? nodeHint(node) : 'Push into the unknown to chart new sites.')}

          {!node && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>Push depth: {Math.round(surveyDepth * 100)}%</div>
              <input type="range" min="20" max="100" value={Math.round(surveyDepth * 100)} onChange={(ev) => setSurveyDepth(Number(ev.target.value) / 100)} style={{ width: '100%' }} />
            </div>
          )}

          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '4px' }}>Mind</div>
            {availMinds.length === 0 && <div style={{ fontSize: '11px', opacity: 0.5 }}>No idle minds. Print one in the Workbench.</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {availMinds.map((m) => pickChip(`${m.designation} L${m.level}`, kitMind === m.id, () => setKitMind(m.id)))}
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '4px' }}>Shell</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              {availShells.map((s, i) => pickChip(`Shell ${i + 1} (${s.maxHp}hp)`, kitShell === s.id, () => setKitShell(s.id)))}
              {actBtn('+ ASSEMBLE', () => actions.craftShell(), canAffordCraft(gameState, EXPEDITION.shellCost))}
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '4px' }}>Weapon</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {pickChip('None', !kitWeapon, () => setKitWeapon(null))}
              {availWeapons.map((w) => {
                const t = getWeaponType(w.typeId);
                const r = getWeaponRarity(w.rarityId);
                return pickChip(`${t ? t.name : ''} (${getWeaponMight(w.typeId, w.rarityId)})`, kitWeapon === w.id, () => setKitWeapon(w.id), r ? r.color : null);
              })}
            </div>
            {availWeapons.length === 0 && <div style={{ fontSize: '11px', opacity: 0.5 }}>No forged weapons. Roll and forge in Blueprints.</div>}
          </div>

          {ownedGear.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '4px' }}>Gear</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {ownedGear.map((id) => pickChip((GEAR_BLUEPRINTS.find((g) => g.id === id) || {}).name || id, kitGear.includes(id), () => toggleGear(id)))}
              </div>
            </div>
          )}

          {ownedProv.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '4px' }}>Provisions</div>
              {ownedProv.map(([id, owned]) => {
                const p = getProvisionType(id);
                const q = prov[id] || 0;
                // A pre-loaded Clarity Charge fires once (auto-retreat); cap at 1.
                const max = id === 'clarity_charge' ? Math.min(1, owned) : owned;
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginBottom: '3px' }}>
                    <span>{p ? p.name : id} <span style={{ opacity: 0.5 }}>({owned})</span></span>
                    <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {actBtn('-', () => setProvQty(id, q - 1, max), q > 0)}
                      <strong>{q}</strong>
                      {actBtn('+', () => setProvQty(id, q + 1, max), q < max)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {risk && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                Survival: <strong style={{ color: bandColor(risk.band) }}>{risk.band}</strong>
              </div>
              <div style={{ fontSize: '11px', opacity: 0.85, lineHeight: 1.8 }}>
                <div>Combat {axisMark(risk.axes.combat)}</div>
                <div>Dark {axisMark(risk.axes.dark)}</div>
                <div>Dread {axisMark(risk.axes.dread)}</div>
                <div>Corruption {axisMark(risk.axes.corruption)}</div>
              </div>
              <div style={{ fontSize: '10px', opacity: 0.55, marginTop: '6px' }}>
                Projected end: {risk.shellHp} shell / {risk.resolve} resolve / {risk.corruption} corruption.
                {!risk.survived && ' This mind would hit the brink. For now it retreats; permanent loss arrives next phase.'}
              </div>
            </div>
          )}

          {node && node.type === 'gateway' && (
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '10px' }}>
              Breaching consumes 1 {getGatewayCore(pageTier).replace(/_/g, ' ')}.
            </div>
          )}

          {node && (node.cleared || node.looted) && (
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '10px' }}>
              This site is already cleared. Select another, or click empty dark to survey.
            </div>
          )}

          <button
            onClick={launch}
            disabled={!kitMind || !kitShell || (node && (node.cleared || node.looted))}
            style={{ width: '100%', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '12px', cursor: (kitMind && kitShell && !(node && (node.cleared || node.looted))) ? 'pointer' : 'not-allowed', fontSize: '12px', fontFamily: 'inherit', letterSpacing: '1px', textTransform: 'uppercase', opacity: (kitMind && kitShell && !(node && (node.cleared || node.looted))) ? 1 : 0.4 }}
          >
            {node ? 'Launch Delve' : 'Launch Survey'}
          </button>
        </div>
      </div>
      </div>
    );
  };

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

        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
          {tabBtn('chart', 'Chart')}
          {tabBtn('roster', 'Roster')}
          {tabBtn('workbench', 'Workbench')}
          {tabBtn('blueprints', 'Blueprints')}
        </div>

        {tab === 'chart' && renderChart()}
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
