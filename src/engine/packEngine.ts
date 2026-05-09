import { GameStorage } from './storage';
import { SeededRNG } from './prng';
import { MASTER_ARTIFACTS, ENEMIES, CLASSES } from './data';
import {
  CRIT2048_DEFAULT_MEGA_PACK, 
  CRIT2048_DEFAULT_MONSTERS_PACK, 
  CRIT2048_DEFAULT_HEROES_PACK, 
  CRIT2048_DEFAULT_ARTIFACTS_PACK, 
  CRIT2048_DEFAULT_ARSENAL_PACK, 
  CRIT2048_DEFAULT_HAZARDS_PACK,
  CRIT2048_DEFAULT_THEMES_PACK,
  CRIT2048_SHADOWFELL_THEMES_PACK
} from '../engine_core/packs';
import { SFX } from './audio';
import type { PackData, PackEntry } from '../types/pack';
import { useRegistry } from './registryHub';

/**
 * PACK ENGINE — Core Content Pack runtime.
 * Ported from legacy codebase to TypeScript.
 */

// --- Types ---
export interface GameAPI {
  slides: number;
  enemy: {
    hp: number;
    maxHp: number;
    healHp: (n: number) => void;
    dealDamage: (n: number) => void;
  };
  player: {
    gold: number;
    multiplier: number;
    classId: string;
    addGold: (n: number) => void;
    drainSlides: (n: number) => void;
    addSlides: (n: number) => void;
    addMultiplier: (n: number) => void;
  };
  spawnHazard: (id: string | number) => void;
  destroyWeapon: (criteria: 'weakest' | 'best' | 'random') => void;
  degradeWeapon: (criteria: 'best' | 'random') => void;
  shuffleTiles: () => void;
  getArtifact: (id: string) => number;
  addSpellUses: (n: number) => void;
  setHunterMark: (n: number) => void;
  grid: (any | null)[];
  clearTile: (idx: number) => void;
  setTile: (idx: number, val: number) => void;
  log: (msg: string) => void;
  shake: () => void;
  prng: () => number;
  prngInt: (min: number, max: number) => number;
  injectCss: (id: string, css: string) => void;
  removeCss: (id: string) => void;
  sfx: (name: string) => void;
  utils: {
    wait: (ms: number) => Promise<void>;
    onInterval: (cb: () => void, ms: number) => any;
  };
  triggerFX: (name: string, params?: any) => void;
  fx: {
    fireball: (x?: number, y?: number, color?: string) => void;
    smite: (x?: number, y?: number, color?: string) => void;
    lightning: (x?: number, y?: number, color?: string) => void;
    curse: (x?: number, y?: number, color?: string) => void;
    heal: (x?: number, y?: number) => void;
    poison: (x?: number, y?: number) => void;
    projectile: (x: number, y: number, dir: string, icon: string, color?: string) => void;
    flash: (color?: string) => void;
    stomp: (icon: string, name?: string) => void;
    announce: (text: string, icon?: string) => void;
  };
  onTavernLeave: (state: any) => void;
  onGameOver: (state: any, reason: 'VICTORY' | 'GRIDLOCK' | 'OUT_OF_SLIDES' | 'FORFEIT' | 'SURRENDER') => void;
  packState: Record<string, any>;
  [key: string]: any;
}

const BUILTIN_HAZARDS: Record<string, number> = { slime: -1, goblin: -2, skeleton: -3, mimic: -4, web: -5, curse: -6, spore: -7 };

const BLOCKED_KEYWORDS = ['window.', 'document.', 'fetch(', 'XMLHttpRequest', 'import(', 'eval(', 'Function('];

export class PackEngine {
  private static baseEncounters: any[] = [];
  private static baseClasses: any[] = [];
  private static baseArtifacts: any[] = [];

  private static weaponOverrides: Record<number, any> = {};
  private static hazardOverrides: Record<number, any> = {};
  private static customHazards: Record<string, any> = {};
  private static activeSkin: any = null;
  private static runState: Record<string, any> = {};

  /**
   * Initialize Registry by snapshotting baseline data.
   */
  static init() {
    if (this.baseEncounters.length === 0) {
      this.baseEncounters = [...ENEMIES];
      this.baseClasses = [...CLASSES];
      this.baseArtifacts = [...MASTER_ARTIFACTS];
    }
  }

