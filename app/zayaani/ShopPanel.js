'use client';
import styles from './zayaani.module.css';
import { FURNITURE } from './asciiAssets';

export default function ShopPanel({ credits, creditsPerSecond, activeJobs, ownedFurniture, onPurchase, onReset }) {
  return (
    <div className={styles.sidebar}>
      {/* Credits display */}
      <div className={styles.sideSection}>
        <div className={styles.sideLabel}>Credits</div>
        <div style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '4px' }}>
          {Math.floor(credits)}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {creditsPerSecond} cr/s
        </div>
      </div>

      {/* Active jobs */}
      {activeJobs.length > 0 && (
        <div className={styles.sideSection}>
          <div className={styles.sideLabel}>Income</div>
          {activeJobs.map(job => (
            <div key={job.id} className={styles.jobEntry}>
              <span>{job.name}</span>
              <span>+{job.cps}/s</span>
            </div>
          ))}
        </div>
      )}

      {/* Furniture shop */}
      <div className={styles.sideSection}>
        <div className={styles.sideLabel}>Shop</div>
        {FURNITURE.map(item => {
          const owned = ownedFurniture.includes(item.id);
          const canAfford = credits >= item.cost;
          return (
            <button
              key={item.id}
              className={styles.shopItem}
              onClick={() => onPurchase(item)}
              disabled={owned || !canAfford}
            >
              <span>{item.name}</span>
              <span className={styles.shopItemCost}>
                {owned ? 'owned' : `${item.cost}cr`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reset */}
      <div style={{ padding: '14px', marginTop: 'auto' }}>
        <button
          onClick={onReset}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '10px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          reset game
        </button>
      </div>
    </div>
  );
}
