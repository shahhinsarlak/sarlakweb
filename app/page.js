'use client';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ConwaysGameOfLife from '../components/ConwaysGameOfLife';
import CursorShadow from '../components/CursorShadow';
import Link from 'next/link';

export default function Home() {
  const [showConwaysGame, setShowConwaysGame] = useState(false);

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
      {/* Conway's Game of Life Background - Only render when enabled */}
      {showConwaysGame && <ConwaysGameOfLife />}
      
      {/* Cursor Shadow Effect */}
      <CursorShadow />
      
      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          <Header />

          {/* Conway's Game of Life Toggle Button */}
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <button
              onClick={() => setShowConwaysGame(!showConwaysGame)}
              style={{
                background: showConwaysGame ? 'var(--accent-color)' : 'transparent',
                color: showConwaysGame ? 'var(--bg-color)' : 'var(--text-color)',
                border: '1px solid var(--border-color)',
                padding: '8px 12px',
                fontSize: '10px',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.7
              }}
              onMouseOver={(e) => {
                e.target.style.opacity = '1';
                e.target.style.borderColor = 'var(--accent-color)';
              }}
              onMouseOut={(e) => {
                e.target.style.opacity = '0.7';
                e.target.style.borderColor = 'var(--border-color)';
              }}
              title={showConwaysGame ? 'Hide Conway\'s Game of Life' : 'Show Conway\'s Game of Life'}
            >
              {showConwaysGame ? '◼ Game Off' : '▶ Game On'}
            </button>
          </div>

          <main className="main-content">
          <section className="section">
            <div className="status">
              <span className="status-dot"></span>
              Available for work
            </div>
            <p className="intro-text">
              Building digital experiences through code and design. 
              This space will showcase creative works, software projects, and experimental ideas.
            </p>
          </section>

          <section className="section">
            <h2 className="section-title">Current Focus</h2>
            <div className="grid">
              <Link href="/game" className="card">
                <div className="card-title">Software Development</div>
                <div className="card-description">Creating efficient, minimal solutions</div>
              </Link>
              <Link href="/apps" className="card">
                <div className="card-title">Creative Projects</div>
                <div className="card-description">Exploring digital art and design</div>
              </Link>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Projects</h2>
            <div className="grid">
              <div className="card">
                <div className="card-title">Coming Soon</div>
                <div className="card-description">Future projects will be showcased here</div>
              </div>
              <div className="card">
                <div className="card-title">In Development</div>
                <div className="card-description">Currently building something new</div>
              </div>
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