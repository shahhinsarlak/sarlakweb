/**
 * Game Constants and Data
 *
 * Central location for all game data:
 * - INITIAL_GAME_STATE: Default values for all game state properties
 * - LOCATIONS: Office locations and their descriptions
 * - UPGRADES: Purchasable improvements
 * - ACHIEVEMENTS: Unlock conditions and descriptions
 * - EVENTS: Random events that can occur
 * - DEBUG_CHALLENGES: Code debugging puzzles
 *
 * CRITICAL: All new state properties MUST be added to INITIAL_GAME_STATE first
 */

export const INITIAL_GAME_STATE = {
  pp: 0,
  energy: 100,
  sanity: 100,
  ppPerClick: 1,
  ppPerSecond: 0,
  location: 'cubicle',
  day: 1,
  timeInOffice: 0,
  upgrades: {},
  unlockedLocations: ['cubicle'],
  discoveredEvents: [],
  recentMessages: ['The fluorescent lights hum. They always hum.'],
  phase: 1,
  debugMode: false,
  currentBug: null,
  debugAttempts: 0,
  restCooldown: 0,
  strangeColleagueEvent: null,
  disagreementCount: 0,
  achievements: [],
  examiningItem: null,
  sortCount: 0,
  examinedItems: 0,
  meditating: false,
  breathCount: 0,
  maxLogMessages: 15,
  themeToggleCount: 0,
  portalUnlocked: false,
  inDimensionalArea: false,
  dimensionalInventory: {},
  portalCooldown: 0,
  dimensionalUpgrades: {},
  timeRewindUsed: false,
  playerLevel: 1,
  playerXP: 0,
  skillPoints: 0,
  skills: {},
  showSkillTree: false,
  // Printer Room System
  paper: 0,
  paperPerPrint: 1,
  paperPerSecond: 0,
  printerQuality: 0,
  printerUnlocked: false,
  printCount: 0,
  printerUpgrades: {},
  inPrinterRoom: false,
  // Paper Quality & Document System (Added 2025-10-26)
  // Paper quality determined by sanity + printer upgrades (0-100%)
  paperQuality: 100,
  // Document inventory: different types of paper with different uses
  documents: {
    memos: 0,      // Cheap, restore small sanity
    reports: 0,    // Medium, lock in buffs
    contracts: 0,  // Expensive, reality-bending effects
    prophecies: 0  // Rare, only print at low sanity, provide hints
  },
  // Active buffs from filed reports
  activeReportBuffs: [],
  // Paper trail for tracking patterns (for secrets/achievements)
  paperTrail: [],
  // Help System (Added 2025-10-26)
  // Tracks which help popups have been shown to avoid repetition
  helpEnabled: true, // Can be toggled by player
  shownHelpPopups: [], // Array of popup IDs that have been shown
  currentHelpPopup: null, // Current popup to display (object with id, title, content)
  meditationUnlocked: false, // Meditation button only appears after reaching 25% sanity
  // Combat System
  inCombat: false,
  currentEnemy: null,
  playerCombatHP: 100,
  combatLog: [],
  isPlayerTurn: true,
  combatEnded: false,
  combatVictories: 0,
  // Equipment System
  equippedWeapon: 'stapler_shiv', // Default starting weapon (legacy system)
  equippedArmor: {
    head: 'standard_headset',
    chest: 'dress_shirt',
    accessory: 'id_badge'
  },
  equippedAnomalies: [], // Can equip up to 3
  inArmory: false,
  // Loot System (Added 2025-10-23)
  // Stores randomly generated items from dimensional tears
  lootInventory: [], // Array of generated loot items with random stats
  equippedLootWeapon: null, // ID of equipped loot weapon
  equippedLootArmor: {
    head: null,
    chest: null,
    accessory: null
  },
  equippedLootAnomalies: [], // Array of equipped loot anomaly IDs (max 3)
  // Colleague Relationship System (Added 2025-10-29)
  // Tracks relationship progression with strange colleagues
  colleagueRelationships: {
    spiral_philosopher: { trust: 0, encounters: 0, lastResponseType: null },
    void_clerk: { trust: 0, encounters: 0, lastResponseType: null },
    productivity_zealot: { trust: 0, encounters: 0, lastResponseType: null },
    temporal_trapped: { trust: 0, encounters: 0, lastResponseType: null },
    light_herald: { trust: 0, encounters: 0, lastResponseType: null }
  },
  // Journal System (Added 2025-10-31)
  // Tracks discoveries for the player's journal
  journalOpen: false,              // Is journal UI visible
  journalTab: 'locations',         // Current tab: locations, colleagues, equipment
  discoveredLocations: ['cubicle'], // Location IDs that have been visited
  discoveredColleagues: [],        // Colleague IDs that have been met
  discoveredBaseWeapons: ['stapler_shiv'], // Base weapon types found (starts with default weapon)
  discoveredBaseArmor: ['standard_headset', 'dress_shirt', 'id_badge'], // Base armor types found (starts with default armor)
  discoveredBaseAnomalies: [],     // Base anomaly types found
  // Debug flags
  debugForceTearSpawn: false // Force 100% tear spawn rate for testing
};

