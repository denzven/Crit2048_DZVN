import {
  ArtifactSchema,
  HazardSchema,
  HeroSchema,
  MonsterSchema,
  ThemeSchema,
  WeaponSchema,
} from '../src/engine/registryHub';
import {
  CRIT2048_DEFAULT_ARSENAL_PACK,
  CRIT2048_DEFAULT_ARTIFACTS_PACK,
  CRIT2048_DEFAULT_FATES_PACK,
  CRIT2048_DEFAULT_HAZARDS_PACK,
  CRIT2048_DEFAULT_HEROES_PACK,
  CRIT2048_DEFAULT_MEGA_PACK,
  CRIT2048_DEFAULT_MONSTERS_PACK,
  CRIT2048_DEFAULT_THEMES_PACK,
  CRIT2048_DEFAULT_TUNES_PACK,
} from '../src/engine_core/packs';

describe('Pack Content Validation', () => {
  test('Monsters pack should follow schema', () => {
    CRIT2048_DEFAULT_MONSTERS_PACK.monsters?.forEach((m) => {
      expect(() => MonsterSchema.parse(m)).not.toThrow();
    });
  });

  test('Heroes pack should follow schema', () => {
    CRIT2048_DEFAULT_HEROES_PACK.heroes?.forEach((h) => {
      expect(() => HeroSchema.parse(h)).not.toThrow();
    });
  });

  test('Artifacts pack should follow schema', () => {
    CRIT2048_DEFAULT_ARTIFACTS_PACK.artifacts?.forEach((a) => {
      expect(() => ArtifactSchema.parse(a)).not.toThrow();
    });
  });

  test('Arsenal pack should follow schema', () => {
    CRIT2048_DEFAULT_ARSENAL_PACK.arsenal?.forEach((w) => {
      expect(() => WeaponSchema.parse(w)).not.toThrow();
    });
  });

  test('Hazards pack should follow schema', () => {
    CRIT2048_DEFAULT_HAZARDS_PACK.hazards?.forEach((h) => {
      expect(() => HazardSchema.parse(h)).not.toThrow();
    });
  });

  test('Themes pack should follow schema', () => {
    const theme = CRIT2048_DEFAULT_THEMES_PACK.themes;
    expect(() => ThemeSchema.parse(theme)).not.toThrow();
  });

  test('All scripts should be safe (no eval/window)', () => {
    const BLOCKED = ['window.', 'eval(', 'Function(', 'document.'];
    const allPacks = [
      CRIT2048_DEFAULT_MEGA_PACK,
      CRIT2048_DEFAULT_MONSTERS_PACK,
      CRIT2048_DEFAULT_HEROES_PACK,
      CRIT2048_DEFAULT_ARTIFACTS_PACK,
      CRIT2048_DEFAULT_HAZARDS_PACK,
      CRIT2048_DEFAULT_FATES_PACK,
      CRIT2048_DEFAULT_TUNES_PACK,
    ];

    allPacks.forEach((pack) => {
      const stringified = JSON.stringify(pack);
      BLOCKED.forEach((keyword) => {
        expect(stringified).not.toContain(keyword);
      });
    });
  });
});
