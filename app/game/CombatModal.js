/**
 * Combat Modal Component
 *
 * Turn-based combat interface for battling colleagues
 * - Displays enemy info and ASCII art
 * - Shows HP bars for player and enemy
 * - Combat log for battle events
 * - Action buttons (Attack, Escape)
 */

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function CombatModal({
  enemy,
  playerStats,
  onAttack,
  onEscape,
  onEndCombat,
  combatLog,
  isPlayerTurn,
  combatEnded
}) {
  const [clickedButton, setClickedButton] = useState(null);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [shakePlayer, setShakePlayer] = useState(false);

  // Trigger shake animation when HP changes
  useEffect(() => {
    if (enemy.currentHP < enemy.maxHP) {
      setShakeEnemy(true);
      setTimeout(() => setShakeEnemy(false), 300);
    }
  }, [enemy.currentHP, enemy.maxHP]);

  useEffect(() => {
    if (playerStats.currentHP < playerStats.maxHP) {
      setShakePlayer(true);
      setTimeout(() => setShakePlayer(false), 300);
    }
  }, [playerStats.currentHP, playerStats.maxHP]);

  const handleAction = (action) => {
    setClickedButton(action);
    setTimeout(() => {
      if (action === 'attack') {
        onAttack();
      } else if (action === 'escape') {
        onEscape();
      }
      setClickedButton(null);
    }, 150);
  };

  const getHPBarColor = (currentHP, maxHP) => {
    const percentage = (currentHP / maxHP) * 100;
    if (percentage > 60) return '#4CAF50';
    if (percentage > 30) return '#ff9900';
    return '#ff0000';
  };

  return (
    <>
      <Header />
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 40px',
        minHeight: '100vh',
        fontSize: '14px'
      }}>
        {/* Title */}
        <div style={{
          textAlign: 'center',
          fontSize: '16px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '40px',
          color: enemy.prefix.color,
          fontWeight: '500'
        }}>
          ⚔️ COMBAT INITIATED ⚔️
        </div>

        {/* Enemy Display */}
        <div style={{
          border: `2px solid ${enemy.prefix.color}`,
          padding: '24px',
          marginBottom: '32px',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          animation: shakeEnemy ? 'shake 0.3s' : 'none'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: enemy.prefix.color
            }}>
              {enemy.displayName}
            </div>
            <div style={{
              fontSize: '10px',
              opacity: 0.7,
              marginBottom: '16px'
            }}>
              {enemy.archetype.desc}
            </div>
          </div>

          <div style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            whiteSpace: 'pre',
            lineHeight: '1.2',
            textAlign: 'center',
            marginBottom: '20px',
            color: enemy.prefix.color
          }}>
            {enemy.archetype.ascii}
          </div>

          {/* Enemy HP Bar */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{
              fontSize: '11px',
              marginBottom: '4px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>ENEMY HP</span>
              <span>{enemy.currentHP} / {enemy.maxHP}</span>
            </div>
            <div style={{
              width: '100%',
              height: '20px',
              backgroundColor: 'var(--hover-color)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${(enemy.currentHP / enemy.maxHP) * 100}%`,
                height: '100%',
                backgroundColor: getHPBarColor(enemy.currentHP, enemy.maxHP),
                transition: 'width 0.4s ease-out',
                boxShadow: `0 0 10px ${getHPBarColor(enemy.currentHP, enemy.maxHP)}`
              }} />
            </div>
          </div>

          <div style={{
            fontSize: '10px',
            opacity: 0.6,
            textAlign: 'center',
            marginTop: '12px'
          }}>
            ⚔️ Damage: {enemy.damage} | ⚡ Speed: {enemy.attackSpeed.toFixed(1)}x
          </div>
        </div>

        {/* Player Display */}
        <div style={{
          border: '1px solid var(--border-color)',
          padding: '20px',
          marginBottom: '32px',
          backgroundColor: 'var(--hover-color)',
          animation: shakePlayer ? 'shake 0.3s' : 'none'
        }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.6,
            marginBottom: '12px'
          }}>
            YOU
          </div>

          {/* Player HP Bar */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{
              fontSize: '11px',
              marginBottom: '4px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>YOUR HP</span>
              <span>{playerStats.currentHP} / {playerStats.maxHP}</span>
            </div>
            <div style={{
              width: '100%',
              height: '20px',
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(playerStats.currentHP / playerStats.maxHP) * 100}%`,
                height: '100%',
                backgroundColor: getHPBarColor(playerStats.currentHP, playerStats.maxHP),
                transition: 'width 0.4s ease-out',
                boxShadow: `0 0 10px ${getHPBarColor(playerStats.currentHP, playerStats.maxHP)}`
              }} />
            </div>
          </div>

          <div style={{
            fontSize: '10px',
            opacity: 0.6,
            marginTop: '12px'
          }}>
            ⚔️ Weapon: {playerStats.weapon.name} | 🎯 Damage: {playerStats.damage} | ✨ Crit: {(playerStats.critChance * 100).toFixed(0)}%
          </div>
        </div>

        {/* Combat Log */}
        <div style={{
          border: '1px solid var(--border-color)',
          padding: '20px',
          marginBottom: '32px',
          backgroundColor: 'var(--hover-color)',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.6,
            marginBottom: '16px'
          }}>
            COMBAT LOG
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
            {combatLog.length === 0 ? (
              <div style={{ opacity: 0.5 }}>Battle begins...</div>
            ) : (
              combatLog.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: '8px',
                    paddingBottom: '8px',
                    borderBottom: i < combatLog.length - 1 ? '1px solid var(--border-color)' : 'none',
                    color: entry.type === 'damage_player' ? '#ff6666' :
                           entry.type === 'damage_enemy' ? '#66ff66' :
                           entry.type === 'critical' ? '#ffaa00' :
                           'var(--text-color)'
                  }}
                >
                  {entry.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!combatEnded && (
          <div style={{
            display: 'flex',
            gap: '16px'
          }}>
            <button
              onClick={() => handleAction('attack')}
              disabled={!isPlayerTurn || clickedButton !== null}
              style={{
                flex: 1,
                background: clickedButton === 'attack' ? 'var(--accent-color)' : 'none',
                border: '2px solid var(--accent-color)',
                color: clickedButton === 'attack' ? 'var(--bg-color)' : 'var(--accent-color)',
                padding: '16px',
                cursor: isPlayerTurn && !clickedButton ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontFamily: 'inherit',
                textAlign: 'center',
                letterSpacing: '1px',
                fontWeight: '500',
                transition: 'all 0.1s',
                opacity: isPlayerTurn && !clickedButton ? 1 : 0.5
              }}
            >
              ⚔️ ATTACK
            </button>

            <button
              onClick={() => handleAction('escape')}
              disabled={!isPlayerTurn || clickedButton !== null}
              style={{
                flex: 1,
                background: clickedButton === 'escape' ? '#ff6666' : 'none',
                border: '2px solid #ff6666',
                color: clickedButton === 'escape' ? 'var(--bg-color)' : '#ff6666',
                padding: '16px',
                cursor: isPlayerTurn && !clickedButton ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontFamily: 'inherit',
                textAlign: 'center',
                letterSpacing: '1px',
                fontWeight: '500',
                transition: 'all 0.1s',
                opacity: isPlayerTurn && !clickedButton ? 1 : 0.5
              }}
            >
              🏃 ESCAPE
            </button>
          </div>
        )}

        {combatEnded && (
          <div style={{
            marginTop: '20px'
          }}>
            <button
              onClick={onEndCombat}
              style={{
                width: '100%',
                background: 'var(--accent-color)',
                border: '2px solid var(--accent-color)',
                color: 'var(--bg-color)',
                padding: '16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit',
                textAlign: 'center',
                letterSpacing: '1px',
                fontWeight: '500'
              }}
            >
              CONTINUE
            </button>
          </div>
        )}

        {!isPlayerTurn && !combatEnded && (
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '12px',
            opacity: 0.7,
            fontStyle: 'italic'
          }}>
            {enemy.archetype.flavorText[Math.floor(Math.random() * enemy.archetype.flavorText.length)]}...
          </div>
        )}
      </div>
      <Footer />

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-3px, -3px); }
          20%, 40%, 60%, 80% { transform: translate(3px, 3px); }
        }
      `}</style>
    </>
  );
}
