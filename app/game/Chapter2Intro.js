import React, { useEffect, useRef, useState } from 'react';

/**
 * Chapter 2 Intro Cinematic
 *
 * A deliberately blank black screen. Lines of inner monologue fade in one by
 * one, ending on the resolve to find a way out. Clicking advances faster; a
 * final button hands control to onComplete (which starts Chapter 2).
 *
 * Rendered full-screen, above everything, before the main dashboard.
 *
 * @param {Function} onComplete - Called when the player chooses to continue.
 */
const CHAPTER2_LINES = [
  'Is this it?',
  'Is this all I can do?',
  'Sort. Print. Buy. Repeat.',
  "I've bought everything. Sorted everything.",
  'And the walls are still here.',
  'The lights are still humming.',
  'There has to be a way out.',
  'I just need to think.',
];

const LINE_INTERVAL_MS = 2200;

function Chapter2Intro({ onComplete }) {
  const [revealed, setRevealed] = useState(1);
  const timerRef = useRef(null);

  const allRevealed = revealed >= CHAPTER2_LINES.length;

  useEffect(() => {
    if (allRevealed) return undefined;
    timerRef.current = setTimeout(() => {
      setRevealed((n) => Math.min(CHAPTER2_LINES.length, n + 1));
    }, LINE_INTERVAL_MS);
    return () => clearTimeout(timerRef.current);
  }, [revealed, allRevealed]);

  // Clicking the screen reveals the next line immediately (lets impatient
  // players move faster) without skipping straight to the end.
  const handleAdvance = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRevealed((n) => Math.min(CHAPTER2_LINES.length, n + 1));
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
        @keyframes ch2FadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 0.92; transform: translateY(0); }
        }
        @keyframes ch2ButtonIn {
          from { opacity: 0; }
          to { opacity: 0.85; }
        }
      `}</style>

      <div style={{ maxWidth: '640px', width: '100%' }}>
        {CHAPTER2_LINES.slice(0, revealed).map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: '20px',
              lineHeight: '1.8',
              margin: '18px 0',
              animation: 'ch2FadeIn 1.6s ease forwards',
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
            animation: 'ch2ButtonIn 2.4s ease forwards',
            opacity: 0,
          }}
        >
          Think
        </button>
      )}
    </div>
  );
}

Chapter2Intro.displayName = 'Chapter2Intro';
export default React.memo(Chapter2Intro);
