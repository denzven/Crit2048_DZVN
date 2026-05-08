import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useGameStore } from '../engine/gameStore';
import { GameStorage } from '../engine/storage';
import { PackEngine } from '../engine/packEngine';
import { motion } from 'framer-motion';
import {
  CRIT2048_DEFAULT_MEGA_PACK,
  CRIT2048_DEFAULT_MONSTERS_PACK, 
  CRIT2048_DEFAULT_HEROES_PACK, 
  CRIT2048_DEFAULT_ARTIFACTS_PACK, 
  CRIT2048_DEFAULT_ARSENAL_PACK, 
  CRIT2048_DEFAULT_HAZARDS_PACK,
  CRIT2048_DEFAULT_THEMES_PACK,
  CRIT2048_SHADOWFELL_THEMES_PACK,
  CRIT2048_DEFAULT_FATES_PACK,
  CRIT2048_DEFAULT_TUNES_PACK
} from '../engine_core/packs';
import type { PackEntry, PackData } from '../types/pack';

const REGISTRY_URL = "https://raw.githubusercontent.com/denzven/Crit2048-grimoire/main/registry.json";

interface GrimoireProps {
  onClose: () => void;
  onEditPack: (pack: PackData) => void;
}

const GrimoireModal: React.FC<GrimoireProps> = ({ onClose, onEditPack }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [localPacks, setLocalPacks] = useState<PackEntry[]>([]);
  const [remotePacks, setRemotePacks] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { runStats, setState, initializeRegistry } = useGameStore();

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
      CRIT2048_DEFAULT_TUNES_PACK
    ].map(p => ({
      id: p.id,
      name: p.name,
      version: p.version,
      author: p.author,
      type: p.type,
      icon: p.icon,
      description: p.description,
      isTemplate: true
    } as any));

    setLocalPacks([...templates, ...installed]);
  };

  const fetchCommunityPacks = async () => {
    setIsFetching(true);
    try {
      const resp = await fetch(REGISTRY_URL, { cache: 'no-store' });
      if (!resp.ok) throw new Error("Network error");
      const data = await resp.json();
      setRemotePacks(data.packs || []);
      setIsOnline(true);
    } catch (err) {
      console.warn("Grimoire: Could not fetch community packs", err);
      setIsOnline(false);
    } finally {
      setIsFetching(false);
    }
  };

  const installFromRemote = async (packUrl: string) => {
    if (!packUrl) return;
    try {
      const resp = await fetch(packUrl);
      if (!resp.ok) throw new Error("Failed to fetch pack JSON");
      const packData = await resp.json();
      
      if (packData.hasAdvancedScripts) {
        if (!confirm("⚠️ ADVANCED PACK WARNING ⚠️\n\nThis pack contains custom scripting. Install only if you trust the source.")) return;
      }

      await GameStorage.savePack(packData);
      await loadLocalPacks();
      alert(`Successfully installed: ${packData.name}`);
    } catch (err) {
      alert("Error installing pack.");
    }
  };

  const togglePack = async (id: string) => {
    const current = runStats.activePackIds || [];
    let updated;
    if (current.includes(id)) {
      updated = current.filter(p => p !== id);
    } else {
      updated = [...current, id];
    }
    
    setState({ runStats: { ...runStats, activePackIds: updated } });
    await PackEngine.applyPacks(updated);
    await initializeRegistry(); // Re-sync data.ts globals
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
          
          let manifest: any = { id: `pack-${Date.now()}`, name: "Imported Pack", type: "mega" };
          const manifestFile = zip.file('manifest.json');
          if (manifestFile) manifest = JSON.parse(await manifestFile.async('string'));
          
          const packData: any = { monsters: [], heroes: [], artifacts: [], arsenal: [], fates: [], hazards: [], tunes: [], themes: undefined };
          
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
        alert(`Successfully imported: ${pack.name}`);
      } catch (err) {
        console.error("Grimoire Import Error:", err);
        alert("Failed to parse or load pack file.");
      }
    };
    input.click();
  };

  const handleDuplicate = async (id: string) => {
    let pack = await GameStorage.loadPack(id);
    if (!pack) {
      // Check templates
      const templates: PackData[] = [
        CRIT2048_DEFAULT_MEGA_PACK, CRIT2048_DEFAULT_MONSTERS_PACK, CRIT2048_DEFAULT_HEROES_PACK,
        CRIT2048_DEFAULT_ARTIFACTS_PACK, CRIT2048_DEFAULT_ARSENAL_PACK, CRIT2048_DEFAULT_HAZARDS_PACK,
        CRIT2048_DEFAULT_THEMES_PACK, CRIT2048_SHADOWFELL_THEMES_PACK, CRIT2048_DEFAULT_FATES_PACK,
        CRIT2048_DEFAULT_TUNES_PACK
      ];
      pack = templates.find((t: PackData) => t.id === id) || null;
    }

    if (pack) {
      const cloned = { ...pack, id: `${pack.id}-copy-${Date.now()}`, name: `${pack.name} (Copy)` };
      await GameStorage.savePack(cloned);
      await loadLocalPacks();
      onEditPack(cloned);
    }
  };

  const handleUninstall = async (id: string) => {
    if (!confirm("Are you sure you want to remove this pack?")) return;
    await GameStorage.deletePack(id);
    loadLocalPacks();
  };

  const handleEdit = async (id: string) => {
    let pack = await GameStorage.loadPack(id);
    if (!pack) {
      // Check templates
      const templates: PackData[] = [
        CRIT2048_DEFAULT_MEGA_PACK, CRIT2048_DEFAULT_MONSTERS_PACK, CRIT2048_DEFAULT_HEROES_PACK,
        CRIT2048_DEFAULT_ARTIFACTS_PACK, CRIT2048_DEFAULT_ARSENAL_PACK, CRIT2048_DEFAULT_HAZARDS_PACK,
        CRIT2048_DEFAULT_THEMES_PACK, CRIT2048_SHADOWFELL_THEMES_PACK, CRIT2048_DEFAULT_FATES_PACK,
        CRIT2048_DEFAULT_TUNES_PACK
      ];
      pack = templates.find((t: PackData) => t.id === id) || null;
    }
    if (pack) onEditPack(pack);
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'mega', label: 'Mega' },
    { id: 'monsters', label: 'Monsters' },
    { id: 'heroes', label: 'Heroes' },
    { id: 'arsenal', label: 'Arsenal' },
    { id: 'artifacts', label: 'Artifacts' },
    { id: 'fates', label: 'Fates' },
    { id: 'hazards', label: 'Hazards' },
    { id: 'themes', label: 'Themes' },
    { id: 'tunes', label: 'Tunes' }
  ];

  const mergedPacks = Array.from(new Map<string, any>([
    ...remotePacks.map(p => [p.id, { ...p, isRemote: true }]),
    ...localPacks.map(p => [p.id, { ...p, isInstalled: true }])
  ] as [string, any][]).values());

  const filteredPacks = (mergedPacks as any[]).filter(p => 
    (activeTab === 'all' || p.type === activeTab) && 
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none"></div>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0 bg-slate-900/50 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <div>
              <h2 className="text-xl font-black tracking-widest text-white uppercase font-serif leading-none">The Grimoire</h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-1 font-bold">Community Content Archives</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={loadAll}
              disabled={isFetching}
              className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
              title="Refresh"
            >
              {isFetching ? '⏳' : '🔄'}
            </button>
            <button 
              onClick={handleImport}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest rounded-lg border border-slate-700"
            >
              Import
            </button>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-rose-900 text-slate-300 rounded-lg transition-colors border border-slate-700">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-900/50 border-b border-slate-800 shrink-0 p-3 flex gap-2 overflow-x-auto no-scrollbar relative z-10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "py-2 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-rose-600 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 bg-slate-950 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPacks.map((pack: any) => {
              const isInstalled = (pack as any).isInstalled;
              const isActive = (pack as any).isTemplate || runStats.activePackIds?.includes(pack.id);
              
              return (
                <div key={pack.id} className={clsx(
                  "group bg-slate-900 border rounded-2xl p-5 flex flex-col gap-4 transition-all shadow-xl relative overflow-hidden",
                  isActive ? "border-rose-500 shadow-rose-900/10" : "border-slate-800 hover:border-slate-700"
                )}>
                  <div className="absolute -top-4 -right-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12">{pack.icon}</div>
                  <div className="flex gap-4 relative z-10">
                    <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-3xl border border-slate-800 shrink-0 shadow-inner">{pack.icon}</div>
                    <div className="min-w-0 pr-12">
                      <h3 className="text-white font-black uppercase tracking-tight text-sm truncate">{pack.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">by {pack.author}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[8px] font-black rounded uppercase tracking-tighter border border-slate-700">{pack.type}</span>
                        {isActive && <span className="flex items-center gap-1 text-[8px] text-rose-400 font-black uppercase tracking-tighter"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span> Active</span>}
                      </div>
                    </div>
                  </div>
                  
                  {isInstalled && (
                    <div className={clsx(
                      "absolute top-4 right-4 border rounded-md text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5",
                      (pack as any).isTemplate ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {(pack as any).isTemplate ? 'Template' : 'Local'}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium line-clamp-2">{pack.description || 'No description provided.'}</p>
                  
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
                              "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                              isActive ? "bg-rose-900/20 text-rose-500 border-rose-500/30 hover:bg-rose-900/40" : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 active:scale-95 shadow-lg shadow-slate-950"
                            )}
                          >
                            {isActive ? 'Deactivate Pack' : 'Activate Pack'}
                          </button>
                        )}
                        <div className={clsx("grid gap-2", (pack as any).isTemplate ? "grid-cols-1" : "grid-cols-3")}>
                          {!(pack as any).isTemplate && (
                            <button onClick={() => handleEdit(pack.id)} className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-700">Edit</button>
                          )}
                          <button onClick={() => handleDuplicate(pack.id)} className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-700">Clone & Customize</button>
                          {!(pack as any).isTemplate && (
                            <button onClick={() => handleUninstall(pack.id)} className="py-2 bg-slate-900 hover:bg-rose-900 text-slate-500 hover:text-rose-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-800">Trash</button>
                          )}
                        </div>
                      </>
                    ) : (
                      <button 
                        onClick={() => installFromRemote((pack as any).packUrl)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/50"
                      >
                        Install Pack
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredPacks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
              <span className="text-5xl opacity-20">📜</span>
              <p className="text-xs font-black uppercase tracking-widest opacity-50">No packs found in this archive</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 shrink-0 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-500 relative z-10">
          <div className="flex items-center gap-4">
            <span className={clsx("flex items-center gap-1.5", isOnline ? "text-emerald-400" : "text-rose-400")}>
              <span className={clsx("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500")}></span> 
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-700"></span> 
              {localPacks.length} Packs Installed
            </span>
          </div>
          <div className="opacity-40 font-mono">Grimoire Protocol v3.1</div>
        </div>
      </motion.div>
    </div>
  );
};

export default GrimoireModal;
