'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

const STORAGE_KEY = 'rayan_unlocked';

export default function RayanClient() {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === process.env.NEXT_PUBLIC_RAYAN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (error) setError(false);
  };

  if (!unlocked) {
    return (
      <div className={styles.gate}>
        <h1 className={styles.heading}>RAYAN</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={input}
            onChange={handleInputChange}
            placeholder="password"
            className={styles.input}
          />
          {error && <p className={styles.error}>incorrect</p>}
          <button type="submit" className={styles.accessButton}>ACCESS</button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.tool}>
      <h1 className={styles.heading}>RAYAN</h1>
      <p className={styles.subtitle}>crypto finder</p>
      {/* Generate button — wired in Phase 8 */}
    </div>
  );
}
