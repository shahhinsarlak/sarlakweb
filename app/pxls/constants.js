/**
 * PXLS Constants & Data
 *
 * Core data for the PXLS pixel art editor:
 * - CANVAS_SIZES: available square canvas presets
 * - DEFAULT_PALETTE: fixed starter palette
 * - TOOLS, EFFECTS, EXPORT_BACKGROUNDS, EXPORT_FORMATS
 * - SHORTCUTS: keyboard map
 * - STORAGE_KEYS, SCHEMA_VERSION, HISTORY_CAP
 */

export const SCHEMA_VERSION = 1;
export const HISTORY_CAP = 100;

export const STORAGE_KEYS = {
  projects: 'pxls:projects',
  lastOpenId: 'pxls:lastOpenId',
  swatches: 'pxls:swatches',
  customSwatches: 'pxls:customSwatches',
};

// Square presets only in v1. Model stores width/height separately so non-square
// is a low risk later addition.
export const CANVAS_SIZES = [16, 32, 64, 128];
export const DEFAULT_CANVAS_SIZE = 32;

// Fixed default palette. A compact 32 colour set tuned for classic pixel art.
export const DEFAULT_PALETTE = [
  '#000000', '#1d2b53', '#7e2553', '#008751',
  '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8',
  '#ff004d', '#ffa300', '#ffec27', '#00e436',
  '#29adff', '#83769c', '#ff77a8', '#ffccaa',
  '#ffffff', '#e0e0e0', '#9e9e9e', '#616161',
  '#3a3a3a', '#b71c1c', '#e64a19', '#f9a825',
  '#558b2f', '#00897b', '#1565c0', '#6a1b9a',
  '#ad1457', '#4e342e', '#37474f', '#263238',
];

