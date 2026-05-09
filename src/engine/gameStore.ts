import { create } from 'zustand';
import type { GameStoreState, GameState, Tile, RunStats, ConfirmationState } from '../types/game';
import { GameStorage } from './storage';
import { CombatLogic } from './combat';
import { Native } from './native';
import { MASTER_ARTIFACTS, ENEMIES, CLASSES } from './data';
import { SFX } from './audio';
import { LeaderboardLogic } from './leaderboard';
import { SeededRNG } from './prng';
import { PackEngine } from './packEngine';
import { useRegistry } from './registryHub';

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
  curseClears: 0,
  webClears: 0,
  startTime: 0,
  endTime: 0,
  seedUsed: '',
  endReason: '',
  activePackIds: [],
  packRunLabel: '',
  customEnemiesDefeated: 0,
  wasGodModeUsed: false,
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
  score: 0,
  playerClass: null,
  artifacts: [],
  logs: [],
  isTransitioning: false,
  isGameOver: false,
  isRolling: false,
  runStats: { ...DEFAULT_RUN_STATS },
  settings: {
    haptics: true,
    hapticIntensity: 1.0,
    screenshake: true,
    shakeIntensity: 1.0,
    particles: true,
    volume: 1.0,
    uiScale: 1.0,
    fontScale: 1.0,
    movesPerRoll: 5,
    startingGold: 0,
    diceTheme: 'default',
    customSeed: ''
  },
  floatingTexts: [],
  confirmation: null,
  hasSave: false,
  activeEncounters: [],
  activeClasses: [],
  activeArtifacts: [],
};

export interface GameActions {
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
  cancelSpell: () => void;
  upgradeSpell: () => void;
  restoreSpells: () => void;
  resetGame: () => void;
  setD20Result: (val: number) => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
  checkSave: () => Promise<void>;
  addFloatingText: (text: string, type: 'damage' | 'gold' | 'mult', x?: number, y?: number) => void;
  updateSettings: (settings: Partial<GameStoreState['settings']>) => void;
  forfeitRun: () => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
  showAlert: (title: string, message: string) => void;
  triggerScreenShake: (intensity?: number) => void;
  closeConfirmation: () => void;
  initializeRegistry: () => Promise<void>;
  restoreSlides: (n: number) => void;
  addMultiplier: (n: number) => void;
  applyDamage: (n: number) => void;
  setMonsterHp: (hp: number) => void;
  setMultiplier: (n: number) => void;
  prevEncounter: () => void;
  checkHazards: (newGrid: (Tile | null)[], damage: number) => (Tile | null)[];
  triggerFX: (name: string, params?: any) => void;
  setState: (partial: any) => void;
  toggleDevMode: () => void;
  executeDebugScript: (code: string) => void;
}

export interface ExtendedGameStoreState extends GameStoreState {
  shopItems: any[];
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
  activeFX: { id: string; name: string; params?: any }[];
  isDevMode: boolean;
  d20Override: number | null;
}

