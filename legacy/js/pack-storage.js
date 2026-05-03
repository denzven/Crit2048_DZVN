/**
 * PACK STORAGE — Content Pack persistence layer.
 * Native Tauri: uses filesystem `AppData/packs`
 * Web Fallback: uses localStorage
 */
(function () {
  const INDEX_KEY = 'crit2048_pack_index';
  const packKey   = id => `crit2048_pack_${id}`;

  const isTauri = () => !!(window.__TAURI__ && window.__TAURI__.core);

  // ── Index helpers (Fallback Web) ──────────────────────────────────────────
  function readIndex() {
    try { return JSON.parse(localStorage.getItem(INDEX_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function writeIndex(arr) {
    localStorage.setItem(INDEX_KEY, JSON.stringify(arr));
  }

  // ── Native File System Resolvers ─────────────────────────────────────────
  async function getPacksDir() {
    const invoke = window.__TAURI__.core.invoke;
    const appData = await invoke('plugin:path|app_data_dir');
    const dir = await invoke('plugin:path|join', { paths: [appData, 'packs'] });
    try { await invoke('plugin:fs|mkdir', { path: dir, recursive: true }); } catch (e) {}
    return dir;
  }

  const PackStorage = {

    async getPacksDir() {
      if (isTauri()) return await getPacksDir();
      return null;
    },

    /** Save a parsed pack object. */
    async save(packJson) {
      const id = packJson.id;
      const dataStr = typeof packJson === 'string' ? packJson : JSON.stringify(packJson, null, 2);
      const parsed = typeof packJson === 'string' ? JSON.parse(packJson) : packJson;
      
      if (isTauri()) {
        try {
          const invoke = window.__TAURI__.core.invoke;
          const dir = await getPacksDir();
          const filePath = await invoke('plugin:path|join', { paths: [dir, `${id}.json`] });
          const enc = new TextEncoder();
          await invoke('plugin:fs|write_file', { path: filePath, data: Array.from(enc.encode(dataStr)) });
          return true;
        } catch (e) {
          console.error('Tauri save failed:', e);
          return false;
        }
      }

      // Web Fallback
      try {
        localStorage.setItem(packKey(id), dataStr);
        const idx = readIndex();
        const pos = idx.findIndex(e => e.id === id);
        const entry = {
          id, name: parsed.name, version: parsed.version, type: parsed.type,
          icon: parsed.icon, author: parsed.author,
          hasAdvancedScripts: parsed.hasAdvancedScripts || false, installedAt: Date.now()
        };
        if (pos >= 0) idx[pos] = entry; else idx.push(entry);
        writeIndex(idx);
        return true;
      } catch (e) {
        return false;
      }
    },

    /** Load a full pack by id. Returns null if not found. */
    async load(id) {
      // Check for built-in memory packs FIRST (shared across Web and Tauri)
      if (id === 'crit2048-default' && typeof CRIT2048_DEFAULT_PACK !== 'undefined') return CRIT2048_DEFAULT_PACK;
      if (id === 'crit2048-default-enemies' && typeof CRIT2048_DEFAULT_ENEMIES_PACK !== 'undefined') return CRIT2048_DEFAULT_ENEMIES_PACK;
      if (id === 'crit2048-default-classes' && typeof CRIT2048_DEFAULT_CLASSES_PACK !== 'undefined') return CRIT2048_DEFAULT_CLASSES_PACK;
      if (id === 'crit2048-default-artifacts' && typeof CRIT2048_DEFAULT_ARTIFACTS_PACK !== 'undefined') return CRIT2048_DEFAULT_ARTIFACTS_PACK;
      if (id === 'crit2048-default-weapons' && typeof CRIT2048_DEFAULT_WEAPONS_PACK !== 'undefined') return CRIT2048_DEFAULT_WEAPONS_PACK;
      if (id === 'crit2048-default-hazards' && typeof CRIT2048_DEFAULT_HAZARDS_PACK !== 'undefined') return CRIT2048_DEFAULT_HAZARDS_PACK;
      if (id === 'crit2048-default-skin' && typeof CRIT2048_DEFAULT_SKIN_PACK !== 'undefined') return CRIT2048_DEFAULT_SKIN_PACK;

      if (isTauri()) {
        try {
          const invoke = window.__TAURI__.core.invoke;
          const dir = await getPacksDir();
          const filePath = await invoke('plugin:path|join', { paths: [dir, `${id}.json`] });
          const bytes = await invoke('plugin:fs|read_file', { path: filePath });
          const str = new TextDecoder().decode(new Uint8Array(bytes));
          return JSON.parse(str);
        } catch (e) { return null; }
      }
      
      // Web Fallback
      try {
        const raw = localStorage.getItem(packKey(id));
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },

    /** Remove a pack from storage. */
    async delete(id) {
      if (isTauri()) {
        try {
          const invoke = window.__TAURI__.core.invoke;
          const dir = await getPacksDir();
          const filePath = await invoke('plugin:path|join', { paths: [dir, `${id}.json`] });
          await invoke('plugin:fs|remove', { path: filePath });
          return true;
        } catch (e) { return false; }
      }
      
      try {
        localStorage.removeItem(packKey(id));
        writeIndex(readIndex().filter(e => e.id !== id));
        return true;
      } catch (e) { return false; }
    },

    /** Return the lightweight index array. */
    async listInstalled() {
      if (isTauri()) {
        try {
          const invoke = window.__TAURI__.core.invoke;
          const dir = await getPacksDir();
          const entries = await invoke('plugin:fs|read_dir', { path: dir });
          const index = [];
          for (const entry of entries) {
            if (entry.name && entry.name.endsWith('.json')) {
              try {
                const filePath = await invoke('plugin:path|join', { paths: [dir, entry.name] });
                const bytes = await invoke('plugin:fs|read_file', { path: filePath });
                const str = new TextDecoder().decode(new Uint8Array(bytes));
                const parsed = JSON.parse(str);
                index.push({
                  id: parsed.id, name: parsed.name, version: parsed.version, type: parsed.type,
                  icon: parsed.icon, author: parsed.author,
                  hasAdvancedScripts: parsed.hasAdvancedScripts || false,
                  installedAt: Date.now() // rough approx if we don't store it
                });
              } catch(e) {}
            }
          }
          return index;
        } catch (e) {
          console.error("listInstalled failed", e);
          return [];
        }
      }
      return readIndex();
    },

    /** Check whether a pack id is already installed. */
    async isInstalled(id) {
      const idx = await this.listInstalled();
      return idx.some(e => e.id === id);
    },

    /** Duplicate an existing pack (including built-ins). */
    async duplicate(id) {
      let pack = await this.load(id);
      if (!pack) return false;

      const newPack = JSON.parse(JSON.stringify(pack));
      newPack.id = `${pack.id.replace('crit2048-', '')}-copy-${Date.now()}`;
      newPack.name = `${pack.name} (Copy)`;
      newPack.isBuiltIn = false;
      return await this.save(newPack);
    }
  };

  window.PackStorage = PackStorage;
})();
