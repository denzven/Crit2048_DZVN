import { z } from 'zod';
import { create } from 'zustand';

import arsenalData from '../engine_core/base_game/data/arsenal.json';
import artifactData from '../engine_core/base_game/data/artifacts.json';
import classData from '../engine_core/base_game/data/classes.json';
// Static imports for base game data to ensure reliability
import monsterData from '../engine_core/base_game/data/monsters.json';
import uiDefsData from '../engine_core/base_game/data/ui_defs.json';
import type { ArtifactDef, ClassDef, EnemyDef, HazardDef, WeaponDef } from '../types/pack';

// --- SCHEMAS ---

export const ActionSchema = z.object({
  type: z.enum([
    'spawn_hazard',
    'regen',
    'tile_shuffle',
    'modify_stat',
    'log',
    'weapon_degrade',
    'weapon_destroy',
    'drain_slides',
    'add_gold',
    'add_multiplier',
    'deal_damage',
  ]),
  target: z.enum(['player', 'enemy', 'board', 'ui']).optional(),
  amount: z.number().optional(),
  stringParam: z.string().optional(),
  condition: z.string().optional(),
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
  primaryAbility: z.unknown().optional(),
  passiveAbility: z.unknown().optional(),
  passiveTriggers: z.record(z.string(), ActionListSchema).optional(),
});

