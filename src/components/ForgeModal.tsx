import React, { useState } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import type { 
  PackData, 
  EnemyDef, 
  ClassDef, 
  ArtifactDef, 
  WeaponDef, 
  HazardDef 
} from '../types/pack';
import { GameStorage } from '../engine/storage';

const INITIAL_PACK: PackData = {
  id: '',
  name: '',
  version: '1.0.0',
  author: '',
  description: '',
  type: 'mega',
  game_version: '>=1.0.0',
  icon: '📦',
  monsters: [],
  heroes: [],
  artifacts: [],
  arsenal: [],
  themes: {
    primaryColor: '#f43f5e',
    accentColor: '#facc15',
    bgColor: '#020617',
    surfaceColor: '#0f172a',
    borderRadius: '1rem',
    bgImage: '',
    fontFamily: '',
    customCss: ''
  }
};

const ForgeModal: React.FC<{ initialData?: PackData | null, onClose: () => void }> = ({ initialData, onClose }) => {
  const [step, setStep] = useState(1);
  const [activeSubTab, setActiveSubTab] = useState<'artifacts' | 'monsters' | 'heroes' | 'arsenal' | 'fates' | 'themes' | 'tunes' | 'hazards'>('monsters');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [pack, setPack] = useState<PackData>(initialData || INITIAL_PACK);
  const [editorMode, setEditorMode] = useState<'visual' | 'source'>('visual');
  const [logicMode, setLogicMode] = useState<'visual' | 'code'>('visual');
  const totalSteps = 4;
  const steps = [
    { id: 1, title: 'Meta', icon: '📝' },
    { id: 2, title: 'Content', icon: '👹' },
    { id: 3, title: 'Visuals', icon: '🎨' },
    { id: 4, title: 'Export', icon: '💾' }
  ];

  const updatePack = (updates: Partial<PackData>) => {
    setPack(prev => ({ ...prev, ...updates }));
  };

  const updateSkin = (updates: Partial<NonNullable<PackData['themes']>>) => {
    setPack(prev => ({
      ...prev,
      themes: { ...prev.themes, ...updates } as any
    }));
  };

  const exportPack = () => {
    if (!pack.id || !pack.name) {
      alert("Please enter at least a Pack ID and Name.");
      return;
    }
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.id || 'pack'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const playPack = async () => {
    if (!pack.id || !pack.name) {
      alert("Please enter at least a Pack ID and Name.");
      return;
    }
    try {
      await GameStorage.savePack(pack);
      // We need to trigger a reload of the registry and set active IDs
      const store = (window as any).useGameStore?.getState();
      if (store) {
        const activeIds = store.runStats.activePackIds || [];
        if (!activeIds.includes(pack.id)) {
          store.setState({ runStats: { ...store.runStats, activePackIds: [...activeIds, pack.id] } });
        }
        await store.initializeRegistry();
        alert("Pack saved and activated! Ready to play.");
        onClose();
      }
    } catch (err) {
      alert("Error saving pack for play.");
    }
  };

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
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0 bg-slate-900/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚒️</span>
            <div>
              <h2 className="text-xl font-black tracking-widest text-white uppercase font-serif leading-none">The Forge</h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-1 font-bold">Content Pack Creator</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={playPack}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
            >
              Play Pack
            </button>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-rose-900 text-slate-300 rounded-lg border border-slate-700 transition-colors">✕</button>
          </div>
        </div>

        {/* Wizard Progress */}
        <div className="flex border-b border-slate-800 shrink-0 bg-slate-950/50 p-2 gap-2 overflow-x-auto no-scrollbar">
          {steps.map(s => (
            <button 
              key={s.id}
              onClick={() => setStep(s.id)}
              className={clsx(
                "flex-1 min-w-[120px] py-2.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border",
                step === s.id ? "bg-indigo-600 text-white border-indigo-400 shadow-inner" : "bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300"
              )}
            >
              <span>{s.icon}</span>
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 bg-slate-950/20">
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                  <h3 className="text-white font-black uppercase tracking-widest text-xs border-b border-slate-800 pb-3">Pack Identification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pack Unique ID</label>
                      <input 
                        type="text" 
                        value={pack.id}
                        onChange={e => updatePack({ id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                        placeholder="e.g. dragon-expansion" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:border-rose-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Display Name</label>
                      <input 
                        type="text" 
                        value={pack.name}
                        onChange={e => updatePack({ name: e.target.value })}
                        placeholder="e.g. The Dragon King" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pack Type</label>
                      <select 
                        value={pack.type}
                        onChange={e => updatePack({ type: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none"
                      >
                        <option value="mega">Mega Bundle</option>
                        <option value="dungeon">Dungeon (Enemies)</option>
                        <option value="class">Hero Class</option>
                        <option value="weapon">Weapon Pack</option>
                        <option value="skin">Visual Skin</option>
                        <option value="artifacts">Artifact Set</option>
                        <option value="hazard">Hazard Pack</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Author</label>
                      <input 
                        type="text" 
                        value={pack.author}
                        onChange={e => updatePack({ author: e.target.value })}
                        placeholder="Your Name" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      value={pack.description}
                      onChange={e => updatePack({ description: e.target.value })}
                      placeholder="What does this pack add to the game?" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs min-h-[80px] focus:border-rose-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* SUB-TABS FOR CONTENT TYPES */}
                <div className="grid grid-cols-5 gap-2">
                  {['monsters', 'hazards', 'artifacts', 'heroes', 'arsenal', 'fates', 'themes'].map(t => (
                    <button 
                      key={t}
                      onClick={() => {
                        setActiveSubTab(t as any);
                        setEditingIndex(null);
                      }}
                      className={clsx(
                        "py-2 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border transition-all",
                        activeSubTab === t ? "bg-rose-600 border-rose-400 text-white" : "bg-slate-800 border-slate-700 text-slate-400"
                      )}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)} ({Array.isArray(pack[t as keyof PackData]) ? (pack[t as keyof PackData] as any[]).length : 0})
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {editingIndex !== null && (pack[activeSubTab as keyof PackData] as any[])?.[editingIndex] ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
                      {/* Editor Column */}
                      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                          <div className="flex items-center gap-4">
                            <h4 className="text-white font-black uppercase tracking-widest text-sm">Editing {activeSubTab.slice(0, -1)}</h4>
                            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                              <button 
                                onClick={() => setEditorMode('visual')}
                                className={clsx(
                                  "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                                  editorMode === 'visual' ? "bg-rose-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                                )}
                              >
                                Visual
                              </button>
                              <button 
                                onClick={() => setEditorMode('source')}
                                className={clsx(
                                  "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                                  editorMode === 'source' ? "bg-rose-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                                )}
                              >
                                Source
                              </button>
                            </div>
                          </div>
                          <button onClick={() => setEditingIndex(null)} className="text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest">Done</button>
                        </div>

                        {editorMode === 'visual' ? (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Icon</label>
                                <input 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-center text-2xl"
                                  value={(pack[activeSubTab as keyof PackData] as any[])[editingIndex].icon}
                                  onChange={e => {
                                    const list = [...(pack[activeSubTab as keyof PackData] as any[])];
                                    list[editingIndex] = { ...list[editingIndex], icon: e.target.value };
                                    updatePack({ [activeSubTab]: list });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Internal ID</label>
                                <input 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono"
                                  value={(pack[activeSubTab as keyof PackData] as any[])[editingIndex].id}
                                  onChange={e => {
                                    const list = [...(pack[activeSubTab as keyof PackData] as any[])];
                                    list[editingIndex] = { ...list[editingIndex], id: e.target.value };
                                    updatePack({ [activeSubTab]: list });
                                  }}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Display Name</label>
                              <input 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs"
                                value={(pack[activeSubTab as keyof PackData] as any[])[editingIndex].name}
                                onChange={e => {
                                  const list = [...(pack[activeSubTab as keyof PackData] as any[])];
                                  list[editingIndex] = { ...list[editingIndex], name: e.target.value };
                                  updatePack({ [activeSubTab]: list });
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Raw Entry Source</label>
                              <span className="text-[8px] text-slate-600 font-bold uppercase">JSON — Advanced Only</span>
                            </div>
                            <textarea 
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-rose-500 text-[10px] font-mono min-h-[400px] focus:border-rose-500 outline-none"
                              spellCheck={false}
                              value={JSON.stringify((pack[activeSubTab as keyof PackData] as any[])[editingIndex], null, 2)}
                              onChange={e => {
                                try {
                                  const entry = JSON.parse(e.target.value);
                                  const list = [...(pack[activeSubTab as keyof PackData] as any[])];
                                  list[editingIndex] = entry;
                                  updatePack({ [activeSubTab]: list });
                                } catch (err) {}
                              }}
                            />
                          </div>
                        )}

                        {editorMode === 'visual' && (
                          <>
                            {/* DYNAMIC FIELDS PER CONTENT TYPE */}
                        {activeSubTab === 'artifacts' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rarity</label>
                              <select 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs"
                                value={(pack.artifacts as any[])[editingIndex].rarity}
                                onChange={e => {
                                  const list = [...(pack.artifacts || [])];
                                  list[editingIndex] = { ...list[editingIndex], rarity: e.target.value };
                                  updatePack({ artifacts: list });
                                }}
                              >
                                <option value="Common">Common</option>
                                <option value="Rare">Rare</option>
                                <option value="Epic">Epic</option>
                                <option value="Legendary">Legendary</option>
                                <option value="Artifact">Artifact</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Price</label>
                              <input 
                                type="number"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs"
                                value={(pack.artifacts as any[])[editingIndex].basePrice}
                                onChange={e => {
                                  const list = [...(pack.artifacts || [])];
                                  list[editingIndex] = { ...list[editingIndex], basePrice: parseInt(e.target.value) };
                                  updatePack({ artifacts: list });
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {activeSubTab === 'heroes' && (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">D20 Modifier</label>
                              <input 
                                type="number"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs"
                                value={(pack.heroes as any[])[editingIndex].d20Mod}
                                onChange={e => {
                                  const list = [...(pack.heroes || [])];
                                  list[editingIndex] = { ...list[editingIndex], d20Mod: parseInt(e.target.value) };
                                  updatePack({ heroes: list });
                                }}
                              />
                            </div>
                            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-4">
                              <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-slate-800 pb-2">Active Ability (Spell)</h5>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-700 uppercase">Name</label>
                                  <input 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-white text-[10px]"
                                    value={(pack.heroes as any[])[editingIndex].ability?.name || ''}
                                    onChange={e => {
                                      const list = [...(pack.heroes || [])];
                                      list[editingIndex] = { ...list[editingIndex], ability: { ...list[editingIndex].ability, name: e.target.value } };
                                      updatePack({ heroes: list });
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-700 uppercase">Die Sides (D?)</label>
                                  <input 
                                    type="number"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-white text-[10px]"
                                    value={(pack.heroes as any[])[editingIndex].ability?.sides || 6}
                                    onChange={e => {
                                      const list = [...(pack.heroes || [])];
                                      list[editingIndex] = { ...list[editingIndex], ability: { ...list[editingIndex].ability, sides: parseInt(e.target.value) } };
                                      updatePack({ heroes: list });
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-700 uppercase">Max Uses</label>
                                  <input 
                                    type="number"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-white text-[10px]"
                                    value={(pack.heroes as any[])[editingIndex].ability?.maxUses || 1}
                                    onChange={e => {
                                      const list = [...(pack.heroes || [])];
                                      list[editingIndex] = { ...list[editingIndex], ability: { ...list[editingIndex].ability, maxUses: parseInt(e.target.value) } };
                                      updatePack({ heroes: list });
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-700 uppercase">Type</label>
                                  <select 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-white text-[10px]"
                                    value={(pack.heroes as any[])[editingIndex].ability?.type || 'damage'}
                                    onChange={e => {
                                      const list = [...(pack.heroes || [])];
                                      list[editingIndex] = { ...list[editingIndex], ability: { ...list[editingIndex].ability, type: e.target.value } };
                                      updatePack({ heroes: list });
                                    }}
                                  >
                                    <option value="damage">Damage</option>
                                    <option value="heal">Heal (Slides)</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeSubTab === 'arsenal' && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Damage</label>
                            <input 
                              type="number"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs"
                              value={(pack.arsenal as any[])[editingIndex].dmg}
                              onChange={e => {
                                const list = [...(pack.arsenal || [])];
                                list[editingIndex] = { ...list[editingIndex], dmg: parseInt(e.target.value) };
                                updatePack({ arsenal: list });
                              }}
                            />
                          </div>
                        )}

                        {activeSubTab === 'monsters' && (
                          <div className="space-y-4 pt-4 border-t border-slate-800">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Behavior Profile</label>
                              <select 
                                className="bg-slate-950 border border-slate-800 text-white text-[10px] rounded-lg px-2 py-1 outline-none focus:border-rose-500"
                                value={(pack.monsters as any[])[editingIndex].mode}
                                onChange={e => {
                                  const list = [...(pack.monsters || [])];
                                  list[editingIndex] = { ...list[editingIndex], mode: e.target.value as any };
                                  updatePack({ monsters: list });
                                }}
                              >
                                <option value="simple">Simple (Passive)</option>
                                <option value="advanced">Advanced (Scripted)</option>
                              </select>
                            </div>

                            {(pack.monsters as any[])[editingIndex].mode === 'simple' ? (
                              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Passive Power</label>
                                  <select 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs"
                                    value={(pack.monsters as any[])[editingIndex].passiveAbility?.effect || 'none'}
                                    onChange={e => {
                                      const list = [...(pack.monsters || [])];
                                      const effect = e.target.value;
                                      list[editingIndex] = { 
                                        ...list[editingIndex], 
                                        passiveAbility: effect === 'none' ? undefined : { effect, effectParam: 10 } 
                                      };
                                      updatePack({ monsters: list });
                                    }}
                                  >
                                    <option value="none">No Passive</option>
                                    <option value="damage_reduction">🛡️ Tough (Reduce DMG)</option>
                                    <option value="regen">🩹 Regen (Heal per turn)</option>
                                    <option value="drain_slides">⏳ Drain (Reduce Slides)</option>
                                  </select>
                                </div>
                                {((pack.monsters as any[])[editingIndex].passiveAbility) && (
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Power Magnitude</label>
                                    <input 
                                      type="number"
                                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs"
                                      value={(pack.monsters as any[])[editingIndex].passiveAbility?.effectParam || 0}
                                      onChange={e => {
                                        const list = [...(pack.monsters || [])];
                                        list[editingIndex] = { 
                                          ...list[editingIndex], 
                                          passiveAbility: { ...list[editingIndex].passiveAbility, effectParam: parseInt(e.target.value) } 
                                        };
                                        updatePack({ monsters: list });
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Advanced Scripting</label>
                                  <span className="text-[8px] text-slate-600 font-bold uppercase">JSON Logic</span>
                                </div>
                                <textarea 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-rose-500 text-[10px] font-mono min-h-[120px] focus:border-rose-500 outline-none"
                                  spellCheck={false}
                                  value={JSON.stringify((pack.monsters as any[])[editingIndex].script || {}, null, 2)}
                                  onChange={e => {
                                    try {
                                      const script = JSON.parse(e.target.value);
                                      const list = [...(pack.monsters || [])];
                                      list[editingIndex] = { ...list[editingIndex], script };
                                      updatePack({ monsters: list });
                                    } catch (err) {}
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lore / Description</label>
                          <textarea 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs min-h-[60px]"
                            value={(pack[activeSubTab as keyof PackData] as any[])[editingIndex].lore || (pack[activeSubTab as keyof PackData] as any[])[editingIndex].desc}
                            onChange={e => {
                              const list = [...(pack[activeSubTab as keyof PackData] as any[])];
                              if (activeSubTab === 'monsters') list[editingIndex] = { ...list[editingIndex], lore: e.target.value };
                              else list[editingIndex] = { ...list[editingIndex], desc: e.target.value };
                              updatePack({ [activeSubTab]: list });
                            }}
                          />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-800">
                           <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Logic & Hooks</label>
                              <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                                <button 
                                  onClick={() => setLogicMode('visual')}
                                  className={clsx(
                                    "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                                    logicMode === 'visual' ? "bg-rose-600 text-white" : "text-slate-500"
                                  )}
                                >
                                  Visual
                                </button>
                                <button 
                                  onClick={() => setLogicMode('code')}
                                  className={clsx(
                                    "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                                    logicMode === 'code' ? "bg-rose-600 text-white" : "text-slate-500"
                                  )}
                                >
                                  Code
                                </button>
                              </div>
                           </div>

                           {logicMode === 'visual' ? (
                             <div className="space-y-3">
                               {[
                                 { id: 'onSlide', label: 'On Slide', icon: '↔️' },
                                 { id: 'onMerge', label: 'On Merge', icon: '💎' },
                                 { id: 'onDamage', label: 'On Damage', icon: '💥' },
                                 { id: 'onD20', label: 'On D20 Roll', icon: '🎲' },
                                 { id: 'onEncounterStart', label: 'On Battle Start', icon: '⚔️' }
                               ].map(hook => {
                                 const current = (pack[activeSubTab as keyof PackData] as any[])[editingIndex];
                                 const scripts = current.passiveTriggers || {};
                                 const script = scripts[hook.id] ? JSON.stringify(scripts[hook.id], null, 2) : "";
                                 
                                 return (
                                   <div key={hook.id} className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-3 space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                          <span className="text-xs">{hook.icon}</span> {hook.label}
                                        </span>
                                        {script ? (
                                          <button 
                                            onClick={() => {
                                              const list = [...(pack[activeSubTab as keyof PackData] as any[])];
                                              const newTriggers = { ...scripts };
                                              delete newTriggers[hook.id];
                                              list[editingIndex] = { ...current, passiveTriggers: newTriggers };
                                              updatePack({ [activeSubTab]: list });
                                            }}
                                            className="text-[8px] text-rose-500 font-bold uppercase hover:underline"
                                          >
                                            Clear
                                          </button>
                                        ) : (
                                          <select 
                                            className="bg-slate-900 text-[8px] font-black uppercase text-rose-400 border-none outline-none cursor-pointer"
                                            onChange={e => {
                                              if (!e.target.value) return;
                                              const list = [...(pack[activeSubTab as keyof PackData] as any[])];
                                              let actions: any[] = [];
                                              if (e.target.value === 'gold') actions = [{ type: 'add_gold', amount: 10 }, { type: 'log', stringParam: 'Gold found!' }];
                                              if (e.target.value === 'hazard') actions = [{ type: 'spawn_hazard', amount: -1 }, { type: 'log', stringParam: 'Something spawned...' }];
                                              if (e.target.value === 'heal') actions = [{ type: 'regen', target: 'player', amount: 2 }, { type: 'log', stringParam: 'Life restored!' }];
                                              if (e.target.value === 'damage') actions = [{ type: 'deal_damage', target: 'enemy', amount: 50 }, { type: 'log', stringParam: 'Direct strike!' }];
                                              
                                              const newTriggers = { ...scripts, [hook.id]: actions };
                                              list[editingIndex] = { ...current, passiveTriggers: newTriggers, mode: 'advanced' };
                                              updatePack({ [activeSubTab]: list });
                                            }}
                                            value=""
                                          >
                                            <option value="">+ Add Effect</option>
                                            <option value="gold">💰 Add Gold</option>
                                            <option value="hazard">⚠️ Spawn Hazard</option>
                                            <option value="heal">💖 Restore Slides</option>
                                            <option value="damage">⚔️ Deal Damage</option>
                                            <option value="shake">🫨 Screen Shake</option>
                                          </select>
                                        )}
                                      </div>
                                      {script && (
                                        <div className="bg-slate-900/50 rounded-lg px-3 py-2 border border-rose-500/10">
                                          <p className="text-[9px] text-rose-400/80 font-mono line-clamp-2">{script}</p>
                                        </div>
                                      )}
                                   </div>
                                 );
                               })}
                             </div>
                           ) : (
                             <textarea 
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-rose-500 text-[10px] font-mono min-h-[150px] focus:border-rose-500 outline-none"
                              spellCheck={false}
                              value={JSON.stringify((pack[activeSubTab as keyof PackData] as any[])[editingIndex].passiveTriggers || {}, null, 2)}
                              onChange={e => {
                                try {
                                  const triggers = JSON.parse(e.target.value);
                                  const list = [...(pack[activeSubTab as keyof PackData] as any[])];
                                  list[editingIndex] = { ...list[editingIndex], passiveTriggers: triggers, mode: 'advanced' };
                                  updatePack({ [activeSubTab]: list });
                                } catch (err) {}
                              }}
                            />
                           )}
                        </div>
                      </>
                    )}
                  </div>

                      {/* Preview Column */}
                      <div className="space-y-6">
                         <div className="bg-slate-950/50 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none"></div>
                            
                            <h5 className="absolute top-6 left-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Live Simulation</h5>
                            
                            {activeSubTab === 'monsters' && (
                              <div className="w-full space-y-8 animate-in fade-in zoom-in duration-500">
                                <div className="flex flex-col items-center gap-4">
                                   <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border border-slate-800 ring-4 ring-rose-500/10 group-hover:scale-110 transition-transform">
                                      {(pack.monsters as any[])[editingIndex].icon}
                                   </div>
                                   <div className="text-center">
                                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{(pack.monsters as any[])[editingIndex].name}</h3>
                                      <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">{(pack.monsters as any[])[editingIndex].hp} HP / {(pack.monsters as any[])[editingIndex].slides} Slides</p>
                                   </div>
                                </div>
                                <div className="space-y-2">
                                   <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                      <div className="h-full bg-rose-600 w-3/4"></div>
                                   </div>
                                   <p className="text-center text-[9px] text-slate-500 font-medium italic">"{(pack.monsters as any[])[editingIndex].lore}"</p>
                                </div>
                              </div>
                            )}

                            {activeSubTab === 'artifacts' && (
                              <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                                 <div className="w-32 h-32 bg-slate-900 rounded-[2rem] flex items-center justify-center text-6xl shadow-2xl border border-slate-800 relative">
                                    <div className="absolute -top-2 -right-2 bg-rose-600 text-white text-[8px] font-black px-2 py-1 rounded-lg">{(pack.artifacts as any[])[editingIndex].rarity}</div>
                                    {(pack.artifacts as any[])[editingIndex].icon}
                                 </div>
                                 <div className="text-center space-y-2">
                                    <h4 className="text-xl font-black text-white">{(pack.artifacts as any[])[editingIndex].name}</h4>
                                    <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed font-medium italic">{(pack.artifacts as any[])[editingIndex].desc}</p>
                                    <p className="text-amber-500 font-mono font-black">💰{(pack.artifacts as any[])[editingIndex].basePrice}</p>
                                 </div>
                              </div>
                            )}

                            {activeSubTab === 'arsenal' && (
                              <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                                 <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-5xl shadow-2xl border border-white/20">
                                    {(pack.arsenal as any[])[editingIndex].icon}
                                 </div>
                                 <div className="text-center">
                                    <h4 className="text-lg font-black text-white">{(pack.arsenal as any[])[editingIndex].name}</h4>
                                    <div className="mt-2 inline-flex items-center gap-2 bg-rose-500/20 text-rose-500 px-3 py-1 rounded-full border border-rose-500/30">
                                       <span className="text-[10px] font-black uppercase tracking-widest">Base DMG</span>
                                       <span className="font-mono font-black">{(pack.arsenal as any[])[editingIndex].dmg}</span>
                                    </div>
                                 </div>
                              </div>
                            )}
                         </div>

                         <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Integrity Report</h6>
                            <div className="space-y-3">
                               {!(pack[activeSubTab as keyof PackData] as any[])[editingIndex].id && (
                                 <div className="flex items-center gap-3 text-amber-500 text-[10px] font-bold bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                                    <span>⚠️</span>
                                    <span>Internal ID is missing. Entry will be ignored during export.</span>
                                 </div>
                               )}
                               {!(pack[activeSubTab as keyof PackData] as any[])[editingIndex].name && (
                                 <div className="flex items-center gap-3 text-amber-500 text-[10px] font-bold bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                                    <span>⚠️</span>
                                    <span>Display Name is missing. Will show as "Untitled".</span>
                                 </div>
                               )}
                               <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-bold bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                                  <span>✅</span>
                                  <span>Data structure is valid for transmission.</span>
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {(pack[activeSubTab as keyof PackData] as any[])?.map((item: any, idx: number) => (
                        <div key={idx} onClick={() => setEditingIndex(idx)} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex gap-4 items-center group cursor-pointer hover:bg-slate-800 transition-colors">
                          <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center text-2xl border border-slate-800 shrink-0">{item.icon || '❓'}</div>
                          <div className="flex-grow min-w-0">
                            <h4 className="text-white font-bold text-xs truncate">{item.name || 'Untitled'}</h4>
                            <p className="text-[10px] text-slate-500 font-mono uppercase truncate">{item.id || 'no-id'}</p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const list = [...(pack[activeSubTab as keyof PackData] as any[])];
                              list.splice(idx, 1);
                              updatePack({ [activeSubTab]: list });
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      <button 
                        onClick={() => {
                          const list = [...(pack[activeSubTab as keyof PackData] as any[]) || []];
                          const newEntry = activeSubTab === 'monsters' 
                            ? { id: `new-${activeSubTab}-${list.length}`, name: `New Monster`, icon: '👹', hp: 100, slides: 20, lore: 'Description here', mode: 'simple' }
                            : { id: `new-${activeSubTab}-${list.length}`, name: `New Entry`, icon: '❓', desc: 'Description here', mode: 'simple' };
                          list.push(newEntry);
                          updatePack({ [activeSubTab]: list });
                          setEditingIndex(list.length - 1);
                        }}
                        className="w-full py-4 border-2 border-dashed border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-rose-500/50 hover:text-rose-500 transition-all flex flex-col items-center gap-2"
                      >
                        <span>+ Add New Entry</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                 <h3 className="text-white font-black uppercase tracking-widest text-xs border-b border-slate-800 pb-3">Theme & Aesthetic</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Primary', key: 'primaryColor' },
                      { label: 'Accent', key: 'accentColor' },
                      { label: 'Background', key: 'bgColor' },
                      { label: 'Surface', key: 'surfaceColor' },
                    ].map(c => (
                      <div key={c.key} className="space-y-2 text-center">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{c.label}</label>
                        <div className="relative group">
                          <input 
                            type="color" 
                            value={(pack.themes as any)?.[c.key] || '#000000'}
                            onChange={e => updateSkin({ [c.key]: e.target.value })}
                            className="w-full h-10 rounded-xl border border-slate-700 shadow-lg cursor-pointer bg-transparent" 
                          />
                        </div>
                      </div>
                    ))}
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Background Image URL</label>
                      <input 
                        type="text" 
                        value={pack.themes?.bgImage}
                        onChange={e => updateSkin({ bgImage: e.target.value })}
                        placeholder="https://example.com/bg.jpg" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Custom CSS Injection</label>
                      <textarea 
                        value={pack.themes?.customCss}
                        onChange={e => updateSkin({ customCss: e.target.value })}
                        placeholder=".tile-merge { filter: hue-rotate(90deg); }" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono min-h-[100px] focus:border-rose-500 outline-none resize-none"
                      />
                    </div>
                 </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto border-4 border-indigo-500/30 animate-pulse">
                  <span className="text-4xl">💾</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest">Ready for Export</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-2 tracking-widest">Verify your pack data before sealing the grimoire</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-black">
                    <span className="text-slate-500">ID:</span>
                    <span className="text-white">{pack.id || 'none'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-black">
                    <span className="text-slate-500">Name:</span>
                    <span className="text-white">{pack.name || 'none'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-black">
                    <span className="text-slate-500">Entries:</span>
                    <span className="text-white">{(pack.monsters?.length || 0) + (pack.artifacts?.length || 0)} Total</span>
                  </div>
                </div>
                <button 
                  onClick={exportPack}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-2xl shadow-indigo-900/50 transition-all border border-indigo-400/30 active:scale-95"
                >
                  Export Pack as JSON
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md shrink-0 flex justify-between items-center z-10">
          <button 
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            ◀ Back
          </button>
          <div className="flex gap-1">
            {steps.map(s => (
              <div key={s.id} className={clsx("w-1.5 h-1.5 rounded-full transition-all", step === s.id ? "bg-indigo-500 w-4" : "bg-slate-700")}></div>
            ))}
          </div>
          <button 
            disabled={step === totalSteps}
            onClick={() => setStep(s => s + 1)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20"
          >
            Next Step ▶
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgeModal;