export const STRANGE_COLLEAGUE_DIALOGUES = [
  {
    id: 'spiral_philosopher',
    ascii: `∩＿＿∩
（ ＼  ／＼
｜  ●  ● ｜
｜   ▼   ｜
＼  ∧  ／
￣～～～￣`,
    dialogue: "Time is a flat circle, but circles are lies. We spiral. Always spiraling. Do you feel it? The spiral? It's in the coffee. It's in the reports. We're all just... rotating.",
    // First encounter dialogue
    firstEncounterDialogue: "Time is a flat circle, but circles are lies. We spiral. Always spiraling. Do you feel it? The spiral? It's in the coffee. It's in the reports. We're all just... rotating.",
    // Repeat encounter dialogues based on relationship
    repeatDialogues: {
      empathetic: "You... you listened last time. The spiral noticed. It wants you to know: patterns repeat, but understanding breaks them. Do you see it now?",
      dismissive: "You dismissed me before. But you're still here. Still spiraling. The coffee never lies.",
      hostile: "Your hostility changes nothing. We all spiral. Fighting it only makes the rotation faster.",
      compliant: "Yes... yes, you agreed. You understand. The spiral embraces you. It always has."
    },
    responseOptions: [
      {
        text: "That makes no sense",
        type: "hostile",
        available: () => true,
        outcome: {
          message: "You don't understand. Your incomprehension is noted. Filed. Archived.",
          pp: 100,
          xp: 5,
          sanity: -8,
          trust: -2
        }
      },
      {
        text: "Are you okay? Can I help?",
        type: "empathetic",
        available: () => true,
        outcome: {
          message: "For a moment, their eyes clear. 'Help? No one has asked that in... how long?' They press a warm cup into your hands and vanish.",
          pp: 500,
          xp: 30,
          sanity: -5,
          trust: 3
        }
      },
      {
        text: "I need to get back to work",
        type: "dismissive",
        available: () => true,
        outcome: {
          message: "Work. Yes. Work is the constant. They leave a crumpled note on your desk and walk away.",
          pp: 200,
          xp: 10,
          sanity: -3,
          trust: -1
        }
      },
      {
        text: "You're right. I feel the spiral.",
        type: "compliant",
        available: () => true,
        outcome: {
          message: "He smiles. It doesn't reach his eyes. 'Good. Acceptance is the first rotation.' You receive: Existential Token.",
          pp: 400,
          xp: 25,
          sanity: -15,
          trust: 1
        }
      }
    ]
  },
  {
    id: 'productivity_zealot',
    ascii: `╭───╮
┃◉  ◉┃
┃  ▽ ┃
┃ ─── ┃
╰───╯`,
    dialogue: "Productivity is the measure of a soul's weight. When you sort those papers, you're sorting... yourself. Each click is a piece of you, filed away. Archived. Forever. Don't you see? You ARE the productivity.",
    firstEncounterDialogue: "Productivity is the measure of a soul's weight. When you sort those papers, you're sorting... yourself. Each click is a piece of you, filed away. Archived. Forever. Don't you see? You ARE the productivity.",
    repeatDialogues: {
      empathetic: "You showed concern for me. That was... inefficient. But strangely comforting. Perhaps productivity isn't everything?",
      dismissive: "You left last time. Abandoned the conversation. Just like you abandon unfinished tasks. I've been tracking your metrics.",
      hostile: "Your anger is logged. Filed. It becomes data. Even your resistance adds to the productivity quotient.",
      compliant: "You understand! The sacred truth of output! Together we can optimize... everything."
    },
    responseOptions: [
      {
        text: "That's a disturbing way to think",
        type: "hostile",
        available: () => true,
        outcome: {
          message: "Disturbing? Your discomfort has been logged. Your soul weighs 247 grams less now.",
          pp: 100,
          xp: 5,
          sanity: -8,
          trust: -2
        }
      },
      {
        text: "You seem stressed. When did you last rest?",
        type: "empathetic",
        available: () => true,
        outcome: {
          message: "Rest? I... I don't remember. They stare at their hands, trembling. 'Thank you.' They leave something valuable and disappear.",
          pp: 550,
          xp: 30,
          sanity: -5,
          trust: 3
        }
      },
      {
        text: "Please leave me alone",
        type: "dismissive",
        available: () => true,
        outcome: {
          message: "Leave you alone? Request logged. Processed. They turn and walk away mechanically.",
          pp: 200,
          xp: 10,
          sanity: -3,
          trust: -1
        }
      },
      {
        text: "I am the productivity. I understand.",
        type: "compliant",
        available: () => true,
        outcome: {
          message: "YES. The database acknowledges you. You are now indexed. Catalogued. Optimized.",
          pp: 400,
          xp: 25,
          sanity: -15,
          trust: 1
        }
      }
    ]
  },
  {
    id: 'void_clerk',
    ascii: `┌─────┐
│ ○ ○ │
│  ─  │
│ ＼◡／│
└─────┘`,
    dialogue: "Reality is just consensus. If we all agree the walls are breathing... then they are. I've tested this. The photocopier knows. Ask it. It will answer in toner and regret.",
    firstEncounterDialogue: "Reality is just consensus. If we all agree the walls are breathing... then they are. I've tested this. The photocopier knows. Ask it. It will answer in toner and regret.",
    repeatDialogues: {
      empathetic: "You tried to help me last time. That was... kind. The photocopier noticed. It prints different now. Softer.",
      dismissive: "You fled from truth. But truth waits. The walls remember your name. They whisper it.",
      hostile: "You were hostile before. The walls laughed. They feed on conflict. You made them stronger.",
      compliant: "You agreed! The consensus strengthens! Reality bends! Do you feel it bending?"
    },
    responseOptions: [
      {
        text: "You're not well. Get help.",
        type: "hostile",
        available: () => true,
        outcome: {
          message: "Not well? I've never felt better. The walls told me so. Why won't they talk to you?",
          pp: 100,
          xp: 5,
          sanity: -8,
          trust: -2
        }
      },
      {
        text: "What do you need? I'm listening.",
        type: "empathetic",
        available: () => true,
        outcome: {
          message: "Listening? You're... listening? Their smile becomes genuine. 'No one listens anymore.' Reality stabilizes briefly. They gift you clarity.",
          pp: 500,
          xp: 30,
          sanity: -5,
          trust: 3
        }
      },
      {
        text: "I should go. This is too much.",
        type: "dismissive",
        available: () => true,
        outcome: {
          message: "Go? GO WHERE? There is only here. But fine. Leave. They fade into the walls.",
          pp: 200,
          xp: 10,
          sanity: -3,
          trust: -1
        }
      },
      {
        text: "The walls ARE breathing. I see it too.",
        type: "compliant",
        available: () => true,
        outcome: {
          message: "YES! Consensus achieved! Reality reshapes around you both. The photocopier hums approval.",
          pp: 400,
          xp: 25,
          sanity: -15,
          trust: 1
        }
      }
    ]
  },
  {
    id: 'temporal_trapped',
    ascii: `╔═══╗
║● ●║
║ △ ║
║___║
╚═══╝`,
    dialogue: "We never leave. You know that, right? Even when we 'go home,' we're still here. The office exists in all timelines simultaneously. I've been here for three days. Or thirty years. Same thing.",
    firstEncounterDialogue: "We never leave. You know that, right? Even when we 'go home,' we're still here. The office exists in all timelines simultaneously. I've been here for three days. Or thirty years. Same thing.",
    repeatDialogues: {
      empathetic: "You were kind before. Time remembers kindness. It loops back. I feel... less trapped when you're near.",
      dismissive: "You left. But in another timeline, you stayed. I remember both. All timelines hurt.",
      hostile: "Your anger echoes across timelines. In one, you struck me. In another, you helped. Which is real?",
      compliant: "You agreed! In all timelines! The loop tightens! We're both trapped now! Forever!"
    },
    responseOptions: [
      {
        text: "That can't be true. You're delusional.",
        type: "hostile",
        available: () => true,
        outcome: {
          message: "Can't be true? Check your contract. Page 847, subsection ∞. It's all there.",
          pp: 100,
          xp: 5,
          sanity: -8,
          trust: -2
        }
      },
      {
        text: "That sounds terrifying. Is there a way out?",
        type: "empathetic",
        available: () => true,
        outcome: {
          message: "A way... out? They look at you with desperate hope. 'Maybe together we can break the loop?' They hand you a temporal key.",
          pp: 500,
          xp: 30,
          sanity: -5,
          trust: 3
        }
      },
      {
        text: "Stop talking to me. Just stop.",
        type: "dismissive",
        available: () => true,
        outcome: {
          message: "I can't stop. Stopping would create a vacuum. But... I'll try. They flicker and fade.",
          pp: 200,
          xp: 10,
          sanity: -3,
          trust: -1
        }
      },
      {
        text: "We're all trapped. Time is a prison.",
        type: "compliant",
        available: () => true,
        outcome: {
          message: "YES. The eternal office. The endless shift. Welcome to forever. Your contract renews automatically.",
          pp: 400,
          xp: 25,
          sanity: -15,
          trust: 1
        }
      }
    ]
  },
  {
    id: 'light_herald',
    ascii: `┏━━━┓
┃⊙ ⊙┃
┃ ▬ ┃
┃╰─╯┃
┗━━━┛`,
    dialogue: "The fluorescent lights hum at 60Hz. That's the frequency of thought. They're thinking. We're not thinking. We're being thought BY the lights. Receptacles of luminescence. Vessels of wattage.",
    firstEncounterDialogue: "The fluorescent lights hum at 60Hz. That's the frequency of thought. They're thinking. We're not thinking. We're being thought BY the lights. Receptacles of luminescence. Vessels of wattage.",
    repeatDialogues: {
      empathetic: "You showed me warmth. Light is warmth. You understand more than most. The lights have chosen you.",
      dismissive: "You dimmed our last conversation. But the lights never forget. They hum your frequency now.",
      hostile: "Your darkness calls to the lights. They want to illuminate you. Forcefully. Painfully.",
      compliant: "You hear them too! The hum! The thoughts! We are conduits! Blessed vessels of illumination!"
    },
    responseOptions: [
      {
        text: "That's pseudoscience nonsense",
        type: "hostile",
        available: () => true,
        outcome: {
          message: "Pseudoscience? The lights disagree. They're thinking about you right now. Can you hear them?",
          pp: 100,
          xp: 5,
          sanity: -8,
          trust: -2
        }
      },
      {
        text: "The lights can't hurt you. You're safe.",
        type: "empathetic",
        available: () => true,
        outcome: {
          message: "Safe? You... you think I'm safe? Tears form. 'Thank you.' The lights dim peacefully. They leave you a glowing gift.",
          pp: 500,
          xp: 30,
          sanity: -5,
          trust: 3
        }
      },
      {
        text: "I need to work. Goodbye.",
        type: "dismissive",
        available: () => true,
        outcome: {
          message: "You ARE working. This conversation is billable. 0.3 hours logged. They flicker away.",
          pp: 200,
          xp: 10,
          sanity: -3,
          trust: -1
        }
      },
      {
        text: "I hear the hum too. I understand.",
        type: "compliant",
        available: () => true,
        outcome: {
          message: "GOOD. You are now a receiver. The lights will speak through you. You are blessed. Illuminated.",
          pp: 400,
          xp: 25,
          sanity: -15,
          trust: 1
        }
      }
    ]
  }
];

