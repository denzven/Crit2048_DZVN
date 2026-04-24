/**
 * UI TEMPLATE: SCREEN-PLAYING
 *
 * Core gameplay loop UI. Includes the top HUD (stats, boss HP), sidebars (inventory, spells), and the main interactive battle grid.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["screen-playing"] = `
    <div id="screen-playing" class="hide flex flex-col items-center w-full max-w-4xl relative z-10 h-full justify-center scale-origin-center">
      
      <div id="playing-hud" class="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2 md:p-3 mb-2 md:mb-4 relative overflow-hidden flex flex-col gap-1 shrink-0 shadow-lg">
        <div class="absolute inset-0 bg-slate-800/50 w-full z-0">
          <div id="hud-hp-bar" class="h-full bg-rose-600/80 transition-all duration-300 ease-out" style="width: 100%"></div>
        </div>
        <div class="relative z-10 flex items-center justify-between">
          <div class="flex items-center gap-2 md:gap-3">
            <span id="hud-icon" class="text-xl md:text-2xl bg-slate-950 p-1.5 md:p-2 rounded-xl border border-slate-800">👺</span>
            <div>
              <h3 id="hud-name" class="font-black text-sm md:text-lg text-white tracking-wider">Monster</h3>
              <p class="text-[9px] md:text-xs font-mono text-rose-200 leading-none">HP: <span id="hud-hp">0 / 0</span></p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold">Slides</p>
            <p id="hud-slides" class="text-xl md:text-3xl font-black font-mono text-white leading-none">0</p>
          </div>
        </div>
        <div id="hud-power" class="relative z-10 text-[8px] md:text-[10px] font-mono text-amber-400/80 bg-slate-950/40 p-1 rounded-lg border border-amber-900/20 text-center uppercase tracking-tighter">
          Passive Power Here
        </div>
      </div>

      <div class="flex flex-row gap-4 items-stretch w-full justify-center min-h-0 flex-1">
        
        <div id="playing-sidebar-left" class="hidden md:flex flex-col gap-2 w-48 lg:w-56 shrink-0 min-h-0">
          <h4 class="text-xs uppercase tracking-widest text-slate-500 font-bold shrink-0">Inventory</h4>
          <div id="sidebar-artifacts" class="space-y-2 overflow-y-auto pr-1 flex-1"></div>
        </div>

        <div id="grid-container" class="relative bg-slate-800 p-2 md:p-3 rounded-2xl border border-slate-700 w-full aspect-square shrink-0 self-center shadow-xl">
          <div class="relative w-full h-full">
            <div class="grid grid-cols-4 grid-rows-4 gap-[2%] w-full h-full absolute inset-0">
              <div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div>
              <div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div>
              <div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div>
              <div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div>
            </div>
            <div id="tiles-layer" class="absolute inset-0 pointer-events-none"></div>
          </div>
        </div>

        <div id="playing-sidebar-right" class="hidden md:flex flex-col gap-4 w-48 lg:w-56 shrink-0 min-h-0">
          <div class="bg-slate-900 p-4 rounded-2xl border border-slate-700 text-center shadow-lg relative overflow-hidden shrink-0">
            <span id="sidebar-class-icon" class="text-4xl block mb-2 relative z-10">😡</span>
            <p id="sidebar-class-name" class="font-black text-sm text-white uppercase tracking-wider relative z-10">Hero</p>
            <p id="sidebar-spell-info" class="text-xs text-indigo-400 font-mono mt-1 relative z-10">Spell: None</p>
            <p id="sidebar-class-uses" class="text-xs text-amber-400 font-mono mb-4 relative z-10">Uses: 0</p>
            <button id="btn-ability" onclick="useClassAbility()" class="relative z-10 w-full py-3 rounded-xl text-sm font-black transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg uppercase tracking-widest border border-blue-400/30">
              Cast
            </button>
          </div>
          
          <div class="bg-slate-900 border border-slate-700 rounded-2xl p-2 text-xs text-slate-400 font-mono flex-1 overflow-y-auto" id="combat-log-desktop"></div>
        </div>
      </div>

      <div class="md:hidden flex w-full gap-2 mt-2 shrink-0 h-16">
        <div class="bg-slate-900 p-1.5 rounded-xl border border-slate-700 text-center flex items-center justify-center gap-2 w-full shadow-lg">
           <button onclick="toggleMobileInventory()" class="interactive flex-1 h-full rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-widest text-[10px] border border-slate-700 flex flex-col items-center justify-center gap-0.5">
             <span class="text-lg">🎒</span>
             <span>Items</span>
           </button>
           <button id="btn-ability-mobile" onclick="useClassAbility()" class="interactive flex-[1.5] h-full rounded-lg text-[10px] font-black transition-all bg-blue-600 active:bg-blue-500 text-white uppercase tracking-widest flex flex-col items-center justify-center border border-blue-400/30">
             <span class="flex items-center gap-2">
               <span id="mobile-class-icon" class="text-xl">😡</span>
               <span id="mobile-spell-uses" class="font-mono text-sm">0/0</span>
             </span>
             <span class="text-[8px] opacity-80">CAST ABILITY</span>
           </button>
           <button onclick="toggleMobileLog()" class="interactive flex-1 h-full rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-widest text-[10px] border border-slate-700 flex flex-col items-center justify-center gap-0.5">
             <span class="text-lg">📜</span>
             <span>Logs</span>
           </button>
        </div>
      </div>

      <!-- Mobile Modals (Inventory/Log) -->
      <div id="mobile-inventory-modal" class="hide absolute bottom-20 left-4 right-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-3xl p-5 z-[100] shadow-2xl max-h-[60vh] flex flex-col">
        <div class="flex justify-between items-center mb-4 shrink-0">
          <h3 class="text-white font-black uppercase tracking-widest">Inventory</h3>
          <button onclick="toggleMobileInventory()" class="text-slate-400 text-2xl">&times;</button>
        </div>
        <div id="mobile-inventory-list" class="overflow-y-auto space-y-3 custom-scrollbar flex-1">
          <!-- Artifacts injected here -->
        </div>
      </div>

      <div id="mobile-log-modal" class="hide absolute bottom-20 left-4 right-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-3xl p-5 z-[100] shadow-2xl h-[40vh] flex flex-col">
        <div class="flex justify-between items-center mb-2 shrink-0">
          <h3 class="text-white font-black uppercase tracking-widest">Combat Log</h3>
          <button onclick="toggleMobileLog()" class="text-slate-400 text-2xl">&times;</button>
        </div>
        <div id="combat-log-modal-content" class="overflow-y-auto font-mono text-[10px] space-y-1 custom-scrollbar flex-1 text-slate-300">
          <!-- Logs injected here -->
        </div>
      </div>
    </div>

`;
