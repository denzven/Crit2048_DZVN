import React from 'react';
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
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-800 text-center">
          <h2 className="text-xl font-black tracking-widest text-white uppercase font-serif">{title}</h2>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          {type === 'confirm' && (
            <button 
              onClick={handleCancel}
              className="flex-1 py-3 bg-slate-800 text-slate-400 font-black rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px] border border-slate-700"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleConfirm}
            className={`flex-1 py-3 ${type === 'confirm' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-black rounded-xl transition-colors uppercase tracking-widest text-[10px] border border-white/10 shadow-lg shadow-black/20`}
          >
            {type === 'confirm' ? 'Confirm' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