// Locked, categorised preset swatch groups shown in the Swatches modal. These
// are read-only starting points; users copy or import them but cannot edit them.
// Each colour carries a friendly name so the palette reads like a real set.
export const PREMADE_SWATCH_GROUPS = [
  {
    id: 'gameboy',
    name: 'Game Boy DMG',
    colors: [
      { hex: '#0f380f', name: 'Pine' },
      { hex: '#306230', name: 'Moss' },
      { hex: '#8bac0f', name: 'Fern' },
      { hex: '#9bbc0f', name: 'Lime Rind' },
    ],
  },
  {
    id: 'skin',
    name: 'Skin Tones',
    colors: [
      { hex: '#ffe7d1', name: 'Porcelain' },
      { hex: '#f5cfa6', name: 'Sand' },
      { hex: '#e8b889', name: 'Honey' },
      { hex: '#d29b6e', name: 'Tan' },
      { hex: '#b87a4e', name: 'Caramel' },
      { hex: '#97593a', name: 'Umber' },
      { hex: '#6e3d28', name: 'Chestnut' },
      { hex: '#4a2819', name: 'Espresso' },
    ],
  },
  {
    id: 'foliage',
    name: 'Forest & Foliage',
    colors: [
      { hex: '#d9e8a0', name: 'Lichen' },
      { hex: '#a7c957', name: 'Sage' },
      { hex: '#6a994e', name: 'Fern' },
      { hex: '#386641', name: 'Pine' },
      { hex: '#274029', name: 'Spruce' },
      { hex: '#b08968', name: 'Driftwood' },
      { hex: '#9c6644', name: 'Loam' },
      { hex: '#7f5539', name: 'Bark' },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    colors: [
      { hex: '#caf0f8', name: 'Foam' },
      { hex: '#90e0ef', name: 'Shallows' },
      { hex: '#00b4d8', name: 'Lagoon' },
      { hex: '#0096c7', name: 'Cerulean' },
      { hex: '#0077b6', name: 'Cobalt' },
      { hex: '#023e8a', name: 'Deep' },
      { hex: '#03045e', name: 'Abyss' },
      { hex: '#011536', name: 'Trench' },
    ],
  },
  {
    id: 'sunset',
    name: 'Sunset & Dusk',
    colors: [
      { hex: '#ffd166', name: 'Marigold' },
      { hex: '#ff9f1c', name: 'Tangerine' },
      { hex: '#ff6b35', name: 'Coral' },
      { hex: '#ef476f', name: 'Rose' },
      { hex: '#b5179e', name: 'Plum' },
      { hex: '#7209b7', name: 'Dusk' },
      { hex: '#480ca8', name: 'Twilight' },
      { hex: '#3a0ca3', name: 'Indigo' },
    ],
  },
  {
    id: 'ember',
    name: 'Ember & Fire',
    colors: [
      { hex: '#f8f0e3', name: 'Ash' },
      { hex: '#ffd60a', name: 'Spark' },
      { hex: '#ffba08', name: 'Amber' },
      { hex: '#f48c06', name: 'Flame' },
      { hex: '#e85d04', name: 'Ember' },
      { hex: '#dc2f02', name: 'Blaze' },
      { hex: '#9d0208', name: 'Crimson' },
      { hex: '#370617', name: 'Char' },
    ],
  },
  {
    id: 'pastel',
    name: 'Pastel Dreams',
    colors: [
      { hex: '#fbf8cc', name: 'Butter' },
      { hex: '#fde4cf', name: 'Peach' },
      { hex: '#ffcfd2', name: 'Blush' },
      { hex: '#f1c0e8', name: 'Cotton' },
      { hex: '#cfbaf0', name: 'Lilac' },
      { hex: '#a3c4f3', name: 'Periwinkle' },
      { hex: '#90dbf4', name: 'Sky' },
      { hex: '#b9fbc0', name: 'Mint' },
    ],
  },
  {
    id: 'dungeon',
    name: 'Dungeon Stone',
    colors: [
      { hex: '#e9ecef', name: 'Bone' },
      { hex: '#adb5bd', name: 'Stone' },
      { hex: '#6c757d', name: 'Slate' },
      { hex: '#495057', name: 'Granite' },
      { hex: '#343a40', name: 'Shadow' },
      { hex: '#212529', name: 'Pitch' },
      { hex: '#7f4f24', name: 'Rust' },
      { hex: '#582f0e', name: 'Mire' },
    ],
  },
  {
    id: 'metals',
    name: 'Metals',
    colors: [
      { hex: '#fff3b0', name: 'Platinum' },
      { hex: '#ffd60a', name: 'Gold' },
      { hex: '#e0aa3e', name: 'Brass' },
      { hex: '#cd7f32', name: 'Bronze' },
      { hex: '#b87333', name: 'Copper' },
      { hex: '#c0c0c0', name: 'Silver' },
      { hex: '#8d99ae', name: 'Steel' },
      { hex: '#4a4e69', name: 'Gunmetal' },
    ],
  },
  {
    id: 'candy',
    name: 'Candy & Neon',
    colors: [
      { hex: '#ff5d8f', name: 'Bubblegum' },
      { hex: '#ff2d55', name: 'Cherry' },
      { hex: '#ffe600', name: 'Lemon' },
      { hex: '#aaff00', name: 'Lime' },
      { hex: '#00e5ff', name: 'Aqua' },
      { hex: '#7b2ff7', name: 'Violet' },
      { hex: '#ff00e5', name: 'Magenta' },
      { hex: '#ff7a00', name: 'Tangelo' },
    ],
  },
];

export const TOOLS = {
  pencil: { id: 'pencil', name: 'Pencil', shortcut: 'B' },
  eraser: { id: 'eraser', name: 'Eraser', shortcut: 'E' },
  eyedropper: { id: 'eyedropper', name: 'Eyedropper', shortcut: 'I' },
  fill: { id: 'fill', name: 'Fill', shortcut: 'G' },
  line: { id: 'line', name: 'Line', shortcut: 'L' },
  rect: { id: 'rect', name: 'Rectangle', shortcut: 'R' },
  ellipse: { id: 'ellipse', name: 'Ellipse', shortcut: 'O' },
  select: { id: 'select', name: 'Select', shortcut: 'V' },
  effects: { id: 'effects', name: 'Effects', shortcut: 'F' },
  shade: { id: 'shade', name: 'Shade', shortcut: 'S' },
};

export const TOOL_ORDER = [
  'pencil', 'eraser', 'eyedropper', 'fill',
  'line', 'rect', 'ellipse', 'select', 'effects', 'shade',
];

export const MIRROR_MODES = ['none', 'x', 'y', 'both'];

export const EFFECTS = {
  dither: { id: 'dither', name: 'Dither', desc: 'Checker blend with the neighbour cell.' },
  noise: { id: 'noise', name: 'Noise', desc: 'Subtle per render colour jitter.' },
};

export const EFFECT_ORDER = ['dither', 'noise'];

export const EXPORT_BACKGROUNDS = {
  transparent: { id: 'transparent', name: 'Transparent', color: null },
  white: { id: 'white', name: 'White', color: '#ffffff' },
  black: { id: 'black', name: 'Black', color: '#000000' },
};

export const EXPORT_FORMATS = {
  png: { id: 'png', name: 'PNG', ext: 'png' },
  gif: { id: 'gif', name: 'GIF', ext: 'gif' },
  svg: { id: 'svg', name: 'SVG', ext: 'svg' },
  json: { id: 'json', name: 'JSON', ext: 'json' },
};

export const EXPORT_SCALES = [1, 2, 4, 8, 16, 32];

export const MIN_BRUSH = 1;
export const MAX_BRUSH = 8;

// Animation playback. fps is stored per project; frames advance at 1000/fps ms.
export const DEFAULT_FPS = 8;
export const MIN_FPS = 1;
export const MAX_FPS = 30;
