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

describe('CombatLogic - Grid Mechanics', () => {
  const createEmptyState = (grid: (Tile | null)[]): GameStoreState =>
    ({
      grid,
      multiplier: 1.0,
      gold: 0,
      settings: { haptics: false },
    }) as any;

  const tile = (val: number, id: number): Tile => ({ id, val });

  test('should move tiles to the left', () => {
    const grid = [
      null,
      null,
      tile(2, 1),
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
    const state = createEmptyState(grid);
    const { newGrid, changed } = CombatLogic.processMove(state, 'LEFT');

    expect(changed).toBe(true);
    expect(newGrid[0]?.val).toBe(2);
    expect(newGrid[2]).toBe(null);
  });

  test('should merge identical tiles', () => {
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
    const state = createEmptyState(grid);
    const { newGrid, damageDealt, merges } = CombatLogic.processMove(state, 'LEFT');

    expect(merges).toBe(1);
    expect(newGrid[0]?.val).toBe(4);
    expect(newGrid[1]).toBe(null);
    expect(damageDealt).toBeGreaterThan(0);
  });

  test('should not merge hazard tiles (val < 0)', () => {
    const grid = [
      tile(-1, 1),
      tile(-1, 2),
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
    const state = createEmptyState(grid);
    const { newGrid, merges } = CombatLogic.processMove(state, 'LEFT');

    expect(merges).toBe(0);
    expect(newGrid[0]?.val).toBe(-1);
    expect(newGrid[1]?.val).toBe(-1);
  });

  test('should detect gridlock', () => {
    const grid = [
      tile(2, 1),
      tile(4, 2),
      tile(2, 3),
      tile(4, 4),
      tile(4, 5),
      tile(2, 6),
      tile(4, 7),
      tile(2, 8),
      tile(2, 9),
      tile(4, 10),
      tile(2, 11),
      tile(4, 12),
      tile(4, 13),
      tile(2, 14),
      tile(4, 15),
      tile(2, 16),
    ];
    expect(CombatLogic.checkGridlock(grid)).toBe(true);
  });

  test('should not detect gridlock if empty spaces exist', () => {
    const grid = Array(16).fill(null);
    grid[0] = tile(2, 1);
    expect(CombatLogic.checkGridlock(grid)).toBe(false);
  });

  test('should not detect gridlock if merges are possible', () => {
    const grid = [
      tile(2, 1),
      tile(2, 2),
      tile(4, 3),
      tile(8, 4),
      tile(16, 5),
      tile(32, 6),
      tile(64, 7),
      tile(128, 8),
      tile(2, 9),
      tile(4, 10),
      tile(8, 11),
      tile(16, 12),
      tile(32, 13),
      tile(64, 14),
      tile(128, 15),
      tile(256, 16),
    ];
    expect(CombatLogic.checkGridlock(grid)).toBe(false);
  });
});
