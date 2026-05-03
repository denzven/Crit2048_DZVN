import React from 'react';
import { useGameStore } from '../engine/gameStore';
import { clsx } from 'clsx';

const RunStatsModal: React.FC<{ onShowLeaderboard: () => void, onShowShare: () => void }> = ({ onShowLeaderboard, onShowShare }) => {
  const { gameState, runStats, playerClass, encounterIdx, artifacts, resetGame } = useGameStore();

  const isVictory = gameState === 'VICTORY';
  const durationMs = runStats.endTime - runStats.startTime;
  const durationSec = Math.floor(durationMs / 1000);
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 bg-slate-950/90 z-[100] flex flex-col items-center justify-center p-4 overflow-y-auto custom-scrollbar">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] text-center shadow-2xl relative border-t-rose-600/30 animate-in zoom-in duration-500 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className={clsx("text-3xl md:text-5xl font-black mb-1 font-serif uppercase tracking-tight drop-shadow-lg", isVictory ? "text-amber-400" : "text-white")}>
            {isVictory ? 'VICTORY' : 'RUN OVER'}
          </h2>
          <p className="text-slate-500 mb-6 text-[10px] md:text-xs italic px-4 leading-tight uppercase tracking-widest font-bold">
            {isVictory ? 'The dungeon has been conquered.' : 'The dungeon claims another soul.'}
          </p>
          
          {isVictory && (
            <div className="mb-8 animate-bounce">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 rounded-full"></div>
                <span className="text-7xl relative z-10">🏆</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 text-left">
            {/* Details Card */}
            <div className="bg-slate-950/60 rounded-2xl border border-white/5 p-3 md:p-4 space-y-2 shadow-xl backdrop-blur-sm">
              <h3 className="text-slate-600 font-black uppercase tracking-widest text-[8px] border-b border-white/5 pb-1 mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span> Details
              </h3>
              <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-bold">Class</span><span className="text-[10px] font-black text-white">{playerClass?.icon} {playerClass?.name}</span></div>
              <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-bold">Ante</span><span className="text-[10px] font-black text-rose-400">{encounterIdx + 1}</span></div>
              <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-bold">Date</span><span className="text-[10px] font-black text-slate-400">{formatDate(runStats.startTime)}</span></div>
              <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-bold">Duration</span><span className="text-[10px] font-black text-blue-400">{minutes}m {seconds}s</span></div>
            </div>

            {/* Combat Stats Card */}
            <div className="bg-slate-950/60 rounded-2xl border border-white/5 p-3 md:p-4 space-y-2 shadow-xl backdrop-blur-sm">
              <h3 className="text-slate-600 font-black uppercase tracking-widest text-[8px] border-b border-white/5 pb-1 mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-rose-700 rounded-full"></span> Mastery
              </h3>
              <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-bold">Max DMG</span><span className="text-[10px] font-black text-amber-500">{Math.ceil(runStats.maxDamage)}</span></div>
              <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-bold">Max Mult</span><span className="text-[10px] font-black text-rose-500">x{runStats.maxMultiplier.toFixed(1)}</span></div>
              <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-bold">Moves</span><span className="text-[10px] font-black text-indigo-400">{runStats.totalMoves}</span></div>
              <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-bold">Spent</span><span className="text-[10px] font-black text-amber-500">💰 {runStats.totalCoinsSpent}</span></div>
            </div>
          </div>

          {/* Artifacts Card */}
          <div className="bg-slate-950/60 rounded-2xl border border-white/5 p-3 md:p-4 text-left mb-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-slate-600 font-black uppercase tracking-widest text-[8px] border-b border-white/5 pb-1 mb-3">Treasures</h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {artifacts.length > 0 ? artifacts.map((a, i) => (
                <div key={i} className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-lg border border-slate-800 shadow-lg" title={a.name}>
                  {a.icon}
                </div>
              )) : (
                <p className="text-[10px] text-slate-600 italic">No artifacts found.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={onShowShare}
                className="px-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest shadow-lg border border-indigo-500/30 flex items-center justify-center gap-2 group text-[10px] active:scale-95"
              >
                📸 Share
              </button>
              <button className="px-4 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest shadow-lg border border-emerald-500/30 flex items-center justify-center gap-2 group text-[10px] active:scale-95">
                💾 Save
              </button>
            </div>
            
            <button 
              onClick={onShowLeaderboard}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold rounded-2xl transition-all uppercase tracking-widest w-full border border-slate-700 text-xs active:scale-95"
            >
              🏆 Hall of Heroes
            </button>

            <button 
              onClick={resetGame}
              className="px-8 py-5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest w-full border border-rose-500/30 text-sm shadow-xl shadow-rose-950/20 active:scale-95 animate-in slide-in-from-bottom-4 duration-700 delay-300"
            >
              Try Again
            </button>
          </div>
          
          <p className="text-[8px] text-slate-700 mt-8 uppercase tracking-[0.4em] font-black">Crit 2048: Rogue-Like RPG</p>
        </div>
      </div>
    </div>
  );
};

export default RunStatsModal;