  /**
   * Apply all active packs to the runtime registry.
   */
  static async applyPacks(activePackIds: string[] = []) {
    this.init();

    // Reset to baseline
    const encounters = [...this.baseEncounters];
    const classes = [...this.baseClasses];
    const artifacts = [...this.baseArtifacts];
    
    this.weaponOverrides = {};
    this.hazardOverrides = {};
    this.customHazards = {};
    const dbPacks = await GameStorage.getPackIndex();
    const defaultIds = [
      'crit2048-default',
      'crit2048-default-monsters',
      'crit2048-default-heroes',
      'crit2048-default-artifacts',
      'crit2048-default-arsenal',
      'crit2048-default-hazards'
    ];

    // Merge DB index with default IDs (avoiding duplicates)
    const allPacks = [...dbPacks];
    defaultIds.forEach(id => {
      if (!allPacks.find(p => p.id === id)) {
        allPacks.push({ id, name: id, version: '1.0.0', type: 'mega', icon: '📦', author: 'denzven' });
      }
    });
    
    const packsToApply = allPacks.filter(p => {
      if (p.id.startsWith('crit2048-default')) return true;
      return activePackIds.includes(p.id);
    });

    // Sort to ensure default packs apply first (so custom packs can override them)
    packsToApply.sort((a, b) => {
      if (a.id.startsWith('crit2048-default')) return -1;
      if (b.id.startsWith('crit2048-default')) return 1;
      return 0;
    });

    const registry = useRegistry.getState();
    registry.clear();

    // 1. Load Base Game (Mod Priority 0)
    await registry.loadBaseGame();

    for (const entry of packsToApply) {
      let pack = await GameStorage.loadPack(entry.id);

      if (!pack) {
        if (entry.id === 'crit2048-default') pack = CRIT2048_DEFAULT_MEGA_PACK;
        else if (entry.id === 'crit2048-default-monsters') pack = CRIT2048_DEFAULT_MONSTERS_PACK;
        else if (entry.id === 'crit2048-default-heroes') pack = CRIT2048_DEFAULT_HEROES_PACK;
        else if (entry.id === 'crit2048-default-artifacts') pack = CRIT2048_DEFAULT_ARTIFACTS_PACK;
        else if (entry.id === 'crit2048-default-arsenal') pack = CRIT2048_DEFAULT_ARSENAL_PACK;
        else if (entry.id === 'crit2048-default-hazards') pack = CRIT2048_DEFAULT_HAZARDS_PACK;
        else if (entry.id === 'crit2048-default-themes') pack = CRIT2048_DEFAULT_THEMES_PACK;
        else if (entry.id === 'crit2048-shadowfell-themes') pack = CRIT2048_SHADOWFELL_THEMES_PACK;
      }

      if (!pack) continue;

      const strategy = pack.loadStrategy || (pack.type === 'mega' ? 'replace' : 'append');

      if (strategy === 'replace') {
        // Clear categories if we are replacing
        if (pack.monsters?.length) useRegistry.setState({ monsters: {} });
        if (pack.heroes?.length) useRegistry.setState({ heroes: {} });
        if (pack.artifacts?.length) useRegistry.setState({ artifacts: {} });
        if (pack.arsenal?.length) useRegistry.setState({ arsenal: {} });
      }

      // Register Pack Content into Registry Hub (always append now as we cleared above if needed)
      pack.monsters?.forEach(e => registry.registerMonster(e));
      pack.heroes?.forEach(c => registry.registerHero(c));
      pack.artifacts?.forEach(a => registry.registerArtifact(a));
      pack.arsenal?.forEach(w => registry.registerArsenal(w));

      if (pack.themes) {
        this.activeSkin = pack.themes;
      }
    }

    if (this.activeSkin) {
      this.applySkin(this.activeSkin);
    } else {
      this.resetSkin();
    }

    return { 
      encounters: Object.values(registry.monsters), 
      classes: Object.values(registry.heroes), 
      artifacts: Object.values(registry.artifacts) 
    };
  }

