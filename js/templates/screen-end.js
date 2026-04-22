/**
 * UI TEMPLATE: SCREEN-END
 *
 * The game over or victory screen. Summarizes the structural run statistics and presents the play again button.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["screen-end"] = `
    <!-- GAME OVER / VICTORY STATS SCREEN -->
    <div id="screen-end" class="hide fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        <!-- Decoration Line -->
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-rose-600 to-transparent opacity-50"></div>
        
        <h2 id="end-title" class="text-4xl md:text-5xl font-black mb-2 font-serif text-white">RUN OVER</h2>
        <p id="end-desc" class="text-slate-400 mb-6 text-sm italic">The dungeon claims another soul.</p>
        
        <div class="bg-slate-950 rounded-2xl border border-slate-800 p-4 mb-6 text-left space-y-3 shadow-inner">
            <h3 class="text-slate-500 font-black uppercase tracking-widest text-[10px] border-b border-slate-800 pb-2 mb-2 text-center">Run Summary</h3>
            
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-400 uppercase tracking-widest">Class</span>
              <span id="end-stat-class" class="text-sm font-bold text-white">😡 Hero</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-400 uppercase tracking-widest">Ante Reached</span>
              <span id="end-stat-ante" class="text-sm font-bold text-rose-400">1</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-400 uppercase tracking-widest">Max Damage</span>
              <span id="end-stat-dmg" class="text-sm font-bold text-amber-400">0</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-400 uppercase tracking-widest">Weapons Merged</span>
              <span id="end-stat-merges" class="text-sm font-bold text-blue-400">0</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-400 uppercase tracking-widest">Run Seed</span>
              <span id="end-stat-seed" class="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">123456</span>
            </div>
        </div>

        <button onclick="resetGame()" class="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl transition-colors uppercase tracking-widest w-full shadow-lg border border-rose-500/50 hover:scale-[1.02] active:scale-95">
          Play Again
        </button>
      </div>
    </div>

`;
