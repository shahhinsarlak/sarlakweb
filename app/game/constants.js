// Game constants and data

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
  showSkillTree: false
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
    atmosphere: ['The air tastes stale.', 'You hear typing from the next cubicle. There is no next cubicle.', 'Your coffee is cold. It was always cold.']
  },
  breakroom: {
    name: 'BREAK ROOM',
    description: 'The microwave beeps. No one is using it.',
    atmosphere: ['The vending machine hums louder than it should.', 'Someone left half a sandwich. Yesterday? Last week?', 'The water cooler is empty. It keeps bubbling.']
  },
  serverroom: {
    name: 'SERVER ROOM',
    description: 'Rows of blinking lights. The fans scream.',
    atmosphere: ['The temperature drops. Then rises. Then drops again.', 'Error messages scroll past. None of them are in English.', 'You hear your own voice in the white noise.']
  },
  managers: {
    name: "MANAGER'S OFFICE",
    description: 'The door is always open. You never see anyone inside.',
    atmosphere: ['The nameplate reads: ████████████', 'There are 47 coffee cups on the desk. All full.', 'The clock runs backwards.']
  },
  basement: {
    name: 'BASEMENT LEVEL B7',
    description: 'You should not be here.',
    atmosphere: ['The walls pulse.', 'Something drips. Not water.', 'You see yourself standing in the corner. You wave. You wave back.']
  },
  roof: {
    name: 'ROOF ACCESS',
    description: 'The sky is the wrong color.',
    atmosphere: ['The wind whispers performance metrics.', 'You can see the office from up here. All 847 floors of it.', 'The edge calls to you. Not today.']
  },
  archive: {
    name: 'THE ARCHIVE',
    description: 'A place that shouldn\'t exist. Files from employees who never were.',
    atmosphere: ['The silence is deafening.', 'Every file is labeled with your name.', 'Time moves differently here.'],
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
    atmosphere: [
      'You feel pulled in two directions at once.',
      'The portal hums at frequencies that shouldn\'t exist.',
      'Through the breach, you see yourself. Looking back.'
    ],
    items: []
  },
  drawer: {
    name: 'BOTTOM DRAWER',
    description: 'You never noticed it before. Has it always been here?',
    atmosphere: [
      'The drawer is deeper than it should be.',
      'Something metallic glints in the darkness.',
      'Your hand reaches in. It goes further. Further.'
    ],
    items: []
  }
};

export const UPGRADES = [
  { id: 'stapler', name: 'Premium Stapler', cost: 50, effect: 'ppPerClick', value: 2, desc: 'It never jams. Never.' },
  { id: 'coffee', name: 'Coffee Machine', cost: 150, effect: 'ppPerSecond', value: 1, desc: 'Automatic productivity. Tastes like copper.' },
  { id: 'keyboard', name: 'Mechanical Keyboard', cost: 300, effect: 'ppPerClick', value: 5, desc: 'The clicking soothes you. Click. Click. Click.' },
  { id: 'debugger', name: 'Debug Access', cost: 500, effect: 'unlock', value: 'debug', desc: 'Fix the code. Fix reality. Same thing.' },
  { id: 'chair', name: 'Ergonomic Chair', cost: 600, effect: 'unlock', value: 'exploration', desc: 'You can finally stand up.' },
  { id: 'energydrink', name: 'Energy Drink Pack', cost: 800, effect: 'maxEnergy', value: 20, desc: '5000% daily value of everything.' },
  { id: 'monitor', name: 'Second Monitor', cost: 1200, effect: 'ppPerSecond', value: 3, desc: 'Twice the work. Twice the witnessing.' },
  { id: 'vpn', name: 'VPN Access', cost: 2000, effect: 'unlock', value: 'serverroom', desc: 'They said this network doesn\'t exist.' },
  { id: 'pills', name: 'Prescription Pills', cost: 2500, effect: 'sanityRegen', value: 0.5, desc: 'For anxiety. Or is it for seeing?' },
  { id: 'keycard', name: 'Manager\'s Keycard', cost: 4000, effect: 'unlock', value: 'managers', desc: 'You found it in your desk. It has your name on it.' },
  { id: 'redkey', name: 'Red Keycard', cost: 8000, effect: 'unlock', value: 'basement', desc: 'IT BURNS TO HOLD' },
  { id: 'promotion', name: 'SENIOR ANALYST', cost: 12000, effect: 'ppPerSecond', value: 10, desc: 'Congratulations on your mandatory advancement.' },
  { id: 'roofaccess', name: 'Roof Access', cost: 18000, effect: 'unlock', value: 'roof', desc: 'Emergency exit only. This is an emergency.' }
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
    desc: 'Materials regenerate faster in the void.' 
  },
  
  // Sanity Management
  { 
    id: 'void_shield', 
    name: 'Void Shield', 
    materials: { void_fragment: 20 }, 
    effect: 'sanityRegen', 
    value: 0.5, 
    desc: 'Passive +0.5 sanity/sec. Colleagues fear you.' 
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
  
  // Combat/Weapons
  { 
    id: 'drawer_key', 
    name: 'Bottom Drawer Key', 
    materials: { void_fragment: 10, static_crystal: 5 }, 
    effect: 'unlock', 
    value: 'drawer', 
    desc: 'You find a key in your pocket. It was always there.' 
  },
  { 
    id: 'shard_weapon', 
    name: 'Shard Blade', 
    materials: { glitch_shard: 30, temporal_core: 5 }, 
    effect: 'combat', 
    value: 'blade', 
    desc: 'Confront what haunts these halls.' 
  },
  { 
    id: 'crystal_imbuer', 
    name: 'Crystal Imbuer', 
    materials: { static_crystal: 20, dimensional_essence: 1 }, 
    effect: 'unlock', 
    value: 'imbuing', 
    desc: 'Weapons can be enhanced with dimensional crystals.' 
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
    materials: { singularity_node: 3 }, 
    effect: 'unlock', 
    value: 'ending', 
    desc: 'ESCAPE. TRANSCEND. ASCEND. LEAVE.' 
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
  { id: 'explorer', name: 'Explorer', desc: 'Unlock all locations', check: (state) => state.unlockedLocations.length >= 7 },
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
  { id: 'arsenal', name: 'Arsenal', desc: 'Unlock Bottom Drawer', check: (state) => state.unlockedLocations.includes('drawer') },
  { id: 'armed', name: 'Armed', desc: 'Craft Shard Blade', check: (state) => state.dimensionalUpgrades?.shard_weapon },
  { id: 'reality_hacker', name: 'Reality Hacker', desc: 'Unlock all portal upgrades', check: (state) => state.dimensionalUpgrades?.dimensional_anchor && state.dimensionalUpgrades?.reality_stabilizer && state.dimensionalUpgrades?.temporal_accelerator },
  { id: 'enlightened', name: 'Enlightened', desc: 'Unlock Void Sight', check: (state) => state.dimensionalUpgrades?.void_sight },
  { id: 'time_lord', name: 'Time Lord', desc: 'Use Temporal Rewind', check: (state) => state.timeRewindUsed },
  { id: 'transcendent', name: 'Transcendent', desc: 'Craft Singularity Collapse', check: (state) => state.dimensionalUpgrades?.singularity_collapse }
];