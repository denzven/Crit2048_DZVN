/**
 * UI TEMPLATE: SCREEN-TAVERN
 *
 * The mid-run shop screen. Allows the player to rest, upgrade spells, or purchase new artifacts.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["screen-tavern"] = `
    <!-- TAVERN (SHOP) -->
    <div id="screen-tavern" class="hide w-full flex flex-col h-full relative z-10">
      <div id="tavern-scroll-area" class="flex-grow overflow-y-auto pb-6 space-y-6 flex flex-col min-h-0 custom-scrollbar tavern-container">
        <div class="tavern-content">
          <div id="tavern-header" class="text-center mt-8 mb-6 shrink-0 fx-entrance-pop transition-all duration-500 origin-top">
            <h2 id="tavern-title" class="text-4xl md:text-5xl font-black text-amber-500 mb-1 font-serif tracking-tight transition-all duration-500">Tavern</h2>
            <p id="tavern-subtitle" class="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-500">spend gold to buy or level up artifacts</p>
          </div>
            
          <div class="grid grid-cols-2 gap-4 shrink-0 mb-6">
            <div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
              <h3 class="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-4 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-emerald-500/50 rounded-full"></span>
                Services
              </h3>
              <div class="grid grid-cols-2 gap-3">
                <button id="btn-rest" onclick="restoreSpells()" class="py-4 bg-slate-950/40 hover:bg-emerald-950/20 text-emerald-400 font-bold rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border border-slate-800 hover:border-emerald-500/30 group active:scale-95">
                  <span class="text-xl group-hover:scale-110 transition-transform">💤</span>
                  <span class="text-xs uppercase tracking-widest font-black">Rest</span>
                  <span class="text-[9px] text-slate-500 font-mono">💰30</span>
                </button>
                <button id="btn-upgrade" onclick="upgradeSpell()" class="py-4 bg-slate-950/40 hover:bg-blue-950/20 text-blue-400 font-bold rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border border-slate-800 hover:border-blue-500/30 group active:scale-95">
                  <span class="text-xl group-hover:scale-110 transition-transform">🔮</span>
                  <span class="text-xs uppercase tracking-widest font-black">Enhance</span>
                  <span class="text-[9px] text-slate-500 font-mono">💰<span id="upgrade-cost">100</span></span>
                </button>
              </div>
            </div>

            <div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
               <h3 class="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-4 flex items-center gap-2">
                 <span class="w-1.5 h-1.5 bg-indigo-500/50 rounded-full"></span>
                 The AI Oracle
               </h3>
               <div class="flex flex-col justify-between h-[calc(100%-2rem)]">
                  <p class="text-[10px] text-indigo-400/80 leading-relaxed mb-4 font-medium italic">Seek the wisdom of the machine to forge artifacts of immense power.</p>
                  <button id="btn-ai-oracle" onclick="callGeminiOracle()" class="w-full py-4 bg-indigo-600/90 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs border border-indigo-400/20 shadow-lg shadow-indigo-950/40 active:scale-95">
                    Forge Legend (💰50)
                  </button>
               </div>
               <div id="ai-loading" class="hide mt-3 text-center text-indigo-400 text-[9px] loading-pulse font-mono tracking-widest">COMMUNING WITH VESTIGE...</div>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between shrink-0 px-2">
              <h3 class="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Merchant's Collection</h3>
              <button id="btn-respin" onclick="respinTavern()" class="shrink-0 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-amber-500 font-black rounded-xl transition-all uppercase tracking-widest text-[9px] border border-slate-800 hover:border-amber-500/30">
                Respin (💰5)
              </button>
            </div>
            <div id="tavern-artifacts" class="grid grid-cols-2 gap-6 shrink-0 pb-8"></div>
          </div>
        </div>
      </div>
      
      <div class="pt-4 pb-8 text-center shrink-0 tavern-container">
        <div class="tavern-content">
          <button id="btn-descend" onclick="nextEncounter()" class="w-full max-w-sm mx-auto px-10 py-5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl shadow-2xl shadow-rose-950/50 transition-all text-lg uppercase tracking-[0.25em] border border-rose-500/30 active:scale-95">
            Continue
          </button>
        </div>
      </div>
    </div>

`;
