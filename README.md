# SARLAK

This is my site. I am Shahhin Sarlak. I study Computing Science (Honours) at the
University of Technology Sydney and I work as a data centre technician at Microsoft.

It is part portfolio and part workshop. It holds a few browser apps, an incremental
horror game and a dev log. I built the whole thing as one Next.js site and it runs on
AWS Amplify.

Everything runs in the browser. You open a page and it works. Nothing to install.

![Home page](docs/screenshots/home.png)
*Home, June 2026.*

## What is inside

### Office Horror (`/game`)

An incremental office horror game I have been building for a while. You sort papers for
Productivity Points and manage Energy and Sanity while the office turns out to be a loop
you cannot leave. It has a flat skill tree, a printer and document system, a dimensional
portal and a Chapter 2 endgame with Insights, a Factory and Expeditions. Progress saves
to your browser. I keep the full system notes in `app/game/GAME_CONTEXT.md`.

![Office Horror](docs/screenshots/office-horror.png)
*Office Horror, June 2026.*

### PXLS (`/pxls`)

A pixel art editor I wrote that runs entirely in the browser. It has layers, per cell
effects (dither, noise and shade) and frame based animation with GIF export. Projects are
JSON backed and export to PNG, SVG and JSON. I keep the full context in
`app/pxls/PXLS_CONTEXT.md`.

![PXLS pixel editor](docs/screenshots/pxls.png)
*PXLS, June 2026.*

### Dev log (`/log`)

Short notes on what I make and what I learn making it. No schedule. They go up when
something is worth writing down. Posts are markdown in `content/posts/`, rendered through
a gray-matter and remark pipeline (`lib/posts.js`).

![Dev log](docs/screenshots/dev-log.png)
*Dev log, June 2026.*

There are a few more routes too, a spin wheel and a survival prototype among them. The
full list is at `/apps`.

## Tech stack

- Next.js 15 (App Router) and React 19, plain JavaScript, no TypeScript.
- Self hosted fonts via `next/font/local`: Fraunces for display, Hanken Grotesk for body
  and IBM Plex Mono for UI and code.
- CSS Modules plus CSS variables for a dark and light theme (`data-theme`, remembered in
  localStorage).
- The game and PXLS keep their state in localStorage. No backend for them.
- A couple of API routes backed by the Anthropic API (`@anthropic-ai/sdk`).
- three.js for the particle experiment, gifenc for PXLS GIF export, gray-matter and
  remark for the dev log.
- Deployed on AWS Amplify (`amplify.yml`).

## Project structure

```
app/
  page.js            Home, the editorial landing
  layout.js          Root layout, fonts and theme bootstrap
  game/              Office Horror incremental game (see GAME_CONTEXT.md)
  pxls/              PXLS pixel art editor (see PXLS_CONTEXT.md)
  log/               Dev log, reads content/posts/
  apps/              Directory of apps and experiments
  wheel/             Spin wheel app and API route
  survival/          Survival prototype
  api/               Server routes (Anthropic backed)
components/          Header, Footer, ThemeToggle, BootSequence
content/posts/       Markdown source for the dev log
lib/posts.js         Markdown pipeline (gray-matter and remark)
docs/screenshots/    Screenshots used in this README
public/              Static assets
```

## Getting started

```bash
npm install
npm run dev      # dev server on http://localhost:3000
npm run build    # production build, the same one AWS Amplify runs
npm run lint     # ESLint
```

The build runs ESLint and fails on unescaped JSX entities, so I run `npm run build`
before I push.

## Notes

- I captured the screenshots in `docs/screenshots/` with Playwright against a production
  build. The date next to each one says when.
- My conventions and workflow live in `CLAUDE.md`. The deeper context for the two largest
  apps lives in `app/game/GAME_CONTEXT.md` and `app/pxls/PXLS_CONTEXT.md`.

## Connect

- Email: shahhinsarlak@gmail.com
- GitHub: https://github.com/shahhinsarlak
- LinkedIn: https://www.linkedin.com/in/shahhin-sarlak
