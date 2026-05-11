import type { ArtifactDef, ClassDef, EnemyDef } from './pack';

export interface Tile {
  id: number;
  val: number;
  pop?: boolean;
  merged?: boolean;
  x?: number; // For future animation support
  y?: number;
}

export interface ArtifactEntry extends ArtifactDef {
  level: number;
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
  curseClears: number;
  webClears: number;
  startTime: number;
  endTime: number;
  seedUsed: string;
  endReason: string;
  activePackIds: string[];
  packRunLabel: string;
  customEnemiesDefeated: number;
  wasGodModeUsed?: boolean;
}

export type GameState =
  | 'START'
  | 'CLASS_SELECT'
  | 'PLAYING'
  | 'DICE'
  | 'SPELL'
  | 'TAVERN'
  | 'GAME_OVER'
  | 'VICTORY';

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  type: 'damage' | 'gold' | 'mult';
}

export interface ConfirmationState {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type: 'confirm' | 'alert';
}

export interface Settings {
  haptics: boolean;
  hapticIntensity: number;
  screenshake: boolean;
  shakeIntensity: number;
  particles: boolean;
  sfxVolume: number;
  musicVolume: number;
  uiScale: number;
  fontScale: number;
  movesPerRoll: number;
  startingGold: number;
  diceTheme: 'default' | 'blood' | 'bone' | 'neon' | 'wood' | 'stone';
  customSeed?: string;
}

export interface GameStoreState {
  gameState: GameState;
  grid: (Tile | null)[];
  encounterIdx: number;
  monsterHp: number;
  monsterMaxHp: number;
  slidesLeft: number;
  gold: number;
  multiplier: number;
  score: number;
  playerClass: ClassDef | null;
  artifacts: ArtifactEntry[];
  logs: string[];

  // Transient flags
  isTransitioning: boolean;
  isGameOver: boolean;
  isRolling: boolean;

  hasSave: boolean;
  runStats: RunStats;
  settings: Settings;
  floatingTexts: FloatingText[];
  confirmation: ConfirmationState | null;
  activeEncounters: EnemyDef[];
  activeClasses: ClassDef[];
  activeArtifacts: ArtifactDef[];
}
export interface ExtendedGameStoreState extends GameStoreState {
  shopItems: ArtifactDef[];
  slidesSinceRoll: number;
  lastRoll: {
    rawVal: number;
    finalVal: number;
    modifiers: { label: string; val: number; id: string; type: 'add' | 'multiply' | 'set' }[];
    msg: string;
    type: 'crit' | 'success' | 'fail' | 'crit-fail';
  } | null;
  usesLeft: number;
  spellRoll: {
    results: number[];
    sum: number;
  } | null;
  lastDirection: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | null;
  hunterMarkLeft: number;
  isChallengeMode: boolean;
  rivalData: {
    score: number;
    merges: number;
    damage: number;
    maxDamage: number;
    moves: number;
    name?: string;
    icon?: string;
    seed: string;
  } | null;
  activeFX: { id: string; name: string; params?: unknown }[];
  isDevMode: boolean;
  d20Override: number | null;
}
