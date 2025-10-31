/**
 * Journal System Helpers
 *
 * Utility functions for tracking discoveries and managing journal entries:
 * - Location discovery tracking
 * - Colleague encounter tracking
 * - Equipment discovery (base types from loot instances)
 * - Journal query functions
 */

import { WEAPONS, ARMOR, ANOMALIES } from './equipmentConstants';

/**
 * Track location discovery
 * @param {Object} gameState - Current game state
 * @param {string} locationId - ID of location to discover
 * @returns {Object} - Updated discoveredLocations array
 */
export const discoverLocation = (gameState, locationId) => {
  if (!locationId) return gameState.discoveredLocations;

  const discovered = gameState.discoveredLocations || [];
  if (discovered.includes(locationId)) {
    return discovered;
  }

  return [...discovered, locationId];
};

/**
 * Track colleague discovery
 * @param {Object} gameState - Current game state
 * @param {string} colleagueId - ID of colleague to discover
 * @returns {Object} - Updated discoveredColleagues array
 */
export const discoverColleague = (gameState, colleagueId) => {
  if (!colleagueId) return gameState.discoveredColleagues;

  const discovered = gameState.discoveredColleagues || [];
  if (discovered.includes(colleagueId)) {
    return discovered;
  }

  return [...discovered, colleagueId];
};

/**
 * Extract base equipment ID from a loot item
 * Loot items may have prefixes like "Glitched Shiv" but we want to track "stapler_shiv"
 * @param {Object} lootItem - Generated loot item
 * @returns {string|null} - Base equipment ID
 */
const extractBaseEquipmentId = (lootItem) => {
  if (!lootItem || !lootItem.type) return null;

  // For loot items, the baseItemId property contains the base equipment ID
  if (lootItem.baseItemId) {
    return lootItem.baseItemId;
  }

  // Fallback: try to match by name to base equipment
  const itemName = lootItem.baseName?.toLowerCase() || lootItem.name?.toLowerCase() || '';

  // Check weapons
  for (const [id, weapon] of Object.entries(WEAPONS)) {
    if (itemName.includes(weapon.name.toLowerCase())) {
      return id;
    }
  }

  // Check armor
  for (const [id, armor] of Object.entries(ARMOR)) {
    if (itemName.includes(armor.name.toLowerCase())) {
      return id;
    }
  }

  // Check anomalies
  for (const [id, anomaly] of Object.entries(ANOMALIES)) {
    if (itemName.includes(anomaly.name.toLowerCase())) {
      return id;
    }
  }

  return null;
};

/**
 * Track equipment discovery from loot item
 * Extracts base equipment type and adds to appropriate discovery list
 * @param {Object} gameState - Current game state
 * @param {Object} lootItem - Loot item that was acquired
 * @returns {Object} - Updated discovery arrays { weapons, armor, anomalies }
 */
export const discoverEquipmentFromLoot = (gameState, lootItem) => {
  if (!lootItem) {
    return {
      weapons: gameState.discoveredBaseWeapons || [],
      armor: gameState.discoveredBaseArmor || [],
      anomalies: gameState.discoveredBaseAnomalies || []
    };
  }

  const baseId = extractBaseEquipmentId(lootItem);
  if (!baseId) {
    return {
      weapons: gameState.discoveredBaseWeapons || [],
      armor: gameState.discoveredBaseArmor || [],
      anomalies: gameState.discoveredBaseAnomalies || []
    };
  }

  let weapons = [...(gameState.discoveredBaseWeapons || [])];
  let armor = [...(gameState.discoveredBaseArmor || [])];
  let anomalies = [...(gameState.discoveredBaseAnomalies || [])];

  // Determine which category and add if not already discovered
  if (WEAPONS[baseId] && !weapons.includes(baseId)) {
    weapons.push(baseId);
  } else if (ARMOR[baseId] && !armor.includes(baseId)) {
    armor.push(baseId);
  } else if (ANOMALIES[baseId] && !anomalies.includes(baseId)) {
    anomalies.push(baseId);
  }

  return { weapons, armor, anomalies };
};

