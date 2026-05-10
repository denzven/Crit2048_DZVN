import { del, get, set } from 'idb-keyval';

import { GameStorage } from '../src/engine/storage';

// Mock idb-keyval
jest.mock('idb-keyval', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
}));

describe('GameStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get pack index with default empty array', async () => {
    (get as jest.Mock).mockResolvedValue(null);
    const index = await GameStorage.getPackIndex();
    expect(index).toEqual([]);
    expect(get).toHaveBeenCalledWith('crit2048_pack_index');
  });

  test('should save a pack and update index', async () => {
    (get as jest.Mock).mockResolvedValue([]); // Empty index
    const pack = { id: 'test-pack', name: 'Test Pack', version: '1.0.0', type: 'mega' } as any;

    await GameStorage.savePack(pack);

    expect(set).toHaveBeenCalledWith(
      'crit2048_pack_index',
      expect.arrayContaining([expect.objectContaining({ id: 'test-pack' })]),
    );
    expect(set).toHaveBeenCalledWith('crit2048_pack_test-pack', pack);
  });

  test('should load game save', async () => {
    const mockData = { gold: 100 };
    (get as jest.Mock).mockResolvedValue(mockData);

    const data = await GameStorage.loadGame();
    expect(data).toEqual(mockData);
    expect(get).toHaveBeenCalledWith('crit2048_save');
  });

  test('should clear game save', async () => {
    await GameStorage.clearSave();
    expect(del).toHaveBeenCalledWith('crit2048_save');
  });
});