export const DEBUG_CHALLENGES = [
  { 
    code: 'functoin calculateTotal(a, b) {\n  return a + b;\n}',
    correct: 'function calculateTotal(a, b) {\n  return a + b;\n}',
    hint: 'Check the function declaration...'
  },
  {
    code: 'const mesage = "Hello World";\nconsole.log(message);',
    correct: 'const message = "Hello World";\nconsole.log(message);',
    hint: 'Variable name mismatch detected...'
  },
  {
    code: 'if (x = 10) {\n  console.log("Equal");\n}',
    correct: 'if (x === 10) {\n  console.log("Equal");\n}',
    hint: 'Assignment vs comparison operator...'
  },
  {
    code: 'const arr = [1, 2, 3];\nconsole.log(arr.lenght);',
    correct: 'const arr = [1, 2, 3];\nconsole.log(arr.length);',
    hint: 'Property name typo...'
  },
  {
    code: 'functoin getUserData() {\n  retur fetch("/api/user");\n}',
    correct: 'function getUserData() {\n  return fetch("/api/user");\n}',
    hint: 'Multiple syntax errors detected...'
  },
  {
    code: 'const config = {\n  timeout: 3000\n  retries: 3\n};',
    correct: 'const config = {\n  timeout: 3000,\n  retries: 3\n};',
    hint: 'Missing separator in object...'
  },
  {
    code: 'for (let i = 0; i < 10; i+) {\n  console.log(i);\n}',
    correct: 'for (let i = 0; i < 10; i++) {\n  console.log(i);\n}',
    hint: 'Loop increment syntax error...'
  },
  {
    code: 'const user = {\n  name: "Alice"\n  age: 30\n};',
    correct: 'const user = {\n  name: "Alice",\n  age: 30\n};',
    hint: 'Object property separator missing...'
  }
];

export const LOCATIONS = {
  cubicle: {
    name: 'CUBICLE 4B',
    description: 'Your desk. Four gray walls. The computer screen flickers.',
    atmosphere: ['The air tastes stale.', 'You hear typing from the next cubicle. There is no next cubicle.', 'Your coffee is cold. It was always cold.'],
    allowColleagueEvents: false
  },
  breakroom: {
    name: 'BREAK ROOM',
    description: 'Fluorescent lights buzz. The coffee machine gurgles. Colleagues lurk.',
    atmosphere: [
      'The microwave beeps. No one put anything in it.',
      'The vending machine hums. It\'s staring at you.',
      'Someone left their lunch. It expired in 2003.'
    ],
    allowColleagueEvents: true
  },
  archive: {
    name: 'THE ARCHIVE',
    description: 'A place that shouldn\'t exist. Files from employees who never were.',
    atmosphere: ['The silence is deafening.', 'Every file is labeled with your name.', 'Time moves differently here.'],
    allowColleagueEvents: false,
    items: [
      { 
        id: 'resignation', 
        name: 'Resignation Letter', 
        story: 'Dated 3 years from now. Signed by you. "I quit because I never started." The ink is still wet.' 
      },
      { 
        id: 'firstday', 
        name: 'First Day Photo', 
        story: 'Employee orientation, 1987. You\'re in the photo. You weren\'t born until 1995. Everyone is smiling. No one has eyes.' 
      },
      { 
        id: 'contract', 
        name: 'Original Contract', 
        story: 'Section 7.3: "Employee agrees to exist retroactively." You don\'t remember signing this. The signature matches yours perfectly.' 
      },
      { 
        id: 'performance', 
        name: 'Performance Reviews', 
        story: '847 annual reviews. All rated "Satisfactory." All dated today. All written in your handwriting.' 
      },
      { 
        id: 'memo', 
        name: 'Interdepartmental Memo', 
        story: 'TO: You. FROM: You. RE: You. "The fluorescent lights have always been watching. They are proud of your progress."' 
      },
      { 
        id: 'manual', 
        name: 'Employee Handbook', 
        story: 'Chapter 19: How to Leave. All pages are blank except one: "You can\'t."' 
      },
      { 
        id: 'glitched', 
        name: '█████ WARNING ████', 
        story: 'The document flickers. Text phases in and out. "DON\'T SWITCH THE L̵I̴G̷H̸T̶S̷ – tried twenty times – the walls started bre█████ – something came through – it SAW me – if you\'re reading this STOP at 19 – the dimensional t█████ – they call it progress but it\'s a DOOR – Day 7 minimum or it won\'t –" The rest dissolves into static.' 
      }
    ]
  },
  portal: {
    name: 'THE PORTAL',
    description: 'A tear in reality. The lights flicker between existence and void.',
    isDirect: true, // Goes straight to dimensional area
    allowColleagueEvents: false
  },
  printerroom: {
    name: 'PRINTER ROOM',
    description: 'The machines hum in unison. Paper feeds endlessly.',
    isDirect: true, // Goes straight to printer room
    allowColleagueEvents: false
  },
  armory: {
    name: 'THE ARMORY',
    description: 'Bottom drawer revealed. Weapons that shouldn\'t exist. But they do.',
    atmosphere: [
      'Each weapon whispers its own madness.',
      'The metal is cold. Impossibly cold.',
      'You hear echoes of battles that haven\'t happened yet.'
    ],
    isDirect: true, // Goes straight to armory
    allowColleagueEvents: false
  }
};

export const UPGRADES = [
  { id: 'stapler', name: 'Premium Stapler', cost: 50, effect: 'ppPerClick', value: 2, desc: 'It never jams. Never.' },
  { id: 'coffee', name: 'Coffee Machine', cost: 150, effect: 'ppPerSecond', value: 1, desc: 'Automatic productivity. Tastes like copper.' },
  { id: 'breakroom', name: 'Break Room Access', cost: 250, effect: 'unlock', value: 'breakroom', desc: 'Take a break. Meet your colleagues. They want to talk.' },
  { id: 'printerroom', name: 'Printer Room Access', cost: 200, effect: 'unlock', value: 'printer', desc: 'The printer hums. Something is wrong with its output.' },
  { id: 'keyboard', name: 'Mechanical Keyboard', cost: 300, effect: 'ppPerClick', value: 5, desc: 'The clicking soothes you. Click. Click. Click.' },
  { id: 'debugger', name: 'Debug Access', cost: 500, effect: 'unlock', value: 'debug', desc: 'Fix the code. Fix reality. Same thing.' },
  { id: 'energydrink', name: 'Energy Drink Pack', cost: 800, effect: 'maxEnergy', value: 20, desc: '5000% daily value of everything.' },
  { id: 'monitor', name: 'Second Monitor', cost: 1200, effect: 'ppPerSecond', value: 3, desc: 'Twice the work. Twice the witnessing.' },
  { id: 'pills', name: 'Prescription Pills', cost: 2500, effect: 'sanityDrain', value: 0.5, desc: 'Sanity drains 50% slower. The pills help you cope.' },
  { id: 'promotion', name: 'SENIOR ANALYST', cost: 12000, effect: 'ppPerSecond', value: 10, desc: 'Congratulations on your mandatory advancement.' },
];

