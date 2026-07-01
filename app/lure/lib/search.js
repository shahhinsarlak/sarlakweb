import { POSTS } from '../data/posts';
import { CREATORS } from '../data/creators';
import { CATEGORIES } from '../data/categories';

// Client-side search across the seeded library: posts (title, caption,
// transcript, tags), creators (name, handle, bio), categories and hashtags.
// Everything is static seed data, so this needs no backend.

const ALL_TAGS = [...new Set(POSTS.flatMap((post) => post.tags || []))];

export function searchLibrary(rawQuery) {
  const q = String(rawQuery || '').trim().toLowerCase().replace(/^#+/, '');

  if (!q) {
    return {
      query: '',
      browse: true,
      tags: [],
      creators: CREATORS,
      categories: CATEGORIES,
      posts: [],
    };
  }

  const posts = POSTS.filter((post) => (
    post.title.toLowerCase().includes(q)
    || post.caption.toLowerCase().includes(q)
    || post.transcript.toLowerCase().includes(q)
    || (post.tags || []).some((tag) => tag.toLowerCase().includes(q))
  ));

  const creators = CREATORS.filter((creator) => (
    creator.name.toLowerCase().includes(q)
    || creator.handle.toLowerCase().includes(q)
    || (creator.bio || '').toLowerCase().includes(q)
  ));

  const categories = CATEGORIES.filter((category) => (
    category.label.toLowerCase().includes(q)
    || (category.blurb || '').toLowerCase().includes(q)
  ));

  const tags = ALL_TAGS.filter((tag) => tag.toLowerCase().includes(q)).slice(0, 12);

  return { query: q, browse: false, tags, creators, categories, posts };
}
