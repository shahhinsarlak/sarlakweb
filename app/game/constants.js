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
  achievements: [],
  examiningItem: null,
  archiveOpen: false,
  sortCount: 0,
  examinedItems: 0,
  examinedArchiveItems: [],  // Array of archive item IDs that have been examined (costs 25 energy first time)
  meditating: false,
  breathCount: 0,
  maxLogMessages: 15,
  portalUnlocked: false,
  inDimensionalArea: false,
  dimensionalInventory: {},
  portalCooldown: 0,
  dimensionalUpgrades: {},
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
  // Help System (Added 2025-10-26)
  // Tracks which help popups have been shown to avoid repetition
  helpEnabled: true, // Can be toggled by player
  shownHelpPopups: [], // Array of popup IDs that have been shown
  currentHelpPopup: null, // Current popup to display (object with id, title, content)
  meditationUnlocked: false, // Meditation button only appears after reaching 25% sanity
  // Journal System (Added 2025-10-31, Revised 2025-11-01)
  // Tracks discoveries for the player's journal
  journalOpen: false,              // Is journal UI visible
  journalTab: 'locations',         // Current tab: locations, mechanics
  discoveredLocations: ['cubicle'], // Location IDs that have been visited
  discoveredMechanics: [],         // Mechanic IDs learned from help popups
  // Notification System (Added 2025-11-20)
  // Displays temporary popups in top-left corner
  notifications: [],  // Array of notification objects: { id, message, timestamp }
  // PP Tier Multiplier System
  ppMultiplierTier: 0, // Current tier index (0 = no tier unlocked yet)
  maxSanity: 100,               // Mutable sanity cap
  // Focus Mode (Phase 20)
  focusModeExpiry: 0,           // Unix ms timestamp when buff expires (0 = inactive)
  // Offline Accumulation (Phase 20)
  lastSavedAt: 0,               // Unix ms timestamp of last save
  // Chapter 2: A Way Through (Phase 1)
  chapter: 1,                   // Narrative chapter (1 = the office loop, 2 = the climb)
  chapter2IntroActive: false,   // Cinematic intro is currently playing (full-screen)
  chapter2IntroSeen: false,     // Cinematic has already played (never replay)
  // New resources, discovered on first reaching 1000% sanity
  resourcesUnlocked: false,     // Lucidity/Intelligence revealed + spendable
  lucidity: 0,                  // Perception resource (gathered by staying lucid)
  intelligence: 0,              // Understanding resource (debug, reports, lucid trickle)
  lucidAnchorTier: 0,           // Lucid Anchor checkpoint (0-3 -> sanity floor 0/250/500/750)
  researchedInsights: [],       // Insight ids researched in the Insights panel
  insightsOpen: false,          // Is the Insights panel visible
  // Factory / "The Construct" (Chapter 2, Phase 2)
  factoryUnlocked: false,       // Revealed alongside lucidity/intelligence at 1000% sanity
  factoryOpen: false,           // Is the Factory panel visible
  power: 0,                     // Stored grid power (battery), 0..capacity
  substrate: 0,                 // Raw resource mined by Extractors, consumed by Converters
  factoryMachines: {},          // { machineId: level } owned machines (level 0..max)
  factoryBlueprints: [],        // Researched converter blueprint ids (generator/extractor need none)
  factoryMaterialAcc: 0,        // Fractional dimensional-material accumulator (materials are integers)
  factoryPaused: {},            // { machineId: true } paused machines (no draw, no output)
  factoryOverclock: {},         // { machineId: percent } overclock setting (50-cap; needs Overclock Module)
  factoryTransmuteTarget: 'static_crystal', // Material Transmuter's chosen output material
  factoryTransmuteVoidAcc: 0,   // Fractional void fragments pending consumption (Transmuter)
  factoryTransmuteOutAcc: 0,    // Fractional target material pending output (Transmuter)
  // Expeditions / "The Undercroft" (Chapter 2, Phase A)
  undercroftUnlocked: false,    // Revealed when the running factory breaks through the floor
  undercroftOpen: false,        // Is the Undercroft panel visible
  factoryFullRunSeconds: 0,     // Sustained full-operation counter toward the breakthrough
  undercroftTab: 'expedition',  // Active Undercroft tab: expedition | prepare | armory
  minds: [],                    // [{ id, designation, level, xp, resolve, acuity, will, traits[], scars[], status }]
  mindCounter: 0,               // Serial counter for mind designations (Copy I, II, ...)
  printBeds: 3,                 // Roster cap (max simultaneous minds)
  shells: [],                   // [{ id, coreId, maxHp }] crafted expedition bodies
  weapons: [],                  // [{ id, typeId, rarityId }] crafted weapon instances
  gearInventory: {},            // { gearId: count } crafted instruments / wards / plating
  provisions: {},               // { provId: count } brewed consumables
  weaponBlueprints: [],         // Owned weapon blueprints, keyed 'typeId:rarityId' (permanent)
  researchedGear: [],           // Researched non-weapon gear blueprint ids
  rollPity: 0,                  // Rolls since the last Rare-or-better (soft pity)
  lastRoll: null,               // Most recent rolled blueprint { typeId, rarityId, dup } (for reveal)
  wayOutFragments: 0,           // Reclaimed "pieces of the way out" (Phase C)
  // Expeditions chart + dispatch (Chapter 2, Phase B)
  chartPages: [],               // [{ tier, seed, nodes:[...], gatewayId, breached, routes:[] }]
  currentTier: 0,               // Selected chart page tab
  expeditions: [],              // Active expedition records (resolved over time in the tick)
  expeditionCounter: 0,         // Serial counter for expedition ids/route seeds
  // Expeditions stakes + ending (Chapter 2, Phase C)
  loopCount: 0,                 // How many times the "way out" has looped back in
  loopEndingActive: false,      // The loop-ending cinematic is playing (full-screen)
  mindsLost: 0,                 // Minds lost permanently on expeditions
};


