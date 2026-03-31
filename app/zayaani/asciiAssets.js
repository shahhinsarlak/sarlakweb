// app/zayaani/asciiAssets.js

export const HEADS = [
  {
    id: 'head_emo',
    name: 'Emo Boy',
    traits: ['swept bang', 'lip ring', 'dead stare'],
    compact:
`  ////////////
  [==========]
  |/////  [O]|
  | /   ~    |
  |     .    |
  | [_*___]  |
  [==========]`,
    detailed:
`          //////////////////  ///
         ////////////////////  ///
        ///////////////////  /////
       //[==============================]
      ///|//////////////////////////     |
     ////|/////  ////////////////        |
    /////|////   //////////////   [( )]  |
   //////|///    ////////////     [~-~]  |
   //////|//     //////////              |
         |/      ////////    .   .       |
         |        //////      . .        |
         |         ////        .         |
         |          //                   |
         |           /    [ _ * _ _ _ ]  |
         |               [_ _ * _ _ _ _] |
         [==============================]`,
  },
  {
    id: 'head_punk',
    name: 'Punk Girl',
    traits: ['twin mohawk spikes', 'nose stud', 'intense glare'],
    compact:
`    | |  | |
   [|||||||||]
  [==========]
  |[>]    [<]|
  | ^      ^ |
  |    *.*   |
  |   [===]  |
  [==========]`,
    detailed:
`          | /\\  /\\ |
         |/  \\/  \\|
        [|||||||||||||]
       [===============]
       | [>>]     [<<] |
       |   ^^      ^^  |
       |     * . *     |
       |     *.*.*     |
       |    [=======]  |
       [===============]`,
  },
  {
    id: 'head_skater',
    name: 'Skater Dude',
    traits: ['double-brim beanie', 'half-lidded', 'nothing fazes him'],
    compact:
`  [##########]
  [==========]
  |[-]    [-]|
  | ~      ~ |
  |     .    |
  |   [___]  |
  [==========]`,
    detailed:
`  [##############]
  [##############]
  [==============]
  | [-]      [-] |
  |  ~        ~  |
  |       .      |
  |   [_______]  |
  [==============]`,
  },
  {
    id: 'head_scene',
    name: 'Scene Queen',
    traits: ['backcombed poof', 'star eyes', 'raccoon liner'],
    compact:
`((((((((((((((((
(( [==========]
   [==========]
   |[*]    [*]|
   | ^      ^ |
   |     .    |
   |  [o___o] |
   [==========]`,
    detailed:
`(((((((((((((((((((((
((((((((((((((((((((((
 ((( [===============] (((
     [===============]
     | [**]     [**] |
     |   ^       ^   |
     |       .       |
     |   [o_____o]   |
     [===============]`,
  },
];

export const TOPS = [
  {
    id: 'top_hoodie',
    name: 'Oversized Hoodie',
    traits: ['kangaroo pocket', 'drawcord', 'drop shoulder'],
    compact:
` [============]
 |\\ [======] /|
 | \\[HOOD   ]/ |
 |  [======]  |
 |            |
 |  [======]  |
 |  [POCKET]  |
 |  [======]  |
 [============]`,
    detailed:
`  [==================]
  |\\                /|
  | \\   [HOODIE]   / |
  |  [============]  |
  |  |            |  |
  |  |            |  |
  |  [============]  |
  |                  |
  |   [==========]   |
  |   [  POCKET  ]   |
  |   [==========]   |
  [==================]`,
  },
  {
    id: 'top_tee',
    name: 'Plain Tee',
    traits: ['crew neck', 'oversized fit', 'wrinkled hem'],
    compact:
`  [==========]
  |   [====]  |
  |   [    ]  |
  |           |
  |           |
  |  ~~~~~~~~ |
  [==========]`,
    detailed:
`    [==============]
    |    [======]   |
    |    [      ]   |
    |               |
    |               |
    |               |
    |   ~~~~~~~~~~  |
    [==============]`,
  },
  {
    id: 'top_zip',
    name: 'Zip-Up',
    traits: ['center zipper', 'ribbed collar', 'side seam pockets'],
    compact:
`  [==========]
  |  [||||||] |
  |  |      | |
  |  |      | |
  |  [||||||] |
  [==========]`,
    detailed:
`    [==============]
    |  [==========] |
    |  | zipper   | |
    |  | |||||||| | |
    |  | |||||||| | |
    |  | |||||||| | |
    |  [==========] |
    [==============]`,
  },
];