  /**
   * Skin System
   */
  static applySkin(skin: any) {
    if (!skin) return;
    const root = document.documentElement.style;
    
    if (skin.cssVars) {
      Object.entries(skin.cssVars).forEach(([k, v]: [string, any]) => root.setProperty(k, v));
    }
    
    if (skin.primaryColor) root.setProperty('--pack-primary', skin.primaryColor);
    if (skin.accentColor)  root.setProperty('--pack-accent', skin.accentColor);
    if (skin.bgColor)      root.setProperty('--pack-bg', skin.bgColor);
    if (skin.bgImage)      root.setProperty('--pack-bg-image', `url('${skin.bgImage}')`);
    if (skin.fontFamily)   root.setProperty('--pack-font', skin.fontFamily);
    
    if (skin.customCss) {
      let style = document.getElementById('pack-css-skin');
      if (!style) {
        style = document.createElement('style');
        style.id = 'pack-css-skin';
        document.head.appendChild(style);
      }
      style.textContent = skin.customCss;
    }
  }

  static resetSkin() {
    const root = document.documentElement.style;
    const vars = ['--pack-primary', '--pack-accent', '--pack-bg', '--pack-bg-image', '--pack-font'];
    vars.forEach(v => root.removeProperty(v));
    document.getElementById('pack-css-skin')?.remove();
  }

  /**
   * Action Queue Executor (Rule of Zero)
   */
  private static executeActionQueue(actionsOrString: any, state: any, G: GameAPI, extraArgs: any = {}) {
    if (!actionsOrString) return;

    let actions = actionsOrString;
    if (typeof actionsOrString === 'string') {
      const presets = useRegistry.getState().presets || {};
      actions = presets[actionsOrString]?.actions || [];
    }

    if (!Array.isArray(actions)) return;

    actions.forEach(action => {
      // Evaluate optional condition
      if (action.condition) {
        try {
          const context = { state, G, ...extraArgs };
          const keys = Object.keys(context);
          const vals = Object.values(context);
          // eslint-disable-next-line no-new-func
          const fn = new Function(...keys, `"use strict";\nreturn ${action.condition};`);
          if (!fn(...vals)) return;
        } catch (e) {
          console.error("PackEngine Action Condition Error:", action.condition, e);
          return;
        }
      }

      const store = (window as any).useGameStore?.getState();
      if (!store) return;

      const p = action.amount || 0;
      switch (action.type) {
        case 'spawn_hazard':    G.spawnHazard(p); break;
        case 'regen':           if (action.target === 'player') { store.setMonsterHp?.(Math.min(state.monsterMaxHp, state.monsterHp + p)); } break;
        case 'tile_shuffle':    G.shuffleTiles(); break;
        case 'weapon_degrade':  G.degradeWeapon(action.stringParam || 'best'); break;
        case 'weapon_destroy':  G.destroyWeapon(action.stringParam || 'best'); break;
        case 'drain_slides':    store.restoreSlides?.(-Math.abs(p)); break;
        case 'add_gold':        store.addGold?.(p); break;
        case 'add_multiplier':  store.addMultiplier?.(p); break;
        case 'deal_damage':     if (action.target === 'player') store.applyDamage?.(p); else G.enemy.dealDamage(p); break;
        case 'log':             if (action.stringParam) G.log(action.stringParam.replace('${amount}', p.toString())); break;
      }
    });
  }

  /**
   * Sandboxed Script Execution
   */
  static runScript(scriptStr: string, state: any, extraArgs: Record<string, any> = {}) {
    if (!scriptStr) return;

    if (BLOCKED_KEYWORDS.some(kw => scriptStr.includes(kw))) {
      console.warn('PackEngine: Blocked keyword in script execution denied.');
      return;
    }

    try {
      const G = this.buildGameAPI(state);
      const args = { G, ...extraArgs };
      const keys = Object.keys(args);
      const vals = Object.values(args);

      // eslint-disable-next-line no-new-func
      const fn = new Function(...keys, `"use strict";\n${scriptStr}`);
      fn(...vals);
    } catch (e) {
      console.error('PackEngine Script Error:', e);
    }
  }

  /**
   * Event Dispatchers
   */

