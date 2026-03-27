import { getActiveSkillEffects } from './skillSystemHelpers';
import { getSanityTierDisplay, getActiveBuffPPMultiplier, getActiveBuffPPPerSecondMultiplier } from './sanityPaperHelpers';

export default function GameStatsPanel({
  gameState,
  calculateEffectivePPPerClick,
  getEffectivePPPerSecond,
  formatPP,
  buffTooltip,
  setBuffTooltip,
  actions,
  LEVEL_SYSTEM,
  PP_MULTIPLIER_TIERS,
  PRESTIGE_PATHS,
}) {
  return (
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
            <span>PP</span>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <strong style={{ fontSize: '18px' }}>{formatPP(gameState.pp)}</strong>
              {gameState.ppMultiplierTier > 0 && <span style={{ fontSize: '11px', color: 'var(--accent-color)', marginLeft: '6px', opacity: 0.8 }}>[T{gameState.ppMultiplierTier}]</span>}
            </span>
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
            <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px' }}>
              {(() => {
                const effects = getActiveSkillEffects(gameState);
                const tier = getSanityTierDisplay(gameState);
                const buffMult = getActiveBuffPPMultiplier(gameState);
                const totalSkillMult = (1 + effects.ppPerClickMultiplier) * (1 + effects.ppMultiplier) - 1;
                const skillBonus = totalSkillMult > 0 ? `+${(totalSkillMult * 100).toFixed(0)}%` : 'none';
                const sanityBonus = tier.ppModifier !== 1 ? `${tier.ppModifier >= 1 ? '+' : ''}${((tier.ppModifier - 1) * 100).toFixed(0)}%` : '0%';
                const buffBonus = buffMult !== 1 ? `+${((buffMult - 1) * 100).toFixed(0)}%` : 'none';

                const currentTier = gameState.ppMultiplierTier || 0;
                const tierData = PP_MULTIPLIER_TIERS.find(t => t.tier === currentTier);
                const tierName = tierData ? tierData.name : 'None';
                const tierMult = tierData ? tierData.multiplier : 1;
                const tierBonus = tierMult !== 1 ? `${tierMult}x` : 'none';

                return `Base: ${gameState.ppPerClick} \u2022 Skills: ${skillBonus} \u2022 Sanity: ${sanityBonus} \u2022 Buffs: ${buffBonus} \u2022 Tier: ${tierBonus} (${tierName})`;
              })()}
            </div>
            {gameState.focusModeExpiry > Date.now() && (
              <div style={{
                fontSize: '11px',
                color: '#f97316',
                fontWeight: 600,
                marginTop: '4px',
              }}>
                [FOCUS MODE: {Math.max(0, Math.ceil((gameState.focusModeExpiry - Date.now()) / 1000))}s]
              </div>
            )}
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
          {(() => {
            const sanityDisplay = getSanityTierDisplay(gameState);
            return (
              <div style={{
                fontSize: '10px',
                marginBottom: '16px',
                padding: '8px',
                backgroundColor: 'var(--bg-color)',
                border: `1px solid ${sanityDisplay.color}`,
                borderRadius: '2px'
              }}>
                <div style={{ color: sanityDisplay.color, fontWeight: 'bold', marginBottom: '4px' }}>
                  {sanityDisplay.tierName}
                </div>
                <div style={{ opacity: 0.8, marginBottom: '4px' }}>
                  PP: {sanityDisplay.ppModifier >= 1 ? '+' : ''}{((sanityDisplay.ppModifier - 1) * 100).toFixed(0)}% |
                  XP: {sanityDisplay.xpModifier >= 1 ? '+' : ''}{((sanityDisplay.xpModifier - 1) * 100).toFixed(0)}%
                </div>
                {gameState.printerUnlocked && (
                  <div style={{ opacity: 0.8 }}>
                    Paper Quality: {sanityDisplay.paperQuality}%
                  </div>
                )}
              </div>
            );
          })()}
          {gameState.ppPerSecond > 0 && (
            <div style={{
              fontSize: '11px',
              marginBottom: '16px',
              padding: '8px',
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '2px'
            }}>
              <div style={{ opacity: 0.7, marginBottom: '2px' }}>PP per second:</div>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                +{getEffectivePPPerSecond().toFixed(1)} PP
              </div>
              <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px' }}>
                {(() => {
                  const effects = getActiveSkillEffects(gameState);
                  const tier = getSanityTierDisplay(gameState);
                  const ppMult = getActiveBuffPPMultiplier(gameState);
                  const ppSecMult = getActiveBuffPPPerSecondMultiplier(gameState);
                  const totalSkillMult = (1 + effects.ppPerSecondMultiplier) * (1 + effects.ppMultiplier) - 1;
                  const skillBonus = totalSkillMult > 0 ? `+${(totalSkillMult * 100).toFixed(0)}%` : 'none';
                  const sanityBonus = tier.ppModifier !== 1 ? `${tier.ppModifier >= 1 ? '+' : ''}${((tier.ppModifier - 1) * 100).toFixed(0)}%` : '0%';
                  const ppBuffBonus = ppMult !== 1 ? `+${((ppMult - 1) * 100).toFixed(0)}%` : 'none';
                  const ppSecBuffBonus = ppSecMult !== 1 ? `+${((ppSecMult - 1) * 100).toFixed(0)}%` : 'none';

                  return `Base: ${gameState.ppPerSecond} \u2022 Skills: ${skillBonus} \u2022 Sanity: ${sanityBonus} \u2022 PP Buffs: ${ppBuffBonus} \u2022 Void Buffs: ${ppSecBuffBonus}`;
                })()}
              </div>
            </div>
          )}
          {gameState.prestigeCount > 0 && (
            <div style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
              marginTop: '16px',
              fontSize: '11px',
            }}>
              <div style={{ opacity: 0.6, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px' }}>
                PRESTIGE
              </div>
              <div style={{ marginBottom: '4px' }}>
                Run #{gameState.prestigeCount + 1} &bull; <span style={{ color: 'var(--accent-color)' }}>+{((gameState.prestigeMultiplier - 1) * 100).toFixed(0)}% PP</span>
              </div>
              {(gameState.activePathBonuses || []).map((bonus, idx) => (
                <div key={idx} style={{ fontSize: '10px', opacity: 0.7 }}>
                  {PRESTIGE_PATHS.find(p => p.id === bonus.path)?.name || bonus.path}: <span style={{ color: 'var(--accent-color)' }}>+{Math.abs(bonus.value * 100).toFixed(0)}% {bonus.type}</span>
                </div>
              ))}
            </div>
          )}
          {gameState.paperPerSecond > 0 && (
            <div style={{
              paddingTop: gameState.ppPerSecond > 0 ? '8px' : '16px',
              borderTop: gameState.ppPerSecond > 0 ? 'none' : '1px solid var(--border-color)',
              textAlign: 'center',
              opacity: 0.7,
              fontSize: '12px'
            }}>
              +{gameState.paperPerSecond.toFixed(1)} Paper/sec
            </div>
          )}
          {gameState.activeReportBuffs && gameState.activeReportBuffs.length > 0 && (
            <div style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
              marginTop: '16px'
            }}>
              <div style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.6,
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>ACTIVE BUFFS</span>
                <span>
                  {gameState.activeReportBuffs.filter(b => b.expiresAt > Date.now()).length}/{gameState.maxActiveBuffs || 3}
                </span>
              </div>
              {gameState.activeReportBuffs.map((buff, idx) => {
                const timeLeft = Math.max(0, Math.ceil((buff.expiresAt - Date.now()) / 1000));
                if (timeLeft <= 0) return null;

                const effects = [];
                if (buff.ppMult) effects.push(`PP: +${((buff.ppMult - 1) * 100).toFixed(0)}%`);
                if (buff.xpMult) effects.push(`XP: +${((buff.xpMult - 1) * 100).toFixed(0)}%`);
                if (buff.ppPerSecondMult) effects.push(`PP/sec: ${buff.ppPerSecondMult}x`);
                if (buff.energyCostMult && buff.energyCostMult < 1) effects.push(`Energy: -${((1 - buff.energyCostMult) * 100).toFixed(0)}%`);
                if (buff.energyCostMult && buff.energyCostMult > 1) effects.push(`Energy: +${((buff.energyCostMult - 1) * 100).toFixed(0)}%`);
                if (buff.materialMult) effects.push(`Materials: ${buff.materialMult}x`);
                if (buff.noSanityDrain) effects.push('No sanity drain');

                return (
                  <div
                    key={buff.id || idx}
                    style={{
                      fontSize: '10px',
                      padding: '6px',
                      backgroundColor: 'var(--bg-color)',
                      border: '1px solid var(--accent-color)',
                      borderRadius: '2px',
                      marginBottom: '4px',
                      cursor: 'help',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => setBuffTooltip({ buff, effects, x: e.clientX, y: e.clientY })}
                    onMouseMove={(e) => setBuffTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                    onMouseLeave={() => setBuffTooltip(null)}
                  >
                    <div style={{ fontWeight: 'bold', paddingRight: '24px' }}>{buff.name}</div>
                    <div style={{ opacity: 0.8 }}>{timeLeft}s remaining</div>
                    <div style={{ opacity: 0.7, fontSize: '9px', marginTop: '2px' }}>
                      {effects.slice(0, 2).join(' \u2022 ')}
                      {effects.length > 2 && '...'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBuffTooltip(null);
                        actions.removeActiveBuff(buff.id || `${idx}`);
                      }}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '2px 4px',
                        opacity: 0.5,
                        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.5';
                      }}
                      title="Remove buff"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
