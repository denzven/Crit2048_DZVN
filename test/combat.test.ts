import { CombatLogic } from '../src/engine/combat';
import type { GameStoreState, Tile } from '../src/types/game';

// Mock dependencies
jest.mock('../src/engine/packEngine', () => ({
  PackEngine: {
    onMerge: jest.fn(),
    calculateMergeDamage: jest.fn((_state, dmg) => dmg),
  },
}));

jest.mock('../src/engine/native', () => ({
  Native: {
    vibrate: jest.fn(),
  },
}));

describe('CombatLogic - Damage & Gold', () => {
  const createBaseState = (grid: (Tile | null)[]): GameStoreState =>
    ({
      grid,
      multiplier: 1.0,
      gold: 10,
      settings: { haptics: false },
    }) as any;

  const tile = (val: number, id: number): Tile => ({ id, val });

  test('should calculate damage based on weapon stats', () => {
    // 2 merges with value 4 (base dmg usually 4 if not in WEAPON_STATS)
    const grid = [
      tile(2, 1),
      tile(2, 2),
      null,
      null,
      tile(2, 3),
      tile(2, 4),
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];
    const state = createBaseState(grid);
    const { damageDealt } = CombatLogic.processMove(state, 'LEFT');

    // Each merge of 2+2=4 should deal damage.
    // Board power also adds 5% of (4+4) = 0.4 -> 0
    expect(damageDealt).toBeGreaterThan(0);
  });

  test('should apply multiplier to damage', () => {
    const grid = [
      tile(2, 1),
      tile(2, 2),
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];
    const state1 = createBaseState(grid);
    state1.multiplier = 1.0;
    const res1 = CombatLogic.processMove(state1, 'LEFT');

    const state2 = createBaseState(grid);
    state2.multiplier = 2.0;
    const res2 = CombatLogic.processMove(state2, 'LEFT');

    expect(res2.damageDealt).toBeGreaterThan(res1.damageDealt);
  });

  test('should handle goblin gold theft', () => {
    const grid = [
      tile(2, 1),
      tile(2, 2),
      tile(-2, 3),
      null, // -2 is Goblin
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];
    const state = createBaseState(grid);
    state.gold = 10;
    const { goldEarned } = CombatLogic.processMove(state, 'LEFT');

    // Merge of 2+2=4 gives log2(4) = 2 gold
    // Goblin steals 1 gold
    // Total earned: 2 - 1 = 1
    expect(goldEarned).toBe(1);
  });

  test('should clear hazards if damage threshold is met', () => {
    const grid = [
      tile(2, 1),
      tile(2, 2),
      tile(-1, 3),
      null, // -1 is Slime
      tile(8, 4),
      tile(8, 5),
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];
    const state = createBaseState(grid);
    state.multiplier = 10.0; // Ensure high damage
    const { newGrid, damageDealt } = CombatLogic.processMove(state, 'LEFT');

    if (damageDealt >= 100) {
      expect(newGrid.find((t) => t?.val === -1)).toBeUndefined();
    }
  });

  test('should trigger victory condition when damage exceeds HP', () => {
    const grid = [tile(128, 1), tile(128, 2), ...Array(14).fill(null)];
    const state = createBaseState(grid);
    state.monsterHp = 10; // Low HP
    state.multiplier = 10.0; // High damage

    const { damageDealt } = CombatLogic.processMove(state, 'LEFT');

    // In the store, this would trigger victory.
    // Here we verify that damageDealt is indeed >= monsterHp
    expect(damageDealt).toBeGreaterThanOrEqual(state.monsterHp);
  });

  test('should earn more gold for higher value merges (loot)', () => {
    const grid2 = [tile(2, 1), tile(2, 2), ...Array(14).fill(null)];
    const grid4 = [tile(4, 3), tile(4, 4), ...Array(14).fill(null)];

    const res2 = CombatLogic.processMove(createBaseState(grid2), 'LEFT');
    const res4 = CombatLogic.processMove(createBaseState(grid4), 'LEFT');

    // log2(4) = 2 gold, log2(8) = 3 gold
    expect(res4.goldEarned).toBeGreaterThan(res2.goldEarned);
  });
});
