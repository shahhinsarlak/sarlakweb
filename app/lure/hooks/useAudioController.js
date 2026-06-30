'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// The Lure audio engine. One reused HTMLAudioElement for the whole feed (kinder
// to mobile Safari than one element per card). It tracks a `phase`: a clip
// starts in `preview`, and the instant playback crosses the post's preview
// window it flips to `full` without ever stopping the audio. That seamless
// hand-off is the core of the product, so it lives here, not in a component.

export function useAudioController({ onHook, onEnded }) {
  const audioRef = useRef(null);
  const phaseRef = useRef('preview');
  const postRef = useRef(null);
  const mutedRef = useRef(false);
  const onHookRef = useRef(onHook);
  const onEndedRef = useRef(onEnded);

  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState('preview');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onHookRef.current = onHook;
  }, [onHook]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleTime = () => {
      setCurrentTime(audio.currentTime);
      const post = postRef.current;
      if (!post) return;
      const start = post.previewStartSec || 0;
      const length = post.previewLengthSec || 8;
      if (phaseRef.current === 'preview' && audio.currentTime - start >= length) {
        phaseRef.current = 'full';
        setPhase('full');
        if (onHookRef.current) onHookRef.current(post);
      }
    };
    const handleLoaded = () => setDuration(audio.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (onEndedRef.current) onEndedRef.current(postRef.current);
    };

    audio.addEventListener('timeupdate', handleTime);
    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    setReady(true);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTime);
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const loadAndPlay = useCallback((post) => {
    const audio = audioRef.current;
    if (!audio || !post) return;
    postRef.current = post;
    phaseRef.current = 'preview';
    setPhase('preview');
    setCurrentTime(0);
    setDuration(0);
    audio.src = post.audioUrl;
    audio.muted = mutedRef.current;
    const start = post.previewStartSec || 0;
    if (start > 0) {
      const seekOnce = () => {
        try {
          audio.currentTime = start;
        } catch (e) {
          // metadata not ready yet; ignore
        }
        audio.removeEventListener('loadedmetadata', seekOnce);
      };
      audio.addEventListener('loadedmetadata', seekOnce);
    }
    const played = audio.play();
    if (played && played.catch) played.catch(() => setIsPlaying(false));
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const played = audio.play();
    if (played && played.catch) played.catch(() => {});
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      const played = audio.play();
      if (played && played.catch) played.catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const seekTo = useCallback((seconds) => {
    const audio = audioRef.current;
    const post = postRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    if (post) {
      const start = post.previewStartSec || 0;
      const length = post.previewLengthSec || 8;
      if (phaseRef.current === 'preview' && seconds - start >= length) {
        phaseRef.current = 'full';
        setPhase('full');
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }, []);

  return {
    audioRef,
    isPlaying,
    phase,
    currentTime,
    duration,
    muted,
    ready,
    loadAndPlay,
    play,
    pause,
    togglePlay,
    seekTo,
    toggleMute,
  };
}
