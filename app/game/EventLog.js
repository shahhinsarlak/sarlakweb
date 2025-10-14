import { useEffect, useRef } from 'react';

export default function EventLog({ messages, isVisible = true }) {
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to top when messages update
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

  if (!isVisible) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        width: '350px',
        maxHeight: '200px',
        backgroundColor: 'var(--bg-color)',
        border: '1px solid var(--border-color)',
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--hover-color)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          opacity: 0.7
        }}>
          Event Log
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="event-log-messages"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            fontSize: '11px',
            lineHeight: '1.6',
            display: 'flex',
            flexDirection: 'column'
          }}>
          {messages.map((msg, i) => (
            <div
              key={`${i}-${msg}-${Date.now()}`}
              className={i === 0 ? 'fade-in-message' : ''}
              style={{
                marginBottom: '8px',
                paddingBottom: '8px',
                borderBottom: i < messages.length - 1 ? '1px solid var(--border-color)' : 'none',
                opacity: 0.8
              }}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 0.8;
            transform: translateY(0);
          }
        }

        .fade-in-message {
          animation: fadeIn 0.4s ease-in;
        }

        .event-log-messages::-webkit-scrollbar {
          width: 6px;
        }

        .event-log-messages::-webkit-scrollbar-track {
          background: var(--bg-color);
        }

        .event-log-messages::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 3px;
        }

        .event-log-messages::-webkit-scrollbar-thumb:hover {
          background: var(--accent-color);
        }
      `}</style>
    </>
  );
}