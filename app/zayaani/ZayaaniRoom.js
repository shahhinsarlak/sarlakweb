'use client';
import { useState, useEffect } from 'react';
import styles from './zayaani.module.css';
import { HEADS, TOPS, PANTS, SHOES, FURNITURE } from './asciiAssets';

const BASE_ROOM = `  \\================================================//
   \\                                              //
    \\                                            //
     \\____________________________________________//
     |                                            |
     |                                            |
     |                                            |
     |                                            |
     |                                            |
     |____________________________________________|`;

// Named slot positions — CSS absolute offsets within the room pre container
const SLOT_POSITIONS = {
  'back-left':        { top: '24px',   left: '32px'                                    },
  'back-right':       { top: '24px',   right: '32px'                                   },
  'back-right corner':{ top: '24px',   right: '32px'                                   },
  'back wall':        { top: '16px',   left: '50%', transform: 'translateX(-50%)'      },
  'front-right':      { bottom: '48px', right: '40px'                                  },
  'floor centre':     { bottom: '40px', left: '50%', transform: 'translateX(-50%)'     },
};

export default function ZayaaniRoom({ character, ownedFurniture, credits, creditsPerSecond }) {
  const [sway, setSway] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setSway(s => !s), 1200);
    return () => clearInterval(interval);
  }, []);

  const head  = HEADS.find(h => h.id === character.headId)?.compact  ?? '';
  const top   = TOPS.find(t => t.id === character.topId)?.compact    ?? '';
  const pants = PANTS.find(p => p.id === character.pantsId)?.compact ?? '';
  const shoes = SHOES.find(s => s.id === character.shoesId)?.compact ?? '';

  const characterArt = [head, top, pants, shoes].join('\n');

  return (
    <div className={styles.roomArea}>
      <div className={styles.creditsOverlay}>
        {Math.floor(credits)} cr &nbsp;&middot;&nbsp; {creditsPerSecond} cr/s
      </div>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Room walls */}
        <pre className={styles.ascii} style={{ opacity: 0.45 }}>{BASE_ROOM}</pre>

        {/* Furniture overlays */}
        {ownedFurniture.map(id => {
          const item = FURNITURE.find(f => f.id === id);
          if (!item) return null;
          const pos = SLOT_POSITIONS[item.slot] ?? { top: '20px', left: '20px' };
          return (
            <pre
              key={id}
              className={styles.ascii}
              style={{ position: 'absolute', fontSize: '11px', margin: 0, ...pos }}
            >{item.ascii}</pre>
          );
        })}

        {/* Character with idle sway */}
        <pre
          className={`${styles.ascii} ${styles.asciiAccent}`}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: `translateX(-50%) translateY(${sway ? '-3px' : '0px'})`,
            transition: 'transform 0.6s ease-in-out',
            margin: 0,
          }}
        >{characterArt}</pre>
      </div>
    </div>
  );
}
