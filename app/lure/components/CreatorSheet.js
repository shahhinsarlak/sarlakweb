'use client';
import { useEffect } from 'react';
import styles from '../page.module.css';
import { formatCount } from '../lib/format';
import { CloseIcon } from './Icons';

// Lightweight creator profile. Read-only in the prototype: it shows the
// creator and their other posts, and tapping one jumps to it in the feed.

export default function CreatorSheet({ creator, category, posts, onSelectPost, onClose }) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true" aria-label={creator.name}>
      <button type="button" className={styles.sheetScrim} aria-label="Close profile" onClick={onClose} />
      <div className={styles.sheet} style={{ '--accent': category.accent }}>
        <div className={styles.sheetHead}>
          <div className={styles.creatorHeadRow}>
            <span className={styles.creatorAvatar} aria-hidden="true">{creator.name.charAt(0)}</span>
            <div>
              <h2 className={styles.sheetTitle}>{creator.name}</h2>
              <div className={styles.sheetCreator}>{creator.handle}</div>
            </div>
          </div>
          <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>
        <p className={styles.creatorBio}>{creator.bio}</p>
        <div className={styles.creatorListLabel}>Posts</div>
        <ul className={styles.creatorList}>
          {posts.map((post) => (
            <li key={post.id}>
              <button type="button" className={styles.creatorListItem} onClick={() => onSelectPost(post.id)}>
                <span className={styles.creatorListTitle}>{post.title}</span>
                <span className={styles.creatorListMeta}>{formatCount(post.likeCount)} likes</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
