// app/survival/SurvivalGame.js
'use client';
import { useState } from 'react';
import ResourcePanel from './ResourcePanel';
import DayPanel from './DayPanel';
import EventLog from './EventLog';
import { queueAction, dequeueAction, resolveDay } from './gameActions';
import { saveSurvivalState, clearSurvivalSave } from './saveSystem';
import { INITIAL_SURVIVAL_STATE } from './constants';

export default function SurvivalGame({ initialState }) {
  const [state, setState] = useState(initialState || INITIAL_SURVIVAL_STATE);

  const handleQueueAction = (actionId) => {
    setState(prev => queueAction(prev, actionId));
  };

  const handleDequeueAction = (actionId) => {
    setState(prev => dequeueAction(prev, actionId));
  };

  const handleEndDay = () => {
    const { newState } = resolveDay(state);
    saveSurvivalState(newState);
    setState(newState);
  };

  const handleRestart = () => {
    clearSurvivalSave();
    const fresh = { ...INITIAL_SURVIVAL_STATE, introSeen: true };
    saveSurvivalState(fresh);
    setState(fresh);
  };

  if (state.isDead) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'SF Mono', Monaco, monospace",
      }}>
        <div style={{ textAlign: 'center', maxWidth: '360px', padding: '40px' }}>
          <div style={{ fontSize: '14px', color: '#cc4444', marginBottom: '24px', letterSpacing: '2px' }}>
            YOU DIDN&apos;T MAKE IT
          </div>
          <div style={{ fontSize: '12px', color: '#8a8070', marginBottom: '32px', lineHeight: '1.8' }}>
            You survived {state.day - 1} day{state.day - 1 !== 1 ? 's' : ''}.
            <br />
            {state.daysWithoutFood >= 2 ? 'Starvation.' : 'Dehydration.'}
          </div>
          <button
            onClick={handleRestart}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#c8bfa0',
              padding: '10px 24px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '12px',
              letterSpacing: '1px',
            }}
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '680px',
      margin: '0 auto',
    }}>
      <ResourcePanel state={state} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <EventLog log={state.actionLog} />
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <DayPanel
          state={state}
          onQueueAction={handleQueueAction}
          onDequeueAction={handleDequeueAction}
          onEndDay={handleEndDay}
        />
      </div>
    </div>
  );
}