  static onSlide(state: any, direction: string) {
    this.applyArtifactHooks(state, 'onSlide', { dir: direction });
    const enemy = state.activeEncounters[state.encounterIdx];
    if (!enemy || enemy.mode === 'builtin') return;

    const G = this.buildGameAPI(state);

    // Advanced Scripts
    if (enemy.scripts?.onSlide || enemy.script?.onSlide) {
      this.runScript(enemy.scripts?.onSlide || enemy.script.onSlide, state, { dir: direction });
    }

    // Action Queue
    if (enemy.passiveTriggers?.onSlide) {
      this.executeActionQueue(enemy.passiveTriggers.onSlide, state, G, { dir: direction });
    }
  }

  static onTavern(state: any) {
    this.applyArtifactHooks(state, 'onTavern', {});
  }

  static onPurchase(state: any, artifactId: string, level: number) {
    const art = state.activeArtifacts.find((a: any) => a.id === artifactId);
    if (!art) return;
    const G = this.buildGameAPI(state);
    if (art.scripts?.onPurchase) {
      this.runScript(art.scripts.onPurchase, state, { lvl: level });
    }
    if (art.passiveTriggers?.onPurchase) {
      this.executeActionQueue(art.passiveTriggers.onPurchase, state, G, { lvl: level });
    }
  }

  static onTavernLeave(state: any) {
    this.applyArtifactHooks(state, 'onTavernLeave', {});
    const cls = state.playerClass;
    if (cls && cls.scripts?.onTavernLeave) {
      this.runScript(cls.scripts.onTavernLeave, state, {});
    }
  }

  static onGameOver(state: any, reason: 'VICTORY' | 'GRIDLOCK' | 'OUT_OF_SLIDES' | 'FORFEIT' | 'SURRENDER') {
    this.applyArtifactHooks(state, 'onGameOver', { reason });
    const cls = state.playerClass;
    if (cls && cls.scripts?.onGameOver) {
      this.runScript(cls.scripts.onGameOver, state, { reason });
    }
  }

  static onEncounterStart(state: any) {
    this.applyArtifactHooks(state, 'onEncounterStart', {});
    const enemy = state.activeEncounters[state.encounterIdx];
    if (!enemy) return;

    const G = this.buildGameAPI(state);

    if (enemy.scripts?.onEncounterStart || enemy.script?.onEncounterStart) {
      this.runScript(enemy.scripts?.onEncounterStart || enemy.script.onEncounterStart, state, {});
    }

    if (enemy.passiveTriggers?.onEncounterStart) {
      this.executeActionQueue(enemy.passiveTriggers.onEncounterStart, state, G, {});
    }
  }

  static onMerge(state: any, newVal: number, pos: number, dir: string) {
    const r = Math.floor(pos / 4);
    const c = pos % 4;
    const x = c * 25 + 12.5;
    const y = r * 25 + 12.5;
    this.applyArtifactHooks(state, 'onMerge', { val: newVal, pos, x, y, dir });
    const enemy = state.activeEncounters[state.encounterIdx];
    const G = this.buildGameAPI(state);

    if (enemy && (enemy.scripts?.onMerge || enemy.script?.onMerge)) {
      this.runScript(enemy.scripts?.onMerge || enemy.script.onMerge, state, { val: newVal, pos, x, y, dir });
    }
    
    if (enemy?.passiveTriggers?.onMerge) {
      this.executeActionQueue(enemy.passiveTriggers.onMerge, state, G, { val: newVal, pos, x, y, dir });
    }

    // Class passive
    const cls = state.playerClass;
    if (cls && cls.passiveTriggers?.onMerge) {
      this.executeActionQueue(cls.passiveTriggers.onMerge, state, G, { val: newVal, pos, x, y, dir });
    }
  }

  static onDamage(state: any, dmg: number) {
    const dmgObj = { val: dmg };
    this.applyArtifactHooks(state, 'onDamage', { dmg: dmgObj });
    const enemy = state.activeEncounters[state.encounterIdx];
    if (enemy && enemy.mode === 'advanced' && enemy.script?.onDamage) {
      this.runScript(enemy.script.onDamage, state, { dmg: dmgObj });
    }
  }

  static onCast(state: any, dmg: { val: number }) {
    const cls = state.playerClass;
    if (cls && cls.scripts?.onCast) {
      this.runScript(cls.scripts.onCast, state, { dmg });
    }
  }

