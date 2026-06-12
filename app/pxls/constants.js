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

export const TOOLS = {
  pencil: { id: 'pencil', name: 'Pencil', shortcut: 'B' },
  eraser: { id: 'eraser', name: 'Eraser', shortcut: 'E' },
  eyedropper: { id: 'eyedropper', name: 'Eyedropper', shortcut: 'I' },
  fill: { id: 'fill', name: 'Fill', shortcut: 'G' },
  line: { id: 'line', name: 'Line', shortcut: 'L' },
  rect: { id: 'rect', name: 'Rectangle', shortcut: 'R' },
  ellipse: { id: 'ellipse', name: 'Ellipse', shortcut: 'O' },
  move: { id: 'move', name: 'Move', shortcut: 'M' },
  effects: { id: 'effects', name: 'Effects', shortcut: 'F' },
  shade: { id: 'shade', name: 'Shade', shortcut: 'S' },
};

export const TOOL_ORDER = [
  'pencil', 'eraser', 'eyedropper', 'fill',
  'line', 'rect', 'ellipse', 'move', 'effects', 'shade',
];

export const MIRROR_MODES = ['none', 'x', 'y', 'both'];

export const EFFECTS = {
  glow: { id: 'glow', name: 'Glow', desc: 'A soft luminance halo around the cell.' },
  dither: { id: 'dither', name: 'Dither', desc: 'Checker blend with the neighbour cell.' },
  noise: { id: 'noise', name: 'Noise', desc: 'Subtle per render colour jitter.' },
};

export const EFFECT_ORDER = ['glow', 'dither', 'noise'];

export const EXPORT_BACKGROUNDS = {
  transparent: { id: 'transparent', name: 'Transparent', color: null },
  white: { id: 'white', name: 'White', color: '#ffffff' },
  black: { id: 'black', name: 'Black', color: '#000000' },
};

export const EXPORT_FORMATS = {
  png: { id: 'png', name: 'PNG', ext: 'png' },
  svg: { id: 'svg', name: 'SVG', ext: 'svg' },
  json: { id: 'json', name: 'JSON', ext: 'json' },
};

export const EXPORT_SCALES = [1, 2, 4, 8, 16, 32];

export const MIN_BRUSH = 1;
export const MAX_BRUSH = 8;
