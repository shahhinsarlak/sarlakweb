'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function LogList({ posts }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTag = searchParams.get('tag');

  const filtered = activeTag
    ? posts.filter(p => p.tags.includes(activeTag))
    : posts;

  function handleTagClick(e, tag) {
    e.preventDefault();
    if (tag === activeTag) {
      router.push('/log');
    } else {
      router.push(`/log?tag=${encodeURIComponent(tag)}`);
    }
  }

  return (
    <div className="log-list">
      {filtered.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>No posts.</p>
      )}
      {filtered.map(post => (
        <Link key={post.slug} href={`/log/${post.slug}`} className="log-entry">
          <div className="log-entry-meta">
            <span className="log-date">
              {formatDate(post.date)}
              {post.readingTime ? ` \u00b7 ${post.readingTime} min read` : ''}
            </span>
            <div className="log-tags">
              {post.tags.map(tag => (
                <button
                  key={tag}
                  className={`log-tag${tag === activeTag ? ' log-tag--active' : ''}`}
                  onClick={(e) => handleTagClick(e, tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="log-title">{post.title}</div>
          {post.excerpt && <div className="log-excerpt">{post.excerpt}</div>}
        </Link>
      ))}
    </div>
  );
}
