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
      <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-md md:max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        <div class="p-6 border-b border-slate-800 shrink-0">
          <h2 class="text-2xl font-black tracking-widest text-white text-center uppercase font-serif">Settings</h2>
        </div>
        
        <div class="flex-grow overflow-y-auto p-6 space-y-8">
          <!-- Game Balance Section -->
          <section>
            <h3 class="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Dungeon Rules</h3>
            <div class="space-y-4">
              <div>
                <label class="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Moves per Roll <span id="label-setting-turns" class="text-white">5</span></label>
                <input type="range" id="input-setting-turns" min="1" max="15" step="1" class="w-full accent-rose-500">
              </div>
              <div>
                <label class="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Starting Gold <span id="label-setting-gold" class="text-amber-400">0</span></label>
                <input type="range" id="input-setting-gold" min="0" max="500" step="50" class="w-full accent-rose-500">
              </div>
            </div>
          </section>

          <!-- Visuals Section -->
          <section class="pt-6 border-t border-slate-800">
            <h3 class="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Atmosphere</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Dice Theme</label>
                <select id="input-setting-theme" class="w-full bg-slate-950 border border-slate-800 text-white font-bold rounded-xl p-3 focus:border-rose-500 outline-none text-xs">
                    <option value="default">Default Colors</option>
                    <option value="blood">Blood Magic</option>
                    <option value="bone">Ancient Bone</option>
                    <option value="neon">Cyber Neon</option>
                </select>
              </div>
              <div class="flex items-center justify-between">
                <label class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Particle System</label>
                <input type="checkbox" id="input-setting-atmosphere" class="w-5 h-5 accent-rose-500 bg-slate-950 border-slate-800 rounded">
              </div>
              <div>
                <label class="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Screen Shake <span id="label-setting-shake" class="text-white">1.0</span></label>
                <input type="range" id="input-setting-shake" min="0" max="2" step="0.1" class="w-full accent-rose-500">
              </div>
            </div>
          </section>

          <!-- Audio & Haptics Section -->
          <section class="pt-6 border-t border-slate-800">
            <h3 class="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Sensory</h3>
            <div class="space-y-4">
              <div>
                <label class="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">SFX Volume <span id="label-setting-sfx" class="text-white">100%</span></label>
                <input type="range" id="input-setting-sfx" min="0" max="1" step="0.05" class="w-full accent-rose-500">
              </div>
              <div class="flex items-center justify-between">
                <label class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Touch Feedback</label>
                <input type="checkbox" id="input-setting-haptics-enabled" class="w-5 h-5 accent-rose-500 bg-slate-950 border-slate-800 rounded">
              </div>
              <div>
                <label class="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Haptic Intensity <span id="label-setting-haptics" class="text-white">1.0</span></label>
                <input type="range" id="input-setting-haptics-intensity" min="0" max="1" step="0.1" class="w-full accent-rose-500">
              </div>
              <div class="pt-2">
                <label class="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">UI Scale <span id="label-setting-ui-scale" class="text-white">100%</span></label>
                <input type="range" id="input-setting-ui-scale" min="0.5" max="1.5" step="0.05" class="w-full accent-rose-500">
              </div>
              <div class="pt-2">
                <label class="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Font Scale <span id="label-setting-font-scale" class="text-white">100%</span></label>
                <input type="range" id="input-setting-font-scale" min="0.5" max="1.5" step="0.05" class="w-full accent-emerald-500">
              </div>
              <div class="pt-2">
                <label class="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Display Scale <span id="label-setting-display-scale" class="text-white">100%</span></label>
                <input type="range" id="input-setting-display-scale" min="0.5" max="1.5" step="0.05" class="w-full accent-blue-500">
              </div>
            </div>
          </section>

          <button onclick="resetSettingsToDefault()" class="w-full py-3 text-slate-500 hover:text-rose-400 transition-colors text-[9px] font-black uppercase tracking-widest border border-dashed border-slate-800 rounded-xl">
            Reset to Factory Defaults
          </button>
        </div>

        <div class="p-6 border-t border-slate-800 flex gap-3 shrink-0">
          <button onclick="closeSettings()" class="flex-1 py-3 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px] border border-slate-700">Cancel</button>
          <button onclick="saveSettings()" class="flex-1 py-3 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-500 transition-colors uppercase tracking-widest text-[10px] border border-rose-500/50 shadow-lg">Save Config</button>
        </div>
      </div>
    </div>

`;
