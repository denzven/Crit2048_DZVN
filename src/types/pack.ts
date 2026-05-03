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

export interface PackData extends PackEntry {
  game_version: string;
  loadStrategy?: 'append' | 'replace';
  enemies?: any[];
  classes?: any[];
  weapons?: any[];
  hazards?: any[];
  artifacts?: any[];
  skin?: any;
}
