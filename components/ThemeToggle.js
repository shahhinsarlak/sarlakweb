'use client';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'sarlak-theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Sync with whatever the pre-paint script already set on <html>
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(current);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {}
    setTheme(next);
  };

  // Filled circle reads as night, open circle as day. No emojis, fits the
  // minimalist geometric aesthetic.
  const glyph = theme === 'dark' ? '●' : '○';
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <span style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.2s ease' }}>
        {glyph}
      </span>
    </button>
  );
}
