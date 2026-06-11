'use client';

/**
 * PXLS Effects Panel
 *
 * Configures the brush effect applied to painted cells. Choosing an effect and
 * intensity here changes what the pencil writes and what the Effects tool
 * stamps onto existing cells.
 *
 * @param {Object} props
 * @param {Object|null} props.effect - { type, intensity } or null
 * @param {Function} props.onEffect - (effect|null) => void
 */

import { EFFECTS, EFFECT_ORDER } from './constants';
import styles from './page.module.css';

export default function EffectsPanel({ effect, onEffect }) {
  const activeType = effect ? effect.type : null;
  const intensity = effect ? effect.intensity : 0.5;

  const selectType = (type) => {
    if (activeType === type) {
      onEffect(null);
    } else {
      onEffect({ type, intensity });
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>Effect</div>

      <div className={styles.effectBtnRow}>
        {EFFECT_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className={`${styles.effectBtn} ${activeType === id ? styles.effectBtnActive : ''}`}
            onClick={() => selectType(id)}
          >
            {EFFECTS[id].name}
          </button>
        ))}
      </div>

      <p className={styles.effectDesc}>
        {activeType ? EFFECTS[activeType].desc : 'No effect. Painted cells are solid colour.'}
      </p>

      {activeType && (
        <div className={styles.rangeRow}>
          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Intensity</span>
          <input
            type="range"
            min={5}
            max={100}
            value={Math.round(intensity * 100)}
            onChange={(e) => onEffect({ type: activeType, intensity: Number(e.target.value) / 100 })}
          />
          <span style={{ fontSize: '0.7rem', width: 34, textAlign: 'right' }}>
            {Math.round(intensity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
