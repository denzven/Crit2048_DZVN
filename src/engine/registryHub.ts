import { create } from 'zustand';
import { z } from 'zod';
import type { EnemyDef, ClassDef, ArtifactDef, WeaponDef, HazardDef, SkinDef } from '../types/pack';

// Static imports for base game data to ensure reliability
import monsterData from '../engine_core/base_game/data/monsters.json';
import classData from '../engine_core/base_game/data/classes.json';
import arsenalData from '../engine_core/base_game/data/arsenal.json';
import artifactData from '../engine_core/base_game/data/artifacts.json';
import uiDefsData from '../engine_core/base_game/data/ui_defs.json';

// --- SCHEMAS ---

export const ActionSchema = z.object({
  type: z.enum(['spawn_hazard', 'regen', 'tile_shuffle', 'modify_stat', 'log', 'weapon_degrade', 'weapon_destroy', 'drain_slides', 'add_gold', 'add_multiplier', 'deal_damage']),
  target: z.enum(['player', 'enemy', 'board', 'ui']).optional(),
  amount: z.number().optional(),
  stringParam: z.string().optional(),
  condition: z.string().optional()
});

export const ActionListSchema = z.union([z.string(), z.array(ActionSchema)]);

export const MonsterSchema = z.object({
  id: z.string(),
  parent: z.union([z.string(), z.array(z.string())]).default('base_monster'),
  name: z.string(),
  hp: z.number().positive(),
  slides: z.number().int(),
  icon: z.string(),
  mode: z.enum(['simple', 'advanced', 'builtin']).default('simple'),
  lore: z.string().optional(),
  script: z.record(z.string(), z.string()).optional(),
  primaryAbility: z.any().optional(),
  passiveAbility: z.any().optional(),
  passiveTriggers: z.record(z.string(), ActionListSchema).optional(),
});

export const HeroSchema = z.object({
  id: z.string(),
  parent: z.union([z.string(), z.array(z.string())]).default('base_hero'),
  name: z.string(),
  icon: z.string(),
  desc: z.string(),
  d20Mod: z.number().default(0),
  ability: z.any().optional(),
  passiveTriggers: z.record(z.string(), ActionListSchema).optional(),
  scripts: z.record(z.string(), z.string()).optional(),
});

export const ArtifactSchema = z.object({
  id: z.string(),
  parent: z.union([z.string(), z.array(z.string())]).default('base_artifact'),
  name: z.string(),
  icon: z.string(),
  rarity: z.string(),
  basePrice: z.number(),
  desc: z.string(),
  mode: z.enum(['simple', 'advanced']).optional(),
  passiveTrigger: z.string().optional(),
  passiveEffect: z.string().optional(),
  passiveParam: z.any().optional(),
  passiveTriggers: z.record(z.string(), ActionListSchema).optional(),
  scripts: z.record(z.string(), z.string()).optional(),
});

export const WeaponSchema = z.object({
  id: z.string(),
  parent: z.string().default('base_weapon'),
  name: z.string(),
  icon: z.string(),
  dmg: z.number(),
  bg: z.string().optional(),
  text: z.string().optional(),
});

// --- REGISTRY STORE ---

/** UI Definitions — loaded from ui_defs.json (Mod Priority 0). */
export interface UiDefs {
  packTypes: Record<string, { label: string; color: string; icon: string }>;
  contentTypes: Array<{ key: string; label: string; icon: string; color: string }>;
  hooks: Array<{ id: string; label: string; icon: string }>;
  d20Tiers: Array<{ min: number; max: number; type: string; label: string; sublabel: string; color: string; bgColor: string }>;
  tavernServices: Record<string, { label: string; icon: string; cost?: number; description: string; disabledReason?: string; emptyMessage?: string }>;
  hud: { slideDangerThreshold: number; slideCriticalThreshold: number; multiplierHighThreshold: number; multiplierRageThreshold: number; hpNearDeathPercent: number };
  rarityColors: Record<string, { text: string; border: string; bg: string; glow: string }>;
}

interface RegistryState {
  monsters: Record<string, EnemyDef>;
  heroes: Record<string, ClassDef>;
  artifacts: Record<string, ArtifactDef>;
  arsenal: Record<string, WeaponDef>;
  hazards: Record<string, HazardDef>;
  fates: any;
  presets: Record<string, any>;
  uiDefs: UiDefs | null;
  
  // Actions
  registerMonster: (def: any) => void;
  registerHero: (def: any) => void;
  registerArtifact: (def: any) => void;
  registerArsenal: (def: any) => void;
  loadPresets: () => Promise<void>;
  loadBaseGame: () => Promise<void>;
  deepMerge: (base: any, mod: any) => any;
  applyParents: (def: any, defaultParentId: string) => any;
  clear: () => void;
}

