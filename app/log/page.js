import { Suspense } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAllPosts } from '../../lib/posts';
import LogList from './LogList';
import styles from '../editorial.module.css';

export const metadata = {
  title: 'Dev Log — SARLAK',
  description: 'Notes on what I make and what I learn doing it.',
};

export default function LogPage() {
  const posts = getAllPosts();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Header />
        <main className={styles.main}>
          <section className={styles.pageHead}>
            <div className={styles.kicker}>Dev Log</div>
            <h1 className={styles.pageTitle}>Working notes</h1>
            <p className={styles.lede}>
              Short entries on what I make and what I learn doing it. No schedule. They go up
              when something is worth writing down.
            </p>
          </section>
          <section>
            <Suspense fallback={<div className={styles.index} />}>
              <LogList posts={posts} />
            </Suspense>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
