# Archive document scans

Generated images for the in-game Archive. Each file is named `<entryId>.png`,
matching an archive entry id in `app/game/constants.js` (e.g. `resignation.png`,
`glitched.png`). `ExamineModal` loads `/archive/<id>.png` and falls back to
text-only if the file is missing, so the game works before these exist.

## Regenerate

Images are produced with Google "nano-banana" (Gemini 2.5 Flash Image) from the
prompts in `scripts/archive-image-prompts.mjs`:

```bash
npm install --save-dev @google/genai
export GEMINI_API_KEY=your_key      # https://aistudio.google.com/apikey
npm run generate:archive            # fills in any missing images
npm run generate:archive -- --force # regenerate everything
npm run generate:archive -- glitched security   # only these ids
```

Commit the resulting `.png` files — they are static assets served at runtime.
