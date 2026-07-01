'use client';
import { useState } from 'react';
import styles from '../page.module.css';
import { CloseIcon } from './Icons';
import { useAuth } from '../auth/AuthProvider';
import { saveProfile } from '../actions/profile';

// View and edit the signed-in user's Lure profile. Saves through the server
// action (httpOnly session, owner auth); the browser never touches a token.
// Sign out lives here so the top bar can just show the handle.

export default function ProfileSheet({ followingCount, followersCount, onOpenConnections, onClose }) {
  const { profile, setProfile, signOutHref } = useAuth();
  const [handle, setHandle] = useState(profile ? profile.handle : '');
  const [displayName, setDisplayName] = useState(profile ? profile.displayName : '');
  const [bio, setBio] = useState(profile ? profile.bio : '');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const touch = (setter) => (event) => {
    setter(event.target.value);
    setSaved(false);
    if (error) setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const res = await saveProfile({ handle, displayName, bio });
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setProfile(res.profile);
    setSaved(true);
  };

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true" aria-label="Your profile">
      <button type="button" className={styles.sheetScrim} aria-label="Close" onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetHead}>
          <h2 className={styles.sheetTitle}>{profile ? 'Your profile' : 'Set up your profile'}</h2>
          <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <button type="button" className={styles.connSummary} onClick={onOpenConnections}>
          <span><strong>{followingCount}</strong> Following</span>
          <span><strong>{followersCount}</strong> Followers</span>
        </button>

        <p className={styles.authIntro}>
          This is how you show up on Lure. You can change it anytime.
        </p>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <label className={styles.authLabel}>
            Handle
            <input
              className={styles.authInput}
              type="text"
              value={handle}
              onChange={touch(setHandle)}
              placeholder="yourhandle"
              maxLength={30}
              autoCapitalize="none"
              required
            />
          </label>
          <label className={styles.authLabel}>
            Display name
            <input
              className={styles.authInput}
              type="text"
              value={displayName}
              onChange={touch(setDisplayName)}
              placeholder="Your name"
              maxLength={60}
            />
          </label>
          <label className={styles.authLabel}>
            Bio
            <textarea
              className={styles.authTextarea}
              value={bio}
              onChange={touch(setBio)}
              placeholder="A line about you"
              maxLength={280}
              rows={3}
            />
          </label>
          {error && <p className={styles.authError}>{error}</p>}
          {saved && <p className={styles.authNotice}>Saved.</p>}
          <button className={styles.authSubmit} type="submit" disabled={busy}>
            {busy ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        <a className={styles.sheetSignOut} href={signOutHref}>Sign out</a>
      </div>
    </div>
  );
}
