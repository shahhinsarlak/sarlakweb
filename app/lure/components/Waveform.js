'use client';
import { useMemo } from 'react';
import styles from '../page.module.css';

// A decorative waveform. There is no video to show, so this carries the motion.
// Bar heights are derived deterministically from the post id (so each post has
// its own stable shape), the played portion is tinted with the category accent,
// and the bars gently pulse while audio is playing. A real Web Audio
// AnalyserNode visual is a documented upgrade.

const BAR_COUNT = 56;

function buildHeights(id, count) {
  // Tiny deterministic hash so the same post always draws the same shape.
  let seed = 0;
  for (let i = 0; i < id.length; i++) {
    seed = (seed * 31 + id.charCodeAt(i)) % 100000;
  }
  const heights = [];
  for (let i = 0; i < count; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const base = (seed / 2147483648);
    // Shape it with a gentle arch so the middle reads taller than the edges.
    const arch = Math.sin((i / (count - 1)) * Math.PI);
    const height = 18 + base * 64 * (0.45 + 0.55 * arch);
    heights.push(Math.round(height));
  }
  return heights;
}

export default function Waveform({ post, progress, isPlaying }) {
  const heights = useMemo(() => buildHeights(post.id, BAR_COUNT), [post.id]);
  const playedUpTo = Math.round(progress * BAR_COUNT);

  return (
    <div
      className={styles.waveform}
      data-playing={isPlaying ? 'true' : 'false'}
      aria-hidden="true"
    >
      {heights.map((height, index) => (
        <span
          key={index}
          className={index < playedUpTo ? styles.waveBarPlayed : styles.waveBar}
          style={{ height: `${height}%`, animationDelay: `${(index % 8) * 0.07}s` }}
        />
      ))}
    </div>
  );
}
