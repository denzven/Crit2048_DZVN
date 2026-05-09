import React, { useState, useMemo, useCallback } from 'react';
import { useGameStore } from '../engine/gameStore';
import { useRegistry } from '../engine/registryHub';
import ThreeDice from './ThreeDice';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const DiceModal: React.FC = () => {
  const [hasLanded, setHasLanded] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const { isRolling, lastRoll, rollD20, closeDiceModal, playerClass } = useGameStore();
  const [showThreeDice, setShowThreeDice] = useState(false);

  // Read D20 tier definitions from registry (Mod Priority 0 — no hardcoded thresholds)
  const uiDefs = useRegistry(s => s.uiDefs);
  const d20Tiers = uiDefs?.d20Tiers || [
    { min: 20, type: 'crit',      label: 'NATURAL 20!',       sublabel: 'Critical Hit!',          color: '#f59e0b', bgColor: 'rgba(245,158,11,0.15)' },
    { min: 15, type: 'great',     label: 'GREAT SUCCESS!',    sublabel: 'Magic Staff spawned.',   color: '#ffffff', bgColor: 'rgba(255,255,255,0.05)' },
    { min: 10, type: 'success',   label: 'SUCCESS!',          sublabel: 'Crossbow spawned.',      color: '#ffffff', bgColor: 'rgba(255,255,255,0.05)' },
    { min:  2, type: 'fail',      label: 'MISS!',             sublabel: 'A Slime blocked you.',   color: '#10b981', bgColor: 'rgba(16,185,129,0.1)' },
    { min:  0, type: 'crit-fail', label: 'CRITICAL FAILURE!', sublabel: 'Necromancy rises.',      color: '#f43f5e', bgColor: 'rgba(244,63,94,0.15)' }
  ];

  const handleRoll = () => {
    setShowThreeDice(true);
    setHasLanded(false);
    setIsSpinning(true);
    rollD20();
  };

  const onDiceComplete = useCallback(() => {
    setHasLanded(true);
    setIsSpinning(false);
  }, []);

  const diceResults = useMemo(() => [lastRoll?.val || 20], [lastRoll?.val]);

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

  // Get tier from registry data
  const getTier = (val: number) => {
    const sorted = [...d20Tiers].sort((a, b) => b.min - a.min);
    return sorted.find(t => val >= t.min) || d20Tiers[d20Tiers.length - 1];
  };

  const tier = lastRoll ? getTier(lastRoll.val) : null;
  const isCrit = tier?.type === 'crit';
  const isFail = tier?.type === 'crit-fail';

  const mod = playerClass?.d20Mod || 0;

  return (
    <div id="modal-dice" className="absolute inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={clsx(
          "absolute inset-0 backdrop-blur-sm transition-colors duration-700",
          isFail && hasLanded ? "bg-rose-950/85 fail-vignette" : "bg-slate-950/80"
        )}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        id="d20-panel" 
        className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center shadow-2xl relative overflow-hidden"
      >
        {/* Ambient glow backdrop when result is in */}
        <AnimatePresence>
          {tier && hasLanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{ background: `radial-gradient(ellipse at 50% 40%, ${tier.bgColor} 0%, transparent 70%)` }}
            />
          )}
        </AnimatePresence>

        <h2 className="text-2xl font-black mb-1 text-rose-500 uppercase tracking-widest mt-2 font-serif relative z-10">D20 Check</h2>
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-6 font-bold relative z-10">
          Mod: <span className="text-white bg-slate-800 px-2 py-0.5 rounded ml-1">{mod >= 0 ? `+${mod}` : mod}</span>
        </p>

        <div className="relative w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 my-2 flex flex-col items-center justify-center overflow-hidden">
          <div id="d20-render-target" className="w-full h-full absolute inset-0 mx-auto z-10 flex items-center justify-center">
            {showThreeDice && (
              <ThreeDice 
                sides={20} 
                results={diceResults} 
                onComplete={onDiceComplete} 
              />
            )}
          </div>

          {/* Pre-roll state: pulsing ring around button */}
          {!showThreeDice && (
            <div id="dice-action-btn" className="absolute inset-0 flex items-center justify-center z-20">
              <div className="relative">
                {/* Pulse rings */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-rose-500/40"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-xl border border-rose-500/20"
                  animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
                <button 
                  onClick={handleRoll}
                  className="relative px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl cursor-pointer transition-all shadow-lg font-black uppercase tracking-widest border border-rose-400/30 active:scale-95"
                >
                  Roll Fate
                </button>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {lastRoll && hasLanded && tier && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              id="dice-post-roll" 
              className="flex flex-col items-center w-full z-20 mt-6 min-h-[80px] relative"
            >
              {/* Crit golden radial flash */}
              {isCrit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 0.8, 0], scale: [0.5, 2.5, 3] }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)' }}
                />
              )}

              <div id="dice-result-msg" className="flex flex-col items-center justify-center w-full text-center relative z-10">
                {/* The slam-in number */}
                <motion.span
                  key={lastRoll.val}
                  className="block text-6xl font-black mb-2 font-mono result-slam"
                  style={{ color: tier.color }}
                >
                  {lastRoll.val}
                </motion.span>

                {/* Banner label from registry tier data */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="px-4 py-2 rounded-xl mb-1 w-full"
                  style={{ background: tier.bgColor, borderColor: `${tier.color}30`, border: '1px solid' }}
                >
                  <span className="text-sm font-black uppercase tracking-wider block" style={{ color: tier.color }}>
                    {tier.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {tier.sublabel}
                  </span>
                </motion.div>
              </div>

              <motion.button 
                onClick={closeDiceModal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-4 mt-4 bg-slate-700 hover:bg-slate-600 text-white font-black uppercase tracking-widest transition-all w-full rounded-xl border border-slate-600 active:scale-95"
              >
                Continue
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DiceModal;
