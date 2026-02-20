'use client';
import { useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import '../apps.css';

export default function Apps() {
  useEffect(() => {
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
      <div className="container">
        <Header />
        <main className="main-content">
        <section className="section">
          <h1 className="page-title">Web Applications</h1>
          <p className="intro-text">
            A collection of experimental web applications and demos. 
            Click on any app to explore its functionality.
          </p>
        </section>

        <section className="section">
          <div className="apps-grid">

            {/* Particles App */}
            <div className="app-card">
              <div className="app-header">
                <div className="app-status live">
                  <span className="status-indicator"></span>
                  Live Demo
                </div>
              </div>
              <div className="app-info">
                <h3 className="app-title">Particles 3D</h3>
                <p className="app-description">
                  Interactive 3D particle system with dynamic connections.
                  Particles move through space and form links when nearby.
                </p>
                <div className="app-tech">
                  <span className="tech-tag">React</span>
                  <span className="tech-tag">Three.js</span>
                  <span className="tech-tag">WebGL</span>
                </div>
              </div>
              <div className="app-actions">
                <Link href="/apps/particles" className="app-button primary">
                  Launch Demo
                </Link>
              </div>
            </div>

          </div>
        </section>

        <section className="section">
          <h2 className="section-title">About These Applications</h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-title">Experimental</div>
              <div className="info-description">
                These applications serve as testing grounds for new technologies, 
                frameworks, and development approaches.
              </div>
            </div>
            <div className="info-card">
              <div className="info-title">Open Source</div>
              <div className="info-description">
                Most applications include source code access for learning 
                and collaboration purposes.
              </div>
            </div>
            <div className="info-card">
              <div className="info-title">Live Demos</div>
              <div className="info-description">
                Fully functional demonstrations that you can interact with 
                and explore in real-time.
              </div>
            </div>
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </>
  );
}