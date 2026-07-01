'use client';
import { useCallback, useEffect, useState } from 'react';

import {
  getFollows,
  toggleFollow as toggleFollowAction,
  mergeLocalFollows,
} from '../actions/follows';

// Which creators the viewer follows. Signed out it lives in localStorage (so
// anonymous visitors can still build a Following feed); signed in it goes through
// the server actions, merging the local set into the account on first sign-in.

const FOLLOWS_KEY = 'lure_follows_v1';

function readLocal() {
  try {
    const raw = window.localStorage.getItem(FOLLOWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeLocal(value) {
  try {
    window.localStorage.setItem(FOLLOWS_KEY, JSON.stringify(value));
  } catch (e) {
    // ignore quota errors
  }
}

export function useFollows(user) {
  const [follows, setFollows] = useState([]);
  const signedIn = Boolean(user);

  useEffect(() => {
    let cancelled = false;

    if (!signedIn) {
      setFollows(readLocal());
      return () => {};
    }

    (async () => {
      const local = readLocal();
      let result;
      if (local.length) {
        result = await mergeLocalFollows(local);
        writeLocal([]);
      } else {
        result = await getFollows();
      }
      if (!cancelled && result) setFollows(result);
    })();

    return () => { cancelled = true; };
  }, [signedIn]);

  const toggleFollow = useCallback((creatorId) => {
    if (!signedIn) {
      setFollows((prev) => {
        const next = prev.includes(creatorId)
          ? prev.filter((id) => id !== creatorId)
          : [...prev, creatorId];
        writeLocal(next);
        return next;
      });
      return;
    }
    const flip = (prev) => (
      prev.includes(creatorId) ? prev.filter((id) => id !== creatorId) : [...prev, creatorId]
    );
    setFollows(flip);
    toggleFollowAction(creatorId)
      .then((res) => { if (res && res.error) setFollows(flip); })
      .catch(() => setFollows(flip));
  }, [signedIn]);

  return { follows, toggleFollow };
}
