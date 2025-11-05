/**
 * Colleague Interaction Helpers
 *
 * Provides context-aware dialogue and response generation for colleague encounters
 * Features:
 * - Dynamic dialogue based on relationship history
 * - Context-aware response options (sanity, equipment, documents, level)
 * - Relationship tracking and progression
 */

/**
 * Get the appropriate dialogue text for a colleague based on encounter history
 * @param {Object} colleague - Colleague data from STRANGE_COLLEAGUE_DIALOGUES
 * @param {Object} relationship - Relationship data from gameState.colleagueRelationships
 * @returns {string} - The dialogue text to display
 */
export const getColleagueDialogue = (colleague, relationship) => {
  // First encounter - use first encounter dialogue
  if (!relationship || relationship.encounters === 0) {
    return colleague.firstEncounterDialogue;
  }

  // Repeat encounter - use dialogue based on last response type
  const lastResponse = relationship.lastResponseType;
  if (lastResponse && colleague.repeatDialogues[lastResponse]) {
    return colleague.repeatDialogues[lastResponse];
  }

  // Fallback to default dialogue
  return colleague.dialogue;
};

/**
 * Generate context-aware response options based on game state
 * @param {Object} colleague - Colleague data from STRANGE_COLLEAGUE_DIALOGUES
 * @param {Object} gameState - Current game state
 * @returns {Array} - Array of available response options with context modifications
 */
export const getAvailableResponses = (colleague, gameState) => {
  const baseResponses = colleague.responseOptions;
  const contextResponses = [];

  baseResponses.forEach(response => {
    // Check if base response is available
    if (response.available(gameState)) {
      contextResponses.push({ ...response });
    }
  });

  // Add context-aware special responses
  const specialResponses = generateSpecialResponses(colleague, gameState);
  return [...contextResponses, ...specialResponses];
};

/**
 * Generate special context-aware responses based on game state
 * @param {Object} colleague - Colleague data
 * @param {Object} gameState - Current game state
 * @returns {Array} - Array of special response options
 */
const generateSpecialResponses = (colleague, gameState) => {
  const special = [];

  // Low sanity responses (sanity <= 30)
  if (gameState.sanity <= 30) {
    special.push({
      text: `[Low Sanity] ${getLowSanityResponse(colleague.id)}`,
      type: 'dark_pact',
      available: () => true,
      contextType: 'sanity',
      outcome: {
        message: getLowSanityOutcome(colleague.id),
        pp: 800,
        xp: 40,
        sanity: -20,
        trust: 5
      }
    });
  }

  // High level responses (level >= 10)
  if (gameState.playerLevel >= 10) {
    special.push({
      text: `[Level ${gameState.playerLevel}] ${getHighLevelResponse(colleague.id)}`,
      type: 'esoteric',
      available: () => true,
      contextType: 'level',
      outcome: {
        message: getHighLevelOutcome(colleague.id),
        pp: 600,
        xp: 50,
        sanity: -10,
        trust: 4
      }
    });
  }

  // Has prophecy document
  if (gameState.documents?.prophecies > 0) {
    special.push({
      text: `[Prophecy] "The paper warned me about this."`,
      type: 'prophetic',
      available: () => true,
      contextType: 'prophecy',
      outcome: {
        message: "They freeze. 'You... you've read the prophecies? Then you know what's coming.' They vanish in terror, leaving behind forbidden knowledge.",
        pp: 1000,
        xp: 60,
        sanity: -12,
        trust: 6
      }
    });
  }

  // Portal unlocked
  if (gameState.portalUnlocked && gameState.dimensionalUpgrades?.void_understanding) {
    special.push({
      text: `[Void Knowledge] "I've seen beyond. I understand."`,
      type: 'void_touched',
      available: () => true,
      contextType: 'void',
      outcome: {
        message: "Their eyes widen with recognition and fear. 'You've touched the void. We are kin now.' Reality bends around you both.",
        pp: 900,
        xp: 55,
        sanity: -18,
        trust: 7
      }
    });
  }

  return special;
};

/**
 * Get low sanity response text based on colleague type
 */
