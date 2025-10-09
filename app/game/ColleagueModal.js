import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ColleagueModal({ event, recentMessages, respondToColleague }) {
  return (
    <>
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
          
          {recentMessages.length > 1 && 
           recentMessages[recentMessages.length - 1].startsWith('"') && (
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
              whiteSpace: 'normal'
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
              {recentMessages[recentMessages.length - 1].replace(/"/g, '')}
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
            "{event.dialogue}"
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
              onClick={() => respondToColleague(response, i)}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                letterSpacing: '0.5px'
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
          He won't leave until you respond correctly.
        </div>
      </div>
      <Footer />
    </>
  );
}