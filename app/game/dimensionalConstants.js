/**
 * Dimensional Mining Constants
 *
 * Defines materials, generation algorithms, and capacity for dimensional area
 */

export const DIMENSIONAL_MATERIALS = [
  { id: 'void_fragment', name: 'Void Fragment', color: '#1a1a2e', rarity: 0.40, size: 'small' },
  { id: 'static_crystal', name: 'Static Crystal', color: '#4a4a6a', rarity: 0.30, size: 'small' },
  { id: 'glitch_shard', name: 'Glitch Shard', color: '#7f00ff', rarity: 0.20, size: 'medium' },
  { id: 'reality_dust', name: 'Reality Dust', color: '#ff6b9d', rarity: 0.08, size: 'small' },
  { id: 'temporal_core', name: 'Temporal Core', color: '#00ffff', rarity: 0.015, size: 'medium' },
  { id: 'dimensional_essence', name: 'Dimensional Essence', color: '#ffd700', rarity: 0.004, size: 'large' },
  { id: 'singularity_node', name: 'Singularity Node', color: '#ff0000', rarity: 0.0015, size: 'large' } // Increased from 0.001 (0.1%) to 0.0015 (0.15%) for better balance
];

export const SIZE_RANGES = {
  small: { min: 8, max: 16 },
  medium: { min: 16, max: 28 },
  large: { min: 28, max: 48 }
};

export const DIMENSIONAL_CAPACITY = 20;

export const generateEncryptedText = (lines) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  const words = [];
  
  for (let i = 0; i < lines * 15; i++) {
    const wordLength = Math.floor(Math.random() * 8) + 3;
    let word = '';
    for (let j = 0; j < wordLength; j++) {
      word += chars[Math.floor(Math.random() * chars.length)];
    }
    words.push(word);
  }
  
  return words.join(' ');
};

export const generateMaterialNodes = (textLength, materialInventory, effects = {}) => {
  const nodes = [];
  const nodeCount = Math.floor(textLength / 800);
  
  for (let i = 0; i < nodeCount; i++) {
    const roll = Math.random();
    let cumulativeRarity = 0;
    let selectedMaterial = DIMENSIONAL_MATERIALS[0];
    
    for (const material of DIMENSIONAL_MATERIALS) {
      // Apply rarity bonus from luck skills
      const adjustedRarity = material.rarity * (1 + (effects.rarityBonus || 0));
      cumulativeRarity += adjustedRarity;
      if (roll <= cumulativeRarity) {
        selectedMaterial = material;
        break;
      }
    }
    
    const sizeRange = SIZE_RANGES[selectedMaterial.size];
    const size = Math.floor(Math.random() * (sizeRange.max - sizeRange.min + 1)) + sizeRange.min;
    
    // Apply glow intensity from treasure sense skill
    const glowIntensity = effects.glowIntensity || 1;
    
    nodes.push({
      id: `${selectedMaterial.id}_${i}`,
      materialId: selectedMaterial.id,
      color: selectedMaterial.color,
      size,
      position: Math.floor(Math.random() * (textLength - 100)),
      glowIntensity
    });
  }
  
  return nodes.sort((a, b) => a.position - b.position);
};