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
  disagreementCount: 0,
  achievements: [],
  examiningItem: null,
  archiveOpen: false,
  sortCount: 0,
  examinedItems: 0,
  examinedArchiveItems: [],  // Array of archive item IDs that have been examined (costs 25 energy first time)
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
  // Paper Quality & Document System (Added 2025-10-26, Revised 2025-11-01, Redesigned 2025-11-04)
  // Paper quality determined by sanity + printer upgrades (0-100%)
  paperQuality: 100,
  // Document Mastery: tracks total prints per document type (for tier unlocks)
  documentMastery: {
    memos: 0,      // Total memos printed (unlocks tiers at 0, 5, 15, 30, 50)
    reports: 0,    // Total reports printed
    contracts: 0,  // Total contracts printed
    prophecies: 0  // Total prophecies printed
  },
  // File Drawer System (Redesigned 2025-11-04)
  // Documents are stored here and can be consumed/shredded
  storedDocuments: [],  // Array of document objects with { id, type, tier, quality, outcome, createdAt, important }
  fileDrawerOpen: false,  // Is file drawer UI visible
  documentSortBy: 'newest',  // Sort order: 'newest', 'oldest', 'quality', 'type'
  // Active buffs from consumed documents
  activeReportBuffs: [],
  // Buff Limit System (Added 2025-11-20)
  maxActiveBuffs: 3,  // Maximum number of buffs that can be active simultaneously
  pendingBuff: null,  // Buff waiting to be added (when at capacity, triggers replacement modal)
  pendingBuffDocument: null,  // Document that created the pending buff (for context)
  // Paper trail for tracking patterns (for secrets/achievements)
  paperTrail: [],
  // Help System (Added 2025-10-26)
  // Tracks which help popups have been shown to avoid repetition
  helpEnabled: true, // Can be toggled by player
  shownHelpPopups: [], // Array of popup IDs that have been shown
  currentHelpPopup: null, // Current popup to display (object with id, title, content)
  meditationUnlocked: false, // Meditation button only appears after reaching 25% sanity
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
  // Mystery & Path System (Added 2025-11-05)
  // Tracks player's investigation progress and narrative path choices
  mysteryProgress: 0, // 0-100 tracking how much truth player has uncovered
  playerPath: null, // Current dominant path: 'seeker', 'rationalist', 'protector', 'convert', 'rebel'
  pathScores: { // Cumulative scores for each path to determine ending
    seeker: 0,      // Investigates the truth, forms alliances
    rationalist: 0, // Denies the horror, seeks logical explanations
    protector: 0,   // Confronts threats to protect others
    convert: 0,     // Embraces the madness, gains dark powers
    rebel: 0        // Actively tries to break the system/loop
  },
  investigation: { // Case file/detective system
    clues: [],      // Array of clue objects: { id, source, text, category, collectedOn }
    theories: []    // Array of theory objects: { id, name, cluesUsed, confidence, status }
  },
  // Journal System (Added 2025-10-31, Revised 2025-11-01)
  // Tracks discoveries for the player's journal
  journalOpen: false,              // Is journal UI visible
  journalTab: 'locations',         // Current tab: locations, equipment, mechanics
  discoveredLocations: ['cubicle'], // Location IDs that have been visited
  discoveredBaseWeapons: ['stapler_shiv'], // Base weapon types found (starts with default weapon)
  discoveredBaseArmor: ['standard_headset', 'dress_shirt', 'id_badge'], // Base armor types found (starts with default armor)
  discoveredBaseAnomalies: [],     // Base anomaly types found
  discoveredMechanics: [],         // Mechanic IDs learned from help popups
  // Notification System (Added 2025-11-20)
  // Displays temporary popups in top-left corner
  notifications: [],  // Array of notification objects: { id, message, timestamp }
  // Debug flags
  debugForceTearSpawn: false // Force 100% tear spawn rate for testing
};


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
    atmosphere: ['The air tastes stale.', 'You hear typing from the next cubicle. There is no next cubicle.', 'Your coffee is cold. It was always cold.']
  },
  archive: {
    name: 'THE ARCHIVE',
    description: 'A place that shouldn\'t exist. Files from employees who never were.',
    atmosphere: ['The silence is deafening.', 'Every file is labeled with your name.', 'Time moves differently here.'],
    
    items: [
      // Readable documents with lore
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
      },
      {
        id: 'payroll',
        name: 'Payroll Records',
        story: 'Your salary: $█████ per ████. Benefits include: reality insurance, temporal stability, existence guarantee. Deductions: 40% to The Lights, 30% to The Walls, 30% to The Silence. Net pay: -$████.'
      },
      {
        id: 'promotion',
        name: 'Promotion Notice',
        story: 'Congratulations on your promotion to Senior Non-Existence Coordinator. Your new responsibilities include: maintaining the illusion of progress, documenting events that never happened, and reporting to supervisors who were never hired.'
      },
      {
        id: 'incident',
        name: 'Incident Report #447',
        story: 'Date: ████/██/████. Employee complained about "seeing patterns in the fluorescent lights." Investigation determined: Employee does not exist. Case closed. Follow-up: Employee filed three more reports. Resolution: Removed employee from timeline. Status: Employee still filing reports.'
      },

      // Encrypted/corrupted documents
      {
        id: 'encrypted_01',
        name: '████████████',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_02',
        name: 'F̴͎̈I̷͓̾L̶̰̍E̴̱͠ ̶̱̌#̸̰͝█̶̣̈́█̴̰̏█̵̱̄',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_03',
        name: 'R̷E̷D̷A̷C̷T̷E̷D̷',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_04',
        name: '███ VOID ███',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_05',
        name: 'C̸O̸R̸R̸U̸P̸T̸E̸D̸',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_06',
        name: '████████',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_07',
        name: 'N̴O̴ ̴D̴A̴T̴A̴',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_08',
        name: '███████████',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_09',
        name: 'E̷R̷R̷O̷R̷ ̷4̷0̷4̷',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_10',
        name: '████ NULL ████',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_11',
        name: 'D̶E̶L̶E̶T̶E̶D̶',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_12',
        name: '███████████',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_13',
        name: 'M̷I̷S̷S̷I̷N̷G̷',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_14',
        name: '████████',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_15',
        name: 'U̸N̸K̸N̸O̸W̸N̸',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_16',
        name: '███ LOST ███',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_17',
        name: '████████████',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      },
      {
        id: 'encrypted_18',
        name: 'N̴̢̛O̶̰͝ ̷̰̈A̴͓̾C̷̱̍Č̸̰E̴̱͠S̶̰͝S̷̱̄',
        story: '█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████'
      }
    ]
  },
  portal: {
    name: 'THE PORTAL',
    description: 'A tear in reality. The lights flicker between existence and void.',
    isDirect: true // Goes straight to dimensional area
  },
  printerroom: {
    name: 'PRINTER ROOM',
    description: 'The machines hum in unison. Paper feeds endlessly.',
    isDirect: true // Goes straight to printer room
  },
  armory: {
    name: 'THE ARMORY',
    description: 'Bottom drawer revealed. Weapons that shouldn\'t exist. But they do.',
    atmosphere: [
      'Each weapon whispers its own madness.',
      'The metal is cold. Impossibly cold.',
      'You hear echoes of battles that haven\'t happened yet.'
    ],
    isDirect: true // Goes straight to armory
  }
};