export const useRegistry = create<RegistryState>((set, get) => ({
  monsters: {},
  heroes: {},
  artifacts: {},
  arsenal: {},
  hazards: {},
  fates: {},
  presets: {},
  uiDefs: null,

  deepMerge: (base, mod) => {
    const result = { ...base };
    for (const key in mod) {
      if (Array.isArray(mod[key])) {
        result[key] = Array.isArray(base[key]) ? [...base[key], ...mod[key]] : [...mod[key]];
      } else if (mod[key] instanceof Object && key in base && !Array.isArray(base[key])) {
        result[key] = get().deepMerge(base[key], mod[key]);
      } else {
        result[key] = mod[key];
      }
    }
    return result;
  },
  
  applyParents: (def: any, defaultParentId: string) => {
    const parentIds = Array.isArray(def.parent) ? def.parent : (def.parent ? [def.parent] : [defaultParentId]);
    let merged = {};
    for (const pid of parentIds) {
      const preset = get().presets[pid]?.defaults || {};
      merged = get().deepMerge(merged, preset);
    }
    return get().deepMerge(merged, def);
  },

  registerMonster: (def) => {
    const merged = get().applyParents(def, 'base_monster');
    const validated = MonsterSchema.parse(merged);
    set((s) => ({ 
      monsters: { ...s.monsters, [validated.id]: validated as any } 
    }));
  },

  registerHero: (def) => {
    const merged = get().applyParents(def, 'base_hero');
    const validated = HeroSchema.parse(merged);
    set((s) => ({ 
      heroes: { ...s.heroes, [validated.id]: validated as any } 
    }));
  },

  registerArtifact: (def) => {
    const merged = get().applyParents(def, 'base_artifact');
    const validated = ArtifactSchema.parse(merged);
    set((s) => ({ 
      artifacts: { ...s.artifacts, [validated.id]: validated as any } 
    }));
  },

  registerArsenal: (def) => {
    const merged = get().applyParents(def, 'base_weapon');
    const validated = WeaponSchema.parse(merged);
    set((s) => ({ 
      arsenal: { ...s.arsenal, [validated.id]: validated as any } 
    }));
  },

  loadPresets: async () => {
    const presetFiles = import.meta.glob('../engine_core/presets/*.json');
    const presets: Record<string, any> = {};
    
    for (const path in presetFiles) {
      const module: any = await presetFiles[path]();
      const content = module.default || module;
      const id = content.id || module.id || path.split('/').pop()?.replace('.json', '');
      presets[id] = content;
    }
    
    set({ presets });
  },

  loadBaseGame: async () => {
    try {
      const mData = (monsterData as any).default || monsterData;
      const cData = (classData as any).default || classData;
      const arData = (arsenalData as any).default || arsenalData;
      const afData = (artifactData as any).default || artifactData;
      const uiData = (uiDefsData as any).default || uiDefsData;

      // Load UI Definitions (Mod Priority 0)
      if (uiData) set({ uiDefs: uiData as UiDefs });

      if (Array.isArray(mData)) {
        mData.forEach(m => {
          try { get().registerMonster(m); } catch (e) { console.error(`Failed to register monster ${m.id}:`, e); }
        });
      }
      if (Array.isArray(cData)) {
        cData.forEach(c => {
          try { get().registerHero(c); } catch (e) { console.error(`Failed to register hero ${c.id}:`, e); }
        });
      }
      if (Array.isArray(afData)) {
        afData.forEach(a => {
          try { get().registerArtifact(a); } catch (e) { console.error(`Failed to register artifact ${a.id}:`, e); }
        });
      }
      
      if (arData.weapons) {
        arData.weapons.forEach((w: any) => {
          try { get().registerArsenal(w); } catch (e) { console.error(`Failed to register weapon ${w.id}:`, e); }
        });
      }

      if (arData.hazards) {
        arData.hazards.forEach((h: any) => {
          try {
            const preset = get().presets['base_weapon']?.defaults || {};
            const merged = get().deepMerge(preset, h);
            set((s) => ({ hazards: { ...s.hazards, [h.id]: merged } }));
          } catch (e) { console.error(`Failed to register hazard ${h.id}:`, e); }
        });
      }
    } catch (e) {
      console.error("Critical failure in loadBaseGame:", e);
    }
  },

  clear: () => set({ monsters: {}, heroes: {}, artifacts: {}, arsenal: {}, hazards: {}, fates: {} }),
  // Note: uiDefs is intentionally NOT cleared on pack reload — it is Mod Priority 0 base game data.
}));