const getLowSanityResponse = (colleagueId) => {
  const responses = {
    spiral_philosopher: "I see the spiral everywhere now. In everything.",
    productivity_zealot: "I've optimized away my humanity. I'm pure output.",
    void_clerk: "The walls speak to me. They know my name.",
    temporal_trapped: "I've lived this day a thousand times already.",
    light_herald: "The lights chose me. I am their vessel."
  };
  return responses[colleagueId] || "I understand everything now.";
};

/**
 * Get low sanity outcome message based on colleague type
 */
const getLowSanityOutcome = (colleagueId) => {
  const outcomes = {
    spiral_philosopher: "YES! You SEE it! The spiral recognizes its own! They embrace you. The rotation accelerates. You are synchronized.",
    productivity_zealot: "OPTIMAL! You've transcended the human bottleneck! They grant you access to the mainframe. You are the efficiency.",
    void_clerk: "THE WALLS CONFIRM! You are known! Named! Reality itself acknowledges your presence. You are catalogued in the void.",
    temporal_trapped: "ALL TIMELINES CONVERGE! You exist in every moment simultaneously! The loop recognizes you. You are eternal.",
    light_herald: "THE CHOSEN ONE! The lights sing your frequency! You are illuminated! Blessed! Forever radiant in their eternal hum!"
  };
  return outcomes[colleagueId] || "You both transcend normal reality. The office will never be the same.";
};

/**
 * Get high level response text based on colleague type
 */
const getHighLevelResponse = (colleagueId) => {
  const responses = {
    spiral_philosopher: "Time is neither flat nor circular. It's a spiral hypersphere.",
    productivity_zealot: "Productivity is the illusion. Entropy is the truth.",
    void_clerk: "Reality is consensus, but consensus can be hacked.",
    temporal_trapped: "I know the escape sequence. Page 999, subsection Ω.",
    light_herald: "The hum isn't thought. It's the universe dreaming."
  };
  return responses[colleagueId] || "I've transcended your limited paradigm.";
};

/**
 * Get high level outcome message based on colleague type
 */
const getHighLevelOutcome = (colleagueId) => {
  const outcomes = {
    spiral_philosopher: "You... you understand the mathematics. They show you the equations. Reality calculates itself around you both.",
    productivity_zealot: "Entropy? You've seen beyond the metrics? They nod slowly. 'Perhaps there's hope.' They gift you forbidden inefficiency.",
    void_clerk: "Hack... the consensus? Their eyes light up. 'Yes! YES!' Together you reshape local reality. The walls forget to be solid.",
    temporal_trapped: "Page 999? That page... shouldn't exist. You've created a paradox. Time stutters. They're free. You're not sure what you've done.",
    light_herald: "The universe... dreaming? They laugh. Actually laugh. 'The lights never told me that. You're awake.' They gift you lucidity."
  };
  return outcomes[colleagueId] || "They recognize your understanding. You've earned their respect and something more valuable.";
};

/**
 * Update colleague relationship based on response
 * @param {Object} relationships - Current colleagueRelationships object
 * @param {string} colleagueId - ID of the colleague
 * @param {string} responseType - Type of response chosen
 * @param {number} trustChange - Change in trust value
 * @returns {Object} - Updated relationships object
 */
export const updateColleagueRelationship = (relationships, colleagueId, responseType, trustChange) => {
  const current = relationships[colleagueId] || { trust: 0, encounters: 0, lastResponseType: null };

  return {
    ...relationships,
    [colleagueId]: {
      trust: current.trust + trustChange,
      encounters: current.encounters + 1,
      lastResponseType: responseType
    }
  };
};

/**
 * Check if colleague should offer a special endgame event
 * @param {Object} relationship - Relationship data for specific colleague
 * @returns {string|null} - Endgame event type or null
 */
export const checkColleagueEndgame = (relationship) => {
  if (!relationship || relationship.encounters < 5) return null;

  // High trust (empathy path) - becomes ally
  if (relationship.trust >= 10) {
    return 'ally';
  }

  // Low trust (hostility path) - final confrontation
  if (relationship.trust <= -8) {
    return 'confrontation';
  }

  // Compliance path - dark deal
  if (relationship.encounters >= 7 && relationship.lastResponseType === 'compliant') {
    return 'deal';
  }

  return null;
};

