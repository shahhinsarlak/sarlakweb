# Dev Log Expansion — Tag Filter + Reading Time Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add URL-based tag filtering and reading time estimates to the dev log list and individual post pages.

**Architecture:** `lib/posts.js` gains a `readingTime` field (word count ÷ 200). A new `'use client'` component `LogList.js` handles tag filter state via `useSearchParams` and `useRouter`. The list page (`page.js`) stays a server component and passes posts to `LogList` inside a `<Suspense>` boundary (required by Next.js for `useSearchParams` in the server component tree).

**Tech Stack:** Next.js 15 App Router, React 19, `useSearchParams` / `useRouter` from `next/navigation`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `lib/posts.js` | Add `readingTime` to `getAllPosts` + `getPostBySlug` |
| Create | `app/log/LogList.js` | Client component — tag filter UI + URL state |
| Modify | `app/log/page.js` | Pass posts to `<LogList>`, add `<Suspense>` wrapper |
| Modify | `app/log/[slug]/page.js` | Display reading time in post meta |
| Modify | `app/log/log.css` | Add `.log-tag--active` + button reset styles to `.log-tag` |

---

## Task 1: Add `readingTime` to `lib/posts.js`

**Files:**
- Modify: `lib/posts.js`

- [ ] **Step 1: Add `readingTime` to `getAllPosts`**

In `lib/posts.js`, inside the `.map()` callback, after the `excerpt` calculation, add the word count and return it in the object. Replace the `return { ... }` block:

```javascript
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      const readingTime = Math.ceil(wordCount / 200);

      return {
        slug,
        title: data.title || slug,
        date: data.date || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        excerpt,
        readingTime,
      };
```

- [ ] **Step 2: Add `readingTime` to `getPostBySlug`**

In `getPostBySlug`, after `const contentHtml = processed.toString();`, add:

```javascript
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);
```

And update the return object:

```javascript
  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    contentHtml,
    readingTime,
  };
```

- [ ] **Step 3: Verify build passes**

```bash
cd sarlakweb && npm run build
```

Expected: build completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/posts.js
git commit -m "feat(log): add reading time calculation to posts"
```

---

## Task 2: Add CSS for active tag + button reset

**Files:**
- Modify: `app/log/log.css`

- [ ] **Step 1: Add `background` and `cursor` to existing `.log-tag` rule**

The `.log-tag` rule currently ends at `letter-spacing: 0.5px;`. Add two properties so the rule becomes:

```css
.log-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: none;
  cursor: pointer;
}
```

- [ ] **Step 2: Add `.log-tag--active` rule after `.log-tag`**

```css
.log-tag--active {
  border-color: var(--accent-color);
  color: var(--accent-color);
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add app/log/log.css
git commit -m "feat(log): add active tag styles"
```

---

## Task 3: Create `app/log/LogList.js` client component

**Files:**
- Create: `app/log/LogList.js`

- [ ] **Step 1: Create `LogList.js`**

Create `app/log/LogList.js` with this exact content:

```javascript
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function LogList({ posts }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTag = searchParams.get('tag');

  const filtered = activeTag
    ? posts.filter(p => p.tags.includes(activeTag))
    : posts;

  function handleTagClick(e, tag) {
    e.preventDefault();
    if (tag === activeTag) {
      router.push('/log');
    } else {
      router.push(`/log?tag=${encodeURIComponent(tag)}`);
    }
  }

  return (
    <div className="log-list">
      {filtered.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>No posts.</p>
      )}
      {filtered.map(post => (
        <Link key={post.slug} href={`/log/${post.slug}`} className="log-entry">
          <div className="log-entry-meta">
            <span className="log-date">
              {formatDate(post.date)}
              {post.readingTime ? ` \u00b7 ${post.readingTime} min read` : ''}
            </span>
            <div className="log-tags">
              {post.tags.map(tag => (
                <button
                  key={tag}
                  className={`log-tag${tag === activeTag ? ' log-tag--active' : ''}`}
                  onClick={(e) => handleTagClick(e, tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="log-title">{post.title}</div>
          {post.excerpt && <div className="log-excerpt">{post.excerpt}</div>}
        </Link>
      ))}
    </div>
  );
}
```

Note: `\u00b7` is the middle dot `·` — avoids JSX unescaped entity lint error.

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/log/LogList.js
git commit -m "feat(log): add LogList client component with tag filter"
```

---

## Task 4: Update `app/log/page.js` to use `LogList`

**Files:**
- Modify: `app/log/page.js`

- [ ] **Step 1: Replace `page.js` content**

Replace the entire file with:

```javascript
import { Suspense } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAllPosts } from '../../lib/posts';
import LogList from './LogList';
import './log.css';

export const metadata = {
  title: 'Dev Log \u2014 SARLAK',
  description: 'Development notes, project updates, and experiments.',
};

export default function LogPage() {
  const posts = getAllPosts();

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <section className="section">
          <h2 className="section-title">Dev Log</h2>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '40px' }}>
            Notes on what I&apos;m building, breaking and figuring out.
          </p>
          <Suspense fallback={<div className="log-list" />}>
            <LogList posts={posts} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}
```

Note: `\u2014` is the em dash in the metadata string (inside a JS string, not JSX — no lint issue).

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/log/page.js
git commit -m "feat(log): wire LogList into log page with Suspense boundary"
```

---

## Task 5: Update `app/log/[slug]/page.js` to show reading time

**Files:**
- Modify: `app/log/[slug]/page.js`

- [ ] **Step 1: Update post meta to show reading time**

In `app/log/[slug]/page.js`, find the `.post-meta` div (lines 45–52). Replace it with:

```jsx
              <div className="post-meta">
                <span className="log-date">
                  {formatDate(post.date)}
                  {post.readingTime ? ` \u00b7 ${post.readingTime} min read` : ''}
                </span>
                <div className="log-tags">
                  {post.tags.map(tag => (
                    <span key={tag} className="log-tag">{tag}</span>
                  ))}
                </div>
              </div>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/log/[slug]/page.js"
git commit -m "feat(log): show reading time on individual post page"
```

---

## Task 6: Manual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check list page**

Open `http://localhost:3000/log`. Verify:
- Each post shows date + `· N min read`
- Tags render as buttons
- Clicking a tag updates URL to `/log?tag=<tagname>`
- Active tag shows with accent color border
- Clicking active tag again returns to `/log` (all posts)
- Filtering works (only matching posts shown)

- [ ] **Step 3: Check individual post page**

Open any post. Verify:
- Date + `· N min read` shown in post meta
- Tags render (as spans, not buttons — not clickable here)

- [ ] **Step 4: Final commit if any lint fixes needed**

If `npm run build` reveals any unescaped entity issues, fix them then:

```bash
git add <changed files>
git commit -m "fix(log): resolve lint issues"
```
