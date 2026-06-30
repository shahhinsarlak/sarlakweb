'use client';
import styles from '../page.module.css';

// The unlock screen. Browsers block audio autoplay until the user interacts, so
// the feed starts behind this gate. The tap that dismisses it is the gesture
// that lets every later preview autoplay in the session. It doubles as a quick
// explainer of the swipe loop.

export default function StartGate({ onStart }) {
  return (
    <div className={styles.gate}>
      <div className={styles.gateInner}>
        <div className={styles.gateKicker}>Lure</div>
        <h1 className={styles.gateTitle}>Short audio, made to hook you.</h1>
        <p className={styles.gateLede}>
          Every post opens with an eight second preview. Like it and just let it play,
          it flows straight into the full piece. If it does not grab you, swipe up for
          the next one.
        </p>
        <button type="button" className={styles.gateButton} onClick={onStart}>
          Tap to listen
        </button>
        <p className={styles.gateNote}>Sound on. Swipe up and down to move.</p>
      </div>
    </div>
  );
}
