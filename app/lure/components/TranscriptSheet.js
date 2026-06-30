'use client';
import { useEffect } from 'react';
import styles from '../page.module.css';
import { CloseIcon } from './Icons';

// Full transcript overlay. Audio needs a text alternative for accessibility, and
// for the Explainers and Books categories the transcript is a genuine feature.

export default function TranscriptSheet({ post, creator, category, onClose }) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true" aria-label="Transcript">
      <button type="button" className={styles.sheetScrim} aria-label="Close transcript" onClick={onClose} />
      <div className={styles.sheet} style={{ '--accent': category.accent }}>
        <div className={styles.sheetHead}>
          <div>
            <div className={styles.sheetCategory}>
              <span aria-hidden="true">{category.glyph}</span> {category.label}
            </div>
            <h2 className={styles.sheetTitle}>{post.title}</h2>
            <div className={styles.sheetCreator}>{creator.name} {creator.handle}</div>
          </div>
          <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>
        <p className={styles.sheetBody}>{post.transcript}</p>
      </div>
    </div>
  );
}
