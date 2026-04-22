/**
 * UI TEMPLATE: SCREEN-START
 *
 * Main entry screen UI. Includes the game title, interactive rules, and the seed input form.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["screen-start"] = `
    <div id="screen-start" class="text-center space-y-6 max-w-2xl mx-auto w-full relative z-10 flex flex-col justify-center h-full overflow-y-auto">
      <div>
        <h2 class="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter font-serif">CRIT <span class="text-rose-500">2048</span></h2>
        <p class="text-slate-400 text-xl font-light">Seeded Roguelike Deckbuilder</p>
      </div>

      <div class="bg-slate-900 border border-slate-700 p-6 rounded-2xl text-left text-sm md:text-base space-y-4 shadow-xl">
        <h3 class="font-black text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2">How to Play</h3>
        <ul class="space-y-3 text-slate-400">
          <li><strong class="text-white">1. Merge:</strong> Swipe to combine weapons and deal damage to the Boss.</li>
          <li><strong class="text-white">2. Spellcraft:</strong> Cast physical dice spells (like Fireball) that unleash grid-wide effects.</li>
          <li><strong class="text-white">3. Hazards:</strong> Beware Goblins (steal gold) and Skeletons (block merging).</li>
          <li><strong class="text-white">4. The D20:</strong> Every <span id="instruction-turns" class="font-bold text-amber-400">5</span> moves, roll a D20 to determine your fate.</li>
        </ul>
      </div>

      <div class="flex flex-col gap-3">
        <input type="text" id="input-seed" placeholder="Enter Seed (Leave blank for random)" class="w-full bg-slate-800 border border-slate-700 text-white text-center font-mono rounded-xl p-4 focus:border-rose-500 outline-none uppercase shadow-inner">
        <button onclick="startGameFlow()" class="w-full px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition-all text-xl uppercase tracking-widest border border-rose-500/50">
          Enter the Dungeon
        </button>
      </div>
    </div>

`;
