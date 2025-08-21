'use client';
import { useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../products.css';

export default function Products() {
  useEffect(() => {
    const buttons = document.querySelectorAll('.buy-button');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const product = e.target.getAttribute('data-product');
        handlePurchase(product);
      });
    });

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

    return () => {
      observer.disconnect();
      buttons.forEach(button => {
        button.removeEventListener('click', handlePurchase);
      });
    };
  }, []);

  const handlePurchase = (productId) => {
    alert(`Purchase ${productId} - Payment integration coming soon!`);
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <section className="section">
          <h1 className="page-title">Photoshop Effects</h1>
          <p className="intro-text">
            Professional-grade effects and presets for creative professionals. 
            Instant download after purchase.
          </p>
        </section>

        <section className="section">
          <div className="products-grid">
            <div className="product-card">
              <div className="product-image">
                <div className="placeholder-image">Preview</div>
              </div>
              <div className="product-info">
                <h3 className="product-title">Vintage Film Pack</h3>
                <p className="product-description">20 authentic film grain effects with color grading presets</p>
                <div className="product-meta">
                  <span className="product-price">$29</span>
                  <button className="buy-button" data-product="vintage-film">Purchase</button>
                </div>
              </div>
            </div>

            <div className="product-card">
              <div className="product-image">
                <div className="placeholder-image">Preview</div>
              </div>
              <div className="product-info">
                <h3 className="product-title">Neon Glow Effects</h3>
                <p className="product-description">15 vibrant neon and cyberpunk-style lighting effects</p>
                <div className="product-meta">
                  <span className="product-price">$24</span>
                  <button className="buy-button" data-product="neon-glow">Purchase</button>
                </div>
              </div>
            </div>

            <div className="product-card">
              <div className="product-image">
                <div className="placeholder-image">Preview</div>
              </div>
              <div className="product-info">
                <h3 className="product-title">Double Exposure Kit</h3>
                <p className="product-description">12 professional double exposure templates and masks</p>
                <div className="product-meta">
                  <span className="product-price">$19</span>
                  <button className="buy-button" data-product="double-exposure">Purchase</button>
                </div>
              </div>
            </div>

            <div className="product-card">
              <div className="product-image">
                <div className="placeholder-image">Preview</div>
              </div>
              <div className="product-info">
                <h3 className="product-title">Glitch Bundle</h3>
                <p className="product-description">25 digital distortion and glitch effects for modern designs</p>
                <div className="product-meta">
                  <span className="product-price">$34</span>
                  <button className="buy-button" data-product="glitch-bundle">Purchase</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Download Info</h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-title">Instant Access</div>
              <div className="info-description">Download links sent immediately after payment</div>
            </div>
            <div className="info-card">
              <div className="info-title">Commercial License</div>
              <div className="info-description">Use in client work and commercial projects</div>
            </div>
            <div className="info-card">
              <div className="info-title">Photoshop CC+</div>
              <div className="info-description">Compatible with Photoshop CC 2020 and newer</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
