import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAllPosts } from '../../lib/posts';
import './log.css';

export const metadata = {
  title: 'Dev Log — SARLAK',
  description: 'Development notes, project updates, and experiments.',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function LogPage() {
  const posts = getAllPosts();

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <section className="section">
          <h2 className="section-title">Dev Log</h2>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '40px' }}>
            Notes on what I&apos;m building, breaking and figuring out.
          </p>
          <div className="log-list">
            {posts.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>No posts yet.</p>
            )}
            {posts.map(post => (
              <Link key={post.slug} href={`/log/${post.slug}`} className="log-entry">
                <div className="log-entry-meta">
                  <span className="log-date">{formatDate(post.date)}</span>
                  <div className="log-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="log-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="log-title">{post.title}</div>
                {post.excerpt && <div className="log-excerpt">{post.excerpt}</div>}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
