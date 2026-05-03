import React, { useState } from 'react';
import { useGameStore } from '../engine/gameStore';
import ThreeDice from './ThreeDice';
import { clsx } from 'clsx';

const SpellModal: React.FC = () => {
  const { isRolling, playerClass, spellRoll, executeSpellRoll, resolveSpell, multiplier } = useGameStore();
  const [hasStartedRoll, setHasStartedRoll] = useState(false);

  if (!playerClass?.ability) return null;
  const ab = playerClass.ability;

  const handleRoll = () => {
    setHasStartedRoll(true);
    executeSpellRoll();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!hasStartedRoll) {
          handleRoll();
        } else if (spellRoll) {
          resolveSpell();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStartedRoll, spellRoll]);

  return (
    <div id="modal-attack" className="absolute inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md pointer-events-auto" />
      
      <div className="pointer-events-auto bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <h2 className="text-2xl font-black mb-1 text-blue-400 uppercase tracking-widest mt-2 font-serif">
          {ab.name}
        </h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-6 font-bold">
          Class Ability Roll
        </p>

        <div className="relative w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 my-2 flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full h-full absolute inset-0 mx-auto z-10 flex items-center justify-center">
            {hasStartedRoll && (
              <ThreeDice 
                sides={ab.sides} 
                results={spellRoll?.results || Array(ab.count).fill(ab.sides)} 
                onComplete={() => {}} 
              />
            )}
          </div>

          {!hasStartedRoll && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <button 
                onClick={handleRoll}
                className="px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer hover:scale-105 transition-all shadow-lg font-black uppercase tracking-widest border border-blue-400/30 text-xl"
              >
                Roll {ab.count}d{ab.sides}
              </button>
            </div>
          )}
        </div>

        {spellRoll && (
          <div className="flex flex-col items-center w-full z-20 mt-6 min-h-[100px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center justify-center w-full text-center">
              <span className="block text-5xl font-black mb-1 font-mono text-white">
                {spellRoll.sum}
              </span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Total {ab.type === 'damage' ? 'Damage' : 'Healing'}
              </p>
              
              {ab.type === 'damage' && (
                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-rose-400 text-xs font-mono mb-4">
                  {spellRoll.sum} × {multiplier.toFixed(1)}x = <span className="text-white font-black">{Math.ceil(spellRoll.sum * multiplier)} DMG</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={resolveSpell}
              className="px-8 py-4 bg-slate-100 hover:bg-white text-slate-950 font-black uppercase tracking-widest transition-all w-full rounded-xl border border-slate-600 active:scale-95"
            >
              Unleash Power
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpellModal;