export const UPGRADES = [
  { id: 'stapler', name: 'Premium Stapler', cost: 50, effect: 'ppPerClick', value: 2, desc: 'It never jams. Never.' },
  { id: 'coffee', name: 'Coffee Machine', cost: 150, effect: 'ppPerSecond', value: 1, desc: 'Automatic productivity. Tastes like copper.' },
  { id: 'printerroom', name: 'Printer Room Access', cost: 200, effect: 'unlock', value: 'printer', desc: 'The printer hums. Something is wrong with its output.' },
  { id: 'keyboard', name: 'Mechanical Keyboard', cost: 300, effect: 'ppPerClick', value: 5, desc: 'The clicking soothes you. Click. Click. Click.' },
  { id: 'archive_access', name: 'Filing Cabinet Key', cost: 400, effect: 'unlock', value: 'archive', desc: 'You found it in your desk. It opens a door that should not exist. (Requires Day 5+)', dayRequirement: 5 },
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

  // Weapons - Obtained through dimensional tears
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
    effect: 'paperPerPrint',
    value: 3,
    desc: 'What you print becomes real. +3 paper per print, +1 paper/sec.'
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
  // Paper & Sanity System Achievements
  { id: 'embrace_madness', name: 'Embrace Madness', desc: 'Generate PP at critical sanity (<10%)', check: (state) => state.sortCount >= 1 && state.sanity < 10 },
  { id: 'bureaucrat', name: 'Master Bureaucrat', desc: 'File 50 reports', check: (state) => (state.documentMastery?.reports || 0) >= 50 },
  { id: 'prophet', name: 'Prophet', desc: 'Print a prophecy at critical sanity', check: (state) => (state.documentMastery?.prophecies || 0) >= 1 },
  { id: 'reality_bender_paper', name: 'Reality Contractor', desc: 'Print 10 reality contracts', check: (state) => (state.documentMastery?.contracts || 0) >= 10 },
];

