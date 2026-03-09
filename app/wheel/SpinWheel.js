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

function spinWheel({ canvasRef, frameIdRef, isSpinningRef, currentAngleRef, onComplete }) {
  const selectedIndex = Math.floor(Math.random() * SEGMENT_COUNT);

  // Compute target rotation so selectedIndex lands at 12 o'clock (-PI/2)
  // The center of selectedIndex is at: currentAngle + (selectedIndex + 0.5) * SEGMENT_ANGLE
  // We want that center at -PI/2 (12 o'clock)
  // So: targetAngle + (selectedIndex + 0.5) * SEGMENT_ANGLE ≡ -PI/2 (mod 2PI)
  // Add 5 full extra spins for visual effect
  const EXTRA_SPINS = 5;
  const currentAngle = currentAngleRef.current;
  const segmentCenterOffset = (selectedIndex + 0.5) * SEGMENT_ANGLE;
  const desiredPointerAngle = -Math.PI / 2;
  // Angle the wheel base needs to be at so segment center is at pointer
  const targetBase = desiredPointerAngle - segmentCenterOffset;
  // How far to rotate from current position (always forward — positive delta)
  let delta = targetBase - (currentAngle % (2 * Math.PI));
  if (delta <= 0) delta += 2 * Math.PI;
  const targetAngle = currentAngle + delta + EXTRA_SPINS * 2 * Math.PI;

  const startAngle = currentAngle;
  const startTime = performance.now();
  const DURATION_MS = 4000; // 4 seconds

  function animate(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / DURATION_MS, 1.0);
    // Ease-out cubic — decelerates smoothly
    const eased = 1 - Math.pow(1 - progress, 3);
    const angle = startAngle + (targetAngle - startAngle) * eased;

    currentAngleRef.current = angle;
    drawWheel(canvasRef.current, angle);

    if (progress < 1.0) {
      // Only re-schedule if still spinning — gate prevents loop continuing after stop
      if (isSpinningRef.current) {
        frameIdRef.current = requestAnimationFrame(animate);
      }
    } else {
      // Animation complete
      currentAngleRef.current = targetAngle;
      isSpinningRef.current = false;
      onComplete(selectedIndex);
    }
  }

  isSpinningRef.current = true;
  frameIdRef.current = requestAnimationFrame(animate);
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

  function handleSpin() {
    if (isSpinningRef.current || words.length === 0) return;
    setIsSpinning(true);
    setSelectedWord(null);
    setCaption(null);

    spinWheel({
      canvasRef,
      frameIdRef,
      isSpinningRef,
      currentAngleRef,
      onComplete: (selectedIndex) => {
        setIsSpinning(false);
        setSelectedWord(words[selectedIndex].word);
        setCaption(words[selectedIndex].caption);
      },
    });
  }

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
        {selectedWord && (
          <p key={selectedWord} className={styles.selectedWord}>{selectedWord}</p>
        )}
        {caption && (
          <p key={caption} className={styles.caption}>{caption}</p>
        )}
      </div>
    </div>
  );
}
