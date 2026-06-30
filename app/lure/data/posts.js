// Seed audio posts for the Lure prototype.
//
// `transcript` is the source of truth: the audio generator voices it with
// SAPI, and the player shows it as the on-screen transcript for accessibility.
// The preview is the first `previewLengthSec` seconds of the same file, so the
// opening sentence of every transcript is written to be the hook.
//
// Books and Poetry use genuine public-domain texts (Melville, Dickens, Shelley,
// Dickinson). The rest are original scripts written for this prototype.

export const POSTS = [
  // ---- Horror ----
  {
    id: 'horror_train',
    title: 'The Last Train',
    creatorId: 'cr_vane',
    category: 'horror',
    audioUrl: '/lure/audio/horror_train.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'You should not have taken the late one.',
    transcript:
      'You should not have taken the last train home tonight. You knew it the moment the '
      + 'doors hissed shut and the carriage went dark, and the only other passenger, the man '
      + 'at the far end, slowly turned his head to face you, though you had not made a sound. '
      + 'He is smiling now. He knows your name. He has been riding this train a very long time, '
      + 'waiting for someone to stay on one stop too far. The next station is yours. '
      + 'And he is standing up.',
    tags: ['horror', 'commute'],
    likeCount: 18420,
    publishedAt: '2026-02-09',
  },
  {
    id: 'horror_sitter',
    title: 'Lock the Doors',
    creatorId: 'cr_vane',
    category: 'horror',
    audioUrl: '/lure/audio/horror_sitter.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'The car was already in the driveway.',
    transcript:
      'The text came at midnight, from the parents, the same three words they always sent '
      + 'when they were on their way back. Lock the doors. Except this time the car was already '
      + 'in the driveway, engine ticking as it cooled, and both front seats were empty. You '
      + 'check the kids. They are asleep, breathing soft and slow. You check the doors. Locked, '
      + 'every one, from the inside. So who, you start to wonder, turned off all the lights '
      + 'upstairs while you were reading this.',
    tags: ['horror', 'classic'],
    likeCount: 9230,
    publishedAt: '2026-02-14',
  },

  // ---- Stories ----
  {
    id: 'stories_lighthouse',
    title: 'The Lighthouse Keeper',
    creatorId: 'cr_quill',
    category: 'stories',
    audioUrl: '/lure/audio/stories_lighthouse.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'Forty years, and never once a ship.',
    transcript:
      'For forty years Anya kept the lighthouse at the edge of the world, and in all that time '
      + 'she never once saw a ship. Every night she climbed the stairs and lit the lamp anyway, '
      + 'because her mother had told her the light was not for the ships you could see, it was '
      + 'for the ones you could not. On the night she finally decided to let the lamp go dark, a '
      + 'single small boat drifted out of the fog, and a child waved up at her, as if it had '
      + 'been following her light for years.',
    tags: ['fiction', 'gentle'],
    likeCount: 12060,
    publishedAt: '2026-02-03',
  },
  {
    id: 'stories_clockmaker',
    title: 'The Clockmaker\u2019s Bargain',
    creatorId: 'cr_quill',
    category: 'stories',
    audioUrl: '/lure/audio/stories_clockmaker.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'He could add time to any life but his own.',
    transcript:
      'The clockmaker could add time to any life, but only by taking it from his own. For most '
      + 'of his years he gave it freely, an hour here for a dying man, a day there for a tired '
      + 'young mother, and he never seemed to mind growing old before his time. When at last he '
      + 'had a single minute left, he spent it winding the great clock in the town square, so '
      + 'that everyone he had ever helped would hear it chime at noon, and know exactly who to '
      + 'thank.',
    tags: ['fiction', 'twist'],
    likeCount: 8740,
    publishedAt: '2026-02-18',
  },

  // ---- Explainers ----
  {
    id: 'explain_honey',
    title: 'Honey Never Spoils',
    creatorId: 'cr_byte',
    category: 'explainers',
    audioUrl: '/lure/audio/explain_honey.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'Three-thousand-year-old honey is still edible.',
    transcript:
      'Here is something strange. Honey is one of the only foods on earth that never spoils. '
      + 'Archaeologists have opened sealed jars in ancient Egyptian tombs, more than three '
      + 'thousand years old, and found the honey inside still perfectly edible. The secret is '
      + 'chemistry. Honey is very low in water and naturally acidic, so bacteria simply cannot '
      + 'grow in it, and bees add an enzyme that makes a tiny amount of hydrogen peroxide. So '
      + 'that jar in your cupboard could, in theory, outlive you by thousands of years.',
    tags: ['science', 'food'],
    likeCount: 24310,
    publishedAt: '2026-02-05',
  },
  {
    id: 'explain_octopus',
    title: 'Three Hearts, Blue Blood',
    creatorId: 'cr_byte',
    category: 'explainers',
    audioUrl: '/lure/audio/explain_octopus.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'How many hearts do you have? An octopus has three.',
    transcript:
      'Quick question. How many hearts do you have? One, obviously. But an octopus has three. '
      + 'Two of them pump blood through the gills, and the third pushes it around the rest of '
      + 'the body. Stranger still, that main heart actually stops beating whenever the octopus '
      + 'swims, which is part of why these animals usually prefer to crawl. Their blood is not '
      + 'red either, it is blue, because it carries oxygen using copper instead of iron. Nature, '
      + 'it turns out, had a lot of other ideas.',
    tags: ['science', 'ocean'],
    likeCount: 15890,
    publishedAt: '2026-02-12',
  },

  // ---- Books (public domain) ----
  {
    id: 'books_moby',
    title: 'Moby-Dick',
    creatorId: 'cr_margin',
    category: 'books',
    audioUrl: '/lure/audio/books_moby.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'Herman Melville, 1851. The opening lines.',
    transcript:
      'Call me Ishmael. Some years ago, never mind how long precisely, having little or no '
      + 'money in my purse, and nothing particular to interest me on shore, I thought I would '
      + 'sail about a little and see the watery part of the world. It is a way I have of driving '
      + 'off the spleen, and regulating the circulation. Whenever I find myself growing grim '
      + 'about the mouth, whenever it is a damp, drizzly November in my soul, then I account it '
      + 'high time to get to sea as soon as I can.',
    tags: ['classic', 'opening'],
    likeCount: 6120,
    publishedAt: '2026-01-28',
  },
  {
    id: 'books_twocities',
    title: 'A Tale of Two Cities',
    creatorId: 'cr_margin',
    category: 'books',
    audioUrl: '/lure/audio/books_twocities.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'Charles Dickens, 1859. The famous first sentence.',
    transcript:
      'It was the best of times, it was the worst of times, it was the age of wisdom, it was '
      + 'the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, '
      + 'it was the season of Light, it was the season of Darkness, it was the spring of hope, '
      + 'it was the winter of despair. We had everything before us, we had nothing before us, '
      + 'we were all going direct to Heaven, we were all going direct the other way.',
    tags: ['classic', 'opening'],
    likeCount: 5440,
    publishedAt: '2026-02-01',
  },

  // ---- Poetry (public domain) ----
  {
    id: 'poetry_ozymandias',
    title: 'Ozymandias',
    creatorId: 'cr_meter',
    category: 'poetry',
    audioUrl: '/lure/audio/poetry_ozymandias.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'Percy Bysshe Shelley, 1818.',
    transcript:
      'I met a traveller from an antique land who said: two vast and trunkless legs of stone '
      + 'stand in the desert. Near them, on the sand, half sunk, a shattered visage lies, whose '
      + 'frown, and wrinkled lip, and sneer of cold command, tell that its sculptor well those '
      + 'passions read which yet survive, stamped on these lifeless things. And on the pedestal '
      + 'these words appear: my name is Ozymandias, King of Kings; look on my works, ye Mighty, '
      + 'and despair. Nothing beside remains.',
    tags: ['classic', 'sonnet'],
    likeCount: 7980,
    publishedAt: '2026-02-08',
  },
  {
    id: 'poetry_hope',
    title: 'Hope Is the Thing With Feathers',
    creatorId: 'cr_meter',
    category: 'poetry',
    audioUrl: '/lure/audio/poetry_hope.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'Emily Dickinson, c. 1861.',
    transcript:
      'Hope is the thing with feathers that perches in the soul, and sings the tune without the '
      + 'words, and never stops at all. And sweetest in the gale is heard; and sore must be the '
      + 'storm that could abash the little bird that kept so many warm. I have heard it in the '
      + 'chillest land, and on the strangest sea; yet, never, in extremity, it asked a crumb '
      + 'of me.',
    tags: ['classic', 'hope'],
    likeCount: 9610,
    publishedAt: '2026-02-16',
  },

  // ---- Self help ----
  {
    id: 'self_twominute',
    title: 'The Two Minute Rule',
    creatorId: 'cr_north',
    category: 'selfhelp',
    audioUrl: '/lure/audio/self_twominute.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'Stop building the wall, two minutes at a time.',
    transcript:
      'If you have been putting something off, try this tonight. The next time a task would '
      + 'take less than two minutes, do it the moment you notice it. Hang up the coat. Answer '
      + 'the message. Rinse the plate. It sounds too small to matter, but the things that '
      + 'overwhelm us are rarely one big task, they are a hundred tiny ones we kept deferring '
      + 'until they piled into a wall. You do not have to climb the wall. You just stop building '
      + 'it, two minutes at a time, starting now.',
    tags: ['habits', 'focus'],
    likeCount: 20140,
    publishedAt: '2026-02-06',
  },
  {
    id: 'self_discomfort',
    title: 'Discomfort Is the Price',
    creatorId: 'cr_north',
    category: 'selfhelp',
    audioUrl: '/lure/audio/self_discomfort.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'Motivation shows up after you begin, not before.',
    transcript:
      'Nobody tells you that motivation is not the thing that gets you started, it is the thing '
      + 'that shows up after you have already begun. So stop waiting to feel ready. Ready is a '
      + 'feeling you earn on the far side of the first hard step, not before it. Whatever you '
      + 'are avoiding because it feels uncomfortable, that discomfort is not a warning sign, it '
      + 'is the entry fee. Pay it once today, in one small action, and watch how quickly the '
      + 'thing shrinks the moment you actually touch it.',
    tags: ['mindset', 'motivation'],
    likeCount: 17350,
    publishedAt: '2026-02-15',
  },

  // ---- Calm ----
  {
    id: 'calm_breathing',
    title: 'Let the Ground Hold You',
    creatorId: 'cr_still',
    category: 'calm',
    audioUrl: '/lure/audio/calm_breathing.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'Nothing to solve for the next few minutes.',
    transcript:
      'Let your shoulders drop a little. There is nothing you need to solve in the next few '
      + 'minutes. Breathe in slowly through your nose, and feel the air fill the very bottom of '
      + 'your lungs, and then let it leave even more slowly than it came. With each breath out, '
      + 'imagine the day loosening its grip, one finger at a time. You are not falling behind by '
      + 'resting. This is the part where you let the ground hold you, and you let everything '
      + 'else, just for now, quietly wait.',
    tags: ['breathing', 'sleep'],
    likeCount: 13770,
    publishedAt: '2026-02-04',
  },
  {
    id: 'calm_shore',
    title: 'The Quiet Shore',
    creatorId: 'cr_still',
    category: 'calm',
    audioUrl: '/lure/audio/calm_shore.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'Let your breathing follow the tide.',
    transcript:
      'Picture a shore at the very end of the evening, when the light has gone soft and gold '
      + 'and the water barely moves. Each small wave arrives without any hurry, touches the '
      + 'sand, and slides back out again. Let your breathing follow it. In, as the wave reaches '
      + 'the shore. Out, as it returns to the sea. There is no next thing here. There is only '
      + 'this slow, patient rhythm, repeating, asking nothing of you, carrying you gently a '
      + 'little further from the noise of the day.',
    tags: ['sleep', 'visualisation'],
    likeCount: 11230,
    publishedAt: '2026-02-17',
  },

  // ---- Comedy ----
  {
    id: 'comedy_assembly',
    title: 'Some Assembly Required',
    creatorId: 'cr_dryden',
    category: 'comedy',
    audioUrl: '/lure/audio/comedy_assembly.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'Fifteen minutes, no tools required. Allegedly.',
    transcript:
      'I bought a bookshelf that promised to be assembled in fifteen minutes, no tools '
      + 'required, and three hours later I was sitting on the floor surrounded by sixty screws, '
      + 'holding a diagram that seemed to have been drawn by someone who had only ever heard a '
      + 'bookshelf described over the phone. Step four simply said, attach part A to part A. '
      + 'There was one part A. I have named it. We live together now. The bookshelf leans, '
      + 'philosophically, against the wall, and we have agreed never to mention the instructions '
      + 'again.',
    tags: ['standup', 'relatable'],
    likeCount: 22680,
    publishedAt: '2026-02-07',
  },
  {
    id: 'comedy_gym',
    title: 'The Gym Membership',
    creatorId: 'cr_dryden',
    category: 'comedy',
    audioUrl: '/lure/audio/comedy_gym.mp3',
    previewStartSec: 0,
    previewLengthSec: 8,
    caption: 'I joined with the confidence of a stranger.',
    transcript:
      'In January I joined a gym with the confidence of a man who has clearly never met '
      + 'himself. I went twice. The treadmill and I had what I would describe as a brief, '
      + 'intense relationship that ended in mutual disappointment. Now I pay a monthly fee for a '
      + 'building I drive past, which the staff there have started to call my donation. My goal '
      + 'this year is smaller, and far more realistic. I would simply like to one day walk in '
      + 'confidently enough that they stop scanning my card as a guest.',
    tags: ['standup', 'newyear'],
    likeCount: 19940,
    publishedAt: '2026-02-19',
  },
];
