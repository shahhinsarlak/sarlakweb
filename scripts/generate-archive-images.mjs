/**
 * Generate the Archive document scans with Google "nano-banana"
 * (Gemini 2.5 Flash Image) and write them to public/archive/<id>.png.
 *
 * One-time setup:
 *   npm install --save-dev @google/genai
 *   export GEMINI_API_KEY=your_key_here   (get one at https://aistudio.google.com/apikey)
 *
 * Run:
 *   npm run generate:archive                 # generate any missing images
 *   npm run generate:archive -- --force      # regenerate all
 *   npm run generate:archive -- glitched eye # regenerate only these ids
 *
 * The PNGs are static assets — commit them. The game reads /archive/<id>.png at
 * runtime; nothing here runs in the browser and no key ships to the client.
 */

import fs from 'node:fs';
import path from 'node:path';
import { ARCHIVE_IMAGE_STYLE, ARCHIVE_IMAGE_PROMPTS } from './archive-image-prompts.mjs';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY. export GEMINI_API_KEY=... and retry.');
  process.exit(1);
}

let GoogleGenAI;
try {
  ({ GoogleGenAI } = await import('@google/genai'));
} catch {
  console.error('Missing dependency. Run: npm install --save-dev @google/genai');
  process.exit(1);
}

const MODEL = process.env.ARCHIVE_IMAGE_MODEL || 'gemini-2.5-flash-image';
const outDir = path.join(process.cwd(), 'public', 'archive');
fs.mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyIds = args.filter((a) => !a.startsWith('--'));

const ai = new GoogleGenAI({ apiKey });

const entries = Object.entries(ARCHIVE_IMAGE_PROMPTS).filter(
  ([id]) => onlyIds.length === 0 || onlyIds.includes(id)
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let made = 0;
let skipped = 0;
let failed = 0;

for (const [id, prompt] of entries) {
  const outPath = path.join(outDir, `${id}.png`);
  if (fs.existsSync(outPath) && !force && onlyIds.length === 0) {
    skipped++;
    continue;
  }

  const fullPrompt = `${ARCHIVE_IMAGE_STYLE}\n\n${prompt}`;
  process.stdout.write(`  ${id} ... `);
  try {
    const res = await ai.models.generateContent({ model: MODEL, contents: fullPrompt });
    const parts = res?.candidates?.[0]?.content?.parts || [];
    const image = parts.find((p) => p.inlineData?.data);
    if (!image) {
      console.log('no image returned');
      failed++;
    } else {
      fs.writeFileSync(outPath, Buffer.from(image.inlineData.data, 'base64'));
      console.log('ok');
      made++;
    }
  } catch (err) {
    console.log(`ERROR ${err.message || err}`);
    failed++;
  }
  await sleep(1500); // gentle pacing for rate limits
}

console.log(`\nDone. ${made} generated, ${skipped} skipped (already exist), ${failed} failed.`);
console.log(`Output: ${path.relative(process.cwd(), outDir)}/`);
