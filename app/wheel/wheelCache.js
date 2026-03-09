const CACHE_KEY = 'wheel_words_v1';

function getSydneyDateString() {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function getCachedWords() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { words, sydneyDate } = JSON.parse(raw);
    if (sydneyDate !== getSydneyDateString()) return null;
    return words;
  } catch {
    return null;
  }
}

export function setCachedWords(words) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      words,
      sydneyDate: getSydneyDateString(),
    }));
  } catch {
    // localStorage full or blocked — silent fail
  }
}

export function clearWordCache() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}
