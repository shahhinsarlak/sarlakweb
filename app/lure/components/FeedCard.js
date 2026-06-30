'use client';
import { forwardRef, memo } from 'react';
import styles from '../page.module.css';
import Waveform from './Waveform';
import PreviewRing from './PreviewRing';
import SideRail from './SideRail';
import { PlayIcon, PauseIcon } from './Icons';
import { formatTime } from '../lib/format';

// A single full-viewport post in the feed. Memoised so that only the active
// card re-renders as playback advances; the rest stay put.

const FeedCard = forwardRef(function FeedCard(
  {
    post,
    creator,
    category,
    index,
    isActive,
    audioRef,
    isPlaying,
    phase,
    currentTime,
    duration,
    liked,
    saved,
    muted,
    onTogglePlay,
    onLike,
    onSave,
    onShare,
    onToggleMute,
    onTranscript,
    onCreator,
    onSeek,
  },
  ref,
) {
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const isPreview = isActive && phase === 'preview';
  const likeCount = post.likeCount + (liked ? 1 : 0);

  // The id-based handlers are stable from the parent; bind them to this post.
  const handleLike = () => onLike(post.id);
  const handleSave = () => onSave(post.id);
  const handleShare = () => onShare(post.id);
  const handleTranscript = () => onTranscript(post.id);
  const handleCreator = () => onCreator(post.id);

  const handleSeek = (event) => {
    if (!isActive || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, fraction)) * duration);
  };

  return (
    <section ref={ref} data-index={index} className={styles.card} style={{ '--accent': category.accent }}>
      <div className={styles.cardGlow} aria-hidden="true" />
      <Waveform post={post} progress={progress} isPlaying={isActive && isPlaying} />

      <div
        className={styles.tapLayer}
        onClick={onTogglePlay}
        aria-hidden="true"
      />

      <SideRail
        creator={creator}
        liked={liked}
        saved={saved}
        muted={muted}
        likeCount={likeCount}
        onLike={handleLike}
        onSave={handleSave}
        onShare={handleShare}
        onToggleMute={onToggleMute}
        onTranscript={handleTranscript}
        onCreator={handleCreator}
      />

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={styles.categoryTag}>
            <span aria-hidden="true">{category.glyph}</span> {category.label}
          </span>
          {isActive && (
            <span className={styles.phaseTag} data-phase={phase}>
              {isPreview ? 'Preview' : 'Full'}
            </span>
          )}
        </div>

        <h2 className={styles.cardTitle}>{post.title}</h2>
        <p className={styles.cardCaption}>{post.caption}</p>
        <button type="button" className={styles.cardCreator} onClick={handleCreator}>
          {creator.name} <span className={styles.cardHandle}>{creator.handle}</span>
        </button>

        <div className={styles.controlRow}>
          <button
            type="button"
            className={styles.playButton}
            onClick={onTogglePlay}
            aria-label={isActive && isPlaying ? 'Pause' : 'Play'}
          >
            {isPreview && <PreviewRing audioRef={audioRef} post={post} />}
            <span className={styles.playGlyph}>
              {isActive && isPlaying ? <PauseIcon size={26} /> : <PlayIcon size={26} />}
            </span>
          </button>

          <div className={styles.scrubArea}>
            <button
              type="button"
              className={styles.scrubTrack}
              onClick={handleSeek}
              aria-label="Seek"
              tabIndex={isActive ? 0 : -1}
            >
              <span className={styles.scrubFill} style={{ width: `${progress * 100}%` }} />
            </button>
            <div className={styles.scrubTimes}>
              <span>{formatTime(isActive ? currentTime : 0)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default memo(FeedCard);