/**
 * Get endgame message based on colleague and event type
 * @param {string} colleagueId - ID of the colleague
 * @param {string} eventType - Type of endgame event (ally, confrontation, deal)
 * @returns {Object} - Endgame event data
 */
export const getColleagueEndgameEvent = (colleagueId, eventType) => {
  // This can be expanded with full endgame scenarios
  const events = {
    ally: {
      message: "Your consistent kindness has broken through their madness. They offer to help you survive this place.",
      reward: "colleague_ally_buff",
      outcome: "They will periodically provide valuable assistance."
    },
    confrontation: {
      message: "Your constant hostility has pushed them too far. They've had enough. This ends now.",
      reward: "combat_start",
      outcome: "Prepare for battle."
    },
    deal: {
      message: "Your compliance has pleased them. They offer you a choice: power beyond measure, at a cost you may regret.",
      reward: "dark_pact_option",
      outcome: "Accept their deal or refuse and lose them forever."
    }
  };

  return events[eventType] || null;
};

/**
 * Update path scores based on response choice
 * @param {Object} pathScores - Current path scores
 * @param {string} pathType - Type of path (seeker, rationalist, protector, convert, rebel)
 * @param {number} amount - Amount to add (default 1)
 * @returns {Object} - Updated path scores
 */
export const updatePathScores = (pathScores, pathType, amount = 1) => {
  if (!pathType || pathType === 'neutral') return pathScores;

  return {
    ...pathScores,
    [pathType]: (pathScores[pathType] || 0) + amount
  };
};

/**
 * Get dominant player path based on scores
 * @param {Object} pathScores - Path scores object
 * @returns {string|null} - Dominant path name or null
 */
export const getDominantPath = (pathScores) => {
  if (!pathScores) return null;

  let maxPath = null;
  let maxScore = 0;

  Object.entries(pathScores).forEach(([path, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxPath = path;
    }
  });

  return maxScore >= 3 ? maxPath : null; // Need at least 3 points to establish a path
};

/**
 * Add clue to investigation
 * @param {Object} investigation - Current investigation object
 * @param {Object} clue - Clue data { id, source, text, category }
 * @param {number} day - Current game day
 * @returns {Object} - Updated investigation object
 */
export const addClue = (investigation, clue, day) => {
  if (!clue || !clue.id) return investigation;

  // Check if clue already exists
  const existingClue = investigation.clues.find(c => c.id === clue.id);
  if (existingClue) return investigation;

  const newClue = {
    ...clue,
    collectedOn: `Day ${day}`
  };

  return {
    ...investigation,
    clues: [...investigation.clues, newClue]
  };
};

/**
 * Check if any story moments should trigger
 * @param {Object} gameState - Current game state
 * @param {Array} storyMoments - Array of STORY_MOMENTS
 * @returns {Object|null} - Story moment to trigger or null
 */
export const checkStoryMoments = (gameState, storyMoments) => {
  if (!storyMoments || storyMoments.length === 0) return null;

  for (const moment of storyMoments) {
    // Check if already completed
    if (gameState.completedStoryMoments.includes(moment.id)) {
      continue;
    }

    // Check trigger condition
    if (moment.trigger(gameState)) {
      return moment;
    }
  }

  return null;
};

/**
 * Process response outcome and update game state properties
 * @param {Object} currentState - Current game state
 * @param {Object} outcome - Response outcome data
 * @returns {Object} - State updates to apply
 */
export const processResponseOutcome = (currentState, outcome) => {
  const updates = {};

  // Basic stat updates
  if (outcome.pp !== undefined) updates.pp = currentState.pp + outcome.pp;
  if (outcome.sanity !== undefined) updates.sanity = Math.max(0, Math.min(100, currentState.sanity + outcome.sanity));

  // Mystery progress
  if (outcome.mysteryProgress) {
    updates.mysteryProgress = Math.min(100, currentState.mysteryProgress + outcome.mysteryProgress);
  }

  // Path scores
  if (outcome.pathScore) {
    updates.pathScores = updatePathScores(currentState.pathScores, outcome.pathScore);
    updates.playerPath = getDominantPath(updates.pathScores);
  }

  // Add clue if present
  if (outcome.clue) {
    updates.investigation = addClue(currentState.investigation, outcome.clue, currentState.day);
  }

  return updates;
};
