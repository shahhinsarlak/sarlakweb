import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EventLog from './EventLog';

export default function ColleagueModal({ event, recentMessages, respondToColleague, hasWeapon, onStartCombat }) {
  const [clickedButton, setClickedButton] = useState(null);

  const handleResponse = (response, index) => {
    setClickedButton(index);
    setTimeout(() => {
      respondToColleague(response, index);
      setClickedButton(null);
    }, 150);
  };

  const handleCombat = () => {
    if (onStartCombat) {
      onStartCombat();
    }
  };

  // If player has a weapon, show combat option instead of dialogue
  if (hasWeapon) {
    return (
      <>
        <EventLog messages={recentMessages} />
        <Header />
        <div style={{
          fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
          maxWidth: '700px',
          margin: '0 auto',
          padding: '60px 40px',
          minHeight: '100vh',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <div style={{
            border: '2px solid #ff0000',
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'center',
            fontFamily: 'monospace',
            fontSize: '16px',
            whiteSpace: 'pre',
            lineHeight: '1.2',
            backgroundColor: 'rgba(255, 0, 0, 0.05)',
          }}>
            {event.ascii}
          </div>

          <div style={{
            border: '1px solid var(--border-color)',
            padding: '24px',
            marginBottom: '32px',
            backgroundColor: 'var(--hover-color)',
            fontSize: '14px',
            lineHeight: '1.8',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.6,
              marginBottom: '16px'
            }}>
              HOSTILE COLLEAGUE DETECTED
            </div>
            <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>
              They approach your desk. Their eyes are empty.
              Their intent is clear.
            </p>
            <p style={{ color: '#ff0000', fontWeight: '500' }}>
              Your hand moves to your weapon...
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <button
              onClick={handleCombat}
              style={{
                background: 'var(--accent-color)',
                border: '2px solid var(--accent-color)',
                color: 'var(--bg-color)',
                padding: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit',
                textAlign: 'center',
                letterSpacing: '1px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              ⚔️ ENGAGE IN COMBAT
            </button>

            <button
              onClick={() => respondToColleague("Agree with him", 0)}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                padding: '16px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'inherit',
                textAlign: 'center',
                letterSpacing: '0.5px',
                opacity: 0.7
              }}
            >
              🏳️ Try to reason with them (Agree)
            </button>
          </div>

          <div style={{
            marginTop: '32px',
            padding: '16px',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            fontSize: '11px',
            opacity: 0.5,
            textAlign: 'center',
            color: '#ff6b6b'
          }}>
            The office has changed. Violence is the only language they understand now.
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <EventLog messages={recentMessages} />
      <Header />
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '700px',
        margin: '0 auto',
        padding: '60px 40px',
        minHeight: '100vh',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        <div style={{
          border: '1px solid var(--border-color)',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: '16px',
          whiteSpace: 'pre',
          lineHeight: '1.2',
          backgroundColor: 'rgba(255, 0, 0, 0.05)',
          position: 'relative'
        }}>
          {event.ascii}
          
          {event.lastResponse && (
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '10px',
              backgroundColor: 'var(--bg-color)',
              border: '1px solid #ff6b6b',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '11px',
              maxWidth: '280px',
              color: '#ff6b6b',
              boxShadow: '0 4px 8px rgba(255, 0, 0, 0.3)',
              lineHeight: '1.5',
              wordWrap: 'break-word',
              whiteSpace: 'normal',
              animation: 'fadeIn 0.2s ease-in'
            }}>
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                right: '40px',
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #ff6b6b'
              }}></div>
              {event.lastResponse}
            </div>
          )}
        </div>

        <div style={{
          border: '1px solid var(--border-color)',
          padding: '24px',
          marginBottom: '32px',
          backgroundColor: 'var(--hover-color)',
          fontSize: '14px',
          lineHeight: '1.8'
        }}>
          <div style={{ 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            opacity: 0.6, 
            marginBottom: '16px' 
          }}>
            COLLEAGUE FROM FLOOR ??
          </div>
          <p style={{ fontStyle: 'italic' }}>
            &lsquo;{event.dialogue}&lsquo;
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            opacity: 0.6, 
            marginBottom: '8px' 
          }}>
            YOUR RESPONSE
          </div>
          {event.responses.map((response, i) => (
            <button
              key={i}
              onClick={() => handleResponse(response, i)}
              style={{
                background: clickedButton === i ? 'var(--accent-color)' : 'none',
                border: '1px solid var(--border-color)',
                color: clickedButton === i ? 'var(--bg-color)' : 'var(--text-color)',
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'all 0.1s cubic-bezier(0.4, 0.0, 0.2, 1)',
                letterSpacing: '0.5px',
                transform: clickedButton === i ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {response}
            </button>
          ))}
        </div>

        <div style={{
          marginTop: '32px',
          padding: '16px',
          border: '1px solid rgba(255, 0, 0, 0.3)',
          fontSize: '11px',
          opacity: 0.5,
          textAlign: 'center',
          color: '#ff6b6b'
        }}>
          He won&apos;t leave until you respond correctly.
        </div>
      </div>
      <Footer />
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}