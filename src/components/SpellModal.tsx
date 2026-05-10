import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

import { useGameStore } from '../engine/gameStore';
import { useRegistry } from '../engine/registryHub';
import ThreeDice from './ThreeDice';

const SpellModal: React.FC = () => {
  const { playerClass, spellRoll, executeSpellRoll, resolveSpell, cancelSpell, multiplier } =
    useGameStore();
  const [hasStartedRoll, setHasStartedRoll] = useState(false);

  // Read HUD config from registry (Mod Priority 0)
  const uiDefs = useRegistry((s) => s.uiDefs);
  const HIGH_DAMAGE_THRESHOLD = 50; // Could also be driven from uiDefs if desired

  const finalDamage = spellRoll ? Math.ceil(spellRoll.sum * multiplier) : 0;
  const isHighDamage = finalDamage >= HIGH_DAMAGE_THRESHOLD;
  const isMassiveDamage = finalDamage >= 200;

  const handleRoll = React.useCallback(() => {
    setHasStartedRoll(true);
    executeSpellRoll();
  }, [executeSpellRoll]);

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
  }, [hasStartedRoll, spellRoll, handleRoll, resolveSpell]);

  if (!playerClass?.ability) return null;
  const ab = playerClass.ability;

  return (
    <div
      id="modal-attack"
      className="absolute inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Blue-tinted backdrop for spell context */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-blue-950/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-slate-900 border border-blue-800/50 rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center shadow-2xl relative overflow-hidden"
      >
        {/* Ambient spell glow — intensifies with high damage */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-3xl"
          animate={
            spellRoll
              ? {
                  background: isHighDamage
                    ? 'radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.25) 0%, transparent 70%)'
                    : 'radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.1) 0%, transparent 70%)',
                }
              : {
                  background:
                    'radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.05) 0%, transparent 70%)',
                }
          }
          transition={{ duration: 0.5 }}
        />

        <button
          onClick={cancelSpell}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-white rounded-full transition-colors z-30"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black mb-1 text-blue-400 uppercase tracking-widest mt-2 font-serif relative z-10">
          {ab.name}
        </h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-6 font-bold relative z-10">
          Class Ability Roll — {ab.count}d{ab.sides}
        </p>

        <div className="relative w-full h-64 bg-slate-950 rounded-2xl border border-blue-900/30 my-2 flex flex-col items-center justify-center overflow-hidden">
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
              <div className="relative">
                {/* Shimmer pulse rings */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-blue-500/40"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-xl border border-blue-400/20"
                  animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                />
                {/* Shimmer cast button */}
                <button
                  onClick={handleRoll}
                  className="relative px-8 py-5 rounded-xl cursor-pointer shadow-lg font-black uppercase tracking-widest border text-xl overflow-hidden group active:scale-95 transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    borderColor: 'rgba(147,197,253,0.3)',
                    color: 'white',
                  }}
                >
                  {/* Shimmer sweep */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
                  />
                  <span className="relative z-10">
                    Roll {ab.count}d{ab.sides}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {spellRoll && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full z-20 mt-6 min-h-[100px] relative"
            >
              {/* High damage radial pulse */}
              {isHighDamage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 0.6, 0], scale: [0.5, 2, 2.5] }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)',
                  }}
                />
              )}

              <div className="flex flex-col items-center justify-center w-full text-center relative z-10">
                {/* Slam-in total */}
                <motion.span
                  key={spellRoll.sum}
                  className="block text-5xl font-black mb-1 font-mono result-slam text-white"
                >
                  {spellRoll.sum}
                </motion.span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Total {ab.type === 'damage' ? 'Damage' : 'Healing'}
                </p>

                {ab.type === 'damage' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className={clsx(
                      'px-4 py-2 rounded-xl border mb-4 w-full',
                      isHighDamage
                        ? 'bg-blue-950/60 border-blue-500/30'
                        : 'bg-slate-950 border-slate-800',
                    )}
                  >
                    <span className="text-rose-400 text-xs font-mono">
                      {spellRoll.sum} ×{' '}
                      <span
                        className={clsx(
                          multiplier >= (uiDefs?.hud.multiplierHighThreshold || 3.0)
                            ? 'text-amber-400 mult-high'
                            : 'text-slate-300',
                        )}
                      >
                        {multiplier.toFixed(1)}x
                      </span>
                      {' = '}
                      <span
                        className={clsx(
                          'font-black text-sm',
                          isHighDamage ? 'text-blue-300' : 'text-white',
                          isMassiveDamage && 'mult-rage',
                        )}
                      >
                        {finalDamage} DMG
                      </span>
                    </span>
                    {isHighDamage && (
                      <p className="text-[9px] text-blue-400/60 uppercase font-black tracking-widest mt-1">
                        ⚡ Devastating Hit!
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Shimmer cast button */}
              <motion.button
                onClick={resolveSpell}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="relative px-8 py-4 font-black uppercase tracking-widest transition-all w-full rounded-xl border overflow-hidden active:scale-95"
                style={{
                  background: isHighDamage
                    ? 'linear-gradient(135deg, #1d4ed8, #4f46e5)'
                    : '#e2e8f0',
                  color: isHighDamage ? 'white' : '#0f172a',
                  borderColor: isHighDamage ? 'rgba(147,197,253,0.3)' : '#cbd5e1',
                }}
              >
                {isHighDamage && (
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none"
                  />
                )}
                <span className="relative z-10">⚡ Cast</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SpellModal;
