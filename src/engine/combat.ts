import type { Tile, GameStoreState } from '../types/game';
import { Native } from './native';

export const CombatLogic = {
  /**
   * Core 2048-style movement and merging logic
   */
  processMove(state: GameStoreState, direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'): { 
    newGrid: (Tile | null)[], 
    changed: boolean, 
    damageDealt: number,
    merges: number,
    goldEarned: number,
    multIncrease: number
  } {
    let newGrid = [...state.grid];
    let changed = false;
    let damageDealt = 0;
    let merges = 0;
    let goldEarned = 0;
    let multIncrease = 0;

    const processLine = (lineIndices: number[]) => {
      // 1. Filter out nulls
      let line = lineIndices.map((i) => newGrid[i]).filter((v): v is Tile => v !== null);
      let combined: (Tile | null)[] = [];
      
      for (let i = 0; i < line.length; i++) {
        if (
          i < line.length - 1 &&
          line[i].val > 0 &&
          line[i].val === line[i + 1].val
        ) {
          // MERGE DETECTED
          let tA = line[i];
          let tB = line[i + 1];
          let newVal = tA.val * 2;
          
          combined.push({ 
            id: tA.id, // Keep the ID for animation continuity
            val: newVal, 
            pop: true, 
            merged: true 
          });

          merges++;
          
          // Calculate Damage
          let baseDmg = newVal; 
          
          // Class Bonuses
          if (state.playerClass?.id === 'Barbarian' && (newVal === 4 || newVal === 8)) {
            baseDmg += 10;
          }
          if (state.playerClass?.id === 'Fighter' && newVal >= 8) {
            baseDmg += 15;
          }
          if (state.playerClass?.id === 'Rogue') {
            goldEarned += 1;
          }

          // Artifact Bonuses
          const artifacts = state.artifacts || [];
          if (artifacts.some(a => a.id === 'GRAVITY_BOOTS') && direction === 'DOWN') {
            baseDmg *= 1.5;
          }
          if (artifacts.some(a => a.id === 'ASSASSIN_MARK') && newVal === 4) {
            multIncrease += 0.1;
          }

          // Hunter's Mark logic
          let finalMergeDmg = baseDmg * state.multiplier;
          if ((state as any).hunterMarkLeft > 0) {
            finalMergeDmg *= 2;
            (state as any).hunterMarkLeft--;
          }

          damageDealt += finalMergeDmg;
          
          Native.vibrate(20); // Small pulse on merge
          i++; // Skip next tile since it merged
        } else {
          combined.push(line[i]);
        }
      }

      // Fill remaining space with nulls
      while (combined.length < 4) combined.push(null);

      // 2. Check if anything changed and update newGrid
      for (let i = 0; i < 4; i++) {
        const targetIdx = lineIndices[i];
        if (
          newGrid[targetIdx]?.id !== combined[i]?.id ||
          newGrid[targetIdx]?.val !== combined[i]?.val
        ) {
          changed = true;
        }
        newGrid[targetIdx] = combined[i];
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
      const goblinCount = newGrid.filter(t => t && t.val === -2).length;
      if (goblinCount > 0) {
        const stolen = Math.min(state.gold, goblinCount);
        goldEarned -= stolen;
      }

      // Hazard Clearing Thresholds
      if (damageDealt >= 100) {
        newGrid = newGrid.map(t => t && t.val === -1 ? null : t); // Slime
      }
      if (damageDealt >= 50) {
        newGrid = newGrid.map(t => t && t.val === -2 ? null : t); // Goblin
      }

      // Monk momentum
      if (state.playerClass?.id === 'Monk' && (state as any).lastDirection && (state as any).lastDirection !== direction) {
        multIncrease += 0.1;
      }

      // Druid purification
      if (state.playerClass?.id === 'Druid' && Math.random() < 0.2) {
        const hIdx = newGrid.findIndex(t => t && t.val < 0);
        if (hIdx !== -1) newGrid[hIdx] = null;
      }
    }

    return { newGrid, changed, damageDealt, merges, goldEarned, multIncrease };
  },

  /**
   * Check for gridlock (no moves left)
   */
  checkGridlock(grid: (Tile | null)[]): boolean {
    if (grid.some((t) => t === null)) return false;
    
    // Check horizontal merges
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        let i1 = r * 4 + c, i2 = r * 4 + c + 1;
        const t1 = grid[i1];
        const t2 = grid[i2];
        if (t1 && t2 && t1.val > 0 && t1.val === t2.val) return false;
      }
    }
    
    // Check vertical merges
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 3; r++) {
        let i1 = r * 4 + c, i2 = (r + 1) * 4 + c;
        const t1 = grid[i1];
        const t2 = grid[i2];
        if (t1 && t2 && t1.val > 0 && t1.val === t2.val) return false;
      }
    }
    
    return true;
  }
};
