import React, { useEffect, useReducer, useRef } from 'react';
import EventLog from './EventLog';
import NotificationPopup from './NotificationPopup';

/**
 * Meditation minigame (hold-to-breathe).
 *
 * Each of the three breaths: press and HOLD space (or the button) to inhale, which
 * fills the bar upward at a varying speed. Release inside the green zone near the
 * top, then the bar drops back down for the exhale. Closer to the green zone at
 * release = better score. After three breaths the average score is sent to
 * onComplete, which applies the sanity reward.
 */

const FPS = 60;
const FRAME_MS = 1000 / FPS;
const GREEN_LOW = 82;
const GREEN_HIGH = 98;
const GREEN_CENTER = (GREEN_LOW + GREEN_HIGH) / 2;
const EXHALE_SPEED = 90; // % per second
const TOTAL_BREATHS = 3;

// Score a single breath from the bar position at the moment of release.
const scoreBreath = (bar) => {
  if (bar >= GREEN_LOW && bar <= GREEN_HIGH) {
    return 90 + (1 - Math.abs(bar - GREEN_CENTER) / (GREEN_HIGH - GREEN_CENTER)) * 10; // 90-100
  }
  if (bar < GREEN_LOW) return Math.max(0, 90 - (GREEN_LOW - bar) * 2);
  return Math.max(0, 90 - (bar - GREEN_HIGH) * 3); // overshoot penalised harder
};

