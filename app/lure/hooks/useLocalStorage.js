'use client';
import { useEffect, useRef, useState } from 'react';

// Small localStorage-backed state. Reads once on mount (so SSR renders the
// initial value), then writes on change. Used for likes, saves and the feed
// engagement signals in the Lure prototype.

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw));
    } catch (e) {
      // ignore read/parse errors and keep the initial value
    }
    loaded.current = true;
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // ignore quota or serialisation errors
    }
  }, [key, value]);

  return [value, setValue];
}
