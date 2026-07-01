'use client';
import { useCallback, useEffect, useState } from 'react';

import {
  getEngagement,
  toggleLike as toggleLikeAction,
  toggleSave as toggleSaveAction,
  mergeLocalEngagement,
} from '../actions/engagement';

// Likes and saves with two backends behind one interface.
//
// Signed out it behaves exactly like the original prototype: arrays in
// localStorage. Signed in, it calls the server actions (which run the Amplify
// Data client server-side against the httpOnly session), and on first sign-in
// it merges any local likes/saves up into the account. The browser never holds
// a token, so all authenticated data access goes through the server actions.

const LIKES_KEY = 'lure_likes_v1';
const SAVES_KEY = 'lure_saves_v1';

function readLocal(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore quota errors
  }
}

export function useLikesSaves(user) {
  const [likes, setLikes] = useState([]);
  const [saves, setSaves] = useState([]);
  const signedIn = Boolean(user);

  useEffect(() => {
    let cancelled = false;

    if (!signedIn) {
      setLikes(readLocal(LIKES_KEY));
      setSaves(readLocal(SAVES_KEY));
      return () => {};
    }

    (async () => {
      const localLikes = readLocal(LIKES_KEY);
      const localSaves = readLocal(SAVES_KEY);
      let result;
      if (localLikes.length || localSaves.length) {
        result = await mergeLocalEngagement(localLikes, localSaves);
        writeLocal(LIKES_KEY, []);
        writeLocal(SAVES_KEY, []);
      } else {
        result = await getEngagement();
      }
      if (!cancelled && result) {
        setLikes(result.likes || []);
        setSaves(result.saves || []);
      }
    })();

    return () => { cancelled = true; };
  }, [signedIn]);

  const makeToggle = useCallback((key, setter, action) => (postId) => {
    if (!signedIn) {
      setter((prev) => {
        const next = prev.includes(postId)
          ? prev.filter((id) => id !== postId)
          : [...prev, postId];
        writeLocal(key, next);
        return next;
      });
      return;
    }
    // Optimistic toggle, reverted if the server action reports a failure.
    const flip = (prev) => (
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    setter(flip);
    action(postId)
      .then((res) => { if (res && res.error) setter(flip); })
      .catch(() => setter(flip));
  }, [signedIn]);

  const toggleLike = useCallback(
    (postId) => makeToggle(LIKES_KEY, setLikes, toggleLikeAction)(postId),
    [makeToggle],
  );
  const toggleSave = useCallback(
    (postId) => makeToggle(SAVES_KEY, setSaves, toggleSaveAction)(postId),
    [makeToggle],
  );

  return { likes, saves, toggleLike, toggleSave };
}
