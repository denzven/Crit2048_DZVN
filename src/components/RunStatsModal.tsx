import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

import { SFX } from '../engine/audio';
import { useGameStore } from '../engine/gameStore';
import { ImageGenerator } from '../engine/imageGenerator';
import { ChallengeUtils } from '../utils/challengeUtils';

const RunStatsModal: React.FC<{ onShowLeaderboard: () => void; onShowShare: () => void }> = ({
  onShowLeaderboard,
  onShowShare,
}) => {
  const {
    gameState,
    runStats,
    playerClass,
    encounterIdx,
    artifacts,
    resetGame,
    isChallengeMode,
    rivalData,
    score,
    showAlert,
  } = useGameStore();

  const isVictory = gameState === 'VICTORY';
  const durationMs = runStats.endTime - runStats.startTime;
  const durationSec = Math.floor(durationMs / 1000);
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
  };

  const handleChallengeShare = () => {
    const data = {
      s: runStats.seedUsed,
      sc: score,
      m: runStats.totalMerges,
      d: runStats.totalDamageDealt,
      mx: runStats.maxDamage,
      mv: runStats.totalMoves,
      n: playerClass?.name,
      i: playerClass?.icon,
    };
    const url = ChallengeUtils.generateUrl(data);

    if (navigator.share) {
      navigator
        .share({
          title: 'Crit 2048 Challenge!',
          text: `I scored ${score} with the ${playerClass?.name}! Can you beat my run?`,
          url: url,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      SFX.coin();
      showAlert(
        'Challenge Ready!',
        'Your unique challenge link has been copied to the clipboard. Send it to a friend to start the rivalry!',
      );
    }
  };

  const didWinChallenge = isChallengeMode && rivalData && score >= rivalData.score;

  const handleResultShare = () => {
    const data = {
      s: runStats.seedUsed,
      sc: score,
      m: runStats.totalMerges,
      d: runStats.totalDamageDealt,
      mx: runStats.maxDamage,
      mv: runStats.totalMoves,
      n: playerClass?.name,
      i: playerClass?.icon,
    };
    const url = ChallengeUtils.generateUrl(data);

    const text =
      didWinChallenge && rivalData
        ? `🏆 I beat your Crit 2048 score! I got ${score} (vs ${rivalData.score}). Try to reclaim your throne! ${url}`
        : isChallengeMode && rivalData
          ? `💀 You're still the boss. I scored ${score} (vs ${rivalData.score}). I'll be back! ${url}`
          : `🎮 I just finished an Ante ${encounterIdx + 1} run with ${score} points! Check it out: ${url}`;

    if (navigator.share) {
      navigator.share({ title: 'Crit 2048 Result', text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      showAlert(
        'Result Copied!',
        "Your victory status and re-challenge link have been copied. Go show them who's boss!",
      );
    }
  };

  const handleDirectSave = async () => {
    try {
      const data = {
        ante: encounterIdx + 1,
        classIcon: playerClass?.icon || '🛡️',
        className: playerClass?.name || 'Hero',
        maxDamage: runStats.maxDamage,
        totalMoves: runStats.totalMoves,
        totalMerges: runStats.totalMerges,
        maxMultiplier: runStats.maxMultiplier,
        startTime: runStats.startTime,
        seedUsed: runStats.seedUsed,
        artifacts: artifacts,
      };
      const bytes = await ImageGenerator.generate(data);
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `crit2048_run_${runStats.seedUsed}.png`;
      link.href = url;
      link.click();

      showAlert('Saved!', 'Your run summary has been saved to your device.');
    } catch (e) {
      console.error(e);
      showAlert('Save Failed', 'Could not generate run summary image.');
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="max-w-lg w-full bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] text-center shadow-2xl relative border-t-rose-600/30 overflow-y-auto custom-scrollbar"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none"></div>

        <div className="relative z-10">
          <h2
            className={clsx(
              'text-3xl md:text-5xl font-black mb-1 font-serif uppercase tracking-tight drop-shadow-lg',
              isVictory ? 'text-amber-400' : 'text-white',
            )}
          >
            {isVictory ? 'VICTORY' : 'RUN OVER'}
          </h2>
          <p className="text-slate-500 mb-6 text-[10px] md:text-xs italic px-4 leading-tight uppercase tracking-widest font-bold">
            {isVictory
              ? 'The dungeon has been conquered.'
              : runStats.endReason === 'GRIDLOCK'
                ? 'The board is locked. No moves remain.'
                : runStats.endReason === 'OUT_OF_SLIDES'
                  ? 'You have run out of energy to slide.'
                  : runStats.endReason === 'FORFEIT'
                    ? 'You have abandoned the quest.'
                    : 'Your journey has come to an end.'}
          </p>

          {runStats.wasGodModeUsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 px-4 py-2 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl inline-flex flex-col items-center gap-1 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              <div className="flex items-center gap-2">
                <span className="animate-pulse text-xs">🛠️</span>
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">
                  God Mode Active
                </span>
              </div>
              <span className="text-[8px] text-indigo-400/60 uppercase font-bold tracking-widest">
                Run not submitted to leaderboard
              </span>
            </motion.div>
          )}

          {isVictory && (
            <div className="mb-8 animate-bounce">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 rounded-full"></div>
                <span className="text-7xl relative z-10">🏆</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 text-left">
            {/* Details Card */}
            <div className="bg-slate-950/60 rounded-2xl border border-white/5 p-3 md:p-4 space-y-2 shadow-xl backdrop-blur-sm">
              <h3 className="text-slate-600 font-black uppercase tracking-widest text-[8px] border-b border-white/5 pb-1 mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span> Details
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Class</span>
                <span className="text-[10px] font-black text-white">
                  {playerClass?.icon} {playerClass?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Ante</span>
                <span className="text-[10px] font-black text-rose-400">{encounterIdx + 1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Date</span>
                <span className="text-[10px] font-black text-slate-400">
                  {formatDate(runStats.startTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Duration</span>
                <span className="text-[10px] font-black text-blue-400">
                  {minutes}m {seconds}s
                </span>
              </div>
            </div>

            {/* Combat Stats Card */}
            <div className="bg-slate-950/60 rounded-2xl border border-white/5 p-3 md:p-4 space-y-2 shadow-xl backdrop-blur-sm">
              <h3 className="text-slate-600 font-black uppercase tracking-widest text-[8px] border-b border-white/5 pb-1 mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-rose-700 rounded-full"></span> Mastery
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Max DMG</span>
                <span className="text-[10px] font-black text-amber-500">
                  {Math.ceil(runStats.maxDamage)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Max Mult</span>
                <span className="text-[10px] font-black text-rose-500">
                  x{runStats.maxMultiplier.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Moves</span>
                <span className="text-[10px] font-black text-indigo-400">
                  {runStats.totalMoves}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Spent</span>
                <span className="text-[10px] font-black text-amber-500">
                  💰 {runStats.totalCoinsSpent}
                </span>
              </div>
            </div>
          </div>

          {/* Artifacts Card */}
          <div className="bg-slate-950/60 rounded-2xl border border-white/5 p-3 md:p-4 text-left mb-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-slate-600 font-black uppercase tracking-widest text-[8px] border-b border-white/5 pb-1 mb-3">
              Treasures
            </h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {artifacts.length > 0 ? (
                artifacts.map((a, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-lg border border-slate-800 shadow-lg"
                    title={a.name}
                  >
                    {a.icon}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-600 italic">No artifacts found.</p>
              )}
            </div>
          </div>

          {/* RIVAL COMPARISON (Only in Challenge Mode and NOT in God Mode) */}
          {isChallengeMode && rivalData && !runStats.wasGodModeUsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-slate-950/80 rounded-2xl border border-amber-500/20 p-4 shadow-xl text-left"
            >
              <h3 className="text-amber-500 font-black uppercase tracking-[0.2em] text-[8px] mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Rivalry Comparison
              </h3>
              <div className="flex items-center justify-between mb-4 px-2 py-1.5 bg-white/5 rounded-xl border border-white/5">
                <div className="flex flex-col items-center">
                  <span className="text-lg">{playerClass?.icon}</span>
                  <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">
                    You
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 font-black italic">VS</div>
                <div className="flex flex-col items-center">
                  <span className="text-lg">{rivalData.icon || '👤'}</span>
                  <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">
                    {rivalData.name || 'Rival'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <StatCompareRow label="Score" you={score} them={rivalData.score} />
                <StatCompareRow label="Merges" you={runStats.totalMerges} them={rivalData.merges} />
                <StatCompareRow
                  label="Max DMG"
                  you={runStats.maxDamage}
                  them={rivalData.maxDamage}
                />
                <StatCompareRow
                  label="Total DMG"
                  you={runStats.totalDamageDealt}
                  them={rivalData.damage}
                />
                <StatCompareRow label="Moves" you={runStats.totalMoves} them={rivalData.moves} />
              </div>
            </motion.div>
          )}

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onShowShare}
                className="px-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest shadow-lg border border-indigo-500/30 flex items-center justify-center gap-2 group text-[10px] active:scale-95"
              >
                📸 Share
              </button>
              <button
                onClick={handleDirectSave}
                className="px-4 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest shadow-lg border border-emerald-500/30 flex items-center justify-center gap-2 group text-[10px] active:scale-95"
              >
                💾 Save
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {!runStats.wasGodModeUsed && (
                <>
                  {isChallengeMode ? (
                    <button
                      onClick={handleResultShare}
                      className={clsx(
                        'w-full py-4 text-white font-black rounded-2xl transition-all uppercase tracking-widest shadow-lg border text-xs active:scale-95',
                        didWinChallenge
                          ? 'bg-emerald-600 border-emerald-500/30'
                          : 'bg-rose-600 border-rose-500/30',
                      )}
                    >
                      {didWinChallenge ? '📤 Share Victory' : '📤 Share Result'}
                    </button>
                  ) : (
                    <button
                      onClick={handleChallengeShare}
                      className="w-full py-4 bg-amber-600/20 hover:bg-amber-600/30 text-amber-500 rounded-2xl text-xs font-black uppercase tracking-widest border border-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      ⚔️ Challenge Friends
                    </button>
                  )}
                </>
              )}
            </div>

            <button
              onClick={onShowLeaderboard}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold rounded-2xl transition-all uppercase tracking-widest w-full border border-slate-700 text-xs active:scale-95"
            >
              🏆 Hall of Heroes
            </button>

            <button
              onClick={resetGame}
              className="px-8 py-5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest w-full border border-rose-500/30 text-sm shadow-xl shadow-rose-950/20 active:scale-95 animate-in slide-in-from-bottom-4 duration-700 delay-300"
            >
              Try Again
            </button>
          </div>

          <p className="text-[8px] text-slate-700 mt-8 uppercase tracking-[0.4em] font-black">
            Crit 2048: Rogue-Like RPG
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const StatCompareRow: React.FC<{ label: string; you: number; them: number }> = ({
  label,
  you,
  them,
}) => {
  const win = you >= them;
  return (
    <div className="flex justify-between items-center text-[10px]">
      <span className="text-slate-500 uppercase font-bold text-[8px]">{label}</span>
      <div className="flex items-center gap-2 font-mono">
        <span className={clsx('font-black', win ? 'text-emerald-400' : 'text-slate-300')}>
          {you}
        </span>
        <span className="text-slate-600 text-[8px]">vs</span>
        <span className="text-slate-400">{them}</span>
      </div>
    </div>
  );
};

export default RunStatsModal;
