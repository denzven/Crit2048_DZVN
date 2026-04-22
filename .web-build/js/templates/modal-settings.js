/**
 * UI TEMPLATE: MODAL-SETTINGS
 *
 * The configuration overlay. Hosts user inputs for screen shake, sfx volume, and visual dice themes.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["modal-settings"] = `
    <!-- SETTINGS MODAL -->
    <div id="modal-settings" class="hide absolute inset-0 bg-slate-950/95 z-[110] flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
        <h2 class="text-xl font-black tracking-widest mb-6 text-white text-center uppercase">Settings</h2>
        <div class="space-y-6 mb-8">
          <div>
            <label class="block text-slate-400 text-xs mb-2 font-bold uppercase tracking-wider">Slides Before D20 Roll</label>
            <input type="number" id="input-setting-turns" class="w-full bg-slate-950 border border-slate-800 text-white font-bold rounded-xl p-3 focus:border-rose-500 outline-none" min="1" max="20">
          </div>
          <div>
            <label class="block text-slate-400 text-xs mb-2 font-bold uppercase tracking-wider">Starting Gold</label>
            <input type="number" id="input-setting-gold" class="w-full bg-slate-950 border border-slate-800 text-white font-bold rounded-xl p-3 focus:border-rose-500 outline-none" min="0" max="1000">
          </div>
          
          <div class="pt-4 border-t border-slate-800">
            <label class="block text-slate-400 text-xs mb-3 font-bold uppercase tracking-wider">Dice Theme</label>
            <select id="input-setting-theme" class="w-full bg-slate-950 border border-slate-800 text-white font-bold rounded-xl p-3 focus:border-rose-500 outline-none">
                <option value="default">Default Colors</option>
                <option value="blood">Blood Magic</option>
                <option value="bone">Ancient Bone</option>
                <option value="neon">Cyber Neon</option>
            </select>
          </div>

          <div class="pt-4 border-t border-slate-800">
            <label class="block text-slate-400 text-xs mb-3 font-bold uppercase tracking-wider">SFX Volume</label>
            <input type="range" id="input-setting-sfx" min="0" max="1" step="0.1" value="1" class="w-full accent-rose-500">
          </div>
          <div>
            <label class="block text-slate-400 text-xs mb-3 font-bold uppercase tracking-wider">Screen Shake Level</label>
            <input type="range" id="input-setting-shake" min="0" max="2" step="0.5" value="1" class="w-full accent-rose-500">
          </div>
        </div>
        <div class="flex gap-3">
          <button onclick="closeSettings()" class="flex-1 py-4 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs border border-slate-700">Cancel</button>
          <button onclick="saveSettings()" class="flex-1 py-4 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-500 transition-colors uppercase tracking-widest text-xs border border-rose-500/50 shadow-lg">Save</button>
        </div>
      </div>
    </div>

`;
