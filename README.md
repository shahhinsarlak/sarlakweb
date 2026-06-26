# SARLAK

Personal site and web playground of Shahhin Sarlak, a Computing Science (Honours)
student at the University of Technology Sydney and a data centre technician at
Microsoft. It is part portfolio and part workshop. A small set of interactive
browser apps, an incremental horror game and a dev log, built as one Next.js site
and deployed on AWS Amplify.

Everything runs client side. Open a page and it works straight away, nothing to install.

![Home page](docs/screenshots/home.png)

## What is inside

### Office Horror (`/game`)

An incremental office horror game. You sort papers for Productivity Points, manage
Energy and Sanity and slowly uncover that the office is a loop you cannot leave. It
has a flat skill tree, a printer and document system, a dimensional portal and a
Chapter 2 endgame with Insights, a Factory and Expeditions. Progress saves to
localStorage. Full system notes live in `app/game/GAME_CONTEXT.md`.

![Office Horror](docs/screenshots/office-horror.png)

### PXLS (`/pxls`)

A pixel art editor that runs entirely in the browser. Layers, per cell effects
(dither, noise, shade) and frame based animation with GIF export. Projects are JSON
backed and export to PNG, SVG and JSON. Full context lives in `app/pxls/PXLS_CONTEXT.md`.

![PXLS pixel editor](docs/screenshots/pxls.png)

### Dev log (`/log`)

Short working notes on what gets built and what gets learned doing it. Markdown posts
in `content/posts/`, rendered through a gray-matter and remark pipeline (`lib/posts.js`).

![Dev log](docs/screenshots/dev-log.png)

There are a few more routes too, including a spin wheel and a survival prototype. The
full directory lives at `/apps`.

## Tech stack

- Next.js 15 (App Router) and React 19, plain JavaScript, no TypeScript.
- Self hosted fonts via `next/font/local`: Fraunces for display, Hanken Grotesk for
  body and IBM Plex Mono for UI and code.
- CSS Modules plus CSS variables for a dark and light theme (`data-theme`, remembered
  in localStorage).
- Client side games and tools. The game and PXLS keep their state in localStorage with
  no backend.
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

The build runs ESLint and fails on unescaped JSX entities, so run `npm run build`
before pushing.

## Notes

- Screenshots in `docs/screenshots/` were captured with Playwright against a
  production build.
- Coding conventions and workflow live in `CLAUDE.md`. Deeper context for the two
  largest apps lives in `app/game/GAME_CONTEXT.md` and `app/pxls/PXLS_CONTEXT.md`.

## Connect

- Email: shahhinsarlak@gmail.com
- GitHub: https://github.com/shahhinsarlak
- LinkedIn: https://www.linkedin.com/in/shahhin-sarlak