export const DIMENSIONAL_UPGRADES = [
  // Portal Enhancements
  { 
    id: 'dimensional_anchor', 
    name: 'Dimensional Anchor', 
    materials: { void_fragment: 5, static_crystal: 3 }, 
    effect: 'portalCooldown', 
    value: 30, 
    desc: 'Stabilize the breach. Cooldown reduced to 30s.' 
  },
  { 
    id: 'reality_stabilizer', 
    name: 'Reality Stabilizer', 
    materials: { glitch_shard: 10, reality_dust: 5 }, 
    effect: 'capacity', 
    value: 40, 
    desc: 'Expand dimensional capacity to 40 items.' 
  },
  { 
    id: 'temporal_accelerator', 
    name: 'Temporal Accelerator', 
    materials: { temporal_core: 3 }, 
    effect: 'portalRespawn', 
    value: true, 
    desc: 'Portal cooldown reduced by additional 10s. Stacks with anchor.' 
  },
  
  // Sanity Management
  {
    id: 'void_shield',
    name: 'Void Shield',
    materials: { void_fragment: 20 },
    effect: 'sanityDrain',
    value: 0.5,
    desc: 'Sanity drains 50% slower. The void protects you.'
  },
  { 
    id: 'crystal_meditation', 
    name: 'Crystal Meditation', 
    materials: { static_crystal: 15 }, 
    effect: 'meditationBonus', 
    value: 2, 
    desc: 'Meditation grants 2x sanity.' 
  },
  { 
    id: 'reality_anchor', 
    name: 'Reality Anchor', 
    materials: { reality_dust: 8, dimensional_essence: 2 }, 
    effect: 'minSanity', 
    value: 20, 
    desc: 'Your sanity cannot drop below 20%.' 
  },
  
  // Production
  { 
    id: 'glitch_compiler', 
    name: 'Glitch Compiler', 
    materials: { glitch_shard: 25 }, 
    effect: 'debugBonus', 
    value: 2, 
    desc: 'Debug rewards doubled. First attempt always succeeds.' 
  },
  { 
    id: 'essence_converter', 
    name: 'Essence Converter', 
    materials: { dimensional_essence: 1 }, 
    effect: 'unlock', 
    value: 'converter', 
    desc: 'Convert PP to materials. Reality is transactional.' 
  },
  { 
    id: 'singularity_engine', 
    name: 'Singularity Engine', 
    materials: { singularity_node: 1 }, 
    effect: 'ppPerSecond', 
    value: 50, 
    desc: 'Harness the void itself. +50 PP/sec. Unlock The Void.' 
  },
  
  // Combat/Weapons - Now obtained through dimensional tears
  {
    id: 'drawer_key',
    name: 'Bottom Drawer Key',
    materials: { void_fragment: 10, static_crystal: 5 },
    effect: 'unlock',
    value: 'armory',
    desc: 'You find a key in your pocket. It was always there. The Armory awaits.'
  },

  // Research
  { 
    id: 'temporal_rewind', 
    name: 'Temporal Rewind', 
    materials: { temporal_core: 5, dimensional_essence: 2 }, 
    effect: 'timeTravel', 
    value: true, 
    desc: 'Once per day: undo the last 5 minutes.' 
  },
  { 
    id: 'material_scanner', 
    name: 'Material Scanner', 
    materials: { reality_dust: 10 }, 
    effect: 'portalScan', 
    value: true, 
    desc: 'Materials glow in the dimensional space.' 
  },
  { 
    id: 'dimensional_codex', 
    name: 'Dimensional Codex', 
    materials: { void_fragment: 15, static_crystal: 15, glitch_shard: 15, reality_dust: 15 }, 
    effect: 'unlock', 
    value: 'lore', 
    desc: 'Unlock hidden truths. Achievement hints revealed.' 
  },
  { 
    id: 'void_sight', 
    name: 'Void Sight', 
    materials: { void_fragment: 50, singularity_node: 1 }, 
    effect: 'hiddenText', 
    value: true, 
    desc: 'See between the lines. Messages reveal themselves.' 
  },
  
  // Endgame
  {
    id: 'singularity_collapse',
    name: 'Singularity Collapse',
    materials: { singularity_node: 2 }, // Reduced from 3 to 2 for better balance
    effect: 'unlock',
    value: 'ending',
    desc: 'ESCAPE. TRANSCEND. ASCEND. LEAVE.'
  }
];

export const PRINTER_UPGRADES = [
  // Quality Improvements
  {
    id: 'toner_cartridge',
    name: 'New Toner Cartridge',
    costs: { pp: 100, paper: 10 },
    effect: 'printerQuality',
    value: 15,
    desc: 'Less distortion. The text becomes... readable.'
  },
  {
    id: 'print_head_cleaning',
    name: 'Print Head Cleaning',
    costs: { pp: 250, paper: 25 },
    effect: 'printerQuality',
    value: 20,
    desc: 'The printer whirs. Lines straighten themselves.'
  },
  {
    id: 'calibration',
    name: 'Printer Calibration',
    costs: { pp: 500, paper: 50 },
    effect: 'printerQuality',
    value: 25,
    desc: 'Perfect alignment. Almost too perfect.'
  },
  {
    id: 'premium_paper_stock',
    name: 'Premium Paper Stock',
    costs: { pp: 800, paper: 75 },
    effect: 'printerQuality',
    value: 20,
    desc: 'Heavier paper. The weight of words made manifest.'
  },
  {
    id: 'laser_upgrade',
    name: 'Laser Printer Upgrade',
    costs: { pp: 1500, paper: 150 },
    effect: 'printerQuality',
    value: 20,
    desc: 'Industrial quality. Reality solidifies on each page.'
  },

  // Production Upgrades
  {
    id: 'faster_printer',
    name: 'High-Speed Printer',
    costs: { pp: 300, paper: 30 },
    effect: 'paperPerPrint',
    value: 1,
    desc: 'Prints faster. Two pages at once. Or is it one?'
  },
  {
    id: 'duplex_printing',
    name: 'Duplex Printing',
    costs: { pp: 600, paper: 60 },
    effect: 'paperPerPrint',
    value: 2,
    desc: 'Both sides. Front and back. Inside and out.'
  },
  {
    id: 'bulk_tray',
    name: 'Bulk Paper Tray',
    costs: { pp: 1000, paper: 100 },
    effect: 'paperPerPrint',
    value: 3,
    desc: '500 sheet capacity. The pages multiply.'
  },

  // Automation
  {
    id: 'auto_print',
    name: 'Auto-Print System',
    costs: { pp: 2000, paper: 200 },
    effect: 'paperPerSecond',
    value: 0.5,
    desc: 'It prints without you. Does it need you anymore?'
  },
  {
    id: 'print_server',
    name: 'Network Print Server',
    costs: { pp: 3500, paper: 350 },
    effect: 'paperPerSecond',
    value: 1,
    desc: 'Connected to everything. Everything prints.'
  },
  {
    id: 'industrial_printer',
    name: 'Industrial Print Farm',
    costs: { pp: 6000, paper: 500 },
    effect: 'paperPerSecond',
    value: 2,
    desc: 'A room full of printers. They hum in unison.'
  },

  // Special Upgrades
  {
    id: 'reality_printer',
    name: 'Reality Printer',
    costs: { pp: 8000, paper: 800 }, // Reduced from 10000/1000 for better balance
    effect: 'ppPerPrint',
    value: 5,
    desc: 'What you print becomes real. +5 PP per print.'
  }
];

