import React from 'react';
import { useGameStore } from '../engine/gameStore';
import { clsx } from 'clsx';

const Tavern: React.FC = () => {
  const { gold, shopItems, buyArtifact, nextEncounter, restoreSpells, upgradeSpell, usesLeft, playerClass, addLog } = useGameStore();
  const [focusedIndex, setFocusedIndex] = React.useState(0); // 0-1: Services, 2: Oracle, 3: Respin, 4+: Shop Items, Last: Continue

  const upgradeCost = 100 * (playerClass?.ability?.count || 1);
  const totalOptions = 5 + shopItems.length;

  const respinTavern = () => {
    if (gold >= 5) {
      useGameStore.getState().addGold(-5);
      useGameStore.getState().generateShop();
      addLog("Merchant: Collection respun (💰5)");
    }
  };

  const handleAction = () => {
    if (focusedIndex === 0) restoreSpells();
    else if (focusedIndex === 1) upgradeSpell();
    else if (focusedIndex === 2) {
      if (gold >= 50) {
        useGameStore.setState({ gold: gold - 50 });
        const legendaries = ['VORPAL_BLADE', 'HOLY_AVENGER', 'STAFF_POWER'];
        const pick = legendaries[Math.floor(Math.random() * legendaries.length)];
        buyArtifact(pick);
        addLog("Oracle: A legendary gift has been bestowed!");
      }
    }
    else if (focusedIndex === 3) respinTavern();
    else if (focusedIndex < 4 + shopItems.length) {
      buyArtifact(shopItems[focusedIndex - 4].id);
    }
    else nextEncounter();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setFocusedIndex(prev => (prev + 1) % (totalOptions + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setFocusedIndex(prev => (prev - 1 + (totalOptions + 1)) % (totalOptions + 1));
      } else if (e.key === 'Enter') {
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, shopItems, gold]);

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
                  onMouseEnter={() => setFocusedIndex(0)}
                  disabled={gold < 30 || usesLeft >= (playerClass?.ability?.maxUses || 0)}
                  className={clsx(
                    "py-4 bg-slate-950/40 text-emerald-400 font-bold rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border hover:border-emerald-500/30 group active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed",
                    focusedIndex === 0 ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-800"
                  )}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">💤</span>
                  <span className="text-xs uppercase tracking-widest font-black">Rest</span>
                  <span className="text-[9px] text-slate-500 font-mono">💰30</span>
                </button>
                <button 
                  onClick={upgradeSpell}
                  onMouseEnter={() => setFocusedIndex(1)}
                  disabled={gold < upgradeCost || !playerClass?.ability}
                  className={clsx(
                    "py-4 bg-slate-950/40 text-blue-400 font-bold rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border hover:border-blue-500/30 group active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed",
                    focusedIndex === 1 ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-800"
                  )}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🔮</span>
                  <span className="text-xs uppercase tracking-widest font-black">Enhance</span>
                  <span className="text-[9px] text-slate-500 font-mono">💰{upgradeCost}</span>
                </button>
              </div>
            </div>

             {/* AI Oracle Card */}
            <div className={clsx(
              "bg-slate-900/60 border rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-xl transition-all",
              focusedIndex === 2 ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-800"
            )}>
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
                    onMouseEnter={() => setFocusedIndex(2)}
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
                onMouseEnter={() => setFocusedIndex(3)}
                disabled={gold < 5}
                className={clsx(
                  "shrink-0 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-amber-500 font-black rounded-xl transition-all uppercase tracking-widest text-[9px] border active:scale-95 disabled:opacity-50",
                  focusedIndex === 3 ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-800"
                )}
              >
                Respin (💰5)
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 pb-8">
              {shopItems.map((item, idx) => (
                <div key={item.id} 
                  onMouseEnter={() => setFocusedIndex(4 + idx)}
                  className={clsx(
                    "bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between gap-4 transition-colors shadow-lg animate-in fade-in zoom-in duration-300",
                    focusedIndex === 4 + idx ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-700 hover:border-slate-500"
                  )}
                >
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
          onMouseEnter={() => setFocusedIndex(totalOptions)}
          className={clsx(
            "w-full px-6 py-4 md:px-10 md:py-5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl shadow-2xl shadow-rose-950/50 transition-all text-base md:text-lg uppercase tracking-[0.25em] border active:scale-95 animate-in slide-in-from-bottom-4 duration-500",
            focusedIndex === totalOptions ? "border-white ring-4 ring-rose-500/40 scale-105" : "border-rose-500/30"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Tavern;
