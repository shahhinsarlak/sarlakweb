/**
 * Story Moment Modal Component
 *
 * Displays mandatory narrative beats with dramatic presentation.
 * Story moments are forced encounters that reveal key plot points
 * and ensure players experience critical story revelations.
 */
import { useState } from 'react';
import { STRANGE_COLLEAGUE_DIALOGUES } from './constants';

export default function StoryMomentModal({ storyMoment, gameState, respondToColleague }) {
  const [clickedButton, setClickedButton] = useState(null);

  const handleResponse = (responseOption, index) => {
    setClickedButton(index);
    setTimeout(() => {
      respondToColleague(responseOption);
      setClickedButton(null);
    }, 150);
  };

  // Get colleague data for ASCII art if applicable
  const colleague = storyMoment.colleague
    ? STRANGE_COLLEAGUE_DIALOGUES.find(c => c.id === storyMoment.colleague)
    : null;

  // Response type styling
  const getResponseTypeStyle = (type) => {
    const styles = {
      seeker: { borderColor: '#4a9eff', color: '#4a9eff' },
      rationalist: { borderColor: '#888', color: '#888' },
      protector: { borderColor: '#ff4a4a', color: '#ff4a4a' },
      convert: { borderColor: '#9d4edd', color: '#9d4edd' },
      rebel: { borderColor: '#ffd700', color: '#ffd700' },
      neutral: { borderColor: '#888', color: '#888' }
    };
    return styles[type] || { borderColor: 'var(--border-color)', color: 'var(--text-color)' };
  };

  return (
    <div style={{
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        border: '3px solid var(--accent-color)',
        padding: '40px',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        boxShadow: '0 0 50px rgba(255, 255, 255, 0.1)'
      }}>

        {/* Story Moment Title */}
        <div style={{
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          letterSpacing: '3px',
          marginBottom: '30px',
          color: 'var(--accent-color)',
          textTransform: 'uppercase',
          borderBottom: '2px solid var(--accent-color)',
          paddingBottom: '15px'
        }}>
          {storyMoment.title}
        </div>

        {/* Colleague ASCII Art */}
        {colleague && (
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
            {colleague.ascii}
          </div>
        )}

        {/* Story Dialogue */}
        <div style={{
          border: '1px solid var(--border-color)',
          padding: '30px',
          marginBottom: '32px',
          backgroundColor: 'var(--hover-color)',
          fontSize: '15px',
          lineHeight: '1.9',
          whiteSpace: 'pre-wrap',
          fontStyle: 'italic'
        }}>
          {storyMoment.dialogue}
        </div>

        {/* Response Options */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {storyMoment.responses.map((response, index) => {
            const style = getResponseTypeStyle(response.type);

            // Check if response is available
            const isAvailable = !response.available || response.available(gameState);
            if (!isAvailable) return null;

            return (
              <button
                key={index}
                onClick={() => handleResponse(response, index)}
                disabled={clickedButton !== null}
                style={{
                  fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
                  padding: '16px 20px',
                  fontSize: '14px',
                  backgroundColor: clickedButton === index ? style.color : 'var(--bg-color)',
                  color: clickedButton === index ? 'var(--bg-color)' : style.color,
                  border: `2px solid ${style.color}`,
                  cursor: clickedButton === null ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  lineHeight: '1.6',
                  opacity: clickedButton === null ? 1 : (clickedButton === index ? 1 : 0.3),
                  boxShadow: clickedButton === index ? `0 0 20px ${style.color}` : 'none',
                  transform: clickedButton === index ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (clickedButton === null) {
                    e.currentTarget.style.backgroundColor = style.color;
                    e.currentTarget.style.color = 'var(--bg-color)';
                    e.currentTarget.style.boxShadow = `0 0 15px ${style.color}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (clickedButton !== index) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-color)';
                    e.currentTarget.style.color = style.color;
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {response.text}
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--border-color)',
          fontStyle: 'italic'
        }}>
          This moment will shape your path...
        </div>
      </div>
    </div>
  );
}
