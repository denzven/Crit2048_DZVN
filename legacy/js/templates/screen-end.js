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
    <div id="screen-end" class="hide w-full flex flex-col h-full relative z-10">
      <div class="flex-grow overflow-y-auto pb-20 custom-scrollbar tavern-container">
        <div class="tavern-content">
          <div id="end-capture-area" class="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] max-w-lg mx-auto text-center shadow-2xl relative border-t-rose-600/30 mt-8 backdrop-blur-xl">
            
            <!-- Subtle Glow Background -->
            <div class="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none"></div>

            <div class="relative z-10">
              <h2 id="end-title" class="text-3xl md:text-5xl font-black mb-1 font-serif text-white uppercase tracking-tight drop-shadow-lg">RUN OVER</h2>
              <p id="end-desc" class="text-slate-500 mb-6 text-[10px] md:text-xs italic px-4 leading-tight">The dungeon claims another soul.</p>
              
              <!-- Victory Celebration Overlay -->
              <div id="victory-celebration" class="hide mb-8 animate-bounce">
                <div class="relative inline-block">
                  <div class="absolute inset-0 bg-amber-400 blur-2xl opacity-20 rounded-full"></div>
                  <span class="text-7xl relative z-10">🏆</span>
                </div>
                <div class="mt-4 flex justify-center gap-2">
                  <span class="w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
                  <span class="w-2 h-2 bg-amber-400 rounded-full animate-ping [animation-delay:0.2s]"></span>
                  <span class="w-2 h-2 bg-amber-400 rounded-full animate-ping [animation-delay:0.4s]"></span>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 md:gap-4 mb-6 text-left">
                <!-- General Run Info -->
                <div class="bg-slate-950/60 rounded-2xl border border-white/5 p-3 md:p-4 space-y-2 shadow-xl backdrop-blur-sm">
                  <h3 class="text-slate-600 font-black uppercase tracking-widest text-[8px] border-b border-white/5 pb-1 mb-2 flex items-center gap-2">
                    <span class="w-1 h-1 bg-slate-700 rounded-full"></span> Details
                  </h3>
                  <div class="flex justify-between items-center"><span class="text-[9px] text-slate-500 uppercase">Class</span><span id="end-stat-class" class="text-[10px] font-bold text-white">😡 Hero</span></div>
                  <div class="flex justify-between items-center"><span class="text-[9px] text-slate-500 uppercase">Ante</span><span id="end-stat-ante" class="text-[10px] font-bold text-rose-400">1</span></div>
                  <div class="flex justify-between items-center"><span class="text-[9px] text-slate-500 uppercase">Date</span><span id="end-stat-date" class="text-[10px] font-bold text-slate-400">--/--/--</span></div>
                  <div class="flex justify-between items-center"><span class="text-[9px] text-slate-500 uppercase">Time</span><span id="end-stat-time" class="text-[10px] font-bold text-slate-400">--:--</span></div>
                  <div class="flex justify-between items-center"><span class="text-[9px] text-slate-500 uppercase">Duration</span><span id="end-stat-duration" class="text-[10px] font-bold text-blue-400">0m 0s</span></div>
                  <div class="flex justify-between items-center pt-1 border-t border-white/5 mt-1">
                    <span class="text-[9px] text-slate-500 uppercase">Seed</span>
                    <div class="flex items-center gap-1">
                      <span id="end-stat-seed" class="text-[8px] font-mono text-slate-500 truncate max-w-[60px]">123456</span>
                      <button onclick="copySeed()" class="text-[10px] bg-slate-800 hover:bg-slate-700 p-0.5 px-1.5 rounded transition-colors" title="Copy Seed">📋</button>
                    </div>
                  </div>
                </div>

                <!-- Combat Stats -->
                <div class="bg-slate-950/60 rounded-2xl border border-white/5 p-3 md:p-4 space-y-2 shadow-xl backdrop-blur-sm">
                  <h3 class="text-slate-600 font-black uppercase tracking-widest text-[8px] border-b border-white/5 pb-1 mb-2 flex items-center gap-2">
                    <span class="w-1 h-1 bg-rose-700 rounded-full"></span> Mastery
                  </h3>
                  <div class="flex justify-between items-center"><span class="text-[9px] text-slate-500 uppercase">Max DMG</span><span id="end-stat-dmg" class="text-[10px] font-bold text-amber-500">0</span></div>
                  <div class="flex justify-between items-center"><span class="text-[9px] text-slate-500 uppercase">Last DMG</span><span id="end-stat-last-dmg" class="text-[10px] font-bold text-orange-500">0</span></div>
                  <div class="flex justify-between items-center"><span class="text-[9px] text-slate-500 uppercase">Max Mult</span><span id="end-stat-max-mult" class="text-[10px] font-bold text-rose-500">x1.0</span></div>
                  <div class="flex justify-between items-center"><span class="text-[9px] text-slate-500 uppercase">Moves</span><span id="end-stat-moves" class="text-[10px] font-bold text-indigo-400">0</span></div>
                  <div class="flex justify-between items-center"><span class="text-[9px] text-slate-500 uppercase">Merges</span><span id="end-stat-merges" class="text-[10px] font-bold text-emerald-500">0</span></div>
                  <div class="flex justify-between items-center pt-1 border-t border-white/5 mt-1">
                    <span class="text-[9px] text-slate-500 uppercase">Spent</span><span id="end-stat-spent" class="text-[10px] font-bold text-amber-500">💰 0</span>
                  </div>
                </div>
              </div>

              <!-- Artifacts Section -->
              <div class="bg-slate-950/60 rounded-2xl border border-white/5 p-3 md:p-4 text-left mb-6 shadow-xl backdrop-blur-sm">
                <h3 class="text-slate-600 font-black uppercase tracking-widest text-[8px] border-b border-white/5 pb-1 mb-3">Treasures</h3>
                <div id="end-artifacts-list" class="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  <p class="text-[10px] text-slate-600 italic">No artifacts found.</p>
                </div>
              </div>

              <div class="flex flex-col gap-2.5">
                <div class="grid grid-cols-2 gap-2.5">
                  <button onclick="shareRun()" class="interactive px-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all uppercase tracking-widest shadow-lg border border-indigo-500/30 flex items-center justify-center gap-2 group text-[10px]">
                    📸 Share
                  </button>
                  <button onclick="downloadRunSummary()" class="interactive px-4 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all uppercase tracking-widest shadow-lg border border-emerald-500/30 flex items-center justify-center gap-2 group text-[10px]">
                    💾 Save
                  </button>
                </div>
                
                <button onclick="openLeaderboard()" class="interactive px-8 py-4 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold rounded-xl transition-colors uppercase tracking-widest w-full border border-slate-700 text-xs">
                  🏆 Hall of Heroes
                </button>
                
                <button onclick="resetGame()" class="interactive px-8 py-5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl transition-colors uppercase tracking-widest w-full border border-rose-500/30 text-sm shadow-xl shadow-rose-950/20 active:scale-95">
                  Try Again
                </button>
              </div>
              
              <p class="text-[8px] text-slate-700 mt-8 uppercase tracking-[0.4em] font-black">Crit 2048: Rogue-Like RPG</p>
            </div>
          </div>
        </div>
      </div>
    </div>

`;
