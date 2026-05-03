import React, { useState } from 'react';
import { clsx } from 'clsx';

const ForgeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    { id: 1, title: 'Pack Info', icon: '📄' },
    { id: 2, title: 'Content', icon: '⚔️' },
    { id: 3, title: 'Visuals', icon: '🎨' },
    { id: 4, title: 'Review', icon: '💾' },
  ];

  return (
    <div className="absolute inset-0 bg-slate-950 z-[120] flex items-center justify-center p-2 md:p-4">
      <div className="bg-slate-900/95 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col h-full max-h-[95vh] overflow-hidden backdrop-blur-3xl relative">
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
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95">Play Pack</button>
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
                      <input type="text" placeholder="e.g. dragon-expansion" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:border-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Display Name</label>
                      <input type="text" placeholder="e.g. The Dragon King" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                      <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-indigo-500 outline-none">
                        <option>Enemies</option>
                        <option>Class</option>
                        <option>Weapon</option>
                        <option>Skin</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Icon Emoji</label>
                      <input type="text" placeholder="🐉" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm text-center focus:border-indigo-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4 border-2 border-dashed border-slate-800 rounded-3xl">
                <span className="text-5xl">⚔️</span>
                <p className="text-xs font-black uppercase tracking-widest text-center px-10">Add custom monsters, weapons, or hazards in this section.</p>
                <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-black text-[10px] uppercase tracking-widest rounded-lg border border-slate-700 transition-all">+ Add Content Entry</button>
              </div>
            )}

            {step === 3 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                 <h3 className="text-white font-black uppercase tracking-widest text-xs border-b border-slate-800 pb-3">Theme & Aesthetic</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Primary', 'Accent', 'BG', 'HP'].map(c => (
                      <div key={c} className="space-y-2 text-center">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{c} Color</label>
                        <div className="w-full h-10 bg-rose-600 rounded-xl border border-slate-700 shadow-lg cursor-pointer"></div>
                      </div>
                    ))}
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
                <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-2xl shadow-indigo-900/50 transition-all border border-indigo-400/30 active:scale-95">
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
      </div>
    </div>
  );
};

export default ForgeModal;