  static onD20(state: any, roll: number): { val: number, trace: { label: string, val: number, id: string, type: 'add' | 'multiply' | 'set' }[] } {
    let currentRoll = roll;
    const trace: { label: string, val: number, id: string, type: 'add' | 'multiply' | 'set' }[] = [];
    
    // Class hook
    const cls = state.playerClass;
    if (cls && cls.scripts?.onD20) {
      const rollObj = { val: currentRoll };
      this.runScript(cls.scripts.onD20, state, { roll: rollObj });
      if (rollObj.val !== currentRoll) {
        trace.push({ label: cls.name, val: rollObj.val, id: cls.id, type: 'set' });
        currentRoll = rollObj.val;
      }
    }

    if (state.artifacts) {
      state.artifacts.forEach((art: any) => {
        const def = state.activeArtifacts.find((a: any) => a.id.toUpperCase() === art.id.toUpperCase());
        console.log(`[PackEngine] Checking artifact ${art.id}`, { found: !!def, hasScript: !!def?.scripts?.onD20 });
        if (def && def.scripts?.onD20) {
          const rollObj = { val: currentRoll };
          console.log(`[PackEngine] Running script for ${def.id} on roll ${currentRoll}`);
          this.runScript(def.scripts.onD20, state, { roll: rollObj, lvl: art.level });
          if (rollObj.val !== currentRoll) {
            trace.push({ label: def.name, val: rollObj.val, id: def.id, type: 'set' });
            currentRoll = rollObj.val;
          }
        }
      });
    }
    return { val: currentRoll, trace };
  }

  static calculateMergeDamage(state: any, baseDmg: number, direction: string, newVal: number): number {
    let finalDmg = baseDmg;
    if (state.artifacts) {
      state.artifacts.forEach((art: any) => {
        const def = state.activeArtifacts.find((a: any) => a.id === art.id);
        if (def && def.scripts?.onMergeDamage) {
          const dmgObj = { val: finalDmg };
          this.runScript(def.scripts.onMergeDamage, state, { dmg: dmgObj, lvl: art.level, dir: direction, val: newVal });
          finalDmg = dmgObj.val;
        }
      });
    }
    return finalDmg;
  }

  private static applyArtifactHooks(state: any, hookName: string, extraArgs: any) {
    if (!state.artifacts) return;
    const G = this.buildGameAPI(state);
    state.artifacts.forEach((art: any) => {
      const def = (state.activeArtifacts || []).find((a: any) => a.id === art.id);
      if (!def) {
        console.warn('PackEngine: Definition for artifact not found in activeArtifacts:', art.id);
        return;
      }

      if (def.scripts?.[hookName]) {
        this.runScript(def.scripts[hookName], state, { lvl: art.level, ...extraArgs });
      }
      
      if (def.passiveTriggers?.[hookName]) {
        this.executeActionQueue(def.passiveTriggers[hookName], state, G, { lvl: art.level, ...extraArgs });
      }
    });
  }

