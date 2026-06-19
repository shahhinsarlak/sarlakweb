import React from 'react';
import PixelArt from './PixelArt';
import { paintWeapon } from './spriteArt';
import { getWeaponType, getWeaponRarity } from './expeditionHelpers';

/** WeaponSprite - 128x128 procedural weapon art (type silhouette, rarity-tinted). */
function WeaponSprite({ typeId, rarityId, size = 48, building = false }) {
  const type = getWeaponType(typeId);
  const rarity = getWeaponRarity(rarityId);
  if (!type) return null;
  const metal = type.color || '#cccccc';
  const accent = rarity ? rarity.color : '#ffffff';
  return (
    <PixelArt
      paintKey={`w:${typeId}:${rarityId}`}
      paint={(ctx) => paintWeapon(ctx, typeId, metal, accent)}
      size={size}
      building={building}
      accent={accent}
    />
  );
}

WeaponSprite.displayName = 'WeaponSprite';
export default WeaponSprite;