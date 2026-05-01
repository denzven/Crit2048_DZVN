/**
 * UI TEMPLATE: MODAL-MARKETPLACE
 * The Grimoire — In-game Community Pack browser and installer.
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["modal-marketplace"] = `
    <!-- MARKETPLACE MODAL -->
    <div id="modal-marketplace" class="hide absolute inset-0 bg-slate-950/95 z-[120] flex items-center justify-center p-2 md:p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden">
        
        <!-- Header -->
        <div class="p-5 border-b border-slate-800 flex justify-between items-center shrink-0 bg-slate-900/50 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pointer-events-none"></div>
          <div class="flex items-center gap-4 relative z-10">
            <span class="text-3xl md:text-4xl drop-shadow-lg">📜</span>
            <div>
              <h2 class="text-2xl font-black tracking-widest text-white uppercase font-serif leading-none drop-shadow-md">The Grimoire</h2>
              <div class="flex items-center gap-2 mt-1">
                <p class="text-indigo-400 text-[10px] uppercase tracking-[0.2em] font-bold">Community Content Registry</p>
                <span id="market-status-badge" class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-emerald-900/50 text-emerald-400 border border-emerald-500/30">Online</span>
              </div>
            </div>
          </div>
          <button onclick="PackMarketplace.close()" class="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700 relative z-10 shadow-lg">
            ✕
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-slate-800 shrink-0 bg-slate-950/50 px-2 pt-2 gap-1 overflow-x-auto custom-scrollbar">
          <button onclick="PackMarketplace.setTab('browse')" id="market-tab-browse" class="px-5 py-3 rounded-t-lg font-black text-[10px] uppercase tracking-widest transition-colors bg-slate-800 text-white border-t border-x border-slate-700">
            Browse
          </button>
          <button onclick="PackMarketplace.setTab('installed')" id="market-tab-installed" class="px-5 py-3 rounded-t-lg font-black text-[10px] uppercase tracking-widest transition-colors text-slate-500 hover:text-white hover:bg-slate-800/50 border-t border-x border-transparent">
            Installed
          </button>
          <div class="flex-grow"></div>
          
          <input type="file" id="market-import-file" class="hidden" accept=".json" onchange="PackMarketplace.importPack(event)">
          <button onclick="document.getElementById('market-import-file').click()" class="px-3 py-2 my-1 mr-1 rounded bg-indigo-900/30 text-indigo-400 hover:bg-indigo-800/50 hover:text-white border border-indigo-500/30 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 transition-colors">
            📥 <span class="hidden sm:inline">Import JSON</span>
          </button>

          <button onclick="PackMarketplace.openLocalFolder()" class="px-3 py-2 my-1 mr-1 rounded bg-emerald-900/30 text-emerald-400 hover:bg-emerald-800/50 hover:text-white border border-emerald-500/30 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 transition-colors">
            📂 <span class="hidden lg:inline">Open Folder</span>
          </button>
          
          <button onclick="PackMarketplace.refresh()" class="px-3 py-2 my-1 mr-1 rounded bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 transition-colors">
            🔄 <span class="hidden sm:inline">Refresh</span>
          </button>
        </div>
        
        <!-- Main Content Area -->
        <div class="flex-grow relative overflow-y-auto custom-scrollbar p-4 bg-slate-950" id="market-content-area">
          
          <!-- Browse View -->
          <div id="market-view-browse" class="space-y-6">
            <div id="market-loading" class="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
              <div class="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p class="text-xs uppercase tracking-widest font-bold">Consulting the archives...</p>
            </div>
            <div id="market-browse-grid" class="hide grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Dynamically populated cards -->
            </div>
          </div>

          <!-- Installed View -->
          <div id="market-view-installed" class="hide space-y-6">
            <div id="market-installed-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Dynamically populated cards -->
            </div>
            <div id="market-installed-empty" class="hide flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
              <span class="text-4xl">🕸️</span>
              <p class="text-xs uppercase tracking-widest font-bold">No custom packs installed.</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
`;
