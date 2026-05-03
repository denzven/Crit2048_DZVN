import React from 'react';
import { useGameStore } from '../engine/gameStore';
import { CLASSES } from '../engine/data';
import { clsx } from 'clsx';

const ClassSelection: React.FC = () => {
  const { initEncounter, spawnRandomTile, addLog } = useGameStore();

  const selectClass = (heroClass: any) => {
    useGameStore.setState({ playerClass: heroClass, usesLeft: heroClass.ability.maxUses });
    initEncounter(150, 25);
    spawnRandomTile();
    spawnRandomTile();
    addLog(`Dungeon entered as ${heroClass.name}.`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8 flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-8 shrink-0">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-2 font-serif tracking-tighter uppercase">Choose Your Hero</h2>
        <p className="text-slate-500 text-sm uppercase tracking-[0.2em] font-bold">select a class to begin your descent</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-8">
        {CLASSES.map((hero) => (
          <button
            key={hero.id}
            onClick={() => selectClass(hero)}
            className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left transition-all hover:border-rose-500 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] active:scale-95 flex flex-col justify-between h-48 md:h-56 overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 text-7xl opacity-5 group-hover:opacity-20 transition-opacity grayscale group-hover:grayscale-0 rotate-12">
              {hero.icon}
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{hero.icon}</span>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">{hero.name}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {hero.desc}
              </p>
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Initial Ability</span>
                <span className="text-[10px] text-indigo-400 font-bold uppercase">{hero.ability.name}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">D20 Mod</span>
                <span className={clsx("text-xs font-mono font-black", hero.d20Mod >= 0 ? "text-emerald-400" : "text-rose-500")}>
                  {hero.d20Mod >= 0 ? `+${hero.d20Mod}` : hero.d20Mod}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassSelection;
