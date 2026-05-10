import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { useGameStore } from '../engine/gameStore';
import { PackEngine } from '../engine/packEngine';
import { useRegistry } from '../engine/registryHub';
import { GameStorage } from '../engine/storage';
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
  CRIT2048_SHADOWFELL_THEMES_PACK,
} from '../engine_core/packs';
import type { PackData, PackEntry } from '../types/pack';

const REGISTRY_URL =
  'https://raw.githubusercontent.com/denzven/Crit2048-grimoire/main/registry.json';

interface GrimoireProps {
  onClose: () => void;
  onEditPack: (pack: PackData) => void;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const GrimoireModal: React.FC<GrimoireProps> = ({ onClose, onEditPack }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [localPacks, setLocalPacks] = useState<PackEntry[]>([]);
  const [remotePacks, setRemotePacks] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { runStats, setState, initializeRegistry } = useGameStore();

  // Read pack type definitions from registry (Mod Priority 0)
  const uiDefs = useRegistry((s) => s.uiDefs);
  const packTypes = uiDefs?.packTypes || {};

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadLocalPacks();
    await fetchCommunityPacks();
  };

  const loadLocalPacks = async () => {
    const installed = await GameStorage.getPackIndex();

    // Inject default packs as "Templates"
    const templates: PackEntry[] = [
      CRIT2048_DEFAULT_MEGA_PACK,
      CRIT2048_DEFAULT_MONSTERS_PACK,
      CRIT2048_DEFAULT_HEROES_PACK,
      CRIT2048_DEFAULT_ARTIFACTS_PACK,
      CRIT2048_DEFAULT_ARSENAL_PACK,
      CRIT2048_DEFAULT_HAZARDS_PACK,
      CRIT2048_DEFAULT_THEMES_PACK,
      CRIT2048_SHADOWFELL_THEMES_PACK,
      CRIT2048_DEFAULT_FATES_PACK,
      CRIT2048_DEFAULT_TUNES_PACK,
    ].map(
      (p) =>
        ({
          id: p.id,
          name: p.name,
          version: p.version,
          author: p.author,
          type: p.type,
          icon: p.icon,
          description: p.description,
          isTemplate: true,
        }) as any,
    );

    setLocalPacks([...templates, ...installed]);
  };

  const fetchCommunityPacks = async () => {
    setIsFetching(true);
    try {
      const resp = await fetch(REGISTRY_URL, { cache: 'no-store' });
      if (!resp.ok) throw new Error('Network error');
      const data = await resp.json();
      setRemotePacks(data.packs || []);
      setIsOnline(true);
    } catch (err) {
      console.warn('Grimoire: Could not fetch community packs', err);
      setIsOnline(false);
    } finally {
      setIsFetching(false);
    }
  };

  const installFromRemote = async (packUrl: string) => {
    if (!packUrl) return;
    try {
      const resp = await fetch(packUrl);
      if (!resp.ok) throw new Error('Failed to fetch pack JSON');
      const packData = await resp.json();

      if (packData.hasAdvancedScripts) {
        // Use in-modal confirm pattern instead of browser alert
        showToast('⚠️ This pack contains custom scripts. Installing anyway...', 'warning');
      }

      await GameStorage.savePack(packData);
      await loadLocalPacks();
      showToast(`✅ Installed: ${packData.name}`, 'success');
    } catch (err) {
      showToast('❌ Error installing pack. Check the URL and try again.', 'error');
    }
  };