export const HeroSchema = z.object({
  id: z.string(),
  parent: z.union([z.string(), z.array(z.string())]).default('base_hero'),
  name: z.string(),
  icon: z.string(),
  desc: z.string(),
  d20Mod: z.number().default(0),
  ability: z.unknown().optional(),
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
  passiveParam: z.unknown().optional(),
  passiveTriggers: z.record(z.string(), ActionListSchema).optional(),
  requiredClass: z.string().optional(),
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

export const HazardSchema = z.object({
  id: z.string(),
  parent: z.union([z.string(), z.array(z.string())]).default('base_hazard'),
  name: z.string(),
  icon: z.string(),
  bg: z.string().optional(),
  text: z.string().optional(),
  lore: z.string().optional(),
});

export const ThemeSchema = z.object({
  themeName: z.string().optional(),
  parent: z.union([z.string(), z.array(z.string())]).optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  bgColor: z.string().optional(),
  surfaceColor: z.string().optional(),
  borderRadius: z.string().optional(),
  bgImage: z.string().optional(),
  fontFamily: z.string().optional(),
  customCss: z.string().optional(),
  borderColor: z.string().optional(),
  logoOverride: z.string().optional(),
  hpBarColor: z.string().optional(),
  loadingColor: z.string().optional(),
  glowColor: z.string().optional(),
  script: z.record(z.string(), z.string()).optional(),
  cssVars: z.record(z.string(), z.string()).optional(),
});

// --- REGISTRY STORE ---

/** UI Definitions — loaded from ui_defs.json (Mod Priority 0). */
export interface UiDefs {
  packTypes: Record<string, { label: string; color: string; icon: string }>;
  contentTypes: { key: string; label: string; icon: string; color: string }[];
  hooks: { id: string; label: string; icon: string }[];
  d20Tiers: {
    min: number;
    max: number;
    type: string;
    label: string;
    sublabel: string;
    color: string;
    bgColor: string;
  }[];
  tavernServices: Record<
    string,
    {
      label: string;
      icon: string;
      cost?: number;
      description: string;
      disabledReason?: string;
      emptyMessage?: string;
    }
  >;
  hud: {
    slideDangerThreshold: number;
    slideCriticalThreshold: number;
    multiplierHighThreshold: number;
    multiplierRageThreshold: number;
    hpNearDeathPercent: number;
  };
  rarityColors: Record<string, { text: string; border: string; bg: string; glow: string }>;
}

interface RegistryState {
  monsters: Record<string, EnemyDef>;
  heroes: Record<string, ClassDef>;
  artifacts: Record<string, ArtifactDef>;
  arsenal: Record<string, WeaponDef>;
  hazards: Record<string, HazardDef>;
  fates: Record<string, unknown>;
  presets: Record<string, { defaults: Record<string, unknown> }>;
  uiDefs: UiDefs | null;
  isReady: boolean;

  // Actions
  registerMonster: (def: Record<string, unknown>) => void;
  registerHero: (def: Record<string, unknown>) => void;
  registerArtifact: (def: Record<string, unknown>) => void;
  registerArsenal: (def: Record<string, unknown>) => void;
  loadPresets: () => Promise<void>;
  loadBaseGame: () => Promise<void>;
  deepMerge: (
    base: Record<string, unknown>,
    mod: Record<string, unknown>,
  ) => Record<string, unknown>;
  applyParents: (def: Record<string, unknown>, defaultParentId: string) => Record<string, unknown>;
  clear: () => void;
  setIsReady: (ready: boolean) => void;
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
  isReady: false,

  deepMerge: (base, mod) => {
    const result: Record<string, unknown> = { ...base };
    for (const key in mod) {
      const modVal = mod[key];
      const baseVal = base[key];
      if (Array.isArray(modVal)) {
        result[key] = Array.isArray(baseVal) ? [...baseVal, ...modVal] : [...modVal];
      } else if (modVal instanceof Object && key in base && !Array.isArray(baseVal)) {
        result[key] = get().deepMerge(
          baseVal as Record<string, unknown>,
          modVal as Record<string, unknown>,
        );
      } else {
        result[key] = modVal;
      }
    }
    return result;
  },

  applyParents: (def: Record<string, unknown>, defaultParentId: string) => {
    const parentIds = Array.isArray(def.parent)
      ? def.parent
      : def.parent
        ? [def.parent]
        : [defaultParentId];
    let merged: Record<string, unknown> = {};
    for (const pid of parentIds) {
      const preset = get().presets[pid as string]?.defaults || {};
      merged = get().deepMerge(merged, preset as Record<string, unknown>);
    }
    return get().deepMerge(merged, def);
  },

  registerMonster: (def) => {
    const merged = get().applyParents(def, 'base_monster');
    const validated = MonsterSchema.parse(merged);
    set((s) => ({
      monsters: { ...s.monsters, [validated.id]: validated as EnemyDef },
    }));
  },

  registerHero: (def) => {
    const merged = get().applyParents(def, 'base_hero');
    const validated = HeroSchema.parse(merged);
    set((s) => ({
      heroes: { ...s.heroes, [validated.id]: validated as ClassDef },
    }));
  },

  registerArtifact: (def) => {
    const merged = get().applyParents(def, 'base_artifact');
    const validated = ArtifactSchema.parse(merged);
    set((s) => ({
      artifacts: { ...s.artifacts, [validated.id]: validated as ArtifactDef },
    }));
  },

  registerArsenal: (def) => {
    const merged = get().applyParents(def, 'base_weapon');
    const validated = WeaponSchema.parse(merged);
    set((s) => ({
      arsenal: { ...s.arsenal, [validated.id]: validated as WeaponDef },
    }));
  },

  loadPresets: async () => {
    const modules = import.meta.glob('../engine_core/presets/*.json');
    const presets: Record<string, { defaults: Record<string, unknown> }> = {};

    for (const path in modules) {
      try {
        const module = (await (modules[path] as () => Promise<any>)()) as {
          default?: Record<string, unknown>;
        };
        const content = (module.default || module) as {
          id?: string;
          defaults: Record<string, unknown>;
        };
        const id =
          content.id || path.split('/').pop()?.replace('.json', '').toLowerCase() || 'unknown';
        presets[id] = content;
        console.log(`[RegistryHub] Loaded preset: ${id}`);
      } catch (e) {
        console.error(`[RegistryHub] Failed to load preset from ${path}:`, e);
      }
    }

    set({ presets });
  },

  loadBaseGame: async () => {
    try {
      const mData = (monsterData as unknown as { default?: unknown }).default || monsterData;
      const cData = (classData as unknown as { default?: unknown }).default || classData;
      const arData = ((arsenalData as unknown as { default?: unknown }).default ||
        arsenalData) as any;
      const afData = (artifactData as unknown as { default?: unknown }).default || artifactData;
      const uiData = (uiDefsData as unknown as { default?: unknown }).default || uiDefsData;

      // Load UI Definitions (Mod Priority 0)
      if (uiData) set({ uiDefs: uiData as UiDefs });

      if (Array.isArray(mData)) {
        mData.forEach((m: any) => {
          try {
            get().registerMonster(m);
          } catch (e) {
            console.error(`Failed to register monster ${m.id}:`, e);
          }
        });
      }
      if (Array.isArray(cData)) {
        cData.forEach((c: any) => {
          try {
            get().registerHero(c);
          } catch (e) {
            console.error(`Failed to register hero ${c.id}:`, e);
          }
        });
      }
      if (Array.isArray(afData)) {
        afData.forEach((a: any) => {
          try {
            get().registerArtifact(a);
          } catch (e) {
            console.error(`Failed to register artifact ${a.id}:`, e);
          }
        });
      }

      if (arData.weapons) {
        (arData as { weapons: Record<string, unknown>[] }).weapons.forEach((w) => {
          try {
            get().registerArsenal(w);
          } catch (e) {
            console.error(`Failed to register weapon ${w.id}:`, e);
          }
        });
      }

      if (arData.hazards) {
        (arData as { hazards: Record<string, unknown>[] }).hazards.forEach((h) => {
          try {
            const preset = get().presets['base_weapon']?.defaults || {};
            const merged = get().deepMerge(
              preset as Record<string, unknown>,
              h as Record<string, unknown>,
            );
            set((s) => ({
              hazards: { ...s.hazards, [h.id as string]: merged as unknown as HazardDef },
            }));
          } catch (e) {
            console.error(`Failed to register hazard ${h.id}:`, e);
          }
        });
      }
    } catch (e) {
      console.error('Critical failure in loadBaseGame:', e);
    }
  },

  clear: () =>
    set({ monsters: {}, heroes: {}, artifacts: {}, arsenal: {}, hazards: {}, fates: {} }),
  setIsReady: (ready: boolean) => set({ isReady: ready }),
  // Note: uiDefs is intentionally NOT cleared on pack reload — it is Mod Priority 0 base game data.
}));
