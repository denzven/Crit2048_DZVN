import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { useGameStore } from '../engine/gameStore';

const ChallengeBanner: React.FC = () => {
  const { isChallengeMode, rivalData, score, runStats } = useGameStore();
  const [showDetails, setShowDetails] = React.useState(false);

  if (!isChallengeMode || !rivalData || runStats.wasGodModeUsed) return null;

  const scoreDiff = score - rivalData.score;
  const isAhead = scoreDiff >= 0;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-14 left-1/2 -translate-x-1/2 z-[40] flex flex-col items-center pointer-events-none"
    >
      {/* THE BANNER (Draggable Handle) */}
      <div
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-amber-500/30 px-4 py-1.5 rounded-full shadow-lg cursor-grab active:cursor-grabbing pointer-events-auto select-none"
      >
        <div className="flex flex-col">
          <span className="text-[8px] text-amber-500 uppercase font-black tracking-widest leading-none mb-0.5">
            Rival Challenge
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold">vs</span>
            <span className="text-xs text-white font-black">{rivalData.score}</span>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-800" />

        <div className="flex flex-col items-center min-w-[50px]">
          <span
            className={`text-[10px] font-black ${isAhead ? 'text-emerald-400' : 'text-rose-400'}`}
          >
            {isAhead ? '▲' : '▼'} {Math.abs(scoreDiff)}
          </span>
          <span className="text-[7px] text-slate-500 uppercase font-bold tracking-tighter">
            Difference
          </span>
        </div>
      </div>

      {/* THE INTEL PANEL (Attached to Banner) */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 10 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="w-48 bg-slate-900/95 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4 shadow-2xl shadow-black/50 pointer-events-auto"
          >
            <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
              <span className="text-sm">{rivalData.icon || '👤'}</span>
              <div className="flex flex-col">
                <span className="text-[9px] text-white font-black uppercase tracking-widest leading-none">
                  {rivalData.name || 'Rival'}
                </span>
                <span className="text-[7px] text-amber-500 font-bold uppercase tracking-tighter">
                  Current Stats
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <RivalStatRow label="Score" val={rivalData.score} />
              <RivalStatRow label="Merges" val={rivalData.merges} />
              <RivalStatRow label="Max DMG" val={rivalData.maxDamage} />
              <RivalStatRow label="Moves" val={rivalData.moves} />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(false);
              }}
              className="w-full mt-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-[8px] text-slate-400 font-black uppercase tracking-widest rounded-lg border border-white/5 transition-colors"
            >
              Close Intel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const RivalStatRow: React.FC<{ label: string; val: number }> = ({ label, val }) => (
  <div className="flex justify-between items-center text-[10px]">
    <span className="text-slate-500 uppercase font-bold text-[7px]">{label}</span>
    <span className="text-white font-mono font-black">{val}</span>
  </div>
);

export default ChallengeBanner;