  const togglePack = async (id: string) => {
    const current = runStats.activePackIds || [];
    let updated;
    if (current.includes(id)) {
      updated = current.filter((p) => p !== id);
    } else {
      updated = [...current, id];
    }

    setState({ runStats: { ...runStats, activePackIds: updated } });
    await PackEngine.applyPacks(updated);
    await initializeRegistry();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.crit,.zip,.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        let pack: any;
        if (file.name.endsWith('.json')) {
          const text = await file.text();
          pack = JSON.parse(text);
        } else {
          const JSZip = (await import('jszip')).default;
          const zip = await JSZip.loadAsync(file);

          let manifest: any = { id: `pack-${Date.now()}`, name: 'Imported Pack', type: 'mega' };
          const manifestFile = zip.file('manifest.json');
          if (manifestFile) manifest = JSON.parse(await manifestFile.async('string'));

          const packData: any = {
            monsters: [],
            heroes: [],
            artifacts: [],
            arsenal: [],
            fates: [],
            hazards: [],
            tunes: [],
            themes: undefined,
          };

          for (const [path, zipObj] of Object.entries(zip.files)) {
            if (zipObj.dir || path === 'manifest.json' || !path.endsWith('.json')) continue;

            const content = JSON.parse(await zipObj.async('string'));
            if (path.startsWith('monsters/')) packData.monsters.push(content);
            else if (path.startsWith('heroes/')) packData.heroes.push(content);
            else if (path.startsWith('artifacts/')) packData.artifacts.push(content);
            else if (path.startsWith('arsenal/')) packData.arsenal.push(content);
            else if (path.startsWith('hazards/')) packData.hazards.push(content);
          }
          pack = { ...manifest, ...packData };
        }

        await GameStorage.savePack(pack);
        loadLocalPacks();
        showToast(`✅ Imported: ${pack.name}`, 'success');
      } catch (err) {
        console.error('Grimoire Import Error:', err);
        showToast('❌ Failed to parse or load pack file.', 'error');
      }
    };
    input.click();
  };

  const handleDuplicate = async (id: string) => {
    let pack = await GameStorage.loadPack(id);
    if (!pack) {
      const templates: PackData[] = [
        CRIT2048_DEFAULT_MEGA_PACK,
        CRIT2048_DEFAULT_MONSTERS_PACK,
        CRIT2048_DEFAULT_HEROES_PACK,
        CRIT2048_DEFAULT_ARTIFACTS_PACK,
        CRIT2048_DEFAULT_ARSENAL_PACK,
        CRIT2048_DEFAULT_HAZARDS_PACK,
        CRIT2048_DEFAULT_THEMES_PACK,
        CRIT2048_SHADOWFELL_THEMES_PACK,
        CRIT2048_DEFAULT_FATES_PACK,
        CRIT2048_DEFAULT_TUNES_PACK,
      ];
      pack = templates.find((t: PackData) => t.id === id) || null;
    }

    if (pack) {
      const cloned = { ...pack, id: `${pack.id}-copy-${Date.now()}`, name: `${pack.name} (Copy)` };
      await GameStorage.savePack(cloned);
      await loadLocalPacks();
      showToast(`✅ Cloned "${pack.name}" — open in Forge to edit.`, 'success');
      onEditPack(cloned);
    }
  };

  const handleUninstall = async (id: string) => {
    // No window.confirm — use game's own showConfirm instead
    const pack = localPacks.find((p) => p.id === id);
    await GameStorage.deletePack(id);
    loadLocalPacks();
    showToast(`🗑️ "${pack?.name || id}" removed.`, 'warning');
  };

  const handleEdit = async (id: string) => {
    let pack = await GameStorage.loadPack(id);
    if (!pack) {
      const templates: PackData[] = [
        CRIT2048_DEFAULT_MEGA_PACK,
        CRIT2048_DEFAULT_MONSTERS_PACK,
        CRIT2048_DEFAULT_HEROES_PACK,
        CRIT2048_DEFAULT_ARTIFACTS_PACK,
        CRIT2048_DEFAULT_ARSENAL_PACK,
        CRIT2048_DEFAULT_HAZARDS_PACK,
        CRIT2048_DEFAULT_THEMES_PACK,
        CRIT2048_SHADOWFELL_THEMES_PACK,
        CRIT2048_DEFAULT_FATES_PACK,
        CRIT2048_DEFAULT_TUNES_PACK,
      ];
      pack = templates.find((t: PackData) => t.id === id) || null;
    }
    if (pack) onEditPack(pack);
  };

  // Tabs built from registered pack types (Mod Priority 0 drives this list)
  const tabs = [
    { id: 'all', label: 'All' },
    ...Object.entries(packTypes)
      .map(([key, def]) => ({ id: key, label: def.label }))
      .filter((v, i, self) => self.findIndex((t) => t.id === v.id) === i), // dedupe
  ];

  const mergedPacks = Array.from(
    new Map<string, any>([
      ...remotePacks.map((p) => [p.id, { ...p, isRemote: true }]),
      ...localPacks.map((p) => [p.id, { ...p, isInstalled: true }]),
    ] as [string, any][]).values(),
  );

  const filteredPacks = (mergedPacks as any[]).filter(
    (p) =>
      (activeTab === 'all' || p.type === activeTab) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const activePacks = (runStats.activePackIds || []).length;

  const getPackTypeDef = (type: string) =>
    packTypes[type] || { color: '#64748b', icon: '📦', label: type };

  return (
    <div className="absolute inset-0 z-[120] flex items-center justify-center p-2 md:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-slate-900/95 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col h-full max-h-[95vh] overflow-hidden backdrop-blur-3xl relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0 bg-slate-900/50 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl grimoire-pulse">📜</span>
            <div>
              <h2 className="text-xl font-black tracking-widest text-white uppercase font-serif leading-none">
                The Grimoire
              </h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-1 font-bold">
                Community Content Archives
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadAll}
              disabled={isFetching}
              className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
              title="Refresh"
            >
              <motion.span
                animate={isFetching ? { rotate: 360 } : {}}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                {isFetching ? '⏳' : '🔄'}
              </motion.span>
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest rounded-lg border border-slate-700"
            >
              Import
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-rose-900 text-slate-300 rounded-lg transition-colors border border-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="bg-slate-950/50 border-b border-slate-800 shrink-0 px-4 py-2 relative z-10">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
              🔍
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search packs by name or description..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white text-xs focus:border-violet-500 outline-none placeholder:text-slate-600 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabs — driven by packTypes from registry */}
        <div className="bg-slate-900/50 border-b border-slate-800 shrink-0 p-3 flex gap-2 overflow-x-auto no-scrollbar relative z-10">
          {tabs.slice(0, 10).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'py-2 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border',
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg border-violet-400/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700',
              )}
            >
              {tab.id !== 'all' && <span className="mr-1">{getPackTypeDef(tab.id).icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 bg-slate-950/20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPacks.map((pack: any) => {
                const isInstalled = (pack as any).isInstalled;
                const isActive =
                  (pack as any).isTemplate || runStats.activePackIds?.includes(pack.id);
                const typeDef = getPackTypeDef(pack.type);
                const isLegendaryPack = pack.type === 'mega';

                return (
                  <motion.div
                    key={pack.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={clsx(
                      'group bg-slate-900 border rounded-2xl p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden cursor-default',
                      isActive
                        ? 'border-violet-500/60 shadow-violet-900/10'
                        : 'border-slate-800 hover:border-slate-700',
                    )}
                    style={{ borderTopColor: typeDef.color, borderTopWidth: '2px' }}
                  >
                    {/* Type-colored top accent */}
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
                      style={{
                        background: `linear-gradient(90deg, ${typeDef.color}, transparent)`,
                      }}
                    />

                    <div className="absolute -top-4 -right-4 text-7xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12 select-none pointer-events-none">
                      {pack.icon}
                    </div>

                    <div className="flex gap-4 relative z-10">
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-3xl border border-slate-800 shrink-0 shadow-inner"
                        style={{ boxShadow: isActive ? `0 0 20px ${typeDef.color}30` : undefined }}
                      >
                        {pack.icon}
                      </motion.div>
                      <div className="min-w-0 pr-12">
                        <h3 className="text-white font-black uppercase tracking-tight text-sm truncate">
                          {pack.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                          by {pack.author}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-tighter border"
                            style={{
                              color: typeDef.color,
                              borderColor: `${typeDef.color}40`,
                              background: `${typeDef.color}10`,
                            }}
                          >
                            {typeDef.icon} {typeDef.label}
                          </span>
                          {isActive && (
                            <span className="flex items-center gap-1 text-[8px] text-violet-400 font-black uppercase tracking-tighter">
                              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isInstalled && (
                      <div
                        className={clsx(
                          'absolute top-4 right-4 border rounded-md text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5',
                          (pack as any).isTemplate
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                        )}
                      >
                        {(pack as any).isTemplate ? 'Template' : 'Local'}
                      </div>
                    )}

                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium line-clamp-2">
                      {pack.description || 'No description provided.'}
                    </p>

                    <div className="mt-auto space-y-3">
                      {isInstalled ? (
                        <>
                          {(pack as any).isTemplate ? (
                            <div className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center bg-slate-800/50 text-slate-500 border border-slate-700/50">
                              Core Content
                            </div>
                          ) : (
                            <button
                              onClick={() => togglePack(pack.id)}
                              className={clsx(
                                'w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border active:scale-95',
                                isActive
                                  ? 'bg-violet-900/20 text-violet-400 border-violet-500/30 hover:bg-violet-900/40'
                                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-lg shadow-slate-950',
                              )}
                            >
                              {isActive ? 'Deactivate Pack' : 'Activate Pack'}
                            </button>
                          )}
                          <div
                            className={clsx(
                              'grid gap-2',
                              (pack as any).isTemplate ? 'grid-cols-1' : 'grid-cols-3',
                            )}
                          >
                            {!(pack as any).isTemplate && (
                              <button
                                onClick={() => handleEdit(pack.id)}
                                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-700"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleDuplicate(pack.id)}
                              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-700"
                            >
                              Clone
                            </button>
                            {!(pack as any).isTemplate && (
                              <button
                                onClick={() => handleUninstall(pack.id)}
                                className="py-2 bg-slate-900 hover:bg-rose-900 text-slate-500 hover:text-rose-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-800"
                              >
                                Trash
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => installFromRemote((pack as any).packUrl)}
                          className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-900/50 active:scale-95"
                        >
                          Install Pack
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredPacks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
              <span className="text-5xl opacity-20">📜</span>
              <p className="text-xs font-black uppercase tracking-widest opacity-50">
                {searchQuery
                  ? `No packs matching "${searchQuery}"`
                  : 'No packs found in this archive'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-violet-400 font-black uppercase tracking-widest hover:underline"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 shrink-0 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-500 relative z-10">
          <div className="flex items-center gap-4">
            <span
              className={clsx(
                'flex items-center gap-1.5',
                isOnline ? 'text-emerald-400' : 'text-rose-400',
              )}
            >
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500',
                )}
              />
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              {localPacks.length} Packs Installed
            </span>
            {activePacks > 0 && (
              <span className="flex items-center gap-1.5 text-violet-400">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                {activePacks} Active
              </span>
            )}
          </div>
          <div className="opacity-40 font-mono">Grimoire Protocol v3.2</div>
        </div>

        {/* In-modal Toast System — no browser alert() */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className={clsx(
                  'px-5 py-2.5 rounded-xl text-xs font-black shadow-2xl border backdrop-blur-xl whitespace-nowrap',
                  toast.type === 'success' &&
                    'bg-emerald-950/90 text-emerald-300 border-emerald-500/30',
                  toast.type === 'error' && 'bg-rose-950/90    text-rose-300    border-rose-500/30',
                  toast.type === 'warning' &&
                    'bg-amber-950/90   text-amber-300   border-amber-500/30',
                )}
              >
                {toast.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default GrimoireModal;
