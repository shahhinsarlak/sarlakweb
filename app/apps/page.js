import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import styles from '../editorial.module.css';

export const metadata = {
  title: 'Apps — SARLAK',
  description: 'Interactive web apps and experiments by Shahhin Sarlak.',
};

const APPS = [
  {
    title: 'Office Horror',
    kind: 'Incremental game with loot drops, a skill tree and sanity mechanics',
    tags: ['Next.js', 'React'],
    href: '/game',
  },
  // Temporarily archived (routes still live, hidden from the listing):
  // {
  //   title: 'Particles 3D',
  //   kind: 'Interactive WebGL particle field that connects nearby points',
  //   tags: ['Three.js', 'WebGL'],
  //   href: '/apps/particles',
  // },
  // {
  //   title: 'Spin Wheel',
  //   kind: 'A word and caption generator that refreshes every Sydney midnight, powered by Claude',
  //   tags: ['Next.js', 'Claude API'],
  //   href: '/wheel',
  // },
  {
    title: 'PXLS',
    kind: 'A JSON backed pixel art editor with layers, per cell effects and PNG, SVG and JSON export',
    tags: ['Next.js', 'Canvas'],
    href: '/pxls',
  },
];

export default function Apps() {
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.inner}>
        <main className={styles.main}>
          <section className={styles.pageHead}>
            <div className={styles.kicker}>Apps</div>
            <h1 className={styles.pageTitle}>Things that run in the browser</h1>
            <p className={styles.lede}>
              Interactive pieces I have made. Open any of them and it works straight away,
              nothing to install.
            </p>
          </section>

          <section>
            <div className={styles.sectionHead}>
              <span className={styles.label}>All Apps</span>
              <span className={styles.rule} />
            </div>
            <div className={styles.index}>
              {APPS.map((app) => (
                <Link key={app.href} href={app.href} className={styles.row}>
                  <span className={styles.num}>
                    <span className={styles.statusDot} title="Live" />
                  </span>
                  <span className={styles.rowTitle}>{app.title}</span>
                  <span className={styles.rowKind}>{app.kind}</span>
                  <span className={styles.rowTags}>
                    {app.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                    <span className={styles.go}>↗</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
