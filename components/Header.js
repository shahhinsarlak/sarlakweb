'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    window.postMessage({ type: 'THEME_TOGGLE' }, '*');
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <header className="header">
      <div className="logo">
        <Link href="/">SARLAK</Link>
      </div>
      <nav className="nav">
        <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        <Link href="/apps" className={`nav-link ${pathname === '/apps' ? 'active' : ''}`}>
          Apps
        </Link>
        <Link href="/game" className={`nav-link ${pathname === '/game' ? 'active' : ''}`}>
          Game
        </Link>
      </nav>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '○' : '●'}
      </button>
    </header>
  );
}