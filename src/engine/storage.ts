import { get, set, del, keys } from 'idb-keyval';
import type { PackData, PackEntry } from '../types/pack';

const KEYS = {
  PACK_INDEX: 'crit2048_pack_index',
  GAME_SAVE: 'crit2048_save',
  LEADERBOARD: 'crit2048_leaderboard',
  SETTINGS: 'crit2048_settings',
  PACK_PREFIX: 'crit2048_pack_',
};

export const GameStorage = {
  /**
   * Content Pack Storage
   */
  async getPackIndex(): Promise<PackEntry[]> {
    return (await get<PackEntry[]>(KEYS.PACK_INDEX)) || [];
  },

  async savePack(pack: PackData): Promise<void> {
    const index = await this.getPackIndex();
    const pos = index.findIndex((p) => p.id === pack.id);
    
    const entry: PackEntry = {
      id: pack.id,
      name: pack.name,
      version: pack.version,
      type: pack.type,
      icon: pack.icon,
      author: pack.author,
      description: pack.description,
      hasAdvancedScripts: pack.hasAdvancedScripts,
      installedAt: Date.now(),
    };

    if (pos >= 0) index[pos] = entry;
    else index.push(entry);

    await set(KEYS.PACK_INDEX, index);
    await set(`${KEYS.PACK_PREFIX}${pack.id}`, pack);
  },

  async loadPack(id: string): Promise<PackData | null> {
    return (await get<PackData>(`${KEYS.PACK_PREFIX}${id}`)) || null;
  },

  async deletePack(id: string): Promise<void> {
    const index = await this.getPackIndex();
    const updated = index.filter((p) => p.id !== id);
    await set(KEYS.PACK_INDEX, updated);
    await del(`${KEYS.PACK_PREFIX}${id}`);
  },

  /**
   * Game State Storage
   */
  async saveGame(data: any): Promise<void> {
    await set(KEYS.GAME_SAVE, data);
  },

  async loadGame(): Promise<any | null> {
    return (await get(KEYS.GAME_SAVE)) || null;
  },

  async clearSave(): Promise<void> {
    await del(KEYS.GAME_SAVE);
  },

  /**
   * Leaderboard Storage
   */
  async getLeaderboard(): Promise<any[]> {
    return (await get<any[]>(KEYS.LEADERBOARD)) || [];
  },

  async saveLeaderboard(leaderboard: any[]): Promise<void> {
    await set(KEYS.LEADERBOARD, leaderboard);
  },

  /**
   * Settings Storage
   */
  async getSettings(): Promise<any | null> {
    return (await get(KEYS.SETTINGS)) || null;
  },

  async saveSettings(settings: any): Promise<void> {
    await set(KEYS.SETTINGS, settings);
  },

  /**
   * Migration from Legacy LocalStorage
   */
  async migrateFromLegacy(): Promise<boolean> {
    const legacyIndex = localStorage.getItem('crit2048_pack_index');
    const legacySave = localStorage.getItem('crit2048_save');
    const legacyLeaderboard = localStorage.getItem('crit2048_leaderboard');

    if (!legacyIndex && !legacySave && !legacyLeaderboard) return false;

    console.log('📦 Found legacy data. Migrating to IndexedDB...');

    if (legacyIndex) {
      try {
        const index = JSON.parse(legacyIndex) as PackEntry[];
        for (const entry of index) {
          const rawPack = localStorage.getItem(`${KEYS.PACK_PREFIX}${entry.id}`);
          if (rawPack) {
            await set(`${KEYS.PACK_PREFIX}${entry.id}`, JSON.parse(rawPack));
          }
        }
        await set(KEYS.PACK_INDEX, index);
      } catch (e) {
        console.error('Migration failed for packs', e);
      }
    }

    if (legacySave) {
      try {
        await set(KEYS.GAME_SAVE, JSON.parse(legacySave));
      } catch (e) {
        console.error('Migration failed for save', e);
      }
    }

    if (legacyLeaderboard) {
      try {
        await set(KEYS.LEADERBOARD, JSON.parse(legacyLeaderboard));
      } catch (e) {
        console.error('Migration failed for leaderboard', e);
      }
    }

    // Clear legacy data once migrated (optional, but safer)
    // localStorage.clear(); // Use with caution

    console.log('✅ Migration complete.');
    return true;
  }
};
