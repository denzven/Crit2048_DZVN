import { GameStorage } from './storage';
import { SeededRNG } from './prng';
import { MASTER_ARTIFACTS, ENEMIES, CLASSES } from './data';
import { 
  CRIT2048_DEFAULT_PACK, 
  CRIT2048_DEFAULT_ENEMIES_PACK, 
  CRIT2048_DEFAULT_CLASSES_PACK, 
  CRIT2048_DEFAULT_ARTIFACTS_PACK, 
  CRIT2048_DEFAULT_WEAPONS_PACK, 
  CRIT2048_DEFAULT_HAZARDS_PACK,
  CRIT2048_DEFAULT_SKIN_PACK,
  CRIT2048_SHADOWFELL_SKIN_PACK
} from './defaultPacks';
import { SFX } from './audio';
import type { PackData, PackEntry } from '../types/pack';

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
  onTavernLeave: (state: any) => void;
  onGameOver: (state: any, reason: 'VICTORY' | 'GRIDLOCK' | 'SURRENDER') => void;
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
      'crit2048-default-enemies',
      'crit2048-default-classes',
      'crit2048-default-artifacts',
      'crit2048-default-weapons',
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

    for (const entry of packsToApply) {
      let pack = await GameStorage.loadPack(entry.id);

      if (!pack) {
        if (entry.id === 'crit2048-default') pack = CRIT2048_DEFAULT_PACK;
        else if (entry.id === 'crit2048-default-enemies') pack = CRIT2048_DEFAULT_ENEMIES_PACK;
        else if (entry.id === 'crit2048-default-classes') pack = CRIT2048_DEFAULT_CLASSES_PACK;
        else if (entry.id === 'crit2048-default-artifacts') pack = CRIT2048_DEFAULT_ARTIFACTS_PACK;
        else if (entry.id === 'crit2048-default-weapons') pack = CRIT2048_DEFAULT_WEAPONS_PACK;
        else if (entry.id === 'crit2048-default-hazards') pack = CRIT2048_DEFAULT_HAZARDS_PACK;
        else if (entry.id === 'crit2048-default-skin') pack = CRIT2048_DEFAULT_SKIN_PACK;
        else if (entry.id === 'crit2048-shadowfell-skin') pack = CRIT2048_SHADOWFELL_SKIN_PACK;
      }

      if (!pack) continue;

      const strategy = pack.loadStrategy || (pack.type === 'mega' ? 'replace' : 'append');

      if (strategy === 'replace') {
        if (pack.enemies?.length) encounters.length = 0;
        if (pack.classes?.length) classes.length = 0;
        if (pack.artifacts?.length) artifacts.length = 0;
      }

      // Merge Enemies
      pack.enemies?.forEach(e => {
        const idx = encounters.findIndex(orig => orig.id === e.id);
        if (idx >= 0) encounters[idx] = { ...e };
        else encounters.push({ ...e });
      });

      // Merge Classes
      pack.classes?.forEach(c => {
        const idx = classes.findIndex(orig => orig.id === c.id);
        if (idx >= 0) classes[idx] = { ...c };
        else classes.push({ ...c });
      });

      // Merge Artifacts
      pack.artifacts?.forEach(a => {
        const idx = artifacts.findIndex(orig => orig.id === a.id);
        if (idx >= 0) artifacts[idx] = { ...a };
        else artifacts.push({ ...a });
      });

      if (pack.skin) {
        this.activeSkin = pack.skin;
      }
    }

    if (this.activeSkin) {
      this.applySkin(this.activeSkin);
    } else {
      this.resetSkin();
    }

    return { encounters, classes, artifacts };
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
   * Simple Mode Logic
   */
  private static checkTrigger(ability: any, state: any): boolean {
    const n = ability.triggerParam || 10;
    switch (ability.trigger) {
      case 'every_n_slides':   return state.runStats.totalMoves > 0 && state.runStats.totalMoves % n === 0;
      case 'on_hp_below':      return (state.monsterHp / state.monsterMaxHp) * 100 < n;
      case 'on_slide_start':   return true;
      default:                 return false;
    }
  }

  private static applyEffect(ability: any, state: any, G: GameAPI) {
    const p = ability.effectParam;
    const store = (window as any).useGameStore?.getState();
    if (!store) return;

    switch (ability.effect) {
      case 'spawn_hazard':    G.spawnHazard(p); break;
      case 'regen':           store.setMonsterHp?.(Math.min(state.monsterMaxHp, state.monsterHp + (p || 0))); break;
      case 'tile_shuffle':    G.shuffleTiles(); break;
      case 'weapon_degrade':  G.degradeWeapon(p || 'best'); break;
      case 'weapon_destroy':  G.destroyWeapon(p || 'best'); break;
      case 'drain_slides':    store.restoreSlides?.(-(p || 1)); break;
      case 'add_gold':        store.addGold?.(p || 0); break;
    }
    if (ability.logMessage) G.log(ability.logMessage.replace('${amount}', p || ''));
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

    if (enemy.mode === 'simple' && enemy.primaryAbility) {
      const G = this.buildGameAPI(state);
      if (this.checkTrigger(enemy.primaryAbility, state)) {
        this.applyEffect(enemy.primaryAbility, state, G);
      }
    } else if (enemy.mode === 'advanced' && enemy.script?.onSlide) {
      this.runScript(enemy.script.onSlide, state, { dir: direction });
    }
  }

  static onTavern(state: any) {
    this.applyArtifactHooks(state, 'onTavern', {});
  }

  static onTavernLeave(state: any) {
    this.applyArtifactHooks(state, 'onTavernLeave', {});
    const cls = state.playerClass;
    if (cls && cls.scripts?.onTavernLeave) {
      this.runScript(cls.scripts.onTavernLeave, state, {});
    }
  }

  static onGameOver(state: any, reason: 'VICTORY' | 'GRIDLOCK' | 'SURRENDER') {
    this.applyArtifactHooks(state, 'onGameOver', { reason });
    const cls = state.playerClass;
    if (cls && cls.scripts?.onGameOver) {
      this.runScript(cls.scripts.onGameOver, state, { reason });
    }
  }

  static onEncounterStart(state: any) {
    this.applyArtifactHooks(state, 'onEncounterStart', {});
    const enemy = state.activeEncounters[state.encounterIdx];
    if (enemy && enemy.mode === 'advanced' && enemy.script?.onEncounterStart) {
      this.runScript(enemy.script.onEncounterStart, state, {});
    }
  }

  static onMerge(state: any, newVal: number) {
    this.applyArtifactHooks(state, 'onMerge', { val: newVal });
    const enemy = state.activeEncounters[state.encounterIdx];
    if (enemy && enemy.mode === 'advanced' && enemy.script?.onMerge) {
      this.runScript(enemy.script.onMerge, state, { val: newVal });
    }

    // Class passive
    const cls = state.playerClass;
    if (cls && cls.passiveTrigger === 'on_merge') {
      this.dispatchSimpleEffect(cls, state);
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

  static onD20(state: any, roll: number): number {
    let currentRoll = roll;
    
    // Class hook
    const cls = state.playerClass;
    if (cls && cls.scripts?.onD20) {
      const rollObj = { val: currentRoll };
      this.runScript(cls.scripts.onD20, state, { roll: rollObj });
      currentRoll = rollObj.val;
    }

    if (state.artifacts) {
      state.artifacts.forEach((art: any) => {
        const def = state.activeArtifacts.find((a: any) => a.id === art.id);
        if (def && def.scripts?.onD20) {
          const rollObj = { val: currentRoll };
          this.runScript(def.scripts.onD20, state, { roll: rollObj, lvl: art.level });
          currentRoll = rollObj.val;
        }
      });
    }
    return currentRoll;
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
    state.artifacts.forEach((art: any) => {
      const def = state.activeArtifacts.find((a: any) => a.id === art.id);
      if (!def) return;

      if (def.mode === 'advanced' && def.scripts?.[hookName]) {
        this.runScript(def.scripts[hookName], state, { lvl: art.level, ...extraArgs });
      } else if (def.mode !== 'advanced' && def.passiveTrigger && def.passiveEffect) {
        // Handle simple mode artifact effects (mapping hook names to triggers)
        const hookToTrigger: Record<string, string> = {
          onSlide: 'on_slide',
          onMerge: 'on_merge',
          onD20: 'on_d20',
          onEncounterStart: 'on_encounter_start'
        };
        if (hookToTrigger[hookName] === def.passiveTrigger) {
          this.dispatchSimpleEffect(def, state, art.level);
        }
      }
    });
  }

  private static dispatchSimpleEffect(def: any, state: any, lvl = 1) {
    let p = parseFloat(def.passiveParam || 0);
    if (isNaN(p)) p = 0;
    p *= lvl;
    
    const store = (window as any).useGameStore?.getState();
    if (!store) return;
    switch (def.passiveEffect) {
      case 'restore_slides': store.restoreSlides?.(p); break;
      case 'add_gold': store.addGold?.(p); break;
      case 'add_multiplier': store.addMultiplier?.(p); break;
      case 'deal_damage': store.applyDamage?.(p); break;
    }
  }

  private static buildGameAPI(state: any): GameAPI {
    const storeObj = (window as any).useGameStore;
    if (!storeObj) {
        // Return dummy API to prevent crash
        return { log: (m: any) => console.log(m), prng: () => Math.random() } as any;
    }
    const store = storeObj.getState();
    return {
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
    if (pack.enemies) {
      pack.enemies.forEach((e: any, i: number) => {
        if (!e.id) errors.push(`Enemy #${i+1} is missing an ID.`);
        if (!e.name) errors.push(`Enemy #${i+1} is missing a name.`);
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