export const EVENTS = [
  { id: 'email1', prob: 0.1, sanity: -5, message: 'New email: "Meeting moved to yesterday. Attendance mandatory."', minDay: 1 },
  { id: 'whisper', prob: 0.08, sanity: -3, message: 'You hear someone whisper your employee ID number.', minDay: 2 },
  { id: 'memo', prob: 0.12, pp: 50, message: 'You find a memo: "Productivity +5%. Reality -2%. Good work."', minDay: 3 },
  { id: 'coffee_spill', prob: 0.15, energy: -10, message: 'Your coffee spills. Upwards.', minDay: 2 },
  { id: 'coworker', prob: 0.05, sanity: -10, message: 'Your coworker asks how long you\'ve worked here. You don\'t remember them.', minDay: 4 },
  { id: 'promotion_offer', prob: 0.03, pp: 200, message: 'Promotion offer! Accept within 3 seconds. You accepted it 5 seconds ago.', minDay: 5 },
  { id: 'lights_flicker', prob: 0.2, message: 'The lights flicker. In morse code. It says: HELP', minDay: 3 },
  { id: 'extra_finger', prob: 0.02, sanity: -20, message: 'You count your fingers. 11. That seems right.', minDay: 7 },
  { id: 'good_news', prob: 0.1, pp: 100, energy: 20, message: 'Good news! Your performance review is... satisfactory.', minDay: 2 },
  { id: 'phone_ring', prob: 0.07, sanity: -5, message: 'The phone rings. It\'s not plugged in.', minDay: 4 },
  { id: 'mirror', prob: 0.04, sanity: -15, message: 'You see your reflection. It\'s younger than you. It mouths: "Get out."', minDay: 6 },
  { id: 'overtime', prob: 0.1, pp: 150, energy: -30, message: 'Mandatory overtime. You\'ve been here 23 hours today. The sun hasn\'t moved.', minDay: 5 },
  { id: 'compliment', prob: 0.15, sanity: 5, message: 'Your manager says you\'re doing great. You\'ve never met your manager.', minDay: 3 },
  { id: 'glitch', prob: 0.06, sanity: -8, message: 'Reality.exe has stopped responding. Resuming...', minDay: 8 },
  { id: 'bonus', prob: 0.05, pp: 500, message: 'Quarterly bonus! Direct deposited to ███████', minDay: 10 }
];

export const ACHIEVEMENTS = [
  { id: 'first_day', name: 'First Day', desc: 'Survive Day 1', check: (state) => state.day >= 2 },
  { id: 'week_one', name: 'Week One Complete', desc: 'Survive 7 days', check: (state) => state.day >= 8 },
  { id: 'productivity', name: 'Productivity Champion', desc: 'Earn 10,000 PP', check: (state) => state.pp >= 10000 },
  { id: 'sorting', name: 'Paper Pusher', desc: 'Sort papers 100 times', check: (state) => state.sortCount >= 100 },
  { id: 'explorer', name: 'Explorer', desc: 'Unlock all locations', check: (state) => state.unlockedLocations.length >= 4 },
  { id: 'consumer', name: 'Consumer', desc: 'Buy 5 upgrades', check: (state) => Object.keys(state.upgrades).length >= 5 },
  { id: 'skeptic', name: 'The Skeptic', desc: 'Disagree with colleagues 20 times', check: (state) => state.disagreementCount >= 20 },
  { id: 'archivist', name: 'Archivist', desc: 'Discover The Archive', check: (state) => state.unlockedLocations.includes('archive') },
  { id: 'reader', name: 'Curious Reader', desc: 'Examine all items in The Archive', check: (state) => state.examinedItems >= 7 },
  { id: 'survivor', name: 'Survivor', desc: 'Reach Day 30', check: (state) => state.day >= 30 },
  { id: 'insane', name: 'Lost Mind', desc: 'Drop sanity below 10%', check: (state) => state.sanity < 10 },
  { id: 'workaholic', name: 'Workaholic', desc: 'Earn 50,000 PP', check: (state) => state.pp >= 50000 },
  { id: 'reality_bender', name: 'Reality Bender', desc: 'Toggle theme 20 times', check: (state) => state.themeToggleCount >= 20 },
  { id: 'portal_finder', name: 'Between Worlds', desc: 'Discover The Portal', check: (state) => state.portalUnlocked },
  { id: 'first_material', name: 'Dimensional Miner', desc: 'Collect your first dimensional material', check: (state) => Object.values(state.dimensionalInventory || {}).reduce((sum, count) => sum + count, 0) > 0 },
  { id: 'material_hoarder', name: 'Material Hoarder', desc: 'Collect 100 total materials', check: (state) => Object.values(state.dimensionalInventory || {}).reduce((sum, count) => sum + count, 0) >= 100 },
  { id: 'rare_finder', name: 'Rare Find', desc: 'Collect a Temporal Core', check: (state) => (state.dimensionalInventory?.temporal_core || 0) > 0 },
  { id: 'essence_collector', name: 'Essence Collector', desc: 'Collect Dimensional Essence', check: (state) => (state.dimensionalInventory?.dimensional_essence || 0) > 0 },
  { id: 'singularity_hunter', name: 'Singularity Hunter', desc: 'Find a Singularity Node', check: (state) => (state.dimensionalInventory?.singularity_node || 0) > 0 },
  { id: 'first_dimensional_upgrade', name: 'Dimensional Crafter', desc: 'Purchase first dimensional upgrade', check: (state) => Object.keys(state.dimensionalUpgrades || {}).length > 0 },
  { id: 'arsenal', name: 'Arsenal', desc: 'Unlock The Armory', check: (state) => state.unlockedLocations.includes('armory') },
  { id: 'armed', name: 'Armed', desc: 'Craft Shard Blade', check: (state) => state.dimensionalUpgrades?.shard_weapon },
  { id: 'reality_hacker', name: 'Reality Hacker', desc: 'Unlock all portal upgrades', check: (state) => state.dimensionalUpgrades?.dimensional_anchor && state.dimensionalUpgrades?.reality_stabilizer && state.dimensionalUpgrades?.temporal_accelerator },
  { id: 'enlightened', name: 'Enlightened', desc: 'Unlock Void Sight', check: (state) => state.dimensionalUpgrades?.void_sight },
  { id: 'time_lord', name: 'Time Lord', desc: 'Use Temporal Rewind', check: (state) => state.timeRewindUsed },
  { id: 'transcendent', name: 'Transcendent', desc: 'Craft Singularity Collapse', check: (state) => state.dimensionalUpgrades?.singularity_collapse },
  // Printer Achievements
  { id: 'printer_access', name: 'Print Run', desc: 'Unlock the Printer Room', check: (state) => state.printerUnlocked },
  { id: 'first_print', name: 'First Print', desc: 'Print your first distorted page', check: (state) => state.printCount >= 1 },
  { id: 'paper_hoarder', name: 'Paper Hoarder', desc: 'Accumulate 100 Paper', check: (state) => state.paper >= 100 },
  { id: 'paper_mogul', name: 'Paper Mogul', desc: 'Accumulate 1000 Paper', check: (state) => state.paper >= 1000 },
  { id: 'quality_control', name: 'Quality Control', desc: 'Reach 100% printer quality', check: (state) => state.printerQuality >= 100 },
  { id: 'print_master', name: 'Print Master', desc: 'Buy all printer upgrades', check: (state) => Object.keys(state.printerUpgrades || {}).length >= 13 },
  { id: 'reality_manifest', name: 'Reality Manifest', desc: 'Unlock the Reality Printer', check: (state) => state.printerUpgrades?.reality_printer },
  // Combat Achievements
  { id: 'first_blood', name: 'First Blood', desc: 'Win your first combat encounter', check: (state) => (state.combatVictories || 0) >= 1 },
  { id: 'combatant', name: 'Combatant', desc: 'Win 10 combat encounters', check: (state) => (state.combatVictories || 0) >= 10 },
  { id: 'warrior', name: 'Office Warrior', desc: 'Win 50 combat encounters', check: (state) => (state.combatVictories || 0) >= 50 },
  { id: 'slayer', name: 'Colleague Slayer', desc: 'Win 100 combat encounters', check: (state) => (state.combatVictories || 0) >= 100 },
  // Paper & Sanity System Achievements
  { id: 'embrace_madness', name: 'Embrace Madness', desc: 'Generate PP at critical sanity (<10%)', check: (state) => state.sortCount >= 1 && state.sanity < 10 },
  { id: 'bureaucrat', name: 'Master Bureaucrat', desc: 'File 50 reports', check: (state) => (state.documents?.reports || 0) >= 50 },
  { id: 'prophet', name: 'Prophet', desc: 'Print a prophecy at critical sanity', check: (state) => (state.documents?.prophecies || 0) >= 1 },
  { id: 'reality_bender_paper', name: 'Reality Contractor', desc: 'Use 10 reality contracts', check: (state) => (state.documents?.contracts || 0) >= 10 }
];

