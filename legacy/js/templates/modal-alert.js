/**
 * UI TEMPLATE: MODAL-DIALOG
 *
 * A custom replacement for the browser's native alert() and confirm() dialogues.
 * Sleek, premium, and fits the game's dark fantasy aesthetic.
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["modal-alert"] = `
    <!-- CUSTOM DIALOG MODAL (Alert/Confirm) -->
    <div id="modal-alert" class="hide absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center fx-modal-entrance ring-1 ring-white/10">
        <div id="alert-icon" class="text-5xl mb-4 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse">⚠️</div>
        <h2 id="alert-title" class="text-xl font-black tracking-widest mb-3 text-white uppercase font-serif">Notice</h2>
        <p id="alert-message" class="text-slate-300 text-sm mb-8 leading-relaxed font-medium">Something happened!</p>
        
        <!-- ALERT BUTTON -->
        <button id="alert-btn-ok" onclick="closeAlert()" class="interactive w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs border border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95">
          Acknowledge
        </button>

        <!-- CONFIRM BUTTONS -->
        <div id="confirm-btns" class="hide flex gap-3">
          <button id="confirm-btn-cancel" onclick="onDialogCancel()" class="interactive flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs border border-slate-700 active:scale-95">
            Cancel
          </button>
          <button id="confirm-btn-ok" onclick="onDialogConfirm()" class="interactive flex-1 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs border border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.3)] active:scale-95">
            Confirm
          </button>
        </div>
      </div>
    </div>
`;
