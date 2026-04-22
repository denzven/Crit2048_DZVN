/**
 * UI TEMPLATE: MODAL-HELP
 *
 * The comprehensive tutorial compendium. Explains hazards, classes, and rules in a deeply styled overlay.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["modal-help"] = `
    <!-- HELP / COMPENDIUM MODAL -->
    <div id="modal-help" class="hide absolute inset-0 bg-slate-950/95 z-[110] flex flex-col items-center justify-start p-4 md:p-8 overflow-y-auto">
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative mt-4 mb-4">
         <button onclick="closeHelp()" class="absolute top-4 right-4 text-slate-400 hover:text-white text-3xl font-light">&times;</button>
         <h2 class="text-3xl font-black tracking-widest mb-6 text-rose-500 text-center uppercase font-serif">Compendium</h2>

         <div class="space-y-6 text-slate-300 text-sm">
            <section>
               <h3 class="text-lg font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">Rules of the Dungeon</h3>
               <ul class="list-disc pl-5 space-y-3 text-slate-400">
                  <li><strong class="text-white">Merge to Strike:</strong> Swipe to combine identical weapons to upgrade them. Every merge deals damage to the boss based on the weapon's resulting power.</li>
                  <li><strong class="text-white">Cast Physical Spells:</strong> Use your class ability to roll real 3D dice. The outcome determines the power of devastating grid-wide effects.</li>
                  <li><strong class="text-white">Beware Hazards:</strong> Goblins (👺) steal your hard-earned gold. Skeletons (💀) block your merges. Slimes (🟢) multiply and crowd the board. Clear them out by dealing massive burst damage to the boss!</li>
                  <li><strong class="text-white">Roll For Fate (D20):</strong> Every few moves, you must roll a D20. High rolls bestow critical buffs and spawn powerful weapons, while low rolls spawn hazards or shatter your highest tier weapon.</li>
               </ul>
            </section>

            <section>
               <h3 class="text-lg font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">Classes & Abilities</h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                    <div class="flex items-center gap-2 mb-1"><span class="text-2xl">😡</span> <strong class="text-white text-base uppercase tracking-wider">Barbarian</strong></div>
                    <p class="text-xs text-slate-400">Deals +10 base damage to early weapon combos. Has a <strong class="text-rose-400">-1</strong> penalty to D20 rolls.</p>
                  </div>
                  <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                    <div class="flex items-center gap-2 mb-1"><span class="text-2xl">🥷</span> <strong class="text-white text-base uppercase tracking-wider">Rogue</strong></div>
                    <p class="text-xs text-slate-400">Gains +1 bonus gold for every successful merge. Has a <strong class="text-emerald-400">+2</strong> bonus to D20 rolls.</p>
                  </div>
                  <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                    <div class="flex items-center gap-2 mb-1"><span class="text-2xl">🧙‍♂️</span> <strong class="text-white text-base uppercase tracking-wider">Wizard</strong></div>
                    <p class="text-xs text-slate-400">Casts <strong class="text-blue-400">Fireball</strong> to obliterate a 2x2 section of the grid. Has a <strong class="text-emerald-400">+1</strong> bonus to D20 rolls.</p>
                  </div>
                  <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                    <div class="flex items-center gap-2 mb-1"><span class="text-2xl">👁️</span> <strong class="text-white text-base uppercase tracking-wider">Warlock</strong></div>
                    <p class="text-xs text-slate-400">Casts <strong class="text-purple-400">Eldritch Blast</strong> to clear an entire row of hazards. Has a <strong class="text-emerald-400">+1</strong> bonus to D20 rolls.</p>
                  </div>
                  <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                    <div class="flex items-center gap-2 mb-1"><span class="text-2xl">✨</span> <strong class="text-white text-base uppercase tracking-wider">Cleric</strong></div>
                    <p class="text-xs text-slate-400">Casts <strong class="text-amber-300">Divine Aid</strong> to restore slides and instantly purify a hazard into a weapon. Mod: 0.</p>
                  </div>
                  <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                    <div class="flex items-center gap-2 mb-1"><span class="text-2xl">🛡️</span> <strong class="text-white text-base uppercase tracking-wider">Paladin</strong></div>
                    <p class="text-xs text-slate-400">Casts <strong class="text-yellow-400">Divine Smite</strong>, multiplying the spell damage by the value of your highest weapon. Mod: 0.</p>
                  </div>
               </div>
            </section>

            <p class="text-center text-xs text-slate-500 pt-6 mt-6 border-t border-slate-800">
               made with love by DZVN 💜 Vibecoded with Google Gemini AI ✨
            </p>
         </div>
      </div>
    </div>

`;