/**
 * Document Types and Costs
 * Different types of paper with different uses and requirements
 */
/**
 * Tier Mastery Weights (Added 2025-11-11)
 *
 * Higher tier documents provide more mastery points toward unlocking future tiers.
 * This prevents players from spamming Tier 1 documents to progress.
 */
export const TIER_MASTERY_WEIGHTS = {
  1: 1,   // Tier 1: +1 mastery per print
  2: 3,   // Tier 2: +3 mastery per print
  3: 6,   // Tier 3: +6 mastery per print
  4: 12,  // Tier 4: +12 mastery per print
  5: 25   // Tier 5: +25 mastery per print
};

/**
 * Document Tier System (Revised 2025-11-01)
 *
 * Each document type has 5 tiers that unlock based on mastery (total prints):
 * - Tier 1: 0 prints (always available)
 * - Tier 2: 5 prints
 * - Tier 3: 15 prints
 * - Tier 4: 30 prints
 * - Tier 5: 50 prints
 *
 * Each tier has 4 quality outcomes based on paper quality roll:
 * - Corrupted (0-30%): Negative or weak effects
 * - Standard (31-60%): Intended base effect
 * - Pristine (61-90%): Enhanced effect
 * - Perfect (91-100%): Exceptional effect
 */
export const DOCUMENT_TYPES = {
  memo: {
    id: 'memo',
    name: 'Memo',
    description: 'Office communications. Restores sanity.',
    tiers: [
      {
        tier: 1,
        name: 'Office Memo',
        unlockAt: 0,
        cost: { paper: 5, energy: 3 },
        outcomes: {
          corrupted: { desc: 'Smudged text', sanity: 5, pp: -10 },
          standard: { desc: 'Clear memo', sanity: 15 },
          pristine: { desc: 'Professional memo', sanity: 25 },
          perfect: { desc: 'Perfect memo', sanity: 40, freeActions: 1 }
        }
      },
      {
        tier: 2,
        name: 'Formal Memo',
        unlockAt: 5,
        cost: { paper: 10, energy: 6 },
        outcomes: {
          corrupted: { desc: 'Coffee-stained', sanity: 10, pp: -20 },
          standard: { desc: 'Formal tone', sanity: 25 },
          pristine: { desc: 'Executive quality', sanity: 40, buff: { ppMult: 1.05, duration: 120 } },
          perfect: { desc: 'Inspirational', sanity: 60, buff: { ppMult: 1.10, duration: 180 } }
        }
      },
      {
        tier: 3,
        name: 'Executive Memo',
        unlockAt: 15,
        cost: { paper: 20, energy: 10 },
        outcomes: {
          corrupted: { desc: 'Contradictory directives', sanity: 15, pp: -30, energy: -5 },
          standard: { desc: 'Clear directives', sanity: 35, buff: { ppMult: 1.05, duration: 180 } },
          pristine: { desc: 'Motivating directives', sanity: 50, buff: { ppMult: 1.10, duration: 300 } },
          perfect: { desc: 'Vision statement', sanity: 75, buff: { ppMult: 1.15, xpMult: 1.15, duration: 420 } }
        }
      },
      {
        tier: 4,
        name: "Director's Memo",
        unlockAt: 30,
        cost: { paper: 35, energy: 15 },
        outcomes: {
          corrupted: { desc: 'Ominous undertones', sanity: 20, pp: -50, energy: -10 },
          standard: { desc: 'Strategic vision', sanity: 50, buff: { ppMult: 1.10, duration: 300 } },
          pristine: { desc: 'Rallying message', sanity: 70, buff: { ppMult: 1.15, xpMult: 1.15, duration: 420 } },
          perfect: { desc: 'Transformative vision', sanity: 90, buff: { ppMult: 1.20, xpMult: 1.20, duration: 600 } }
        }
      },
      {
        tier: 5,
        name: 'CEO Mandate',
        unlockAt: 50,
        cost: { paper: 50, energy: 25 },
        outcomes: {
          corrupted: { desc: 'Reality-warping typos', sanity: 30, pp: -100, energy: -20 },
          standard: { desc: 'Company-wide mandate', sanity: 100, buff: { ppMult: 1.15, duration: 480 } },
          pristine: { desc: 'Paradigm shift', sanity: 100, buff: { ppMult: 1.25, xpMult: 1.25, duration: 720 } },
          perfect: { desc: 'REALITY REWRITE', sanity: 100, buff: { ppMult: 1.35, xpMult: 1.35, duration: 900 }, skillPoint: 1 }
        }
      }
    ]
  },
  report: {
    id: 'report',
    name: 'Report',
    description: 'Performance documentation. Grants powerful buffs.',
    tiers: [
      {
        tier: 1,
        name: 'Status Update',
        unlockAt: 0,
        cost: { paper: 15, energy: 8 },
        outcomes: {
          corrupted: { desc: 'Errors detected', sanity: -20, debuff: { energyCostMult: 1.30, duration: 120 } },
          standard: { desc: 'Acceptable report', buff: { ppMult: 1.20, duration: 180 } },
          pristine: { desc: 'Thorough analysis', buff: { ppMult: 1.30, duration: 240 } },
          perfect: { desc: 'Excellence recognized', buff: { ppMult: 1.45, xpMult: 1.45, duration: 300 } }
        }
      },
      {
        tier: 2,
        name: 'Quarterly Report',
        unlockAt: 5,
        cost: { paper: 25, energy: 12 },
        outcomes: {
          corrupted: { desc: 'Audit flags raised', sanity: -30, debuff: { energyCostMult: 1.50, duration: 180 } },
          standard: { desc: 'Goals met', buff: { ppMult: 1.30, duration: 300 } },
          pristine: { desc: 'Exceeded expectations', buff: { ppMult: 1.45, xpMult: 1.45, duration: 360 } },
          perfect: { desc: 'Record-breaking quarter', buff: { ppMult: 1.60, xpMult: 1.60, duration: 480, noSanityDrain: true } }
        }
      },
      {
        tier: 3,
        name: 'Annual Report',
        unlockAt: 15,
        cost: { paper: 40, energy: 20 },
        outcomes: {
          corrupted: { desc: 'Cooked books detected', sanity: -40, debuff: { ppMult: 0.50, duration: 180 } },
          standard: { desc: 'Solid performance', buff: { ppMult: 1.45, xpMult: 1.45, duration: 360 } },
          pristine: { desc: 'Outstanding year', buff: { ppMult: 1.60, xpMult: 1.60, duration: 480, energyCostMult: 0.70 } },
          perfect: { desc: 'Historic achievement', buff: { ppMult: 1.80, xpMult: 1.80, duration: 600, energyCostMult: 0.50 } }
        }
      },
      {
        tier: 4,
        name: 'Strategic Analysis',
        unlockAt: 30,
        cost: { paper: 60, energy: 30 },
        outcomes: {
          corrupted: { desc: 'Flawed methodology', sanity: -50, debuff: { ppMult: 0.25, xpMult: 0.25, duration: 240 } },
          standard: { desc: 'Data-driven insights', buff: { ppMult: 1.60, xpMult: 1.60, duration: 480, energyCostMult: 0.70 } },
          pristine: { desc: 'Breakthrough findings', buff: { ppMult: 1.80, xpMult: 1.80, duration: 600, energyCostMult: 0.50 } },
          perfect: { desc: 'Prophetic accuracy', buff: { ppMult: 2.00, xpMult: 2.00, duration: 720, energyCostMult: 0.25 } }
        }
      },
      {
        tier: 5,
        name: 'Reality Audit',
        unlockAt: 50,
        cost: { paper: 100, energy: 50 },
        outcomes: {
          corrupted: { desc: 'AUDIT FAILURE', sanity: -60, debuff: { ppMult: 0.25, xpMult: 0.25, duration: 300, cannotRest: true } },
          standard: { desc: 'Reality audited', buff: { ppMult: 1.80, xpMult: 1.80, duration: 720, energyCostMult: 0.50 } },
          pristine: { desc: 'REALITY OPTIMIZED', buff: { ppMult: 2.20, xpMult: 2.20, duration: 900, energyCostMult: 0.25, materialMult: 2 } },
          perfect: { desc: 'EXISTENCE PERFECTED', buff: { ppMult: 2.50, xpMult: 2.50, duration: 1200, energyCostMult: 0.10, materialMult: 3 } }
        }
      }
    ]
  },
  contract: {
    id: 'contract',
    name: 'Contract',
    description: 'Reality-bending agreements. High risk, high reward.',
    tiers: [
      {
        tier: 1,
        name: 'Minor Pact',
        unlockAt: 0,
        cost: { paper: 30, energy: 15, sanity: 10 },
        outcomes: {
          corrupted: { desc: 'Breach of contract', pp: -50, sanity: -20 },
          standard: { desc: 'Terms accepted', pp: 150 },
          pristine: { desc: 'Favorable terms', pp: 250, materials: 1 },
          perfect: { desc: 'Bargain struck', pp: 400, materials: 2 }
        }
      },
      {
        tier: 2,
        name: 'Standard Contract',
        unlockAt: 5,
        cost: { paper: 45, energy: 20, sanity: 15 },
        outcomes: {
          corrupted: { desc: 'Penalty clause invoked', pp: -100, sanity: -30, portalLock: 180 },
          standard: { desc: 'Obligations met', pp: 300, materials: 1 },
          pristine: { desc: 'Windfall clause', pp: 500, materials: 2, xp: 100 },
          perfect: { desc: 'Golden contract', pp: 800, materials: 3, xp: 200 }
        }
      },
      {
        tier: 3,
        name: 'Binding Agreement',
        unlockAt: 15,
        cost: { paper: 65, energy: 30, sanity: 20 },
        outcomes: {
          corrupted: { desc: 'VOID REJECTS', pp: -200, sanity: -40, allLocks: 60 },
          standard: { desc: 'Pact sealed', pp: 500, materials: 2 },
          pristine: { desc: 'Reality bends', pp: 800, materials: 4, buff: { materialMult: 2, duration: 300 } },
          perfect: { desc: 'VOID FAVORS YOU', pp: 1200, materials: 5, buff: { materialMult: 2, duration: 600 } }
        }
      },
      {
        tier: 4,
        name: 'Soul Contract',
        unlockAt: 30,
        cost: { paper: 90, energy: 45, sanity: 30 },
        outcomes: {
          corrupted: { desc: 'SOUL REJECTED', pp: -999, sanity: -50, dimensionalLock: 300 },
          standard: { desc: 'Soul bargained', pp: 800, materials: 3, buff: { ppPerSecondMult: 2, duration: 480 } },
          pristine: { desc: 'ESSENCE AMPLIFIED', pp: 1200, materials: 5, buff: { ppPerSecondMult: 3, duration: 600 } },
          perfect: { desc: 'TRANSCENDENCE', pp: 2000, materials: 8, buff: { ppPerSecondMult: 4, duration: 900 } }
        }
      },
      {
        tier: 5,
        name: 'Void Bargain',
        unlockAt: 50,
        cost: { paper: 150, energy: 80, sanity: 50 },
        outcomes: {
          corrupted: { desc: 'THE VOID CONSUMES', pp: -9999, sanity: -80, allDebuffs: true },
          standard: { desc: 'VOID PACT', pp: 1500, materials: 5, permanentPPPerSec: 0.5 },
          pristine: { desc: 'VOID BLESSING', pp: 2500, materials: 8, permanentPPPerSec: 1.0 },
          perfect: { desc: 'VOID MASTERY', pp: 4000, materials: 12, permanentPPPerSec: 2.0 }
        }
      }
    ]
  },
  prophecy: {
    id: 'prophecy',
    name: 'Prophecy',
    description: 'Forbidden knowledge. Requires low sanity.',
    tiers: [
      {
        tier: 1,
        name: 'Whisper',
        unlockAt: 0,
        maxSanity: 40,
        cost: { paper: 25, energy: 20 },
        outcomes: {
          corrupted: { desc: 'THE VOID LAUGHS', sanity: -10, lore: 'static' },
          standard: { desc: 'Faint voices', lore: 'hint' },
          pristine: { desc: 'Clear message', lore: 'hint', materials: 1 },
          perfect: { desc: 'Revelation', lore: 'secret', materials: 2 }
        }
      },
      {
        tier: 2,
        name: 'Vision',
        unlockAt: 5,
        maxSanity: 30,
        cost: { paper: 40, energy: 30 },
        outcomes: {
          corrupted: { desc: 'MADNESS CONSUMES', sanity: -20, lore: 'static' },
          standard: { desc: 'Visions surface', lore: 'hint', materials: 2 },
          pristine: { desc: 'Truth revealed', lore: 'secret', materials: 3, xp: 200 },
          perfect: { desc: 'CLARITY', lore: 'major', materials: 4, xp: 300 }
        }
      },
      {
        tier: 3,
        name: 'Revelation',
        unlockAt: 15,
        maxSanity: 20,
        cost: { paper: 60, energy: 45 },
        outcomes: {
          corrupted: { desc: 'REALITY BREAKS', sanity: -30, debuff: { ppMult: 0.50, duration: 180 } },
          standard: { desc: 'Secrets unveiled', lore: 'major', materials: 4 },
          pristine: { desc: 'HIDDEN PATHS', lore: 'location', materials: 6, xp: 400 },
          perfect: { desc: 'ENLIGHTENMENT', lore: 'location', materials: 8, xp: 500, skillPoint: 1 }
        }
      },
      {
        tier: 4,
        name: 'Epiphany',
        unlockAt: 30,
        maxSanity: 15,
        cost: { paper: 85, energy: 60 },
        outcomes: {
          corrupted: { desc: 'THE ABYSS STARES BACK', sanity: -40, debuff: { ppMult: 0.25, xpMult: 0.25, duration: 240 } },
          standard: { desc: 'TRUTH BREAKS THROUGH', lore: 'major', materials: 6, pp: 500 },
          pristine: { desc: 'REALITY UNVEILED', lore: 'ending', materials: 10, pp: 1000, skillPoint: 1 },
          perfect: { desc: 'ASCENSION GLIMPSED', lore: 'ending', materials: 15, pp: 2000, skillPoint: 2 }
        }
      },
      {
        tier: 5,
        name: 'APOTHEOSIS',
        unlockAt: 50,
        maxSanity: 10,
        cost: { paper: 120, energy: 100 },
        outcomes: {
          corrupted: { desc: 'YOU ARE NOT READY', sanity: -60, allDebuffs: true },
          standard: { desc: 'NEW PATH OPENS', lore: 'ending', materials: 10, pp: 1000 },
          pristine: { desc: 'REALITY TRANSCENDED', lore: 'ending', materials: 15, pp: 2000, skillPoint: 2 },
          perfect: { desc: 'GODHOOD ACHIEVED', lore: 'ending', materials: 20, pp: 5000, skillPoint: 5, permanentUnlock: true }
        }
      }
    ]
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
      'Text occasionally distorts'
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
    title: 'PERSONNEL FILE SYSTEM UNLOCKED',
    content: `You've gained a skill point!

Access the filing cabinet to view five skill branches:
• EFFICIENCY: Productivity and PP generation
• ADMIN: Paperwork quality and document management
• SURVIVAL: Energy and sanity management
• OCCULT: Dimensional powers (requires portal)
• [REDACTED]: Access denied (Level 20+ clearance)

Each branch contains tiered skills. Higher tiers require prerequisites.
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

Tears contain powerful equipment.
The void is generous to explorers.`,
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
  printerRoom: (state, prevState) => state.printerUnlocked && (!prevState || !prevState.printerUnlocked),
  documentSystem: (state, prevState) => state.paper >= 5 && state.printerUnlocked && (!prevState || prevState.paper < 5),
  portal: (state, prevState) => state.portalUnlocked && (!prevState || !prevState.portalUnlocked),
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
    archive: {
      name: 'The Archive',
      unlockHint: 'Purchase the Filing Cabinet Key upgrade on Day 5+',
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

/**
 * Mechanics Entries for Journal
 * Tied to HELP_POPUPS - when a help popup is dismissed, the mechanic is "learned"
 * Gradually reveals game systems without spoiling everything
 * (Added 2025-11-01)
 */
export const MECHANICS_ENTRIES = {
  welcome: {
    id: 'welcome',
    title: 'Basic Productivity',
    category: 'Core Mechanics',
    summary: 'The foundation of office existence.',
    details: `You generate Productivity Points (PP) by sorting papers. Each action costs energy, which regenerates over time or through resting.

The fluorescent lights provide ambient energy. The hum is constant.`
  },
  firstPassiveIncome: {
    id: 'firstPassiveIncome',
    title: 'Passive Generation',
    category: 'Automation',
    summary: 'Work continues in your absence.',
    details: `Certain upgrades grant passive PP generation (PP/sec). This accumulates even when not actively clicking.

Automation is the apex of productivity. The system needs no rest.`
  },
  lowSanity: {
    id: 'lowSanity',
    title: 'Meditation System',
    category: 'Sanity Management',
    summary: 'Breathing exercises restore mental clarity.',
    details: `When sanity drops below 25%, MEDITATION becomes available. Match the breathing rhythm (Inhale → Exhale) to restore sanity.

Better timing grants more sanity. Perfect timing is enlightenment.

Cost: 10 energy per session.`
  },
  sanityTiers: {
    id: 'sanityTiers',
    title: 'Sanity Tier System',
    category: 'Risk vs Reward',
    summary: 'Madness magnifies productivity.',
    details: `Your sanity level affects PP and XP generation:

🟢 HIGH (80-100%): 1.0x multiplier
🟡 MEDIUM (40-79%): 1.15x multiplier
🟠 LOW (10-39%): 1.35x multiplier
🔴 CRITICAL (0-9%): 1.5x multiplier

Lower sanity also degrades paper quality, affecting document creation.`
  },
  skillTree: {
    id: 'skillTree',
    title: 'Personnel File System',
    category: 'Progression',
    summary: 'Permanent character advancement via filing cabinet.',
    details: `Gain skill points by leveling up (1 per level, 3 at level 10/20/30...).

FILING CABINET BRANCHES:
📊 EFFICIENCY: PP generation bonuses (always unlocked)
📁 ADMIN: Paper quality, document effects (Level 5+)
🛡️ SURVIVAL: Energy costs, sanity management (Level 5+)
🌀 OCCULT: Dimensional materials, portal improvements (portal required)
⬛ [REDACTED]: Forbidden knowledge (Level 20+)

Each branch has 3-5 tiers. Higher tiers require prerequisites.
Skills stack multiplicatively. Max 5 levels per skill.

Skills are permanent. Reality remembers your choices.`
  },
  printerRoom: {
    id: 'printerRoom',
    title: 'Printer & Paper System',
    category: 'Core Mechanics',
    summary: 'Transform energy into physical currency.',
    details: `PRINT PAPERS converts 3 energy into paper currency.

Paper Quality = (Printer Quality × 70%) + (Sanity × 30%)

At critical sanity, weights shift to 50/50.

Paper is used for:
• Printer upgrades
• Creating documents
• Crafting dimensional upgrades`
  },
  documentSystem: {
    id: 'documentSystem',
    title: 'Document Creation (Revised)',
    category: 'Advanced Mechanics',
    summary: 'Paper transformed into power.',
    details: `Documents have 5 TIERS each, unlocked by printing:
• Tier 1: 0 prints (always available)
• Tier 2: 5 prints
• Tier 3: 15 prints
• Tier 4: 30 prints
• Tier 5: 50 prints

Every print ROLLS for QUALITY OUTCOME:
💀 Corrupted (0-30%): Negative effects
📄 Standard (31-60%): Base effect
✨ Pristine (61-90%): Enhanced effect
⭐ Perfect (91-100%): Exceptional effect

Higher tiers = higher stakes. Tier 5 Perfect outcomes grant permanent upgrades.

MEMOS: Sanity restoration + buffs
REPORTS: PP/XP/material multipliers
CONTRACTS: Instant rewards + permanent PP/sec
PROPHECIES: Lore + materials (requires low sanity)`
  },
  portal: {
    id: 'portal',
    title: 'Dimensional Portal',
    category: 'Exploration',
    summary: 'A tear in reality.',
    details: `Enter to collect dimensional materials from floating nodes.

Capacity limit depends on upgrades. Exit to transfer materials to inventory.

Materials craft powerful dimensional upgrades at the portal shop.

Cooldown: 60 seconds (reducible with upgrades)`
  },
  paperQuality: {
    id: 'paperQuality',
    title: 'Paper Quality Thresholds',
    category: 'Document System',
    summary: 'Quality gates document creation.',
    details: `Minimum quality required per tier varies by document type.

Low-tier documents are more forgiving. High-tier documents demand precision.

At critical sanity, corrupted outcomes become more likely regardless of printer quality.

Raise sanity or upgrade printers to improve quality.`
  },
  debug: {
    id: 'debug',
    title: 'Code Debugging',
    category: 'Minigames',
    summary: 'Fix reality\'s syntax errors.',
    details: `Debug challenges appear randomly in certain locations.

Find and fix the bug in the code snippet.
• 3 attempts per challenge
• Success: PP reward + sanity restore
• Failure: Lose sanity

The bugs are features. The features are bugs.`
  },
  dimensionalTear: {
    id: 'dimensionalTear',
    title: 'Dimensional Tears & Loot',
    category: 'Advanced Mechanics',
    summary: 'Rifts containing powerful equipment.',
    details: `Tears spawn randomly during your work (chance-based).

Clicking a tear generates RANDOMIZED LOOT:
• Weapons
• Armor (head/chest/accessory)
• Anomalies (special effects)

RARITY TIERS:
Common → Uncommon → Rare → Epic → Legendary → Mythic

Higher rarities have:
• Better stat ranges
• More imbuement effects
• Stronger bonuses

Loot is stored in inventory and can be equipped in the Armory.`
  },
  archive: {
    id: 'archive',
    title: 'The Archive',
    category: 'Exploration',
    summary: 'Files that shouldn\'t exist.',
    details: `Examine documents to read lore entries.

Each examination grants small rewards and increases discovery counter.

The files contain:
• Employee records from non-existent people
• Memos dated from impossible years
• Your own documents from timelines that never were

Reading them all reveals... patterns.`
  }
};