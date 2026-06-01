'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../editorial.module.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function LogList({ posts }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTag = searchParams.get('tag');

  const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();
  const filtered = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts;

  const setTag = (tag) => router.push(tag ? `/log?tag=${encodeURIComponent(tag)}` : '/log');

  return (
    <>
      <div className={styles.tagBar}>
        <button
          className={`${styles.tagBtn} ${!activeTag ? styles.tagBtnActive : ''}`}
          onClick={() => setTag(null)}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`${styles.tagBtn} ${tag === activeTag ? styles.tagBtnActive : ''}`}
            onClick={() => setTag(tag === activeTag ? null : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className={styles.index}>
        {filtered.length === 0 && <p className={styles.empty}>No posts.</p>}
        {filtered.map((post) => (
          <Link key={post.slug} href={`/log/${post.slug}`} className={styles.postRow}>
            <span className={styles.postTitle}>{post.title}</span>
            <span className={styles.postExcerpt}>{post.excerpt}</span>
            <span className={styles.postDate}>
              {formatDate(post.date)}
              {post.readingTime ? ` · ${post.readingTime} min` : ''}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
