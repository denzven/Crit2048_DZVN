import React, { useState } from 'react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 6;

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const prevHelpPage = () => setCurrentPage(p => Math.max(p - 1, 1));

  return (
    <div className="absolute inset-0 bg-slate-950/80 z-[150] flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative flex flex-col h-[85vh] max-h-[800px]">
        {/* Subtle Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none rounded-3xl"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-3xl font-light z-10">&times;</button>
        <h2 className="text-3xl font-black tracking-widest mb-2 text-rose-500 text-center uppercase font-serif shrink-0">Compendium</h2>
        
        {/* Pagination Indicator */}
        <div className="flex justify-center gap-2 mb-6 shrink-0">
          {[...Array(totalPages)].map((_, i) => (
            <span 
              key={i} 
              className={`w-2 h-2 rounded-full transition-colors ${currentPage === i + 1 ? 'bg-rose-500' : 'bg-slate-700'}`}
            ></span>
          ))}
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-grow space-y-6 text-slate-300 text-sm relative overflow-y-auto pr-2 pb-4 custom-scrollbar">
          
          {currentPage === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">I. Quick Start Guide</h3>
              <p className="mb-4"><strong>Welcome to Crit 2048!</strong> Here is everything you need to know to survive your first run:</p>
              <ul className="list-disc pl-5 space-y-4 text-slate-300">
                <li><strong className="text-white">The Goal:</strong> Defeat all bosses before you run out of moves (slides).</li>
                <li><strong className="text-white">How to Attack:</strong> Swipe to slide the tiles. When two identical weapons touch, they merge into a stronger weapon and deal damage to the boss!</li>
                <li><strong className="text-white">Watch Your Slides:</strong> Every swipe consumes a slide. If you run out of slides before the boss dies, the run is over.</li>
                <li><strong className="text-white">Roll the D20:</strong> Every 5 slides, fate intervenes. You will be forced to roll a D20. High rolls grant buffs; low rolls spawn hazards!</li>
                <li><strong className="text-white">Use Your Spells:</strong> If your class has a spell (like Fireball or Smite), don't forget to use it when the grid gets crowded.</li>
                <li><strong className="text-white">Shop Smart:</strong> After defeating a boss, spend your Gold at the Tavern on Artifacts that passively buff your entire run.</li>
              </ul>
            </div>
          )}

          {currentPage === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">II. The Core Concept</h3>
              <p className="mb-4"><strong>Crit 2048</strong> is a roguelike dungeon crawler built on the 2048 sliding puzzle. The grid is your battlefield. Sliding matching weapons merges them and deals damage to the boss.</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs mb-4 text-emerald-400">
                Dagger (2) + Dagger (2) = Longsword (4) &rarr; 8 dmg<br/>
                Longsword + Longsword = Crossbow (8) &rarr; 20 dmg<br/>
                Crossbow + Crossbow = Battleaxe (16) &rarr; 50 dmg<br/>
                Battleaxe + Battleaxe = Magic Staff (32) &rarr; 120 dmg<br/>
                Magic Staff + Magic Staff = Holy Sword (64) &rarr; 300 dmg<br/>
                Holy Sword + Holy Sword = Relic (128) &rarr; 1,280 dmg
              </div>
              <p className="mb-4">Damage is calculated as: <code>weapon_base_dmg &times; your_multiplier</code>. Build your multiplier to delete bosses in a single merge.</p>
            </div>
          )}

          {currentPage === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">III. Classes & Abilities</h3>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>😡 Barbarian:</strong> +10 dmg to T1/T2. Mod: -1.</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>🥷 Rogue:</strong> +1 Gold per merge. Mod: +2.</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>🧙‍♂️ Wizard:</strong> Fireball (burns 2x2). Mod: +1.</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>👁️ Warlock:</strong> Eldritch Blast (clears row). Mod: +1.</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>✨ Cleric:</strong> Divine Aid (heals + purifies). Mod: 0.</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>🛡️ Paladin:</strong> Smite (mult by max tile). Mod: 0.</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>🎵 Bard:</strong> +5 Gold/roll. Vicious Mockery. Mod: +1.</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>🌿 Druid:</strong> Auto-purify chance. Entangle. Mod: 0.</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>⚔️ Fighter:</strong> +15 Dmg to T3+. Action Surge. Mod: 0.</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>👊 Monk:</strong> Alt dirs for Mult. Ki Strike. Mod: +1.</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>🏹 Ranger:</strong> +Dmg vs spawners. Hunter's Mark. Mod: -1.</div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><strong>🔮 Sorcerer:</strong> 19-20 Crit. Chaos Bolt. Mod: +1.</div>
              </div>
            </div>
          )}

          {currentPage === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">IV. Bosses & Hazards</h3>
              <h4 className="text-sm font-bold text-white mb-2 uppercase">The 12 Encounters</h4>
              <ul className="text-[10px] space-y-1 mb-4 bg-slate-950 p-2 rounded-xl border border-slate-800 grid grid-cols-2 gap-x-2">
                <li>👺 1. Goblin Scout</li>
                <li>👹 2. Orc Brute</li>
                <li>📦 3. Mimic Colony</li>
                <li>🟢 4. Slime King</li>
                <li>🦉 5. Owlbear Alpha</li>
                <li>🧌 6. Troll King</li>
                <li>🧠 7. Mind Flayer</li>
                <li>💀 8. The Lich</li>
                <li>👁️‍🗨️ 9. Beholder</li>
                <li>🐉 10. Ancient Dragon</li>
                <li>🧛 11. Vampire Lord</li>
                <li>🐲 12. Tiamat</li>
              </ul>
            </div>
          )}

          {currentPage === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">V. The D20 & Multiplier</h3>
              <p className="mb-3">Every 5 slides, you must roll the D20. Your class modifier applies.</p>
              <table className="w-full text-xs text-left text-slate-400 mb-4 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <thead className="bg-slate-900 text-white uppercase">
                  <tr><th className="p-2 border-b border-slate-700">Roll</th><th className="p-2 border-b border-slate-700">Outcome</th></tr>
                </thead>
                <tbody>
                  <tr><td className="p-2 border-b border-slate-800 text-rose-400 font-bold">20+ (Nat 20)</td><td className="p-2 border-b border-slate-800">CRIT - Mult +1 & upgrade a tile</td></tr>
                  <tr><td className="p-2 border-b border-slate-800 text-emerald-400 font-bold">10-19</td><td className="p-2 border-b border-slate-800">SUCCESS - A Crossbow spawns</td></tr>
                  <tr><td className="p-2 border-b border-slate-800 text-amber-400 font-bold">2-9</td><td className="p-2 border-b border-slate-800">MISS - A Slime spawns</td></tr>
                  <tr><td className="p-2 text-red-500 font-bold">1 or less</td><td className="p-2">FAIL - Your best weapon breaks</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {currentPage === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">VI. Tavern & Artifacts</h3>
              <p className="text-xs mb-3">After a boss, visit the Tavern to spend Gold on upgrades.</p>
              <ul className="text-[10px] space-y-1 mb-4 bg-slate-950 p-2 rounded-xl border border-slate-800 grid grid-cols-2 gap-x-2 leading-tight">
                <li>🎲 Weighted Dice: Floor protection.</li>
                <li>🎯 Assassin's Mark: Daggers grant Mult.</li>
                <li>🥾 Gravity Boots: DOWN sliding deals 1.5x Dmg.</li>
                <li>📖 Necronomicon: Slimes damage boss.</li>
                <li>💍 Ring of Wealth: Bonus tavern gold.</li>
                <li>⚡ Boots of Haste: Extra start slides.</li>
                <li>🧪 Giant's Potion: +0.3 Mult instantly.</li>
                <li>🔪 Vorpal Edge: True Dmg proc chance.</li>
                <li>🧥 Cloak of Invis: Hazards -20% spawn.</li>
                <li>📿 Amulet of Proof: Low rolls raised.</li>
                <li>🔥 Flame Tongue: T3+ merges AOE.</li>
                <li>🌙 Moon Sickle: Heals give slides.</li>
              </ul>
            </div>
          )}

        </div>
        
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800 shrink-0">
          <button onClick={prevHelpPage} disabled={currentPage === 1} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-bold disabled:opacity-50">Previous</button>
          <p className="text-center text-xs text-slate-500 hidden md:block">made with love by DZVN 💜</p>
          <button onClick={nextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors font-bold disabled:opacity-50">Next</button>
        </div>

      </div>
    </div>
  );
};

export default HelpModal;
