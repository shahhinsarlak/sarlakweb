import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import { getAllPosts } from '../lib/posts';
import styles from './editorial.module.css';

export const metadata = {
  description:
    'Shahhin Sarlak. Computing Science (Honours) student at UTS and data centre technician at Microsoft.',
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

const WORK = [
  {
    n: '01',
    title: 'Office Horror',
    kind: 'Incremental game with loot drops, a skill tree and sanity mechanics',
    tags: ['Next.js', 'React'],
    href: '/game',
  },
  {
    n: '02',
    title: 'PXLS',
    kind: 'A JSON backed pixel art editor with layers, per cell effects and PNG, SVG and JSON export',
    tags: ['Next.js', 'Canvas'],
    href: '/pxls',
  },
  // Particles 3D temporarily archived from Selected Work (route still live).
  {
    n: '03',
    title: 'Web Apps',
    kind: 'The full directory of tools and experiments',
    tags: ['Directory'],
    href: '/apps',
  },
];

export default function Home() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.inner}>
        <main className={styles.main}>
          {/* Hero */}
          <section className={styles.hero}>
            <div>
              <h1 className={styles.name}>Shahhin Sarlak</h1>
              <p className={styles.intro}>
                Computing Science (Honours) student at the University of Technology Sydney.
                Data centre technician at Microsoft. The projects and the writing live here.
              </p>
            </div>
            <aside className={styles.currently}>
              <div className={styles.kicker}>Currently</div>
              <dl className={styles.cList}>
                <div className={styles.cRow}>
                  <dt>Study</dt>
                  <dd>Computing Science (Honours), UTS</dd>
                </div>
                <div className={styles.cRow}>
                  <dt>Work</dt>
                  <dd>Data Centre Technician, Microsoft</dd>
                </div>
                <div className={styles.cRow}>
                  <dt>Based</dt>
                  <dd>Sydney, Australia</dd>
                </div>
              </dl>
            </aside>
          </section>

          {/* About — why this site exists */}
          <section>
            <div className={styles.sectionHead}>
              <span className={styles.label}>About</span>
              <span className={styles.rule} />
            </div>
            <p className={styles.lede}>
              It started in 2025 as a personal portfolio. I had a bit of HTML behind me and
              I wanted to make web apps, but only a couple of weeks in I found Claude, and
              this was back when you still pasted chunks of code into the chat for review and
              Claude Code could not reach a directory yet. That shifted what I wanted from it,
              so I stopped trying to showcase my coding and started learning as much as I
              could about building with AI instead, and what is here now is less a portfolio
              of what I can write by hand and more a record of how I use AI to make different
              things.
            </p>
          </section>

          {/* Selected work */}
          <section>
            <div className={styles.sectionHead}>
              <span className={styles.label}>Selected Work</span>
              <span className={styles.rule} />
            </div>
            <div className={styles.index}>
              {WORK.map((item) => (
                <Link key={item.href} href={item.href} className={styles.row}>
                  <span className={styles.num}>{item.n}</span>
                  <span className={styles.rowTitle}>{item.title}</span>
                  <span className={styles.rowKind}>{item.kind}</span>
                  <span className={styles.rowTags}>
                    {item.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Writing */}
          <section>
            <div className={styles.sectionHead}>
              <span className={styles.label}>Writing</span>
              <span className={styles.rule} />
              <Link href="/log" className={styles.seeAll}>All posts</Link>
            </div>
            <div className={styles.index}>
              {posts.map((post) => (
                <Link key={post.slug} href={`/log/${post.slug}`} className={styles.postRow}>
                  <span className={styles.postTitle}>{post.title}</span>
                  <span className={styles.postExcerpt}>{post.excerpt}</span>
                  <span className={styles.postDate}>{formatDate(post.date)}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Connect */}
          <section>
            <div className={styles.sectionHead}>
              <span className={styles.label}>Connect</span>
              <span className={styles.rule} />
            </div>
            <div className={styles.links}>
              <a href="mailto:shahhinsarlak@gmail.com" className={styles.link}>Email</a>
              <a href="https://github.com/shahhinsarlak" target="_blank" rel="noopener noreferrer" className={styles.link}>GitHub</a>
              <a href="https://www.linkedin.com/in/shahhin-sarlak" target="_blank" rel="noopener noreferrer" className={styles.link}>LinkedIn</a>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
