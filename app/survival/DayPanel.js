// app/survival/DayPanel.js
'use client';
import { ACTIONS, DAY_CONFIG } from './constants';

export default function DayPanel({ state, onQueueAction, onDequeueAction, onEndDay }) {
  const totalSlots = DAY_CONFIG.baseActionSlots + (state.bonusActionSlotToday ? 1 : 0);
  const usedSlots = state.chosenActions.reduce((sum, id) => {
    const a = ACTIONS.find(x => x.id === id);
    return sum + (a?.slots || 1);
  }, 0);
  const remainingSlots = totalSlots - usedSlots;

  // Count queued occurrences per action
  const queueCounts = {};
  state.chosenActions.forEach(id => {
    queueCounts[id] = (queueCounts[id] || 0) + 1;
  });

  return (
    <div style={{
      padding: '20px',
      fontFamily: "'SF Mono', Monaco, monospace",
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5 }}>
          Actions &mdash; {usedSlots}/{totalSlots} slots
        </div>
        <button
          onClick={onEndDay}
          disabled={usedSlots === 0}
          style={{
            background: usedSlots > 0 ? 'rgba(180, 140, 80, 0.15)' : 'transparent',
            border: `1px solid ${usedSlots > 0 ? '#b48c50' : 'rgba(255,255,255,0.15)'}`,
            color: usedSlots > 0 ? '#b48c50' : 'rgba(255,255,255,0.3)',
            padding: '6px 14px',
            cursor: usedSlots > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            fontSize: '11px',
            transition: 'all 0.2s',
          }}
        >
          END DAY
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ACTIONS.map(action => {
          const canAdd = action.slots <= remainingSlots;
          const queued = queueCounts[action.id] || 0;

          return (
            <div
              key={action.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: queued > 0 ? 'rgba(180,140,80,0.08)' : 'transparent',
                transition: 'background-color 0.2s',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#c8bfa0', marginBottom: '3px' }}>
                  {action.label}
                  <span style={{ opacity: 0.5, marginLeft: '6px', fontSize: '10px' }}>
                    [{action.slots} slot{action.slots > 1 ? 's' : ''}]
                  </span>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.5 }}>{action.desc}</div>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {queued > 0 && (
                  <button
                    onClick={() => onDequeueAction(action.id)}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#b48c50',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    -
                  </button>
                )}
                {queued > 0 && (
                  <span style={{ fontSize: '11px', color: '#b48c50', minWidth: '12px', textAlign: 'center' }}>
                    {queued}
                  </span>
                )}
                <button
                  onClick={() => canAdd && onQueueAction(action.id)}
                  disabled={!canAdd}
                  style={{
                    background: 'none',
                    border: `1px solid ${canAdd ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    color: canAdd ? '#c8bfa0' : 'rgba(255,255,255,0.2)',
                    width: '24px',
                    height: '24px',
                    cursor: canAdd ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
