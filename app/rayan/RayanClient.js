'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

const STORAGE_KEY = 'rayan_unlocked';

function TweetCard({ item }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.tweet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.tweetCard}>
      <p className={styles.tweetType}>{item.type}</p>
      <p className={styles.tweetText}>{item.tweet}</p>
      <button className={styles.copyButton} onClick={handleCopy}>
        {copied ? 'COPIED' : 'COPY'}
      </button>
    </div>
  );
}

export default function RayanClient() {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState(null);

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

  const handleGenerate = async () => {
    setLoading(true);
    setGenError(null);
    setTweets([]);
    try {
      const res = await fetch('/api/rayan/generate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        const src = data.source;
        if (src === 'coingecko') {
          setGenError('CoinGecko is unavailable - could not fetch trending coins. Try again shortly.');
        } else if (src === 'cooldown') {
          setGenError('Too many requests - wait 15 seconds before generating again.');
        } else {
          setGenError('Claude could not generate tweets. Try again.');
        }
      } else {
        setTweets(data.tweets);
      }
    } catch {
      setGenError('Network error - check your connection and try again.');
    } finally {
      setLoading(false);
    }
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
      <button
        className={styles.generateButton}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'GENERATING...' : 'GENERATE'}
      </button>
      {genError && <p className={styles.errorMessage}>{genError}</p>}
      {tweets.length > 0 && (
        <div className={styles.tweetGrid}>
          {tweets.map((item, index) => (
            <TweetCard key={`${item.type}-${index}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
