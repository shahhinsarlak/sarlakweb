'use client';
import styles from '../page.module.css';

// Horizontal, scrollable category switcher pinned under the wordmark. "For You"
// is the mixed feed; the rest filter to a single category.

export default function CategoryBar({ categories, active, onSelect }) {
  return (
    <div className={styles.categoryBar} role="tablist" aria-label="Categories">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'all'}
        className={`${styles.categoryChip} ${active === 'all' ? styles.categoryChipActive : ''}`}
        onClick={() => onSelect('all')}
      >
        For You
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          role="tab"
          aria-selected={active === category.id}
          className={`${styles.categoryChip} ${active === category.id ? styles.categoryChipActive : ''}`}
          style={{ '--accent': category.accent }}
          onClick={() => onSelect(category.id)}
        >
          <span className={styles.categoryChipGlyph} aria-hidden="true">
            {category.glyph}
          </span>
          {category.label}
        </button>
      ))}
    </div>
  );
}
