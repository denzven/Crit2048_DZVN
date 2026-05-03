import React from 'react';
import { useGameStore } from '../engine/gameStore';
import { clsx } from 'clsx';

const Tavern: React.FC = () => {
  const { gold, shopItems, buyArtifact, nextEncounter, restoreSpells, upgradeSpell, usesLeft, playerClass, addLog } = useGameStore();

  const upgradeCost = 100 * (playerClass?.ability?.count || 1);

  const respinTavern = () => {
    if (gold >= 5) {
      useGameStore.getState().addGold(-5);
      useGameStore.getState().generateShop();
      addLog("Merchant: Collection respun (💰5)");
    }
  };

  return (
    <div id="screen-tavern" className="w-full flex flex-col h-full relative z-10 px-4">
      <div id="tavern-scroll-area" className="flex-grow overflow-y-auto pb-6 space-y-6 flex flex-col min-h-0 custom-scrollbar">
        <div className="tavern-content max-w-2xl mx-auto w-full">
          <div id="tavern-header" className="text-center mt-8 mb-6 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-4xl md:text-5xl font-black text-amber-500 mb-1 font-serif tracking-tight">Tavern</h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">spend gold to buy or level up artifacts</p>
          </div>
            
          <div className="grid grid-cols-2 gap-4 shrink-0 mb-6">
            {/* Services Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-xl">
              <h3 className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full"></span>
                Services
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={restoreSpells}
                  disabled={gold < 30 || usesLeft >= (playerClass?.ability?.maxUses || 0)}
                  className="py-4 bg-slate-950/40 hover:bg-emerald-950/20 text-emerald-400 font-bold rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border border-slate-800 hover:border-emerald-500/30 group active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">💤</span>
                  <span className="text-xs uppercase tracking-widest font-black">Rest</span>
                  <span className="text-[9px] text-slate-500 font-mono">💰30</span>
                </button>
                <button 
                  onClick={upgradeSpell}
                  disabled={gold < upgradeCost || !playerClass?.ability}
                  className="py-4 bg-slate-950/40 hover:bg-blue-950/20 text-blue-400 font-bold rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border border-slate-800 hover:border-blue-500/30 group active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🔮</span>
                  <span className="text-xs uppercase tracking-widest font-black">Enhance</span>
                  <span className="text-[9px] text-slate-500 font-mono">💰{upgradeCost}</span>
                </button>
              </div>
            </div>

             {/* AI Oracle Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-xl">
               <h3 className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-4 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full"></span>
                 The AI Oracle
               </h3>
               <div className="flex flex-col justify-between h-[calc(100%-2rem)]">
                  <p className="text-[9px] md:text-[10px] text-indigo-400/80 leading-relaxed mb-4 font-medium italic">Seek the wisdom of the machine to forge artifacts of immense power.</p>
                  <button 
                    onClick={() => {
                      if (gold >= 50) {
                        useGameStore.setState({ gold: gold - 50 });
                        const legendaries = ['VORPAL_BLADE', 'HOLY_AVENGER', 'STAFF_POWER'];
                        const pick = legendaries[Math.floor(Math.random() * legendaries.length)];
                        buyArtifact(pick);
                        addLog("Oracle: A legendary gift has been bestowed!");
                      }
                    }}
                    disabled={gold < 50}
                    className="w-full py-4 bg-indigo-600/90 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] border border-indigo-400/20 shadow-lg shadow-indigo-950/40 active:scale-95"
                  >
                    Forge Legend (💰50)
                  </button>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between shrink-0 px-2">
              <h3 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Merchant's Collection</h3>
              <button 
                onClick={respinTavern}
                disabled={gold < 5}
                className="shrink-0 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-amber-500 font-black rounded-xl transition-all uppercase tracking-widest text-[9px] border border-slate-800 hover:border-amber-500/30 active:scale-95 disabled:opacity-50"
              >
                Respin (💰5)
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 pb-8">
              {shopItems.map((item) => (
                <div key={item.id} className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between gap-4 hover:border-slate-500 transition-colors shadow-lg animate-in fade-in zoom-in duration-300">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-slate-800">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 leading-tight mt-1">{item.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => buyArtifact(item.id)}
                    disabled={gold < item.basePrice}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 font-black rounded-lg transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-slate-700 active:scale-95"
                  >
                    <span>💰 {item.basePrice}</span>
                    <span className="text-slate-500">|</span>
                    <span>Purchase</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4 pb-8 text-center shrink-0 w-full max-w-2xl mx-auto">
        <button 
          onClick={nextEncounter}
          className="w-full px-10 py-5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl shadow-2xl shadow-rose-950/50 transition-all text-lg uppercase tracking-[0.25em] border border-rose-500/30 active:scale-95 animate-in slide-in-from-bottom-4 duration-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Tavern;
