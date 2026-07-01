'use client';
import { useEffect, useState } from 'react';
import styles from '../page.module.css';
import { CloseIcon } from './Icons';

// Following and Followers lists. Following is real (the creators the viewer
// follows) and each row opens that creator. Followers is seeded prototype data
// (see data/followers.js) and is display-only for now.

export default function ConnectionsSheet({
  following,
  followers,
  initialTab = 'following',
  onOpenCreator,
  onClose,
}) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    const handleKey = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const isFollowing = tab === 'following';
  const list = isFollowing ? following : followers;

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true" aria-label="Connections">
      <button type="button" className={styles.sheetScrim} aria-label="Close" onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetHead}>
          <div className={styles.connTabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isFollowing}
              className={`${styles.connTab} ${isFollowing ? styles.connTabActive : ''}`}
              onClick={() => setTab('following')}
            >
              {following.length} Following
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isFollowing}
              className={`${styles.connTab} ${!isFollowing ? styles.connTabActive : ''}`}
              onClick={() => setTab('followers')}
            >
              {followers.length} Followers
            </button>
          </div>
          <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        {list.length === 0 ? (
          <p className={styles.searchEmpty}>
            {isFollowing ? 'You are not following anyone yet.' : 'No followers yet.'}
          </p>
        ) : (
          <ul className={styles.connList}>
            {list.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  className={styles.connItem}
                  onClick={isFollowing ? () => onOpenCreator(person.id) : undefined}
                  disabled={!isFollowing}
                >
                  <span className={styles.connAvatar} aria-hidden="true">{person.name.charAt(0)}</span>
                  <span className={styles.connMain}>
                    <span className={styles.connName}>{person.name}</span>
                    <span className={styles.connHandle}>{person.handle}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
