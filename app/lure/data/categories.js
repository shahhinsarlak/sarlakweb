// The eight starter categories for the Lure prototype. Each carries an accent
// colour (used for the card background, the preview ring and labels) and a
// monochrome typographic glyph. No emojis, per the repo ruleset.

export const CATEGORIES = [
  {
    id: 'horror',
    label: 'Horror',
    glyph: '\u2020',
    accent: '#d2476a',
    blurb: 'Short, sharp frights for the lights-off crowd.',
  },
  {
    id: 'stories',
    label: 'Stories',
    glyph: '\u2726',
    accent: '#e0913f',
    blurb: 'Tiny fiction with a turn at the end.',
  },
  {
    id: 'explainers',
    label: 'Explainers',
    glyph: '?',
    accent: '#4f93d8',
    blurb: 'One surprising true thing at a time.',
  },
  {
    id: 'books',
    label: 'Books',
    glyph: '\u2263',
    accent: '#57a98f',
    blurb: 'First pages of books worth finishing.',
  },
  {
    id: 'poetry',
    label: 'Poetry',
    glyph: '\u00b6',
    accent: '#9a7be0',
    blurb: 'A poem to hear out loud.',
  },
  {
    id: 'selfhelp',
    label: 'Self help',
    glyph: '\u2191',
    accent: '#e0a93f',
    blurb: 'Small pushes, no shouting.',
  },
  {
    id: 'calm',
    label: 'Calm',
    glyph: '\u2248',
    accent: '#4fb6c4',
    blurb: 'Soft landings for loud days.',
  },
  {
    id: 'comedy',
    label: 'Comedy',
    glyph: '\u203d',
    accent: '#e06aa6',
    blurb: 'Mildly defeated by everyday life.',
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
);
