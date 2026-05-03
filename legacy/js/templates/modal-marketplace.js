/**
 * UI TEMPLATE: MODAL-MARKETPLACE (FORGE STYLE)
 * The Grimoire redesigned to match the Forge aesthetic.
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["modal-marketplace"] = `
    <!-- MARKETPLACE MODAL: THE GRIMOIRE -->
    <div id="modal-marketplace" class="hide absolute inset-0 bg-slate-950 z-[120] flex items-center justify-center p-2 md:p-4">
      <div class="bg-slate-900/95 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col h-full max-h-[95vh] overflow-hidden backdrop-blur-3xl relative z-[122]">
        <!-- Subtle Glow Background -->
        <div class="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none"></div>
        
        <!-- Header -->
        <div class="p-4 border-b border-slate-800 flex justify-between items-center shrink-0 bg-slate-900/50">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📜</span>
            <div>
              <h2 class="text-xl font-black tracking-widest text-white uppercase font-serif leading-none">The Grimoire</h2>
              <p class="text-slate-400 text-[10px] uppercase tracking-wider mt-1">Community Content Archives</p>
            </div>
          </div>
          <div class="flex gap-3 items-center">
            <input type="file" id="market-import-file" class="hidden" accept=".json" onchange="PackMarketplace.importPack(event)">
            <button onclick="PackMarketplace.toggleSearch()" class="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 shrink-0" title="Toggle Search">
              🔍
            </button>
            <button onclick="document.getElementById('market-import-file').click()" class="px-3 py-2 md:px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[10px] md:text-xs uppercase tracking-widest rounded-lg transition-colors border border-slate-700 flex items-center gap-2 shrink-0" title="Import Pack">
              📂 <span class="hidden sm:inline">Import</span>
            </button>
            <button onclick="PackMarketplace.refresh()" class="px-3 py-2 md:px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[10px] md:text-xs uppercase tracking-widest rounded-lg transition-colors border border-slate-700 flex items-center gap-2 shrink-0" title="Refresh Store">
              🔄 <span class="hidden sm:inline">Refresh</span>
            </button>
            <button onclick="PackMarketplace.close()" class="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-rose-900 text-slate-300 rounded-lg transition-colors border border-slate-700 shrink-0">
              ✕
            </button>
          </div>
        </div>

        <!-- Search Bar Row (Toggled) -->
        <div id="market-search-row" class="hide px-4 md:px-8 py-4 md:py-6 bg-slate-950/90 border-b border-slate-800 flex justify-center items-center shrink-0 transition-all duration-300 ease-in-out backdrop-blur-xl">
          <div class="relative w-full max-w-3xl flex items-center gap-3">
            <div class="relative flex-grow">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg pointer-events-none">🔍</span>
              <input type="text" id="market-search-input" placeholder="Search..." class="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl pl-12 pr-10 py-3 text-base md:text-sm text-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all placeholder:text-slate-600 shadow-2xl font-medium" oninput="PackMarketplace.onSearch(this.value)">
              <button onclick="document.getElementById('market-search-input').value=''; PackMarketplace.onSearch(''); this.parentElement.querySelector('input').focus();" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors p-1">
                ✕
              </button>
            </div>
            <div id="market-status-badge" class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/30 text-[9px] font-black uppercase tracking-widest text-slate-500 shrink-0">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
              Live
            </div>
          </div>
        </div>

        <!-- Navigation Tabs (Forge Style) -->
        <div class="relative w-full bg-slate-900/50 border-b border-slate-800 shrink-0">
          <div id="market-tabs-container" class="grid grid-cols-3 md:flex p-3 gap-2 md:gap-3 overflow-x-auto no-scrollbar md:whitespace-nowrap scroll-smooth">
            <button id="market-tab-all" onclick="PackMarketplace.setTab('all')" class="py-2 px-2 md:px-10 rounded-lg font-bold text-[9px] md:text-xs uppercase tracking-tight md:tracking-widest transition-all bg-rose-600 text-white shadow-inner truncate">
              All
            </button>
            <button id="market-tab-mega" onclick="PackMarketplace.setTab('mega')" class="py-2 px-2 md:px-10 rounded-lg font-bold text-[9px] md:text-xs uppercase tracking-tight md:tracking-widest transition-all bg-slate-800 text-slate-400 hover:text-white truncate">
              Mega
            </button>
            <button id="market-tab-dungeon" onclick="PackMarketplace.setTab('dungeon')" class="py-2 px-2 md:px-10 rounded-lg font-bold text-[9px] md:text-xs uppercase tracking-tight md:tracking-widest transition-all bg-slate-800 text-slate-400 hover:text-white truncate">
              Enemies
            </button>
            <button id="market-tab-class" onclick="PackMarketplace.setTab('class')" class="py-2 px-2 md:px-10 rounded-lg font-bold text-[9px] md:text-xs uppercase tracking-tight md:tracking-widest transition-all bg-slate-800 text-slate-400 hover:text-white truncate">
              Class
            </button>
            <button id="market-tab-weapon" onclick="PackMarketplace.setTab('weapon')" class="py-2 px-2 md:px-10 rounded-lg font-bold text-[9px] md:text-xs uppercase tracking-tight md:tracking-widest transition-all bg-slate-800 text-slate-400 hover:text-white truncate">
              Weapon
            </button>
            <button id="market-tab-artifacts" onclick="PackMarketplace.setTab('artifacts')" class="py-2 px-2 md:px-10 rounded-lg font-bold text-[9px] md:text-xs uppercase tracking-tight md:tracking-widest transition-all bg-slate-800 text-slate-400 hover:text-white truncate">
              Artifact
            </button>
            <button id="market-tab-hazard" onclick="PackMarketplace.setTab('hazard')" class="py-2 px-2 md:px-10 rounded-lg font-bold text-[9px] md:text-xs uppercase tracking-tight md:tracking-widest transition-all bg-slate-800 text-slate-400 hover:text-white truncate">
              Hazard
            </button>
            <button id="market-tab-skin" onclick="PackMarketplace.setTab('skin')" class="py-2 px-2 md:px-10 rounded-lg font-bold text-[9px] md:text-xs uppercase tracking-tight md:tracking-widest transition-all bg-slate-800 text-slate-400 hover:text-white truncate">
              Skin
            </button>
          </div>
        </div>
        
        <!-- Content Area -->
        <div class="flex-grow relative overflow-y-auto custom-scrollbar p-4 md:p-6 bg-slate-950" id="market-content-area">
          <div id="market-loading" class="hide flex flex-col items-center justify-center py-24 text-slate-500 space-y-4">
            <div class="w-10 h-10 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
            <p class="text-[10px] uppercase tracking-[0.3em] font-black text-slate-600">Summoning Data...</p>
          </div>
          
          <div id="market-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-8">
            <!-- Dynamically populated cards -->
          </div>


          
          <div id="market-empty" class="hide flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
            <span class="text-4xl filter grayscale opacity-50">📂</span>
            <div class="text-center">
              <h3 class="text-white text-sm font-black uppercase tracking-widest leading-none">No packs found</h3>
              <p class="text-[9px] text-slate-600 uppercase tracking-widest mt-2 font-bold">Try adjusting your search criteria</p>
            </div>
            <button onclick="PackMarketplace.onSearch(''); document.querySelector('#modal-marketplace input').value='';" class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-lg border border-slate-700 transition-all">Clear Search</button>
          </div>
        </div>

        <!-- Footer Legend -->
        <div class="px-4 py-2 bg-slate-900/80 border-t border-slate-800 shrink-0 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Installed</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.3)]"></span> Advanced</span>
          </div>
          <div class="opacity-30 italic">Grimoire Protocol v3.1</div>
        </div>
      </div>
    </div>
`;