function MeditationModal({ gameState, onComplete, onCancel, notifications, onDismissNotification }) {
  // All real-time state lives in a ref so the animation loop never reads stale
  // values; a forced re-render each frame paints the current ref values.
  const st = useRef({
    phase: 'idle',       // idle (waiting for press) | inhale | exhale
    bar: 0,              // 0-100
    breath: 0,           // completed breaths
    holding: false,
    speed: 55,           // current (varying) inhale speed, %/s
    scores: [],
    lastNote: '',        // feedback for the breath just released
    finished: false,
  });
  const [, force] = useReducer((x) => x + 1, 0);

  // Keep the latest callbacks in refs so the animation/key effects can run once
  // and never get torn down by prop-identity changes (page.js re-renders on its
  // 100ms tick).
  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);
  onCompleteRef.current = onComplete;
  onCancelRef.current = onCancel;

  // Animation loop.
  useEffect(() => {
    const interval = setInterval(() => {
      const s = st.current;
      if (s.finished) return;
      const dt = FRAME_MS / 1000;

      if (s.phase === 'inhale') {
        if (s.holding) {
          // Inhale speed wanders continuously so timing alone is not enough.
          s.speed += (Math.random() - 0.5) * 5;
          s.speed = Math.max(28, Math.min(95, s.speed));
          s.bar = Math.min(100, s.bar + s.speed * dt);
        } else {
          // Released: score this breath, then exhale.
          const sc = scoreBreath(s.bar);
          s.scores.push(sc);
          s.lastNote = sc >= 90 ? 'Perfect breath.' : sc >= 60 ? 'Good.' : s.bar > GREEN_HIGH ? 'Held too long.' : 'Let it fill more.';
          s.phase = 'exhale';
        }
      } else if (s.phase === 'exhale') {
        s.bar = Math.max(0, s.bar - EXHALE_SPEED * dt);
        if (s.bar <= 0) {
          s.bar = 0;
          s.breath += 1;
          if (s.breath >= TOTAL_BREATHS) {
            s.finished = true;
            const avg = s.scores.reduce((a, b) => a + b, 0) / s.scores.length;
            clearInterval(interval);
            setTimeout(() => onCompleteRef.current(Math.round(avg)), 150);
          } else {
            s.phase = 'idle';
          }
        }
      }
      force();
    }, FRAME_MS);
    return () => clearInterval(interval);
  }, []);

  // Begin inhaling (from idle) or keep holding.
  const press = () => {
    const s = st.current;
    if (s.finished) return;
    if (s.phase === 'idle') {
      s.phase = 'inhale';
      s.speed = 45 + Math.random() * 25;
      s.lastNote = '';
    }
    if (s.phase === 'inhale') s.holding = true;
    force();
  };
  const release = () => {
    const s = st.current;
    s.holding = false; // the loop turns inhale -> exhale on the next frame
    force();
  };

  // Stopping is ignored once the run has finished (a reward is already pending),
  // so cancelling during the brief completion delay can't drop it.
  const stop = () => {
    if (st.current.finished) return;
    onCancelRef.current();
  };

  // Keyboard: space to hold, Escape to stop. Also release if focus/visibility is
  // lost while holding, so a dropped keyup can't leave the breath stuck.
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'Escape') { stop(); return; }
      if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); press(); }
    };
    const up = (e) => {
      if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); release(); }
    };
    const loseHold = () => release();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', loseHold);
    document.addEventListener('visibilitychange', loseHold);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', loseHold);
      document.removeEventListener('visibilitychange', loseHold);
    };
  }, []);

  const s = st.current;
  const inGreen = s.phase === 'inhale' && s.bar >= GREEN_LOW && s.bar <= GREEN_HIGH;
  const circleSize = 80 + (s.bar / 100) * 120;
  const breathNum = Math.min(TOTAL_BREATHS, s.breath + 1);

  let instruction;
  if (s.phase === 'idle') instruction = 'PRESS AND HOLD SPACE TO INHALE';
  else if (s.phase === 'inhale') instruction = inGreen ? 'RELEASE NOW' : 'KEEP HOLDING...';
  else instruction = 'EXHALE...';

  return (
    <>
      <EventLog messages={gameState.recentMessages} />
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '560px', margin: '0 auto', padding: '60px 40px', minHeight: '100vh', textAlign: 'center',
      }}>
        <div style={{ border: '1px solid var(--border-color)', padding: '50px 40px', backgroundColor: 'var(--hover-color)' }}>
          <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '30px' }}>
            MEDITATION &mdash; BREATH {breathNum}/{TOTAL_BREATHS}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', marginBottom: '30px' }}>
            {/* Breathing circle */}
            <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: `${circleSize}px`, height: `${circleSize}px`, borderRadius: '50%',
                border: `3px solid ${inGreen ? '#00ff88' : 'var(--border-color)'}`,
                backgroundColor: inGreen ? 'rgba(0,255,136,0.10)' : 'transparent',
                boxShadow: inGreen ? '0 0 24px rgba(0,255,136,0.45)' : 'none',
                transition: 'border-color 0.1s, box-shadow 0.1s',
              }} />
            </div>

            {/* Vertical fill bar with green target zone near the top */}
            <div style={{ position: 'relative', width: '34px', height: '200px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>
              {/* green zone */}
              <div style={{
                position: 'absolute', left: 0, right: 0,
                bottom: `${GREEN_LOW}%`, height: `${GREEN_HIGH - GREEN_LOW}%`,
                backgroundColor: 'rgba(0,255,136,0.18)', borderTop: '1px solid rgba(0,255,136,0.5)', borderBottom: '1px solid rgba(0,255,136,0.5)',
              }} />
              {/* fill */}
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, height: `${s.bar}%`,
                backgroundColor: inGreen ? '#00ff88' : 'var(--accent-color)',
                boxShadow: inGreen ? '0 0 10px #00ff88' : 'none',
              }} />
            </div>
          </div>

          <div style={{ fontSize: '20px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', minHeight: '26px' }}>
            {instruction}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '28px', minHeight: '16px' }}>{s.lastNote}</div>

          <button
            onMouseDown={press}
            onMouseUp={release}
            onMouseLeave={release}
            onTouchStart={(e) => { e.preventDefault(); press(); }}
            onTouchEnd={(e) => { e.preventDefault(); release(); }}
            onTouchCancel={release}
            style={{
              background: s.holding ? 'var(--accent-color)' : 'none',
              border: '1px solid var(--border-color)',
              color: s.holding ? 'var(--bg-color)' : 'var(--text-color)',
              padding: '22px', width: '100%', cursor: 'pointer', fontSize: '16px',
              fontFamily: 'inherit', letterSpacing: '1px', textTransform: 'uppercase', userSelect: 'none',
            }}
          >
            Hold to Inhale
          </button>

          <button
            onClick={stop}
            style={{ marginTop: '12px', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', letterSpacing: '0.5px', width: '100%' }}
          >
            STOP
          </button>

          <div style={{ marginTop: '26px', fontSize: '12px', opacity: 0.5, lineHeight: '1.6' }}>
            Hold SPACE to breathe in. Let the bar rise into the green near the top,<br />
            then release to breathe out. The rise speed wanders &mdash; stay with it.
          </div>
        </div>
      </div>

      <NotificationPopup notifications={notifications} onDismiss={onDismissNotification} />
    </>
  );
}

MeditationModal.displayName = 'MeditationModal';
export default React.memo(MeditationModal);
