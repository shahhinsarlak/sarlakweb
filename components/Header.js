'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="logo">
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'inherit' }}>
          <span style={{ color: 'var(--accent-color)', fontWeight: 400 }}>[</span>
          <span style={{ letterSpacing: '2px' }}>SARLAK</span>
          <span style={{ color: 'var(--accent-color)', fontWeight: 400 }}>]</span>
          <span style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--accent-color)', marginLeft: 4, flexShrink: 0 }}></span>
        </Link>
      </div>
      <nav className="nav">
        <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        <Link href="/apps" className={`nav-link ${pathname === '/apps' ? 'active' : ''}`}>
          Apps
        </Link>
        <Link href="/log" className={`nav-link ${pathname.startsWith('/log') ? 'active' : ''}`}>
          Log
        </Link>
        <Link href="/game" className={`nav-link ${pathname === '/game' ? 'active' : ''}`}>
          Incremental
        </Link>
      </nav>
    </header>
  );
}
