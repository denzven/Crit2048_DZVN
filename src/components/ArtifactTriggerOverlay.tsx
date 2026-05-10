import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { useGameStore } from '../engine/gameStore';
import { useRegistry } from '../engine/registryHub';

const ArtifactTriggerOverlay: React.FC = () => {
  const activeFX = useGameStore((s) => s.activeFX);
  const artifacts = useRegistry((s) => s.artifacts);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
      <AnimatePresence>
        {activeFX
          .filter(
            (fx) =>
              fx.params?.targetId || (fx.params?.x === undefined && fx.params?.y === undefined),
          )
          .map((fx) => {
            const artifact = Object.values(artifacts).find((a) => a.id === fx.params?.artifactId);
            const icon = fx.params?.icon || artifact?.icon || '✨';

            let left = '50%';
            let top = '50%';
            let isPositional = false;

            if (fx.params?.targetId) {
              const el = document.getElementById(fx.params.targetId);
              if (el) {
                const rect = el.getBoundingClientRect();
                left = `${rect.left + rect.width / 2}px`;
                top = `${rect.top + rect.height / 2}px`;
                isPositional = true;
              }
            } else if (fx.params?.x !== undefined && fx.params?.y !== undefined) {
              left = `${fx.params.x}%`;
              top = `${fx.params.y}%`;
              isPositional = true;
            }

            const size = isPositional ? 'text-4xl' : 'text-8xl';

            return (
              <motion.div
                key={fx.id}
                initial={
                  fx.name === 'stomp'
                    ? { scale: 3, opacity: 0, y: isPositional ? -20 : -200 }
                    : { scale: 0, opacity: 0, y: 20 }
                }
                animate={
                  fx.name === 'stomp'
                    ? { scale: 1, opacity: 1, y: 0 }
                    : { scale: 1.5, opacity: 1, y: -80 }
                }
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                transition={
                  fx.name === 'stomp'
                    ? { type: 'spring', damping: 10, stiffness: 200 }
                    : { type: 'spring', damping: 15, stiffness: 300 }
                }
                className="absolute flex flex-col items-center"
                style={{
                  left,
                  top,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isPositional ? 50 : 1000,
                }}
              >
                <div className={clsx(size, 'drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]')}>
                  {icon}
                </div>
                {!isPositional && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/90 border border-slate-700 px-4 py-1 rounded-full mt-4"
                  >
                    <span className="text-rose-400 font-black uppercase text-sm tracking-widest">
                      {fx.params?.name}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
};

export default ArtifactTriggerOverlay;
