/**
 * UI TEMPLATE: SCREEN-PLAYING
 *
 * Core gameplay loop UI. Includes the top HUD (stats, boss HP), sidebars (inventory, spells), and the main interactive battle grid.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["screen-playing"] = `
    <div id="screen-playing" class="hide flex flex-col items-center w-full max-w-4xl relative z-10 h-full">
      
      <div class="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 md:p-4 mb-4 relative overflow-hidden flex flex-col gap-2 shrink-0 shadow-lg">
        <div class="absolute inset-0 bg-slate-800/50 w-full z-0">
          <div id="hud-hp-bar" class="h-full bg-rose-600/80 transition-all duration-300 ease-out" style="width: 100%"></div>
        </div>
        <div class="relative z-10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span id="hud-icon" class="text-3xl bg-slate-950 p-2 rounded-xl border border-slate-800">👺</span>
            <div>
              <h3 id="hud-name" class="font-black text-lg md:text-xl text-white tracking-wider">Monster</h3>
              <p class="text-xs font-mono text-rose-200">HP: <span id="hud-hp">0 / 0</span></p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Slides Left</p>
            <p id="hud-slides" class="text-3xl md:text-4xl font-black font-mono text-white">0</p>
          </div>
        </div>
        <div id="hud-power" class="relative z-10 text-xs font-mono text-amber-300 bg-slate-950/60 p-1.5 rounded-lg border border-amber-900/50 text-center uppercase tracking-wider">
          Passive Power Here
        </div>
      </div>

      <div class="flex flex-row gap-4 items-stretch w-full justify-center min-h-0 flex-1">
        
        <div class="hidden md:flex flex-col gap-2 w-48 shrink-0 min-h-0">
          <h4 class="text-xs uppercase tracking-widest text-slate-500 font-bold shrink-0">Inventory</h4>
          <div id="sidebar-artifacts" class="space-y-2 overflow-y-auto pr-1 flex-1"></div>
        </div>

        <div id="grid-container" class="relative bg-slate-800 p-2 md:p-3 rounded-2xl border border-slate-700 w-full max-w-[340px] md:max-w-[400px] aspect-square shrink-0 self-center shadow-xl">
          <div class="grid grid-cols-4 grid-rows-4 gap-[2%] w-full h-full absolute inset-2 md:inset-3" style="width: 96%; height: 96%;">
            <div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div>
            <div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div>
            <div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div>
            <div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div><div class="bg-slate-900/80 rounded-xl shadow-inner"></div>
          </div>
          <div id="tiles-layer" class="absolute inset-2 md:inset-3" style="width: 96%; height: 96%;"></div>
        </div>

        <div class="hidden md:flex flex-col gap-4 w-48 shrink-0 min-h-0">
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

      <div class="md:hidden flex w-full gap-2 mt-4 shrink-0 h-[100px]">
        <div class="bg-slate-900 p-2 rounded-xl border border-slate-700 text-center flex flex-col justify-center w-[100px] shrink-0">
           <button id="btn-ability-mobile" onclick="useClassAbility()" class="w-full h-full rounded-lg text-[10px] font-black transition-all bg-blue-600 active:bg-blue-500 text-white uppercase tracking-widest flex flex-col items-center justify-center border border-blue-400/30">
             <span id="mobile-class-icon" class="text-2xl mb-1">😡</span>
             <span id="mobile-spell-uses">0/0</span>
           </button>
        </div>
        <div id="combat-log-mobile" class="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-[10px] font-mono overflow-y-auto h-24"></div>
      </div>
    </div>

`;
