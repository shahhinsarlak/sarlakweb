'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

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
        <Link href="/td" className={`nav-link ${pathname === '/td' ? 'active' : ''}`}>
          Tower Defense
        </Link>
        <Link href="/game" className={`nav-link ${pathname === '/game' ? 'active' : ''}`}>
          Incremental
        </Link>
      </nav>
    </header>
  );
}
