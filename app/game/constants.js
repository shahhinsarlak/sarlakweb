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
  // Help System (Added 2025-10-26)
  // Tracks which help popups have been shown to avoid repetition
  helpEnabled: true, // Can be toggled by player
  shownHelpPopups: [], // Array of popup IDs that have been shown
  currentHelpPopup: null, // Current popup to display (object with id, title, content)
  meditationUnlocked: false, // Meditation button only appears after reaching 25% sanity
  playerPath: null,
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
  // Automation System (Added Phase 18)
  automation: {
    autoSort: false,
    autoSortThreshold: 80,
    autoPrint: false,
    autoPrintDocType: 'memo',
    autoPrintThreshold: 50,
    autoPortal: false,
    lastAutoPrint: 0,
  },
  // Prestige System (Added Phase 19)
  prestigeCount: 0,           // Number of times player has prestiged
  prestigeMultiplier: 1,      // Applied to all PP gain: 1 + (0.1 * prestigeCount)
  activePathBonuses: [],      // Array of { path, type, value } persisted across resets
  // Void Contracts (Phase 20)
  temporalPactActive: false,    // CONTRACT 1: ppPerSecond 2x, no time rewind
  voidBargainActive: false,     // CONTRACT 2: 2x material drop rate, portal cooldown doubled
  sanityErosionActive: false,   // CONTRACT 3: sanity<30 gives 3x ppPerClick instead of penalty
  maxSanity: 100,               // Mutable cap - Sanity Erosion sets to 60
  // Focus Mode (Phase 20)
  focusModeExpiry: 0,           // Unix ms timestamp when buff expires (0 = inactive)
  // Offline Accumulation (Phase 20)
  lastSavedAt: 0,               // Unix ms timestamp of last save
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
    'You have prestige\'d before. You will prestige again. It does not matter.',
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
    'Prestige is not escape. Prestige is understanding that escape was never the question.',
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
  { id: 'robotic_assistant', name: 'Robotic Assistant', cost: 5000, effect: 'unlock', value: 'autoSort',
    desc: 'An invisible hand sorts the papers. It has always been here.' },
  { id: 'document_automaton', name: 'Document Automaton', cost: 15000, effect: 'unlock', value: 'autoPrint',
    desc: 'The printer runs itself. You hear it printing at 3 AM.',
    requiresUpgrade: 'robotic_assistant' },
  { id: 'void_protocol', name: 'Void Protocol', cost: 50000, effect: 'unlock', value: 'autoPortal',
    desc: 'The portal opens on schedule. It expects you.',
    requiresUpgrade: 'document_automaton' },
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
    id: 'singularity_engine', 
    name: 'Singularity Engine', 
    materials: { singularity_node: 1 }, 
    effect: 'ppPerSecond', 
    value: 50, 
    desc: 'Harness the void itself. +50 PP/sec. Unlock The Void.' 
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
  },

  // Breakthrough
  {
    id: 'tear_the_veil',
    name: 'Tear the Veil',
    ppCost: 5000000,
    materials: {
      void_fragment: 10,
      static_crystal: 5,
      glitch_shard: 3,
      reality_dust: 2,
      temporal_core: 1,
      dimensional_essence: 1,
      singularity_node: 1
    },
    effect: 'breakthrough',
    value: 'survival',
    requiresUpgrade: 'singularity_collapse',
    desc: 'There is something beyond this office. Beyond this reality. You can feel it pulling.'
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
  { id: 'reality_bender', name: 'Reality Bender', desc: 'Toggle theme 20 times', check: (state) => state.themeToggleCount >= 20 },
  { id: 'portal_finder', name: 'Between Worlds', desc: 'Discover The Portal', check: (state) => state.portalUnlocked, reward: { type: 'portalCooldownReduction', value: 0.05 } },
  { id: 'first_material', name: 'Dimensional Miner', desc: 'Collect your first dimensional material', check: (state) => Object.values(state.dimensionalInventory || {}).reduce((sum, count) => sum + count, 0) > 0 },
  { id: 'material_hoarder', name: 'Material Hoarder', desc: 'Collect 100 total materials', check: (state) => Object.values(state.dimensionalInventory || {}).reduce((sum, count) => sum + count, 0) >= 100, reward: { type: 'portalCooldownReduction', value: 0.03 } },
  { id: 'rare_finder', name: 'Rare Find', desc: 'Collect a Temporal Core', check: (state) => (state.dimensionalInventory?.temporal_core || 0) > 0 },
  { id: 'essence_collector', name: 'Essence Collector', desc: 'Collect Dimensional Essence', check: (state) => (state.dimensionalInventory?.dimensional_essence || 0) > 0 },
  { id: 'singularity_hunter', name: 'Singularity Hunter', desc: 'Find a Singularity Node', check: (state) => (state.dimensionalInventory?.singularity_node || 0) > 0 },
  { id: 'first_dimensional_upgrade', name: 'Dimensional Crafter', desc: 'Purchase first dimensional upgrade', check: (state) => Object.keys(state.dimensionalUpgrades || {}).length > 0 },
  { id: 'reality_hacker', name: 'Reality Hacker', desc: 'Unlock all portal upgrades', check: (state) => state.dimensionalUpgrades?.dimensional_anchor && state.dimensionalUpgrades?.reality_stabilizer && state.dimensionalUpgrades?.temporal_accelerator, reward: { type: 'portalCooldownReduction', value: 0.08 } },
  { id: 'enlightened', name: 'Enlightened', desc: 'Unlock Void Sight', check: (state) => state.dimensionalUpgrades?.void_sight, reward: { type: 'ppMultiplier', value: 0.10 } },
  { id: 'time_lord', name: 'Time Lord', desc: 'Use Temporal Rewind', check: (state) => state.timeRewindUsed },
  { id: 'transcendent', name: 'Transcendent', desc: 'Craft Singularity Collapse', check: (state) => state.dimensionalUpgrades?.singularity_collapse },
  // Printer Achievements
  { id: 'printer_access', name: 'Print Run', desc: 'Unlock the Printer Room', check: (state) => state.printerUnlocked },
  { id: 'first_print', name: 'First Print', desc: 'Print your first distorted page', check: (state) => state.printCount >= 1 },
  { id: 'paper_hoarder', name: 'Paper Hoarder', desc: 'Accumulate 100 Paper', check: (state) => state.paper >= 100 },
  { id: 'paper_mogul', name: 'Paper Mogul', desc: 'Accumulate 1000 Paper', check: (state) => state.paper >= 1000 },
  { id: 'quality_control', name: 'Quality Control', desc: 'Reach 100% printer quality', check: (state) => state.printerQuality >= 100 },
  { id: 'print_master', name: 'Print Master', desc: 'Buy all printer upgrades', check: (state) => Object.keys(state.printerUpgrades || {}).length >= 13, reward: { type: 'ppMultiplier', value: 0.03 } },
  { id: 'reality_manifest', name: 'Reality Manifest', desc: 'Unlock the Reality Printer', check: (state) => state.printerUpgrades?.reality_printer },
  // Paper & Sanity System Achievements
  { id: 'embrace_madness', name: 'Embrace Madness', desc: 'Generate PP at critical sanity (<10%)', check: (state) => state.sortCount >= 1 && state.sanity < 10 },
  { id: 'bureaucrat', name: 'Master Bureaucrat', desc: 'File 50 reports', check: (state) => (state.documentMastery?.reports || 0) >= 50, reward: { type: 'ppMultiplier', value: 0.02 } },
  { id: 'reality_bender_paper', name: 'Reality Contractor', desc: 'Print 10 reality contracts', check: (state) => (state.documentMastery?.contracts || 0) >= 10 },
  // Automation Achievements
  { id: 'first_automation', name: 'Automated', desc: 'Enable your first automation',
    check: (state) => state.automation?.autoSort || state.automation?.autoPrint || state.automation?.autoPortal },
  { id: 'full_automation', name: 'Full Automation', desc: 'Enable all three automations',
    check: (state) => state.automation?.autoSort && state.automation?.autoPrint && state.automation?.autoPortal,
    reward: { type: 'ppMultiplier', value: 0.05 } },
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
 * Prestige Paths (Added Phase 19)
 *
 * Five paths a player can choose when prestiging (Survive Another Day).
 * Each path grants a permanent bonus that stacks across multiple prestige runs.
 * Bonuses are stored in activePathBonuses array in game state.
 */
export const PRESTIGE_PATHS = [
  { id: 'seeker',      name: 'The Seeker',      bonus: { type: 'xpGain',        value: 0.15  }, desc: 'Truth compounds. Knowledge persists.' },
  { id: 'rationalist', name: 'The Rationalist',  bonus: { type: 'ppPerSecond',   value: 0.15  }, desc: 'Efficiency is the only constant.' },
  { id: 'protector',   name: 'The Protector',    bonus: { type: 'sanityRegen',   value: 0.15  }, desc: 'Sanity is a renewable resource.' },
  { id: 'convert',     name: 'The Convert',      bonus: { type: 'paperRate',     value: 0.15  }, desc: 'The printer remembers.' },
  { id: 'rebel',       name: 'The Rebel',        bonus: { type: 'portalCooldown', value: -0.15 }, desc: 'The void opens faster for the bold.' },
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
    content: `Dimensional tears appear in the portal space.

Click a tear to collect the dimensional material inside.

Materials are used to craft powerful dimensional upgrades. Rarer materials yield more powerful effects.`,
    category: 'mechanics'
  },
  firstAutomation: {
    id: 'firstAutomation',
    title: 'AUTOMATION ONLINE',
    content: `The machine works so you don\u0027t have to.\n\nPurchase automation upgrades to unlock each slot.\nConfigure thresholds. Enable the toggle. Watch the work do itself.\n\nEfficiency is mandatory. You are optional.`,
    category: 'progression'
  },
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
  dimensionalTear: (gameState, prevState) => {
    const hasAny = Object.values(gameState.dimensionalInventory || {}).some(v => v > 0);
    const hadNone = !Object.values(prevState?.dimensionalInventory || {}).some(v => v > 0);
    return hasAny && hadNone;
  },
  firstAutomation: (state, prevState) =>
    state.upgrades?.robotic_assistant && (!prevState || !prevState.upgrades?.robotic_assistant),
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
  dimensionalTear: {
    id: 'dimensionalTear',
    title: 'Dimensional Tears',
    category: 'Advanced Mechanics',
    summary: 'Rifts containing dimensional materials.',
    details: `Tears spawn randomly during your work (chance-based).

Clicking a tear generates dimensional materials that can be crafted into upgrades at the portal shop.

RARITY TIERS:
Common → Uncommon → Rare → Epic → Legendary → Mythic

Higher rarities yield rarer materials.`
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
  firstAutomation: {
    id: 'firstAutomation',
    title: 'Automation System',
    category: 'Automation',
    summary: 'The office runs itself.',
    details: `Three automation upgrades offload repetitive tasks:\n\nROBOTIC ASSISTANT - sorts papers automatically when energy threshold is met.\nDOCUMENT AUTOMATON - prints documents automatically when paper threshold is met.\nVOID PROTOCOL - enters the portal automatically when cooldown is zero.\n\nToggle each automation in the AUTOMATION PANEL. Thresholds are configurable.`
  },
};