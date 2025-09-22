'use client';
import { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function OdooDemo() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading time for the embedded app
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />
      <main className="main-content" style={{ padding: 0 }}>
        <div style={{ 
          padding: '40px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-color)'
        }}>
          <h1 style={{ 
            fontSize: '24px',
            color: 'var(--accent-color)',
            marginBottom: '12px',
            fontWeight: '400'
          }}>
            Odoo ERP Demo
          </h1>
          <p style={{ 
            fontSize: '14px',
            opacity: '0.7',
            marginBottom: '20px'
          }}>
            Full-featured Odoo ERP system demonstration
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            fontSize: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#22c55e',
                display: 'inline-block'
              }}></span>
              Live Demo
            </div>
            <span style={{ opacity: '0.5' }}>•</span>
            <span style={{ opacity: '0.7' }}>
              Running on Docker container
            </span>
          </div>
        </div>

        {isLoading ? (
          <div style={{
            height: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            color: 'var(--text-color)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border-color)',
              borderTop: '3px solid var(--accent-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ opacity: '0.7' }}>Loading Odoo Demo...</p>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <div style={{ height: '70vh', position: 'relative' }}>
            {/* This is where you would embed your actual Odoo instance */}
            {/* For now, showing a placeholder */}
            <div style={{
              height: '100%',
              background: 'var(--hover-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)'
            }}>
              <div style={{
                textAlign: 'center',
                maxWidth: '500px',
                padding: '0 40px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  marginBottom: '16px',
                  color: 'var(--accent-color)'
                }}>
                  Odoo Demo Placeholder
                </h3>
                <p style={{
                  fontSize: '14px',
                  opacity: '0.8',
                  lineHeight: '1.5',
                  marginBottom: '24px'
                }}>
                  This is where your Odoo ERP demo will be embedded. You can either:
                </p>
                <ul style={{
                  textAlign: 'left',
                  fontSize: '13px',
                  opacity: '0.7',
                  lineHeight: '1.6'
                }}>
                  <li>Embed an iframe pointing to your Odoo instance</li>
                  <li>Set up a reverse proxy in your web server</li>
                  <li>Use Docker containers with subdomain routing</li>
                  <li>Configure Next.js rewrites for the subdirectory</li>
                </ul>
              </div>
            </div>
            
            {/* Uncomment and modify this when you have your Odoo instance running */}
            {
            <iframe
              src="https://sedemo.odoo.com/odoo/stock-report"
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Odoo ERP Demo"
            />
            }
          </div>
        )}
      </main>
    </>
  );
}