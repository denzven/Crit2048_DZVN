import React from 'react';
import { useGameStore } from '../engine/gameStore';
import { useRegistry } from '../engine/registryHub';
import { SeededRNG } from '../engine/prng';
import { clsx } from 'clsx';
import { PackEngine } from '../engine/packEngine';
import { motion, AnimatePresence } from 'framer-motion';

const Tavern: React.FC = () => {
  const { gold, shopItems, buyArtifact, nextEncounter, restoreSpells, upgradeSpell, usesLeft, playerClass, addLog, addFloatingText } = useGameStore();
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const [isRespinning, setIsRespinning] = React.useState(false);

  // Read tavern service definitions from registry (Mod Priority 0)
  const uiDefs = useRegistry(s => s.uiDefs);
  const svc = uiDefs?.tavernServices;
  const rarityColors = uiDefs?.rarityColors || {};

  const upgradeCost = 100 * (playerClass?.ability?.count || 1);
  const totalOptions = 5 + shopItems.length;

  const respinTavern = () => {
    if (gold >= (svc?.respin?.cost ?? 5)) {
      setIsRespinning(true);
      useGameStore.getState().addGold(-(svc?.respin?.cost ?? 5));
      useGameStore.getState().generateShop();
      addLog(`Merchant: Collection respun (💰${svc?.respin?.cost ?? 5})`);
      setTimeout(() => setIsRespinning(false), 600);
    }
  };

  const handleBuyArtifact = (id: string, itemName: string) => {
    buyArtifact(id);
    // Purchase sparkle via addFloatingText (no DOM manipulation)
    addFloatingText('✨', 'gold', 50, 50);
  };

  const handleAction = () => {
    if (focusedIndex === 0) restoreSpells();
    else if (focusedIndex === 1) upgradeSpell();
    else if (focusedIndex === 2) {
      if (gold >= (svc?.oracle?.cost ?? 50)) {
        const { activeArtifacts } = useGameStore.getState();
        const legendaries = activeArtifacts.filter(a => a.rarity?.toLowerCase() === 'legendary' || a.rarity?.toLowerCase() === 'artifact');
        if (legendaries.length > 0) {
          useGameStore.setState({ gold: gold - (svc?.oracle?.cost ?? 50) });
          const pick = legendaries[Math.floor(SeededRNG.random() * legendaries.length)];
          handleBuyArtifact(pick.id, pick.name);
          addLog(`Oracle: The legendary ${pick.name} has been bestowed!`);
        } else {
          addLog(svc?.oracle?.emptyMessage ?? "Oracle: No legendary artifacts found in this realm...");
        }
      }
    }
    else if (focusedIndex === 3) respinTavern();
    else if (focusedIndex < 4 + shopItems.length) {
      const item = shopItems[focusedIndex - 4];
      handleBuyArtifact(item.id, item.name);
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

  const getRarityStyles = (rarity: string) => {
    const r = rarity?.toLowerCase();
    const def = rarityColors[r] || rarityColors['common'];
    if (def) return { 
      color: def.text, 
      border: `border-[${def.border}]`, 
      bg: `bg-[${def.bg}]`, 
      glow: r === 'legendary' ? 'glow-legendary' : r === 'epic' ? 'glow-epic' : r === 'rare' ? 'glow-rare' : r === 'artifact' ? 'glow-artifact' : '' 
    };
    // Fallback if registry not yet loaded
    if (r === 'legendary') return { color: 'text-amber-400', border: 'border-amber-600/50', bg: 'bg-amber-950/30', glow: 'glow-legendary' };
    if (r === 'epic')      return { color: 'text-purple-400', border: 'border-purple-600/50', bg: 'bg-purple-950/30', glow: 'glow-epic' };
    if (r === 'rare')      return { color: 'text-blue-400',   border: 'border-blue-600/50',   bg: 'bg-blue-950/30',   glow: 'glow-rare' };
    if (r === 'artifact')  return { color: 'text-rose-400',   border: 'border-rose-600/50',   bg: 'bg-rose-950/30',   glow: 'glow-artifact' };
    return                         { color: 'text-slate-400', border: 'border-slate-600/50', bg: 'bg-slate-950/30',   glow: '' };
  };

  const restCost = svc?.rest?.cost ?? 30;
  const oracleCost = svc?.oracle?.cost ?? 50;
  const respinCost = svc?.respin?.cost ?? 5;

  return (
    <div id="screen-tavern" className="w-full flex flex-col h-full relative z-10 px-4">
      <div id="tavern-scroll-area" className="flex-grow overflow-y-auto pb-6 space-y-6 flex flex-col min-h-0 custom-scrollbar">
        <div className="tavern-content max-w-2xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            id="tavern-header" 
            className="text-center mt-8 mb-6 shrink-0"
          >
            <h2 className="text-4xl md:text-5xl font-black text-amber-500 mb-1 font-serif tracking-tight">Tavern</h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">spend gold to buy or level up artifacts</p>
          </motion.div>
            
          <div className="grid grid-cols-2 gap-4 shrink-0 mb-6">
            {/* Services Card — text from registry */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-xl">
              <h3 className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full" />
                Services
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={restoreSpells}
                  onMouseEnter={() => setFocusedIndex(0)}
                  disabled={gold < restCost || usesLeft >= (playerClass?.ability?.maxUses || 0)}
                  title={gold < restCost ? `Need ${restCost} gold` : usesLeft >= (playerClass?.ability?.maxUses || 0) ? (svc?.rest?.disabledReason ?? 'Already at max') : (svc?.rest?.description ?? 'Restore spell uses')}
                  className={clsx(
                    "py-4 bg-slate-950/40 text-emerald-400 font-bold rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border hover:border-emerald-500/30 group active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed",
                    focusedIndex === 0 ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-800"
                  )}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{svc?.rest?.icon ?? '💤'}</span>
                  <span className="text-xs uppercase tracking-widest font-black">{svc?.rest?.label ?? 'Rest'}</span>
                  <span className="text-[9px] text-slate-500 font-mono">💰{restCost}</span>
                </button>
                <button 
                  onClick={upgradeSpell}
                  onMouseEnter={() => setFocusedIndex(1)}
                  disabled={gold < upgradeCost || !playerClass?.ability}
                  title={gold < upgradeCost ? `Need ${upgradeCost} gold` : !playerClass?.ability ? (svc?.enhance?.disabledReason ?? 'No spell') : (svc?.enhance?.description ?? 'Upgrade spell')}
                  className={clsx(
                    "py-4 bg-slate-950/40 text-blue-400 font-bold rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border hover:border-blue-500/30 group active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed",
                    focusedIndex === 1 ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-800"
                  )}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{svc?.enhance?.icon ?? '🔮'}</span>
                  <span className="text-xs uppercase tracking-widest font-black">{svc?.enhance?.label ?? 'Enhance'}</span>
                  <span className="text-[9px] text-slate-500 font-mono">💰{upgradeCost}</span>
                </button>
              </div>
            </div>

            {/* Oracle Card — text from registry */}
            <div className={clsx(
              "bg-slate-900/60 border rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-xl transition-all",
              focusedIndex === 2 ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-800"
            )}>
               <h3 className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-4 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full" />
                 The Oracle
               </h3>
               <div className="flex flex-col justify-between h-[calc(100%-2rem)]">
                  <p className="text-[9px] md:text-[10px] text-indigo-400/80 leading-relaxed mb-4 font-medium italic">
                    {svc?.oracle?.description ?? 'Receive a legendary artifact from the pool.'}
                  </p>
                  <button 
                    onClick={() => {
                      if (gold >= oracleCost) {
                        const { activeArtifacts } = useGameStore.getState();
                        const legendaries = activeArtifacts.filter(a => a.rarity?.toLowerCase() === 'legendary' || a.rarity?.toLowerCase() === 'artifact');
                        if (legendaries.length > 0) {
                          useGameStore.setState({ gold: gold - oracleCost });
                          const pick = legendaries[Math.floor(SeededRNG.random() * legendaries.length)];
                          handleBuyArtifact(pick.id, pick.name);
                          addLog(`Oracle: The legendary ${pick.name} has been bestowed!`);
                        } else {
                          addLog(svc?.oracle?.emptyMessage ?? "Oracle: No legendary artifacts found in this realm...");
                        }
                      }
                    }}
                    onMouseEnter={() => setFocusedIndex(2)}
                    disabled={gold < oracleCost}
                    className="w-full py-4 bg-indigo-600/90 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] border border-indigo-400/20 shadow-lg shadow-indigo-950/40 active:scale-95"
                  >
                    {svc?.oracle?.label ?? 'Forge Legend'} (💰{oracleCost})
                  </button>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between shrink-0 px-2">
              <h3 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Merchant's Collection</h3>
              <motion.button 
                onClick={respinTavern}
                onMouseEnter={() => setFocusedIndex(3)}
                disabled={gold < respinCost}
                animate={isRespinning ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className={clsx(
                  "shrink-0 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-amber-500 font-black rounded-xl transition-colors uppercase tracking-widest text-[9px] border active:scale-95 disabled:opacity-50",
                  focusedIndex === 3 ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-800"
                )}
              >
                {svc?.respin?.icon ?? '🔄'} Respin (💰{respinCost})
              </motion.button>
            </div>
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0 pb-8"
            >
              {shopItems.map((item, idx) => {
                const owned = useGameStore.getState().artifacts.find(a => a.id === item.id);
                const level = owned ? owned.level : 0;
                const currentCost = item.basePrice * (level + 1);
                const isLegendary = item.rarity === 'legendary' || item.rarity === 'artifact';
                
                const styles = getRarityStyles(item.rarity);

                return (
                  <motion.div key={item.id} 
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { 
                        opacity: 1, 
                        x: 0,
                        transition: { duration: 0.4, ease: "easeOut" }
                      }
                    }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => setFocusedIndex(4 + idx)}
                    className={clsx(
                      "tavern-item relative bg-slate-900/40 border-2 rounded-[2rem] p-6 flex flex-col gap-5 overflow-hidden group backdrop-blur-md shadow-2xl",
                      focusedIndex === 4 + idx ? "border-white/30 shadow-amber-950/20" : "border-slate-800/80 hover:border-slate-700/50",
                      styles.glow
                    )}
                  >
                    {isLegendary && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full animate-shimmer pointer-events-none" />
                    )}

                    <div className="flex justify-between items-center z-10">
                      <div className={clsx(
                        "text-4xl p-5 rounded-3xl border-2 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out",
                        styles.bg, styles.border
                      )}>
                        {item.icon}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={clsx("text-[11px] uppercase font-black border-b-2 pb-0.5 tracking-widest", styles.color, styles.border)}>
                          {item.rarity || 'RARE'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">Level {level}</span>
                      </div>
                    </div>

                    <div className="flex-grow flex flex-col z-10">
                      <h3 className="font-black text-sm text-white uppercase tracking-tight mb-2 group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-400/80 leading-relaxed mb-6 flex-grow font-medium">
                        {PackEngine.formatDesc(item.desc, item, owned ? level + 1 : 1)}
                      </p>
                      
                      <div className="flex flex-col gap-4 mt-auto">
                        <div className="flex justify-between items-center bg-slate-950/60 rounded-2xl px-4 py-3 border border-slate-800/50 shadow-inner">
                          <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Cost</span>
                          <span className={clsx("font-mono text-sm font-black flex items-center gap-1.5", gold >= currentCost ? "text-amber-400" : "text-rose-500")}>
                            <span className="text-xs">💰</span> {currentCost}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => addLog(`Item Info: ${item.name} — ${item.desc}`)}
                            className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl border border-slate-700 transition-all active:scale-95"
                            title="Stats"
                          >
                            📈
                          </button>
                          <button 
                            onClick={() => handleBuyArtifact(item.id, item.name)}
                            disabled={gold < currentCost}
                            className={clsx(
                              "flex-grow py-3 font-black rounded-xl transition-all uppercase tracking-widest text-[10px] border shadow-lg active:scale-95 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed",
                              gold >= currentCost 
                                ? "bg-amber-600 hover:bg-amber-500 text-white border-amber-400/20 shadow-amber-950/20" 
                                : "bg-slate-900 text-slate-600 border-slate-800"
                            )}
                          >
                            {owned ? "Enhance Power" : "Acquire"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
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