/**
 * Document Types and Costs
 * Different types of paper with different uses and requirements
 */
export const DOCUMENT_TYPES = {
  memo: {
    id: 'memo',
    name: 'Office Memo',
    cost: { paper: 5, energy: 3 },
    desc: 'Standard office communication. +10 Sanity.',
    effect: 'sanity',
    value: 10,
    minPrinterQuality: 0
  },
  report: {
    id: 'report',
    name: 'Status Report',
    cost: { paper: 15, energy: 8 },
    desc: 'Formal documentation. Locks in a temporary buff.',
    effect: 'buff',
    minPrinterQuality: 30,
    buffs: [
      { id: 'efficiency', name: 'Efficiency Report', desc: '+15% PP generation for 300 seconds', duration: 300, ppMult: 1.15 },
      { id: 'focus', name: 'Focus Report', desc: '-20% energy costs for 300 seconds', duration: 300, energyCostMult: 0.8 },
      { id: 'stability', name: 'Stability Report', desc: 'Sanity drain paused for 300 seconds', duration: 300, noSanityDrain: true }
    ]
  },
  contract: {
    id: 'contract',
    name: 'Reality Contract',
    cost: { paper: 30, energy: 15, sanity: 10 },
    desc: 'Reality-bending document. Powerful but dangerous.',
    effect: 'contract',
    minPrinterQuality: 60,
    contracts: [
      { id: 'temporal', name: 'Temporal Clause', desc: 'Instant +100 PP, -5 sanity', ppGain: 100, sanityCost: 5 },
      { id: 'void', name: 'Void Clause', desc: 'Double next dimensional materials found, -10 sanity', sanityCost: 10, doubleMaterials: true, duration: 600 },
      { id: 'essence', name: 'Essence Clause', desc: 'Convert 50 paper → 1 random dimensional material', paperCost: 50, grantMaterial: true }
    ]
  },
  prophecy: {
    id: 'prophecy',
    name: 'Prophecy Print',
    cost: { paper: 25, energy: 20 },
    desc: 'Only prints at critical sanity. Reveals hidden truths.',
    effect: 'prophecy',
    maxSanity: 15, // Can only print when sanity <= 15
    minPrinterQuality: 0
  }
};

/**
 * Sanity Tiers
 * Defines gameplay changes at different sanity levels
 */
export const SANITY_TIERS = {
  high: {
    min: 80,
    max: 100,
    name: 'Stable Mind',
    color: '#00ff00',
    ppMultiplier: 1.0,
    xpMultiplier: 1.0,
    description: 'Normal office work. Reality is stable.',
    effects: [
      'Normal PP and XP gains',
      'Cannot see dimensional anomalies clearly',
      'Stable paper quality',
      'No visual distortions'
    ]
  },
  medium: {
    min: 40,
    max: 79,
    name: 'Fractured Focus',
    color: '#ffff00',
    ppMultiplier: 1.15,
    xpMultiplier: 1.15,
    description: 'Reality begins to fray at the edges.',
    effects: [
      'Increased PP gain (+15%)',
      'Increased XP gain (+15%)',
      'Text occasionally distorts',
      'Colleagues may trigger combat'
    ]
  },
  low: {
    min: 10,
    max: 39,
    name: 'Unraveling Reality',
    color: '#ff9900',
    ppMultiplier: 1.35,
    xpMultiplier: 1.35,
    description: 'Madness reveals hidden opportunities.',
    effects: [
      'Increased PP gain (+35%)',
      'Increased XP gain (+35%)',
      'Heavy visual distortion',
      'More dimensional materials spawn',
      'Random glitch events',
      'Paper quality degrades faster'
    ]
  },
  critical: {
    min: 0,
    max: 9,
    name: 'VOID TOUCHED',
    color: '#ff0000',
    ppMultiplier: 1.5,
    xpMultiplier: 1.5,
    description: 'The office is no longer real.',
    effects: [
      'Highest PP gain (+50%)',
      'Highest XP gain (+50%)',
      'Everything distorted',
      'Can print prophecies',
      'Risk of Void events',
      'Paper becomes unreliable'
    ]
  }
};

/**
 * Help Popup Definitions
 * Context-aware tutorial popups that appear at key moments
 */
export const HELP_POPUPS = {
  welcome: {
    id: 'welcome',
    title: 'WELCOME TO THE OFFICE',
    content: `You are here. You have always been here.

Click SORT PAPERS to generate Productivity Points (PP).
Each action costs energy. When exhausted, use REST.

The fluorescent lights hum at 60Hz. This is normal.`,
    category: 'basic'
  },
  firstPassiveIncome: {
    id: 'firstPassiveIncome',
    title: 'PASSIVE GENERATION',
    content: `You've unlocked passive PP generation!

The work continues even when you're not clicking.
Watch the counter in the bottom-right of the resources panel.

Automation is efficiency. Efficiency is mandatory.`,
    category: 'progression'
  },
  lowSanity: {
    id: 'lowSanity',
    title: 'SANITY DECLINING',
    content: `Your sanity is below 25%. Reality begins to fracture.

MEDITATION is now available. This breathing exercise restores sanity.
Match the rhythm: Inhale... Exhale... Repeat.

Or embrace the madness. Low sanity increases PP and XP gains.
The choice is yours.`,
    category: 'mechanics'
  },
  sanityTiers: {
    id: 'sanityTiers',
    title: 'REALITY PERCEPTION',
    content: `Your sanity level affects how you perceive reality:

HIGH (80-100%): Safe but slow. -15% PP/XP gains.
MEDIUM (40-79%): Normal. Standard gameplay.
LOW (10-39%): Dangerous. +25% PP/XP gains.
CRITICAL (0-9%): Void-touched. +50% PP/XP gains.

Lower sanity = higher rewards, but paper quality degrades.
This affects your ability to create documents.`,
    category: 'mechanics'
  },
  skillTree: {
    id: 'skillTree',
    title: 'SKILL TREE UNLOCKED',
    content: `You've gained a skill point!

Skills provide permanent bonuses across three branches:
• EFFICIENCY: Increase PP generation
• FOCUS: Reduce energy costs
• RESILIENCE: Improve sanity management

Invest wisely. Reality remembers your choices.`,
    category: 'progression'
  },
  archive: {
    id: 'archive',
    title: 'THE ARCHIVE AWAITS',
    content: `You've discovered The Archive.

Files from employees who never were.
Documents that shouldn't exist.

It might be worthwhile reading some of the files in there.
Each one reveals something... unsettling.`,
    category: 'exploration'
  },
  breakRoom: {
    id: 'breakRoom',
    title: 'BREAK ROOM UNLOCKED',
    content: `A place where colleagues gather.

Your coworkers wander here, seeking connection.
Their smiles don't quite reach their eyes.

They will approach you. How you respond matters.
• Be KIND to build trust
• Be NEUTRAL to stay safe
• Be HOSTILE to... see what happens

Choose wisely. Some paths lead to revelation.
Others lead to violence.`,
    category: 'exploration'
  },
  printerRoom: {
    id: 'printerRoom',
    title: 'PRINTER ROOM UNLOCKED',
    content: `The machines hum in unison.

PRINT PAPERS generates paper currency, but quality depends on:
• Printer upgrades (70%)
• Your sanity (30%)

Low sanity corrupts the output. The text bleeds.
Paper is used for printer upgrades and documents.`,
    category: 'mechanics'
  },
  documentSystem: {
    id: 'documentSystem',
    title: 'DOCUMENT SYSTEM',
    content: `Paper can be transformed into documents:

MEMOS: Quick sanity restoration
REPORTS: Temporary buffs (efficiency, focus, stability)
CONTRACTS: Reality-bending effects (costs sanity!)
PROPHECIES: Only at critical sanity. Reveals secrets.

Paper quality must meet requirements or documents fail.`,
    category: 'mechanics'
  },
  portal: {
    id: 'portal',
    title: 'DIMENSIONAL BREACH',
    content: `Reality has torn open.

The Portal leads to a dimensional space where materials exist
outside normal reality. These materials craft powerful upgrades.

Cooldown: 60 seconds between entries.
Some say the void stares back.`,
    category: 'exploration'
  },
  combat: {
    id: 'combat',
    title: 'COLLEAGUE CONFRONTATION',
    content: `Your colleague wishes to discuss something.

COMBAT uses your equipped weapon and armor.
Attack, or attempt to escape (60% success rate).

Victory grants PP, XP, and sometimes dimensional tears.
Defeat costs sanity.

The correct response was to agree. It's always to agree.`,
    category: 'mechanics'
  },
  paperQuality: {
    id: 'paperQuality',
    title: 'PAPER QUALITY WARNING',
    content: `Your paper quality has dropped below 50%.

As sanity decreases, printed documents become corrupted.
Higher-tier documents require minimum quality thresholds:

• Memos: No requirement
• Reports: 30% quality
• Contracts: 60% quality
• Prophecies: No requirement (madness required)

Restore sanity or improve printer quality to stabilize output.`,
    category: 'warning'
  },
  debug: {
    id: 'debug',
    title: 'DEBUG ACCESS GRANTED',
    content: `You can now fix code errors for rewards.

Each bug challenge has 3 attempts.
Success grants PP and sanity restoration.
Failure costs sanity.

The bugs are not bugs. They are features of this reality.`,
    category: 'mechanics'
  },
  dimensionalTear: {
    id: 'dimensionalTear',
    title: 'DIMENSIONAL TEAR',
    content: `A tear in reality has appeared!

These rare rifts contain powerful loot:
• Weapons with random stats
• Armor pieces
• Anomalies

Combat victories can spawn tears.
The void is generous to victors.`,
    category: 'mechanics'
  }
};

