import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { useGameStore } from '../engine/gameStore';
import { ImageGenerator } from '../engine/imageGenerator';
import { Native } from '../engine/native';

const ShareModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { runStats, playerClass, encounterIdx, artifacts } = useGameStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({
    theme: 'classic',
    showSeed: true,
    showArtifacts: true,
  });

  const generate = React.useCallback(async () => {
    setLoading(true);
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
      const bytes = await ImageGenerator.generate(data, options);
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'image/png' });

      // Cleanup old URL
      if (preview) URL.revokeObjectURL(preview);

      setPreview(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [encounterIdx, playerClass, runStats, artifacts, options, preview]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleDownload = () => {
    if (!preview) return;
    const link = document.createElement('a');
    link.download = `crit2048_run_${runStats.seedUsed}.png`;
    link.href = preview;
    link.click();
  };

  const handleShare = async () => {
    if (!preview) return;
    try {
      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], `crit2048_run_${runStats.seedUsed}.png`, { type: 'image/png' });

      const success = await Native.share({
        title: 'Crit 2048 Run Summary',
        text: `Check out my Ante ${encounterIdx + 1} run in Crit 2048! Seed: ${runStats.seedUsed}`,
        files: [file],
      });

      if (!success) {
        // Fallback to download
        handleDownload();
      }
    } catch (e) {
      console.error('Share failed', e);
      handleDownload();
    }
  };

  return (
    <div className="absolute inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-slate-900/95 border border-slate-700 rounded-[2.5rem] w-full max-w-lg shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden backdrop-blur-3xl relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-xl">📸</span>
            <h2 className="text-white font-black uppercase tracking-[0.2em] text-xs">
              Run Archive
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-rose-900 text-white rounded-xl transition-all border border-slate-700 active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Preview */}
        <div className="flex-grow p-6 flex flex-col md:flex-row items-center justify-center gap-8 bg-slate-950/50 relative z-10 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center gap-4 shrink-0">
            {loading ? (
              <div className="w-[200px] aspect-[1080/1920] flex flex-col items-center justify-center gap-6 bg-slate-900 rounded-[1.5rem] border border-slate-800">
                <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] animate-pulse">
                  Forging...
                </p>
              </div>
            ) : (
              <div className="w-[200px] aspect-[1080/1920] bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-white/10 relative group">
                {preview && (
                  <img src={preview} className="w-full h-full object-contain" alt="Run Summary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>
            )}
            <div className="text-center space-y-1">
              <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest">
                Masterpiece Preview
              </p>
            </div>
          </div>

          {/* Designer Controls */}
          <div className="flex-1 w-full max-w-[280px] space-y-6">
            <div className="space-y-3">
              <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                Themes
              </h3>
              <div className="flex gap-2">
                <ThemeBtn
                  label="Classic"
                  active={options.theme === 'classic'}
                  color="bg-rose-600"
                  onClick={() => setOptions((o) => ({ ...o, theme: 'classic' }))}
                />
                <ThemeBtn
                  label="Midnight"
                  active={options.theme === 'midnight'}
                  color="bg-slate-700"
                  onClick={() => setOptions((o) => ({ ...o, theme: 'midnight' }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                Details
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <ToggleBtn
                  label="Show Seed"
                  active={options.showSeed}
                  onClick={() => setOptions((o) => ({ ...o, showSeed: !o.showSeed }))}
                />
                <ToggleBtn
                  label="Show Treasures"
                  active={options.showArtifacts}
                  onClick={() => setOptions((o) => ({ ...o, showArtifacts: !o.showArtifacts }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 border-t border-slate-800 bg-slate-900/80 flex flex-col gap-3 relative z-10">
          <button
            disabled={loading}
            onClick={handleShare}
            className="w-full py-5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-950/30 transition-all active:scale-95 flex items-center justify-center gap-3 border border-rose-400/30"
          >
            <span className="text-lg">🚀</span> <span>Transmit to World</span>
          </button>
          <button
            disabled={loading}
            onClick={handleDownload}
            className="w-full py-4 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-50 text-slate-400 hover:text-white font-black rounded-2xl text-[9px] uppercase tracking-widest transition-all border border-slate-700/50"
          >
            Save to Local Archives
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ThemeBtn: React.FC<{
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}> = ({ label, active, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all active:scale-95 ${active ? 'border-white/40 bg-white/10' : 'border-white/5 bg-black/20 opacity-60'}`}
  >
    <div className={`w-8 h-2 rounded-full ${color}`} />
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const ToggleBtn: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-full py-3 px-4 rounded-xl border flex justify-between items-center transition-all active:scale-95 ${active ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/5 bg-black/20 opacity-60'}`}
  >
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    <div
      className={`w-6 h-3 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-slate-700'}`}
    >
      <div
        className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${active ? 'right-0.5' : 'left-0.5'}`}
      />
    </div>
  </button>
);

export default ShareModal;
