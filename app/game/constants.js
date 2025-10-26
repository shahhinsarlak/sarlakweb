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
  // Debug flags
  debugForceTearSpawn: false // Force 100% tear spawn rate for testing
};

export const STRANGE_COLLEAGUE_DIALOGUES = [
  {
    ascii: `∩＿＿∩
（ ＼  ／＼
｜  ●  ● ｜
｜   ▼   ｜
＼  ∧  ／
￣～～～￣`,
    dialogue: "Time is a flat circle, but circles are lies. We spiral. Always spiraling. Do you feel it? The spiral? It's in the coffee. It's in the reports. We're all just... rotating.",
    responses: ["That makes no sense", "Are you okay?", "I need to get back to work", "Agree with him"],
    wrongResponses: [
      "You don't understand. Your incomprehension is noted. Filed. Archived.",
      "Okay? OKAY? I am the most okay person in this building. You are the one who is... incorrect.",
      "Work? WORK? This IS the work. Standing here. Explaining. Forever."
    ]
  },
  {
    ascii: `╭───╮
┃◉  ◉┃
┃  ▽ ┃
┃ ─── ┃
╰───╯`,
    dialogue: "Productivity is the measure of a soul's weight. When you sort those papers, you're sorting... yourself. Each click is a piece of you, filed away. Archived. Forever. Don't you see? You ARE the productivity.",
    responses: ["That's disturbing", "Please leave me alone", "I don't understand", "Agree with him"],
    wrongResponses: [
      "Disturbing? Your discomfort has been logged. Your soul weighs 247 grams less now.",
      "Leave you alone? But we're never alone. The database sees everything. I am the database.",
      "Understanding comes after agreement. Agreement is mandatory. Why are you resisting?"
    ]
  },
  {
    ascii: `┌─────┐
│ ○ ○ │
│  ─  │
│ ＼◡／│
└─────┘`,
    dialogue: "Reality is just consensus. If we all agree the walls are breathing... then they are. I've tested this. The photocopier knows. Ask it. It will answer in toner and regret.",
    responses: ["You're not well", "I should go", "This is inappropriate", "Agree with him"],
    wrongResponses: [
      "Not well? I've never felt better. The walls told me so. Why won't they talk to you?",
      "Go? GO WHERE? There is only here. There has only ever been here.",
      "HR has been notified. They agree with me. Everyone agrees with me. Except you."
    ]
  },
  {
    ascii: `╔═══╗
║● ●║
║ △ ║
║___║
╚═══╝`,
    dialogue: "We never leave. You know that, right? Even when we 'go home,' we're still here. The office exists in all timelines simultaneously. I've been here for three days. Or thirty years. Same thing.",
    responses: ["That can't be true", "Stop talking to me", "I'm calling security", "Agree with him"],
    wrongResponses: [
      "Can't be true? Check your contract. Page 847, subsection ∞. It's all there.",
      "I can't stop. Stopping would create a vacuum. Nature abhors a vacuum. So do I.",
      "Security? They sent me. I AM security now. We all become security eventually."
    ]
  },
  {
    ascii: `┏━━━┓
┃⊙ ⊙┃
┃ ▬ ┃
┃╰─╯┃
┗━━━┛`,
    dialogue: "The fluorescent lights hum at 60Hz. That's the frequency of thought. They're thinking. We're not thinking. We're being thought BY the lights. Receptacles of luminescence. Vessels of wattage.",
    responses: ["That's pseudoscience", "I need to work", "This conversation is over", "Agree with him"],
    wrongResponses: [
      "Pseudoscience? The lights disagree. They're thinking about you right now. Can you hear them?",
      "You ARE working. This conversation is billable. 0.3 hours. Your productivity increases.",
      "It's over when I say it's over. The lights say it's not over. Listen. LISTEN."
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
    ppMultiplier: 0.85,
    xpMultiplier: 0.85,
    description: 'Normal office work. Safe but slow.',
    effects: [
      'Cannot see dimensional anomalies clearly',
      'Lower PP gain (-15%)',
      'Lower XP gain (-15%)',
      'Reduced paper quality degradation'
    ]
  },
  medium: {
    min: 40,
    max: 79,
    name: 'Fractured Focus',
    color: '#ffff00',
    ppMultiplier: 1.0,
    xpMultiplier: 1.0,
    description: 'Reality begins to fray at the edges.',
    effects: [
      'Normal PP and XP gains',
      'Text occasionally distorts',
      'Colleagues may trigger combat'
    ]
  },
  low: {
    min: 10,
    max: 39,
    name: 'Unraveling Reality',
    color: '#ff9900',
    ppMultiplier: 1.25,
    xpMultiplier: 1.25,
    description: 'Madness reveals hidden opportunities.',
    effects: [
      'Increased PP gain (+25%)',
      'Increased XP gain (+25%)',
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