/**
 * UI TEMPLATE: MODAL-LEADERBOARD
 *
 * Displays the Hall of Heroes (Leaderboard).
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["modal-leaderboard"] = `
<div id="modal-leaderboard" class="hide fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto">
  <div id="leaderboard-capture-area" class="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
    <!-- Decoration -->
    <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
    
    <div class="flex justify-between items-center mb-6 shrink-0">
      <div class="text-left">
        <h2 class="text-3xl font-black font-serif text-white uppercase tracking-tighter">HALL OF HEROES</h2>
        <p class="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Your Legendary Runs</p>
      </div>
      <div class="flex gap-2">
        <button onclick="shareLeaderboard()" class="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700" title="Share Leaderboard">📸</button>
        <button onclick="closeLeaderboard()" class="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700" title="Close">✖</button>
      </div>
    </div>

    <div class="overflow-y-auto flex-grow mb-6 pr-2 custom-scrollbar">
      <div id="leaderboard-list" class="space-y-3">
        <!-- Entries will be injected here -->
        <p class="text-slate-600 italic text-center py-10">No legends recorded yet. Descend into the dungeon to make history!</p>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 shrink-0">
      <button onclick="clearLeaderboard()" class="flex-1 py-3 bg-slate-800/50 hover:bg-rose-900/30 text-rose-500 font-bold rounded-xl transition-colors uppercase tracking-widest border border-rose-900/30 text-[10px]">
        Clear All History
      </button>
      <button onclick="closeLeaderboard()" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all uppercase tracking-widest shadow-lg border border-indigo-500/50 text-xs">
        Return to Dungeon
      </button>
    </div>
  </div>
</div>
`;
