import type { PackData } from '../../types/pack';

export const CRIT2048_DEFAULT_ARTIFACTS_PACK: PackData = {
  "id": "crit2048-default-artifacts",
  "name": "Crit 2048 — Default Artifacts",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "The core game artifacts.",
  "type": "artifacts",
  "icon": "🏺",
  "artifacts": [
    { "id": "WEIGHTED_DICE", "parent": "artifact_weighted_dice", "name": "Weighted Dice", "icon": "🎲", "rarity": "Rare", "basePrice": 15, "desc": "D20 rolls < ${4 + lvl} become ${4 + lvl}." },
    { "id": "GRAVITY_BOOTS", "parent": "artifact_gravity_boots", "name": "Gravity Boots", "icon": "🥾", "rarity": "Common", "basePrice": 10, "desc": "Slide DOWN deals ${1 + 0.5 * lvl}x Dmg, UP deals 0.5x." },
    { "id": "RING_WEALTH", "parent": "artifact_ring_wealth", "name": "Ring of Wealth", "icon": "💍", "rarity": "Rare", "basePrice": 15, "desc": "+${30 * lvl} Gold entering Tavern." },
    { "id": "BOOTS_HASTE", "parent": "artifact_boots_haste", "name": "Boots of Haste", "icon": "⚡", "rarity": "Epic", "basePrice": 20, "desc": "+${3 * lvl} Slides per Ante." },
    { "id": "GIANT_POTION", "parent": "artifact_giant_potion", "name": "Giant's Potion", "icon": "🧪", "rarity": "Rare", "basePrice": 25, "desc": "Base mult permanently +${(0.3 * lvl).toFixed(1)}." }
  ]
};