export const PANTS = [
  {
    id: 'pants_jeans',
    name: 'Baggy Jeans',
    traits: ['wide leg', 'coin pocket', 'raw hem'],
    compact:
`   [========]
   | (o)  (o)|
   |         |
  =|         |=
  =|         |=
 [====]  [====]
 |    |  |    |
 [====]  [====]`,
    detailed:
`     [============]
     |  (o)   (o)  |
     |              |
   ==|              |==
   ==|              |==
   --|              |--
  [======]      [======]
  |      |      |      |
  |      |      |      |
  [======]      [======]`,
  },
  {
    id: 'pants_cargo',
    name: 'Cargo Pants',
    traits: ['side cargo pockets', 'utility straps', 'tapered ankle'],
    compact:
`   [========]
   |         |
 [+|  [===]  |+]
 [+|  [CGO]  |+]
   |         |
 [====]  [====]
 |    |  |    |
 [====]  [====]`,
    detailed:
`     [============]
     |              |
 [+++|   [======]   |+++]
 [+++|   [CARGO ]   |+++]
 [+++|   [======]   |+++]
     |              |
  [======]      [======]
  |      |      |      |
  [======]      [======]`,
  },
  {
    id: 'pants_shorts',
    name: 'Shorts',
    traits: ['frayed hem', 'high waist', 'wide cut'],
    compact:
`   [========]
   | (o)  (o)|
   |         |
  =|         |=
   [====][====]`,
    detailed:
`     [============]
     |  (o)   (o)  |
     |              |
   ==|              |==
   --|              |--
   [======][=======]`,
  },
];

export const SHOES = [
  {
    id: 'shoes_chunky',
    name: 'Chunky Sneakers',
    traits: ['/\\/\\ lace pattern', 'platform sole', 'oversized toe'],
    compact:
` [=====] [=====]
 |/\\/\\/| |/\\/\\/|
 [_____] [_____]`,
    detailed:
`  [=========] [=========]
  | /\\/\\/\\/\\ | | /\\/\\/\\/\\ |
  |           | |           |
  [===========] [===========]
  [___________] [___________]`,
  },
  {
    id: 'shoes_boots',
    name: 'Boots',
    traits: ['block heel', 'lace-up shaft', 'square toe'],
    compact:
` [=====] [=====]
 |#####| |#####|
 [#####] [#####]
 [_____] [_____]`,
    detailed:
`  [=========] [=========]
  | |#######| | | |#######| |
  | |#######| | | |#######| |
  | |#######| | | |#######| |
  [===========] [===========]
  [___________] [___________]`,
  },
  {
    id: 'shoes_bare',
    name: 'Bare Feet',
    traits: ['toe spread', 'relaxed stance', 'grounded'],
    compact:
` \\___/   \\___/
  \\-/     \\-/`,
    detailed:
`  \\_______/ \\_______/
   \\  toes /   \\  toes /
    \\_____/     \\_____/`,
  },
];

export const FURNITURE = [
  { id: 'desk',      name: 'Desk',         cost: 200, slot: 'back_left',    ascii: '[___DESK___]' },
  { id: 'lamp',      name: 'Floor Lamp',   cost: 80,  slot: 'back_right',   ascii: '  (\\ /)\n   |||' },
  { id: 'plant',     name: 'Potted Plant', cost: 60,  slot: 'front_right',  ascii: ' @@@\n |||' },
  { id: 'rug',       name: 'Rug',          cost: 150, slot: 'floor_centre', ascii: '[~~~~~~~~~]' },
  { id: 'poster',    name: 'Poster',       cost: 40,  slot: 'back_wall',    ascii: '[POSTER]' },
  { id: 'bookshelf', name: 'Bookshelf',    cost: 300, slot: 'back_right',   ascii: '[|||||||||]' },
];

export const JOBS = [
  { id: 'youtube',    name: 'YouTube Channel',   cps: 2, flavour: 'Upload one video. Monetise forever.' },
  { id: 'twitch',     name: 'Twitch Stream',      cps: 3, flavour: 'Just vibe on camera.' },
  { id: 'etsy',       name: 'Etsy Shop',          cps: 1, flavour: 'Sell the things you made at 2am.' },
  { id: 'freelance',  name: 'Freelance Dev',      cps: 5, flavour: 'Fix their WordPress. Again.' },
  { id: 'dogwalk',    name: 'Dog Walking App',    cps: 1, flavour: "Dogs don't care about deadlines." },
  { id: 'newsletter', name: 'Crypto Newsletter',  cps: 2, flavour: 'Write four sentences. Profit.' },
  { id: 'dropship',   name: 'Dropshipping Store', cps: 2, flavour: "You don't even touch the product." },
  { id: 'podcast',    name: 'Podcast',            cps: 1, flavour: 'Just two guys talking.' },
];
