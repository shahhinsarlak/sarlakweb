'use client';
import styles from '../page.module.css';
import { formatCount } from '../lib/format';
import {
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  SoundOnIcon,
  SoundOffIcon,
  TranscriptIcon,
} from './Icons';

// The TikTok-style vertical action rail. Everything here is local-only in the
// prototype: likes and saves live in localStorage, share copies a link.

export default function SideRail({
  creator,
  liked,
  saved,
  muted,
  likeCount,
  onLike,
  onSave,
  onShare,
  onToggleMute,
  onTranscript,
  onCreator,
}) {
  return (
    <div className={styles.sideRail}>
      <button
        type="button"
        className={styles.creatorDot}
        onClick={onCreator}
        aria-label={`About ${creator.name}`}
        title={creator.name}
      >
        {creator.name.charAt(0)}
      </button>

      <button
        type="button"
        className={`${styles.railButton} ${liked ? styles.railButtonActive : ''}`}
        onClick={onLike}
        aria-pressed={liked}
        aria-label={liked ? 'Remove like' : 'Like'}
      >
        <HeartIcon filled={liked} />
        <span className={styles.railCount}>{formatCount(likeCount)}</span>
      </button>

      <button
        type="button"
        className={`${styles.railButton} ${saved ? styles.railButtonActive : ''}`}
        onClick={onSave}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved' : 'Save'}
      >
        <BookmarkIcon filled={saved} />
        <span className={styles.railCount}>Save</span>
      </button>

      <button
        type="button"
        className={styles.railButton}
        onClick={onShare}
        aria-label="Share"
      >
        <ShareIcon />
        <span className={styles.railCount}>Share</span>
      </button>

      <button
        type="button"
        className={styles.railButton}
        onClick={onTranscript}
        aria-label="Show transcript"
      >
        <TranscriptIcon />
        <span className={styles.railCount}>Text</span>
      </button>

      <button
        type="button"
        className={styles.railButton}
        onClick={onToggleMute}
        aria-pressed={muted}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <SoundOffIcon /> : <SoundOnIcon />}
        <span className={styles.railCount}>{muted ? 'Muted' : 'Sound'}</span>
      </button>
    </div>
  );
}
