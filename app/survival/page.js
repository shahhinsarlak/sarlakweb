// app/survival/page.js
'use client';
import { useState, useEffect } from 'react';
import SurvivalGame from './SurvivalGame';
import NarrativeIntro from './NarrativeIntro';
import { loadSurvivalState, saveSurvivalState } from './saveSystem';
import { INITIAL_SURVIVAL_STATE } from './constants';

export default function SurvivalPage() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = loadSurvivalState();
    if (saved) {
      setGameState(saved);
    } else {
      const fresh = { ...INITIAL_SURVIVAL_STATE };
      setGameState(fresh);
    }
    setLoading(false);
  }, []);

  const handleIntroComplete = () => {
    setGameState(prev => {
      const next = { ...prev, introSeen: true };
      saveSurvivalState(next);
      return next;
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'SF Mono', Monaco, monospace",
        color: '#6a6050',
        fontSize: '12px',
      }}>
        loading...
      </div>
    );
  }

  if (!gameState?.introSeen) {
    return <NarrativeIntro onDismiss={handleIntroComplete} />;
  }

  return <SurvivalGame initialState={gameState} />;
}