export const LORE_SNIPPETS = {
  hint: [
    'The lights remember every face. Yours included.',
    'Somewhere in the building, a clock runs backwards. You\'ve heard it.',
    'Your coffee cup has been empty since before you arrived.',
    'The exit signs point inward.',
    'There is a floor between 3 and 4. No one talks about it.',
  ],
  secret: [
    'The performance reviews were written before the company existed.',
    'MEMO TO SELF: do not open the filing cabinet in room 7. MEMO TO SELF: you already did.',
    'Employee #0000 has never clocked out. Employee #0000 is you.',
    'The building was constructed around the people inside it.',
    'Your contract expires the day after it ends.',
  ],
  major: [
    'The dimensional portal does not lead out. It leads further in.',
    'The fluorescent lights are not lights. They are observers.',
    'Every document you print is a message to yourself from a future you cannot reach.',
    'The office has no outside. There is only more office.',
  ],
  location: [
    'The archive smells like a room that has been sealed for years. You visit it daily.',
    'The printer room hums at a frequency that feels like a word you almost remember.',
    'The portal was here before the building. The building grew around it.',
    'Cubicle 4B has been assigned to the same person for forty years. Different people.',
  ],
  ending: [
    'You will see this again. From the other side.',
    'When the loop closes, you will have forgotten this. That is the point.',
    'The ending is not an ending. It is a different beginning with the same furniture.',
    'You sorted enough papers. The building noticed.',
  ],
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
      {
        id: 'birthday',
        name: 'Birthday Card',
        story: 'Happy 43rd Birthday! The entire office signed it. There are 1,847 signatures. You recognize all of them. They\'re all yours. Different handwriting, different pens, different years. Some signatures are dated from decades you haven\'t lived yet.'
      },
      {
        id: 'timecard',
        name: 'Timesheet - Week 0',
        story: 'Monday: 8 hours. Tuesday: 8 hours. Wednesday: 8 hours. Thursday: 8 hours. Friday: 8 hours. Saturday: You don\'t work Saturdays. Sunday: You don\'t work Sundays. Total: 847 hours. "Overtime approved by: The Fluorescent Lights."'
      },
      {
        id: 'complaint',
        name: 'HR Complaint Form',
        story: 'Employee Name: [REDACTED]. Complaint: "The coffee machine is screaming." Date Filed: Every Tuesday. HR Response: "Coffee machine does not exist. Employee has been working here for -3 years. Complaint valid. No action required."'
      },
      {
        id: 'training',
        name: 'Safety Training Manual',
        story: 'Chapter 4: What To Do If You Stop Existing. Step 1: Remain calm. Step 2: Continue working. Step 3: Do not inform HR. Step 4: You have always been here. Step 5: Ignore the humming. Step 6: Return to Step 1.'
      },
      {
        id: 'meeting',
        name: 'Meeting Minutes',
        story: 'All-Hands Meeting, Conference Room B. Attendees: Everyone. No one. You (x847). Topics Discussed: The Quota. The Lights. The Thing In The Break Room. Action Items: Exist harder. Forget meeting occurred. Schedule next meeting for yesterday.'
      },
      {
        id: 'vacation',
        name: 'Vacation Request',
        story: 'Request: 2 weeks PTO, dates: ██/██ to ██/██. Manager Response: "DENIED. Reason: You are currently on vacation. You have been on vacation for 12 years. You are also at your desk. Please return from vacation to submit vacation request."'
      },
      {
        id: 'exit',
        name: 'Exit Interview Notes',
        story: 'Employee: You. Reason for Leaving: "I want to exist somewhere else." Length of Employment: ∞ years. Would you recommend this company: Yes (No is not an option). Final Comments: "I never clocked in. I can\'t clock out. The lights are following me home."'
      },
      {
        id: 'directory',
        name: 'Phone Directory',
        story: 'A-C: You (ext. 0000). D-F: You (ext. 0000). G-I: You (ext. 0000). J-L: You (ext. 0000). M-O: You (ext. 0000). P-R: You (ext. 0000). S-U: You (ext. 0000). V-Z: You (ext. 0000). Emergency Contact: You (ext. 0000).'
      },
      {
        id: 'medical',
        name: 'Medical Records',
        story: 'Patient: You. Diagnosed Conditions: Temporal Displacement Syndrome, Chronic Existence Failure, Fluorescent Light Sensitivity. Prescribed Treatment: Continue working. Prognosis: You have always had these conditions. They predate your birth.'
      },
      {
        id: 'emergency',
        name: 'Emergency Procedures',
        story: 'IN CASE OF REALITY BREACH: 1) Do not acknowledge the breach. 2) Continue sorting papers. 3) If walls become transparent, maintain eye contact with your desk. 4) If you see yourself, you are the copy. Proceed to Archive. 5) The lights will guide you.'
      },
      {
        id: 'newsletter',
        name: 'Company Newsletter',
        story: 'Employee of the Month: You (847th consecutive month!). Upcoming Events: The Reckoning (TBD). Office Closures: Never. Reminder: The coffee machine incident never happened. Please stop reporting it. Birthday: You (Every day). In Memoriam: You (1987-2∞∞∞).'
      },
      {
        id: 'layoff',
        name: 'Layoff Notice',
        story: 'Dear Employee, due to restructuring, your position has been eliminated effective ██/██/████. You are no longer employed. Please continue reporting to work. Your final paycheck will be deposited never. Thank you for your -12 years of service.'
      },
      {
        id: 'policy',
        name: 'Updated Company Policy',
        story: 'Effective immediately: Employees must exist between 9 AM - 5 PM. Non-existence during business hours will result in disciplinary action. Breaks: Two 15-min non-existence breaks permitted. Dress Code: Casual Fridays now include partial transparency.'
      },
      {
        id: 'maintenance',
        name: 'Maintenance Log - Lights',
        story: 'Entry 1: Lights installed. Entry 2: Lights watching. Entry 3: Lights humming. Entry 847: Lights have always been here. Entry 848: We installed the building around the lights. Entry 849: The lights installed us. Entry ∞: [DATA EXPUNGED]'
      },
      {
        id: 'security',
        name: 'Security Footage Log',
        story: 'Camera 1 - Cubicle Area: Subject enters 9:04 AM. Subject never leaves. Camera 2 - Hallway: Empty. Always empty. Was never not empty. Camera 3 - Break Room: [FOOTAGE CORRUPTED]. Camera 4 - Your Desk: You are watching yourself watch this footage.'
      },

      // Encrypted documents with eerie ASCII art
      {
        id: 'encrypted_eye',
        name: 'O̷B̷S̷E̷R̷V̷A̷T̷I̷O̷N̷ ̷L̷O̷G̷',
        story: `The document shows only this:

        ░░░░░░░░░░░░░░░░░░░░░░░░░░░
        ░░░░░░░▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░
        ░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
        ░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░
        ░░░▓▓▓▓▓▓░░░░░░░▓▓▓▓▓▓░░░░░
        ░░▓▓▓▓▓░░░░░░░░░░░▓▓▓▓▓░░░░
        ░░▓▓▓▓░░░░▓▓▓▓▓░░░░▓▓▓▓░░░░
        ░▓▓▓▓░░░░▓▓▓▓▓▓▓░░░░▓▓▓▓░░░
        ░▓▓▓▓░░░░▓▓▓▓▓▓▓░░░░▓▓▓▓░░░
        ░▓▓▓▓░░░░░▓▓▓▓▓░░░░░▓▓▓▓░░░
        ░░▓▓▓▓░░░░░░░░░░░░░▓▓▓▓░░░░
        ░░▓▓▓▓▓░░░░░░░░░░░▓▓▓▓▓░░░░
        ░░░▓▓▓▓▓▓░░░░░░░▓▓▓▓▓▓░░░░░
        ░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░
        ░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
        ░░░░░░░▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░
        ░░░░░░░░░░░░░░░░░░░░░░░░░░░

        IT SEES YOU`
      },
      {
        id: 'encrypted_hallway',
        name: 'C̸O̸R̸R̸I̸D̸O̸R̸ ̸M̸A̸P̸',
        story: `The page depicts:

        ║║║║║║║║║║║║║║║║║║║║║║║║║║║║
        ║                          ║
        ║    ┌─────────────────┐   ║
        ║    │                 │   ║
        ║    │    ░░░░░░░░░    │   ║
        ║    │    ░░░░█░░░░    │   ║
        ║    │    ░░░███░░░    │   ║
        ║    │    ░░█████░░    │   ║
        ║    │    ░███████░    │   ║
        ║    │    ░░█████░░    │   ║
        ║    │    ░░░███░░░    │   ║
        ║    │    ░░░░█░░░░    │   ║
        ║    │    ░░░░█░░░░    │   ║
        ║    │                 │   ║
        ║    └─────────────────┘   ║
        ║                          ║
        ║║║║║║║║║║║║║║║║║║║║║║║║║║║║

        SOMEONE IS STANDING AT THE END
        THEY HAVE BEEN THERE SINCE BEFORE THE BUILDING WAS BUILT`
      },
      {
        id: 'encrypted_spiral',
        name: 'R̷E̷A̷L̷I̷T̷Y̷ ̷M̷A̷T̷R̷I̷X̷',
        story: `The text spirals inward:

                    ██████████████████
                ████                  ████
              ██                          ██
            ██    ████████████████████      ██
          ██    ██                    ██      ██
        ██    ██    ██████████████      ██      ██
        ██    ██  ██              ██      ██    ██
        ██    ██  ██  ██████████  ██      ██    ██
        ██    ██  ██  ██      ██  ██      ██    ██
        ██    ██  ██  ██  ██  ██  ██      ██    ██
        ██    ██  ██  ██████████  ██      ██    ██
        ██    ██  ██              ██      ██    ██
        ██    ██    ██████████████████    ██    ██
          ██    ██                    ██  ██  ██
            ██    ████████████████████    ██
              ██                        ██
                ████                  ████
                    ██████████████████

        THE CENTER IS EVERYWHERE
        YOU ARE ALREADY THERE`
      },
      {
        id: 'encrypted_lights',
        name: 'L̴I̴G̴H̴T̴ ̴P̴A̴T̴T̴E̴R̴N̴S̴',
        story: `Fluorescent schematic:

        ═══════════════════════════════════════
        ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║
        ║ ▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓ ║
        ═══════════════════════════════════════
                       █████
                       █████
                       █████
        ═══════════════════════════════════════
        ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║
        ║ ▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓ ║
        ═══════════════════════════════════════
                       █████
                       █████
                       █████
        ═══════════════════════════════════════
        ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║
        ║ ▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓ ║
        ═══════════════════════════════════════

        THEY ARE NOT PROVIDING LIGHT
        THEY ARE CONSUMING DARKNESS
        THEY HUNGER`
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
    desc: 'Debug rewards scale with your passive income (90s worth) and grant a 5 min +25% PP buff. Failed attempts no longer drain sanity.' 
  },
  {
    id: 'singularity_engine', 
    name: 'Singularity Engine', 
    materials: { singularity_node: 1 }, 
    effect: 'ppPerSecond', 
    value: 50, 
    desc: 'Harness the void itself. +50 PP/sec. Unlock The Void.' 
  },

  // Research
  { 
    id: 'material_scanner', 
    name: 'Material Scanner', 
    materials: { reality_dust: 10 }, 
    effect: 'portalScan', 
    value: true, 
    desc: 'Attunes the portal. Rarer materials spawn far more often (+50% rarity odds).' 
  },
  { 
    id: 'dimensional_codex', 
    name: 'Dimensional Codex', 
    materials: { void_fragment: 15, static_crystal: 15, glitch_shard: 15, reality_dust: 15 }, 
    effect: 'unlock', 
    value: 'lore', 
    desc: 'Unlock hidden truths. Achievement hints revealed.' 
  },
  

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
  { id: 'email1', prob: 0.08, sanity: -5, message: 'New email: "Meeting moved to yesterday. Attendance mandatory."', minDay: 1 },
  { id: 'whisper', prob: 0.06, sanity: -3, message: 'You hear someone whisper your employee ID number.', minDay: 2 },
  { id: 'memo', prob: 0.09, pp: 50, message: 'You find a memo: "Productivity +5%. Reality -2%. Good work."', minDay: 3 },
  { id: 'coffee_spill', prob: 0.11, energy: -10, message: 'Your coffee spills. Upwards.', minDay: 2 },
  { id: 'coworker', prob: 0.04, sanity: -10, message: 'Your coworker asks how long you\'ve worked here. You don\'t remember them.', minDay: 4 },
  { id: 'promotion_offer', prob: 0.02, pp: 200, message: 'Promotion offer! Accept within 3 seconds. You accepted it 5 seconds ago.', minDay: 5 },
  { id: 'lights_flicker', prob: 0.14, message: 'The lights flicker. In morse code. It says: HELP', minDay: 3 },
  { id: 'extra_finger', prob: 0.02, sanity: -20, message: 'You count your fingers. 11. That seems right.', minDay: 7 },
  { id: 'good_news', prob: 0.08, pp: 100, energy: 20, message: 'Good news! Your performance review is... satisfactory.', minDay: 2 },
  { id: 'phone_ring', prob: 0.05, sanity: -5, message: 'The phone rings. It\'s not plugged in.', minDay: 4 },
  { id: 'mirror', prob: 0.03, sanity: -15, message: 'You see your reflection. It\'s younger than you. It mouths: "Get out."', minDay: 6 },
  { id: 'overtime', prob: 0.08, pp: 150, energy: -30, message: 'Mandatory overtime. You\'ve been here 23 hours today. The sun hasn\'t moved.', minDay: 5 },
  { id: 'compliment', prob: 0.11, sanity: 5, message: 'Your manager says you\'re doing great. You\'ve never met your manager.', minDay: 3 },
  { id: 'glitch', prob: 0.05, sanity: -8, message: 'Reality.exe has stopped responding. Resuming...', minDay: 8 },
  { id: 'bonus', prob: 0.04, pp: 500, message: 'Quarterly bonus! Direct deposited to \u2588\u2588\u2588\u2588\u2588\u2588\u2588', minDay: 10 }
];

