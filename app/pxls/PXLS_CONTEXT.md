# PXLS — Development Context

A JSON backed pixel art editor at route `/pxls`. Client side only (no API). Lives
in the SARLAK Next.js site (Next 15.5.6, React 19.1.0, JavaScript ES6+). This file
exists so any future session has full context without re-reading every file.

## Conventions (follow these)

- 2 space indent, semicolons, single quotes (double in JSX attributes), trailing
  commas in multiline. `camelCase` utils, `PascalCase` components, `UPPER_SNAKE`
  constants. File header comment + JSDoc on exported functions.
- ESLint is enforced by AWS Amplify on build. Escape `'` `"` in JSX text
  (`react/no-unescaped-entities`). Run `npm run build` before pushing.
- No emojis in UI. Match the site theme via CSS vars (`--bg-color`, `--text-color`,
  `--border-color`, `--accent-color`, `--hover-color`); monospace `--font-mono`.
  PXLS scoped accents live in `page.module.css` (`--pxls-active`, etc.).
- Build: `npm run build` (Turbopack). Dev: `npm run dev` (localhost:3000).
- Git workflow is mandatory: commit + push after changes. Pushing needs a PAT
  with write access to shahhinsarlak/sarlakweb (the default credentials lack it).

## Data model (single source of truth)

```
Cell    = { color: '#rrggbb' | null, alpha: 0..1, effect: null | { type, intensity, seed? } }
Layer   = { id, name, visible, opacity, cells: Cell[] }   // cells row-major, index = y*width + x
Project = { id, name, width, height, layers[], activeLayerId, palette[], seed,
            createdAt, updatedAt, version }                // square canvas (width === height)
```

- One cell holds exactly one colour. Effects (`glow`, `dither`, `noise`) are baked
  at render time, never split a cell. Empty cell = `{ color:null, alpha:0, effect:null }`.
- Canvas sizes: 16/32/64/128 (square only; width/height stored separately so
  non-square is an easy later addition).

## Files

- `page.js` — route shell: `<Header/>`, a centred `.pageWrap` (max 1080px), `<PxlsEditor/>`, `<Footer/>`.
- `PxlsEditor.js` — root client component. Holds the project (source of truth),
  brush settings, undo/redo history, keyboard shortcuts, layer ops, autosave,
  light/shade state, and the gallery/export/image modals.
- `Canvas.js` — stacked canvases (transparency backdrop, art, overlay) inside a
  transformed viewport (pan/zoom). Translates pointer input into draw-helper calls.
- `Toolbar.js`, `ColorPanel.js`, `LayersPanel.js`, `EffectsPanel.js`,
  `ShadePanel.js`, `ExportModal.js`, `ImageImportModal.js`, `ProjectGallery.js` — UI.
  LayersPanel actions: add, duplicate, delete, clear (active layer, undoable, confirmed).
- `constants.js` — SCHEMA_VERSION, HISTORY_CAP, STORAGE_KEYS, CANVAS_SIZES,
  DEFAULT_PALETTE, TOOLS, TOOL_ORDER, MIRROR_MODES, EFFECTS, EXPORT_* , brush limits.
- `pxlsModel.js` — factories/validation: createCell/emptyCell/createLayer/
  createLayerFromCells/createProject, cloneCells, getActiveLayer, validateProject, makeId.
- `drawHelpers.js` — pure cell ops: applyBrush, floodFill, line/rect/ellipse points,
  stampPoints, mirrorPoints, collectSelectedPixels, removePixelsAt, pastePixelsAt.
- `renderHelpers.js` — compositeToCanvas (used for editor + PNG export), effects
  (glow pre-pass, dither cross-cell checkerboard, per-cell seeded noise), resolveRgb, drawCheckerboard.
  Noise: each cell stores its own random seed (`effect.seed`) baked at paint time, so grain follows the pixel when moved.
- `exportHelpers.js` — exportPNG (native + integer nearest-neighbour scale), buildSVG/
  exportSVG (rect-per-pixel, crispEdges), exportJSON. User types full filename.
- `imageHelpers.js` — loadImageFile, imageToCells (downsample any-size image,
  contain fit, scale + offset, true colour + alpha per cell).
- `shadingHelpers.js` — shadeColor, applyShading (whole layer), computeShadeRange +
  shadeShiftAt (per-cell brushed shading). Distance-based: near light lighter, far darker.
- `historyHelpers.js` — undo/redo stack (cap 100), per-stroke snapshots of a layer.
- `storageHelpers.js` — localStorage multi-project gallery (`pxls:projects`, `pxls:lastOpenId`).
- `page.module.css` — all layout + scoped accent vars.

## Tools (TOOL_ORDER in constants.js)

pencil(B), eraser(E), eyedropper(I), fill(G), line(L), rect(R), ellipse(O),
select(V), effects(F), shade(S). Brush size 1-8, mirror none/x/y/both (green axis
lines on canvas). Undo Ctrl+Z, redo Ctrl+Y/Ctrl+Shift+Z, export Ctrl+S, `[`/`]` size.

- Select: marquee selects only active pixels (silhouette outline); grab to float +
  move; commits to the layer only when you click off (or switch tools).
- Shade: draggable on-canvas light source. Unlocked = drag the light. Lock light =
  brush shading onto pixels. "Apply to layer" bakes whole-layer shading. Baked into
  cell colours, undoable.

## Canvas interaction

- Pan: hold right-click + drag. Zoom: scroll (toward cursor, 1x-40x). Reset view button.
- Pan/zoom is a CSS transform on the stage; pointer→cell mapping uses
  getBoundingClientRect so it stays correct at any zoom/pan.
- No grey grid (removed; it obscured large canvases). Brush outline follows the cursor.

## Export

PNG (lossless, integer nearest-neighbour upscale; effects optionally baked), SVG,
JSON (re-importable). Backgrounds: white / black / transparent. Verified pixel-perfect.

## Testing approach used so far

No test framework in the repo. Features were verified with a throwaway headless
Puppeteer script (`npm install puppeteer --no-save`, drive `/pxls`, assert canvas
pixels / DOM), then removed. Note: synthetic pointer events need small delays
between them (React re-renders between real events) and `setPointerCapture` is
wrapped in try/catch for synthetic pointers.

## Status

Live in main nav and on `/apps`. Particles 3D and Spin Wheel are temporarily
archived (commented out in `app/apps/page.js`; routes still work). PXLS is featured
in Selected Work on the home page.
