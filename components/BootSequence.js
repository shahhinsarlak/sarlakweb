'use client';
import { useEffect, useState, useRef } from 'react';

export default function BootSequence() {
  const [shown, setShown] = useState([]);
  const [done, setDone] = useState(false);
  const [fading, setFading] = useState(false);
  const skipped = useRef(false);

  useEffect(() => {
    const LINES = [
      { t: 120, s: '$ sarlak --init' },
      { t: 260, s: '[OK] loading projects ............ 3 found' },
      { t: 160, s: '[OK] index built .................. 2 posts' },
      { t: 180, s: '[OK] status: available for work' },
      { t: 200, s: '$ _' },
    ];

    try {
      if (sessionStorage.getItem('sarlak-booted') === '1') {
        setDone(true);
        return;
      }
    } catch (e) {}

    let cancelled = false;
    const timers = [];
    let i = 0;

    const step = () => {
      if (cancelled || skipped.current) return;
      if (i >= LINES.length) {
        timers.push(setTimeout(() => setFading(true), 260));
        timers.push(setTimeout(() => {
          try { sessionStorage.setItem('sarlak-booted', '1'); } catch (e) {}
          setDone(true);
        }, 600));
        return;
      }
      const line = LINES[i];
      setShown(prev => prev.concat([line.s]));
      i += 1;
      timers.push(setTimeout(step, line.t));
    };

    timers.push(setTimeout(step, 120));

    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        skipped.current = true;
        try { sessionStorage.setItem('sarlak-booted', '1'); } catch (e) {}
        setDone(true);
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelled = true;
      timers.forEach(t => clearTimeout(t));
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  if (done) return null;

  const renderLine = (l, isLast) => {
    if (l.indexOf('[OK]') === 0) {
      return (
        <span>
          <span style={{ color: 'var(--accent-color)' }}>[OK]</span>
          {l.slice(4)}
        </span>
      );
    }
    if (l.indexOf('$') === 0) {
      return (
        <span>
          <span style={{ color: 'var(--accent-color)' }}>$</span>
          {l.slice(1)}
          {isLast && l === '$ _' && (
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 14,
              background: 'var(--accent-color)',
              marginLeft: -6,
              verticalAlign: '-2px',
              animation: 'sarlakBlink 1s steps(2) infinite',
            }}></span>
          )}
        </span>
      );
    }
    return <span>{l}</span>;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-color)',
      zIndex: 50,
      padding: '80px 40px',
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      lineHeight: 1.6,
      color: 'var(--text-color)',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.35s ease',
    }}>
      <div style={{ maxWidth: 800, width: '100%' }}>
        {shown.map((l, idx) => (
          <div key={idx} style={{ whiteSpace: 'pre' }}>
            {renderLine(l, idx === shown.length - 1)}
          </div>
        ))}
        <div style={{ marginTop: 28, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          press any key to skip
        </div>
      </div>
      <style>{`@keyframes sarlakBlink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }`}</style>
    </div>
  );
}
