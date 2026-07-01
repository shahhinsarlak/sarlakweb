'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import Feed from './components/Feed';
import StartGate from './components/StartGate';
import CategoryBar from './components/CategoryBar';
import TranscriptSheet from './components/TranscriptSheet';
import CreatorSheet from './components/CreatorSheet';
import ProfileSheet from './components/ProfileSheet';
import { ChevronUpIcon, ChevronDownIcon } from './components/Icons';
import ThemeToggle from '../../components/ThemeToggle';

import { useAudioController } from './hooks/useAudioController';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLikesSaves } from './hooks/useLikesSaves';
import { useAuth } from './auth/AuthProvider';
import { buildFeed, applySignal } from './lib/feedAlgorithm';
import { CATEGORIES, CATEGORY_MAP } from './data/categories';
import { CREATOR_MAP } from './data/creators';
import { POSTS } from './data/posts';

import styles from './page.module.css';

const POST_MAP = Object.fromEntries(POSTS.map((post) => [post.id, post]));

export default function LureClient() {
  const [started, setStarted] = useState(false);
  const [category, setCategory] = useState('all');
  const [order, setOrder] = useState(POSTS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overlay, setOverlay] = useState(null);
  const [toast, setToast] = useState(null);

  const [signals, setSignals] = useLocalStorage('lure_signals_v1', {});
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, profile, isBackendConfigured, signInHref } = useAuth();
  const { likes, saves, toggleLike, toggleSave } = useLikesSaves(user);

  const feedRef = useRef(null);
  const activeIndexRef = useRef(0);
  const orderRef = useRef(order);
  const signalsRef = useRef(signals);
  const currentPostRef = useRef(null);
  const hookedRef = useRef(false);
  const lastLoadedIndexRef = useRef(-1);
  const pendingScrollRef = useRef(null);
  const toastTimerRef = useRef(null);
  const didInit = useRef(false);
  const likesRef = useRef(likes);

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { orderRef.current = order; }, [order]);
  useEffect(() => { signalsRef.current = signals; }, [signals]);
  useEffect(() => { likesRef.current = likes; }, [likes]);

  const recordSignal = useCallback((cat, kind) => {
    setSignals((prev) => applySignal(prev, cat, kind));
  }, [setSignals]);

  const handleHook = useCallback((post) => {
    hookedRef.current = true;
    if (post) recordSignal(post.category, 'hook');
  }, [recordSignal]);

  const goNext = useCallback(() => {
    const next = activeIndexRef.current + 1;
    if (next < orderRef.current.length && feedRef.current) {
      feedRef.current.scrollToIndex(next);
    }
  }, []);

  const goPrev = useCallback(() => {
    const prev = activeIndexRef.current - 1;
    if (prev >= 0 && feedRef.current) feedRef.current.scrollToIndex(prev);
  }, []);

  const handleEnded = useCallback((post) => {
    if (post) recordSignal(post.category, 'finish');
    goNext();
  }, [recordSignal, goNext]);

  const controller = useAudioController({ onHook: handleHook, onEnded: handleEnded });
  const { audioRef, isPlaying, phase, currentTime, duration, muted, loadAndPlay, togglePlay, toggleMute, seekTo } = controller;

  // Shuffle once after mount. The first render matches the server (declared
  // order), avoiding a hydration mismatch, then we reorder client-side.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    setOrder(buildFeed(POSTS, { category: 'all', signals: signalsRef.current || {} }));
  }, []);

  // Load and play whenever the active card changes (after the gate is open).
  useEffect(() => {
    if (!started) return;
    const post = order[activeIndex];
    if (!post) return;
    if (lastLoadedIndexRef.current === activeIndex) return;

    const previous = currentPostRef.current;
    if (previous && !hookedRef.current) {
      // Left a preview before it hooked: a negative signal for that category.
      recordSignal(previous.category, 'skipPreview');
    }
    currentPostRef.current = post;
    hookedRef.current = false;
    lastLoadedIndexRef.current = activeIndex;
    loadAndPlay(post);
  }, [started, activeIndex, order, loadAndPlay, recordSignal]);

  // Consume a pending jump after the order has been rebuilt.
  useEffect(() => {
    if (pendingScrollRef.current == null) return;
    const index = pendingScrollRef.current;
    pendingScrollRef.current = null;
    if (feedRef.current) feedRef.current.scrollToIndex(index);
  }, [order]);

  // Keyboard controls once the feed is live.
  useEffect(() => {
    if (!started) return undefined;
    const handleKey = (event) => {
      const tag = event.target && event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        goNext();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        goPrev();
      } else if (event.key === ' ') {
        event.preventDefault();
        togglePlay();
      } else if (event.key.toLowerCase() === 'm') {
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started, goNext, goPrev, togglePlay, toggleMute]);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 1600);
  }, []);

  const handleStart = useCallback(() => {
    setStarted(true);
    const post = orderRef.current[0];
    if (post) {
      currentPostRef.current = post;
      hookedRef.current = false;
      lastLoadedIndexRef.current = 0;
      loadAndPlay(post);
    }
  }, [loadAndPlay]);

  const handleActiveChange = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  const handleSelectCategory = useCallback((nextCategory) => {
    const nextOrder = buildFeed(POSTS, { category: nextCategory, signals: signalsRef.current });
    setCategory(nextCategory);
    setOrder(nextOrder);
    setActiveIndex(0);
    const post = nextOrder[0];
    currentPostRef.current = post || null;
    hookedRef.current = false;
    lastLoadedIndexRef.current = 0;
    if (feedRef.current) feedRef.current.scrollToTop();
    if (started && post) loadAndPlay(post);
  }, [started, loadAndPlay]);

  const handleSelectPost = useCallback((postId) => {
    setOverlay(null);
    const post = POST_MAP[postId];
    if (!post) return;
    let index = orderRef.current.findIndex((item) => item.id === postId);
    if (index < 0) {
      const nextOrder = buildFeed(POSTS, { category: 'all', signals: signalsRef.current });
      setCategory('all');
      setOrder(nextOrder);
      index = nextOrder.findIndex((item) => item.id === postId);
      pendingScrollRef.current = index;
    } else if (feedRef.current) {
      feedRef.current.scrollToIndex(index);
    }
    setActiveIndex(index);
    currentPostRef.current = post;
    hookedRef.current = false;
    lastLoadedIndexRef.current = index;
    if (started) loadAndPlay(post);
  }, [started, loadAndPlay]);

  const handleLike = useCallback((postId) => {
    const wasLiked = likesRef.current.includes(postId);
    toggleLike(postId);
    if (!wasLiked) {
      const post = POST_MAP[postId];
      if (post) recordSignal(post.category, 'like');
    }
  }, [toggleLike, recordSignal]);

  const handleSave = useCallback((postId) => {
    toggleSave(postId);
  }, [toggleSave]);

  const handleShare = useCallback((postId) => {
    const post = POST_MAP[postId];
    const url = typeof window !== 'undefined' ? window.location.href : '/lure';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: 'Lure', text: post ? post.title : 'Lure', url }).catch(() => {});
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => showToast('Link copied')).catch(() => {});
      }
    } catch (e) {
      // sharing is best-effort in the prototype
    }
  }, [showToast]);

  const handleTranscript = useCallback((postId) => {
    setOverlay({ type: 'transcript', postId });
  }, []);

  const handleCreator = useCallback((postId) => {
    setOverlay({ type: 'creator', postId });
  }, []);

  const entries = useMemo(() => order.map((post) => ({
    post,
    creator: CREATOR_MAP[post.creatorId],
    category: CATEGORY_MAP[post.category],
  })), [order]);

  const playback = useMemo(() => ({
    audioRef,
    isPlaying,
    phase,
    currentTime,
    duration,
  }), [audioRef, isPlaying, phase, currentTime, duration]);

  const overlayPost = overlay ? POST_MAP[overlay.postId] : null;
  const overlayCreator = overlayPost ? CREATOR_MAP[overlayPost.creatorId] : null;

  return (
    <div className={styles.root}>
      <header className={styles.topBar}>
        <div className={styles.topRow}>
          <Link href="/apps" className={styles.backLink}>‹ Apps</Link>
          <div className={styles.wordmark}>
            <span className={styles.wordmarkBracket}>[</span>
            LURE
            <span className={styles.wordmarkBracket}>]</span>
          </div>
          <div className={styles.topRight}>
            {isBackendConfigured && (
              user ? (
                <button
                  type="button"
                  className={`${styles.accountBtn} ${profile ? '' : styles.accountBtnNudge}`}
                  onClick={() => setProfileOpen(true)}
                >
                  {profile ? `@${profile.handle}` : 'Set up profile'}
                </button>
              ) : (
                <a className={styles.accountBtn} href={signInHref}>
                  Sign in
                </a>
              )
            )}
            <ThemeToggle />
          </div>
        </div>
        <CategoryBar
          categories={CATEGORIES}
          active={category}
          onSelect={handleSelectCategory}
        />
      </header>

      <Feed
        ref={feedRef}
        entries={entries}
        activeIndex={activeIndex}
        playback={playback}
        likes={likes}
        saves={saves}
        muted={muted}
        onActiveChange={handleActiveChange}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onSeek={seekTo}
        onLike={handleLike}
        onSave={handleSave}
        onShare={handleShare}
        onTranscript={handleTranscript}
        onCreator={handleCreator}
      />

      <div className={styles.navButtons}>
        <button type="button" className={styles.navButton} onClick={goPrev} aria-label="Previous">
          <ChevronUpIcon size={20} />
        </button>
        <button type="button" className={styles.navButton} onClick={goNext} aria-label="Next">
          <ChevronDownIcon size={20} />
        </button>
      </div>

      {toast && <div className={styles.toast} role="status">{toast}</div>}

      {overlay && overlay.type === 'transcript' && overlayPost && (
        <TranscriptSheet
          post={overlayPost}
          creator={overlayCreator}
          category={CATEGORY_MAP[overlayPost.category]}
          onClose={() => setOverlay(null)}
        />
      )}

      {overlay && overlay.type === 'creator' && overlayCreator && (
        <CreatorSheet
          creator={overlayCreator}
          category={CATEGORY_MAP[overlayCreator.category]}
          posts={POSTS.filter((post) => post.creatorId === overlayCreator.id)}
          onSelectPost={handleSelectPost}
          onClose={() => setOverlay(null)}
        />
      )}

      {profileOpen && <ProfileSheet onClose={() => setProfileOpen(false)} />}

      {!started && <StartGate onStart={handleStart} />}
    </div>
  );
}
