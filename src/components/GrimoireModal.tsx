import React, { useState } from 'react';
import { useGameStore } from '../engine/gameStore';
import { clsx } from 'clsx';

const GrimoireModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'mega', label: 'Mega' },
    { id: 'dungeon', label: 'Enemies' },
    { id: 'class', label: 'Class' },
    { id: 'weapon', label: 'Weapon' },
    { id: 'artifacts', label: 'Artifact' },
    { id: 'skin', label: 'Skin' },
  ];

  const dummyPacks = [
    { id: 'default', name: 'Crit 2048 — Default Mega Pack', author: 'denzven', type: 'mega', icon: '🐉', desc: 'The complete built-in game content.', installed: true },
    { id: 'shadowfell', name: 'Shadowfell Noir Skin', author: 'denzven', type: 'skin', icon: '🌌', desc: 'A dark, void-themed aesthetic with purple pulses.', installed: false },
    { id: 'undead-legion', name: 'Undead Legion', author: 'denzven', type: 'dungeon', icon: '💀', desc: 'New skeleton variants and lich bosses.', installed: false },
  ];

  const filteredPacks = dummyPacks.filter(p => 
    (activeTab === 'all' || p.type === activeTab) && 
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="absolute inset-0 bg-slate-950 z-[120] flex items-center justify-center p-2 md:p-4">
      <div className="bg-slate-900/95 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col h-full max-h-[95vh] overflow-hidden backdrop-blur-3xl relative">
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
            <button className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700">🔍</button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest rounded-lg border border-slate-700">Import</button>
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
            {filteredPacks.map(pack => (
              <div key={pack.id} className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-rose-500/50 transition-all shadow-xl relative overflow-hidden">
                <div className="absolute -top-4 -right-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12">{pack.icon}</div>
                <div className="flex gap-4 relative z-10">
                  <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-3xl border border-slate-800 shrink-0 shadow-inner">{pack.icon}</div>
                  <div className="min-w-0">
                    <h3 className="text-white font-black uppercase tracking-tight text-sm truncate">{pack.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">by {pack.author}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[8px] font-black rounded uppercase tracking-tighter border border-slate-700">{pack.type}</span>
                      {pack.installed && <span className="flex items-center gap-1 text-[8px] text-emerald-400 font-black uppercase tracking-tighter"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Installed</span>}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium line-clamp-2">{pack.desc}</p>
                <button className={clsx(
                  "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  pack.installed ? "bg-slate-800 text-slate-500 border-slate-700 cursor-default" : "bg-rose-600 hover:bg-rose-500 text-white border-rose-400/20 active:scale-95 shadow-lg shadow-rose-900/40"
                )}>
                  {pack.installed ? 'Already Installed' : 'Install Pack'}
                </button>
              </div>
            ))}
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
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Installed</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Advanced</span>
          </div>
          <div className="opacity-40 font-mono">Grimoire Protocol v3.1</div>
        </div>
      </div>
    </div>
  );
};

export default GrimoireModal;
