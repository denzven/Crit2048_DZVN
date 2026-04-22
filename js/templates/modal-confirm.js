/**
 * UI TEMPLATE: MODAL-CONFIRM
 *
 * A purely structural warning dialogue overlay triggered when clicking the home button.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["modal-confirm"] = `
    <!-- CONFIRM HOME MODAL -->
    <div id="modal-confirm" class="hide absolute inset-0 bg-slate-950/95 z-[120] flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
        <h2 class="text-xl font-black tracking-widest mb-4 text-white uppercase">Leave this run?</h2>
        <p class="text-slate-400 text-sm mb-8">Go back to game start. All current progress will be lost.</p>
        <div class="flex gap-3">
          <button onclick="closeConfirm()" class="flex-1 py-4 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs border border-slate-700">Cancel</button>
          <button onclick="executeHome()" class="flex-1 py-4 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-500 transition-colors uppercase tracking-widest text-xs border border-rose-500/50 shadow-lg">Leave</button>
        </div>
      </div>
    </div>

`;
