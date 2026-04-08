/**
 * Journal System Helpers
 * Location discovery tracking
 */

export const discoverLocation = (gameState, locationId) => {
  if (!locationId) return gameState.discoveredLocations;
  const discovered = gameState.discoveredLocations || [];
  if (discovered.includes(locationId)) return discovered;
  return [...discovered, locationId];
};

export const isLocationDiscovered = (gameState, locationId) => {
  return (gameState.discoveredLocations || []).includes(locationId);
};
