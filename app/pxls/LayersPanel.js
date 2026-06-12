'use client';

/**
 * PXLS Layers Panel
 *
 * Lists layers top to bottom, lets the user add, delete, reorder, rename,
 * toggle visibility, set the active layer, and adjust the active layer opacity.
 *
 * @param {Object} props
 * @param {Object[]} props.layers
 * @param {string} props.activeLayerId
 * @param {Object} props.handlers - layer action callbacks
 */

import { useState } from 'react';
import styles from './page.module.css';

export default function LayersPanel({ layers, activeLayerId, handlers }) {
  const {
    onSelect, onToggleVisible, onRename, onAdd, onDelete, onMoveUp, onMoveDown, onOpacity, onReorder,
  } = handlers;

  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  // Display top layer first (last in array renders on top).
  const ordered = [...layers].map((l, i) => ({ layer: l, index: i })).reverse();
  const active = layers.find((l) => l.id === activeLayerId);

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>Layers</div>

      <div className={styles.layerList}>
        {ordered.map(({ layer, index }) => (
          <div
            key={layer.id}
            className={`${styles.layerRow} ${layer.id === activeLayerId ? styles.layerRowActive : ''} ${overIndex === index && dragIndex !== null ? styles.layerRowDragOver : ''}`}
            onClick={() => onSelect(layer.id)}
            onDragOver={(e) => { e.preventDefault(); if (overIndex !== index) setOverIndex(index); }}
            onDrop={(e) => {
              e.preventDefault();
              const fromStr = e.dataTransfer.getData('text/plain');
              const from = fromStr === '' ? dragIndex : Number(fromStr);
              if (from != null && !Number.isNaN(from) && from !== index) onReorder(from, index);
              setDragIndex(null);
              setOverIndex(null);
            }}
          >
            <span
              className={styles.dragHandle}
              draggable
              title="Drag to reorder"
              onClick={(e) => e.stopPropagation()}
              onDragStart={(e) => {
                setDragIndex(index);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(index));
              }}
              onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
            >
              ⠿
            </span>
            <button
              type="button"
              className={styles.layerVis}
              onClick={(e) => { e.stopPropagation(); onToggleVisible(layer.id); }}
              title={layer.visible ? 'Hide layer' : 'Show layer'}
            >
              {layer.visible ? '[o]' : '[ ]'}
            </button>
            <input
              className={styles.layerNameInput}
              value={layer.name}
              onChange={(e) => onRename(layer.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Layer name"
            />
            <button
              type="button"
              className={styles.layerVis}
              onClick={(e) => { e.stopPropagation(); onMoveUp(index); }}
              disabled={index === layers.length - 1}
              title="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              className={styles.layerVis}
              onClick={(e) => { e.stopPropagation(); onMoveDown(index); }}
              disabled={index === 0}
              title="Move down"
            >
              ↓
            </button>
          </div>
        ))}
      </div>

      <div className={styles.layerActions}>
        <button type="button" className={styles.iconBtn} onClick={onAdd}>+ layer</button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => onDelete(activeLayerId)}
          disabled={layers.length <= 1}
        >
          delete
        </button>
      </div>

      {active && (
        <div className={styles.opacityRow}>
          <span>Opacity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(active.opacity * 100)}
            onChange={(e) => onOpacity(active.id, Number(e.target.value) / 100)}
          />
          <span style={{ width: 34, textAlign: 'right' }}>
            {Math.round(active.opacity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
