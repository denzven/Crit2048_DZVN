import React, { useEffect, useState } from 'react';
import { LeaderboardLogic } from '../engine/leaderboard';
import type { LeaderboardEntry } from '../engine/leaderboard';
import { clsx } from 'clsx';

const LeaderboardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(LeaderboardLogic.getEntries());
  }, []);

  return (
    <div className="absolute inset-0 bg-slate-950 z-[130] flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden backdrop-blur-3xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0 bg-slate-900/50 relative z-10">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-2xl font-black tracking-widest text-white uppercase font-serif leading-none">Hall of Heroes</h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1 font-bold">The Legends of Crit 2048</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-rose-900 text-slate-300 rounded-xl border border-slate-700 transition-colors">✕</button>
        </div>

        {/* List */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-4 bg-slate-950/40 relative z-10">
          {entries.length > 0 ? entries.map((entry, index) => (
            <div key={entry.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 relative group hover:border-indigo-500/50 transition-all shadow-xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{entry.icon}</span>
                  <div>
                    <h4 className="text-white font-black uppercase text-sm">{entry.class}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      {new Date(entry.date).toLocaleDateString()} • {Math.floor(entry.duration / 60000)}m {Math.floor((entry.duration % 60000) / 1000)}s
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-rose-500 font-black text-xl leading-none italic">ANTE {entry.ante}</span>
                  <span className="text-[9px] text-slate-600 font-mono uppercase font-black mt-1">Rank #{index + 1}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/50 text-center">
                  <span className="block text-[8px] text-slate-500 uppercase font-black mb-1 tracking-tighter">Max DMG</span>
                  <span className="text-amber-400 font-black text-sm">{Math.floor(entry.maxDamage)}</span>
                </div>
                <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/50 text-center">
                  <span className="block text-[8px] text-slate-500 uppercase font-black mb-1 tracking-tighter">Moves</span>
                  <span className="text-indigo-400 font-black text-sm">{entry.totalMoves}</span>
                </div>
                <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/50 text-center">
                  <span className="block text-[8px] text-slate-500 uppercase font-black mb-1 tracking-tighter">Multiplier</span>
                  <span className="text-rose-400 font-black text-sm">x{entry.maxMultiplier.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 px-1">
                <span className="text-[9px] text-slate-600 font-mono italic truncate max-w-[70%]">Reason: {entry.reason || "Unknown"}</span>
                <span className="text-[8px] text-slate-700 font-mono">Seed: {entry.seed}</span>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-4 opacity-50">
              <span className="text-6xl">⚔️</span>
              <p className="text-xs font-black uppercase tracking-widest text-center px-10">No legends recorded yet.<br/>Descend into the dungeon to make history!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-center relative z-10">
          <p className="text-[8px] text-slate-600 uppercase tracking-[0.3em] font-black">Crit 2048 — Hall of Heroes v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
