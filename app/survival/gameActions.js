// app/survival/gameActions.js
import { ACTIONS, EVENTS, EXPLORE_EVENTS, RESOURCE_DRAIN, DAY_CONFIG } from './constants';

const applyEffect = (state, effect) => {
  const s = { ...state };
  if (effect.food !== undefined) s.food = Math.max(0, s.food + effect.food);
  if (effect.water !== undefined) s.water = Math.max(0, s.water + effect.water);
  if (effect.firewood !== undefined) s.firewood = Math.max(0, s.firewood + effect.firewood);
  if (effect.shelter !== undefined) s.shelter = Math.min(100, Math.max(0, s.shelter + effect.shelter));
  return s;
};

/**
 * Add an action ID to the current day's queue.
 * Returns updated state, or unchanged state if not enough slots.
 */
export const queueAction = (state, actionId) => {
  const action = ACTIONS.find(a => a.id === actionId);
  if (!action) return state;

  const totalSlots = DAY_CONFIG.baseActionSlots + (state.bonusActionSlotToday ? 1 : 0);
  const usedSlots = state.chosenActions.reduce((sum, id) => {
    const a = ACTIONS.find(x => x.id === id);
    return sum + (a?.slots || 1);
  }, 0);

  if (usedSlots + action.slots > totalSlots) return state;

  return { ...state, chosenActions: [...state.chosenActions, actionId] };
};

/**
 * Remove the last instance of actionId from the queue.
 */
export const dequeueAction = (state, actionId) => {
  const idx = [...state.chosenActions].reverse().findIndex(id => id === actionId);
  if (idx === -1) return state;
  const realIdx = state.chosenActions.length - 1 - idx;
  const next = [...state.chosenActions];
  next.splice(realIdx, 1);
  return { ...state, chosenActions: next };
};

/**
 * Resolve the current day: apply queued actions, fire a random event,
 * apply daily drain, check death, increment day.
 * Returns { newState, isDead, narrativeLines }
 */
export const resolveDay = (state) => {
  let s = { ...state };
  const narrativeLines = [];

  // 1. Apply queued actions
  for (const id of s.chosenActions) {
    const action = ACTIONS.find(a => a.id === id);
    if (!action) continue;

    const result = action.resolve(s);

    if (result.food) s.food = Math.max(0, s.food + result.food);
    if (result.water) s.water = Math.max(0, s.water + result.water);
    if (result.firewood) s.firewood = Math.max(0, s.firewood + result.firewood);
    if (result.shelter) s.shelter = Math.min(100, Math.max(0, s.shelter + result.shelter));
    if (result.bonusActionSlot) s.bonusActionSlotNextDay = true;
    if (result.huntFailed) narrativeLines.push('The hunt failed. You return empty-handed.');
    if (result.triggerExploreEvent) {
      const ev = EXPLORE_EVENTS[Math.floor(Math.random() * EXPLORE_EVENTS.length)];
      narrativeLines.push(ev.narrative);
      s = applyEffect(s, ev.effect);
    }
  }

  // 2. Fire random world event
  const worldEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  narrativeLines.push(worldEvent.narrative);
  s = applyEffect(s, worldEvent.effect);

  // 3. Daily consumption
  s.food = Math.max(0, s.food - RESOURCE_DRAIN.food);
  s.water = Math.max(0, s.water - RESOURCE_DRAIN.water);
  if (s.firewood > 0) {
    s.firewood = Math.max(0, s.firewood - RESOURCE_DRAIN.firewood);
  }
  s.shelter = Math.max(0, s.shelter - RESOURCE_DRAIN.shelter);

  // 4. Death tracking
  s.daysWithoutFood = s.food <= 0 ? (s.daysWithoutFood || 0) + 1 : 0;
  s.daysWithoutWater = s.water <= 0 ? (s.daysWithoutWater || 0) + 1 : 0;
  const isDead = s.daysWithoutFood >= 2 || s.daysWithoutWater >= 2;

  // 5. Advance day
  const completedDay = s.day;
  s.day = s.day + 1;
  s.chosenActions = [];
  s.bonusActionSlotToday = s.bonusActionSlotNextDay || false;
  s.bonusActionSlotNextDay = false;

  // 6. Append to log
  const logEntry = [`Day ${completedDay}`, ...narrativeLines, '---'];
  s.actionLog = [...(s.actionLog || []), ...logEntry];

  if (isDead) s.isDead = true;

  return { newState: s, isDead, narrativeLines };
};
