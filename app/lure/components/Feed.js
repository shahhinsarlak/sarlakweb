'use client';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import styles from '../page.module.css';
import FeedCard from './FeedCard';

// The swipe surface. A CSS scroll-snap column with one full-viewport card each,
// and an IntersectionObserver that names the most-visible card as active. The
// parent drives audio off that active index. Keyboard, buttons and skips just
// scroll, and the observer does the rest, so there is a single source of truth.

const Feed = forwardRef(function Feed(
  {
    entries,
    activeIndex,
    playback,
    likes,
    saves,
    muted,
    onActiveChange,
    onTogglePlay,
    onToggleMute,
    onSeek,
    onLike,
    onSave,
    onShare,
    onTranscript,
    onCreator,
  },
  ref,
) {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  useImperativeHandle(ref, () => ({
    scrollToIndex(index) {
      const el = cardRefs.current[index];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    scrollToTop() {
      if (containerRef.current) containerRef.current.scrollTo({ top: 0 });
    },
  }), []);

  const setCardRef = useCallback((el) => {
    if (!el) return;
    const index = Number(el.getAttribute('data-index'));
    if (!Number.isNaN(index)) cardRefs.current[index] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observed) => {
        let bestIndex = -1;
        let bestRatio = 0;
        for (const entry of observed) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            const index = cardRefs.current.indexOf(entry.target);
            if (index >= 0) {
              bestRatio = entry.intersectionRatio;
              bestIndex = index;
            }
          }
        }
        if (bestIndex >= 0 && bestRatio >= 0.6) onActiveChange(bestIndex);
      },
      { threshold: [0.3, 0.6, 0.9] },
    );
    for (let i = 0; i < entries.length; i++) {
      const el = cardRefs.current[i];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [entries, onActiveChange]);

  return (
    <div className={styles.feed} ref={containerRef}>
      {entries.map((entry, index) => {
        const active = index === activeIndex;
        return (
          <FeedCard
            key={entry.post.id}
            ref={setCardRef}
            index={index}
            post={entry.post}
            creator={entry.creator}
            category={entry.category}
            isActive={active}
            audioRef={playback.audioRef}
            isPlaying={active ? playback.isPlaying : false}
            phase={active ? playback.phase : 'preview'}
            currentTime={active ? playback.currentTime : 0}
            duration={active ? playback.duration : 0}
            liked={likes.includes(entry.post.id)}
            saved={saves.includes(entry.post.id)}
            muted={muted}
            onTogglePlay={onTogglePlay}
            onToggleMute={onToggleMute}
            onSeek={onSeek}
            onLike={onLike}
            onSave={onSave}
            onShare={onShare}
            onTranscript={onTranscript}
            onCreator={onCreator}
          />
        );
      })}
    </div>
  );
});

export default Feed;
