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
    <div id="screen-tavern" class="hide w-full max-w-5xl flex flex-col h-full py-2 relative z-10">
      <div class="text-center mb-4 shrink-0">
        <h2 class="text-3xl font-black text-amber-500 mb-1 font-serif">Tavern</h2>
        <p class="text-slate-400 text-xs">Spend gold to buy or level up artifacts.</p>
      </div>

      <div class="flex-grow overflow-y-auto pr-2 pb-4 space-y-4 flex flex-col min-h-0">
          
          <div class="bg-slate-900 border border-slate-700 rounded-2xl p-4 shrink-0 shadow-lg">
            <h3 class="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-3">Spellcraft</h3>
            <div class="flex flex-row gap-3 justify-between">
              <button id="btn-rest" onclick="restoreSpells()" class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl transition-colors flex flex-col items-center justify-center gap-1 border border-slate-700">
                <span class="text-sm uppercase tracking-widest font-black">Rest</span>
                <span class="text-[10px] text-slate-400">Restore Uses (💰30)</span>
              </button>
              <button id="btn-upgrade" onclick="upgradeSpell()" class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded-xl transition-colors flex flex-col items-center justify-center gap-1 border border-slate-700">
                <span class="text-sm uppercase tracking-widest font-black">Enhance</span>
                <span class="text-[10px] text-slate-400">+1 Dice (💰<span id="upgrade-cost">100</span>)</span>
              </button>
            </div>
          </div>

          <div class="bg-slate-900 border border-slate-700 rounded-2xl p-4 shrink-0 shadow-lg">
             <h3 class="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-3">AI Oracle</h3>
             <div class="flex items-center justify-between gap-4">
                <p class="text-[10px] text-indigo-300">Generate a Level 1 Legendary Artifact for your class (+1.0 Mult).</p>
                <button id="btn-ai-oracle" onclick="callGeminiOracle()" class="shrink-0 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs border border-indigo-400/30">
                  Forge (💰50)
                </button>
             </div>
             <div id="ai-loading" class="hide mt-2 text-center text-indigo-400 text-xs loading-pulse font-mono">Communing...</div>
          </div>

          <h3 class="text-slate-500 font-black uppercase tracking-widest text-[10px] shrink-0 pt-2">Wares</h3>
          <div id="tavern-artifacts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 shrink-0 pb-4"></div>
      </div>
      
      <div class="pt-3 text-center shrink-0">
        <button id="btn-descend" onclick="nextEncounter()" class="w-full px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-lg transition-all text-lg uppercase tracking-widest border border-rose-500/50">
          Next Ante
        </button>
      </div>
    </div>

`;