export const ACHIEVEMENTS = [
  { id: 'first_day', name: 'First Day', desc: 'Survive Day 1', check: (state) => state.day >= 2, reward: { type: 'ppMultiplier', value: 0.01 } },
  { id: 'week_one', name: 'Week One Complete', desc: 'Survive 7 days', check: (state) => state.day >= 8, reward: { type: 'ppMultiplier', value: 0.03 } },
  { id: 'productivity', name: 'Productivity Champion', desc: 'Earn 10,000 PP', check: (state) => state.pp >= 10000, reward: { type: 'ppMultiplier', value: 0.02 } },
  { id: 'sorting', name: 'Paper Pusher', desc: 'Sort papers 100 times', check: (state) => state.sortCount >= 100 },
  { id: 'explorer', name: 'Explorer', desc: 'Unlock all locations', check: (state) => state.unlockedLocations.length >= 4, reward: { type: 'ppMultiplier', value: 0.03 } },
  { id: 'consumer', name: 'Consumer', desc: 'Buy 5 upgrades', check: (state) => Object.keys(state.upgrades).length >= 5 },
  { id: 'archivist', name: 'Archivist', desc: 'Discover The Archive', check: (state) => state.unlockedLocations.includes('archive') },
  { id: 'reader', name: 'Archive Explorer', desc: 'Examine 10 items in The Archive', check: (state) => state.examinedArchiveItems?.length >= 10 },
  { id: 'complete_archivist', name: 'Forbidden Knowledge', desc: 'Examine all 29 books in The Archive', check: (state) => state.examinedArchiveItems?.length >= 29, reward: { type: 'ppMultiplier', value: 0.08 } },
  { id: 'survivor', name: 'Survivor', desc: 'Reach Day 30', check: (state) => state.day >= 30, reward: { type: 'ppMultiplier', value: 0.05 } },
  { id: 'insane', name: 'Lost Mind', desc: 'Drop sanity below 10%', check: (state) => state.sanity < 10 },
  { id: 'workaholic', name: 'Workaholic', desc: 'Earn 50,000 PP', check: (state) => state.pp >= 50000, reward: { type: 'ppMultiplier', value: 0.05 } },
  { id: 'portal_finder', name: 'Between Worlds', desc: 'Discover The Portal', check: (state) => state.portalUnlocked, reward: { type: 'portalCooldownReduction', value: 0.05 } },
  { id: 'first_material', name: 'Dimensional Miner', desc: 'Collect your first dimensional material', check: (state) => Object.values(state.dimensionalInventory || {}).reduce((sum, count) => sum + count, 0) > 0 },
  { id: 'material_hoarder', name: 'Material Hoarder', desc: 'Collect 100 total materials', check: (state) => Object.values(state.dimensionalInventory || {}).reduce((sum, count) => sum + count, 0) >= 100, reward: { type: 'portalCooldownReduction', value: 0.03 } },
  { id: 'rare_finder', name: 'Rare Find', desc: 'Collect a Temporal Core', check: (state) => (state.dimensionalInventory?.temporal_core || 0) > 0 },
  { id: 'essence_collector', name: 'Essence Collector', desc: 'Collect Dimensional Essence', check: (state) => (state.dimensionalInventory?.dimensional_essence || 0) > 0 },
  { id: 'singularity_hunter', name: 'Singularity Hunter', desc: 'Find a Singularity Node', check: (state) => (state.dimensionalInventory?.singularity_node || 0) > 0 },
  { id: 'first_dimensional_upgrade', name: 'Dimensional Crafter', desc: 'Purchase first dimensional upgrade', check: (state) => Object.keys(state.dimensionalUpgrades || {}).length > 0 },
  { id: 'reality_hacker', name: 'Reality Hacker', desc: 'Unlock all portal upgrades', check: (state) => state.dimensionalUpgrades?.dimensional_anchor && state.dimensionalUpgrades?.reality_stabilizer && state.dimensionalUpgrades?.temporal_accelerator, reward: { type: 'portalCooldownReduction', value: 0.08 } },
  // Printer Achievements
  { id: 'printer_access', name: 'Print Run', desc: 'Unlock the Printer Room', check: (state) => state.printerUnlocked },
  { id: 'first_print', name: 'First Print', desc: 'Print your first distorted page', check: (state) => state.printCount >= 1 },
  { id: 'paper_hoarder', name: 'Paper Hoarder', desc: 'Accumulate 100 Paper', check: (state) => state.paper >= 100 },
  { id: 'paper_mogul', name: 'Paper Mogul', desc: 'Accumulate 1000 Paper', check: (state) => state.paper >= 1000 },
  { id: 'quality_control', name: 'Quality Control', desc: 'Reach 100% printer quality', check: (state) => state.printerQuality >= 100 },
  { id: 'print_master', name: 'Print Master', desc: 'Buy all printer upgrades', check: (state) => Object.keys(state.printerUpgrades || {}).length >= 12, reward: { type: 'ppMultiplier', value: 0.03 } },
  { id: 'reality_manifest', name: 'Reality Manifest', desc: 'Unlock the Reality Printer', check: (state) => state.printerUpgrades?.reality_printer },
  // Paper & Sanity System Achievements
  { id: 'embrace_madness', name: 'Embrace Madness', desc: 'Generate PP at critical sanity (<10%)', check: (state) => state.sortCount >= 1 && state.sanity < 10 },
  { id: 'bureaucrat', name: 'Master Bureaucrat', desc: 'File 50 reports', check: (state) => (state.documentMastery?.reports || 0) >= 50, reward: { type: 'ppMultiplier', value: 0.02 } },
  { id: 'reality_bender_paper', name: 'Reality Contractor', desc: 'Print 10 reality contracts', check: (state) => (state.documentMastery?.contracts || 0) >= 10 },
  // Chapter 2: A Way Through
  { id: 'a_way_through', name: 'A Way Through', desc: 'Begin Chapter 2', check: (state) => (state.chapter || 1) >= 2 },
  { id: 'first_lucidity', name: 'Lucid', desc: 'Push your sanity above 100%', check: (state) => state.sanity > 100, reward: { type: 'ppMultiplier', value: 0.03 } },
  { id: 'transcendent_mind', name: 'Transcendent', desc: 'Reach 1000% sanity', check: (state) => state.sanity >= 1000, reward: { type: 'ppMultiplier', value: 0.10 } },
  { id: 'first_insight', name: 'Insight', desc: 'Research your first insight', check: (state) => (state.researchedInsights || []).length >= 1 },
  { id: 'lucid_scholar', name: 'Lucid Scholar', desc: 'Research 10 insights', check: (state) => (state.researchedInsights || []).length >= 10, reward: { type: 'ppMultiplier', value: 0.08 } },
  { id: 'enlightened', name: 'Enlightened', desc: 'Research every insight', check: (state) => (state.researchedInsights || []).length >= 21, reward: { type: 'ppMultiplier', value: 0.20 } },
  { id: 'the_construct', name: 'The Construct', desc: 'Build your first factory machine', check: (state) => Object.keys(state.factoryMachines || {}).length >= 1 },
  { id: 'automation', name: 'Automation', desc: 'Research all five converter blueprints', check: (state) => (state.factoryBlueprints || []).length >= 5, reward: { type: 'ppMultiplier', value: 0.10 } },
  { id: 'substrate_baron', name: 'Substrate Baron', desc: 'Stockpile 1000 substrate', check: (state) => (state.substrate || 0) >= 1000 },
  { id: 'master_engineer', name: 'Master Engineer', desc: 'Fully upgrade a factory machine to level 10', check: (state) => Object.values(state.factoryMachines || {}).some((lvl) => lvl >= 10), reward: { type: 'ppMultiplier', value: 0.15 } },
  { id: 'overclocked', name: 'Overclocked', desc: 'Run a machine above 100% power', check: (state) => Object.values(state.factoryOverclock || {}).some((v) => v > 100) },
  { id: 'beyond_limits', name: 'Beyond Limits', desc: 'Overclock a machine past 300% with the Overclock Regulator', check: (state) => Object.values(state.factoryOverclock || {}).some((v) => v > 300), reward: { type: 'ppMultiplier', value: 0.10 } },
  { id: 'breakthrough', name: 'Breakthrough', desc: 'Run the whole Construct at once until the floor gives way', check: (state) => !!state.undercroftUnlocked },
  { id: 'first_copy', name: 'First Copy', desc: 'Print your first mind in the Undercroft', check: (state) => (state.mindCounter || 0) >= 1 },
  { id: 'armoury', name: 'Armoury', desc: 'Roll your first weapon blueprint', check: (state) => (state.weaponBlueprints || []).length >= 1 },
  { id: 'legendary_find', name: 'Legendary Find', desc: 'Roll a Legendary or Mythic weapon blueprint', check: (state) => (state.weaponBlueprints || []).some((k) => k.endsWith(':legendary') || k.endsWith(':mythic')), reward: { type: 'ppMultiplier', value: 0.10 } },
  { id: 'into_the_deep', name: 'Into the Deep', desc: 'Chart a third tier of the Undercroft', check: (state) => (state.chartPages || []).some((p) => p.tier >= 2) },
  { id: 'lost_to_dark', name: 'Lost to the Dark', desc: 'Lose a mind, permanently, in the dark', check: (state) => (state.mindsLost || 0) >= 1 },
  { id: 'the_loop', name: 'The Loop', desc: 'Reach the way out, and find it leads back in', check: (state) => (state.loopCount || 0) >= 1, reward: { type: 'ppMultiplier', value: 0.25 } },
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
 * PP Multiplier Tier System
 *
 * As players accumulate PP, they unlock permanent multiplier tiers.
 * Each tier increases the PP multiplier applied to all PP gains.
 * Checked every 100ms in the game tick.
 */
export const PP_MULTIPLIER_TIERS = [
  { tier: 1, threshold: 10000,       multiplier: 2,  name: 'Reality Bonus',         desc: 'Productivity doubles. The office approves.' },
  { tier: 2, threshold: 1000000,     multiplier: 5,  name: 'Void Coefficient',      desc: 'Existence is multiplicative. Not additive.' },
  { tier: 3, threshold: 1000000000,  multiplier: 25, name: 'Singularity Resonance', desc: 'Numbers are no longer real. Neither are you.' }
];

/**
 * Document Tier System (Revised 2025-11-01)
 *
 * Each document type has 5 tiers that unlock based on mastery (total prints):
 * - Tier 1: 0 prints (always available)
 * - Tier 2: 3 prints
 * - Tier 3: 8 prints
 * - Tier 4: 18 prints
 * - Tier 5: 30 prints
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
        unlockAt: 3,
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
        unlockAt: 8,
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
        unlockAt: 18,
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
        unlockAt: 30,
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
        unlockAt: 3,
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
        unlockAt: 8,
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
        unlockAt: 18,
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
        unlockAt: 30,
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
        unlockAt: 3,
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
        unlockAt: 8,
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
        unlockAt: 18,
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
        unlockAt: 30,
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
        unlockAt: 3,
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
        unlockAt: 8,
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
        unlockAt: 18,
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
        unlockAt: 30,
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
  },
  // --- Chapter 2 lucid tiers (sanity > 100, unlocked once the cap is broken) ---
  // PP/XP stay at the 1.0x baseline here: clarity is NOT the productivity path
  // (low sanity still is). Lucid tiers instead generate the new resources.
  lucid1: {
    min: 100,
    max: 249,
    name: 'Lucid Mind',
    color: '#00d0ff',
    ppMultiplier: 1.0,
    xpMultiplier: 1.0,
    lucidityRate: 0.1,
    intelRate: 0.02,
    description: 'You can see the edges of the room for what they are.',
    effects: [
      'PP and XP at baseline (decay no longer rewards you)',
      'Lucidity gathers slowly',
      'Sanity drifts back toward 100% without upkeep'
    ]
  },
  lucid2: {
    min: 250,
    max: 499,
    name: 'Sharpened Focus',
    color: '#33ddff',
    ppMultiplier: 1.0,
    xpMultiplier: 1.0,
    lucidityRate: 0.25,
    intelRate: 0.05,
    description: 'The hum recedes. Thought moves faster than the lights.',
    effects: [
      'Lucidity gathers faster',
      'A faint understanding begins to settle'
    ]
  },
  lucid3: {
    min: 500,
    max: 749,
    name: 'Piercing Clarity',
    color: '#66ccff',
    ppMultiplier: 1.0,
    xpMultiplier: 1.0,
    lucidityRate: 0.5,
    intelRate: 0.1,
    description: 'You perceive the seams where reality was stitched together.',
    effects: [
      'Strong lucidity generation',
      'Understanding gathers steadily'
    ]
  },
  lucid4: {
    min: 750,
    max: 999,
    name: 'Boundless Awareness',
    color: '#99bbff',
    ppMultiplier: 1.0,
    xpMultiplier: 1.0,
    lucidityRate: 0.75,
    intelRate: 0.15,
    description: 'The walls are suggestions now. You are almost through.',
    effects: [
      'Rapid lucidity generation',
      'Understanding flows freely'
    ]
  },
  transcendent: {
    min: 1000,
    max: 1000,
    name: 'TRANSCENDENT',
    color: '#ffffff',
    ppMultiplier: 1.0,
    xpMultiplier: 1.0,
    lucidityRate: 1.0,
    intelRate: 0.25,
    description: 'You see the way through. It was always here.',
    effects: [
      'Maximum lucidity generation',
      'Maximum passive understanding'
    ]
  }
};

/**
 * Lucid Anchor floors (Chapter 2)
 * Index by lucidAnchorTier (0-3). Each tier sets a hard sanity floor so a climb
 * becomes a permanent checkpoint that no longer needs meditation upkeep.
 */
export const LUCID_ANCHOR_FLOORS = [0, 250, 500, 750];

/**
 * Insights ("The Lucid Mind", Chapter 2). Chapter 2's counterpart to the skill
 * tree: spend Intelligence (and some Lucidity) to research permanent mental
 * upgrades, grouped into five categories. Tiers chain via `requires`.
 *
 * Types:
 * - 'anchor': raises lucidAnchorTier to anchorTier (permanent sanity floor)
 * - 'recipe': unlocks a craftable technique (the Clarity buff)
 * - 'passive': contributes an `effect` aggregated by getInsightEffects()
 *
 * Passive effect types: meditationGainMult, lucidDecayReduction,
 * meditationLucidityMult, lucidityRateMult, intelRateMult, intelGainMult,
 * clarityDurationMult, clarityCostReduction.
 */
export const INSIGHT_CATEGORIES = ['Stability', 'Discipline', 'Perception', 'Cognition', 'Techniques'];

export const INSIGHTS = [
  // --- Stability: permanent sanity floors ---
  {
    id: 'lucid_anchor_1', name: 'Lucid Anchor I', category: 'Stability', type: 'anchor', anchorTier: 1,
    cost: { intelligence: 30, lucidity: 50 }, requires: [],
    desc: 'Drive a stake into your clarity. Sanity can no longer fall below 250%.',
  },
  {
    id: 'lucid_anchor_2', name: 'Lucid Anchor II', category: 'Stability', type: 'anchor', anchorTier: 2,
    cost: { intelligence: 90, lucidity: 150 }, requires: ['lucid_anchor_1'],
    desc: 'Hold a higher line. Sanity floored at 500%.',
  },
  {
    id: 'lucid_anchor_3', name: 'Lucid Anchor III', category: 'Stability', type: 'anchor', anchorTier: 3,
    cost: { intelligence: 240, lucidity: 400 }, requires: ['lucid_anchor_2'],
    desc: 'Stand beyond the walls. Sanity floored at 750%.',
  },

  // --- Discipline: meditation & decay ---
  {
    id: 'deep_breathing_1', name: 'Deep Breathing I', category: 'Discipline', type: 'passive',
    effect: { type: 'meditationGainMult', value: 0.25 }, cost: { intelligence: 40 }, requires: [],
    desc: 'Slower breaths reach deeper. Meditation restores 25% more sanity.',
  },
  {
    id: 'deep_breathing_2', name: 'Deep Breathing II', category: 'Discipline', type: 'passive',
    effect: { type: 'meditationGainMult', value: 0.25 }, cost: { intelligence: 100 }, requires: ['deep_breathing_1'],
    desc: 'The breath becomes a tide. Meditation restores a further 25% sanity.',
  },
  {
    id: 'deep_breathing_3', name: 'Deep Breathing III', category: 'Discipline', type: 'passive',
    effect: { type: 'meditationGainMult', value: 0.30 }, cost: { intelligence: 220, lucidity: 80 }, requires: ['deep_breathing_2'],
    desc: 'You no longer breathe; you are breathed. +30% meditation sanity.',
  },
  {
    id: 'steady_mind_1', name: 'Steady Mind I', category: 'Discipline', type: 'passive',
    effect: { type: 'lucidDecayReduction', value: 0.25 }, cost: { intelligence: 60, lucidity: 40 }, requires: [],
    desc: 'Clarity clings a little longer. Lucid decay slows by 25%.',
  },
  {
    id: 'steady_mind_2', name: 'Steady Mind II', category: 'Discipline', type: 'passive',
    effect: { type: 'lucidDecayReduction', value: 0.30 }, cost: { intelligence: 160, lucidity: 120 }, requires: ['steady_mind_1'],
    desc: 'The drift barely pulls at you now. Lucid decay slows a further 30%.',
  },
  {
    id: 'lucid_recall_1', name: 'Lucid Recall I', category: 'Discipline', type: 'passive',
    effect: { type: 'meditationLucidityMult', value: 0.5 }, cost: { intelligence: 50 }, requires: [],
    desc: 'Each session leaves more behind. +50% lucidity from meditating while lucid.',
  },
  {
    id: 'lucid_recall_2', name: 'Lucid Recall II', category: 'Discipline', type: 'passive',
    effect: { type: 'meditationLucidityMult', value: 0.5 }, cost: { intelligence: 140, lucidity: 100 }, requires: ['lucid_recall_1'],
    desc: 'You carry the stillness with you. +50% more meditation lucidity.',
  },

  // --- Perception: passive lucidity ---
  {
    id: 'open_aperture_1', name: 'Open Aperture I', category: 'Perception', type: 'passive',
    effect: { type: 'lucidityRateMult', value: 0.3 }, cost: { intelligence: 50, lucidity: 40 }, requires: [],
    desc: 'Let more of it in. +30% passive lucidity while lucid.',
  },
  {
    id: 'open_aperture_2', name: 'Open Aperture II', category: 'Perception', type: 'passive',
    effect: { type: 'lucidityRateMult', value: 0.4 }, cost: { intelligence: 130, lucidity: 120 }, requires: ['open_aperture_1'],
    desc: 'The edges of the room thin. +40% passive lucidity.',
  },
  {
    id: 'open_aperture_3', name: 'Open Aperture III', category: 'Perception', type: 'passive',
    effect: { type: 'lucidityRateMult', value: 0.5 }, cost: { intelligence: 300, lucidity: 300 }, requires: ['open_aperture_2'],
    desc: 'You see the seams in everything. +50% passive lucidity.',
  },

  // --- Cognition: passive intelligence ---
  {
    id: 'sharp_focus_1', name: 'Sharp Focus I', category: 'Cognition', type: 'passive',
    effect: { type: 'intelRateMult', value: 0.3 }, cost: { intelligence: 50 }, requires: [],
    desc: 'Thought sharpens to a point. +30% passive intelligence while lucid.',
  },
  {
    id: 'sharp_focus_2', name: 'Sharp Focus II', category: 'Cognition', type: 'passive',
    effect: { type: 'intelRateMult', value: 0.4 }, cost: { intelligence: 130 }, requires: ['sharp_focus_1'],
    desc: 'Ideas arrive uninvited. +40% passive intelligence.',
  },
  {
    id: 'sharp_focus_3', name: 'Sharp Focus III', category: 'Cognition', type: 'passive',
    effect: { type: 'intelRateMult', value: 0.5 }, cost: { intelligence: 300, lucidity: 150 }, requires: ['sharp_focus_2'],
    desc: 'Understanding without effort. +50% passive intelligence.',
  },
  {
    id: 'pattern_sense_1', name: 'Pattern Sense I', category: 'Cognition', type: 'passive',
    effect: { type: 'intelGainMult', value: 0.25 }, cost: { intelligence: 80 }, requires: [],
    desc: 'See the shape behind the work. +25% intelligence from Debug and Reports.',
  },
  {
    id: 'pattern_sense_2', name: 'Pattern Sense II', category: 'Cognition', type: 'passive',
    effect: { type: 'intelGainMult', value: 0.35 }, cost: { intelligence: 200, lucidity: 120 }, requires: ['pattern_sense_1'],
    desc: 'Every task is a sentence you can read. +35% more from Debug and Reports.',
  },

  // --- Techniques: active Clarity ---
  {
    id: 'clarity_recipe', name: 'Clarity Technique', category: 'Techniques', type: 'recipe',
    cost: { intelligence: 60 }, requires: [],
    desc: 'Fold a moment of stillness into Clarity: a craftable buff that halts lucid decay for a time.',
  },
  {
    id: 'lasting_clarity', name: 'Lasting Clarity', category: 'Techniques', type: 'passive',
    effect: { type: 'clarityDurationMult', value: 0.5 }, cost: { intelligence: 100, lucidity: 60 }, requires: ['clarity_recipe'],
    desc: 'Stillness that lingers. Clarity lasts 50% longer.',
  },
  {
    id: 'efficient_clarity', name: 'Efficient Clarity', category: 'Techniques', type: 'passive',
    effect: { type: 'clarityCostReduction', value: 0.3 }, cost: { intelligence: 100, lucidity: 80 }, requires: ['clarity_recipe'],
    desc: 'Find the calm with less effort. Clarity costs 30% less lucidity.',
  },
];

/**
 * Clarity buff definition (crafted once the Clarity Technique is researched).
 * Reuses the activeReportBuffs system + noSanityDrain to pause lucid decay.
 */
export const CLARITY_BUFF = { name: 'Clarity', duration: 180, lucidityCost: 40 };

/**
 * Discovery grant: lump of resources awarded the first time sanity reaches 1000%,
 * representing the perception of what you have been gathering. Sized to afford the
 * first Lucid Anchor immediately so progression is not circular.
 */
export const RESOURCE_DISCOVERY_GRANT = { lucidity: 80, intelligence: 50 };

/**
 * Factory machines ("The Construct", Chapter 2 Phase 2)
 *
 * Each machine is a SINGULAR, distinct thing the player cobbles together from
 * office junk and then upgrades (10 upgrades each, see FACTORY_UPGRADES). No
 * multiples. `factoryMachines[id]` is the machine's upgrade LEVEL (0 = built and
 * un-upgraded, up to 10); absent = not built.
 *
 * Power is a battery: the Generator trickles power in, the Capacitor Bank raises
 * capacity, and each consumer drains its own draw every tick. Consumers run in
 * `priority` order; a machine runs only if the battery can cover its full draw
 * that tick, otherwise it HALTS entirely (no output) until power recovers or the
 * Generator is upgraded to outpace demand.
 *
 * Base per-machine fields (rates are PER SECOND; the tick applies /10). Upgrades
 * modify these via getEffectiveMachineStats:
 * - blueprint: { intelligence } to research before building (null = none)
 * - buildCost: one-time resources to build the machine
 * - priority: lower runs first when power is scarce (consumers only)
 * - powerGen / powerUse / powerCapacity / substrate / output / material / lore
 */
export const FACTORY_BASE_POWER_CAPACITY = 50;

export const FACTORY_MACHINES = [
  {
    id: 'generator',
    name: 'Reality Generator',
    desc: 'Trickles power into the grid from the hum of the false lights.',
    lore: 'Three desk fans, a coil of extension cord, and the back panel of a vending machine. It should not produce anything. It hums anyway, in the same key as the ceiling lights.',
    blueprint: null,
    buildCost: { lucidity: 40 },
    powerGen: 5,
    material: '#9fe8ff',
  },
  {
    id: 'capacitor',
    name: 'Capacitor Bank',
    desc: 'Stores charge. Raises how much power the grid can hold.',
    lore: 'A filing cabinet packed with every dead phone battery from the lost-and-found, wired in series. It holds a charge far longer than it has any right to.',
    blueprint: null,
    buildCost: { lucidity: 50 },
    powerCapacity: 50,
    material: '#ffe08a',
  },
  {
    id: 'extractor',
    name: 'Substrate Extractor',
    desc: 'Bores into the substance beneath the office and draws up raw substrate.',
    lore: 'A water-cooler bottle inverted over a hand drill, sealed with packing tape. It bites into the floor and the floor, somewhere underneath, bleeds something grey.',
    blueprint: null,
    buildCost: { lucidity: 60 },
    priority: 1,
    powerUse: 4,
    substrate: 0.5,
    material: '#c46bff',
  },
  {
    id: 'conv_pp',
    name: 'PP Synthesizer',
    desc: 'Folds substrate into pure productivity. Output scales with your PP tier.',
    lore: 'A stapler, a label-maker, and an in-tray welded around the extractor feed. It sorts substrate into the shape of work. The label-maker only ever prints your name.',
    blueprint: { intelligence: 40 },
    buildCost: { lucidity: 80 },
    priority: 2,
    powerUse: 5,
    substrate: -0.3,
    output: { resource: 'pp', rate: 50, scalesWithPPTier: true },
    material: '#ffd24a',
  },
  {
    id: 'conv_paper',
    name: 'Paper Loom',
    desc: 'Weaves substrate into endless paper.',
    lore: 'The gutted carcass of the third-floor printer, its rollers and toner drum still warm. Feed it substrate and it prints blank pages, faster than it ever printed anything real.',
    blueprint: { intelligence: 50 },
    buildCost: { lucidity: 100 },
    priority: 3,
    powerUse: 5,
    substrate: -0.3,
    output: { resource: 'paper', rate: 2 },
    material: '#f2efe6',
  },
  {
    id: 'conv_lucidity',
    name: 'Lucidity Distiller',
    desc: 'Condenses substrate into perception.',
    lore: 'A break-room humidifier, a desk lamp, and the office plant nobody remembers buying. It breathes substrate in as fog and out as something clearer than air.',
    blueprint: { intelligence: 100 },
    buildCost: { lucidity: 150 },
    priority: 4,
    powerUse: 6,
    substrate: -0.5,
    output: { resource: 'lucidity', rate: 0.3 },
    material: '#00d0ff',
  },
  {
    id: 'conv_intelligence',
    name: 'Cognition Engine',
    desc: 'Refines substrate into understanding.',
    lore: 'Four dead monitors stacked into a cube around a server fan, screens facing inward. They show static, but if you watch long enough the static starts to make a kind of sense.',
    blueprint: { intelligence: 150 },
    buildCost: { lucidity: 180 },
    priority: 5,
    powerUse: 6,
    substrate: -0.5,
    output: { resource: 'intelligence', rate: 0.2 },
    material: '#ffd060',
  },
  {
    id: 'conv_material',
    name: 'Material Condenser',
    desc: 'Crystallises substrate into raw Void Fragments (the commonest material). Use a Transmuter to turn them into rarer materials.',
    lore: 'Magnetic paperclip holders, the microwave from the kitchenette, and a ring of staples. It compresses substrate until it forgets it was ever formless and falls out as Void Fragments, the dull grey base of everything.',
    blueprint: { intelligence: 120 },
    buildCost: { lucidity: 200 },
    priority: 6,
    powerUse: 8,
    substrate: -0.6,
    output: { resource: 'material', rate: 0.05 },
    material: '#6bff9f',
  },
  {
    id: 'transmuter',
    name: 'Material Transmuter',
    desc: 'Transmutes Void Fragments into a chosen rarer material. Rarer targets cost far more fragments (by their rarity).',
    lore: 'A coffee urn, a microwave turntable, and a funnel of bent cutlery. Pour Void Fragments in the top; with enough heat and patience it coaxes them into something rarer. The grey goes in. Colour comes out.',
    blueprint: { intelligence: 200 },
    buildCost: { lucidity: 300 },
    priority: 7,
    powerUse: 12,
    isTransmuter: true,
    transmuteBase: 5,
    material: '#b4b4c4',
  },
  {
    id: 'overclocker',
    name: 'Overclock Regulator',
    desc: 'Raises the safe ceiling on how hard any machine can be overclocked. Appears once you own an Overclock Module.',
    lore: 'A thermostat, a car radiator, and a bank of dials scavenged from the server room AC. It hums with cold. As long as it runs, your machines can be pushed far past their rated limits without melting through the floor.',
    blueprint: null,
    buildCost: { lucidity: 500, intelligence: 200 },
    availableWhen: 'anyOverclock',
    material: '#ff8a5c',
  },
];

/**
 * Per-machine upgrade tracks (10 each). The cost of upgrade level N is computed
 * by getUpgradeCost() in factoryHelpers (formula, not stored). `effect` is one of:
 * powerGenAdd, powerCapacityAdd, substrateAdd (additive to base) or
 * powerUseMult, outputMult, outputAdd, substrateUseMult (multiplicative/additive
 * modifiers aggregated by getEffectiveMachineStats). `visual: true` flags the
 * milestone upgrades that will bolt on a new sprite attachment in Phase B.
 */
export const FACTORY_UPGRADES = {
  generator: [
    { name: 'Extra Extension Cord', desc: 'Reach a second outlet. +3 power/s.', effect: { powerGenAdd: 3 } },
    { name: 'Overclocked Desk Fans', desc: 'Spin them past the warranty. +4 power/s.', effect: { powerGenAdd: 4 } },
    { name: 'Daisy-Chained Power Strips', desc: 'A fire marshal would weep. +6 power/s.', effect: { powerGenAdd: 6 }, visual: true },
    { name: 'Salvaged UPS Battery', desc: 'Ripped from under IT. +8 power/s.', effect: { powerGenAdd: 8 } },
    { name: 'Server Room Tap', desc: 'Splice into the racks. +12 power/s.', effect: { powerGenAdd: 12 } },
    { name: 'Fluorescent Ballast Array', desc: 'Harvest the lights themselves. +16 power/s.', effect: { powerGenAdd: 16 }, visual: true },
    { name: 'Rewired Breaker Panel', desc: 'Bypass every safety. +22 power/s.', effect: { powerGenAdd: 22 } },
    { name: 'Humming Transformer', desc: 'It sings your name. +30 power/s.', effect: { powerGenAdd: 30 } },
    { name: 'Substation Splice', desc: 'Tap the building feed. +45 power/s.', effect: { powerGenAdd: 45 } },
    { name: 'The Mains Itself', desc: 'There was never a meter. +70 power/s.', effect: { powerGenAdd: 70 }, visual: true },
  ],
  capacitor: [
    { name: 'Spare Phone Batteries', desc: 'Lost-and-found haul. +40 capacity.', effect: { powerCapacityAdd: 40 } },
    { name: 'Laptop Cells', desc: 'Pried from dead ThinkPads. +50 capacity.', effect: { powerCapacityAdd: 50 } },
    { name: 'UPS Brick Stack', desc: 'A wall of beige. +70 capacity.', effect: { powerCapacityAdd: 70 }, visual: true },
    { name: 'Car Battery (Whose?)', desc: 'It was in the parking sub-level. +90 capacity.', effect: { powerCapacityAdd: 90 } },
    { name: 'Supercapacitor Coil', desc: 'Wound from speaker wire. +120 capacity.', effect: { powerCapacityAdd: 120 } },
    { name: 'Coolant-Bathed Cells', desc: 'Submerged in the water cooler. +160 capacity.', effect: { powerCapacityAdd: 160 }, visual: true },
    { name: 'Flywheel in a Chair Base', desc: 'It spins for hours. +220 capacity.', effect: { powerCapacityAdd: 220 } },
    { name: 'Vault of Dead Cells', desc: 'The whole supply closet. +300 capacity.', effect: { powerCapacityAdd: 300 } },
    { name: 'Resonant Battery Array', desc: 'They charge each other. +420 capacity.', effect: { powerCapacityAdd: 420 } },
    { name: 'The Building Holds Its Breath', desc: 'Capacity you cannot measure. +600 capacity.', effect: { powerCapacityAdd: 600 }, visual: true },
  ],
  extractor: [
    { name: 'Wider Drill Bit', desc: 'Bore a bigger hole. +0.3 substrate/s.', effect: { substrateAdd: 0.3 } },
    { name: 'Second Bottle Hopper', desc: 'Twice the throat. +0.4 substrate/s.', effect: { substrateAdd: 0.4 } },
    { name: 'Greased Bearings', desc: 'Quieter, hungrier. -10% power draw.', effect: { powerUseMult: 0.9 }, visual: true },
    { name: 'Vacuum Assist', desc: 'A shop-vac on the intake. +0.6 substrate/s.', effect: { substrateAdd: 0.6 } },
    { name: 'Reinforced Auger', desc: 'Rebar from the renovation. +0.8 substrate/s.', effect: { substrateAdd: 0.8 } },
    { name: 'Counterweighted Arm', desc: 'It barely sips now. -15% power draw.', effect: { powerUseMult: 0.85 }, visual: true },
    { name: 'Twin Bore Heads', desc: 'Two holes, one machine. +1.2 substrate/s.', effect: { substrateAdd: 1.2 } },
    { name: 'Deep Shaft Liner', desc: 'Reach where the grey is thick. +1.6 substrate/s.', effect: { substrateAdd: 1.6 } },
    { name: 'Frictionless Coupling', desc: 'It runs on almost nothing. -20% power draw.', effect: { powerUseMult: 0.8 } },
    { name: 'It Digs Itself Now', desc: 'You only watch. +2.5 substrate/s.', effect: { substrateAdd: 2.5 }, visual: true },
    { name: 'Overclock Module', desc: 'Unlocks overclocking: feed it above 100% power for proportionally more output (and drain).', effect: { type: 'overclock' }, visual: true },
  ],
  conv_pp: [
    { name: 'Faster Stapler', desc: 'Ka-chunk, ka-chunk. +25% output.', effect: { outputMult: 1.25 } },
    { name: 'Ergonomic Keyboard Feed', desc: 'Clack into productivity. +25% output.', effect: { outputMult: 1.25 } },
    { name: 'Quieter Motor', desc: 'HR stops complaining. -10% power draw.', effect: { powerUseMult: 0.9 }, visual: true },
    { name: 'Triple In-Tray', desc: 'Sort, sort, sort. +30% output.', effect: { outputMult: 1.30 } },
    { name: 'Lean Substrate Intake', desc: 'Waste nothing. -15% substrate use.', effect: { substrateUseMult: 0.85 } },
    { name: 'Hot-Desk Manifold', desc: 'Everyone shares now. +40% output.', effect: { outputMult: 1.40 }, visual: true },
    { name: 'Cold Boot Bypass', desc: 'It never sleeps. -15% power draw.', effect: { powerUseMult: 0.85 } },
    { name: 'Quarterly Overdrive', desc: 'Always end of quarter. +50% output.', effect: { outputMult: 1.50 } },
    { name: 'Recycled Substrate Loop', desc: 'The work feeds itself. -20% substrate use.', effect: { substrateUseMult: 0.8 } },
    { name: 'Employee of the Eon', desc: 'Productivity beyond reason. +75% output.', effect: { outputMult: 1.75 }, visual: true },
    { name: 'Overclock Module', desc: 'Unlocks overclocking: feed it above 100% power for proportionally more output (and drain).', effect: { type: 'overclock' }, visual: true },
  ],
  conv_paper: [
    { name: 'New Toner Drum', desc: 'Crisper nothing. +25% output.', effect: { outputMult: 1.25 } },
    { name: 'Duplex Rollers', desc: 'Both sides blank. +25% output.', effect: { outputMult: 1.25 } },
    { name: 'Standby Saver', desc: 'Sips between pages. -10% power draw.', effect: { powerUseMult: 0.9 }, visual: true },
    { name: 'Bulk Tray Mod', desc: '500 sheets at a time. +30% output.', effect: { outputMult: 1.30 } },
    { name: 'Fibre Reclaimer', desc: 'Less pulp wasted. -15% substrate use.', effect: { substrateUseMult: 0.85 } },
    { name: 'Industrial Fuser', desc: 'It runs hot and proud. +40% output.', effect: { outputMult: 1.40 }, visual: true },
    { name: 'Eco Ballast', desc: 'Greener haunting. -15% power draw.', effect: { powerUseMult: 0.85 } },
    { name: 'Continuous Feed', desc: 'No more jams, ever. +50% output.', effect: { outputMult: 1.50 } },
    { name: 'Pulp Recirculator', desc: 'The page remembers. -20% substrate use.', effect: { substrateUseMult: 0.8 } },
    { name: 'The Press That Never Stops', desc: 'A library a second. +75% output.', effect: { outputMult: 1.75 }, visual: true },
    { name: 'Overclock Module', desc: 'Unlocks overclocking: feed it above 100% power for proportionally more output (and drain).', effect: { type: 'overclock' }, visual: true },
  ],
  conv_lucidity: [
    { name: 'Brighter Lamp', desc: 'See a little further. +25% output.', effect: { outputMult: 1.25 } },
    { name: 'Second Humidifier', desc: 'Thicker fog, clearer mind. +25% output.', effect: { outputMult: 1.25 } },
    { name: 'Low-Watt Bulbs', desc: 'Gentle on the grid. -10% power draw.', effect: { powerUseMult: 0.9 }, visual: true },
    { name: 'A Second Plant', desc: 'It leans toward you. +30% output.', effect: { outputMult: 1.30 } },
    { name: 'Condensate Loop', desc: 'Reuse the mist. -15% substrate use.', effect: { substrateUseMult: 0.85 } },
    { name: 'Crystal Diffuser', desc: 'Light splits into meaning. +40% output.', effect: { outputMult: 1.40 }, visual: true },
    { name: 'Trickle Power Mode', desc: 'Barely there. -15% power draw.', effect: { powerUseMult: 0.85 } },
    { name: 'Resonant Chamber', desc: 'The room agrees with you. +50% output.', effect: { outputMult: 1.50 } },
    { name: 'Closed Breathing Cycle', desc: 'It exhales what it needs. -20% substrate use.', effect: { substrateUseMult: 0.8 } },
    { name: 'Perfect Stillness', desc: 'Clarity without effort. +75% output.', effect: { outputMult: 1.75 }, visual: true },
    { name: 'Overclock Module', desc: 'Unlocks overclocking: feed it above 100% power for proportionally more output (and drain).', effect: { type: 'overclock' }, visual: true },
  ],
  conv_intelligence: [
    { name: 'Fifth Monitor', desc: 'More static to read. +25% output.', effect: { outputMult: 1.25 } },
    { name: 'Overclocked Server Fan', desc: 'Think faster. +25% output.', effect: { outputMult: 1.25 } },
    { name: 'Undervolted Boards', desc: 'Cool and quiet. -10% power draw.', effect: { powerUseMult: 0.9 }, visual: true },
    { name: 'RAID of Old Drives', desc: 'It remembers more. +30% output.', effect: { outputMult: 1.30 } },
    { name: 'Cache Optimiser', desc: 'Chew substrate finer. -15% substrate use.', effect: { substrateUseMult: 0.85 } },
    { name: 'Neural Screen Lattice', desc: 'The static forms a face. +40% output.', effect: { outputMult: 1.40 }, visual: true },
    { name: 'Sleep-State Bypass', desc: 'It never powers down. -15% power draw.', effect: { powerUseMult: 0.85 } },
    { name: 'Parallel Cores', desc: 'A dozen trains of thought. +50% output.', effect: { outputMult: 1.50 } },
    { name: 'Lossless Substrate Codec', desc: 'Nothing misunderstood. -20% substrate use.', effect: { substrateUseMult: 0.8 } },
    { name: 'It Finishes Your Sentences', desc: 'Understanding beyond yours. +75% output.', effect: { outputMult: 1.75 }, visual: true },
    { name: 'Overclock Module', desc: 'Unlocks overclocking: feed it above 100% power for proportionally more output (and drain).', effect: { type: 'overclock' }, visual: true },
  ],
  conv_material: [
    { name: 'Stronger Magnets', desc: 'Pull harder. +25% output.', effect: { outputMult: 1.25 } },
    { name: 'Second Microwave', desc: 'Double the compression. +25% output.', effect: { outputMult: 1.25 } },
    { name: 'Shielded Casing', desc: 'Less leaks out. -10% power draw.', effect: { powerUseMult: 0.9 }, visual: true },
    { name: 'Staple Ring Mk II', desc: 'A tighter cage. +30% output.', effect: { outputMult: 1.30 } },
    { name: 'Dense Packing', desc: 'Squeeze every gram. -15% substrate use.', effect: { substrateUseMult: 0.85 } },
    { name: 'Resonant Compression', desc: 'Matter forgets it was fog. +40% output.', effect: { outputMult: 1.40 }, visual: true },
    { name: 'Capacitive Pulse Drive', desc: 'Brief, efficient bursts. -15% power draw.', effect: { powerUseMult: 0.85 } },
    { name: 'Crystalline Mould', desc: 'Perfect lattices. +50% output.', effect: { outputMult: 1.50 } },
    { name: 'Substrate Recovery Trap', desc: 'Catch the scraps. -20% substrate use.', effect: { substrateUseMult: 0.8 } },
    { name: 'It Makes Things That Should Not Be', desc: 'Solid impossibility. +75% output.', effect: { outputMult: 1.75 }, visual: true },
    { name: 'Overclock Module', desc: 'Unlocks overclocking: feed it above 100% power for proportionally more output (and drain).', effect: { type: 'overclock' }, visual: true },
  ],
  transmuter: [
    { name: 'Bigger Crucible', desc: 'Melt more at once. +2 fragments/s.', effect: { type: 'voidRateAdd', value: 2 } },
    { name: 'Second Burner', desc: 'Twice the heat. +3 fragments/s.', effect: { type: 'voidRateAdd', value: 3 } },
    { name: 'Reinforced Lining', desc: 'Less is lost to the walls. +10% yield.', effect: { type: 'transmuteEffMult', value: 1.10 }, visual: true },
    { name: 'Faster Feed', desc: 'A wider funnel. +4 fragments/s.', effect: { type: 'voidRateAdd', value: 4 } },
    { name: 'Catalyst Tray', desc: 'A pinch of something. +15% yield.', effect: { type: 'transmuteEffMult', value: 1.15 } },
    { name: 'Twin Chambers', desc: 'Two pours at once. x1.5 throughput.', effect: { type: 'voidRateMult', value: 1.5 }, visual: true },
    { name: 'Pressure Seal', desc: 'Hold the heat in. +6 fragments/s.', effect: { type: 'voidRateAdd', value: 6 } },
    { name: 'Resonant Matrix', desc: 'It sings the matter into shape. +20% yield.', effect: { type: 'transmuteEffMult', value: 1.20 } },
    { name: 'Continuous Pour', desc: 'It never stops. +10 fragments/s.', effect: { type: 'voidRateAdd', value: 10 } },
    { name: "Philosopher's Stone", desc: 'The old dream, in a break room. x2 throughput.', effect: { type: 'voidRateMult', value: 2 }, visual: true },
  ],
  overclocker: [
    { name: 'Desk Fan Bank', desc: 'Point them all at the racks. +50% overclock ceiling.', effect: { type: 'overclockCapAdd', value: 50 } },
    { name: 'Salvaged Heatsinks', desc: 'Pried off dead CPUs. +50% overclock ceiling.', effect: { type: 'overclockCapAdd', value: 50 } },
    { name: 'Voltage Regulator', desc: 'Smooths the surges. +75% overclock ceiling.', effect: { type: 'overclockCapAdd', value: 75 }, visual: true },
    { name: 'Thermal Paste, Reapplied', desc: 'Someone finally did it. +75% overclock ceiling.', effect: { type: 'overclockCapAdd', value: 75 } },
    { name: 'Water-Cooler Loop', desc: 'The cooler now cools something. +100% overclock ceiling.', effect: { type: 'overclockCapAdd', value: 100 } },
    { name: 'Server-Room Chiller', desc: 'Tapped the building AC. +100% overclock ceiling.', effect: { type: 'overclockCapAdd', value: 100 }, visual: true },
    { name: 'Surge Capacitor Wall', desc: 'It drinks the spikes. +125% overclock ceiling.', effect: { type: 'overclockCapAdd', value: 125 } },
    { name: 'Phase-Change Cooler', desc: 'Frost on the desk legs. +125% overclock ceiling.', effect: { type: 'overclockCapAdd', value: 125 } },
    { name: 'Cryogenic Tap', desc: 'Where does the cold come from? +150% overclock ceiling.', effect: { type: 'overclockCapAdd', value: 150 } },
    { name: 'It Cannot Overheat', desc: 'Heat simply leaves. +150% overclock ceiling.', effect: { type: 'overclockCapAdd', value: 150 }, visual: true },
  ],
};

// Extraction/conversion base rates are read from FACTORY_MACHINES above; this is
// the dimensional material the Material Condenser yields (commonest tier).
export const FACTORY_MATERIAL_OUTPUT = 'void_fragment';

/**
 * ============================================================================
 * EXPEDITIONS / THE UNDERCROFT (Chapter 2, Phase A)
 * Combat & exploration layer gated behind a fully-running factory. The math
 * lives in expeditionHelpers.js. Weapons are discovered via a gacha-style
 * blueprint ROLL (type x rarity, owned forever); other gear is deterministic.
 * ============================================================================
 */

// Core machines that must ALL be built and running (sustained) for the floor to
// break through and reveal the Undercroft. The Overclock Regulator is excluded.
export const CORE_FACTORY_MACHINE_IDS = [
  'generator', 'capacitor', 'extractor', 'conv_pp', 'conv_paper',
  'conv_lucidity', 'conv_intelligence', 'conv_material', 'transmuter',
];

// Seconds the factory must run fully (nothing halted) before the breakthrough.
export const UNDERCROFT_BREAKTHROUGH_SECONDS = 45;

// Weapon rarity tiers. Rarity is a PURE strength multiplier on a weapon type's
// base Might. Higher rarity = stronger + flashier pixel art. weight = roll odds.
export const WEAPON_RARITIES = [
  { id: 'common', name: 'Common', mult: 1.0, weight: 50, color: '#9aa0a6' },
  { id: 'uncommon', name: 'Uncommon', mult: 1.6, weight: 27, color: '#5fb878' },
  { id: 'rare', name: 'Rare', mult: 2.6, weight: 14, color: '#4aa3ff' },
  { id: 'epic', name: 'Epic', mult: 4.2, weight: 6, color: '#b46bff' },
  { id: 'legendary', name: 'Legendary', mult: 7.0, weight: 2.5, color: '#ffb454' },
  { id: 'mythic', name: 'Mythic', mult: 12.0, weight: 0.5, color: '#ff5c5c' },
];

// Soft pity: a Rare-or-better is guaranteed once this many consecutive rolls
// have produced nothing rare+.
export const ROLL_PITY_THRESHOLD = 10;

// Foe archetypes populate Haunt nodes. Each is countered by particular weapon
// quirks (see WEAPON_TYPES.strongVs / weakVs).
export const FOE_ARCHETYPES = [
  { id: 'swarm', name: 'Swarm', foeName: 'Paper Wasps', desc: 'Many weak things at once. Single-target weapons drown; cleave and reach excel.' },
  { id: 'bulwark', name: 'Bulwark', foeName: 'Filing Golem', desc: 'Slow and armoured. Needs burst or armour-pierce; light fast weapons just bounce.' },
  { id: 'flicker', name: 'Flicker', foeName: 'Static Hound', desc: 'Fast and evasive. Needs accuracy or binding; heavy weapons swing at nothing.' },
  { id: 'phantom', name: 'Phantom', foeName: 'Echo-thing', desc: 'Half here. Resists the physical; only lucidity-touched edges bite.' },
  { id: 'corruptor', name: 'Corruptor', foeName: 'Void Maw', desc: 'Attacks the mind, not the body. Anchoring, corruption-bleeding weapons hold it off.' },
];

// The eight weapon TYPES. Identity = lore + a combat QUIRK (strong/weak vs an
// archetype, plus an optional tradeoff). Rarity scales baseMight. craftCore is
// the dimensional material a physical copy needs (rarer for the special edges).
export const WEAPON_TYPES = [
  { id: 'stapler_pike', name: 'Stapler-Pike', baseMight: 10, strongVs: 'bulwark', weakVs: null, craftCore: 'static_crystal', quirk: 'Slight armour-pierce. The balanced all-rounder.', lore: 'The first thing you ever bolted together down here: a curtain rod, an industrial stapler, and a will to not be unmade. It has saved more copies of you than you can count.', color: '#c9cdd2' },
  { id: 'guillotine_cutter', name: 'Guillotine Cutter', baseMight: 9, strongVs: 'swarm', weakVs: 'bulwark', craftCore: 'static_crystal', quirk: 'Cleaves whole ranks. Wasted on a single armoured foe.', lore: 'The arm of the big paper-cutter from the copy room, still bearing its SAFETY FIRST sticker. It does not feel safe. The blade remembers every ream it ever fed.', color: '#d4b483' },
  { id: 'letter_opener_fan', name: 'Letter-Opener Fan', baseMight: 8, strongVs: 'flicker', weakVs: 'bulwark', craftCore: 'glitch_shard', quirk: 'Fast multi-hit. Catches what runs; chips at what stands.', lore: 'A fan of brass letter-openers from a hundred desks, bound at the handles. Each one slit envelopes addressed to people who never existed.', color: '#caa66a' },
  { id: 'cubicle_maul', name: 'Cubicle Maul', baseMight: 18, strongVs: 'bulwark', weakVs: 'swarm', costsEndurance: true, craftCore: 'reality_dust', quirk: 'Enormous burst, but heavy: drains Endurance. Useless against swarms.', lore: 'A slab of cubicle partition wall, grey carpet and all, swung like a headsmans maul. It still has someones motivational postcard pinned to it. HANG IN THERE.', color: '#8a8f94' },
  { id: 'toner_flail', name: 'Toner Flail', baseMight: 11, strongVs: 'flicker', weakVs: null, applies: 'blind', craftCore: 'glitch_shard', quirk: 'Messy hits that BLIND, cutting a Flickers evasion.', lore: 'A length of chain ending in a punctured toner cartridge. Every swing throws a cloud of black dust that clings to whatever is too quick to see coming.', color: '#3a3a40' },
  { id: 'cable_lash', name: 'Cable Lash', baseMight: 10, strongVs: 'swarm', weakVs: null, applies: 'bind', craftCore: 'reality_dust', quirk: 'Line-reach that BINDS, pinning a Flicker in place.', lore: 'A braid of server-room ethernet, frayed copper at the tip. It still carries a faint signal. Sometimes, when it strikes, you hear a dial tone.', color: '#6a8caf' },
  { id: 'lucid_lance', name: 'Lucid Lance', baseMight: 13, strongVs: 'phantom', weakVs: null, bleedsCorruption: true, craftCore: 'temporal_core', quirk: 'Bites the incorporeal and BLEEDS corruption: the answer to Phantoms and Corruptors.', lore: 'A mop handle wound with distiller-tubing, glowing the pale blue of the Lucidity tap. It is more idea than object. Against things that are also more idea than object, that is exactly enough.', color: '#5fd0ff' },
  { id: 'thermal_censer', name: 'Thermal Censer', baseMight: 9, strongVs: 'bulwark', weakVs: null, applies: 'burn', craftCore: 'glitch_shard', quirk: 'Damage-over-time that GRINDS down armour and clears swarms.', lore: 'The break-room coffee pot, its hotplate rewired to never switch off, swung on a censers chain. It has not held coffee in a long time. It holds something that is always, faintly, screaming.', color: '#e8995c' },
];

// Non-weapon gear: deterministic. Research with intelligence (one-time), then
// craft with PP + a dimensional core. family/stat drive which capability it feeds.
export const GEAR_BLUEPRINTS = [
  { id: 'lantern', family: 'instrument', name: 'Lantern', stat: 'sight', value: 8, research: { intelligence: 30 }, craft: { pp: 200, core: 'static_crystal', coreQty: 2 }, desc: 'Lights the dark: raises Sight and reveal radius.', lore: 'A desk lamp lashed to a fire-extinguisher harness, running off a stolen battery. Its light falls a little wrong, but it falls far.' },
  { id: 'compass', family: 'instrument', name: 'Compass', stat: 'sight', value: 5, research: { intelligence: 45 }, craft: { pp: 250, core: 'glitch_shard', coreQty: 2 }, desc: 'Steadier charting: fewer lost routes, better node detection.', lore: 'A staple bent over a magnetised paperclip floating in a coffee lid. It does not point north. It points the way back, which is more useful.' },
  { id: 'decoder', family: 'instrument', name: 'Decoder Lens', stat: 'decode', value: 1, research: { intelligence: 90 }, craft: { pp: 400, core: 'reality_dust', coreQty: 1 }, desc: 'Reads Echoes and identifies a node before you Delve.', lore: 'A loupe ground from a cracked monitor filter. Hold it to the static and the static holds still, just long enough to be read.' },
  { id: 'ward_minor', family: 'ward', name: 'Paper Ward', stat: 'wardstrength', value: 6, research: { intelligence: 60 }, craft: { pp: 300, core: 'glitch_shard', coreQty: 3 }, desc: 'A first guard against Corruption.', lore: 'Pages of meeting minutes folded into a chain of charms, each one stamped CONFIDENTIAL. The words mean nothing now. The folding means everything.' },
  { id: 'ward_major', family: 'ward', name: 'Lucid Ward', stat: 'wardstrength', value: 14, research: { intelligence: 160 }, craft: { pp: 600, core: 'temporal_core', coreQty: 1 }, desc: 'A strong guard: greatly cuts permanent-loss odds.', lore: 'A halo of distiller-glass beaded with condensed lucidity. Worn at the brow, it keeps the mind convinced it is still itself, even when the dark insists otherwise.' },
  { id: 'plating', family: 'plating', name: 'Shell Plating', stat: 'shellhp', value: 25, research: { intelligence: 50 }, craft: { pp: 350, core: 'static_crystal', coreQty: 4 }, desc: 'Bolt-on armour: raises shell integrity, saving rebuild materials.', lore: 'Filing-cabinet drawers hammered flat and riveted into a carapace. It rattles when the shell walks. The rattle is almost a comfort.' },
];

// Provisions: one-shot consumables, brewed (no research). Consumed per expedition.
export const PROVISION_TYPES = [
  { id: 'rations', name: 'Rations', effect: 'endurance', value: 30, craft: { energy: 25, paper: 10 }, desc: '+Endurance: the expedition reaches deeper before it must turn back.', lore: 'Vending-machine crackers and a thermos of something that was once coffee. It keeps a body moving long after a body should stop.' },
  { id: 'lucid_draught', name: 'Lucid Draught', effect: 'resolve', value: 20, craft: { lucidity: 8, energy: 15 }, desc: '+Resolve for the run, without spending real sanity.', lore: 'A paper cup of the distillers first run, still faintly luminous. Drink it and the dark feels survivable, which is its own kind of lie.' },
  { id: 'clarity_charge', name: 'Clarity Charge', effect: 'intervention', value: 1, craft: { lucidity: 20, intelligence: 10 }, desc: 'The intervention save: pull a mind back from the brink, or pre-load it as auto-retreat insurance.', lore: 'A single breath of perfect meditation, pressed into a glass bead. Crack it at the worst moment and, for one instant, you see the way out clearly enough to take it.' },
];

// Traits earned at milestone mind levels. Each gives a role-shaping bonus.
export const MIND_TRAITS = [
  { id: 'cartographer', name: 'Cartographer', desc: 'Surveys reveal more of the chart and grant extra XP.' },
  { id: 'hunter', name: 'Hunter', desc: 'Greater Might against Haunts.' },
  { id: 'warded', name: 'Warded', desc: 'Innate resistance to Corruption.' },
  { id: 'anchored', name: 'Anchored', desc: 'Resolve drains more slowly; resists panic.' },
  { id: 'scholar', name: 'Scholar', desc: 'Faster decoding and more intelligence from Echoes.' },
  { id: 'lucid', name: 'Lucid', desc: 'Returns with a trickle of lucidity.' },
];

// Mind levels at which a new trait slot opens.
export const MIND_TRAIT_LEVELS = [3, 6, 10, 15];

// Tuning for printing/rolling and the capability math (see expeditionHelpers.js).
export const EXPEDITION = {
  rollCost: { intelligence: 200 },
  printBase: { paper: 20, pp: 150, lucidity: 10 },
  printTiers: [
    { id: 'raw', name: 'Raw Copy', startLevel: 1, extraTrait: false, costMult: 1, research: null },
    { id: 'primed', name: 'Primed Copy', startLevel: 4, extraTrait: false, costMult: 3, research: { intelligence: 120 } },
    { id: 'refined', name: 'Refined Copy', startLevel: 8, extraTrait: true, costMult: 7, research: { intelligence: 300 } },
  ],
  mindBase: { resolve: 40, acuity: 5, will: 5 },
  mindGrowth: { resolve: 8, acuity: 1.5, will: 1.5 },
  shellBaseHp: 50,
  shellBay: 6,                  // max shells that can be kept assembled at once
  // --- Phase B: dispatch + resolution tuning ---
  shellCost: { substrate: 40, core: 'void_fragment', coreQty: 2 },
  surveyCost: { paper: 5, energy: 10 },
  delveCost: { paper: 8, energy: 15 },
  baseDurationSec: 35,          // base wall-clock time of an expedition
  distanceDurationSec: 35,      // extra seconds scaled by route distance (0..1)
  xpPerLevel: 100,              // xp needed per level (x current level)
  acuityToSight: 0.04,          // Sight multiplier per point of mind Acuity
  willToWard: 0.04,             // Wardstrength multiplier per point of mind Will
  baseSight: 2,                 // innate Sight before instruments
  corruptionMax: 100,           // corruption at/over this = brink
  // Tier -> dimensional core a Gateway breach consumes (deeper = rarer).
  tierCores: ['void_fragment', 'static_crystal', 'glitch_shard', 'reality_dust', 'temporal_core', 'dimensional_essence', 'singularity_node'],
  // --- Phase C: stakes + ending ---
  exitFragments: 6,             // way-out fragments needed before a Gateway breach reaches the Exit
  letRideBase: 0.35,            // base survival chance when you decline to spend a Clarity Charge
  fragmentCapability: 1,        // Sight + Wardstrength granted per held way-out fragment
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

The lights keep working even when you stop. They never stop.`,
    category: 'progression'
  },
  lowSanity: {
    id: 'lowSanity',
    title: 'SANITY DECLINING',
    content: `Your sanity is below 25%. Reality begins to fracture.

MEDITATION is now available. This breathing exercise restores sanity.
Hold SPACE to breathe in, release inside the green zone, repeat three times.

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

Open the Personnel File System to spend it. Eight standalone skills, each with a large, clear bonus:

• Productivity: PP per click, passive PP, all PP
• Resilience: energy cost, sanity loss, rest cooldown
• The Other Office: portal cooldown, free actions

No branches, no prerequisites. Spend points on whatever your build needs.
Reality remembers your choices.`,
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
  printerRoom: {
    id: 'printerRoom',
    title: 'PRINTER ROOM',
    content: `You found the Printer Room.

PRINT PAPERS turns energy into paper. Paper quality follows your printer quality and your sanity.

Paper buys printer upgrades, prints documents, and crafts dimensional upgrades. The machine never stops.`,
    category: 'mechanics'
  },
  documentSystem: {
    id: 'documentSystem',
    title: 'DOCUMENT CREATION',
    content: `Paper can be printed into documents.

Each document has five tiers, unlocked by printing. Every print rolls a quality outcome from Corrupted to Perfect.

Better paper quality means better outcomes. Documents wait in your File Drawer until you consume them.`,
    category: 'mechanics'
  },
  portal: {
    id: 'portal',
    title: 'THE PORTAL',
    content: `A tear in reality has opened.

Enter to collect dimensional materials from the floating nodes. Watch your capacity, then exit to keep what you gathered.

Materials craft powerful dimensional upgrades. The portal has a cooldown between visits.`,
    category: 'mechanics'
  },
  chapter2: {
    id: 'chapter2',
    title: 'CHAPTER 2: A WAY THROUGH',
    content: `You have done everything the office asked. Bought everything. Sorted everything. And still the walls hold.

There has to be a way out. Not around the office. Past it.

To see past what is in front of you, your mind has to go further than it ever has. The ceiling on your sanity is gone. MEDITATION can now carry you higher than 100%.

Climb. Something waits at the top.`,
    category: 'story'
  },
  lucid: {
    id: 'lucid',
    title: 'BEYOND THE CEILING',
    content: `Your sanity has passed 100%. This is lucidity.

Meditation no longer stops at 100. Keep meditating to climb higher: Lucid Mind, Sharpened Focus, and further still.

But a lucid mind drifts. Without upkeep your sanity sinks back toward 100%. Hold the climb, and reach for 1000%.

Note: clarity is not the productivity path. Low sanity still pays better PP. This is a different road.`,
    category: 'mechanics'
  },
  resourcesDiscovered: {
    id: 'resourcesDiscovered',
    title: 'LUCIDITY AND INTELLIGENCE',
    content: `At 1000% you finally see clearly. Two things you can hold onto take shape:

LUCIDITY: perception. It gathers on its own while you stay lucid, faster the higher you climb.

INTELLIGENCE: understanding. Earned by solving Debug challenges, consuming Reports, and thinking clearly while lucid.

Spend them in INSIGHTS. Anchor your clarity so you never fall so far again, and learn new techniques. This is how you start to build a way through.`,
    category: 'mechanics'
  },
  factory: {
    id: 'factory',
    title: 'THE CONSTRUCT',
    content: `Lucid, you can finally perceive the machinery beneath the office, and reshape it.

THE CONSTRUCT is a factory. Research blueprints with INTELLIGENCE, then build machines with LUCIDITY.

Generators make POWER. Extractors spend power to mine SUBSTRATE, the raw stuff of this false reality. Converters spend substrate and power to manufacture PP, paper, materials, lucidity, and intelligence, automatically, forever.

Balance power against demand, and extraction against conversion. Let it run.`,
    category: 'mechanics'
  },
  undercroft: {
    id: 'undercroft',
    title: 'THE UNDERCROFT',
    content: `The Extractor has bored too deep. The floor gave way, and beneath the false office there is somewhere else.

This is the UNDERCROFT. From here you do not work, you EXPLORE. Print copies of your own mind, clothe them in scavenged shells and gear, and send them down into the dark to find a way out.

At the WORKBENCH: roll for weapon blueprints with INTELLIGENCE, research and craft gear, and print minds. A printed mind is precious. If one is lost down there, it is lost for good.

Start by printing a mind and rolling a weapon. The way out is further in.`,
    category: 'mechanics'
  },
};

/**
 * Help popup trigger conditions
 * Defines when each popup should appear
 */
export const HELP_TRIGGERS = {
  // State-based predicates: "has this mechanic become relevant yet?" (not a
  // one-time transition), so a popup still surfaces on an imported save where
  // the milestone was already passed. The help system shows the first match
  // whose popup the player has not seen; dismissing it adds it to the journal.
  welcome: (state) => (state.sortCount || 0) >= 1,
  firstPassiveIncome: (state) => (state.ppPerSecond || 0) > 0,
  lowSanity: (state) => state.sanity <= 25,
  sanityTiers: (state) => state.sanity <= 39,
  skillTree: (state) => (state.skillPoints || 0) > 0 || Object.keys(state.skills || {}).length > 0,
  archive: (state) => state.unlockedLocations.includes('archive'),
  printerRoom: (state) => !!state.printerUnlocked,
  documentSystem: (state) => !!state.printerUnlocked && (state.paper || 0) >= 5,
  portal: (state) => !!state.portalUnlocked,
  paperQuality: (state) => !!state.printerUnlocked && (state.paperQuality ?? 100) <= 50,
  debug: (state) => !!state.upgrades?.debugger,
  chapter2: (state) => (state.chapter || 1) >= 2,
  lucid: (state) => state.sanity > 100,
  resourcesDiscovered: (state) => !!state.resourcesUnlocked,
  factory: (state) => !!state.factoryUnlocked,
  undercroft: (state) => !!state.undercroftUnlocked,
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
    construct: {
      name: 'The Construct',
      unlockHint: 'Reach 1000% sanity and perceive the machinery beneath the office',
      lore: 'Not a room so much as a thing you built. Generators trickle power into a battery; extractors bore into the grey substance under the floor; converters and a transmuter reshape it into everything you need. It runs on its own, forever, a small factory cobbled from office junk and lucid will. Build it, balance the power, and let it work while you do not.',
      notes: 'The grey goes in. Whatever you ask for comes out.'
    },
    undercroft: {
      name: 'The Undercroft',
      unlockHint: 'Run every machine of the Construct at once until the floor breaks through',
      lore: 'Beneath the false office there was never a foundation, only more dark, and things that live in it. The Extractor opened the way. Down here you stop being a worker and start being a cartographer of an impossible place, sending printed copies of yourself out across a chart you paint as you go. Some of them do not come back. The map remembers each one.',
      notes: 'There has to be a way out. This is where you start looking.'
    }
  },

};

/**
 * Mechanics Entries for Journal
 * Tied to HELP_POPUPS - when a help popup is dismissed, the mechanic is "learned"
 * Gradually reveals game systems without spoiling everything
 * (Added 2025-11-01)
 */
export const MECHANICS_ENTRIES = {
  undercroft: {
    id: 'undercroft',
    title: 'The Undercroft',
    category: 'Expeditions',
    summary: 'Explore the dark beneath the office with printed minds.',
    details: `When every machine of the Construct runs at once, the Extractor breaks through the floor and reveals THE UNDERCROFT.

Here you PRINT MINDS (copies of yourself) from paper, PP and lucidity, equip them with crafted gear and rolled weapons, and send them on expeditions into a chart you uncover as you explore.

Weapons are found by ROLLING blueprints with intelligence: each is a weapon type at a random rarity, and a rolled blueprint is yours forever. A crafted weapon can be lost with the mind that carries it, but you keep the blueprint.

A mind lost on an expedition is lost permanently. Print carefully. Protect your veterans.

At the BRINK, a mind pauses and waits: spend a Clarity Charge to pull it out, or let it ride and gamble. Deep in the dark are pieces of the WAY OUT. Gather enough, breach the final Gateway, and step through. It may not lead where you hope.`
  },
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
    category: 'Core Mechanics',
    summary: 'Work continues in your absence.',
    details: `Certain upgrades and skills grant passive PP generation (PP/sec). This accumulates even when you are not actively clicking.

The lights keep working even when you stop. They never stop.`
  },
  lowSanity: {
    id: 'lowSanity',
    title: 'Meditation System',
    category: 'Sanity Management',
    summary: 'Breathing exercises restore mental clarity.',
    details: `When sanity drops below 25%, MEDITATION becomes available. Press and hold SPACE to breathe in; the bar rises at a wandering speed. Release it inside the green zone near the top, let it fall for the exhale, and repeat three times.

The closer to the green zone on release, the more sanity you restore. Deep Breathing insights make each session worth more.

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
    summary: 'Permanent character advancement.',
    details: `Gain skill points by leveling up: 1 per level, plus a bonus 2 every 5th level. The XP each level needs rises in a steady, predictable line, so points keep coming.

Eight standalone skills, no branches and no prerequisites. Each levels several times and the bonuses are large:

Efficient Sorting / Passive Systems / Cross-Department Synergy raise PP output.
Energy Conservation / Mental Fortitude / Power Napping keep you working.
Portal Attunement / Temporal Distortion are the stranger advantages.

Skills are permanent within a run. Reality remembers your choices.`
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
• Tier 2: 3 prints
• Tier 3: 8 prints
• Tier 4: 18 prints
• Tier 5: 30 prints

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
  },
  chapter2: {
    id: 'chapter2',
    title: 'A Way Through',
    category: 'The Second Chapter',
    summary: 'The office is not the end. There is a way past it.',
    details: `Once every upgrade is bought, Chapter 2 begins. The cap on your sanity is removed.

The way out is not a door in the office. It is a state of mind beyond it. Meditation can now carry your sanity past 100%, into lucidity.`
  },
  lucid: {
    id: 'lucid',
    title: 'Lucidity (Sanity Above 100%)',
    category: 'The Second Chapter',
    summary: 'A mind pushed past its ceiling.',
    details: `Above 100% sanity you enter lucid tiers: Lucid Mind (100%), Sharpened Focus (250%), Piercing Clarity (500%), Boundless Awareness (750%), and Transcendent (1000%).

A lucid mind drifts: above 100% your sanity slowly sinks back toward 100% unless you keep it up with meditation, Clarity, or a Lucid Anchor.

Clarity is not the productivity path. Low sanity still grants the most PP and XP. Lucidity is a separate road that gathers new resources instead.`
  },
  resourcesDiscovered: {
    id: 'resourcesDiscovered',
    title: 'Lucidity & Intelligence',
    category: 'The Second Chapter',
    summary: 'Two new resources, and what powers them.',
    details: `Reaching 1000% sanity reveals two resources:

LUCIDITY (perception): gathers passively while lucid, faster the higher your sanity climbs, plus a bonus from meditating while already lucid.

INTELLIGENCE (understanding): earned from Debug successes, from consuming Reports, and as a small trickle while lucid.

Spend both in the INSIGHTS panel ("The Lucid Mind"), Chapter 2's research system. Five branches: Stability (Lucid Anchors that floor your sanity at 250 / 500 / 750), Discipline (stronger meditation, slower lucid decay), Perception (more passive lucidity), Cognition (more passive intelligence, more from Debug and Reports), and Techniques (craft Clarity to halt decay, then make it last longer and cost less).`
  },
};