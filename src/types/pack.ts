export type PackType = 'dungeon' | 'class' | 'skin' | 'mega' | 'artifacts' | 'weapon' | 'hazard';

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
  name: string;
  icon: string;
  hp: number;
  slides: number;
  mode: 'simple' | 'advanced' | 'builtin';
  primaryAbility?: {
    trigger: string;
    triggerParam?: any;
    effect: string;
    effectParam?: any;
  };
  script?: Record<string, string>;
  lore?: string;
}

export interface ClassDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  d20Mod?: number;
  passiveTrigger?: string;
  passiveEffect?: string;
  passiveParam?: any;
  scripts?: Record<string, string>;
  ability?: any;
}

export interface ArtifactDef {
  id: string;
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
  name: string;
  icon: string;
  dmg: number;
}

export interface HazardDef {
  id: string;
  name: string;
  icon: string;
}

export interface SkinDef {
  primaryColor?: string;
  accentColor?: string;
  bgColor?: string;
  surfaceColor?: string;
  borderRadius?: string;
  bgImage?: string;
  fontFamily?: string;
  customCss?: string;
  cssVars?: Record<string, string>;
}

export interface PackData extends PackEntry {
  game_version: string;
  loadStrategy?: 'append' | 'replace';
  enemies?: EnemyDef[];
  classes?: ClassDef[];
  weapons?: WeaponDef[];
  hazards?: HazardDef[];
  artifacts?: ArtifactDef[];
  skin?: SkinDef;
}
