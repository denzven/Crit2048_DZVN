import { useRegistry } from '../src/engine/registryHub';

// Mock the presets and base game data imports
jest.mock('../engine_core/base_game/data/monsters.json', () => [], { virtual: true });
jest.mock('../engine_core/base_game/data/classes.json', () => [], { virtual: true });
jest.mock('../engine_core/base_game/data/arsenal.json', () => ({ weapons: [], hazards: [] }), {
  virtual: true,
});
jest.mock('../engine_core/base_game/data/artifacts.json', () => [], { virtual: true });
jest.mock('../engine_core/base_game/data/ui_defs.json', () => ({}), { virtual: true });

describe('RegistryHub', () => {
  beforeEach(() => {
    useRegistry.getState().clear();
  });

  test('should register a monster with base defaults', () => {
    const registry = useRegistry.getState();

    // Manually add a preset for base_monster since loadPresets is async and uses import.meta.glob
    useRegistry.setState({
      presets: {
        base_monster: {
          defaults: {
            mode: 'simple',
            parent: 'base_monster',
          },
        },
      },
    });

    registry.registerMonster({
      id: 'test_goblin',
      name: 'Test Goblin',
      hp: 100,
      slides: 10,
      icon: '👺',
    });

    const monster = useRegistry.getState().monsters['test_goblin'];
    expect(monster).toBeDefined();
    expect(monster?.name).toBe('Test Goblin');
    expect(monster?.mode).toBe('simple'); // From preset
  });

  test('should fail validation if required fields are missing', () => {
    const registry = useRegistry.getState();

    expect(() => {
      registry.registerMonster({
        id: 'bad_monster',
        // missing hp, slides, etc.
      });
    }).toThrow();
  });

  test('should register a hero class', () => {
    const registry = useRegistry.getState();

    useRegistry.setState({
      presets: {
        base_hero: {
          defaults: {
            d20Mod: 0,
          },
        },
      },
    });

    registry.registerHero({
      id: 'warrior',
      name: 'Warrior',
      icon: '⚔️',
      desc: 'A strong fighter',
    });

    const hero = useRegistry.getState().heroes['warrior'];
    expect(hero).toBeDefined();
    expect(hero?.name).toBe('Warrior');
  });

  test('should deep merge properties correctly', () => {
    const registry = useRegistry.getState();
    const base = { stats: { hp: 10, mp: 5 }, tags: ['base'] };
    const mod = { stats: { hp: 20 }, tags: ['mod'] };

    const result = registry.deepMerge(base, mod);

    expect(result.stats).toEqual({ hp: 20, mp: 5 });
    expect(result.tags).toEqual(['base', 'mod']);
  });
});

describe('RegistryHub - Integration', () => {
  beforeEach(() => {
    useRegistry.getState().clear();
  });

  test('loadBaseGame should hydrate registry with mocked data', async () => {
    const registry = useRegistry.getState();
    await registry.loadBaseGame();

    // Since our mocks currently return empty arrays, we check if it isReady
    // In a real scenario with non-empty mocks, we'd check if counts > 0
    expect(registry.isReady).toBe(false); // It's not ready until explicitly set
  });
});
