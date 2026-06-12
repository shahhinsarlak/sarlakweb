'use client';

/**
 * PXLS Shade Panel
 *
 * Controls for the Shade tool. The light source is positioned by dragging the
 * marker on the canvas; here the user sets the strength and applies the
 * distance based shading to the active layer (baked into the pixel colours).
 *
 * @param {Object} props
 * @param {number} props.strength - 0..1
 * @param {Function} props.onStrength - (0..1) => void
 * @param {Object} props.light - { fx, fy } normalised 0..1
 * @param {Function} props.onApply
 * @param {Function} props.onResetLight
 */

import styles from './page.module.css';

export default function ShadePanel({ strength, onStrength, light, onApply, onResetLight }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>Shade</div>

      <p className={styles.effectDesc}>
        Drag the light on the canvas. Pixels nearest the light are lightened,
        the farthest are darkened. Apply bakes it into the active layer.
      </p>

      <div className={styles.rangeRow}>
        <span style={{ fontSize: '0.7rem', opacity: 0.7, width: 56 }}>Strength</span>
        <input
          type="range"
          min={5}
          max={100}
          value={Math.round(strength * 100)}
          onChange={(e) => onStrength(Number(e.target.value) / 100)}
        />
        <span style={{ fontSize: '0.7rem', width: 38, textAlign: 'right' }}>
          {Math.round(strength * 100)}%
        </span>
      </div>

      <div className={styles.subLabel}>
        Light: {Math.round(light.fx * 100)}%, {Math.round(light.fy * 100)}%
      </div>

      <div className={styles.layerActions}>
        <button
          type="button"
          className={`${styles.barBtn} ${styles.barBtnPrimary}`}
          onClick={onApply}
        >
          Apply to layer
        </button>
        <button type="button" className={styles.iconBtn} onClick={onResetLight}>
          Reset light
        </button>
      </div>
    </div>
  );
}
