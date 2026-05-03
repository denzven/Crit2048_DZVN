import { create } from 'zustand';
import type { GameStoreState, GameState, Tile, RunStats } from '../types/game';
import { GameStorage } from './storage';
import { CombatLogic } from './combat';
import { Native } from './native';
import { MASTER_ARTIFACTS, ENEMIES, CLASSES } from './data';
import { SFX } from './audio';
import { LeaderboardLogic } from './leaderboard';
import { SeededRNG } from './prng';

const DEFAULT_RUN_STATS: RunStats = {
  maxDamage: 0,
  totalDamageDealt: 0,
  totalMerges: 0,
  totalMoves: 0,
  totalCoinsSpent: 0,
  maxMultiplier: 1.0,
  lastRoundDamage: 0,
  highestTileValue: 2,
  totalHazardsCleared: 0,
  mostMergedVal: 2,
  mergeCounts: {},
  abilityUses: 0,
  spellDamageDealt: 0,
  totalSpellsCast: 0,
  hazardsSpawned: 0,
  luckFactor: 10,
  startTime: 0,
  endTime: 0,
  seedUsed: '',
  endReason: '',
  activePackIds: [],
  packRunLabel: '',
  customEnemiesDefeated: 0,
};

const INITIAL_STATE: GameStoreState = {
  gameState: 'START',
  grid: Array(16).fill(null),
  encounterIdx: 0,
  monsterHp: 0,
  monsterMaxHp: 0,
  slidesLeft: 0,
  gold: 0,
  multiplier: 1.0,
  playerClass: null,
  artifacts: [],
  logs: [],
  isTransitioning: false,
  isGameOver: false,
  isRolling: false,
  runStats: { ...DEFAULT_RUN_STATS },
};

