'use client';
import { useRef, useEffect, useState } from 'react';
import { getCachedWords, setCachedWords } from './wheelCache';
import styles from './page.module.css';

const SEGMENT_COUNT = 128;
const SEGMENT_ANGLE = (2 * Math.PI) / SEGMENT_COUNT;
const CANVAS_SIZE = 500; // px — square canvas

// Design tokens for Canvas 2D (CSS vars not accessible in canvas context)
const COLORS = {
  accent: '#8b5cf6',
  accentDim: '#7c3aed',
  bg: '#0f0f0f',
  bgElevated: '#1a1a1a',
};

function drawWheel(canvas, rotationAngle) {
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) - 8;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const startAngle = rotationAngle + i * SEGMENT_ANGLE;
    const endAngle = startAngle + SEGMENT_ANGLE;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();

    ctx.fillStyle = i % 2 === 0 ? COLORS.accent : COLORS.accentDim;
    ctx.fill();

    // Thin dark separator between segments
    ctx.strokeStyle = COLORS.bg;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Center hub — covers the point convergence visually
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.bgElevated;
  ctx.fill();
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function handleSpin() {
  // Implemented in Task 2
}

export default function SpinWheel() {
  const canvasRef = useRef(null);
  const frameIdRef = useRef(null);
  const isSpinningRef = useRef(false);
  const currentAngleRef = useRef(0);

  const [words, setWords] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [caption, setCaption] = useState(null);
  const [loadingWords, setLoadingWords] = useState(true);
  const [error, setError] = useState(null);

  // Word loading effect — runs once on mount
  useEffect(() => {
    const cached = getCachedWords();
    if (cached) {
      setWords(cached);
      setLoadingWords(false);
      return;
    }
    fetch('/api/wheel')
      .then(r => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(data => {
        setCachedWords(data.words);
        setWords(data.words);
        setLoadingWords(false);
      })
      .catch(() => setError('Failed to load words — try refreshing.'));
  }, []);

  // rAF cleanup effect — runs once on mount, cleanup only
  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameIdRef.current); // Critical: prevent loop surviving unmount
    };
  }, []);

  // Canvas draw effect — re-draws when words load
  useEffect(() => {
    if (!canvasRef.current || words.length === 0) return;
    drawWheel(canvasRef.current, currentAngleRef.current);
  }, [words]);

  return (
    <div className={styles.wheelPage}>
      {loadingWords && <p className={styles.loadingText}>LOADING...</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      {!loadingWords && !error && (
        <div className={styles.wheelContainer}>
          <div className={styles.pointer} />
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
          />
        </div>
      )}
      <button
        className={styles.spinButton}
        onClick={handleSpin}
        disabled={isSpinning || loadingWords || !!error}
      >
        SPIN
      </button>
      <div className={styles.resultSection}>
        {selectedWord && <p className={styles.selectedWord}>{selectedWord}</p>}
        {caption && <p className={styles.caption}>{caption}</p>}
      </div>
    </div>
  );
}
