import type { PackData } from '../../types/pack';

export const CRIT2048_DEFAULT_ARTIFACTS_PACK: PackData = {
  id: 'crit2048-default-artifacts',
  name: 'Crit 2048 — Default Artifacts',
  version: '1.0.0',
  game_version: '>=1.0.0',
  author: 'denzven',
  description: 'The core game artifacts.',
  type: 'artifacts',
  icon: '🏺',
  artifacts: [
    {
      id: 'WEIGHTED_DICE',
      parent: 'artifact_weighted_dice',
      name: 'Weighted Dice',
      icon: '🎲',
      rarity: 'Rare',
      basePrice: 15,
      desc: 'D20 rolls < ${5 + lvl} become ${5 + lvl}.',
      scripts: {
        onD20:
          "const threshold = 5 + (lvl || 1); if (roll.val < threshold) { roll.val = threshold; G.log('🎲 Weighted Dice: Roll bumped to ' + threshold + '!'); }",
      },
    },
    {
      id: 'RING_WEALTH',
      parent: 'artifact_ring_wealth',
      name: 'Ring of Wealth',
      icon: '💍',
      rarity: 'Rare',
      basePrice: 15,
      desc: '+${30 * lvl} Gold entering Tavern.',
      scripts: {
        onTavern:
          "G.player.addGold(30 * lvl); G.log('💍 Ring of Wealth: +' + (30 * lvl) + ' Gold!'); G.triggerFX('float', { targetId: 'hud-gold', artifactId: 'RING_WEALTH', icon: '💍', name: 'Ring of Wealth' });",
      },
    },
    {
      id: 'BOOTS_HASTE',
      parent: 'artifact_boots_haste',
      name: 'Boots of Haste',
      icon: '⚡',
      rarity: 'Epic',
      basePrice: 20,
      desc: '+${3 * lvl} Slides per Ante.',
      scripts: {
        onEncounterStart:
          "G.player.addSlides(3 * lvl); G.log('⚡ Boots of Haste: +' + (3 * lvl) + ' slides!'); G.triggerFX('float', { targetId: 'hud-slides', artifactId: 'BOOTS_HASTE', icon: '⚡', name: 'Boots of Haste' });",
      },
    },
    {
      id: 'GIANT_POTION',
      parent: 'artifact_giant_potion',
      name: "Giant's Potion",
      icon: '🧪',
      rarity: 'Rare',
      basePrice: 25,
      desc: 'Base mult permanently +${(0.3 * lvl).toFixed(1)}.',
      scripts: {
        onPurchase:
          "G.player.addMultiplier(0.3 * lvl); G.triggerFX('pop', { targetId: 'hud-multiplier', artifactId: 'GIANT_POTION', icon: '🧪', name: 'Giant Potion' });",
      },
    },
  ],
};
