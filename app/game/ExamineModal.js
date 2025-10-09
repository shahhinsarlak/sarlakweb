import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ExamineModal({ item, closeExamine }) {
  return (
    <>
      <Header />
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '700px',
        margin: '0 auto',
        padding: '60px 40px',
        minHeight: '100vh',
        fontSize: '14px'
      }}>
        <div style={{
          border: '1px solid var(--border-color)',
          padding: '32px',
          backgroundColor: 'var(--hover-color)'
        }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.6,
            marginBottom: '20px'
          }}>
            EXAMINING: {item.name}
          </div>
          <div style={{
            fontSize: '15px',
            lineHeight: '1.8',
            marginBottom: '32px'
          }}>
            {item.story}
          </div>
          <button
            onClick={closeExamine}
            style={{
              background: 'var(--accent-color)',
              border: '1px solid var(--border-color)',
              color: 'var(--bg-color)',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit',
              letterSpacing: '0.5px',
              width: '100%'
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}