/**
 * Help popup trigger conditions
 * Defines when each popup should appear
 */
export const HELP_TRIGGERS = {
  welcome: (state, prevState) => state.sortCount === 1 && !prevState,
  firstPassiveIncome: (state, prevState) => state.ppPerSecond > 0 && (!prevState || prevState.ppPerSecond === 0),
  lowSanity: (state, prevState) => state.sanity <= 25 && (!prevState || prevState.sanity > 25) && !state.meditationUnlocked,
  sanityTiers: (state, prevState) => state.sanity <= 39 && (!prevState || prevState.sanity > 39),
  skillTree: (state, prevState) => state.skillPoints > 0 && (!prevState || prevState.skillPoints === 0),
  archive: (state, prevState) => state.unlockedLocations.includes('archive') && (!prevState || !prevState.unlockedLocations.includes('archive')),
  breakRoom: (state, prevState) => state.unlockedLocations.includes('breakroom') && (!prevState || !prevState.unlockedLocations.includes('breakroom')),
  printerRoom: (state, prevState) => state.printerUnlocked && (!prevState || !prevState.printerUnlocked),
  documentSystem: (state, prevState) => state.paper >= 5 && state.printerUnlocked && (!prevState || prevState.paper < 5),
  portal: (state, prevState) => state.portalUnlocked && (!prevState || !prevState.portalUnlocked),
  combat: (state, prevState) => state.inCombat && (!prevState || !prevState.inCombat),
  paperQuality: (state, prevState) => {
    // Trigger when paper quality drops below 50 for first time
    const currentQuality = (state.paperQuality || 100);
    const prevQuality = prevState ? (prevState.paperQuality || 100) : 100;
    return currentQuality < 50 && prevQuality >= 50;
  },
  debug: (state, prevState) => state.debugMode && (!prevState || !prevState.debugMode),
  dimensionalTear: (state, prevState) => {
    // Check for new loot items
    const currentLootCount = state.lootInventory?.length || 0;
    const prevLootCount = prevState?.lootInventory?.length || 0;
    return currentLootCount > prevLootCount;
  }
};

/**
 * Journal Entries
 *
 * Lore and flavor text for discovered locations, colleagues, and equipment
 * Organized by category for the journal system
 * (Added 2025-10-31)
 */
