import { Suspense } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAllPosts } from '../../lib/posts';
import LogList from './LogList';
import './log.css';

export const metadata = {
  title: 'Dev Log \u2014 SARLAK',
  description: 'Development notes, project updates, and experiments.',
};

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
          <Suspense fallback={<div className="log-list" />}>
            <LogList posts={posts} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}
