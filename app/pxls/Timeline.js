'use client';

/**
 * PXLS Timeline
 *
 * Frame strip for animation. Shows each frame as a thumbnail (composited from
 * its own layer stack), lets the user select, add, duplicate, delete and
 * reorder frames, scrub by clicking, toggle onion skin, set fps, and play or
 * pause a looping preview. The currently previewed frame is highlighted while
 * playing.
 *
 * @param {Object} props
 * @param {Object} props.project - full project (frames + dims)
 * @param {string} props.activeFrameId
 * @param {string|null} props.previewFrameId - frame shown while playing, else null
 * @param {number} props.fps
 * @param {boolean} props.playing
 * @param {boolean} props.onion
 * @param {Object} props.handlers - frame action callbacks
 */

import { useEffect, useRef, useState } from 'react';
import { frameView } from './pxlsModel';
import { compositeToCanvas } from './renderHelpers';
import { MIN_FPS, MAX_FPS } from './constants';
import styles from './page.module.css';

/** Renders a single frame's composited thumbnail onto a canvas. */
function FrameThumb({ project, frame }) {
  const ref = useRef(null);
  useEffect(() => {
    const cell = Math.max(1, Math.floor(64 / project.width));
    compositeToCanvas(ref.current, frameView(project, frame), cell, { includeEffects: true });
  }, [project, frame]);
  return <canvas ref={ref} className={styles.framePreview} />;
}

export default function Timeline({
  project, activeFrameId, previewFrameId, fps, playing, onion, handlers,
}) {
  const {
    onSelectFrame, onAddFrame, onDuplicateFrame, onDeleteFrame, onReorderFrame,
    onSetFps, onTogglePlay, onToggleOnion,
  } = handlers;

  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const { frames } = project;
  const highlightId = previewFrameId || activeFrameId;

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineHead}>
        <span className={styles.panelTitle}>Frames ({frames.length})</span>
        <span className={styles.spacer} />
        <button
          type="button"
          className={`${styles.iconBtn} ${onion ? styles.iconBtnOn : ''}`}
          onClick={onToggleOnion}
          title="Onion skin: show the previous frame faintly"
        >
          onion
        </button>
        <span className={styles.fpsRow}>
          <label htmlFor="pxls-fps">fps</label>
          <input
            id="pxls-fps"
            type="number"
            min={MIN_FPS}
            max={MAX_FPS}
            value={fps}
            onChange={(e) => onSetFps(Number(e.target.value))}
            className={styles.fpsInput}
          />
        </span>
        <button
          type="button"
          className={`${styles.iconBtn} ${playing ? styles.iconBtnOn : ''}`}
          onClick={onTogglePlay}
          disabled={frames.length < 2}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? 'pause' : 'play'}
        </button>
      </div>

      <div className={styles.timelineStrip}>
        {frames.map((frame, index) => (
          <div
            key={frame.id}
            className={`${styles.frameCard} ${frame.id === highlightId ? styles.frameCardActive : ''} ${overIndex === index && dragIndex !== null ? styles.frameCardDragOver : ''}`}
            draggable
            onClick={() => onSelectFrame(frame.id)}
            onDragStart={(e) => {
              setDragIndex(index);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(index));
            }}
            onDragOver={(e) => { e.preventDefault(); if (overIndex !== index) setOverIndex(index); }}
            onDrop={(e) => {
              e.preventDefault();
              const fromStr = e.dataTransfer.getData('text/plain');
              const from = fromStr === '' ? dragIndex : Number(fromStr);
              if (from != null && !Number.isNaN(from) && from !== index) onReorderFrame(from, index);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
            title={frame.name}
          >
            <FrameThumb project={project} frame={frame} />
            <span className={styles.frameIndex}>{index + 1}</span>
          </div>
        ))}
        <button
          type="button"
          className={styles.frameAdd}
          onClick={onAddFrame}
          title="Add a blank frame"
        >
          +
        </button>
      </div>

      <div className={styles.timelineActions}>
        <button type="button" className={styles.iconBtn} onClick={onAddFrame}>+ frame</button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => onDuplicateFrame(activeFrameId)}
        >
          duplicate
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => onDeleteFrame(activeFrameId)}
          disabled={frames.length <= 1}
        >
          delete
        </button>
      </div>
    </div>
  );
}
