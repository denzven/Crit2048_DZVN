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
    <div id="screen-end" class="hide fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
      <div id="end-capture-area" class="bg-slate-900 border border-slate-700 p-6 md:p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl relative overflow-hidden my-auto">
        <!-- Decoration Line -->
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-rose-600 to-transparent opacity-50"></div>
        
        <h2 id="end-title" class="text-4xl md:text-5xl font-black mb-1 font-serif text-white uppercase tracking-tighter">RUN OVER</h2>
        <p id="end-desc" class="text-slate-400 mb-6 text-xs italic px-4 leading-tight">The dungeon claims another soul.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- General Run Info -->
          <div class="bg-slate-950 rounded-2xl border border-slate-800 p-4 text-left space-y-2 shadow-inner">
            <h3 class="text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-slate-800 pb-1 mb-2">Run Details</h3>
            <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase">Class</span><span id="end-stat-class" class="text-xs font-bold text-white">😡 Hero</span></div>
            <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase">Ante</span><span id="end-stat-ante" class="text-xs font-bold text-rose-400">1</span></div>
            <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase">Date</span><span id="end-stat-date" class="text-xs font-bold text-slate-300">--/--/--</span></div>
            <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase">Time</span><span id="end-stat-time" class="text-xs font-bold text-slate-300">--:--</span></div>
            <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase">Duration</span><span id="end-stat-duration" class="text-xs font-bold text-blue-400">0m 0s</span></div>
            <div class="flex justify-between items-center pt-1 border-t border-slate-800/50">
              <span class="text-[10px] text-slate-400 uppercase">Seed</span>
              <div class="flex items-center gap-1">
                <span id="end-stat-seed" class="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">123456</span>
                <button onclick="copySeed()" class="text-[10px] bg-slate-800 hover:bg-slate-700 p-1 rounded" title="Copy Seed">📋</button>
              </div>
            </div>
          </div>

          <!-- Combat Stats -->
          <div class="bg-slate-950 rounded-2xl border border-slate-800 p-4 text-left space-y-2 shadow-inner">
            <h3 class="text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-slate-800 pb-1 mb-2">Combat Mastery</h3>
            <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase">Max DMG</span><span id="end-stat-dmg" class="text-xs font-bold text-amber-400">0</span></div>
            <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase">Last DMG</span><span id="end-stat-last-dmg" class="text-xs font-bold text-orange-400">0</span></div>
            <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase">Max Mult</span><span id="end-stat-max-mult" class="text-xs font-bold text-rose-500">x1.0</span></div>
            <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase">Moves</span><span id="end-stat-moves" class="text-xs font-bold text-indigo-400">0</span></div>
            <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase">Merges</span><span id="end-stat-merges" class="text-xs font-bold text-emerald-400">0</span></div>
            <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase">Spent</span><span id="end-stat-spent" class="text-xs font-bold text-amber-500">💰 0</span></div>
          </div>
        </div>

        <!-- Artifacts Section -->
        <div class="bg-slate-950 rounded-2xl border border-slate-800 p-4 text-left mb-6 shadow-inner">
          <h3 class="text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-slate-800 pb-1 mb-3">Treasures Collected</h3>
          <div id="end-artifacts-list" class="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
            <!-- Artifacts will be injected here -->
            <p class="text-[10px] text-slate-600 italic">No artifacts found.</p>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-3">
            <button onclick="shareRun()" class="px-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all uppercase tracking-widest shadow-lg border border-indigo-500/50 flex items-center justify-center gap-2 group text-xs">
              <span class="text-lg group-hover:scale-125 transition-transform">📸</span> Share
            </button>
            <button onclick="downloadRunSummary()" class="px-4 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all uppercase tracking-widest shadow-lg border border-emerald-500/50 flex items-center justify-center gap-2 group text-xs">
              <span class="text-lg group-hover:scale-125 transition-transform">💾</span> Save
            </button>
          </div>
          
          <button onclick="openLeaderboard()" class="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold rounded-xl transition-colors uppercase tracking-widest w-full border border-slate-700 text-sm">
            🏆 View Leaderboard
          </button>
          
          <button onclick="resetGame()" class="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors uppercase tracking-widest w-full border border-slate-700 text-sm">
            Try Again
          </button>
        </div>
        
        <p class="text-[8px] text-slate-600 mt-4 uppercase tracking-[0.2em]">Crit 2048: Roguelike D&D</p>
      </div>
    </div>
`;
