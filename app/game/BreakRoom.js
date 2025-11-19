/**
 * Break Room Component
 *
 * Interactive exploration UI for the break room location.
 * Players can search various objects to find clues, items, and progress the mystery.
 * Room atmosphere changes based on sanity level and day.
 */

import { useState, useEffect } from 'react';
import { BREAK_ROOM_SEARCHABLES, COLLEAGUE_SCHEDULE } from './constants';

export default function BreakRoom({ gameState, onSearch, onClose }) {
  const [cooldowns, setCooldowns] = useState({});

  // Update cooldowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCooldowns = {};
      Object.keys(BREAK_ROOM_SEARCHABLES).forEach(objId => {
        const cooldownEnd = gameState.breakRoomSearchCooldowns[objId] || 0;
        if (cooldownEnd > now) {
          newCooldowns[objId] = Math.ceil((cooldownEnd - now) / 1000);
        }
      });
      setCooldowns(newCooldowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.breakRoomSearchCooldowns]);

  // Get room atmosphere based on sanity
  const getRoomAtmosphere = () => {
    const { sanity, day } = gameState;
    const dayOfWeek = day % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (sanity < 10) {
      return {
        description: 'The break room... shifts. Walls breathe. The fluorescent lights spell your name.',
        color: '#ff0000'
      };
    } else if (sanity < 40) {
      return {
        description: 'The lights flicker arrhythmically. Shadows pool in corners that weren\'t there before.',
        color: '#ff6600'
      };
    } else if (isWeekend) {
      return {
        description: 'Empty. Too empty. The silence has weight. The machines wait.',
        color: '#888'
      };
    } else {
      return {
        description: 'Fluorescent lights buzz. The coffee machine gurgles. Your colleagues might be here.',
        color: 'var(--text-color)'
      };
    }
  };

  // Get scheduled colleague for today
  const getScheduledColleague = () => {
    if (!gameState.colleagueScheduleKnown) return null;
    const colleagueId = COLLEAGUE_SCHEDULE.getScheduledColleague(gameState.day);

    const colleagueNames = {
      'productivity_zealot': 'Productivity Zealot',
      'void_clerk': 'Void Clerk',
      'spiral_philosopher': 'Spiral Philosopher',
      'temporal_trapped': 'Temporal Trapped',
      'light_herald': 'Light Herald',
      'multiple': 'Multiple Colleagues'
    };

    return colleagueId ? colleagueNames[colleagueId] : 'Nobody';
  };

  const atmosphere = getRoomAtmosphere();
  const scheduledColleague = getScheduledColleague();

  // Check if object is available
  const isObjectAvailable = (objId, searchable) => {
    // Supply closet needs unlock
    if (objId === 'supply_closet') {
      if (!gameState.breakRoomSupplyClosetUnlocked) {
        return gameState.day >= 10;
      }
    }
    return true;
  };

  return (
    <div style={{
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        maxHeight: 'calc(100vh - 40px)',
        border: '2px solid var(--border-color)',
        padding: '30px',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        overflowY: 'auto'
      }}>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '2px solid var(--border-color)'
        }}>
          BREAK ROOM - Day {gameState.day}
        </div>

        {/* Room Atmosphere */}
        <div style={{
          padding: '16px',
          marginBottom: '20px',
          backgroundColor: 'var(--hover-color)',
          border: `1px solid ${atmosphere.color}`,
          fontSize: '14px',
          lineHeight: '1.6',
          fontStyle: 'italic',
          color: atmosphere.color
        }}>
          {atmosphere.description}
        </div>

        {/* Scheduled Colleague Indicator */}
        {scheduledColleague && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: gameState.sanity < 40 ? 'rgba(255, 0, 0, 0.1)' : 'rgba(100, 100, 255, 0.1)',
            border: '1px solid var(--border-color)',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            Today's Visitor: <strong>{scheduledColleague}</strong>
          </div>
        )}

        {/* Energy Display */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '25px',
          padding: '12px',
          backgroundColor: 'var(--hover-color)',
          border: '1px solid var(--border-color)',
          fontSize: '13px'
        }}>
          <span>Energy: {Math.floor(gameState.energy)}/100</span>
          <span>Sanity: {Math.floor(gameState.sanity)}%</span>
          <span>Mystery: {Math.floor(gameState.mysteryProgress || 0)}%</span>
        </div>

        {/* Searchable Objects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '25px'
        }}>
          {Object.entries(BREAK_ROOM_SEARCHABLES).map(([objId, searchable]) => {
            const onCooldown = cooldowns[objId] > 0;
            const canAfford = gameState.energy >= searchable.energyCost;
            const isAvailable = isObjectAvailable(objId, searchable);
            const isLocked = objId === 'supply_closet' && !gameState.breakRoomSupplyClosetUnlocked && gameState.day < 10;

            return (
              <div
                key={objId}
                style={{
                  border: onCooldown ? '1px solid #555' : '2px solid var(--border-color)',
                  padding: '16px',
                  backgroundColor: onCooldown ? 'rgba(0,0,0,0.3)' : 'var(--hover-color)',
                  opacity: (!canAfford || onCooldown || isLocked) ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  fontSize: '15px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: 'var(--accent-color)'
                }}>
                  {searchable.name}
                  {isLocked && ' 🔒'}
                </div>

                <div style={{
                  fontSize: '12px',
                  marginBottom: '12px',
                  lineHeight: '1.5',
                  color: 'var(--text-color)',
                  opacity: 0.8
                }}>
                  {searchable.description}
                </div>

                <div style={{
                  fontSize: '11px',
                  marginBottom: '10px',
                  opacity: 0.7
                }}>
                  Cost: {searchable.energyCost} energy
                  <br />
                  Cooldown: {searchable.baseCooldown}s
                </div>

                <button
                  onClick={() => onSearch(objId)}
                  disabled={!canAfford || onCooldown || isLocked}
                  style={{
                    fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
                    width: '100%',
                    padding: '10px',
                    fontSize: '13px',
                    backgroundColor: (canAfford && !onCooldown && !isLocked) ? 'var(--accent-color)' : '#333',
                    color: (canAfford && !onCooldown && !isLocked) ? 'var(--bg-color)' : '#666',
                    border: '1px solid var(--border-color)',
                    cursor: (canAfford && !onCooldown && !isLocked) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (canAfford && !onCooldown && !isLocked) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 0 10px var(--accent-color)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {isLocked ? `Locked (Day ${10 - gameState.day})` :
                   onCooldown ? `Wait ${cooldowns[objId]}s` :
                   !canAfford ? 'Not enough energy' :
                   'Search'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            onClick={onClose}
            style={{
              fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
              padding: '12px 24px',
              fontSize: '14px',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              border: '2px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-color)';
            }}
          >
            Leave Break Room
          </button>
        </div>

        {/* Hint */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '11px',
          opacity: 0.5,
          fontStyle: 'italic'
        }}>
          Different objects reveal different secrets. Some only appear at certain sanity levels or days.
        </div>
      </div>
    </div>
  );
}
