// app/survival/NarrativeIntro.js
'use client';

export default function NarrativeIntro({ onDismiss }) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 100,
      }}
    >
      <div style={{
        maxWidth: '420px',
        padding: '40px',
        textAlign: 'center',
        fontFamily: "'SF Mono', Monaco, 'Inconsolata', monospace",
        color: '#d4c5a0',
      }}>
        <p style={{ fontSize: '13px', lineHeight: '2.4', marginBottom: '40px' }}>
          Day 1.<br />
          You don&apos;t know how long you were in there.<br />
          The sun is real. The air is cold.<br />
          You have nothing.<br />
          Survive.
        </p>
        <p style={{ fontSize: '11px', opacity: 0.4 }}>
          click to begin
        </p>
      </div>
    </div>
  );
}
