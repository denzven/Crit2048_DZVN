import type { ExtendedGameStoreState, GameStoreState, Tile } from '../types/game';
import { WEAPON_STATS } from './data';
import { Native } from './native';
import { PackEngine } from './packEngine';

export const CombatLogic = {
  /**
   * Core 2048-style movement and merging logic
   */
  processMove(
    state: GameStoreState,
    direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN',
  ): {
    newGrid: (Tile | null)[];
    changed: boolean;
    damageDealt: number;
    merges: number;
    goldEarned: number;
    multIncrease: number;
    mergeResults: { damage: number; gold: number; pos: number }[];
  } {
    let newGrid = [...state.grid];
    let changed = false;
    let damageDealt = 0;
    let merges = 0;
    let goldEarned = 0;
    const multIncrease = 0;
    const mergeResults: { damage: number; gold: number; pos: number }[] = [];

    const processLine = (lineIndices: number[]) => {
      // 1. Filter out nulls
      const line = lineIndices.map((i) => newGrid[i]).filter((v): v is Tile => v !== null);
      const combined: (Tile | null)[] = [];

      for (let i = 0; i < line.length; i++) {
        if (i < line.length - 1 && line[i]!.val > 0 && line[i]!.val === line[i + 1]!.val) {
          // MERGE DETECTED
          const tA = line[i]!;
          const newVal = tA.val * 2;

          combined.push({
            id: tA!.id, // Keep the ID for animation continuity
            val: newVal,
            pop: true,
            merged: true,
          });

          merges++;
          // (mergeResults tracking handled below)

          // Pack Hook: onMerge
          PackEngine.onMerge(state, newVal, lineIndices[i]!, direction);

          // Calculate Damage
          const baseDmg = (WEAPON_STATS[newVal] as any)?.dmg || newVal;

          // (Class and Artifact bonuses are now handled via PackEngine hooks)

          // Hunter's Mark logic
          let finalMergeDmg = baseDmg * state.multiplier;

          // Pack Hook: calculateMergeDamage
          finalMergeDmg = PackEngine.calculateMergeDamage(state, finalMergeDmg, direction, newVal);

          if ((state as ExtendedGameStoreState).hunterMarkLeft > 0) {
            finalMergeDmg *= 2;
            (state as ExtendedGameStoreState).hunterMarkLeft--;
          }

          damageDealt += finalMergeDmg;

          // Baseline Gold: log2(val)
          const baseGold = Math.floor(Math.log2(newVal));
          goldEarned += baseGold;

          mergeResults.push({
            damage: finalMergeDmg,
            gold: baseGold,
            pos: lineIndices[i]!,
          });

          if (state.settings?.haptics) Native.vibrate(20); // Small pulse on merge
          i++; // Skip next tile since it merged
        } else {
          combined.push(line[i]!);
        }
      }

      // Fill remaining space with nulls
      while (combined.length < 4) combined.push(null);

      // 2. Check if anything changed and update newGrid
      for (let i = 0; i < 4; i++) {
        const targetIdx = lineIndices[i]!;
        if (
          newGrid[targetIdx]?.id !== combined[i]?.id ||
          newGrid[targetIdx]?.val !== combined[i]?.val
        ) {
          changed = true;
        }
        newGrid[targetIdx] = combined[i]!;
      }
    };

    // Run processLine for each row/column based on direction
    if (direction === 'LEFT') {
      for (let r = 0; r < 4; r++) processLine([r * 4, r * 4 + 1, r * 4 + 2, r * 4 + 3]);
    } else if (direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) processLine([r * 4 + 3, r * 4 + 2, r * 4 + 1, r * 4]);
    } else if (direction === 'UP') {
      for (let c = 0; c < 4; c++) processLine([c, c + 4, c + 8, c + 12]);
    } else if (direction === 'DOWN') {
      for (let c = 0; c < 4; c++) processLine([c + 12, c + 8, c + 4, c]);
    }

    if (changed) {
      // Goblin Gold Theft
      const goblinCount = newGrid.filter((t) => t && t.val === -2).length;
      if (goblinCount > 0) {
        const stolen = Math.min(state.gold, goblinCount);
        goldEarned -= stolen;
      }

      // Hazard Clearing Thresholds
      if (damageDealt >= 100) {
        newGrid = newGrid.map((t) => (t && t.val === -1 ? null : t)); // Slime
      }
      if (damageDealt >= 50) {
        newGrid = newGrid.map((t) => (t && t.val === -2 ? null : t)); // Goblin
      }

      // Board Power: 5% of total board value added as passive damage
      const boardSum = newGrid.reduce((sum, t) => sum + (t && t.val > 0 ? t.val : 0), 0);
      const boardPowerDmg = Math.floor(boardSum * 0.05);
      if (boardPowerDmg > 0) {
        damageDealt += boardPowerDmg;
        // Optionally add to logs or HUD if needed, but for now we'll just include it in the total
      }

      // (Monk and Druid passives are now handled via PackEngine hooks)
    }

    return { newGrid, changed, damageDealt, merges, goldEarned, multIncrease, mergeResults };
  },

  /**
   * Check for gridlock (no moves left)
   */
  checkGridlock(grid: (Tile | null)[]): boolean {
    if (grid.some((t) => t === null)) return false;

    // Check horizontal merges
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const i1 = r * 4 + c,
          i2 = r * 4 + c + 1;
        const t1 = grid[i1];
        const t2 = grid[i2];
        if (t1 && t2 && t1.val > 0 && t1.val === t2.val) return false;
      }
    }

    // Check vertical merges
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 3; r++) {
        const i1 = r * 4 + c,
          i2 = (r + 1) * 4 + c;
        const t1 = grid[i1];
        const t2 = grid[i2];
        if (t1 && t2 && t1.val > 0 && t1.val === t2.val) return false;
      }
    }

    return true;
  },
};
