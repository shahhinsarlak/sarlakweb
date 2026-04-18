# Dev Log Expansion — Tag Filter + Reading Time

**Date:** 2026-04-18
**Status:** Approved

## Overview

Expand the dev log (`/log`) with two additions: URL-based tag filtering and reading time estimates. Tags already exist in post frontmatter and are parsed by `lib/posts.js`. Reading time will be calculated from word count.

## Architecture

### Files Changed

- `lib/posts.js` — add `readingTime` field to both `getAllPosts` and `getPostBySlug`
- `app/log/page.js` — stays server component; passes posts to `<LogList>`
- `app/log/[slug]/page.js` — pass `readingTime` through to post render

### Files Added

- `app/log/LogList.js` — new `'use client'` component handling tag filter UI and URL state

### Data Flow

1. Server: `getAllPosts()` returns posts with `tags` (already exists) + `readingTime` (new)
2. `page.js` renders `<LogList posts={posts} />`
3. `LogList` reads `?tag=` from URL via `useSearchParams`, filters posts array client-side
4. Tag click → `router.push('/log?tag=foo')`, clicking active tag → `router.push('/log')` to clear

## Reading Time Calculation

- Calculated in `getAllPosts` and `getPostBySlug` from raw markdown content
- Formula: `Math.ceil(wordCount / 200)` — 200 wpm reading speed
- Stored as integer (minutes), e.g. `3`
- Displayed as `"3 min read"`

## UI Behaviour

- Reading time shown next to date on list: `30 April 2026 · 3 min read`
- Reading time shown on individual post page alongside date
- Tags on list page are clickable buttons
- Active tag (matching `?tag=` param) renders with distinct highlight (border/color, no emoji)
- Clicking active tag clears filter — no separate "All" button needed
- Non-matching posts hidden client-side (no server round-trip)

## Out of Scope

- Tag pages (`/log/tag/[tag]`) — URL params handle shareability
- Tag counts or aggregation UI
- Search functionality
