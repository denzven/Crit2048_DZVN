import type { PackData } from '../../types/pack';
import { CRIT2048_DEFAULT_MONSTERS_PACK } from './monsters';
import { CRIT2048_DEFAULT_HAZARDS_PACK } from './hazards';
import { CRIT2048_DEFAULT_HEROES_PACK } from './heroes';
import { CRIT2048_DEFAULT_ARTIFACTS_PACK } from './artifacts';
import { CRIT2048_DEFAULT_ARSENAL_PACK } from './arsenal';
import { CRIT2048_DEFAULT_THEMES_PACK } from './themes';
import { CRIT2048_DEFAULT_FATES_PACK } from './fates';
import { CRIT2048_DEFAULT_TUNES_PACK } from './tunes';

export const CRIT2048_DEFAULT_MEGA_PACK: PackData = {
  "id": "crit2048-default",
  "name": "Crit 2048 — Default Mega Pack",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "The complete built-in game content.",
  "type": "mega",
  "icon": "🐉",
  "monsters": CRIT2048_DEFAULT_MONSTERS_PACK.monsters,
  "hazards": CRIT2048_DEFAULT_HAZARDS_PACK.hazards,
  "heroes": CRIT2048_DEFAULT_HEROES_PACK.heroes,
  "artifacts": CRIT2048_DEFAULT_ARTIFACTS_PACK.artifacts,
  "arsenal": CRIT2048_DEFAULT_ARSENAL_PACK.arsenal,
  "themes": CRIT2048_DEFAULT_THEMES_PACK.themes,
  "fates": CRIT2048_DEFAULT_FATES_PACK.fates,
  "tunes": CRIT2048_DEFAULT_TUNES_PACK.tunes
};