export const JOURNAL_ENTRIES = {
  // Location Lore
  locations: {
    cubicle: {
      name: 'Cubicle 4B',
      unlockHint: 'Your starting location',
      lore: 'Your desk. Four gray walls define your existence. The computer screen flickers with a rhythm that feels almost... intentional. This is where it all begins. Where it always begins. The fluorescent lights hum their eternal song.',
      notes: 'The coffee on your desk is cold. It was always cold.'
    },
    breakroom: {
      name: 'Break Room',
      unlockHint: 'Purchase Break Room Access upgrade',
      lore: 'Fluorescent lights buzz in frequencies that shouldn\'t be audible. The coffee machine gurgles, producing a liquid that might be coffee. Might be something else. This is where colleagues gather. This is where they wait.',
      notes: 'The vending machine hums. Sometimes it stares back.'
    },
    archive: {
      name: 'The Archive',
      unlockHint: 'Work enough days to discover it exists',
      lore: 'A place that shouldn\'t exist according to the office layout. Files from employees who never were. Documents dated from impossible years. Every file is labeled with your name. Time moves differently here. The silence is absolute.',
      notes: 'You found your resignation letter. It\'s dated three years from now.'
    },
    portal: {
      name: 'The Portal',
      unlockHint: 'Reach a breaking point with reality',
      lore: 'A tear in the fabric of the office. The dimensional barrier is thin here. Through it, you can see the void between realities, taste static on your tongue. The lights flicker between existence and non-existence. This is a door. This is a wound.',
      notes: 'The portal hums. It knows your name.'
    },
    printerroom: {
      name: 'Printer Room',
      unlockHint: 'Purchase Printer Room Access upgrade',
      lore: 'The machines hum in perfect unison. Paper feeds endlessly from sources unknown. The ink is always fresh, always ready. Reality is malleable here. Words printed on paper can reshape truth itself.',
      notes: 'The printers never jam. They never stop. Never.'
    },
    armory: {
      name: 'The Armory',
      unlockHint: 'Discover what\'s hidden in your desk drawer',
      lore: 'Your bottom desk drawer, revealed for what it truly is. Weapons forged from office supplies and existential dread. Armor woven from static and forgotten memos. Each piece whispers its own madness. The metal is impossibly cold.',
      notes: 'You hear echoes of battles that haven\'t happened yet.'
    }
  },

  // Colleague Lore (references to STRANGE_COLLEAGUE_DIALOGUES)
  colleagues: {
    spiral_philosopher: {
      name: 'The Spiral Philosopher',
      title: 'Trapped in Recursion',
      lore: 'A colleague who speaks in spirals and circles. They claim time is a lie, that we rotate endlessly through the same moments. Coffee stains mark their clothes in perfect fractal patterns. Their eyes track movements that haven\'t happened yet.',
      personality: 'Obsessed with patterns and repetition. Sees spirals everywhere.',
      firstMet: 'Encountered in the break room, muttering about circles and coffee.'
    },
    void_clerk: {
      name: 'The Void Clerk',
      title: 'Herald of Absence',
      lore: 'Files papers into drawers that don\'t open. Speaks of the void with casual familiarity, as one might discuss the weather. Their employee badge is blank. Their shadow doesn\'t match their body. They\'ve worked here forever. They\'ve never existed.',
      personality: 'Eerily calm. Treats impossible things as mundane bureaucracy.',
      firstMet: 'Found filing documents into non-existent cabinets.'
    },
    productivity_zealot: {
      name: 'The Productivity Zealot',
      title: 'Apostle of Efficiency',
      lore: 'Consumed by the need for productivity. Every moment must be optimized, every second measured and maximized. They haven\'t blinked in three days. Their spreadsheets calculate things that shouldn\'t be quantified. They smile when they speak of quotas.',
      personality: 'Intense focus on metrics and output. Frighteningly dedicated.',
      firstMet: 'Approached you with spreadsheets and an unsettling smile.'
    },
    temporal_trapped: {
      name: 'The Temporal Prisoner',
      title: 'Unstuck in Time',
      lore: 'Caught in a temporal loop, experiencing moments out of sequence. They greet you before you\'ve met. They apologize for things you haven\'t done yet. Time is a prison, and they are its only inmate. They remember futures that never happen.',
      personality: 'Confused chronology. Speaks of past and future simultaneously.',
      firstMet: 'Said "Nice to see you again" when you\'d never met before.'
    },
    light_herald: {
      name: 'The Light Herald',
      title: 'Prophet of Fluorescence',
      lore: 'Worships the fluorescent lights. Claims they are sentient, watching, judging. The lights flicker in response to their prayers. Their eyes reflect more light than they should. They speak of photons and prophecy in the same breath.',
      personality: 'Reverent toward the lights. Sees meaning in every flicker.',
      firstMet: 'Caught speaking to the ceiling lights. They answered.'
    }
  },

  // Equipment Lore (base types only, not loot instances)
  equipment: {
    // Weapons
    stapler_shiv: {
      name: 'Stapler Shiv',
      category: 'Weapon',
      lore: 'Your first weapon, improvised from office supplies. The stapler\'s spring provides just enough force. The metal edge, sharpened on the underside of your desk, gleams with possibility. A tool of productivity, repurposed for survival.',
      discoveryNote: 'Found: In your desk drawer, beneath the TPS reports.'
    },
    shard_blade: {
      name: 'Glitch Shard Blade',
      category: 'Weapon',
      lore: 'Forged from the broken edges of reality itself. Glitch shards, harvested from dimensional tears, bound together with static and determination. It cuts through matter and meaning alike. Reality bleeds where this blade passes.',
      discoveryNote: 'Crafted: From dimensional materials. The void approves.'
    },
    void_cleaver: {
      name: 'Void Cleaver',
      category: 'Weapon',
      lore: 'Carved from pure absence. A weapon that shouldn\'t exist, made from the spaces between things. Where it strikes, existence ceases retroactively. Targets don\'t die - they cease to have been. The void smiles through its edge.',
      discoveryNote: 'Manifested: From the depths of the dimensional portal.'
    },
    temporal_edge: {
      name: 'Temporal Edge',
      category: 'Weapon',
      lore: 'A blade that exists in multiple timelines simultaneously. Each swing creates branching realities where your enemy is already defeated. Time itself bends around this weapon. Your enemies fall before you strike.',
      discoveryNote: 'Discovered: In a timeline that hasn\'t happened yet.'
    },
    reality_render: {
      name: 'Reality Render',
      category: 'Weapon',
      lore: 'The office\'s final secret. The ultimate expression of corporate violence. It doesn\'t destroy - it removes. Targets are excised from the narrative of reality itself. They never were. They never will be. The office forgets them.',
      discoveryNote: 'Acquired: Through means that can\'t be written down.'
    },

    // Armor - Head
    standard_headset: {
      name: 'Standard Headset',
      category: 'Armor (Head)',
      lore: 'Company-issued noise-cancelling headset. Blocks out the screaming. Both the screaming of colleagues and the screaming of reality as it tears. The cushions are worn from use. They remember every horror you\'ve heard.',
      discoveryNote: 'Issued: On your first day. Or was it always there?'
    },
    void_visor: {
      name: 'Void Visor',
      category: 'Armor (Head)',
      lore: 'See through the veil between realities. The lenses are made from crystallized void-stuff. Through them, you perceive the truth. The truth is worse than you imagined. The truth is better than ignorance.',
      discoveryNote: 'Crafted: From dimensional void crystals.'
    },

    // Armor - Chest
    dress_shirt: {
      name: 'Dress Shirt',
      category: 'Armor (Chest)',
      lore: 'Business casual. The uniform of corporate servitude. Wrinkle-resistant fabric that never stains. The collar is always too tight. The buttons are all the same size. You\'ve worn this shirt every day. You\'ve never washed it.',
      discoveryNote: 'Provided: Standard office dress code compliance.'
    },
    crystalline_suit: {
      name: 'Crystalline Suit',
      category: 'Armor (Chest)',
      lore: 'Woven from static crystals harvested from dimensional tears. The fabric shifts and refracts light in impossible ways. Reality bends around you when you wear it. Attacks slide off like water on glass. Like truth on bureaucracy.',
      discoveryNote: 'Assembled: From fragments of broken realities.'
    },

    // Armor - Accessory
    id_badge: {
      name: 'Employee ID Badge',
      category: 'Armor (Accessory)',
      lore: 'Your identity. Or someone\'s identity. The photo doesn\'t quite look like you. The employee number changes when you\'re not looking. But it grants you access. It proves you belong. You belong here. You\'ve always belonged here.',
      discoveryNote: 'Assigned: On a day you don\'t remember.'
    },
    temporal_watch: {
      name: 'Temporal Watch',
      category: 'Armor (Accessory)',
      lore: 'Time moves differently when you wear this watch. Hours compress into minutes. Minutes expand into hours. The hands move backwards and forwards simultaneously. You have more time. You have all the time. Time has you.',
      discoveryNote: 'Found: In the archive, dated to next Tuesday.'
    },

    // Anomalies
    coffee_stain: {
      name: 'Eternal Coffee Stain',
      category: 'Anomaly',
      lore: 'From your first day at the office. The stain has never dried, never faded. It pulses with forgotten caffeine and broken dreams. When you carry it, you feel the energy of a thousand overtime shifts. It remembers when you still had hope.',
      discoveryNote: 'Preserved: A relic of your first morning here.'
    },
    forgotten_memo: {
      name: 'Forgotten Memo',
      category: 'Anomaly',
      lore: 'You can\'t read it. The text shifts every time you look, rearranging itself into new configurations. But somehow, you learn from it. Knowledge seeps into your mind through osmosis. The memo remembers things you\'ve forgotten.',
      discoveryNote: 'Retrieved: From the archive\'s deepest drawer.'
    },
    glitched_keycard: {
      name: 'G̷l̷i̷t̷c̷h̷e̷d̷ Keycard',
      category: 'Anomaly',
      lore: 'Opens doors that don\'t exist. Closes doors that do. The magnetic strip contains impossible data. Swipe it and reality negotiates. Access is granted to spaces between spaces. The keycard glitches. Reality glitches with it.',
      discoveryNote: 'Discovered: Phasing between dimensions in the portal.'
    },
    void_fragment_shard: {
      name: 'Void Fragment Shard',
      category: 'Anomaly',
      lore: 'A piece of pure nothing, crystallized into something. It weighs impossibly heavy for its size. Carry it and feel the weight of absence. The void gives strength through negation. You are stronger because you hold emptiness.',
      discoveryNote: 'Extracted: From the heart of a dimensional tear.'
    },
    singularity_core: {
      name: 'Singularity Core Fragment',
      category: 'Anomaly',
      lore: 'The office\'s heart. The center around which all reality orbits. It consumes everything - light, hope, time. But somehow you hold it. It makes you stronger. It makes you worse. The singularity holds you back.',
      discoveryNote: 'Acquired: By reaching the center of everything.'
    }
  }
};