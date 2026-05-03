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
    <div id="modal-help" class="hide absolute inset-0 bg-slate-950/60 z-[150] flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-300">
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative flex flex-col h-[85vh] max-h-[800px] backdrop-blur-sm">
         <!-- Subtle Glow Background -->
         <div class="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none rounded-3xl"></div>
         <button onclick="closeHelp()" class="absolute top-4 right-4 text-slate-400 hover:text-white text-3xl font-light z-10">&times;</button>
         <h2 class="text-3xl font-black tracking-widest mb-2 text-rose-500 text-center uppercase font-serif shrink-0">Compendium</h2>
         
         <!-- Pagination Indicator -->
         <div class="flex justify-center gap-2 mb-6 shrink-0" id="help-pagination-dots">
            <span class="w-2 h-2 rounded-full bg-rose-500 transition-colors" id="dot-1"></span>
            <span class="w-2 h-2 rounded-full bg-slate-700 transition-colors" id="dot-2"></span>
            <span class="w-2 h-2 rounded-full bg-slate-700 transition-colors" id="dot-3"></span>
            <span class="w-2 h-2 rounded-full bg-slate-700 transition-colors" id="dot-4"></span>
            <span class="w-2 h-2 rounded-full bg-slate-700 transition-colors" id="dot-5"></span>
            <span class="w-2 h-2 rounded-full bg-slate-700 transition-colors" id="dot-6"></span>
         </div>

         <!-- Scrollable Content Container -->
         <div class="flex-grow space-y-6 text-slate-300 text-sm relative overflow-y-auto pr-2 pb-4">
            
            <!-- Page 1: Beginner's Guide -->
            <div id="help-page-1" class="help-page w-full transition-opacity duration-300">
               <h3 class="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">I. Quick Start Guide</h3>
               <p class="mb-4"><strong>Welcome to Crit 2048!</strong> Here is everything you need to know to survive your first run:</p>
               
               <ul class="list-disc pl-5 space-y-4 text-slate-300">
                  <li><strong class="text-white">The Goal:</strong> Defeat all 6 bosses before you run out of moves (slides).</li>
                  <li><strong class="text-white">How to Attack:</strong> Swipe to slide the tiles. When two identical weapons touch, they merge into a stronger weapon and deal damage to the boss!</li>
                  <li><strong class="text-white">Watch Your Slides:</strong> Every swipe consumes a slide. If you run out of slides before the boss dies, the run is over.</li>
                  <li><strong class="text-white">Roll the D20:</strong> Every 5 slides, fate intervenes. You will be forced to roll a D20. High rolls grant buffs; low rolls spawn hazards!</li>
                  <li><strong class="text-white">Use Your Spells:</strong> If your class has a spell (like Fireball or Smite), don't forget to use it when the grid gets crowded.</li>
                  <li><strong class="text-white">Shop Smart:</strong> After defeating a boss, spend your Gold at the Tavern on Artifacts that passively buff your entire run.</li>
               </ul>
            </div>

            <!-- Page 2: Core Concept -->
            <div id="help-page-2" class="help-page hidden w-full transition-opacity duration-300">
               <h3 class="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">II. The Core Concept</h3>
               <p class="mb-4"><strong>Crit 2048</strong> is a roguelike dungeon crawler built on the 2048 sliding puzzle. The grid is your battlefield. Sliding matching weapons merges them and deals damage to the boss.</p>
               
               <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs mb-4 text-emerald-400">
                 Dagger (2) + Dagger (2) = Longsword (4) &rarr; 8 dmg<br>
                 Longsword + Longsword = Crossbow (8) &rarr; 20 dmg<br>
                 Crossbow + Crossbow = Battleaxe (16) &rarr; 50 dmg<br>
                 Battleaxe + Battleaxe = Magic Staff (32) &rarr; 120 dmg<br>
                 Magic Staff + Magic Staff = Holy Sword (64) &rarr; 300 dmg<br>
                 Holy Sword + Holy Sword = Relic (128) &rarr; 1,280 dmg
               </div>

               <p class="mb-4">Damage is calculated as: <code>weapon_base_dmg &times; your_multiplier</code>. Build your multiplier to delete bosses in a single merge.</p>
               
               <h4 class="text-lg font-bold text-white mt-4 mb-2 uppercase tracking-wide">The Game Loop</h4>
               <ul class="list-disc pl-5 space-y-2 text-slate-400">
                  <li><strong>Class Select:</strong> Pick a class with unique stats and a spell.</li>
                  <li><strong>Combat:</strong> Merge weapons to damage the boss before your slides run out.</li>
                  <li><strong>Roll D20:</strong> Every 5 slides, you must roll the 20-sided die.</li>
                  <li><strong>Tavern:</strong> Spend gold to buy/upgrade artifacts or restock your spell.</li>
               </ul>
            </div>

            <!-- Page 3: Classes -->
            <div id="help-page-3" class="help-page hidden w-full transition-opacity duration-300">
               <h3 class="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">III. Classes & Abilities</h3>
               <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>😡 Barbarian:</strong> +10 dmg to T1/T2. Mod: -1.
                  </div>
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>🥷 Rogue:</strong> +1 Gold per merge. Mod: +2.
                  </div>
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>🧙‍♂️ Wizard:</strong> Fireball (burns 2x2). Mod: +1.
                  </div>
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>👁️ Warlock:</strong> Eldritch Blast (clears row). Mod: +1.
                  </div>
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>✨ Cleric:</strong> Divine Aid (heals + purifies). Mod: 0.
                  </div>
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>🛡️ Paladin:</strong> Smite (mult by max tile). Mod: 0.
                  </div>
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>🎵 Bard:</strong> +5 Gold/roll. Vicious Mockery. Mod: +1.
                  </div>
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>🌿 Druid:</strong> Auto-purify chance. Entangle. Mod: 0.
                  </div>
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>⚔️ Fighter:</strong> +15 Dmg to T3+. Action Surge. Mod: 0.
                  </div>
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>👊 Monk:</strong> Alt dirs for Mult. Ki Strike. Mod: +1.
                  </div>
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>🏹 Ranger:</strong> +Dmg vs spawners. Hunter's Mark. Mod: -1.
                  </div>
                  <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <strong>🔮 Sorcerer:</strong> 19-20 Crit. Chaos Bolt. Mod: +1.
                  </div>
               </div>
            </div>

            <!-- Page 4: Bosses & Hazards -->
            <div id="help-page-4" class="help-page hidden w-full transition-opacity duration-300">
               <h3 class="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">IV. Bosses & Hazards</h3>
               
               <h4 class="text-sm font-bold text-white mb-2 uppercase">The 12 Encounters</h4>
               <ul class="text-[10px] space-y-1 mb-4 bg-slate-950 p-2 rounded-xl border border-slate-800 grid grid-cols-2 gap-x-2">
                  <li><span class="text-sm">👺</span> 1. Goblin Scout</li>
                  <li><span class="text-sm">👹</span> 2. Orc Brute</li>
                  <li><span class="text-sm">📦</span> 3. Mimic Colony</li>
                  <li><span class="text-sm">🟢</span> 4. Slime King</li>
                  <li><span class="text-sm">🦉</span> 5. Owlbear Alpha</li>
                  <li><span class="text-sm">🧌</span> 6. Troll King</li>
                  <li><span class="text-sm">🧠</span> 7. Mind Flayer</li>
                  <li><span class="text-sm">💀</span> 8. The Lich</li>
                  <li><span class="text-sm">👁️‍🗨️</span> 9. Beholder</li>
                  <li><span class="text-sm">🐉</span> 10. Ancient Dragon</li>
                  <li><span class="text-sm">🧛</span> 11. Vampire Lord</li>
                  <li><span class="text-sm">🐲</span> 12. Tiamat</li>
               </ul>

               <h4 class="text-sm font-bold text-white mb-2 uppercase">Hazard Tiles</h4>
               <ul class="list-disc pl-5 text-[10px] text-slate-400 space-y-1">
                  <li><strong>🟢 Slime / 🍄 Spore:</strong> Blocks merges. Multiply over time.</li>
                  <li><strong>👺 Goblin:</strong> Steals gold.</li>
                  <li><strong>💀 Skeleton / 📦 Mimic:</strong> Blocks merges entirely.</li>
                  <li><strong>🕸️ Web:</strong> Web-like block. Cleared by 75+ dmg.</li>
                  <li><strong>🔮 Curse:</strong> Drains 1 extra slide per move.</li>
               </ul>
            </div>

            <!-- Page 5: D20 & Multiplier -->
            <div id="help-page-5" class="help-page hidden w-full transition-opacity duration-300">
               <h3 class="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">V. The D20 & Multiplier</h3>
               
               <p class="mb-3">Every 5 slides, you must roll the D20. Your class modifier applies.</p>
               <table class="w-full text-xs text-left text-slate-400 mb-4 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                 <thead class="bg-slate-900 text-white uppercase">
                   <tr><th class="p-2 border-b border-slate-700">Roll</th><th class="p-2 border-b border-slate-700">Outcome</th></tr>
                 </thead>
                 <tbody>
                   <tr><td class="p-2 border-b border-slate-800 text-rose-400 font-bold">20+ (Nat 20)</td><td class="p-2 border-b border-slate-800">CRIT - Mult +1 &amp; upgrade a tile</td></tr>
                   <tr><td class="p-2 border-b border-slate-800 text-emerald-400 font-bold">10-19</td><td class="p-2 border-b border-slate-800">SUCCESS - A Crossbow spawns</td></tr>
                   <tr><td class="p-2 border-b border-slate-800 text-amber-400 font-bold">2-9</td><td class="p-2 border-b border-slate-800">MISS - A Slime spawns</td></tr>
                   <tr><td class="p-2 text-red-500 font-bold">1 or less</td><td class="p-2">FAIL - Your best weapon breaks</td></tr>
                 </tbody>
               </table>

               <h4 class="text-sm font-bold text-white mb-2 uppercase">The Multiplier</h4>
               <p class="text-xs mb-2">Amplifies your base damage. Increased by Nat 20s, the Giant's Potion (+0.3/lvl), Assassin's Mark (Rogue only), or the Gemini Oracle.</p>
            </div>

            <!-- Page 6: Tavern & Artifacts -->
            <div id="help-page-6" class="help-page hidden w-full transition-opacity duration-300">
               <h3 class="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">VI. Tavern & Artifacts</h3>
               
               <p class="text-xs mb-3">After a boss, visit the Tavern to spend Gold on upgrades.</p>
               
               <ul class="text-[10px] space-y-1 mb-4 bg-slate-950 p-2 rounded-xl border border-slate-800 grid grid-cols-2 gap-x-2 leading-tight">
                  <li><strong>🎲 Weighted Dice:</strong> Floor protection.</li>
                  <li><strong>🎯 Assassin's Mark:</strong> Daggers grant Mult.</li>
                  <li><strong>🥾 Gravity Boots:</strong> DOWN sliding deals 1.5x Dmg.</li>
                  <li><strong>📖 Necronomicon:</strong> Slimes damage boss.</li>
                  <li><strong>💍 Ring of Wealth:</strong> Bonus tavern gold.</li>
                  <li><strong>⚡ Boots of Haste:</strong> Extra start slides.</li>
                  <li><strong>🧪 Giant's Potion:</strong> +0.3 Mult instantly.</li>
                  <li><strong>🔪 Vorpal Edge:</strong> True Dmg proc chance.</li>
                  <li><strong>🧥 Cloak of Invis:</strong> Hazards -20% spawn.</li>
                  <li><strong>📿 Amulet of Proof:</strong> Low rolls raised.</li>
                  <li><strong>🔥 Flame Tongue:</strong> T3+ merges AOE.</li>
                  <li><strong>🌙 Moon Sickle:</strong> Heals give slides.</li>
                  <li><strong>🎸 Lute of Thunder:</strong> Spell Dmg x1.5.</li>
                  <li><strong>🏛️ Staff of Power:</strong> Best Chaos Bolt.</li>
                  <li><strong>🛡️ Bracers of Def:</strong> Slides per roll.</li>
                  <li><strong>🏹 Quiver Ehlonna:</strong> Hunter's Mark + duration.</li>
                  <li><strong>💼 Bag of Holding:</strong> +1 Shop slot.</li>
                  <li><strong>👑 Helm of Brilliance:</strong> Crits deal huge Dmg.</li>
                  <li><strong>🪨 Stone of Luck:</strong> +1 to ALL rolls.</li>
                  <li><strong>⬛ Adamantine:</strong> Immune to crit fails.</li>
                  <li><strong>🔩 Immovable Rod:</strong> Best weapon protected.</li>
                  <li><strong>🃏 Deck of Many:</strong> D20 outcomes doubled.</li>
                  <li><strong>⚔️ Holy Avenger:</strong> Massive Smite + AOE.</li>
                  <li><strong>📜 Spell Scroll:</strong> +1 Max spell uses.</li>
               </ul>

               <h4 class="text-sm font-bold text-white mb-1 uppercase">Gemini Oracle</h4>
               <p class="text-xs text-slate-400">For 50 gold, an AI Oracle crafts a unique legendary artifact granting +1.0 Mult and custom flavor.</p>
            </div>

         </div>
         
         <!-- Pagination Controls -->
         <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-800 shrink-0">
            <button onclick="prevHelpPage()" id="btn-help-prev" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <p class="text-center text-xs text-slate-500 hidden md:block">made with love by DZVN 💜</p>
            <button onclick="nextHelpPage()" id="btn-help-next" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
         </div>

      </div>
    </div>
`;
