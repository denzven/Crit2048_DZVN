import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../engine/gameStore';
import { SFX } from '../engine/audio';

interface GodModeAuthModalProps {
  onClose: () => void;
}

const GodModeAuthModal: React.FC<GodModeAuthModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<'confirm' | 'keypad'>('confirm');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { toggleDevMode } = useGameStore();

  const handleKeyClick = (num: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + num);
      setError(false);
      SFX.coin();
    }
  };

  const handleClear = () => {
    setPin('');
    SFX.fail();
  };

  const handleSubmit = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // SHA-256 of "80085"
    if (hashHex === 'b3786e141d65638ad8a98173e26b5f6a53c927737b23ff31fb1843937250f44b') {
      SFX.crit();
      toggleDevMode();
      onClose();
    } else {
      setError(true);
      setPin('');
      SFX.fail();
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-slate-900 border-2 border-indigo-500 rounded-3xl p-8 max-w-xs w-full relative z-10 shadow-[0_0_50px_rgba(79,70,229,0.3)] overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 'confirm' ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/40">
                <span className="text-3xl">🛠️</span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Initialize God Mode?</h2>
              <p className="text-slate-400 text-xs mb-8 leading-relaxed">
                Developer tools will be unlocked. <br/>
                <span className="text-indigo-400 font-bold">Leaderboards will be disabled</span> for this session.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setStep('keypad')}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  Authorize
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-3 text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="keypad"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              <h3 className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Security Protocol</h3>
              
              <div className={`w-full bg-slate-950 rounded-xl p-4 mb-6 border-2 transition-colors ${error ? 'border-rose-500 animate-shake' : 'border-slate-800'}`}>
                <div className="flex justify-center gap-2 h-6">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${pin.length > i ? 'bg-indigo-500 scale-110' : 'bg-slate-800'}`} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full mb-6">
                {[1,2,3,4,5,6,7,8,9].map(num => (
                  <button 
                    key={num}
                    onClick={() => handleKeyClick(num.toString())}
                    className="aspect-square bg-slate-800 hover:bg-slate-700 text-white text-xl font-black rounded-xl transition-all active:scale-90 border border-slate-700/50"
                  >
                    {num}
                  </button>
                ))}
                <button 
                  onClick={handleClear}
                  className="bg-slate-900 text-rose-500 text-xs font-black rounded-xl border border-rose-500/20 active:scale-90"
                >
                  CLEAR
                </button>
                <button 
                  onClick={() => handleKeyClick('0')}
                  className="aspect-square bg-slate-800 hover:bg-slate-700 text-white text-xl font-black rounded-xl active:scale-90 border border-slate-700/50"
                >
                  0
                </button>
                <button 
                  onClick={handleSubmit}
                  className="bg-indigo-600 text-white text-xs font-black rounded-xl active:scale-90 shadow-lg shadow-indigo-600/30"
                >
                  ENTER
                </button>
              </div>

              <button 
                onClick={() => setStep('confirm')}
                className="text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase"
              >
                Go Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GodModeAuthModal;
