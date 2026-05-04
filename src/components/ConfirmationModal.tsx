import React from 'react';
import { clsx } from 'clsx';
import { useGameStore } from '../engine/gameStore';
import type { ConfirmationState } from '../types/game';

const ConfirmationModal: React.FC = () => {
  const { confirmation, closeConfirmation } = useGameStore();

  if (!confirmation) return null;

  const { title, message, onConfirm, onCancel, type } = confirmation;

  const handleConfirm = () => {
    onConfirm();
    closeConfirmation();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeConfirmation();
  };

  return (
    <div className="absolute inset-0 bg-slate-950/80 z-[200] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900/95 border border-slate-700 rounded-[2.5rem] max-w-sm w-full shadow-2xl flex flex-col animate-in zoom-in duration-300 backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="p-8 pb-4 text-center relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-xl">
            <div className="text-3xl">
              {type === 'confirm' ? '⚠️' : '✨'}
            </div>
          </div>
          <h2 className="text-lg font-black tracking-[0.2em] text-white uppercase font-serif">{title}</h2>
        </div>
        
        <div className="p-8 pt-0 text-center relative z-10">
          <p className="text-slate-400 text-xs leading-relaxed font-medium">{message}</p>
        </div>

        <div className="p-6 pt-0 flex gap-3 relative z-10">
          {type === 'confirm' && (
            <button 
              onClick={handleCancel}
              className="flex-1 py-4 bg-slate-800/50 text-slate-400 font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px] border border-slate-700/50 hover:text-white active:scale-95"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleConfirm}
            className={clsx(
              "flex-1 py-4 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] border shadow-xl active:scale-95",
              type === 'confirm' 
                ? "bg-rose-600 hover:bg-rose-500 border-rose-400/30 shadow-rose-900/20" 
                : "bg-indigo-600 hover:bg-indigo-500 border-indigo-400/30 shadow-indigo-900/20"
            )}
          >
            {type === 'confirm' ? 'Confirm' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
