import React, { useEffect, useRef, useState } from 'react';

/**
 * Loop Ending Cinematic.
 *
 * Plays when the player breaches the final Gateway with enough pieces of the
 * way out. The way out leads back in: you step through the door and find
 * yourself at your desk again, but you remember the dark. Mirrors the Chapter 2
 * intro's blank screen on purpose. onComplete() runs the loop (keeps minds /
 * gear / blueprints, resets the chart deeper, banks a windfall).
 */
const LINES = [
  'There it is.',
  'The way out.',
  'A door. Light beneath it.',
  'You step through.',
  '. . .',
  'The fluorescent lights hum. They always hum.',
  'Four grey walls. A cold cup of coffee.',
  'You are at your desk. You have always been at your desk.',
  'But you remember the dark now. And what you learned there.',
  'There has to be a way out.',
];

const LINE_INTERVAL_MS = 2400;

function LoopEnding({ loopCount, onComplete }) {
  const [revealed, setRevealed] = useState(1);
  const timerRef = useRef(null);
  const allRevealed = revealed >= LINES.length;

  useEffect(() => {
    if (allRevealed) return undefined;
    timerRef.current = setTimeout(() => {
      setRevealed((n) => Math.min(LINES.length, n + 1));
    }, LINE_INTERVAL_MS);
    return () => clearTimeout(timerRef.current);
  }, [revealed, allRevealed]);

  const handleAdvance = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRevealed((n) => Math.min(LINES.length, n + 1));
  };

  return (
    <div
      onClick={allRevealed ? undefined : handleAdvance}
      style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        color: '#e8e8e8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        cursor: allRevealed ? 'default' : 'pointer',
        padding: '40px',
        textAlign: 'center',
      }}
    >
      <style>{`
        @keyframes loopFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 0.92; transform: translateY(0); } }
        @keyframes loopButtonIn { from { opacity: 0; } to { opacity: 0.85; } }
      `}</style>

      <div style={{ maxWidth: '640px', width: '100%' }}>
        {LINES.slice(0, revealed).map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: '20px',
              lineHeight: '1.8',
              margin: '18px 0',
              animation: 'loopFadeIn 1.6s ease forwards',
              opacity: 0,
            }}
          >
            {line}
          </p>
        ))}
      </div>

      {allRevealed && (
        <button
          onClick={onComplete}
          style={{
            marginTop: '56px',
            background: 'none',
            border: '1px solid #555',
            color: '#e8e8e8',
            padding: '14px 36px',
            cursor: 'pointer',
            fontSize: '15px',
            fontFamily: 'inherit',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            animation: 'loopButtonIn 2.4s ease forwards',
            opacity: 0,
          }}
        >
          {loopCount > 0 ? 'Again' : 'Begin Again'}
        </button>
      )}
    </div>
  );
}

LoopEnding.displayName = 'LoopEnding';
export default React.memo(LoopEnding);
