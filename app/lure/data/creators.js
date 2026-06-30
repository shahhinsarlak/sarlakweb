// Seed creators. Each creator owns a voice profile that the audio generator
// turns into SSML. With only two installed SAPI voices (Zira en-US, Hazel
// en-GB) we lean on pitch and rate to give each creator a distinct timbre.
// This is a prototype stand-in: real neural voices are a documented upgrade.

export const CREATORS = [
  {
    id: 'cr_vane',
    name: 'Marlow Vane',
    handle: '@marlowvane',
    category: 'horror',
    bio: 'Bedtime stories for people who sleep with the lights on.',
    voice: { name: 'Microsoft Zira Desktop', pitch: '-25%', rate: '-8%' },
  },
  {
    id: 'cr_quill',
    name: 'Orla Quill',
    handle: '@orlaquill',
    category: 'stories',
    bio: 'Small stories with a turn at the end.',
    voice: { name: 'Microsoft Hazel Desktop', pitch: '-6%', rate: '-4%' },
  },
  {
    id: 'cr_byte',
    name: 'Dev Rao',
    handle: '@thedailybyte',
    category: 'explainers',
    bio: 'One surprising true thing a day.',
    voice: { name: 'Microsoft Zira Desktop', pitch: '+12%', rate: '+9%' },
  },
  {
    id: 'cr_margin',
    name: 'The Margin',
    handle: '@themargin',
    category: 'books',
    bio: 'First pages of books worth finishing.',
    voice: { name: 'Microsoft Hazel Desktop', pitch: '-2%', rate: '-6%' },
  },
  {
    id: 'cr_meter',
    name: 'Saoirse Meter',
    handle: '@saoirsemeter',
    category: 'poetry',
    bio: 'A poem to say out loud.',
    voice: { name: 'Microsoft Hazel Desktop', pitch: '+4%', rate: '-14%' },
  },
  {
    id: 'cr_north',
    name: 'Theo North',
    handle: '@theonorth',
    category: 'selfhelp',
    bio: 'Small pushes, no shouting.',
    voice: { name: 'Microsoft Zira Desktop', pitch: '+6%', rate: '+4%' },
  },
  {
    id: 'cr_still',
    name: 'Wren Stillwater',
    handle: '@wrenstillwater',
    category: 'calm',
    bio: 'Soft landings for loud days.',
    voice: { name: 'Microsoft Hazel Desktop', pitch: '-12%', rate: '-22%' },
  },
  {
    id: 'cr_dryden',
    name: 'Sam Dryden',
    handle: '@samdryden',
    category: 'comedy',
    bio: 'Mildly defeated by everyday objects.',
    voice: { name: 'Microsoft Zira Desktop', pitch: '-6%', rate: '+2%' },
  },
];

export const CREATOR_MAP = Object.fromEntries(
  CREATORS.map((creator) => [creator.id, creator]),
);
