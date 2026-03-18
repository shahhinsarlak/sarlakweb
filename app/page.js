'use client';
import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    // Add entrance animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    });

    document.querySelectorAll('.section').forEach((section, index) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          <Header />

          <main className="main-content">
          <section className="section">
            <h1 className="hero-name">SHAHHIN SARLAK</h1>
            <div className="status">
              <span className="status-dot"></span>
              Available for work
            </div>
            <p className="intro-text">
              Student developer building real working software &mdash; games, tools, and experiments.
              Curious about what&apos;s possible, shipping things to find out.
            </p>
          </section>

          <section className="section">
            <h2 className="section-title">Projects</h2>
            <div className="grid">
              <Link href="/game" className="card">
                <div className="card-title">Office Horror</div>
                <div className="card-description">
                  Browser-based incremental game with loot drops, a skill tree, sanity mechanics, and dimensional exploration.
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid var(--accent-color)' }}>Next.js</span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid var(--accent-color)' }}>React</span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid var(--accent-color)' }}>JavaScript</span>
                </div>
              </Link>
              <Link href="/td" className="card">
                <div className="card-title">Tower Defense</div>
                <div className="card-description">
                  A tower defense game built in the browser — place towers, survive waves, experiment with strategy.
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid var(--accent-color)' }}>JavaScript</span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid var(--accent-color)' }}>Canvas</span>
                </div>
              </Link>
              <Link href="/apps/particles" className="card">
                <div className="card-title">Particles 3D</div>
                <div className="card-description">
                  Interactive 3D particle system — particles move through space and form connections when nearby.
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid var(--accent-color)' }}>React</span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid var(--accent-color)' }}>Three.js</span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid var(--accent-color)' }}>WebGL</span>
                </div>
              </Link>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Connect</h2>
            <div className="links">
              <Link href="/apps" className="link">Web Apps</Link>
              <a href="mailto:shahhinsarlak@gmail.com" className="link">Email</a>
              <a href="https://github.com/shahhinsarlak" target="_blank" rel="noopener noreferrer" className="link">GitHub</a>
              <a href="https://www.linkedin.com/in/shahhin-sarlak" target="_blank" rel="noopener noreferrer" className="link">LinkedIn</a>
            </div>
          </section>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
