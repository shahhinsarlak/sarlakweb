// app/survival/EventLog.js
'use client';
import { useEffect, useRef } from 'react';

export default function EventLog({ log }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      fontFamily: "'SF Mono', Monaco, monospace",
      fontSize: '12px',
      lineHeight: '1.8',
      color: '#a09880',
    }}>
      {log.length === 0 && (
        <div style={{ opacity: 0.4, fontStyle: 'italic' }}>The log is empty. Begin your first day.</div>
      )}
      {log.map((line, i) => (
        <div
          key={i}
          style={{
            color: line.startsWith('Day ') ? '#d4c5a0' : line === '---' ? 'rgba(255,255,255,0.1)' : '#a09880',
            borderTop: line === '---' ? '1px solid rgba(255,255,255,0.06)' : 'none',
            paddingTop: line === '---' ? '10px' : '0',
            marginTop: line === '---' ? '10px' : '0',
            marginBottom: line.startsWith('Day ') ? '4px' : '0',
            fontWeight: line.startsWith('Day ') ? 'bold' : 'normal',
          }}
        >
          {line !== '---' && line}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
