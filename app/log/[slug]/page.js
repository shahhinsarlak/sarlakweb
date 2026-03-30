import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { getPostBySlug, getAllSlugs } from '../../../lib/posts';
import '../log.css';

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  try {
    const post = await getPostBySlug(params.slug);
    return { title: `${post.title} — SARLAK` };
  } catch {
    return { title: 'Post Not Found — SARLAK' };
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function PostPage({ params }) {
  let post;
  try {
    post = await getPostBySlug(params.slug);
  } catch {
    notFound();
  }

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <section className="section">
          <Link href="/log" className="back-link">
            &larr; Dev Log
          </Link>
          <div className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <span className="log-date">{formatDate(post.date)}</span>
              <div className="log-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="log-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
