'use client';
import { useState } from 'react';
import styles from '../page.module.css';
import { CloseIcon } from './Icons';
import { useAuth } from '../auth/AuthProvider';

// Sign up / verify / sign in, in one small modal. Email and password only for
// the prototype. Passwords go straight to Cognito over the SRP flow; we never
// see or store them.

export default function AuthSheet({ onClose }) {
  const { signUp, confirmSignUp, signIn, resendCode } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e && e.message ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const onSignIn = (event) => {
    event.preventDefault();
    run(async () => {
      await signIn(email, password);
      onClose();
    });
  };

  const onSignUp = (event) => {
    event.preventDefault();
    run(async () => {
      await signUp(email, password);
      setNotice('We sent a six digit code to your email.');
      setMode('confirm');
    });
  };

  const onConfirm = (event) => {
    event.preventDefault();
    run(async () => {
      await confirmSignUp(email, code);
      await signIn(email, password);
      onClose();
    });
  };

  const title = mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Confirm your email';

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true" aria-label="Account">
      <button type="button" className={styles.sheetScrim} aria-label="Close" onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetHead}>
          <h2 className={styles.sheetTitle}>{title}</h2>
          <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <p className={styles.authIntro}>
          Sign in to keep your likes and saves across devices. Signed out, everything stays on
          this device, exactly as it does now.
        </p>

        {notice && <p className={styles.authNotice}>{notice}</p>}

        {mode === 'signin' && (
          <form className={styles.authForm} onSubmit={onSignIn}>
            <label className={styles.authLabel}>
              Email
              <input
                className={styles.authInput}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className={styles.authLabel}>
              Password
              <input
                className={styles.authInput}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && <p className={styles.authError}>{error}</p>}
            <button className={styles.authSubmit} type="submit" disabled={busy}>
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
            <p className={styles.authSwitch}>
              No account?{' '}
              <button
                type="button"
                className={styles.authSwitchBtn}
                onClick={() => { setMode('signup'); setError(null); setNotice(null); }}
              >
                Create one
              </button>
            </p>
          </form>
        )}

        {mode === 'signup' && (
          <form className={styles.authForm} onSubmit={onSignUp}>
            <label className={styles.authLabel}>
              Email
              <input
                className={styles.authInput}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className={styles.authLabel}>
              Password
              <input
                className={styles.authInput}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </label>
            {error && <p className={styles.authError}>{error}</p>}
            <button className={styles.authSubmit} type="submit" disabled={busy}>
              {busy ? 'Creating...' : 'Create account'}
            </button>
            <p className={styles.authSwitch}>
              Already have one?{' '}
              <button
                type="button"
                className={styles.authSwitchBtn}
                onClick={() => { setMode('signin'); setError(null); setNotice(null); }}
              >
                Sign in
              </button>
            </p>
          </form>
        )}

        {mode === 'confirm' && (
          <form className={styles.authForm} onSubmit={onConfirm}>
            <label className={styles.authLabel}>
              Verification code
              <input
                className={styles.authInput}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </label>
            {error && <p className={styles.authError}>{error}</p>}
            <button className={styles.authSubmit} type="submit" disabled={busy}>
              {busy ? 'Confirming...' : 'Confirm and sign in'}
            </button>
            <p className={styles.authSwitch}>
              Did not get it?{' '}
              <button
                type="button"
                className={styles.authSwitchBtn}
                onClick={() => run(async () => { await resendCode(email); setNotice('New code sent.'); })}
              >
                Resend code
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
