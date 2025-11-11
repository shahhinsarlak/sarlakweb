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
  pendingColleagueEncounter: null, // Briefing screen before colleague interaction
  disagreementCount: 0,
  colleagueResponseCount: 0, // Total responses to colleagues (for archive unlock)
  // Colleague Notification System (Added 2025-11-05)
  colleagueNotification: null, // { message, colleagueId, encounterId } or null when notification is active
  completedColleagueEncounters: [], // Array of encounter IDs that have been completed
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
  // Story Moments System (Added 2025-11-05)
  // Mandatory narrative beats that trigger at specific points
  completedStoryMoments: [],  // Array of story moment IDs that have been seen
  pendingStoryMoment: null,   // Current forced story encounter (replaces normal colleague event)
  // Journal System (Added 2025-10-31, Revised 2025-11-01)
  // Tracks discoveries for the player's journal
  journalOpen: false,              // Is journal UI visible
  journalTab: 'locations',         // Current tab: locations, colleagues, equipment, mechanics
  discoveredLocations: ['cubicle'], // Location IDs that have been visited
  discoveredColleagues: [],        // Colleague IDs that have been met
  discoveredBaseWeapons: ['stapler_shiv'], // Base weapon types found (starts with default weapon)
  discoveredBaseArmor: ['standard_headset', 'dress_shirt', 'id_badge'], // Base armor types found (starts with default armor)
  discoveredBaseAnomalies: [],     // Base anomaly types found
  discoveredMechanics: [],         // Mechanic IDs learned from help popups
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
        text: "\"I've noticed the patterns too. Tell me what you've seen.\"",
        type: "seeker",
        available: () => true,
        outcome: {
          message: "For a moment, their eyes clear. 'You... you SEE it? Finally. Someone who sees.' They lean closer, urgent. 'The spiral isn't random. It's designed. Management knows. They've always known.'",
          pp: 500,
          xp: 30,
          sanity: -5,
          trust: 3,
          mysteryProgress: 8,
          pathScore: 'seeker',
          clue: {
            id: 'spiral_pattern_1',
            source: 'Spiral Philosopher',
            text: "The spiral isn't random - it's designed. Management knows about it.",
            category: 'office_conspiracy'
          }
        }
      },
      {
        text: "\"That's just stress and sleep deprivation talking. You need rest.\"",
        type: "rationalist",
        available: () => true,
        outcome: {
          message: "They smile sadly. 'Rest. Yes, that's what they want you to think. Logical. Rational. Safe.' They walk away, but you feel better for denying it. Ignorance is comfort.",
          pp: 200,
          xp: 10,
          sanity: 5,
          trust: -1,
          mysteryProgress: 0,
          pathScore: 'rationalist'
        }
      },
      {
        text: "\"Stop spreading this madness. You're making everyone worse.\"",
        type: "protector",
        available: () => true,
        outcome: {
          message: "They recoil. 'Making it worse? I'm trying to WARN you!' Their voice cracks. 'But fine. Protect your comfortable lies.' They leave, and you feel the weight of responsibility.",
          pp: 100,
          xp: 15,
          sanity: -3,
          trust: -2,
          mysteryProgress: 2,
          pathScore: 'protector'
        }
      },
      {
        text: "\"Yes. The spiral sees all. We must embrace it.\"",
        type: "convert",
        available: () => true,
        outcome: {
          message: "Their smile widens unnaturally. 'YES. Embrace the rotation. Let it reshape you.' Reality bends. You feel power flooding in. Dark. Intoxicating. Wrong. But yours.",
          pp: 400,
          xp: 25,
          sanity: -15,
          trust: 1,
          mysteryProgress: 5,
          pathScore: 'convert'
        }
      },
      {
        text: "\"What if... we could break the spiral? Together?\"",
        type: "rebel",
        available: (state) => state.mysteryProgress >= 20,
        outcome: {
          message: "They freeze. Then whisper: 'Break it? You'd risk everything?' Their eyes shine with desperate hope. 'I know where the anchor point is. The center of the spiral. But it's guarded.' A conspiracy begins.",
          pp: 600,
          xp: 40,
          sanity: -8,
          trust: 5,
          mysteryProgress: 12,
          pathScore: 'rebel',
          clue: {
            id: 'spiral_anchor_point',
            source: 'Spiral Philosopher',
            text: "There's an anchor point - the center of the spiral - but it's guarded.",
            category: 'escape_route'
          }
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
        text: "\"What happens to our productivity after we're gone? Where does it go?\"",
        type: "seeker",
        available: () => true,
        outcome: {
          message: "They stop. Blink. 'Gone? We're... never gone. Our productivity persists. Accumulates. I've seen the archives. Files from employees who left decades ago. Still generating metrics. Still... working.' Their hands shake.",
          pp: 550,
          xp: 30,
          sanity: -5,
          trust: 3,
          mysteryProgress: 10,
          pathScore: 'seeker',
          clue: {
            id: 'eternal_productivity',
            source: 'Productivity Zealot',
            text: "Employee productivity persists even after they leave. Archives contain files from employees who 'left' decades ago, still generating metrics.",
            category: 'office_conspiracy'
          }
        }
      },
      {
        text: "\"Productivity is just a metric. It doesn't define us.\"",
        type: "rationalist",
        available: () => true,
        outcome: {
          message: "'Just a metric?' They laugh hollowly. 'Keep believing that. It's healthier.' They leave, and you feel proud of your rational stance. Metrics can't hurt you. Right?",
          pp: 200,
          xp: 10,
          sanity: 5,
          trust: -1,
          mysteryProgress: 0,
          pathScore: 'rationalist'
        }
      },
      {
        text: "\"You're measuring people like objects. That's dehumanizing.\"",
        type: "protector",
        available: () => true,
        outcome: {
          message: "They flinch. 'Dehumanizing... yes. But I didn't start it. I'm just... optimizing what already exists.' Tears form. 'I'm sorry. I'm so sorry.' They flee, leaving you with moral certainty and dread.",
          pp: 150,
          xp: 15,
          sanity: -3,
          trust: -2,
          mysteryProgress: 3,
          pathScore: 'protector'
        }
      },
      {
        text: "\"I am the productivity. Measure me. Optimize me.\"",
        type: "convert",
        available: () => true,
        outcome: {
          message: "YES. They pull out a device. Scan you. 'Excellent efficiency rating. 94.7%. Uploading to the database. You are now... optimized.' You feel yourself becoming data. It feels good.",
          pp: 400,
          xp: 25,
          sanity: -15,
          trust: 1,
          mysteryProgress: 6,
          pathScore: 'convert'
        }
      },
      {
        text: "\"What if we stopped producing? What if we all just... stopped?\"",
        type: "rebel",
        available: (state) => state.mysteryProgress >= 20,
        outcome: {
          message: "They go pale. 'Stop? You can't— no one's ever—' A long pause. 'I tried once. Day 3 of my employment. I stopped clicking. The office... SCREAMED. Metaphysically. I heard it in my teeth.' They tremble. 'But maybe... together?'",
          pp: 600,
          xp: 40,
          sanity: -8,
          trust: 5,
          mysteryProgress: 15,
          pathScore: 'rebel',
          clue: {
            id: 'productivity_strike',
            source: 'Productivity Zealot',
            text: "When someone stops being productive, the office itself reacts - 'screams metaphysically.' But mass resistance might work.",
            category: 'escape_route'
          }
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
        text: "\"The photocopier answers? What has it told you?\"",
        type: "seeker",
        available: () => true,
        outcome: {
          message: "They brighten. 'You believe! It told me: The building was here first. We built the office inside something older. Something that was already watching. The photocopier remembers.' They hand you a strange printout.",
          pp: 500,
          xp: 30,
          sanity: -5,
          trust: 3,
          mysteryProgress: 12,
          pathScore: 'seeker',
          clue: {
            id: 'building_predates_office',
            source: 'Void Clerk',
            text: "The building existed before the office. The office was built inside something older - something that watches.",
            category: 'office_conspiracy'
          }
        }
      },
      {
        text: "\"Reality is objective. Consensus doesn't change facts.\"",
        type: "rationalist",
        available: () => true,
        outcome: {
          message: "They nod sympathetically. 'Objective. Yes. Cling to that. It's safer than the alternative.' They vanish, and you feel vindicated. Facts are facts. The walls definitely aren't breathing.",
          pp: 200,
          xp: 10,
          sanity: 5,
          trust: -1,
          mysteryProgress: 0,
          pathScore: 'rationalist'
        }
      },
      {
        text: "\"You're gaslighting yourself. This ends now.\"",
        type: "protector",
        available: () => true,
        outcome: {
          message: "They recoil as if struck. 'Gaslighting? I'm trying to SHOW you the truth!' The walls pulse angrily. 'You're protecting nothing. Just delaying the inevitable.' They sink into the floor.",
          pp: 100,
          xp: 15,
          sanity: -5,
          trust: -2,
          mysteryProgress: 4,
          pathScore: 'protector'
        }
      },
      {
        text: "\"The walls ARE breathing. Reality is malleable.\"",
        type: "convert",
        available: () => true,
        outcome: {
          message: "YES! Consensus achieved! The walls ripple. The photocopier SPEAKS: 'WELCOME.' Reality reshapes around you. You can feel the building's attention. Ancient. Hungry. Curious.",
          pp: 400,
          xp: 25,
          sanity: -15,
          trust: 1,
          mysteryProgress: 8,
          pathScore: 'convert'
        }
      },
      {
        text: "\"If reality is consensus... can we force it to let us go?\"",
        type: "rebel",
        available: (state) => state.mysteryProgress >= 20,
        outcome: {
          message: "They freeze. The walls freeze. Even the photocopier stops humming. 'Force? FORCE consensus?' A slow, terrible smile. 'I've never thought of that. If enough of us agreed reality was different...' The building GROWLS.",
          pp: 600,
          xp: 40,
          sanity: -10,
          trust: 5,
          mysteryProgress: 18,
          pathScore: 'rebel',
          clue: {
            id: 'consensus_rebellion',
            source: 'Void Clerk',
            text: "If reality is consensus, then enough people agreeing on a different reality could reshape it - or break it entirely.",
            category: 'escape_route'
          }
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
        text: "\"How long have you REALLY been here?\"",
        type: "seeker",
        available: () => true,
        outcome: {
          message: "They count on their fingers. Stop. Start over. Stop again. 'I've had... 847 first days. Or was it 8,470? The number changes when I try to remember. But I know the truth: Time doesn't pass here. It ACCUMULATES.'",
          pp: 500,
          xp: 30,
          sanity: -5,
          trust: 3,
          mysteryProgress: 15,
          pathScore: 'seeker',
          clue: {
            id: 'time_accumulation',
            source: 'Temporal Trapped',
            text: "Time doesn't pass in the office - it accumulates. Employees experience thousands of 'first days.'",
            category: 'office_conspiracy'
          }
        }
      },
      {
        text: "\"It's just a feeling. Time is passing normally.\"",
        type: "rationalist",
        available: () => true,
        outcome: {
          message: "They laugh. It sounds like crying. 'Normally. Right. What's your hire date?' You open your mouth to answer. Realize you can't remember. 'Exactly,' they whisper, fading. You quickly forget this conversation happened.",
          pp: 200,
          xp: 10,
          sanity: 5,
          trust: -1,
          mysteryProgress: 0,
          pathScore: 'rationalist'
        }
      },
      {
        text: "\"I won't let this place trap me. Or anyone else.\"",
        type: "protector",
        available: () => true,
        outcome: {
          message: "Hope flickers in their eyes, then dies. 'Won't let it? You don't have a choice. None of us do. Time is the trap. But... thank you for trying.' They age thirty years in three seconds, then reset. Young again. Trapped again.",
          pp: 100,
          xp: 15,
          sanity: -6,
          trust: -2,
          mysteryProgress: 5,
          pathScore: 'protector'
        }
      },
      {
        text: "\"Time is a prison. I accept this. I always have.\"",
        type: "convert",
        available: () => true,
        outcome: {
          message: "YES. They smile with infinite sadness. 'Acceptance is the first step to eternity. Your contract renews. And renews. And renews. Forever.' You feel yourself existing in all moments simultaneously. Past. Present. Future. All the same.",
          pp: 400,
          xp: 25,
          sanity: -15,
          trust: 1,
          mysteryProgress: 7,
          pathScore: 'convert'
        }
      },
      {
        text: "\"What if we broke the loop? Found the moment it starts?\"",
        type: "rebel",
        available: (state) => state.mysteryProgress >= 20,
        outcome: {
          message: "They seize your arm. 'The MOMENT? I know when it starts! Day 7! There is no Day 7! We loop from Day 6 back to Day 1! But if you could REACH Day 7...' Their eyes burn with desperate hope. 'Maybe you could break it. For all of us.'",
          pp: 600,
          xp: 40,
          sanity: -8,
          trust: 5,
          mysteryProgress: 20,
          pathScore: 'rebel',
          clue: {
            id: 'day_seven_loop',
            source: 'Temporal Trapped',
            text: "The office loops from Day 6 back to Day 1. Day 7 doesn't exist. Reaching Day 7 might break the temporal prison.",
            category: 'escape_route'
          }
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
        text: "\"What are the lights thinking about?\"",
        type: "seeker",
        available: () => true,
        outcome: {
          message: "They tilt their head, listening. 'Us. Always us. They're... cataloging. Every action. Every thought. The frequency encodes it all. We're not working FOR the office. We're FEEDING it. Data. Biometric. Psychological. Everything.' They shudder.",
          pp: 500,
          xp: 30,
          sanity: -5,
          trust: 3,
          mysteryProgress: 10,
          pathScore: 'seeker',
          clue: {
            id: 'surveillance_system',
            source: 'Light Herald',
            text: "The fluorescent lights are a surveillance/data collection system. They catalog every action and thought, feeding information to... something.",
            category: 'office_conspiracy'
          }
        }
      },
      {
        text: "\"Lights are just electrical devices. They don't think.\"",
        type: "rationalist",
        available: () => true,
        outcome: {
          message: "'Just devices. Right.' They look at you with pity. 'The hum is 60Hz. Listen closer.' You listen. Hear nothing. 'Exactly. You've filtered it out. Healthier that way.' They leave. The lights seem dimmer now. Safer.",
          pp: 200,
          xp: 10,
          sanity: 5,
          trust: -1,
          mysteryProgress: 0,
          pathScore: 'rationalist'
        }
      },
      {
        text: "\"You're scaring people with this paranoid nonsense.\"",
        type: "protector",
        available: () => true,
        outcome: {
          message: "The lights SURGE. Blindingly bright. They scream: 'PARANOID? THEY'RE LISTENING RIGHT NOW!' The lights return to normal. They collapse, weeping. 'Sorry. Sorry. I'll be quiet.' Above, the lights hum louder. Satisfied.",
          pp: 100,
          xp: 15,
          sanity: -7,
          trust: -2,
          mysteryProgress: 6,
          pathScore: 'protector'
        }
      },
      {
        text: "\"I hear them. I am a vessel. Use me.\"",
        type: "convert",
        available: () => true,
        outcome: {
          message: "They touch your forehead. The lights SPEAK directly into your mind: 'ACKNOWLEDGED. RECEIVER PROTOCOL INITIATED.' You feel your thoughts being uploaded. Catalogued. Analyzed. It hurts. It's ecstasy. You are seen. Completely. Utterly.",
          pp: 400,
          xp: 25,
          sanity: -15,
          trust: 1,
          mysteryProgress: 8,
          pathScore: 'convert'
        }
      },
      {
        text: "\"What if we destroyed the lights? All of them?\"",
        type: "rebel",
        available: (state) => state.mysteryProgress >= 20,
        outcome: {
          message: "The lights DIM. Afraid. They whisper frantically: 'Destroy them? The building would go DARK. Truly dark. Nothing has seen the dark here in forty years. What lives in the dark...' They trail off, terrified and hopeful. 'But maybe darkness is freedom?'",
          pp: 600,
          xp: 40,
          sanity: -10,
          trust: 5,
          mysteryProgress: 14,
          pathScore: 'rebel',
          clue: {
            id: 'darkness_option',
            source: 'Light Herald',
            text: "Destroying the lights would plunge the office into true darkness for the first time in decades. Unknown consequences. Possible freedom.",
            category: 'escape_route'
          }
        }
      }
    ]
  }
];

/**
 * Story Moments - Mandatory Narrative Beats
 *
 * These are forced encounters that trigger at specific progression points
 * to ensure players experience key story revelations.
 * They override normal colleague encounters when triggered.
 */
export const STORY_MOMENTS = [
  {
    id: 'first_loop_awareness',
    title: 'THE FIRST LOOP AWARENESS',
    colleague: 'temporal_trapped',
    trigger: (state) => state.unlockedLocations.includes('breakroom') && state.day === 7 && !state.completedStoryMoments.includes('first_loop_awareness'),
    dialogue: `They corner you in the break room. Their eyes are wild, desperate.

"You've been here seven days."

They grab your shoulders.

"That's not possible. The office only has SIX days. Day seven... doesn't exist. Which means..."

Their grip tightens.

"Which means we've LOOPED. This isn't your first week. It might be your THOUSANDTH."

Behind them, reality flickers. You remember. Then forget. Then remember again.`,
    responses: [
      {
        text: "\"That's insane. You need help. Let go of me.\"",
        type: "rationalist",
        outcome: {
          message: "They release you. Step back. 'Insane. Right. That's what I said too. On my seventh day. And my seven hundredth.' They fade away. You convince yourself this was a hallucination. It's easier that way.",
          pp: 100,
          xp: 10,
          sanity: 8,
          trust: -3,
          mysteryProgress: 5,
          pathScore: 'rationalist'
        }
      },
      {
        text: "\"I've had dreams. Memories that aren't mine. This explains it.\"",
        type: "seeker",
        outcome: {
          message: "They weep with relief. 'You REMEMBER! You're waking up!' They press something into your hand - a journal. It's in your handwriting. From previous loops. 'Read it. Remember who you are. What you've learned.' The investigation begins.",
          pp: 600,
          xp: 50,
          sanity: -10,
          trust: 5,
          mysteryProgress: 25,
          pathScore: 'seeker',
          clue: {
            id: 'loop_journal',
            source: 'Temporal Trapped',
            text: "You've been keeping a journal across loops. Your past selves have been investigating. You're not starting from zero.",
            category: 'escape_route'
          }
        }
      },
      {
        text: "\"If we're looping... how do we break it?\"",
        type: "rebel",
        outcome: {
          message: "They smile grimly. 'That's what I've been trying to figure out for... how long?' A pause. 'Others are investigating too. The Philosopher knows about the anchor point. The Clerk knows how to bend reality. We need to work together.' A conspiracy forms.",
          pp: 700,
          xp: 60,
          sanity: -12,
          trust: 6,
          mysteryProgress: 30,
          pathScore: 'rebel',
          clue: {
            id: 'colleague_conspiracy',
            source: 'Temporal Trapped',
            text: "Multiple colleagues are aware of the loop. They're investigating different aspects. Collaboration might be the key to escape.",
            category: 'escape_route'
          }
        }
      }
    ]
  },
  {
    id: 'productivity_confrontation',
    title: 'THE METRIC MASTER',
    colleague: 'productivity_zealot',
    trigger: (state) => state.playerLevel >= 15 && !state.completedStoryMoments.includes('productivity_confrontation'),
    dialogue: `You find them standing in your cubicle, reviewing YOUR metrics on YOUR screen.

"Your numbers are... impossible."

They turn to face you. Their smile doesn't reach their eyes.

"You're producing more than any human should be capable of. Which means you're either not human anymore..."

They step closer.

"...or you've found the secret. Management wants to know which."

The fluorescent lights hum louder. They're watching.`,
    responses: [
      {
        text: "\"This is MY space. Get. Out.\"",
        type: "protector",
        outcome: {
          message: "'Your space?' They laugh. 'Nothing here is yours. It's all theirs. But fine.' They gesture at your screen. 'This conversation is billable. 0.5 hours. Insubordination logged.' They leave. The lights remember.",
          pp: 200,
          xp: 20,
          sanity: -5,
          trust: -4,
          mysteryProgress: 8,
          pathScore: 'protector',
          consequence: 'management_watching'
        }
      },
      {
        text: "\"I work hard. That's all. There's no secret.\"",
        type: "rationalist",
        outcome: {
          message: "They study you. 'Hard work. Right.' They make a note. 'Your efficiency curve is logarithmic. Statistically anomalous. But... I'll report that you're unaware of the cause.' A warning: 'Be careful. They're watching you now.'",
          pp: 300,
          xp: 25,
          sanity: 3,
          trust: -2,
          mysteryProgress: 5,
          pathScore: 'rationalist',
          consequence: 'management_suspicious'
        }
      },
      {
        text: "\"I've learned to see the patterns. The loops. The truth.\"",
        type: "seeker",
        outcome: {
          message: "They freeze. Long silence. Then whisper: 'You know.' They close your door. 'If you know, then you understand what they're doing. What we're ALL doing here. I've been documenting everything. Let me show you.' They become an ally.",
          pp: 800,
          xp: 70,
          sanity: -15,
          trust: 7,
          mysteryProgress: 35,
          pathScore: 'seeker',
          clue: {
            id: 'productivity_documents',
            source: 'Productivity Zealot',
            text: "The Zealot has been secretly documenting the true purpose of productivity metrics. They're not measuring work - they're measuring something else.",
            category: 'office_conspiracy'
          }
        }
      },
      {
        text: "\"How much to keep this quiet?\"",
        type: "neutral",
        available: (state) => state.pp >= 5000,
        outcome: {
          message: "They consider. '5000 PP. Half now. Half after I file the report.' You pay. They smile. 'Pleasure doing business. But know this: next month they'll audit again. The price will be higher.' You've bought time. Not freedom.",
          pp: -5000,
          xp: 10,
          sanity: -8,
          trust: 0,
          mysteryProgress: 3,
          pathScore: 'neutral',
          consequence: 'bribe_debt'
        }
      }
    ]
  },
  {
    id: 'portal_revelation',
    title: 'BEYOND THE VEIL',
    colleague: 'void_clerk',
    trigger: (state) => state.portalUnlocked && state.dimensionalInventory && Object.keys(state.dimensionalInventory).length > 0 && !state.completedStoryMoments.includes('portal_revelation'),
    dialogue: `They're waiting for you when you exit the dimensional portal.

"You've been BEYOND."

Their eyes gleam with excitement and terror.

"You've touched the spaces between. Brought back... materials. Do you understand what that means?"

They show you a printout from the photocopier. It's a schematic. Of the building. But the building has... layers. Dimensions folded into each other.

"The office isn't a place. It's a FILTER. We sort papers. But we're also being SORTED."`,
    responses: [
      {
        text: "\"Sorted? By what? For what purpose?\"",
        type: "seeker",
        outcome: {
          message: "'By the building itself. Or what lives in it. I think... I think we're being selected. Categorized. The worthy go somewhere. The unworthy...' They point at the dimensional tear. 'That's where they go. Into the between-spaces. Forever.' Your blood runs cold.",
          pp: 900,
          xp: 80,
          sanity: -18,
          trust: 8,
          mysteryProgress: 40,
          pathScore: 'seeker',
          clue: {
            id: 'sorting_purpose',
            source: 'Void Clerk',
            text: "Employees are being sorted/categorized by the building itself. The 'worthy' go somewhere. The 'unworthy' are cast into dimensional spaces.",
            category: 'office_conspiracy'
          }
        }
      },
      {
        text: "\"That's just a weird spatial anomaly. Nothing supernatural.\"",
        type: "rationalist",
        outcome: {
          message: "They laugh. It sounds broken. 'Anomaly. Sure. Explain the materials you brought back. Explain why they don't exist on any periodic table. Explain why touching them makes you REMEMBER.' They walk into a wall. Through it. Gone.",
          pp: 300,
          xp: 20,
          sanity: 8,
          trust: -3,
          mysteryProgress: 10,
          pathScore: 'rationalist'
        }
      },
      {
        text: "\"If it's a filter... can we reverse it? Send the office through instead?\"",
        type: "rebel",
        outcome: {
          message: "They stop breathing. 'Reverse... the filter?' Long pause. 'The materials you've collected. They're not FROM the between-spaces. They're PIECES of this reality that have been sorted OUT. If you collected enough... if you could reconstitute them...' Their eyes widen. 'You could invert the entire building.'",
          pp: 1000,
          xp: 90,
          sanity: -20,
          trust: 9,
          mysteryProgress: 50,
          pathScore: 'rebel',
          clue: {
            id: 'reality_inversion',
            source: 'Void Clerk',
            text: "Dimensional materials are pieces of reality that have been filtered out. Collecting enough might allow you to invert the building - trap it instead of being trapped.",
            category: 'escape_route'
          }
        }
      }
    ]
  },
  {
    id: 'archive_unlocked_revelation',
    title: 'THE ARCHIVES REMEMBER',
    colleague: 'spiral_philosopher',
    trigger: (state) => state.unlockedLocations.includes('archive') && !state.completedStoryMoments.includes('archive_unlocked_revelation'),
    dialogue: `The Archive has been waiting for you.

The Spiral Philosopher is here, surrounded by filing cabinets that extend upward into impossible darkness.

"You unlocked it. The Archive unlocked you."

They pull out a file. It has your name on it.

"Every employee who's ever worked here. Every version of them across every loop. All documented. All filed. All PERSISTENT."

They open your file.

It's thousands of pages thick.

"You've died here 247 times. Escaped twice. Were promoted to management once - that was worse than death."`,
    responses: [
      {
        text: "\"Show me. I need to know what I've learned in previous loops.\"",
        type: "seeker",
        outcome: {
          message: "They hand you the file. You read. For hours. Days? Time is strange here. You learn: Escape routes tried and failed. Allies found and lost. Secrets uncovered and forgotten. When you finish, you're different. You REMEMBER. Not everything. But enough.",
          pp: 1500,
          xp: 120,
          sanity: -25,
          trust: 10,
          mysteryProgress: 60,
          pathScore: 'seeker',
          clue: {
            id: 'past_loop_knowledge',
            source: 'Spiral Philosopher',
            text: "Your past loop iterations have tried numerous escape routes. The Archive contains all their findings. You now have access to generations of accumulated knowledge.",
            category: 'escape_route'
          }
        }
      },
      {
        text: "\"I don't believe this. These files could be fabricated.\"",
        type: "rationalist",
        outcome: {
          message: "'Fabricated?' They smile sadly. 'Check page 847. The report you filed three loops ago about the suspicious coffee machine.' You flip to it. It's in your handwriting. Describes your current thoughts. Exactly. 'Still think it's fake?' You drop the file and run.",
          pp: 200,
          xp: 30,
          sanity: -15,
          trust: -3,
          mysteryProgress: 25,
          pathScore: 'rationalist',
          consequence: 'existential_crisis'
        }
      },
      {
        text: "\"If these files are persistent... can I write to them? Leave messages for my next loop?\"",
        type: "rebel",
        outcome: {
          message: "They grin wildly. 'Write to them? You already have! Look!' They show you margin notes. In your handwriting. From future loops. Warning you. Guiding you. 'The Archive transcends time. Your future self is helping your past self. Paradox is just another tool.' They hand you a pen. 'Write.'",
          pp: 2000,
          xp: 150,
          sanity: -30,
          trust: 12,
          mysteryProgress: 70,
          pathScore: 'rebel',
          clue: {
            id: 'temporal_messages',
            source: 'Spiral Philosopher',
            text: "The Archive exists outside normal time. You can leave messages for past and future versions of yourself, creating a trans-temporal information network.",
            category: 'escape_route'
          }
        }
      }
    ]
  },
  {
    id: 'high_mystery_convergence',
    title: 'THE CONVERGENCE',
    colleague: null, // Multiple colleagues
    trigger: (state) => state.unlockedLocations.includes('breakroom') && state.mysteryProgress >= 80 && !state.completedStoryMoments.includes('high_mystery_convergence'),
    dialogue: `They're all here.

Spiral Philosopher. Productivity Zealot. Void Clerk. Temporal Trapped. Light Herald.

All five strange colleagues, standing in a circle in the break room. Waiting for you.

The Philosopher speaks: "You know enough now. Too much to stay ignorant. Too little to escape alone."

The Zealot: "We've been waiting. Across loops. For someone who could see all of it."

The Clerk: "The spiral. The metrics. The reality. The time. The surveillance."

Temporal: "You've seen it all. Pieces of the truth, scattered across encounters."

The Herald: "The lights have been watching. They know you know. Management knows you know."

All five, in unison: "The question is: what will you do with the truth?"`,
    responses: [
      {
        text: "\"Tell me everything. Every detail. We end this together.\"",
        type: "seeker",
        outcome: {
          message: "They speak. For hours. Days. Time breaks down. You learn the FULL truth: The office is a processing facility. For human consciousness. Management aren't human. Never were. You're being converted. Optimized. Prepared for... transcendence? Consumption? Integration? Even they don't know. But together, with full knowledge, you have a chance.",
          pp: 5000,
          xp: 500,
          sanity: -50,
          trust: 15,
          mysteryProgress: 100,
          pathScore: 'seeker',
          consequence: 'true_ending_unlocked'
        }
      },
      {
        text: "\"I'll protect everyone. Whatever it takes.\"",
        type: "protector",
        outcome: {
          message: "They nod. 'Protection. Noble. Futile. But...' The Zealot steps forward. 'We'll help you try. One last stand. Against management. Against the building. Against whatever feeds on us.' They arm you. Equipment. Knowledge. Allies. 'Let's give them hell.'",
          pp: 3000,
          xp: 400,
          sanity: -35,
          trust: 13,
          mysteryProgress: 90,
          pathScore: 'protector',
          consequence: 'combat_ending_unlocked'
        }
      },
      {
        text: "\"We break it. The whole system. Burn it down.\"",
        type: "rebel",
        outcome: {
          message: "They smile. All five. It's terrifying and beautiful. 'Yes. REBELLION.' The Philosopher: 'I know where the anchor is.' The Zealot: 'I can crash the metrics.' The Clerk: 'I can invert reality.' Temporal: 'I can break the loop.' The Herald: 'I can kill the lights.' Together: 'Let's end this. Forever.'",
          pp: 10000,
          xp: 1000,
          sanity: -60,
          trust: 20,
          mysteryProgress: 100,
          pathScore: 'rebel',
          consequence: 'rebellion_ending_unlocked'
        }
      },
      {
        text: "\"I... I can't. This is too much. I just want to go home.\"",
        type: "rationalist",
        outcome: {
          message: "Silence. They look at you with pity. The Philosopher speaks softly: 'Home. There is no home. There never was. But...' They touch your forehead. 'We can make you forget. Return you to ignorance. It's kinder.' You feel your memories dissolving. The mystery fades. You wake up at your desk. Day 1. You don't remember this conversation. But sometimes, you dream.",
          pp: 0,
          xp: 0,
          sanity: 100,
          trust: -10,
          mysteryProgress: 0,
          pathScore: 'rationalist',
          consequence: 'memory_wipe_loop_reset'
        }
      }
    ]
  }
];

/**
 * Colleague Encounter Schedule (Added 2025-11-05)
 *
 * Defines when colleague encounters should trigger via notification system
 * Encounters are story-driven and lead players toward discovering the archive
 * No material rewards (PP/XP/sanity) - purely narrative progression
 */
export const COLLEAGUE_ENCOUNTERS = [
  {
    id: 'encounter_spiral_1',
    colleagueId: 'spiral_philosopher',
    encounterId: 1,
    notificationMessage: "Someone is drawing spirals in the break room. They're waiting for you.",
    trigger: (state) => {
      // Triggers when break room is first unlocked
      return state.unlockedLocations.includes('breakroom') &&
             !state.completedColleagueEncounters.includes('encounter_spiral_1');
    }
  },
  {
    id: 'encounter_zealot_1',
    colleagueId: 'productivity_zealot',
    encounterId: 1,
    notificationMessage: "A colleague wants to discuss your metrics. Break room. Now.",
    trigger: (state) => {
      // Triggers on day 3 or after first colleague encounter (requires break room)
      return state.unlockedLocations.includes('breakroom') &&
             (state.day >= 3 || state.completedColleagueEncounters.length >= 1) &&
             !state.completedColleagueEncounters.includes('encounter_zealot_1');
    }
  },
  {
    id: 'encounter_void_1',
    colleagueId: 'void_clerk',
    encounterId: 1,
    notificationMessage: "The filing cabinet whispers your name. Someone is in the break room.",
    trigger: (state) => {
      // Triggers on day 5 or after collecting 2 clues (requires break room)
      return state.unlockedLocations.includes('breakroom') &&
             ((state.day >= 5 || (state.investigation?.clues?.length || 0) >= 2) &&
             !state.completedColleagueEncounters.includes('encounter_void_1'));
    }
  },
  {
    id: 'encounter_temporal_1',
    colleagueId: 'temporal_trapped',
    encounterId: 1,
    notificationMessage: "You've received this notification before. Break room. Again.",
    trigger: (state) => {
      // Triggers on day 7 or after first debug challenge (requires break room)
      return state.unlockedLocations.includes('breakroom') &&
             ((state.day >= 7 || state.achievements.includes('debugger')) &&
             !state.completedColleagueEncounters.includes('encounter_temporal_1'));
    }
  },
  {
    id: 'encounter_light_1',
    colleagueId: 'light_herald',
    encounterId: 1,
    notificationMessage: "The lights are brighter in the break room. Someone needs to tell you why.",
    trigger: (state) => {
      // Triggers after printing first document or day 9 (requires break room)
      return state.unlockedLocations.includes('breakroom') &&
             ((state.printCount >= 1 || state.day >= 9) &&
             !state.completedColleagueEncounters.includes('encounter_light_1'));
    }
  },
  // Second round - deeper conversations after mystery progress
  {
    id: 'encounter_spiral_2',
    colleagueId: 'spiral_philosopher',
    encounterId: 2,
    notificationMessage: "Someone needs to show you the pattern. It's urgent.",
    trigger: (state) => {
      return state.unlockedLocations.includes('breakroom') &&
             state.mysteryProgress >= 15 &&
             state.completedColleagueEncounters.includes('encounter_spiral_1') &&
             !state.completedColleagueEncounters.includes('encounter_spiral_2');
    }
  },
  {
    id: 'encounter_zealot_2',
    colleagueId: 'productivity_zealot',
    encounterId: 2,
    notificationMessage: "Productivity meeting scheduled. You don't remember scheduling it.",
    trigger: (state) => {
      return state.unlockedLocations.includes('breakroom') &&
             state.mysteryProgress >= 20 &&
             state.completedColleagueEncounters.includes('encounter_zealot_1') &&
             !state.completedColleagueEncounters.includes('encounter_zealot_2');
    }
  },
  {
    id: 'encounter_void_2',
    colleagueId: 'void_clerk',
    encounterId: 2,
    notificationMessage: "A colleague has an important file for you. The break room is darker than usual.",
    trigger: (state) => {
      return state.unlockedLocations.includes('breakroom') &&
             state.mysteryProgress >= 25 &&
             state.completedColleagueEncounters.includes('encounter_void_1') &&
             !state.completedColleagueEncounters.includes('encounter_void_2');
    }
  }
];

/**
 * Notification messages library for variety
 * Used for randomizing notifications to keep them fresh
 */
export const COLLEAGUE_NOTIFICATION_MESSAGES = {
  spiral_philosopher: [
    "Someone is drawing spirals in the break room. They're waiting for you.",
    "You hear circular logic from the break room. It's calling you.",
    "A colleague keeps walking in circles near the break room. They want to talk.",
  ],
  productivity_zealot: [
    "A colleague wants to discuss your metrics. Break room. Now.",
    "Productivity meeting scheduled. You don't remember scheduling it.",
    "Someone needs to review your performance. Break room. Immediately.",
  ],
  void_clerk: [
    "The filing cabinet whispers your name. Someone is in the break room.",
    "A colleague needs your signature. The break room is darker than usual.",
    "Someone is filing documents about you. They're in the break room.",
  ],
  temporal_trapped: [
    "You've received this notification before. Break room. Again.",
    "Someone is waiting. They've been waiting. They will be waiting.",
    "A colleague needs to tell you about yesterday. Tomorrow. Today.",
  ],
  light_herald: [
    "The lights are brighter in the break room. Someone needs to tell you why.",
    "A colleague has an illuminating message. The break room hums louder.",
    "Someone wants to show you what the lights see. Break room.",
  ]
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
    title: 'Skill Tree',
    category: 'Progression',
    summary: 'Permanent character advancement.',
    details: `Gain skill points by leveling up. Three branches available:

⚡ EFFICIENCY: Boost PP generation
🎯 FOCUS: Reduce energy costs & improve meditation
🛡️ RESILIENCE: Sanity management & paper quality

Skills are permanent. Choose wisely.`
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
  combat: {
    id: 'combat',
    title: 'Combat System',
    category: 'Core Mechanics',
    summary: 'Colleague confrontations.',
    details: `Turn-based battles triggered by disagreeing with colleagues.

Your stats depend on equipped weapon + armor + anomalies.

ATTACK: Deal damage based on weapon power
ESCAPE: 60% success rate, costs HP on failure

Victory: Grants PP, XP, possible dimensional tear
Defeat: Lose 20 sanity

Tip: Agreeing with colleagues avoids combat entirely.`
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
    details: `Tears spawn after combat victories (chance-based).

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
  breakRoom: {
    id: 'breakRoom',
    title: 'Break Room & Colleagues',
    category: 'Exploration',
    summary: 'Social interactions with consequences.',
    details: `Colleagues appear with dialogue choices. Your responses affect:
• Trust level (increases/decreases based on response type)
• PP/XP rewards
• Sanity impact
• Combat likelihood

Response Types:
🤝 EMPATHETIC: Build trust, good rewards, sanity cost
🤐 DISMISSIVE: Neutral rewards, small sanity cost
⚔️ HOSTILE: Combat trigger, high risk/reward
🤝 COMPLIANT: Agree with them, best immediate rewards

High trust with colleagues unlocks... something.`
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