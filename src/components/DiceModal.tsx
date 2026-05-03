import React, { useState } from 'react';
import { useGameStore } from '../engine/gameStore';
import ThreeDice from './ThreeDice';
import { clsx } from 'clsx';

const DiceModal: React.FC = () => {
  const { isRolling, lastRoll, rollD20, closeDiceModal, playerClass } = useGameStore();
  const [showThreeDice, setShowThreeDice] = useState(false);

  const handleRoll = () => {
    setShowThreeDice(true);
    rollD20();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!showThreeDice) {
          handleRoll();
        } else if (lastRoll) {
          closeDiceModal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showThreeDice, lastRoll]);

  const getResultColor = () => {
    if (!lastRoll) return 'text-white';
    if (lastRoll.type === 'crit') return 'text-amber-400';
    if (lastRoll.type === 'success') return 'text-white';
    if (lastRoll.type === 'fail') return 'text-emerald-400';
    return 'text-rose-500';
  };

  const mod = playerClass?.d20Mod || 0;

  return (
    <div id="modal-dice" className="absolute inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto" />
      
      <div id="d20-panel" className="pointer-events-auto bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <h2 className="text-2xl font-black mb-1 text-rose-500 uppercase tracking-widest mt-2 font-serif">D20 Check</h2>
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-6 font-bold">
          Mod: <span className="text-white bg-slate-800 px-2 py-0.5 rounded ml-1">{mod >= 0 ? `+${mod}` : mod}</span>
        </p>

        <div className="relative w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 my-2 flex flex-col items-center justify-center overflow-hidden">
          <div id="d20-render-target" className="w-full h-full absolute inset-0 mx-auto z-10 flex items-center justify-center">
            {showThreeDice && (
              <ThreeDice 
                sides={20} 
                results={[lastRoll?.val || 20]} 
                onComplete={() => {}} 
              />
            )}
          </div>

          {!showThreeDice && (
            <div id="dice-action-btn" className="absolute inset-0 flex items-center justify-center z-20">
              <button 
                onClick={handleRoll}
                className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl cursor-pointer hover:scale-105 transition-all shadow-lg font-black uppercase tracking-widest border border-rose-400/30"
              >
                Roll Fate
              </button>
            </div>
          )}
        </div>

        {lastRoll && (
          <div id="dice-post-roll" className="flex flex-col items-center w-full z-20 mt-6 min-h-[80px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div id="dice-result-msg" className="flex flex-col items-center justify-center w-full text-center">
              <span className={clsx("block text-5xl font-black mb-2 font-mono", getResultColor())}>
                {lastRoll.val}
              </span>
              <span className="text-sm font-bold text-white">
                {lastRoll.msg}
              </span>
            </div>
            <button 
              onClick={closeDiceModal}
              className="px-8 py-4 mt-6 bg-slate-700 hover:bg-slate-600 text-white font-black uppercase tracking-widest transition-all w-full rounded-xl border border-slate-600 active:scale-95"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiceModal;