/**
 * Track equipment discovery by ID (for direct equipment unlocks, not loot)
 * @param {Object} gameState - Current game state
 * @param {string} equipmentId - ID of equipment to discover
 * @returns {Object} - Updated discovery arrays { weapons, armor, anomalies }
 */
export const discoverEquipmentById = (gameState, equipmentId) => {
  if (!equipmentId) {
    return {
      weapons: gameState.discoveredBaseWeapons || [],
      armor: gameState.discoveredBaseArmor || [],
      anomalies: gameState.discoveredBaseAnomalies || []
    };
  }

  let weapons = [...(gameState.discoveredBaseWeapons || [])];
  let armor = [...(gameState.discoveredBaseArmor || [])];
  let anomalies = [...(gameState.discoveredBaseAnomalies || [])];

  // Determine which category and add if not already discovered
  if (WEAPONS[equipmentId] && !weapons.includes(equipmentId)) {
    weapons.push(equipmentId);
  } else if (ARMOR[equipmentId] && !armor.includes(equipmentId)) {
    armor.push(equipmentId);
  } else if (ANOMALIES[equipmentId] && !anomalies.includes(equipmentId)) {
    anomalies.push(equipmentId);
  }

  return { weapons, armor, anomalies };
};

/**
 * Check if location is discovered
 * @param {Object} gameState - Current game state
 * @param {string} locationId - Location ID to check
 * @returns {boolean}
 */
export const isLocationDiscovered = (gameState, locationId) => {
  return (gameState.discoveredLocations || []).includes(locationId);
};

/**
 * Check if colleague is discovered
 * @param {Object} gameState - Current game state
 * @param {string} colleagueId - Colleague ID to check
 * @returns {boolean}
 */
export const isColleagueDiscovered = (gameState, colleagueId) => {
  return (gameState.discoveredColleagues || []).includes(colleagueId);
};

/**
 * Check if equipment is discovered
 * @param {Object} gameState - Current game state
 * @param {string} equipmentId - Equipment ID to check
 * @returns {boolean}
 */
export const isEquipmentDiscovered = (gameState, equipmentId) => {
  const weapons = gameState.discoveredBaseWeapons || [];
  const armor = gameState.discoveredBaseArmor || [];
  const anomalies = gameState.discoveredBaseAnomalies || [];

  return weapons.includes(equipmentId) ||
         armor.includes(equipmentId) ||
         anomalies.includes(equipmentId);
};

/**
 * Get total discovery counts
 * @param {Object} gameState - Current game state
 * @returns {Object} - Counts for each category
 */
export const getDiscoveryCounts = (gameState) => {
  return {
    locations: (gameState.discoveredLocations || []).length,
    colleagues: (gameState.discoveredColleagues || []).length,
    weapons: (gameState.discoveredBaseWeapons || []).length,
    armor: (gameState.discoveredBaseArmor || []).length,
    anomalies: (gameState.discoveredBaseAnomalies || []).length,
    totalEquipment:
      (gameState.discoveredBaseWeapons || []).length +
      (gameState.discoveredBaseArmor || []).length +
      (gameState.discoveredBaseAnomalies || []).length
  };
};

/**
 * Get colleague relationship summary for journal display
 * @param {Object} gameState - Current game state
 * @param {string} colleagueId - Colleague ID
 * @returns {Object} - Relationship summary
 */
export const getColleagueRelationshipSummary = (gameState, colleagueId) => {
  const relationship = gameState.colleagueRelationships?.[colleagueId];

  if (!relationship) {
    return {
      status: 'Unknown',
      trustLevel: 0,
      encounters: 0,
      color: '#888888'
    };
  }

  const trust = relationship.trust || 0;
  let status = 'Neutral';
  let color = '#888888';

  if (trust >= 10) {
    status = 'Ally';
    color = '#4CAF50';
  } else if (trust >= 5) {
    status = 'Friendly';
    color = '#66ff66';
  } else if (trust <= -8) {
    status = 'Hostile';
    color = '#ff4444';
  } else if (trust <= -3) {
    status = 'Unfriendly';
    color = '#ff8888';
  }

  return {
    status,
    trustLevel: trust,
    encounters: relationship.encounters || 0,
    color
  };
};
