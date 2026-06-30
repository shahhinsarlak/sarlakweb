# CLAUDE.md — Development Ruleset

**Project:** SarlakWeb, the personal site of Shahhin Sarlak.
**Stack:** Next.js 15.5.6, React 19.1.0, plain JavaScript (ES6+). Deployed on AWS Amplify.

**What this project is:** the site began in 2025 as a coding portfolio and pivoted into a
record of how Shahhin uses AI to build software. It is not a showcase of hand-written code.
Frame copy, dev log posts and docs around the AI-assisted process, not raw coding skill.

This is the single coding ruleset for the whole repo. It covers conventions and
workflow. It does **not** re-document app internals. For deep, app-specific context
read the dedicated docs and treat them as authoritative (do not duplicate them here):

- **Game:** `app/game/GAME_CONTEXT.md` — authoritative for every game system and state property.
- **PXLS:** `app/pxls/PXLS_CONTEXT.md` — authoritative for the pixel art editor.

---

## Commands

- `npm run dev` — dev server (Turbopack) on http://localhost:3000
- `npm run build` — production build and ESLint. This is what Amplify runs. Run it before committing.
- `npm run lint` — ESLint only
- `npm run generate:archive` — regenerate the game's archive images

---

## Git Workflow (MANDATORY)

- Commit per logical change with a short, descriptive message. Run `npm run build`
  first and make sure it passes.
- Push to `main` after committing, unless I have said to hold. If I ask you to hold,
  commit locally and wait for review before pushing.
- **Never list any AI as an author or co-author.** No `Co-authored-by: Claude`,
  `Co-authored-by: Copilot`, `Generated with ...` or similar trailers, ever.
- **Sub-agents must never commit or push.** If you delegate work to a sub-agent, you
  make the commit yourself after reviewing the result.
- Do not rewrite published history (force-push) without asking first.

---

## Repository map

```
app/
  page.js, layout.js   Editorial home and root layout (fonts, theme bootstrap)
  game/                Office Horror incremental game   (see app/game/GAME_CONTEXT.md)
  pxls/                PXLS pixel art editor            (see app/pxls/PXLS_CONTEXT.md)
  lure/                Lure short form audio feed prototype (seeded audio, swipe + autoplay)
  log/                 Dev log, renders content/posts/ via lib/posts.js
  apps/                Directory page listing the apps
  wheel/               Spin wheel app
  survival/            Survival prototype
  zayaani/             Zayaani game
  rayan/               Rayan page
  api/                 Server routes (Anthropic backed: wheel, rayan)
components/            Header.js, Footer.js, ThemeToggle.js, BootSequence.js
lib/posts.js           Markdown pipeline (gray-matter + remark)
content/posts/         Markdown source for the dev log
```

Each app under `app/<name>/` is self-contained: it owns its components, helpers and
state. Do not cross-import between apps. Share only through `components/` or `lib/`.

---

## Keeping the README current

`README.md` is the front door and it uses real screenshots. When a change affects what
it shows, update it in the same commit:

- A new, removed or renamed app or route: update the intro, the "What is inside" section
  and the repository map.
- A visible UI change to a screenshotted page (home, game, PXLS, dev log): recapture that
  screenshot into `docs/screenshots/` with Playwright against a production build and
  update its date caption.
- A change to the tech stack or the commands: update those sections.

Keep the README in the first person and in the dev log voice described below.

---

## Conventions (whole repo)

### Formatting
- 2-space indent, semicolons always, single quotes (double in JSX attributes).
- Max ~100 char lines (flexible for JSX). Trailing commas in multiline arrays/objects.

### Naming
- `camelCase` variables/functions, `UPPER_SNAKE_CASE` constants, `PascalCase` components.
- Boolean prefixes `is`/`has`/`should`. Handler prefix `handle`.
- Files: `camelCase.js` for utilities/helpers, `PascalCase.js` for components.

### Import order
1. React / Next.js
2. Third-party packages
3. Local components
4. Local helpers/utilities
5. Constants (last)

### ESLint / JSX (enforced by the Amplify build)
- Escape special characters in JSX text: `'` -> `&apos;`, `"` -> `&quot;`,
  `<` -> `&lt;`, `>` -> `&gt;`. The `react/no-unescaped-entities` rule is active and a
  raw `'` or `"` inside JSX **fails the build**.
- Run `npm run build` before pushing to catch this before Amplify does.

### Styling and theme
- Dark and light theme via CSS variables and `data-theme` (remembered in localStorage).
  Always support both.
- Use the font variables, not hardcoded families: `--font-display` (Fraunces),
  `--font-body` (Hanken Grotesk), `--font-mono` (IBM Plex Mono).
- **No emojis anywhere in the product** (UI or content). Monochrome terminal glyphs
  (for example a box-drawing character or a check mark in the game's terminal art) are fine.
- Prefer CSS Modules / classes for repeated patterns. Use inline styles for dynamic
  values, component-specific layout and modal overlays.

### React patterns
- Always use functional `setState`: `setState(prev => ({ ...prev, ...changes }))`.
  Never read current state inside a `setState` updater (it is stale).
- Prefer pure helper functions that take state and return values, not mutations.
- Reach for `useCallback` / `useMemo` only when it addresses a real cost.

---

## Dev Log Writing Voice (`content/posts/`)

When writing any dev log post, match Shahhin's voice. Write the way he talks: first
person, relaxed and conversational, like he is explaining what happened to someone sitting
next to him. Let the sentences breathe and run on a little. Join clauses with commas and
with "and", "but" and "so" rather than chopping everything into short clipped lines. Set
the context first and then get to the point, use parentheses for small asides, keep the
words plain over impressive, and finish by tying it back to why it matters to him.

Hold to these:

- First person, casual and relaxed.
- Flowing, connected sentences. Do not force short, truncated, staccato lines.
- Context before the point.
- Specific, humanising details over generic phrases.
- Plain vocabulary over impressive.
- No hyphenated words.
- No em dashes.
- No Oxford commas.

---

## Working on the game or PXLS

Read the relevant context doc first (`app/game/GAME_CONTEXT.md` or
`app/pxls/PXLS_CONTEXT.md`). They are the source of truth for systems and state, and
this file deliberately does not repeat them. A few game conventions worth stating here:

- All game state lives in `INITIAL_GAME_STATE` (`constants.js`); it is the canonical
  source of property names. Add new properties there first, with the correct type.
- Game actions go through the `createGameActions(...)` factory in `gameActions.js`.
  Never create standalone action functions.
- Cap the event log after prepending: `recentMessages: [msg, ...prev.recentMessages].slice(0, prev.maxLogMessages || 15)`.
- When you change a game system, propagate the change everywhere it appears: state
  init, `HELP_POPUPS` / `HELP_TRIGGERS`, `MECHANICS_ENTRIES`, `ACHIEVEMENTS`, action
  handlers, UI displays and both themes. After removing anything, grep for leftover references.
