// app/survival/constants.js
// === DAY_CONFIG === (add new day structure config here)
export const DAY_CONFIG = {
  baseActionSlots: 4,
};

// === INITIAL_STATE ===
export const INITIAL_SURVIVAL_STATE = {
  day: 1,
  food: 3,
  water: 3,
  firewood: 2,
  shelter: 10,
  daysWithoutFood: 0,
  daysWithoutWater: 0,
  actionLog: [],        // Array of narrative strings
  chosenActions: [],    // Action IDs queued for current day
  bonusActionSlotNextDay: false,
  bonusActionSlotToday: false,
  isDead: false,
  introSeen: false,
};

// === RESOURCES === (add new resources here)
export const RESOURCE_DRAIN = {
  food: 1,
  water: 1,
  firewood: 1,   // only consumed if firewood > 0
  shelter: 2,    // integrity decay per day
};

// === ACTIONS === (add new actions here)
export const ACTIONS = [
  {
    id: 'forage',
    label: 'Forage',
    slots: 1,
    desc: 'Search the area for edible plants and berries.',
    resolve: () => ({ food: Math.floor(Math.random() * 3) + 1 }),
  },
  {
    id: 'collect_water',
    label: 'Collect Water',
    slots: 1,
    desc: 'Find a stream or collect rainwater.',
    resolve: () => ({ water: Math.floor(Math.random() * 3) + 2 }),
  },
  {
    id: 'gather_wood',
    label: 'Gather Wood',
    slots: 1,
    desc: 'Collect firewood to survive the night.',
    resolve: () => ({ firewood: Math.floor(Math.random() * 2) + 2 }),
  },
  {
    id: 'build_shelter',
    label: 'Build Shelter',
    slots: 1,
    desc: 'Repair and reinforce your shelter.',
    resolve: () => ({ shelter: Math.floor(Math.random() * 6) + 5 }),
  },
  {
    id: 'rest',
    label: 'Rest',
    slots: 1,
    desc: 'Recover. Gain a bonus action slot tomorrow.',
    resolve: () => ({ bonusActionSlot: true }),
  },
  {
    id: 'hunt',
    label: 'Hunt',
    slots: 2,
    desc: 'Stalk larger game. Costs 2 slots. Chance of failure.',
    resolve: () => {
      const success = Math.random() > 0.3;
      return success
        ? { food: Math.floor(Math.random() * 4) + 3 }
        : { huntFailed: true };
    },
  },
  {
    id: 'explore',
    label: 'Explore',
    slots: 1,
    desc: 'Venture further out. Unknown outcomes.',
    resolve: () => ({ triggerExploreEvent: true }),
  },
];

// === EVENTS === (add new random events here)
export const EVENTS = [
  { id: 'clear_day', narrative: 'A clear sky. Nothing remarkable happens.', effect: {} },
  { id: 'rain', narrative: 'Rain. Your water stores are replenished.', effect: { water: 2 } },
  { id: 'cold_night', narrative: 'A bitter night. Your firewood burns faster.', effect: { firewood: -1 } },
  { id: 'found_berries', narrative: 'A berry bush nearby. Small mercy.', effect: { food: 2 } },
  { id: 'storm', narrative: 'A storm battered your shelter while you slept.', effect: { shelter: -10 } },
  { id: 'quiet', narrative: 'Quiet. Just wind. It is almost peaceful.', effect: {} },
  { id: 'morning_mist', narrative: 'Heavy mist in the morning. The world feels far away.', effect: {} },
  { id: 'animal_nearby', narrative: 'You heard something moving in the dark. It did not come closer.', effect: {} },
];

export const EXPLORE_EVENTS = [
  { id: 'found_cache', narrative: 'An old supply cache, half-buried. Food and water inside.', effect: { food: 4, water: 3 } },
  { id: 'high_ground', narrative: 'From higher ground you see the landscape clearly. The horizon is vast.', effect: {} },
  { id: 'old_fire', narrative: 'Someone camped here before you. They left firewood.', effect: { firewood: 4 } },
  { id: 'dangerous_terrain', narrative: 'Unstable ground. You retreat carefully. Time wasted.', effect: {} },
  { id: 'fresh_water', narrative: 'A spring. Clean water. You drink deeply and fill what you can carry.', effect: { water: 5 } },
];
