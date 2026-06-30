'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { generateClient } from 'aws-amplify/data';

import { isBackendConfigured } from '../lib/amplifyConfig';

// Likes and saves with two backends behind one interface.
//
// Signed out (or backend not connected) it behaves exactly like the original
// prototype: arrays in localStorage. Signed in, it reads and writes the Amplify
// Data models, and on first sign-in it merges any local likes/saves up into the
// account so nothing is lost when an anonymous visitor creates an account.

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
  const clientRef = useRef(null);
  const likeIdRef = useRef({});
  const saveIdRef = useRef({});

  const signedIn = Boolean(user) && isBackendConfigured;

  const getClient = useCallback(() => {
    if (!clientRef.current) clientRef.current = generateClient();
    return clientRef.current;
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!signedIn) {
      setLikes(readLocal(LIKES_KEY));
      setSaves(readLocal(SAVES_KEY));
      return () => {};
    }

    (async () => {
      const client = getClient();
      try {
        const localLikes = readLocal(LIKES_KEY);
        const localSaves = readLocal(SAVES_KEY);
        const [likeRes, saveRes] = await Promise.all([
          client.models.Like.list(),
          client.models.Save.list(),
        ]);

        const likeMap = {};
        (likeRes.data || []).forEach((row) => { likeMap[row.postId] = row.id; });
        const saveMap = {};
        (saveRes.data || []).forEach((row) => { saveMap[row.postId] = row.id; });

        await Promise.all(
          localLikes.filter((postId) => !likeMap[postId]).map(async (postId) => {
            const { data } = await client.models.Like.create({ postId });
            if (data) likeMap[postId] = data.id;
          }),
        );
        await Promise.all(
          localSaves.filter((postId) => !saveMap[postId]).map(async (postId) => {
            const { data } = await client.models.Save.create({ postId });
            if (data) saveMap[postId] = data.id;
          }),
        );

        if (cancelled) return;
        likeIdRef.current = likeMap;
        saveIdRef.current = saveMap;
        setLikes(Object.keys(likeMap));
        setSaves(Object.keys(saveMap));
        // The local copies have been merged up, so clear them.
        writeLocal(LIKES_KEY, []);
        writeLocal(SAVES_KEY, []);
      } catch (e) {
        if (!cancelled) {
          setLikes(readLocal(LIKES_KEY));
          setSaves(readLocal(SAVES_KEY));
        }
      }
    })();

    return () => { cancelled = true; };
  }, [signedIn, getClient]);

  const toggleLike = useCallback((postId) => {
    if (!signedIn) {
      setLikes((prev) => {
        const next = prev.includes(postId)
          ? prev.filter((id) => id !== postId)
          : [...prev, postId];
        writeLocal(LIKES_KEY, next);
        return next;
      });
      return;
    }
    const client = getClient();
    setLikes((prev) => {
      if (prev.includes(postId)) {
        const rowId = likeIdRef.current[postId];
        if (rowId) client.models.Like.delete({ id: rowId }).catch(() => {});
        delete likeIdRef.current[postId];
        return prev.filter((id) => id !== postId);
      }
      client.models.Like.create({ postId })
        .then(({ data }) => { if (data) likeIdRef.current[postId] = data.id; })
        .catch(() => {});
      return [...prev, postId];
    });
  }, [signedIn, getClient]);

  const toggleSave = useCallback((postId) => {
    if (!signedIn) {
      setSaves((prev) => {
        const next = prev.includes(postId)
          ? prev.filter((id) => id !== postId)
          : [...prev, postId];
        writeLocal(SAVES_KEY, next);
        return next;
      });
      return;
    }
    const client = getClient();
    setSaves((prev) => {
      if (prev.includes(postId)) {
        const rowId = saveIdRef.current[postId];
        if (rowId) client.models.Save.delete({ id: rowId }).catch(() => {});
        delete saveIdRef.current[postId];
        return prev.filter((id) => id !== postId);
      }
      client.models.Save.create({ postId })
        .then(({ data }) => { if (data) saveIdRef.current[postId] = data.id; })
        .catch(() => {});
      return [...prev, postId];
    });
  }, [signedIn, getClient]);

  return { likes, saves, toggleLike, toggleSave };
}
