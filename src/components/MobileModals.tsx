import React from 'react';
import { useGameStore } from '../engine/gameStore';

export const MobileInventoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { artifacts } = useGameStore();

  return (
    <div className="absolute inset-0 bg-slate-950/90 z-[200] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300 md:hidden">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-white font-black uppercase tracking-widest text-sm">Inventory</h2>
          <button onClick={onClose} className="text-slate-400 text-xl p-2">✕</button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {artifacts.length > 0 ? artifacts.map((a, i) => (
            <div key={i} className="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex items-center gap-4">
              <span className="text-3xl">{a.icon}</span>
              <div>
                <p className="text-xs font-black text-white uppercase">{a.name}</p>
                <p className="text-[10px] text-amber-400 font-mono">LVL {a.level}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-slate-600 text-xs italic">Empty pockets...</div>
          )}
        </div>
        <div className="p-4 bg-slate-950/50">
           <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white font-black rounded-xl uppercase tracking-widest text-[10px]">Close</button>
        </div>
      </div>
    </div>
  );
};

export const MobileLogsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { logs } = useGameStore();

  return (
    <div className="absolute inset-0 bg-slate-950/90 z-[200] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300 md:hidden">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-white font-black uppercase tracking-widest text-sm">Combat Logs</h2>
          <button onClick={onClose} className="text-slate-400 text-xl p-2">✕</button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 text-[10px] font-mono text-slate-400 space-y-1 custom-scrollbar flex flex-col-reverse">
          {logs.map((log, i) => (
            <div key={i} className="py-1 border-b border-slate-800/50">{log}</div>
          ))}
        </div>
        <div className="p-4 bg-slate-950/50">
           <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white font-black rounded-xl uppercase tracking-widest text-[10px]">Close</button>
        </div>
      </div>
    </div>
  );
};
