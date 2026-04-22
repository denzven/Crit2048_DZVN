/**
 * UI TEMPLATE: MODAL-DICE
 *
 * The D20 roll interface overlay. Displays the current player modifier and the "Roll Fate" action button.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["modal-dice"] = `
    <!-- D20 MODAL -->
    <div id="modal-dice" class="hide absolute inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div id="d20-panel" class="pointer-events-auto bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center shadow-2xl relative">
        <h2 class="text-2xl font-black mb-1 text-rose-500 uppercase tracking-widest mt-2 font-serif">D20 Check</h2>
        <p class="text-slate-400 text-xs uppercase tracking-widest mb-6 font-bold">Mod: <span id="dice-mod-val" class="text-white bg-slate-800 px-2 py-0.5 rounded ml-1">+0</span></p>

        <div class="relative w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 my-2 flex flex-col items-center justify-center overflow-hidden">
            <div id="d20-render-target" class="w-full h-full absolute inset-0 mx-auto z-10 flex items-center justify-center"></div>

            <div id="dice-action-btn" class="absolute inset-0 flex items-center justify-center z-20">
                <button onclick="rollD20()" class="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl cursor-pointer hover:scale-105 transition-all shadow-lg font-black uppercase tracking-widest border border-rose-400/30">
                    Roll Fate
                </button>
            </div>
        </div>

        <div id="dice-post-roll" class="hide flex flex-col items-center w-full z-20 mt-6 min-h-[80px]">
          <div id="dice-result-msg" class="flex flex-col items-center justify-center w-full text-center"></div>
          <button onclick="closeD20Modal()" class="px-8 py-4 mt-6 bg-slate-700 hover:bg-slate-600 text-white font-black uppercase tracking-widest transition-all w-full rounded-xl border border-slate-600">
            Continue
          </button>
        </div>
      </div>
    </div>

`;
