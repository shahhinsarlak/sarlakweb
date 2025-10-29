import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EventLog from './EventLog';
import { getColleagueDialogue, getAvailableResponses } from './colleagueHelpers';

export default function ColleagueModal({ event, recentMessages, respondToColleague, hasWeapon, onStartCombat, gameState }) {
  const [clickedButton, setClickedButton] = useState(null);

  const handleResponse = (responseOption, index) => {
    setClickedButton(index);
    setTimeout(() => {
      respondToColleague(responseOption);
      setClickedButton(null);
    }, 150);
  };

  const handleCombat = () => {
    if (onStartCombat) {
      onStartCombat();
    }
  };

  // Get context-aware dialogue and responses
  const relationship = gameState?.colleagueRelationships?.[event.id] || { trust: 0, encounters: 0, lastResponseType: null };
  const currentDialogue = getColleagueDialogue(event, relationship);
  const availableResponses = getAvailableResponses(event, gameState || {});

  // Response type styling
  const getResponseTypeStyle = (type) => {
    const styles = {
      empathetic: { borderColor: '#4a9eff', color: '#4a9eff', icon: '💙' },
      dismissive: { borderColor: '#888', color: '#888', icon: '🚪' },
      hostile: { borderColor: '#ff4a4a', color: '#ff4a4a', icon: '⚔️' },
      compliant: { borderColor: '#9d4edd', color: '#9d4edd', icon: '🤝' },
      dark_pact: { borderColor: '#6a0dad', color: '#6a0dad', icon: '👁️' },
      esoteric: { borderColor: '#ffd700', color: '#ffd700', icon: '✨' },
      prophetic: { borderColor: '#00ced1', color: '#00ced1', icon: '📜' },
      void_touched: { borderColor: '#1a1a1a', color: '#1a1a1a', icon: '🌀' }
    };
    return styles[type] || { borderColor: 'var(--border-color)', color: 'var(--text-color)', icon: '💬' };
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
              onClick={() => {
                // Find a compliant response option
                const compliantResponse = availableResponses.find(r => r.type === 'compliant');
                if (compliantResponse) {
                  respondToColleague(compliantResponse);
                }
              }}
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
              🏳️ Try to reason with them
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
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>COLLEAGUE FROM FLOOR ??</span>
            {relationship.encounters > 0 && (
              <span style={{ fontSize: '10px', opacity: 0.5 }}>
                Encounter #{relationship.encounters + 1} | Trust: {relationship.trust > 0 ? '+' : ''}{relationship.trust}
              </span>
            )}
          </div>
          <p style={{ fontStyle: 'italic' }}>
            &lsquo;{currentDialogue}&lsquo;
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
          {availableResponses.map((response, i) => {
            const typeStyle = getResponseTypeStyle(response.type);
            const isSpecial = response.contextType !== undefined;

            return (
              <button
                key={i}
                onClick={() => handleResponse(response, i)}
                style={{
                  background: clickedButton === i ? typeStyle.color : 'none',
                  border: `1px solid ${typeStyle.borderColor}`,
                  color: clickedButton === i ? 'var(--bg-color)' : typeStyle.color,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'all 0.1s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  letterSpacing: '0.5px',
                  transform: clickedButton === i ? 'scale(0.98)' : 'scale(1)',
                  position: 'relative',
                  boxShadow: isSpecial ? '0 0 8px rgba(255, 215, 0, 0.3)' : 'none'
                }}
              >
                <span style={{ marginRight: '8px' }}>{typeStyle.icon}</span>
                {response.text}
                {isSpecial && (
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '10px',
                    opacity: 0.6,
                    textTransform: 'uppercase'
                  }}>
                    [Special]
                  </span>
                )}
              </button>
            );
          })}
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