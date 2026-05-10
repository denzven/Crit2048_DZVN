import { PackEngine } from '../src/engine/packEngine';

// Mock GameStore and Registry
const mockAddLog = jest.fn();
const mockAddGold = jest.fn();
const mockApplyDamage = jest.fn();

(window as any).useGameStore = {
  getState: () => ({
    addLog: mockAddLog,
    addGold: mockAddGold,
    applyDamage: mockApplyDamage,
    monsterHp: 100,
    monsterMaxHp: 100,
  }),
};

describe('PackEngine - Action Queue (Rule of Zero)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should execute add_gold action', () => {
    const actions = [{ type: 'add_gold', amount: 50 }];
    const state = {} as any;
    const G = {
      player: { addGold: mockAddGold },
    } as any;

    (PackEngine as any).executeActionQueue(actions, state, G);

    expect(mockAddGold).toHaveBeenCalledWith(50);
  });

  test('should respect action conditions', () => {
    const actions = [
      { type: 'add_gold', amount: 50, condition: 'state.gold < 10' },
      { type: 'add_gold', amount: 100, condition: 'state.gold >= 10' },
    ];

    const state = { gold: 5 } as any;
    const G = {
      player: { addGold: mockAddGold },
    } as any;

    (PackEngine as any).executeActionQueue(actions, state, G);

    expect(mockAddGold).toHaveBeenCalledWith(50);
    expect(mockAddGold).not.toHaveBeenCalledWith(100);
  });

  test('should run sandboxed scripts without blocked keywords', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const state = {} as any;

    PackEngine.runScript('window.location = "http://evil.com"', state);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Blocked keyword'));
    consoleSpy.mockRestore();
  });

  test('should execute simple damage actions', () => {
    const actions = [{ type: 'deal_damage', amount: 10, target: 'enemy' }];
    const state = {} as any;
    const mockDealDamage = jest.fn();
    const G = {
      enemy: { dealDamage: mockDealDamage },
    } as any;

    (PackEngine as any).executeActionQueue(actions, state, G);

    expect(mockDealDamage).toHaveBeenCalledWith(10);
  });
});
