'use client';
import { useMemo, useState } from 'react';
import styles from '../page.module.css';
import { CloseIcon } from './Icons';
import { searchLibrary } from '../lib/search';
import { CATEGORY_MAP } from '../data/categories';

// Search across the seeded library. Empty query shows a browse state (all
// categories and creators); typing filters posts, creators, categories and
// hashtags. Tapping a tag refines the query; the other rows act via callbacks.

export default function SearchSheet({ onSelectPost, onSelectCreator, onSelectCategory, onClose }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchLibrary(query), [query]);
  const { browse, tags, creators, categories, posts } = results;
  const nothing = !browse
    && tags.length === 0 && creators.length === 0 && categories.length === 0 && posts.length === 0;

  return (
    <div className={styles.searchOverlay} role="dialog" aria-modal="true" aria-label="Search">
      <div className={styles.searchPanel}>
        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts, creators, categories, #tags"
            autoFocus
          />
          <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="Close search">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className={styles.searchResults}>
          {tags.length > 0 && (
            <section className={styles.searchSection}>
              <div className={styles.searchSectionLabel}>Tags</div>
              <div className={styles.tagRow}>
                {tags.map((tag) => (
                  <button key={tag} type="button" className={styles.tagChip} onClick={() => setQuery(tag)}>
                    #{tag}
                  </button>
                ))}
              </div>
            </section>
          )}

          {categories.length > 0 && (
            <section className={styles.searchSection}>
              <div className={styles.searchSectionLabel}>Categories</div>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={styles.searchRow}
                  style={{ '--accent': category.accent }}
                  onClick={() => onSelectCategory(category.id)}
                >
                  <span className={styles.searchGlyph} aria-hidden="true">{category.glyph}</span>
                  <span className={styles.searchRowMain}>
                    <span className={styles.searchRowTitle}>{category.label}</span>
                    <span className={styles.searchRowSub}>{category.blurb}</span>
                  </span>
                </button>
              ))}
            </section>
          )}

          {creators.length > 0 && (
            <section className={styles.searchSection}>
              <div className={styles.searchSectionLabel}>Creators</div>
              {creators.map((creator) => (
                <button
                  key={creator.id}
                  type="button"
                  className={styles.searchRow}
                  onClick={() => onSelectCreator(creator.id)}
                >
                  <span className={styles.searchAvatar} aria-hidden="true">{creator.name.charAt(0)}</span>
                  <span className={styles.searchRowMain}>
                    <span className={styles.searchRowTitle}>{creator.name}</span>
                    <span className={styles.searchRowSub}>{creator.handle}</span>
                  </span>
                </button>
              ))}
            </section>
          )}

          {posts.length > 0 && (
            <section className={styles.searchSection}>
              <div className={styles.searchSectionLabel}>Posts</div>
              {posts.map((post) => {
                const category = CATEGORY_MAP[post.category] || {};
                return (
                  <button
                    key={post.id}
                    type="button"
                    className={styles.searchRow}
                    style={{ '--accent': category.accent }}
                    onClick={() => onSelectPost(post.id)}
                  >
                    <span className={styles.searchGlyph} aria-hidden="true">{category.glyph}</span>
                    <span className={styles.searchRowMain}>
                      <span className={styles.searchRowTitle}>{post.title}</span>
                      <span className={styles.searchRowSub}>{post.caption}</span>
                    </span>
                  </button>
                );
              })}
            </section>
          )}

          {nothing && <p className={styles.searchEmpty}>No results for that search.</p>}
        </div>
      </div>
    </div>
  );
}
