// Pure feed ordering for the Lure prototype. Not a real recommender, but a
// believable stand-in built on the same signals a real one would use: it biases
// the order toward categories the listener engages with, and tries not to put
// two posts from the same category back to back. Swap this out later without
// touching the player.

// Efraimidis-Spirakis weighted sampling: a higher weight makes a key closer to
// 1, so sorting by key descending gives a weighted random order.
function weightedOrder(posts, signals) {
  return posts
    .map((post) => {
      const weight = Math.max(0.2, 1 + (signals[post.category] || 0));
      return { post, key: Math.pow(Math.random(), 1 / weight) };
    })
    .sort((a, b) => b.key - a.key)
    .map((entry) => entry.post);
}

// Greedily reduce runs of the same category by swapping in the next post of a
// different category.
function spreadCategories(list) {
  const result = list.slice();
  for (let i = 1; i < result.length; i++) {
    if (result[i].category === result[i - 1].category) {
      for (let j = i + 1; j < result.length; j++) {
        if (result[j].category !== result[i - 1].category) {
          const temp = result[i];
          result[i] = result[j];
          result[j] = temp;
          break;
        }
      }
    }
  }
  return result;
}

export function buildFeed(posts, { category = 'all', signals = {}, followedCreatorIds = [] } = {}) {
  if (category === 'following') {
    const followed = new Set(followedCreatorIds);
    return weightedOrder(posts.filter((post) => followed.has(post.creatorId)), {});
  }

  const pool = category === 'all'
    ? posts.slice()
    : posts.filter((post) => post.category === category);

  if (category !== 'all') {
    // Inside a single category, a plain shuffle is enough.
    return weightedOrder(pool, {});
  }
  return spreadCategories(weightedOrder(pool, signals));
}

// How much each interaction nudges a category's weight. Skipping during the
// preview is the only negative signal; staying and finishing are positive.
export const SIGNAL_DELTAS = {
  skipPreview: -0.4,
  hook: 0.5,
  finish: 0.8,
  like: 0.7,
};

export function applySignal(signals, category, kind) {
  const delta = SIGNAL_DELTAS[kind] || 0;
  const next = { ...signals };
  const updated = (next[category] || 0) + delta;
  // Clamp so a category never fully disappears or runs away.
  next[category] = Math.max(-0.8, Math.min(4, updated));
  return next;
}