  private static buildGameAPI(state: any): GameAPI {
    const storeObj = (window as any).useGameStore;
    if (!storeObj) {
        console.warn('PackEngine: useGameStore not found on window!');
        return { log: (m: any) => console.log(m), prng: () => Math.random() } as any;
    }
    const store = storeObj.getState();
    return {
      state: state,
      slides: state.slidesLeft,
      enemy: {
        hp: state.monsterHp,
        maxHp: state.monsterMaxHp,
        healHp: (n) => { store.setMonsterHp?.(Math.min(state.monsterMaxHp, state.monsterHp + n)); },
        dealDamage: (n) => { store.applyDamage?.(n); },
      },
      player: {
        gold: state.gold,
        multiplier: state.multiplier,
        classId: state.playerClass?.id || '',
        addGold: (n) => { store.addGold?.(n); },
        drainSlides: (n) => { store.restoreSlides?.(-n); },
        addSlides: (n) => { store.restoreSlides?.(n); },
        addMultiplier: (n) => { store.addMultiplier?.(n); },
      },
      spawnHazard: (id) => { 
        const val = typeof id === 'string' ? parseInt(id) : id;
        store.spawnRandomTile?.(val); 
      },
      destroyWeapon: (criteria) => {
        const grid = [...state.grid];
        const validIndices = grid.map((t, i) => (t && t.val > 0 ? i : null)).filter((i): i is number => i !== null);
        if (validIndices.length === 0) return;

        let targetIdx = validIndices[0];
        if (criteria === 'random') {
          targetIdx = validIndices[Math.floor(SeededRNG.random() * validIndices.length)];
        } else if (criteria === 'weakest') {
          targetIdx = validIndices.reduce((min, i) => (grid[i]!.val < grid[min]!.val ? i : min), validIndices[0]);
        } else if (criteria === 'best') {
          targetIdx = validIndices.reduce((max, i) => (grid[i]!.val > grid[max]!.val ? i : max), validIndices[0]);
        }

        grid[targetIdx] = null;
        store.setState({ grid });
      },
      degradeWeapon: (criteria) => {
        const grid = [...state.grid];
        const validIndices = grid.map((t, i) => (t && t.val > 2 ? i : null)).filter((i): i is number => i !== null);
        if (validIndices.length === 0) return;

        let targetIdx = validIndices[0];
        if (criteria === 'random') {
          targetIdx = validIndices[Math.floor(SeededRNG.random() * validIndices.length)];
        } else if (criteria === 'best') {
          targetIdx = validIndices.reduce((max, i) => (grid[i]!.val > grid[max]!.val ? i : max), validIndices[0]);
        }

        if (grid[targetIdx]) {
          grid[targetIdx] = { ...grid[targetIdx], val: Math.max(2, grid[targetIdx].val / 2), pop: true };
          store.setState({ grid });
        }
      },
      shuffleTiles: () => {
        const grid = [...state.grid];
        const validIndices = grid.map((t, i) => (t ? i : null)).filter((i): i is number => i !== null);
        if (validIndices.length < 2) return;

        for (let i = 0; i < validIndices.length; i++) {
          const j = Math.floor(SeededRNG.random() * validIndices.length);
          const temp = grid[validIndices[i]];
          grid[validIndices[i]] = grid[validIndices[j]];
          grid[validIndices[j]] = temp;
        }
        store.setState({ grid });
      },
      grid: state.grid,
      clearTile: (idx) => { 
        const newGrid = [...state.grid];
        newGrid[idx] = null;
        store.setState({ grid: newGrid });
      },
      setTile: (idx, val) => {
        const newGrid = [...state.grid];
        newGrid[idx] = { id: Date.now() + SeededRNG.random(), val, pop: true };
        store.setState({ grid: newGrid });
      },
      log: (msg) => { store.addLog?.(msg); },
      shake: () => { store.triggerScreenShake?.(); },
      getArtifact: (id) => {
        const art = state.artifacts?.find((a: any) => a.id === id);
        return art ? art.level : 0;
      },
      addSpellUses: (n) => {
        store.setState?.({ usesLeft: (state.usesLeft || 0) + n });
      },
      setHunterMark: (n) => {
        store.setState?.({ hunterMarkLeft: n });
      },
      injectCss: (id, css) => {
        let el = document.getElementById(`pack-css-${id}`);
        if (!el) {
          el = document.createElement('style');
          el.id = `pack-css-${id}`;
          document.head.appendChild(el);
        }
        el.textContent = css;
      },
      removeCss: (id) => {
        document.getElementById(`pack-css-${id}`)?.remove();
      },
      sfx: (name) => (SFX as any)[name]?.(),
      utils: {
        wait: (ms) => new Promise(r => setTimeout(r, ms)),
        onInterval: (cb, ms) => setInterval(cb, ms),
      },
      onTavernLeave: () => { store.nextEncounter?.(); },
      onGameOver: (reason) => { store.endGame?.(reason); },
      triggerFX: (name, params) => { store.triggerFX?.(name, params); },
      fx: {
        fireball: (x = 50, y = 50, color = '#f97316') => {
          store.triggerFX?.('stomp', { icon: '🔥', name: 'FIREBALL' });
          store.triggerFX?.('flash', { color: `${color}40` });
          store.triggerFX?.('aoe', { x, y, color });
        },
        smite: (x = 50, y = 50, color = '#fde047') => {
          store.triggerFX?.('stomp', { icon: '⚡', name: 'SMITE' });
          store.triggerFX?.('flash', { color: `${color}40` });
          store.triggerFX?.('smite', { x, y, color });
        },
        lightning: (x = 50, y = 50, color = '#facc15') => {
          store.triggerFX?.('lightning', { x, y, color });
        },
        curse: (x = 50, y = 50, color = '#a855f7') => {
          store.triggerFX?.('swirl', { x, y, color, icon: '🌀' });
        },
        heal: (x = 50, y = 50) => {
          store.triggerFX?.('heal', { x, y });
        },
        poison: (x = 50, y = 50) => {
          store.triggerFX?.('poison', { x, y });
        },
        projectile: (x, y, dir, icon, color) => {
          store.triggerFX?.('projectile', { x, y, dir, icon, color });
        },
        flash: (color = 'white') => {
          store.triggerFX?.('flash', { color });
        },
        stomp: (icon, name) => {
          store.triggerFX?.('stomp', { icon, name });
        },
        announce: (text, icon = '📢') => {
          store.triggerFX?.('announce', { name: text, icon });
        }
      },
      packState: this.runState,
      prng: () => SeededRNG.random(),
      prngInt: (min, max) => SeededRNG.randomInt(min, max),
    };
  }

