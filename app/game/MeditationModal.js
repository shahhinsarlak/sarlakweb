import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function MeditationModal({ gameState, breatheAction, cancelMeditation }) {
  const elapsed = gameState.meditationStartTime ? Date.now() - gameState.meditationStartTime : 0;
  const target = gameState.meditationTargetTime || 3000;
  const progress = Math.min(100, (elapsed / target) * 100);
  const perfectWindow = gameState.meditationPerfectWindow || 300;
  
  const difference = Math.abs(elapsed - target);
  const isPerfect = difference <= perfectWindow;
  const isGood = difference <= perfectWindow * 2;
  const isOkay = difference <= perfectWindow * 4;
  
  let barColor = '#444';
  if (isPerfect) barColor = '#00ff00';
  else if (isGood) barColor = '#ffaa00';
  else if (isOkay) barColor = '#ff6600';
  
  const currentAction = gameState.meditationPhase;
  const breathNum = currentAction === 'inhale' ? gameState.breathCount + 1 : gameState.breathCount;
  
  return (
    <>
      <Header />
      <div style={{
        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        maxWidth: '600px',
        margin: '0 auto',
        padding: '60px 40px',
        minHeight: '100vh',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        <div style={{
          border: '1px solid var(--border-color)',
          padding: '60px 40px',
          backgroundColor: 'var(--hover-color)'
        }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.6,
            marginBottom: '40px'
          }}>
            MEDITATION - BREATH {breathNum}/5
          </div>
          <div style={{
            fontSize: '80px',
            marginBottom: '40px',
            opacity: isPerfect ? 1 : 0.4,
            transition: 'opacity 0.1s',
            transform: currentAction === 'inhale' ? 'scale(1.1)' : 'scale(0.9)',
            transitionDuration: '0.3s'
          }}>
            🧘
          </div>
          <div style={{
            fontSize: '32px',
            opacity: 0.9,
            marginBottom: '30px',
            lineHeight: '1.8',
            color: isPerfect ? '#00ff00' : 'var(--text-color)',
            transition: 'color 0.1s',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: '600'
          }}>
            {currentAction}
          </div>
          
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            marginBottom: '20px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: barColor,
              transition: 'width 0.05s linear, background-color 0.1s',
              boxShadow: isPerfect ? '0 0 10px ' + barColor : 'none'
            }}></div>
            
            <div style={{
              position: 'absolute',
              left: '90%',
              top: '0',
              width: '10%',
              height: '100%',
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              border: '1px solid rgba(0, 255, 0, 0.5)'
            }}></div>
          </div>

          <div style={{
            fontSize: '11px',
            opacity: 0.6,
            marginBottom: '30px'
          }}>
            {isPerfect && 'PERFECT ZONE!'}
            {!isPerfect && isGood && 'Good timing...'}
            {!isPerfect && !isGood && isOkay && 'Getting close...'}
            {!isPerfect && !isGood && !isOkay && 'Wait for the green zone...'}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <button
              onClick={() => breatheAction('inhale')}
              style={{
                background: currentAction === 'inhale' && isPerfect ? '#00ff00' : currentAction === 'inhale' ? 'var(--accent-color)' : 'none',
                border: '1px solid var(--border-color)',
                color: currentAction === 'inhale' && isPerfect ? '#000' : currentAction === 'inhale' ? 'var(--bg-color)' : 'var(--text-color)',
                padding: '20px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit',
                letterSpacing: '0.5px',
                fontWeight: '500',
                transition: 'all 0.2s',
                textTransform: 'uppercase'
              }}
            >
              Inhale
            </button>
            <button
              onClick={() => breatheAction('exhale')}
              style={{
                background: currentAction === 'exhale' && isPerfect ? '#00ff00' : currentAction === 'exhale' ? 'var(--accent-color)' : 'none',
                border: '1px solid var(--border-color)',
                color: currentAction === 'exhale' && isPerfect ? '#000' : currentAction === 'exhale' ? 'var(--bg-color)' : 'var(--text-color)',
                padding: '20px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit',
                letterSpacing: '0.5px',
                fontWeight: '500',
                transition: 'all 0.2s',
                textTransform: 'uppercase'
              }}
            >
              Exhale
            </button>
          </div>
          <button
            onClick={cancelMeditation}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit',
              letterSpacing: '0.5px',
              width: '100%'
            }}
          >
            STOP
          </button>
          
          <div style={{
            marginTop: '30px',
            fontSize: '10px',
            opacity: 0.5,
            lineHeight: '1.6'
          }}>
            Press the correct button when the bar reaches the green zone<br/>
            Perfect timing = 300ms window
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}