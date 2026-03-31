'use client';
import { useState } from 'react';
import styles from './zayaani.module.css';
import { HEADS, TOPS, PANTS, SHOES } from './asciiAssets';

const PARTS = [
  { key: 'headId',  label: 'Head',  assets: HEADS  },
  { key: 'topId',   label: 'Top',   assets: TOPS   },
  { key: 'pantsId', label: 'Pants', assets: PANTS  },
  { key: 'shoesId', label: 'Shoes', assets: SHOES  },
];

const ALL_ASSETS = [...HEADS, ...TOPS, ...PANTS, ...SHOES];

export default function CharacterCreator({ character, onSelect, onConfirm }) {
  const [focusedId, setFocusedId] = useState(character.headId);
  const focused = ALL_ASSETS.find(a => a.id === focusedId) ?? HEADS[0];

  const handleSelect = (part, id) => {
    onSelect(part, id);
    setFocusedId(id);
  };

  const head  = HEADS.find(h => h.id === character.headId);
  const top   = TOPS.find(t => t.id === character.topId);
  const pants = PANTS.find(p => p.id === character.pantsId);
  const shoes = SHOES.find(s => s.id === character.shoesId);

  const fullPreview = [head, top, pants, shoes]
    .filter(Boolean)
    .map(a => a.compact)
    .join('\n');

  return (
    <div className={styles.creatorRoot}>
      <div className={styles.creatorTitle}>{'//'} Character Creation</div>

      <div className={styles.creatorBody}>
        <div className={styles.creatorLeft}>
          {PARTS.map(({ key, label, assets }) => (
            <div key={key}>
              <div className={styles.partLabel}>{label}</div>
              <div className={styles.partOptions}>
                {assets.map(asset => (
                  <button
                    key={asset.id}
                    className={`${styles.partOption} ${character[key] === asset.id ? styles.partOptionSelected : ''}`}
                    onClick={() => handleSelect(key, asset.id)}
                  >
                    <div className={styles.partOptionName}>{asset.name}</div>
                    <div className={styles.partOptionTraits}>{asset.traits.join(' · ')}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.creatorRight}>
          <pre className={`${styles.ascii} ${styles.asciiAccent}`}>
            {focused.detailed}
          </pre>
          <div className={styles.detailName}>{focused.name}</div>
          <div className={styles.detailTraits}>{focused.traits.join(' · ')}</div>
        </div>
      </div>

      <div className={styles.creatorFooter}>
        <pre className={`${styles.ascii} ${styles.asciiAccent}`} style={{ fontSize: '11px' }}>
          {fullPreview}
        </pre>
        <button className={styles.confirmBtn} onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
}
