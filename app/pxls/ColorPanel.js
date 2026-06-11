'use client';

/**
 * PXLS Colour Panel
 *
 * Native colour picker, hex input, alpha slider, a fixed default palette, and
 * custom saved swatches built from the current colour.
 *
 * @param {Object} props
 * @param {string} props.color
 * @param {Function} props.onColor
 * @param {number} props.alpha
 * @param {Function} props.onAlpha
 * @param {string[]} props.swatches - project custom swatches
 * @param {Function} props.onAddSwatch
 */

import { useState } from 'react';
import { DEFAULT_PALETTE } from './constants';
import styles from './page.module.css';

const isValidHex = (v) => /^#?[0-9a-fA-F]{6}$/.test(v);

export default function ColorPanel({ color, onColor, alpha, onAlpha, swatches, onAddSwatch }) {
  const [hexDraft, setHexDraft] = useState(color);

  const commitHex = (value) => {
    if (isValidHex(value)) {
      onColor(value.startsWith('#') ? value.toLowerCase() : `#${value.toLowerCase()}`);
    } else {
      setHexDraft(color);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>Colour</div>

      <div className={styles.colorRow}>
        <span className={styles.colorPreview} style={{ backgroundColor: color }} />
        <input
          type="color"
          className={styles.nativePicker}
          value={color}
          onChange={(e) => { onColor(e.target.value); setHexDraft(e.target.value); }}
          aria-label="Colour picker"
        />
        <input
          type="text"
          className={styles.hexInput}
          value={hexDraft}
          onChange={(e) => setHexDraft(e.target.value)}
          onBlur={(e) => commitHex(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commitHex(e.target.value); }}
          maxLength={7}
          aria-label="Hex colour"
        />
      </div>

      <div className={styles.rangeRow}>
        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Alpha</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(alpha * 100)}
          onChange={(e) => onAlpha(Number(e.target.value) / 100)}
        />
        <span style={{ fontSize: '0.7rem', width: 34, textAlign: 'right' }}>
          {Math.round(alpha * 100)}%
        </span>
      </div>

      <div className={styles.subLabel}>Palette</div>
      <div className={styles.swatchGrid}>
        {DEFAULT_PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.swatch} ${color === c ? styles.swatchActive : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => { onColor(c); setHexDraft(c); }}
            title={c}
            aria-label={`Palette colour ${c}`}
          />
        ))}
      </div>

      <div className={styles.subLabel}>
        Swatches
        <button
          type="button"
          className={styles.iconBtn}
          style={{ float: 'right', marginTop: '-3px' }}
          onClick={() => onAddSwatch(color)}
          title="Save current colour"
        >
          + add
        </button>
      </div>
      <div className={styles.swatchGrid}>
        {swatches.length === 0 && (
          <span style={{ gridColumn: '1 / -1', fontSize: '0.65rem', opacity: 0.5 }}>
            No saved swatches yet.
          </span>
        )}
        {swatches.map((c, i) => (
          <button
            key={`${c}-${i}`}
            type="button"
            className={`${styles.swatch} ${color === c ? styles.swatchActive : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => { onColor(c); setHexDraft(c); }}
            title={c}
            aria-label={`Saved colour ${c}`}
          />
        ))}
      </div>
    </div>
  );
}
