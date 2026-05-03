/**
 * UI TEMPLATE: MODAL-ATTACK
 *
 * The temporary overlay shown when a player casts a physical dice spell, showing the 3D dice simulation container.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["modal-attack"] = `
    <!-- ATTACK DICE MODAL (Spells) -->
    <div id="modal-attack" class="hide absolute inset-0 z-[100] flex flex-col items-center justify-center p-4 pointer-events-none">
      <div id="attack-panel" class="pointer-events-auto bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-2xl w-full text-center flex flex-col items-center shadow-2xl relative">
        <h2 id="attack-title" class="text-2xl font-black text-blue-400 uppercase tracking-widest mb-6 font-serif">Casting...</h2>
        
        <div id="attack-dice-container" class="relative w-full min-h-[250px] bg-slate-950 rounded-2xl border border-slate-800 my-2 overflow-hidden flex flex-col items-center justify-center p-4"></div>
        
        <div id="attack-result" class="hide flex flex-col items-center w-full z-20 mt-4">
          <p class="text-slate-400 uppercase tracking-widest text-xs mb-1 font-bold">Total Result</p>
          <p id="attack-total" class="text-6xl font-black font-mono text-white mb-6 drop-shadow-md">0</p>
          <button onclick="resolveAttack()" class="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg uppercase tracking-widest transition-all rounded-xl shadow-lg w-full border border-blue-400/30">
            Strike!
          </button>
        </div>
      </div>
    </div>

`;
