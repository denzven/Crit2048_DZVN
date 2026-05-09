export type PackType = 'mega' | 'monsters' | 'heroes' | 'arsenal' | 'artifacts' | 'fates' | 'themes' | 'tunes' | 'hazards';

export interface PackEntry {
  id: string;
  name: string;
  version: string;
  type: PackType;
  icon: string;
  author: string;
  description?: string;
  hasAdvancedScripts?: boolean;
  installedAt?: number;
}

export interface EnemyDef {
  id: string;
  parent?: string | string[];
  name: string;
  icon: string;
  hp: number;
  slides: number;
  mode: 'simple' | 'advanced' | 'builtin';
  primaryAbility?: {
    trigger: string;
    triggerParam?: any;
    effect?: string;
    effectParam?: any;
    logMessage?: string;
  };
  passiveAbility?: {
    effect?: string;
    effectParam?: any;
    logMessage?: string;
  };
  script?: Record<string, string>;
  lore?: string;
}

export interface ClassDef {
  id: string;
  parent?: string | string[];
  name: string;
  icon: string;
  desc: string;
  d20Mod?: number;
  passiveTrigger?: string;
  passiveEffect?: string;
  passiveParam?: any;
  scripts?: Record<string, string>;
  ability?: any;
  mode?: 'simple' | 'advanced' | 'builtin';
}

export interface ArtifactDef {
  id: string;
  parent?: string | string[];
  name: string;
  icon: string;
  rarity: string;
  basePrice: number;
  desc: string;
  mode?: 'simple' | 'advanced';
  passiveTrigger?: string;
  passiveEffect?: string;
  passiveParam?: any;
  scripts?: Record<string, string>;
}

export interface WeaponDef {
  id: string;
  parent?: string | string[];
  name: string;
  icon: string;
  dmg: number;
  bg?: string;
  text?: string;
}

export interface HazardDef {
  id: string;
  parent?: string | string[];
  name: string;
  icon: string;
  bg?: string;
  text?: string;
  lore?: string;
}

export interface SkinDef {
  parent?: string | string[];
  themeName?: string;
  primaryColor?: string;
  accentColor?: string;
  bgColor?: string;
  surfaceColor?: string;
  borderRadius?: string;
  bgImage?: string;
  fontFamily?: string;
  customCss?: string;
  borderColor?: string;
  logoOverride?: string;
  hpBarColor?: string;
  loadingColor?: string;
  glowColor?: string;
  script?: Record<string, string>;
  cssVars?: Record<string, string>;
}

export interface PackData extends PackEntry {
  game_version: string;
  loadStrategy?: 'append' | 'replace';
  monsters?: EnemyDef[];
  heroes?: ClassDef[];
  arsenal?: WeaponDef[];
  artifacts?: ArtifactDef[];
  fates?: any[];
  hazards?: HazardDef[];
  themes?: SkinDef;
  tunes?: any[];
}
