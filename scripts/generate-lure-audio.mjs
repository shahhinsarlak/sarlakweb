// Regenerates the Lure prototype audio from the seed posts.
//
// Pipeline: each post's transcript becomes SSML (voice + pitch + rate from the
// creator's profile), Windows SAPI renders it to a 16 kHz mono WAV via
// scripts/sapi-synth.ps1, then @breezystack/lamejs encodes a small MP3 into
// public/lure/audio. Run with: npm run generate:lure-audio
//
// SAPI desktop voices are a license-clean prototype stand-in. Swapping in a
// neural TTS, or real LibriVox readings for Books and Poetry, is a later step.

import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import * as lamejs from '@breezystack/lamejs';

import { POSTS } from '../app/lure/data/posts.js';
import { CREATOR_MAP } from '../app/lure/data/creators.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const audioDir = join(root, 'public', 'lure', 'audio');
const tmpDir = join(here, '.lure-tmp');
const ps1Path = join(here, 'sapi-synth.ps1');

function xmlEscape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildSsml(text, voice) {
  return (
    '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">'
    + `<voice name="${voice.name}">`
    + `<prosody pitch="${voice.pitch}" rate="${voice.rate}">${xmlEscape(text)}</prosody>`
    + '</voice></speak>'
  );
}

function parseWav(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('not a RIFF/WAVE file');
  }
  let offset = 12;
  let sampleRate = 16000;
  let dataStart = -1;
  let dataLen = 0;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === 'fmt ') {
      sampleRate = buf.readUInt32LE(offset + 12);
    } else if (id === 'data') {
      dataStart = offset + 8;
      dataLen = size;
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (dataStart < 0) throw new Error('no data chunk');
  const samples = new Int16Array(dataLen / 2);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = buf.readInt16LE(dataStart + i * 2);
  }
  return { sampleRate, samples };
}

function encodeMp3(samples, sampleRate) {
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, 64);
  const blockSize = 1152;
  const chunks = [];
  for (let i = 0; i < samples.length; i += blockSize) {
    const block = samples.subarray(i, i + blockSize);
    const mp3 = encoder.encodeBuffer(block);
    if (mp3.length > 0) chunks.push(Buffer.from(mp3));
  }
  const end = encoder.flush();
  if (end.length > 0) chunks.push(Buffer.from(end));
  return Buffer.concat(chunks);
}

mkdirSync(audioDir, { recursive: true });
rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });

const manifest = POSTS.map((post) => {
  const creator = CREATOR_MAP[post.creatorId];
  if (!creator) throw new Error(`post ${post.id} has unknown creator ${post.creatorId}`);
  const ssmlPath = join(tmpDir, `${post.id}.ssml`);
  const wavPath = join(tmpDir, `${post.id}.wav`);
  writeFileSync(ssmlPath, buildSsml(post.transcript, creator.voice), 'utf8');
  return { id: post.id, ssmlPath, wavPath };
});

const manifestPath = join(tmpDir, 'manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest), 'utf8');

console.log(`Synthesising ${manifest.length} clips with SAPI...`);
execFileSync(
  'powershell',
  ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps1Path, '-ManifestPath', manifestPath],
  { stdio: 'inherit' },
);

console.log('Encoding MP3s...');
let totalKb = 0;
for (const item of manifest) {
  const { sampleRate, samples } = parseWav(readFileSync(item.wavPath));
  const mp3 = encodeMp3(samples, sampleRate);
  writeFileSync(join(audioDir, `${item.id}.mp3`), mp3);
  const kb = mp3.length / 1024;
  totalKb += kb;
  const seconds = samples.length / sampleRate;
  console.log(`  ${item.id.padEnd(20)} ${seconds.toFixed(1)}s  ${kb.toFixed(0)}KB`);
}

rmSync(tmpDir, { recursive: true, force: true });
console.log(`Done. ${manifest.length} clips, ${(totalKb / 1024).toFixed(2)}MB in public/lure/audio`);
