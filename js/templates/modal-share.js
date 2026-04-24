/**
 * UI TEMPLATE: MODAL-SHARE
 * 
 * A professional customization modal for sharing run statistics.
 * Allows users to preview and theme their share card before sending.
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["modal-share"] = `
<div id="modal-share" class="hide fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6">
  <div class="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onclick="closeShareModal()"></div>
  
  <div class="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-none md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full md:h-[85vh] fx-entrance-pop">
    
    <!-- LEFT: PREVIEW AREA -->
    <div class="w-full md:w-1/2 bg-black flex items-center justify-center p-4 md:p-8 border-b md:border-b-0 md:border-r border-slate-800 relative group">
      <div id="share-preview-container" class="relative shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden aspect-[9/16] h-full max-h-[50vh] md:max-h-full bg-slate-900 ring-1 ring-white/10">
        <div id="share-preview-loading" class="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div class="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      <div class="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
        <p class="text-[9px] text-white font-black uppercase tracking-widest whitespace-nowrap">Story Preview</p>
      </div>
    </div>

    <!-- RIGHT: CUSTOMIZATION AREA -->
    <div class="w-full md:w-1/2 p-6 md:p-12 flex flex-col gap-6 md:gap-10 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <span class="px-2 py-0.5 bg-rose-500 text-[10px] font-black text-white rounded uppercase tracking-tighter">New Themes</span>
          <h2 class="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Share Card</h2>
        </div>
        <p class="text-slate-400 text-xs md:text-sm font-medium">Design your unique run summary for social media.</p>
      </div>

      <!-- THEME SELECTOR -->
      <div class="space-y-4">
        <h3 class="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
          <span class="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span> Visual Style
        </h3>
        <div class="grid grid-cols-5 gap-2 md:gap-3">
          <button onclick="updateShareTheme('classic')" class="share-theme-btn active group flex flex-col items-center gap-2">
            <div class="w-full aspect-square rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 ring-2 ring-rose-500 ring-offset-2 ring-offset-slate-900 transition-all"></div>
            <span class="text-[9px] font-bold text-white uppercase opacity-100">Classic</span>
          </button>
          <button onclick="updateShareTheme('midnight')" class="share-theme-btn group flex flex-col items-center gap-2">
            <div class="w-full aspect-square rounded-xl bg-gradient-to-br from-slate-700 to-black ring-1 ring-white/10 transition-all hover:scale-105"></div>
            <span class="text-[9px] font-bold text-slate-500 uppercase opacity-60">Midnight</span>
          </button>
          <button onclick="updateShareTheme('golden')" class="share-theme-btn group flex flex-col items-center gap-2">
            <div class="w-full aspect-square rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 ring-1 ring-white/10 transition-all hover:scale-105"></div>
            <span class="text-[9px] font-bold text-slate-500 uppercase opacity-60">Golden</span>
          </button>
          <button onclick="updateShareTheme('cyber')" class="share-theme-btn group flex flex-col items-center gap-2">
            <div class="w-full aspect-square rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 ring-1 ring-white/10 transition-all hover:scale-105"></div>
            <span class="text-[9px] font-bold text-slate-500 uppercase opacity-60">Cyber</span>
          </button>
          <button onclick="updateShareTheme('rose')" class="share-theme-btn group flex flex-col items-center gap-2">
            <div class="w-full aspect-square rounded-xl bg-gradient-to-br from-rose-400 to-rose-900 ring-1 ring-white/10 transition-all hover:scale-105"></div>
            <span class="text-[9px] font-bold text-slate-500 uppercase opacity-60">Rose</span>
          </button>
        </div>
      </div>

      <!-- CONTENT TOGGLES -->
      <div class="space-y-4">
        <h3 class="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
          <span class="w-2 h-2 bg-indigo-500 rounded-full"></span> Data & Visibility
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <label class="flex flex-col gap-2 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl cursor-pointer hover:bg-slate-800 transition-colors">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-300 uppercase">Run Seed</span>
              <input type="checkbox" id="share-toggle-seed" checked onchange="refreshSharePreview()" class="w-5 h-5 rounded-lg border-slate-700 text-rose-500 bg-slate-900">
            </div>
          </label>
          <label class="flex flex-col gap-2 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl cursor-pointer hover:bg-slate-800 transition-colors">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-300 uppercase">Treasures</span>
              <input type="checkbox" id="share-toggle-artifacts" checked onchange="refreshSharePreview()" class="w-5 h-5 rounded-lg border-slate-700 text-rose-500 bg-slate-900">
            </div>
          </label>
          <label class="flex flex-col gap-2 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl cursor-pointer hover:bg-slate-800 transition-colors col-span-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-300 uppercase">Advanced Stats (Weapon/Hazards)</span>
              <input type="checkbox" id="share-toggle-extra" checked onchange="refreshSharePreview()" class="w-5 h-5 rounded-lg border-slate-700 text-rose-500 bg-slate-900">
            </div>
          </label>
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="mt-auto pt-8 border-t border-slate-800/50 space-y-4">
        <button onclick="executeFinalShare()" class="w-full py-6 bg-white text-black font-black rounded-2xl transition-all uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-4 active:scale-95 hover:bg-rose-500 hover:text-white group">
          <span>📤 Share to Story</span>
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
        
        <div class="grid grid-cols-2 gap-4">
          <button onclick="executeFinalSave()" class="py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-colors uppercase tracking-widest text-[11px] border border-slate-700 shadow-lg">
            💾 Save Image
          </button>
          <button onclick="closeShareModal()" class="py-5 bg-transparent hover:bg-slate-900 text-slate-500 font-black rounded-2xl transition-colors uppercase tracking-widest text-[11px]">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`;
