import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useGameStore } from '../engine/gameStore';
import { useRegistry } from '../engine/registryHub';
import ThreeDice from './ThreeDice';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { SFX } from '../engine/audio';

type AnimationStage = 'idle' | 'rolling' | 'landed' | 'modifying' | 'finalized';

const DiceModal: React.FC = () => {
  const [stage, setStage] = useState<AnimationStage>('idle');
  const [currentModIdx, setCurrentModIdx] = useState(-1);
  const { isRolling, lastRoll, rollD20, closeDiceModal, playerClass, triggerFX } = useGameStore();
  const artifacts = useRegistry(s => s.artifacts);
  const [showThreeDice, setShowThreeDice] = useState(false);
  const [displayedVal, setDisplayedVal] = useState(0);

  // Read D20 tier definitions from registry
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
    setStage('rolling');
    rollD20();
  };

  const onDiceComplete = useCallback(() => {
    if (lastRoll) {
      setDisplayedVal(lastRoll.rawVal);
      setStage('landed');
      
      // Start modifier sequence after a brief pause
      setTimeout(() => {
        if (lastRoll.modifiers.length > 0) {
          setStage('modifying');
          setCurrentModIdx(0);
        } else {
          setStage('finalized');
        }
      }, 1000);
    }
  }, [lastRoll]);

  // Handle modifier sequence
  useEffect(() => {
    if (stage === 'modifying' && lastRoll && currentModIdx >= 0 && currentModIdx < lastRoll.modifiers.length) {
      const mod = lastRoll.modifiers[currentModIdx];
      if (!mod) return;
      
      // Show this modifier for a bit
      const timer = setTimeout(() => {
        // Update displayed value
        if (mod.type === 'set') {
           setDisplayedVal(mod.val);
        } else if (mod.type === 'add') {
           setDisplayedVal(prev => prev + mod.val);
        } else if (mod.type === 'multiply') {
           setDisplayedVal(prev => prev * mod.val);
        }

        // Trigger Artifact FX if applicable
        const artifactDef = Object.values(artifacts).find(a => a.id === mod.id);
        if (artifactDef) {
          triggerFX('pop', { 
            artifactId: mod.id, 
            icon: artifactDef.icon, 
            name: artifactDef.name 
          });
        }

        SFX.coin(); // Generic "ding" for modifier

        if (currentModIdx < lastRoll.modifiers.length - 1) {
          setCurrentModIdx(prev => prev + 1);
        } else {
          setStage('finalized');
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [stage, currentModIdx, lastRoll]);

  const diceResults = useMemo(() => [lastRoll?.rawVal || 20], [lastRoll?.rawVal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (stage === 'idle') {
          handleRoll();
        } else if (stage === 'finalized') {
          closeDiceModal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage]);

  const getTier = (val: number) => {
    const sorted = [...d20Tiers].sort((a, b) => b.min - a.min);
    return sorted.find(t => val >= t.min) || d20Tiers[d20Tiers.length - 1];
  };

  const tier = lastRoll ? getTier(displayedVal) : null;
  const isCrit = tier?.type === 'crit' && stage === 'finalized';
  const isFail = tier?.type === 'crit-fail' && stage === 'finalized';

  const modTotal = playerClass?.d20Mod || 0;

  return (
    <div id="modal-dice" className="absolute inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={clsx(
          "absolute inset-0 backdrop-blur-sm transition-colors duration-700",
          isFail ? "bg-rose-950/85 fail-vignette" : "bg-slate-950/80"
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
        {/* Ambient glow backdrop */}
        <AnimatePresence>
          {tier && stage !== 'idle' && (
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
          Base Mod: <span className="text-white bg-slate-800 px-2 py-0.5 rounded ml-1">{modTotal >= 0 ? `+${modTotal}` : modTotal}</span>
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

          {!showThreeDice && (
            <div id="dice-action-btn" className="absolute inset-0 flex items-center justify-center z-20">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-rose-500/40"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
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

        <div className="flex flex-col items-center w-full z-20 mt-6 min-h-[140px] relative">
          <AnimatePresence mode="wait">
            {stage !== 'idle' && stage !== 'rolling' && (
              <motion.div 
                key="result-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center w-full"
              >
                {/* Number Display */}
                <motion.span
                  key={displayedVal}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className={clsx(
                    "block text-7xl font-black mb-2 font-mono drop-shadow-lg",
                    stage === 'finalized' ? "" : "text-white"
                  )}
                  style={{ color: stage === 'finalized' ? tier?.color : undefined }}
                >
                  {displayedVal}
                </motion.span>

                {/* Modifier Label */}
                <div className="h-8 mb-2 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {stage === 'modifying' && currentModIdx >= 0 && lastRoll?.modifiers && lastRoll.modifiers[currentModIdx] && (
                      <motion.div
                        key={lastRoll.modifiers[currentModIdx].id || currentModIdx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow-sm"
                      >
                        <span className="text-[10px] text-slate-400 uppercase font-black">Trigger:</span>
                        <span className="text-xs text-rose-400 font-bold">{lastRoll.modifiers[currentModIdx].label}</span>
                        <span className="text-xs text-white font-mono">
                          {lastRoll.modifiers[currentModIdx].type === 'add' ? `+${lastRoll.modifiers[currentModIdx].val}` : 
                           lastRoll.modifiers[currentModIdx].type === 'multiply' ? `x${lastRoll.modifiers[currentModIdx].val}` : 
                           `→ ${lastRoll.modifiers[currentModIdx].val}`}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Final Result Banner */}
                {stage === 'finalized' && tier && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-4 py-3 rounded-xl w-full border"
                    style={{ background: tier.bgColor, borderColor: `${tier.color}40` }}
                  >
                    <span className="text-sm font-black uppercase tracking-wider block" style={{ color: tier.color }}>
                      {tier.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {tier.sublabel}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {stage === 'finalized' && (
            <motion.button 
              onClick={closeDiceModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-8 py-4 mt-6 bg-slate-700 hover:bg-slate-600 text-white font-black uppercase tracking-widest transition-all w-full rounded-xl border border-slate-600 active:scale-95"
            >
              Continue
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DiceModal;
