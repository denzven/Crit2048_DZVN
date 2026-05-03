export interface Tile {
  id: number;
  val: number;
  pop?: boolean;
  merged?: boolean;
  x?: number; // For future animation support
  y?: number;
}

export interface RunStats {
  maxDamage: number;
  totalDamageDealt: number;
  totalMerges: number;
  totalMoves: number;
  totalCoinsSpent: number;
  maxMultiplier: number;
  lastRoundDamage: number;
  highestTileValue: number;
  totalHazardsCleared: number;
  mostMergedVal: number;
  mergeCounts: Record<number, number>;
  abilityUses: number;
  spellDamageDealt: number;
  totalSpellsCast: number;
  hazardsSpawned: number;
  luckFactor: number;
  startTime: number;
  endTime: number;
  seedUsed: string;
  endReason: string;
  activePackIds: string[];
  packRunLabel: string;
  customEnemiesDefeated: number;
}

export type GameState = 'START' | 'CLASS_SELECT' | 'PLAYING' | 'DICE' | 'SPELL' | 'TAVERN' | 'GAME_OVER' | 'VICTORY';

export interface GameStoreState {
  gameState: GameState;
  grid: (Tile | null)[];
  encounterIdx: number;
  monsterHp: number;
  monsterMaxHp: number;
  slidesLeft: number;
  gold: number;
  multiplier: number;
  playerClass: any | null;
  artifacts: any[];
  logs: string[];
  
  // Transient flags
  isTransitioning: boolean;
  isGameOver: boolean;
  isRolling: boolean;
  
  runStats: RunStats;
}
