'use client';
import { useEffect, useRef } from 'react';
import styles from '../page.module.css';

// The eight second countdown around the play control. It reads the shared audio
// element directly on a rAF loop so the ring is smooth, rather than re-rendering
// React state many times a second. It only shows during the preview phase.

export default function PreviewRing({ audioRef, post, size = 76, stroke = 3 }) {
  const progressRef = useRef(null);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let frame;
    const tick = () => {
      const audio = audioRef.current;
      const circle = progressRef.current;
      if (audio && circle && post) {
        const start = post.previewStartSec || 0;
        const length = post.previewLengthSec || 8;
        const elapsed = Math.min(Math.max(audio.currentTime - start, 0), length);
        const fraction = elapsed / length;
        circle.style.strokeDashoffset = String(circumference * fraction);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [audioRef, post, circumference]);

  return (
    <svg className={styles.previewRing} width={size} height={size}>
      <circle
        className={styles.previewRingTrack}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
      />
      <circle
        ref={progressRef}
        className={styles.previewRingProgress}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={0}
      />
    </svg>
  );
}