export const useGameStore = create<ExtendedGameStoreState & GameActions>((set, get) => ({
  ...INITIAL_STATE,
  shopItems: [],
  slidesSinceRoll: 0,
  lastRoll: null,
  usesLeft: 0,
  spellRoll: null,
  lastDirection: null,
  hunterMarkLeft: 0,
  activeFX: [],
  isDevMode: false,
  d20Override: null,

  addFloatingText: (text, type, x = 50, y = 50) => {
    const id = Date.now() + SeededRNG.random();
    set((state) => ({
      floatingTexts: [...state.floatingTexts, { id, text, type, x, y }]
    }));
    setTimeout(() => {
      set((state) => ({
        floatingTexts: state.floatingTexts.filter((t) => t.id !== id)
      }));
    }, 850);
  },

  triggerFX: (name, params) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      activeFX: [...state.activeFX, { id, name, params }]
    }));
    setTimeout(() => {
      set((state) => ({
        activeFX: state.activeFX.filter((f) => f.id !== id)
      }));
    }, 2000);
  },

  toggleDevMode: () => {
    const next = !get().isDevMode;
    set((s) => ({ 
      isDevMode: next,
      runStats: { ...s.runStats, wasGodModeUsed: true }
    }));
    get().addLog(next ? "🛠️ DEV MODE ENABLED" : "🛠️ DEV MODE DISABLED");
    if (next) SFX.menuEnter();
  },

  executeDebugScript: (code: string) => {
    try {
      PackEngine.runScript(code, get());
      get().addLog("🛠️ DEBUG SCRIPT EXECUTED");
    } catch (e) {
      console.error("Debug Script Error:", e);
      get().addLog("❌ DEBUG SCRIPT FAILED");
    }
  },

  initializeRegistry: async () => {
    // 1. Load Presets (the "Foundation")
    await useRegistry.getState().loadPresets();
    
    // 2. Load Base Game (Mod Priority 0)
    await useRegistry.getState().loadBaseGame();
    
    // 3. Load Packs (User Mods)
    const { encounters, classes, artifacts } = await PackEngine.applyPacks(get().runStats.activePackIds);
    
    set({ 
      activeEncounters: encounters, 
      activeClasses: classes, 
      activeArtifacts: artifacts 
    });
    console.log("[GameStore] Registry initialized with", { 
      encounters: encounters.length, 
      classes: classes.length, 
      artifacts: artifacts.length 
    });
    useRegistry.getState().setIsReady(true);
    // Retention Notification
    const lastPlayed = localStorage.getItem('crit2048_last_played');
    const now = Date.now();
    if (lastPlayed) {
      const diff = now - parseInt(lastPlayed);
      if (diff > 1000 * 60 * 60 * 20) { // More than 20 hours
        Native.notify("Welcome Back, Hero!", "The dungeon has missed you. A new daily seed is waiting!", "🐉");
      }
    }
    localStorage.setItem('crit2048_last_played', now.toString());
    await get().checkSave();
  },

  checkSave: async () => {
    const saved = await GameStorage.loadGame();
    const resumable = saved && saved.gameState !== 'START' && !saved.isGameOver;
    set({ hasSave: !!resumable });
  },

  setState: (partial: any) => set(partial),

  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      
      // Apply Scaling
      if (newSettings.uiScale !== undefined) {
        document.documentElement.style.setProperty('--ui-scale', updated.uiScale.toString());
      }
      if (newSettings.fontScale !== undefined) {
        document.documentElement.style.setProperty('--font-scale', updated.fontScale.toString());
      }
      
      return { settings: updated };
    });
  },

  forfeitRun: () => {
    const state = get();
    if (state.gameState === 'START' || state.gameState === 'CLASS_SELECT' || state.isGameOver) {
      SFX.menuEnter();
      set((s) => ({ 
        gameState: 'START', 
        playerClass: null, 
        artifacts: [], 
        logs: [], 
        grid: Array(16).fill(null), 
        monsterHp: 0, 
        monsterMaxHp: 0,
        encounterIdx: 0,
        score: 0,
        multiplier: 1.0,
        slidesLeft: 0,
        isGameOver: false,
        runStats: { ...DEFAULT_RUN_STATS, activePackIds: s.runStats.activePackIds }
      }));
      return;
    }
    
    const stats = { ...state.runStats, endTime: Date.now(), endReason: 'FORFEIT' };
    SFX.gameOver();
    set({ 
      gameState: 'GAME_OVER', 
      isGameOver: true,
      runStats: stats
    });
    
    // Only save to leaderboard if the player has actually engaged in combat and NOT in god mode
    if (!state.runStats.wasGodModeUsed && (state.runStats.totalMoves > 0 || state.monsterHp < state.monsterMaxHp)) {
      LeaderboardLogic.saveRun(stats, state.playerClass, state.encounterIdx);
    }
    get().saveGame();
  },

  showConfirm: (title, message, onConfirm, onCancel) => {
    set({ confirmation: { title, message, onConfirm, onCancel, type: 'confirm' } });
  },

  showAlert: (title, message) => {
    set({ confirmation: { title, message, onConfirm: () => get().closeConfirmation(), type: 'alert' } });
  },

  triggerScreenShake: (intensity = 1.0) => {
    if (!get().settings.screenshake) return;
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    container.style.setProperty('--shake-intensity', (intensity * get().settings.shakeIntensity).toString());
    container.classList.remove('shake-active');
    void container.offsetWidth;
    container.classList.add('shake-active');
    
    setTimeout(() => {
      container.classList.remove('shake-active');
    }, 450);
  },

  closeConfirmation: () => {
    set({ confirmation: null });
  },

  setGameState: (gameState: GameState) => {
    const prevState = get().gameState;
    if (gameState === 'PLAYING' && get().runStats.startTime === 0) {
      set((s) => ({ runStats: { ...s.runStats, startTime: Date.now() } }));
    }

    // Trigger SFX on State Change
    if (gameState === 'CLASS_SELECT' && prevState !== 'CLASS_SELECT') SFX.classSelect();
    if (gameState === 'START' && prevState !== 'START') SFX.menuEnter();
    if (gameState === 'VICTORY' && prevState !== 'VICTORY') SFX.victory();
    if (gameState === 'GAME_OVER' && prevState !== 'GAME_OVER') SFX.gameOver();

    set({ gameState });
  },

  addLog: (msg: string) => set((state) => ({ 
    logs: [msg, ...state.logs].slice(0, 50) 
  })),

  updateMonsterHp: (monsterHp: number) => set({ 
    monsterHp: Math.max(0, monsterHp) 
  }),

  addGold: (amount: number) => {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    if (val > 0) SFX.coin();
    set((state) => ({ 
      gold: Math.max(0, (state.gold || 0) + val) 
    }));
  },

  restoreSlides: (n: number) => {
    const val = typeof n === 'number' && !isNaN(n) ? n : 0;
    set((state) => ({ 
      slidesLeft: Math.max(0, (state.slidesLeft || 0) + val) 
    }));
  },

  addMultiplier: (n: number) => {
    const val = typeof n === 'number' && !isNaN(n) ? n : 0;
    set((state) => ({ 
      multiplier: Math.max(0.1, (state.multiplier || 1) + val) 
    }));
  },

  applyDamage: (n: number) => {
    const val = typeof n === 'number' && !isNaN(n) ? n : 0;
    set((state) => ({ 
      monsterHp: Math.max(0, (state.monsterHp || 0) - val) 
    }));
  },

  setMonsterHp: (hp: number) => {
    const val = typeof hp === 'number' && !isNaN(hp) ? hp : 0;
    set({ monsterHp: Math.max(0, val) });
  },

  spawnRandomTile: (valOverride: any = null) => {
    let overrideVal: number | null = null;
    if (valOverride !== null && valOverride !== undefined) {
      overrideVal = typeof valOverride === 'string' ? parseInt(valOverride) : valOverride;
      if (isNaN(overrideVal as number)) overrideVal = null;
    }

    const { grid } = get();
    const emptyIndices = grid
      .map((v, i) => (v === null ? i : null))
      .filter((v): v is number => v !== null);

    if (emptyIndices.length > 0) {
      const rIdx = emptyIndices[Math.floor(SeededRNG.random() * emptyIndices.length)];
      const val = overrideVal !== null ? overrideVal : SeededRNG.random() > 0.9 ? 4 : 2;
      
      const newGrid = [...grid];
      newGrid[rIdx] = { 
        id: Date.now() + SeededRNG.random(), 
        val: val, 
        pop: true 
      };

      set({ grid: newGrid });
      if (val < 0) {
        set((s) => ({ runStats: { ...s.runStats, hazardsSpawned: s.runStats.hazardsSpawned + 1 } }));
      }
    }
  },

  prevEncounter: () => {
    const { encounterIdx, activeEncounters } = get();
    if (encounterIdx <= 0) return;
    const prevIdx = encounterIdx - 1;
    const nextE = activeEncounters[prevIdx];
    set({ 
      encounterIdx: prevIdx,
      monsterHp: nextE.hp,
      monsterMaxHp: nextE.hp,
      slidesLeft: nextE.slides,
      isTransitioning: false,
      isGameOver: false
    });
    get().addLog(`⏪ BACKTRACKED TO ANTE ${prevIdx + 1}`);
  },

  setMultiplier: (n: number) => {
    set({ multiplier: n });
    get().addLog(`🛠️ MULTIPLIER SET TO x${n.toFixed(1)}`);
  },

  setD20Result: (val: number) => {
    set({ d20Override: val });
  },

  checkHazards: (newGrid: (Tile | null)[], damage: number) => {
    let clearedCount = 0;
    let grid = [...newGrid];
    
    // Slime (100+)
    if (damage >= 100) {
      grid = grid.map(t => {
        if (t && t.val === -1) { clearedCount++; return null; }
        return t;
      });
    }
    // Web (75+)
    if (damage >= 75) {
      grid = grid.map(t => {
        if (t && t.val === -5) { clearedCount++; return null; }
        return t;
      });
    }
    // Goblin (50+)
    if (damage >= 50) {
      grid = grid.map(t => {
        if (t && t.val === -2) { clearedCount++; return null; }
        return t;
      });
    }

    // Curse (-6) - Drain extra slide if it exists on board
    const curseCount = grid.filter(t => t && t.val === -6).length;
    if (curseCount > 0) {
      get().restoreSlides(-curseCount);
      get().addLog(`🔮 Curse drained ${curseCount} extra slide!`);
    }

    if (clearedCount > 0) {
      set((s) => ({ runStats: { ...s.runStats, totalHazardsCleared: s.runStats.totalHazardsCleared + clearedCount } }));
    }

    return grid;
  },

  move: (direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    if (get().isGameOver || get().isTransitioning || get().isRolling) return;

    const { newGrid, changed, damageDealt, merges, goldEarned, multIncrease, mergeResults } = CombatLogic.processMove(get(), direction);

    if (changed) {
      if (damageDealt > 0) {
        SFX.hit();
        get().triggerScreenShake(merges > 1 ? 1.2 : 0.6);
        
        // Calculate Board Power contribution for logging
        const boardSum = newGrid.reduce((sum, t) => sum + (t && t.val > 0 ? t.val : 0), 0);
        const boardPowerDmg = Math.floor(boardSum * 0.05);
        
        if (merges > 0) {
          get().addLog(`Combo: Dealt ${Math.ceil(damageDealt)} damage!`);
        } else if (boardPowerDmg > 0) {
          get().addLog(`Board Power: Dealt ${boardPowerDmg} passive damage!`);
        }
        
        // Individualized floating text
        mergeResults.forEach(res => {
          const r = Math.floor(res.pos / 4);
          const c = res.pos % 4;
          const xOff = (SeededRNG.random() - 0.5) * 5;
          const yOff = (SeededRNG.random() - 0.5) * 5;
          get().addFloatingText(`-${Math.ceil(res.damage)}`, 'damage', c * 25 + 12.5 + xOff, r * 25 + 12.5 + yOff);
        });
      } else if (merges > 0) {
        SFX.merge();
      } else {
        SFX.slide();
      }

      if (goldEarned !== 0) {
        get().addFloatingText(`${goldEarned > 0 ? '+' : ''}${goldEarned} Gold`, 'gold', 50, 60);
        if (goldEarned < 0) get().addLog(`👺 Goblins stole ${Math.abs(goldEarned)} gold!`);
      }

      const highestVal = Math.max(...newGrid.map(t => t?.val || 0));

      // Check Hazards and return updated grid
      const finalGrid = get().checkHazards(newGrid, damageDealt);

      const reduction = PackEngine.getDamageReduction(get());
      const finalDamage = reduction > 0 ? damageDealt * (1 - reduction / 100) : damageDealt;

      set((s) => {
        const newMergeCounts = { ...s.runStats.mergeCounts };
        mergeResults.forEach(res => {
          const val = res.damage / s.multiplier; // Approximation of tile val for stats
          newMergeCounts[val] = (newMergeCounts[val] || 0) + 1;
        });

        return {
          grid: [...finalGrid],
          monsterHp: Math.max(0, s.monsterHp - finalDamage),
          slidesLeft: s.slidesLeft - 1,
          slidesSinceRoll: s.slidesSinceRoll + 1,
          gold: s.gold + goldEarned,
          multiplier: s.multiplier + multIncrease,
          lastDirection: direction,
          score: s.score + Math.ceil(finalDamage),
          runStats: {
            ...s.runStats,
            totalMoves: s.runStats.totalMoves + 1,
            totalDamageDealt: s.runStats.totalDamageDealt + finalDamage,
            maxDamage: Math.max(s.runStats.maxDamage, finalDamage),
            lastRoundDamage: finalDamage,
            totalMerges: s.runStats.totalMerges + merges,
            highestTileValue: Math.max(s.runStats.highestTileValue, highestVal),
            maxMultiplier: Math.max(s.runStats.maxMultiplier, s.multiplier + multIncrease),
            mergeCounts: newMergeCounts
          }
        };
      });

      get().spawnRandomTile();
      PackEngine.onSlide(get(), direction);
      get().applyBossPowers(); // Trigger boss powers after move
      if (damageDealt > 0) PackEngine.onDamage(get(), damageDealt);

      // Hazard Spreading: Every 10 moves, Slimes and Spores have a chance to spread
      if (get().runStats.totalMoves % 10 === 0) {
        const grid = [...get().grid];
        let spreadOccurred = false;
        grid.forEach((tile, idx) => {
          if (tile && (tile.val === -1 || tile.val === -7) && SeededRNG.random() < 0.25) {
            // Try to find adjacent empty spot
            const neighbors = [idx - 4, idx + 4, idx - 1, idx + 1].filter(i => i >= 0 && i < 16 && grid[i] === null);
            if (neighbors.length > 0) {
              const targetIdx = neighbors[Math.floor(SeededRNG.random() * neighbors.length)];
              grid[targetIdx] = { id: Date.now() + SeededRNG.random(), val: tile.val, pop: true };
              spreadOccurred = true;
            }
          }
        });
        if (spreadOccurred) {
          set({ grid });
          get().addLog("⚠️ Hazards are spreading!");
        }
      }
      // Post-move check
      const updatedState = get();
      if (updatedState.monsterHp <= 0) {
        get().triggerScreenShake(3.5);
        
        set({ gold: (updatedState.gold || 0) + 50 });

        set({ isTransitioning: true });
        
        // Trigger SFX immediately with the UI splash
        if (get().encounterIdx >= get().activeEncounters.length - 1) {
          SFX.victory();
        } else {
          SFX.encounterWin();
        }

        setTimeout(() => {
          if (get().encounterIdx >= get().activeEncounters.length - 1) {
            PackEngine.onGameOver(get(), 'VICTORY');
            set({ 
              gameState: 'VICTORY', 
              isGameOver: true, 
              isTransitioning: false,
              runStats: { ...get().runStats, endTime: Date.now(), endReason: 'VICTORY' }
            });
          } else {
            get().generateShop();
            PackEngine.onTavern(get());
            set({ gameState: 'TAVERN', isTransitioning: false });
            get().saveGame();
          }
        }, 2000);
      } else if (updatedState.monsterHp > 0 && (updatedState.slidesLeft <= 0 || CombatLogic.checkGridlock(updatedState.grid))) {
        const reason = updatedState.slidesLeft <= 0 ? 'OUT_OF_SLIDES' : 'GRIDLOCK';
        const stats = { ...get().runStats, endTime: Date.now(), endReason: reason };
        PackEngine.onGameOver(get(), reason);
        SFX.gameOver();
        set({ 
          gameState: 'GAME_OVER', 
          isGameOver: true,
          runStats: stats
        });
        if (!stats.wasGodModeUsed) {
          LeaderboardLogic.saveRun(stats, get().playerClass, get().encounterIdx);
        }
      } else if (updatedState.monsterHp > 0 && updatedState.slidesSinceRoll >= get().settings.movesPerRoll) {
        setTimeout(() => {
          if (get().gameState === 'PLAYING') set({ gameState: 'DICE' });
        }, 600);
      }

      get().saveGame();
    }
  },

  initEncounter: (hp, slides) => {
    const { playerClass, runStats } = get();
    
    // Seed initialization
    let seed = runStats.seedUsed || get().settings.customSeed;
    if (!seed) {
      seed = SeededRNG.setSeed();
    } else {
      SeededRNG.setSeed(seed);
    }

    set((s) => ({
      grid: Array(16).fill(null),
      monsterHp: hp,
      monsterMaxHp: hp,
      slidesLeft: slides,
      gold: s.runStats.totalMoves === 0 ? s.settings.startingGold : s.gold,
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
    }));
    
    // Spawn initial tiles
    get().spawnRandomTile();
    get().spawnRandomTile();

    // Call PackEngine hook after state update
    PackEngine.onEncounterStart(get());
    get().saveGame();
  },

  generateShop: () => {
    const { activeArtifacts, playerClass } = get();
    
    // Filter by required class if specified
    const pool = activeArtifacts.filter(a => {
      if (!a.requiredClass) return true;
      return a.requiredClass.toLowerCase() === playerClass?.id?.toLowerCase();
    });

    const shuffled = [...pool].sort(() => SeededRNG.random() - 0.5);
    // Expand shop to 6 items for better variety
    set({ shopItems: shuffled.slice(0, 6) });
  },

  nextEncounter: () => {
    const { encounterIdx, activeEncounters } = get();
    const nextEnemy = activeEncounters[Math.min(encounterIdx + 1, activeEncounters.length - 1)];
    
    PackEngine.onTavernLeave(get());
    SFX.descend();
    set({ isTransitioning: true }); // Show loading screen
    
    setTimeout(() => {
      const hp = parseInt(nextEnemy.hp as any) || 100;
      const slides = parseInt(nextEnemy.slides as any) || 20;
      get().initEncounter(hp, slides);
      set({ encounterIdx: encounterIdx + 1, isTransitioning: false });
    }, 2500);
  },

  applyBossPowers: () => {
    const { encounterIdx, monsterHp, monsterMaxHp, runStats, grid, activeEncounters } = get();
    const enemy = activeEncounters[encounterIdx];
    if (!enemy) return;

    const turn = runStats.totalMoves;
    
    // Regeneration
    if (enemy.name.includes("Troll") && monsterHp > 0 && turn % 5 === 0) {
      set({ monsterHp: Math.min(monsterMaxHp, monsterHp + 30) });
      SFX.enemyPower();
    }

    // Slime Spawning
    if (enemy.name.includes("Slime") && turn > 0 && turn % 8 === 0) {
      get().addLog("Boss Power: Slime spawned!");
      get().spawnRandomTile(-1);
      SFX.enemyPower();
    }

    // Goblin Ambush
    if (enemy.name.includes("Goblin") && turn > 0 && turn % 12 === 0) {
      get().addLog("Ambush: Goblin spawned!");
      get().spawnRandomTile(-2);
      SFX.enemyPower();
    }

    // Lich Necromancy
    if (enemy.name.includes("Lich") && turn > 0 && turn % 12 === 0) {
      get().addLog("Necromancy: Skeleton raised!");
      get().spawnRandomTile(-3);
      SFX.enemyPower();
    }

    // Dragon Inferno
    if (enemy.name.includes("Dragon") && turn > 0 && turn % 10 === 0) {
      let maxV = 0, maxI = -1;
      grid.forEach((t, i) => { if (t && t.val > maxV) { maxV = t.val; maxI = i; } });
      if (maxI !== -1) {
        const newGrid = [...grid];
        newGrid[maxI] = null;
        set({ grid: newGrid });
        get().addLog("Boss Power: Inferno burned highest weapon!");
        SFX.enemyPower();
      }
    }
  },

  buyArtifact: (artifactId: string) => {
    const { gold, shopItems, artifacts, activeArtifacts } = get();
    const item = shopItems.find(i => i.id === artifactId) || activeArtifacts.find(i => i.id === artifactId);
    if (!item) return;

    const existingIdx = artifacts.findIndex(a => a.id === artifactId);
    const level = existingIdx !== -1 ? artifacts[existingIdx].level : 0;
    const cost = item.basePrice * (level + 1);

    if (gold >= cost) {
      if (get().settings.haptics) Native.vibrate(20);
      const newArtifacts = [...artifacts];
      if (existingIdx !== -1) {
        newArtifacts[existingIdx] = { ...newArtifacts[existingIdx], level: level + 1 };
        get().addLog(`Merchant: Enhanced ${item.name} to Level ${level + 1}!`);
      } else {
        newArtifacts.push({ ...item, level: 1 });
        get().addLog(`Merchant: Purchased ${item.name}!`);
      }

      set({
        gold: gold - cost,
        artifacts: newArtifacts,
        runStats: { ...get().runStats, totalCoinsSpent: get().runStats.totalCoinsSpent + cost }
      });
      PackEngine.onPurchase(get(), artifactId, level + 1);
    }
  },

  rollD20: async () => {
    const { isRolling, playerClass } = get();
    if (isRolling) return;

    set({ isRolling: true });
    if (get().settings.haptics) Native.vibrate(100);

    await new Promise(r => setTimeout(r, 800));

    const rawRoll = get().d20Override !== null ? get().d20Override as number : Math.floor(SeededRNG.random() * 20) + 1;
    set({ d20Override: null });
    
    // Call PackEngine to get modifiers
    const { val: finalRollVal, trace } = PackEngine.onD20(get(), rawRoll);

    let mod = playerClass?.d20Mod || 0;
    if (typeof mod !== 'number' || isNaN(mod)) mod = 0;
    
    // Total roll including class mod
    const totalRoll = finalRollVal + mod;

    let result: ExtendedGameStoreState['lastRoll'] = { 
      rawVal: rawRoll,
      finalVal: totalRoll,
      modifiers: trace,
      msg: '', 
      type: 'success' 
    };

    if (mod !== 0) {
      result.modifiers.push({ label: 'Class Bonus', val: mod, id: 'class_bonus', type: 'add' });
    }

    if (totalRoll >= 20) {
      SFX.crit();
      result = { ...result, msg: 'NATURAL 20! Critical Hit!', type: 'crit' };
      set((s) => ({ multiplier: s.multiplier + 1.0, runStats: { ...s.runStats, maxMultiplier: Math.max(s.runStats.maxMultiplier, s.multiplier + 1.0) } }));
      const validIndices = get().grid.map((c, i) => (c && c.val > 0 ? i : null)).filter((c): c is number => c !== null);
      if (validIndices.length > 0) {
        const idx = validIndices[Math.floor(SeededRNG.random() * validIndices.length)];
        const newGrid = [...get().grid];
        if (newGrid[idx]) newGrid[idx] = { ...newGrid[idx]!, val: newGrid[idx]!.val * 2, pop: true };
        set({ grid: newGrid });
      }
    } else if (totalRoll >= 15) {
      result = { ...result, msg: 'GREAT SUCCESS! Magic Staff spawned.', type: 'success' };
      get().spawnRandomTile(32);
    } else if (totalRoll >= 10) {
      result = { ...result, msg: 'SUCCESS! Crossbow spawned.', type: 'success' };
      get().spawnRandomTile(8);
    } else if (totalRoll > 1) {
      SFX.fail();
      result = { ...result, msg: 'MISS! A Slime blocked your path.', type: 'fail' };
      get().spawnRandomTile(-1);
    } else {
      SFX.fail();
      result = { ...result, msg: 'CRITICAL FAILURE! Necromancy rising.', type: 'fail' };
      get().spawnRandomTile(-3);
      get().spawnRandomTile(-3);
      get().spawnRandomTile(-3);
      
      let maxV = 0, maxI = -1;
      get().grid.forEach((c, i) => { if (c && c.val > maxV) { maxV = c.val; maxI = i; } });
      if (maxI !== -1) {
        const newGrid = [...get().grid];
        newGrid[maxI] = null;
        set({ grid: newGrid });
      }
    }

    get().addLog(`D20 Roll: ${rawRoll} -> ${totalRoll} (${result.type})`);
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
    if (get().settings.haptics) Native.vibrate(100);

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
      const dmgObj = { val: spellRoll.sum * multiplier };
      PackEngine.onCast(get(), dmgObj);
      const dmg = dmgObj.val;

      set({ 
        monsterHp: Math.max(0, monsterHp - dmg),
        runStats: {
          ...get().runStats,
          spellDamageDealt: get().runStats.spellDamageDealt + dmg
        }
      });
      get().addLog(`Spell: ${ab.name} dealt ${Math.ceil(dmg)} damage!`);
      get().triggerScreenShake(2.0);
    } else if (ab.type === 'heal') {
      const heal = spellRoll.sum;
      PackEngine.onCast(get(), { val: 0 }); // Trigger scripts even for heals
      set({ slidesLeft: slidesLeft + heal });
      get().addLog(`Spell: ${ab.name} restored ${heal} slides!`);
    }

    set({ gameState: 'PLAYING', spellRoll: null });
    
    if (get().monsterHp <= 0) {
      get().addLog("BOSS DEFEATED! Gold +50.");
      set({ isTransitioning: true, gold: get().gold + 50 });
      
      // Trigger SFX immediately with the UI splash
      if (get().encounterIdx >= get().activeEncounters.length - 1) {
        SFX.victory();
      } else {
        SFX.encounterWin();
      }

      if (get().encounterIdx >= get().activeEncounters.length - 1) {
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
    }

    get().saveGame();
  },

  cancelSpell: () => {
    set({ gameState: 'PLAYING', spellRoll: null });
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

  resetGame: () => {
    GameStorage.clearSave();
    set((state) => ({ 
      ...INITIAL_STATE, 
      activeEncounters: state.activeEncounters,
      activeClasses: state.activeClasses,
      activeArtifacts: state.activeArtifacts,
      shopItems: [], 
      slidesSinceRoll: 0, 
      lastRoll: null, 
      usesLeft: 0, 
      spellRoll: null, 
      lastDirection: null,
      hunterMarkLeft: 0,
      hasSave: false,
      runStats: { ...DEFAULT_RUN_STATS, activePackIds: state.runStats.activePackIds } 
    }));
  },

  loadGame: async () => {
    const saved = await GameStorage.loadGame();
    if (saved) {
      if (saved.rngState !== undefined) SeededRNG.setSeedState(saved.rngState);
      
      // Legacy Parity: If saved in PLAYING with 0 hp, promote to TAVERN/VICTORY
      if (saved.gameState === 'PLAYING' && saved.monsterHp <= 0) {
        if (saved.encounterIdx >= (saved.activeEncounters?.length || 0) - 1) {
          saved.gameState = 'VICTORY';
          saved.isGameOver = true;
        } else {
          saved.gameState = 'TAVERN';
          saved.gold = (saved.gold || 0) + 20;
        }
      }

      set({ 
        ...saved, 
        isTransitioning: false, 
        isGameOver: saved.gameState === 'GAME_OVER' || saved.gameState === 'VICTORY', 
        isRolling: false, 
        lastRoll: null, 
        spellRoll: null,
        hasSave: true 
      });
      await get().initializeRegistry();

      // If we resumed in Tavern and it's empty, regenerate it
      if (get().gameState === 'TAVERN' && (!get().shopItems || get().shopItems.length === 0)) {
        get().generateShop();
        get().saveGame();
      }

      return true;
    }
    return false;
  },

  saveGame: async () => {
    const state = get();
    // Only save if we are in a resumable state or it's a significant update
    const persistentData = {
      gameState: state.gameState,
      grid: state.grid,
      encounterIdx: state.encounterIdx,
      monsterHp: state.monsterHp,
      monsterMaxHp: state.monsterMaxHp,
      slidesLeft: state.slidesLeft,
      gold: state.gold,
      multiplier: state.multiplier,
      score: state.score,
      playerClass: state.playerClass,
      artifacts: state.artifacts,
      logs: state.logs,
      runStats: state.runStats,
      slidesSinceRoll: state.slidesSinceRoll,
      usesLeft: state.usesLeft,
      lastDirection: state.lastDirection,
      hunterMarkLeft: state.hunterMarkLeft,
      settings: state.settings,
      rngState: SeededRNG.getSeed(),
      activeEncounters: state.activeEncounters,
      activeClasses: state.activeClasses,
      activeArtifacts: state.activeArtifacts,
      shopItems: state.shopItems,
    };
    await GameStorage.saveGame(persistentData);
    
    // Update hasSave flag
    const resumable = state.gameState !== 'START' && !state.isGameOver;
    set({ hasSave: resumable });
  },
}));

if (typeof window !== 'undefined') {
  (window as any).useGameStore = useGameStore;
}