interface GameActions {
  setGameState: (state: GameState) => void;
  addLog: (msg: string) => void;
  updateMonsterHp: (hp: number) => void;
  addGold: (amount: number) => void;
  spawnRandomTile: (valOverride?: number | null) => void;
  move: (direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => void;
  initEncounter: (hp: number, slides: number) => void;
  nextEncounter: () => void;
  generateShop: () => void;
  applyBossPowers: () => void;
  buyArtifact: (artifactId: string) => void;
  rollD20: () => Promise<void>;
  closeDiceModal: () => void;
  castSpell: () => void;
  executeSpellRoll: () => Promise<void>;
  resolveSpell: () => void;
  upgradeSpell: () => void;
  restoreSpells: () => void;
  resetGame: () => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
}

export interface ExtendedGameStoreState extends GameStoreState {
  shopItems: any[];
  slidesSinceRoll: number;
  lastRoll: {
    val: number;
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
}

export const useGameStore = create<ExtendedGameStoreState & GameActions>()((set, get) => ({
  ...INITIAL_STATE,
  shopItems: [],
  slidesSinceRoll: 0,
  lastRoll: null,
  usesLeft: 0,
  spellRoll: null,
  lastDirection: null,
  hunterMarkLeft: 0,

  setGameState: (gameState: GameState) => {
    if (gameState === 'PLAYING' && get().runStats.startTime === 0) {
      set((s) => ({ runStats: { ...s.runStats, startTime: Date.now() } }));
    }
    set({ gameState });
  },

  addLog: (msg: string) => set((state) => ({ 
    logs: [msg, ...state.logs].slice(0, 50) 
  })),

  updateMonsterHp: (monsterHp: number) => set({ 
    monsterHp: Math.max(0, monsterHp) 
  }),

  addGold: (amount: number) => {
    if (amount > 0) SFX.coin();
    set((state) => ({ 
      gold: Math.max(0, state.gold + amount) 
    }));
  },

  spawnRandomTile: (valOverride: number | null = null) => {
    const { grid } = get();
    const emptyIndices = grid
      .map((v, i) => (v === null ? i : null))
      .filter((v): v is number => v !== null);

    if (emptyIndices.length > 0) {
      const rIdx = emptyIndices[Math.floor(SeededRNG.random() * emptyIndices.length)];
      const val = valOverride !== null ? valOverride : SeededRNG.random() > 0.9 ? 4 : 2;
      
      const newGrid = [...grid];
      newGrid[rIdx] = { 
        id: Date.now() + Math.random(), 
        val: val, 
        pop: true 
      };

      set({ grid: newGrid });
      if (val < 0) {
        set((s) => ({ runStats: { ...s.runStats, hazardsSpawned: s.runStats.hazardsSpawned + 1 } }));
      }
    }
  },

  move: (direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    const state = get();
    if (state.gameState !== 'PLAYING' || state.isTransitioning || state.isGameOver) return;

    const { newGrid, changed, damageDealt, goldEarned, merges, multIncrease } = CombatLogic.processMove(state, direction);

    if (!changed) return;

    if (damageDealt > 0) {
      get().addLog(`Combo: Dealt ${Math.ceil(damageDealt)} damage!`);
      SFX.hit();
    } else if (merges > 0) {
      SFX.merge();
    } else {
      SFX.slide();
    }

    const highestVal = Math.max(...newGrid.map(t => t?.val || 0));

    set((s) => ({
      grid: [...newGrid],
      monsterHp: Math.max(0, s.monsterHp - damageDealt),
      slidesLeft: s.slidesLeft - 1,
      slidesSinceRoll: s.slidesSinceRoll + 1,
      gold: s.gold + goldEarned,
      multiplier: s.multiplier + multIncrease,
      lastDirection: direction,
      runStats: {
        ...s.runStats,
        totalMoves: s.runStats.totalMoves + 1,
        totalDamageDealt: s.runStats.totalDamageDealt + damageDealt,
        maxDamage: Math.max(s.runStats.maxDamage, damageDealt),
        lastRoundDamage: damageDealt,
        totalMerges: s.runStats.totalMerges + merges,
        highestTileValue: Math.max(s.runStats.highestTileValue, highestVal),
        maxMultiplier: Math.max(s.runStats.maxMultiplier, s.multiplier + multIncrease),
      }
    }));

    if (goldEarned < 0) {
      get().addLog(`👺 Goblins stole ${Math.abs(goldEarned)} gold!`);
    }

    get().spawnRandomTile();
    get().applyBossPowers();

    const updatedState = get();
    if (updatedState.monsterHp <= 0) {
      get().addLog("BOSS DEFEATED! Gold +50.");
      let tavernGold = updatedState.gold + 50;
      
      // Artifact: Ring of Wealth
      if (updatedState.artifacts.some(a => a.id === 'RING_WEALTH')) {
        tavernGold += 30;
        get().addLog("💍 Ring of Wealth: +30 Gold!");
      }

      set({ isTransitioning: true, gold: tavernGold });
      setTimeout(() => {
        if (get().encounterIdx >= ENEMIES.length - 1) {
          set({ 
            gameState: 'VICTORY', 
            isGameOver: true, 
            isTransitioning: false,
            runStats: { ...get().runStats, endTime: Date.now(), endReason: 'VICTORY' }
          });
        } else {
          get().generateShop();
          set({ gameState: 'TAVERN', isTransitioning: false });
        }
      }, 1000);
    } else if (updatedState.monsterHp > 0 && (updatedState.slidesLeft <= 0 || CombatLogic.checkGridlock(updatedState.grid))) {
      const stats = { ...get().runStats, endTime: Date.now(), endReason: 'GRIDLOCK' };
      set({ 
        gameState: 'GAME_OVER', 
        isGameOver: true,
        runStats: stats
      });
      LeaderboardLogic.saveRun(stats, get().playerClass, get().encounterIdx);
    } else if (updatedState.slidesSinceRoll >= 5) {
      set({ gameState: 'DICE' });
    }

    get().saveGame();
  },

  initEncounter: (hp, slides) => {
    const { playerClass, runStats } = get();
    
    // Seed initialization
    let seed = runStats.seedUsed;
    if (!seed) {
      seed = SeededRNG.setSeed();
    } else {
      SeededRNG.setSeed(seed);
    }

    set({
      grid: Array(16).fill(null),
      monsterHp: hp,
      monsterMaxHp: hp,
      slidesLeft: slides,
      gameState: 'PLAYING',
      isGameOver: false,
      isTransitioning: false,
      slidesSinceRoll: 0,
      usesLeft: playerClass?.ability?.maxUses || 0,
      runStats: { 
        ...runStats, 
        startTime: runStats.startTime === 0 ? Date.now() : runStats.startTime,
        seedUsed: seed
      }
    });
  },

  generateShop: () => {
    const pool = MASTER_ARTIFACTS.filter(a => !get().artifacts.some(ea => ea.id === a.id));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    set({ shopItems: shuffled.slice(0, 4) });
  },

  nextEncounter: () => {
    const { encounterIdx } = get();
    const nextEnemy = ENEMIES[Math.min(encounterIdx + 1, ENEMIES.length - 1)];
    
    get().initEncounter(nextEnemy.hp, nextEnemy.slides);
    set({ encounterIdx: encounterIdx + 1 });
    get().spawnRandomTile();
    get().spawnRandomTile();
  },

  applyBossPowers: () => {
    const { encounterIdx, monsterHp, monsterMaxHp, runStats, grid } = get();
    const enemy = ENEMIES[encounterIdx];
    if (!enemy) return;

    const turn = runStats.totalMoves;
    
    // Regeneration
    if (enemy.name.includes("Troll") && monsterHp > 0) {
      set({ monsterHp: Math.min(monsterMaxHp, monsterHp + 30) });
    }

    // Slime Spawning
    if (enemy.name.includes("Slime") && turn % 8 === 0) {
      get().addLog("Boss Power: Slime spawned!");
      get().spawnRandomTile(-1);
    }

    // Goblin Ambush
    if (enemy.name.includes("Goblin") && turn % 12 === 0) {
      get().addLog("Ambush: Goblin spawned!");
      get().spawnRandomTile(-2);
    }

    // Lich Necromancy
    if (enemy.name.includes("Lich") && turn % 12 === 0) {
      get().addLog("Necromancy: Skeleton raised!");
      get().spawnRandomTile(-3);
    }

    // Dragon Inferno
    if (enemy.name.includes("Dragon") && turn % 10 === 0) {
      let maxV = 0, maxI = -1;
      grid.forEach((t, i) => { if (t && t.val > maxV) { maxV = t.val; maxI = i; } });
      if (maxI !== -1) {
        const newGrid = [...grid];
        newGrid[maxI] = null;
        set({ grid: newGrid });
        get().addLog("Boss Power: Inferno burned highest weapon!");
      }
    }
  },

  buyArtifact: (artifactId: string) => {
    const { gold, shopItems, artifacts } = get();
    const item = shopItems.find(i => i.id === artifactId);
    
    if (item && gold >= item.basePrice) {
      Native.vibrate(20);
      set({
        gold: gold - item.basePrice,
        artifacts: [...artifacts, { ...item, level: 1 }],
        shopItems: shopItems.filter(i => i.id !== artifactId),
        runStats: { ...get().runStats, totalCoinsSpent: get().runStats.totalCoinsSpent + item.basePrice }
      });
      get().addLog(`Merchant: Purchased ${item.name}!`);
    }
  },

  rollD20: async () => {
    const { isRolling, playerClass } = get();
    if (isRolling) return;

    set({ isRolling: true });
    Native.vibrate(100);

    await new Promise(r => setTimeout(r, 800));

    let rawRoll = Math.floor(SeededRNG.random() * 20) + 1;
    
    // Artifact: Weighted Dice
    if (get().artifacts.some(a => a.id === 'WEIGHTED_DICE') && rawRoll < 4) {
      rawRoll = 4;
      get().addLog("🎲 Weighted Dice: Roll bumped to 4!");
    }

    const mod = playerClass?.d20Mod || 0;
    let roll = rawRoll + mod;

    // Artifact: Adamantine Armor
    if (get().artifacts.some(a => a.id === 'ADAMANTINE') && rawRoll === 1) {
      rawRoll = 2; // Negate crit fail
      roll = rawRoll + mod;
      get().addLog("🛡️ Adamantine: Crit fail negated!");
    }

    let result: ExtendedGameStoreState['lastRoll'] = { 
      val: rawRoll, 
      msg: '', 
      type: 'success' 
    };

    if (roll >= 20) {
      SFX.crit();
      result = { val: rawRoll, msg: 'NATURAL 20! Critical Hit!', type: 'crit' };
      set((s) => ({ multiplier: s.multiplier + 1.0, runStats: { ...s.runStats, maxMultiplier: Math.max(s.runStats.maxMultiplier, s.multiplier + 1.0) } }));
      const validIndices = get().grid.map((c, i) => (c && c.val > 0 ? i : null)).filter((c): c is number => c !== null);
      if (validIndices.length > 0) {
        const idx = validIndices[Math.floor(Math.random() * validIndices.length)];
        const newGrid = [...get().grid];
        if (newGrid[idx]) newGrid[idx] = { ...newGrid[idx]!, val: newGrid[idx]!.val * 2, pop: true };
        set({ grid: newGrid });
      }
    } else if (roll >= 10) {
      result = { val: rawRoll, msg: 'SUCCESS! High-tier weapon spawned.', type: 'success' };
      get().spawnRandomTile(8);
    } else if (roll > 1) {
      SFX.fail();
      result = { val: rawRoll, msg: 'MISS! A Slime blocked your path.', type: 'fail' };
      get().spawnRandomTile(-1);
    } else {
      result = { val: rawRoll, msg: 'NATURAL 1! Critical Failure!', type: 'crit-fail' };
      let maxV = 0, maxI = -1;
      get().grid.forEach((c, i) => { if (c && c.val > maxV) { maxV = c.val; maxI = i; } });
      if (maxI !== -1) {
        const newGrid = [...get().grid];
        newGrid[maxI] = null;
        set({ grid: newGrid });
      }
    }

    get().addLog(`D20 Roll: ${rawRoll} (${result.type})`);
    set({ lastRoll: result, isRolling: false });
  },

  closeDiceModal: () => {
    set({ gameState: 'PLAYING', slidesSinceRoll: 0, lastRoll: null });
    get().saveGame();
  },

  castSpell: () => {
    const { usesLeft, playerClass, gameState, isRolling } = get();
    if (gameState !== 'PLAYING' || isRolling || !playerClass?.ability || usesLeft <= 0) return;

    set({ gameState: 'SPELL', spellRoll: null });
  },

  executeSpellRoll: async () => {
    const { playerClass, isRolling } = get();
    if (isRolling || !playerClass?.ability) return;

    set({ isRolling: true });
    Native.vibrate(100);

    await new Promise(r => setTimeout(r, 800));

    const ab = playerClass.ability;
    const results = Array(ab.count).fill(0).map(() => Math.floor(SeededRNG.random() * ab.sides) + 1);
    const sum = results.reduce((a, b) => a + b, 0);

    set({
      spellRoll: { results, sum },
      isRolling: false,
      usesLeft: get().usesLeft - 1,
      runStats: {
        ...get().runStats,
        abilityUses: get().runStats.abilityUses + 1,
        totalSpellsCast: get().runStats.totalSpellsCast + 1,
      }
    });
  },

  resolveSpell: () => {
    const { spellRoll, multiplier, monsterHp, playerClass, slidesLeft } = get();
    if (!spellRoll || !playerClass?.ability) return;

    const ab = playerClass.ability;
    if (ab.type === 'damage') {
      const dmg = spellRoll.sum * multiplier;
      set({ 
        monsterHp: Math.max(0, monsterHp - dmg),
        runStats: {
          ...get().runStats,
          spellDamageDealt: get().runStats.spellDamageDealt + dmg
        }
      });
      get().addLog(`Spell: ${ab.name} dealt ${Math.ceil(dmg)} damage!`);
    } else if (ab.type === 'heal') {
      const heal = spellRoll.sum;
      set({ slidesLeft: slidesLeft + heal });
      get().addLog(`Spell: ${ab.name} restored ${heal} slides!`);
    }

    set({ gameState: 'PLAYING', spellRoll: null });
    
    if (get().monsterHp <= 0) {
      get().addLog("BOSS DEFEATED! Gold +50.");
      set({ isTransitioning: true, gold: get().gold + 50 });
      setTimeout(() => {
        if (get().encounterIdx >= ENEMIES.length - 1) {
          const stats = { ...get().runStats, endTime: Date.now(), endReason: 'VICTORY' };
          set({ 
            gameState: 'VICTORY', 
            isGameOver: true, 
            isTransitioning: false,
            runStats: stats
          });
          LeaderboardLogic.saveRun(stats, get().playerClass, get().encounterIdx);
        } else {
          get().generateShop();
          set({ gameState: 'TAVERN', isTransitioning: false });
        }
      }, 1000);
    }

    get().saveGame();
  },

  upgradeSpell: () => {
    const { gold, playerClass } = get();
    if (!playerClass?.ability) return;
    const cost = 100 * (playerClass.ability.count || 1);
    
    if (gold >= cost) {
      const newAbility = { ...playerClass.ability, count: playerClass.ability.count + 1 };
      set({
        gold: gold - cost,
        playerClass: { ...playerClass, ability: newAbility },
        runStats: { ...get().runStats, totalCoinsSpent: get().runStats.totalCoinsSpent + cost }
      });
      get().addLog(`Spell Enhanced: Now rolls ${newAbility.count}d${newAbility.sides}!`);
    }
  },

  restoreSpells: () => {
    const { gold, playerClass } = get();
    if (gold < 30 || !playerClass?.ability) return;

    set({
      gold: gold - 30,
      usesLeft: playerClass.ability.maxUses,
      runStats: { ...get().runStats, totalCoinsSpent: get().runStats.totalCoinsSpent + 30 }
    });
    get().addLog("Merchant: Spell uses restored.");
  },

  resetGame: () => set({ 
    ...INITIAL_STATE, 
    shopItems: [], 
    slidesSinceRoll: 0, 
    lastRoll: null, 
    usesLeft: 0, 
    spellRoll: null, 
    lastDirection: null,
    hunterMarkLeft: 0,
    runStats: { ...DEFAULT_RUN_STATS } 
  }),

  saveGame: async () => {
    const state = get();
    const persistentData = {
      gameState: state.gameState,
      grid: state.grid,
      encounterIdx: state.encounterIdx,
      monsterHp: state.monsterHp,
      monsterMaxHp: state.monsterMaxHp,
      slidesLeft: state.slidesLeft,
      gold: state.gold,
      multiplier: state.multiplier,
      playerClass: state.playerClass,
      artifacts: state.artifacts,
      logs: state.logs,
      runStats: state.runStats,
      slidesSinceRoll: state.slidesSinceRoll,
      usesLeft: state.usesLeft,
      lastDirection: state.lastDirection,
      hunterMarkLeft: state.hunterMarkLeft,
    };
    await GameStorage.saveGame(persistentData);
  },

  loadGame: async () => {
    const saved = await GameStorage.loadGame();
    if (saved) {
      set({ ...saved, isTransitioning: false, isGameOver: false, isRolling: false, lastRoll: null, spellRoll: null });
      return true;
    }
    return false;
  },
}));