  static getWeaponStats(val: number) {
    return this.weaponOverrides[val] || null;
  }

  static getDamageReduction(state: any): number {
    const enemy = state.activeEncounters[state.encounterIdx];
    if (!enemy) return 0;
    
    if (enemy.mode === 'simple' && enemy.passiveAbility?.effect === 'damage_reduction') {
      return enemy.passiveAbility.effectParam || 0;
    }
    // Advanced mode can't easily return a value via async scripts in the middle of a loop,
    // so we stick to simple mode for % reduction or use onMergeDamage for artifacts.
    return 0;
  }

  static getHazardStats(val: number) {
    return this.hazardOverrides[val] || null;
  }

  /**
   * Installation Helpers
   */
  static async installPack(pack: PackData): Promise<{ success: boolean, errors: string[] }> {
    const validation = this.validatePack(pack);
    if (!validation.valid) return { success: false, errors: validation.errors };

    try {
      await GameStorage.savePack(pack);
      return { success: true, errors: [] };
    } catch (e) {
      return { success: false, errors: ['Failed to save to local storage.'] };
    }
  }

  static async removePack(id: string): Promise<boolean> {
    try {
      await GameStorage.deletePack(id);
      return true;
    } catch (e) {
      return false;
    }
  }

  static validatePack(pack: any): { valid: boolean, errors: string[] } {
    const errors: string[] = [];
    if (!pack.id) errors.push('Pack must have a unique ID.');
    if (!pack.name) errors.push('Pack must have a display name.');
    if (!pack.type) errors.push('Pack must specify a type (e.g. mega, dungeon).');
    
    // Check nested content
    if (pack.monsters) {
      pack.monsters.forEach((e: any, i: number) => {
        if (!e.id) errors.push(`Monster #${i+1} is missing an ID.`);
        if (!e.name) errors.push(`Monster #${i+1} is missing a name.`);
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Formats a description string with dynamic parameters based on level.
   * Supports placeholders like ${param}, ${lvl}, ${name}, and math like ${30 * lvl}.
   */
  static formatDesc(desc: string, entry: any, lvl: number = 1): string {
    if (!desc) return '';
    let d = desc;
    
    const baseParam = parseFloat(entry?.passiveParam || 0);
    
    // Replace complex expressions like ${30 * lvl}
    d = d.replace(/\${([^}]+)}/g, (match, expr) => {
      const trimmed = expr.trim();
      if (trimmed === 'lvl') return lvl.toString();
      if (trimmed === 'name') return entry?.name || '';
      if (trimmed === 'param') return (baseParam * lvl).toString();
      
      // Attempt to evaluate math if it contains lvl or numbers
      try {
        if (/^[0-9+\-*/().\s|lvl|toFixed]+$/.test(trimmed)) {
          // Replace 'lvl' with the actual value and evaluate
          const context = { lvl };
          // eslint-disable-next-line no-new-func
          const fn = new Function('lvl', `return ${trimmed}`);
          let res = fn(lvl);
          if (typeof res === 'number') {
            // Round to 1 decimal place if it's a float
            return Number.isInteger(res) ? res.toString() : res.toFixed(1);
          }
          return res.toString();
        }
      } catch (e) {
        console.warn('PackEngine: Failed to evaluate desc expression:', trimmed, e);
      }
      return match;
    });
    
    return d;
  }
}
