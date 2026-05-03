import React, { useEffect, useState } from 'react';
import { ImageGenerator } from '../engine/imageGenerator';
import { useGameStore } from '../engine/gameStore';

const ShareModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { runStats, playerClass, encounterIdx, artifacts } = useGameStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
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
          artifacts: artifacts
        };
        const bytes = await ImageGenerator.generate(data);
        const blob = new Blob([bytes], { type: 'image/png' });
        setPreview(URL.createObjectURL(blob));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, []);

  const handleDownload = () => {
    if (!preview) return;
    const link = document.createElement('a');
    link.download = `crit2048_run_${runStats.seedUsed}.png`;
    link.href = preview;
    link.click();
  };

  return (
    <div className="absolute inset-0 bg-slate-950/95 z-[150] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-white font-black uppercase tracking-widest text-sm">Share Run Summary</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-rose-900 text-white rounded-lg transition-colors">✕</button>
        </div>

        {/* Preview */}
        <div className="flex-grow p-6 flex flex-col items-center justify-center gap-4 bg-slate-950/50 relative">
          {loading ? (
            <div className="flex flex-col items-center gap-4 text-slate-500">
              <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest">Generating Masterpiece...</p>
            </div>
          ) : (
            <>
              <div className="w-full max-w-[280px] aspect-[1080/1920] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 ring-4 ring-rose-500/10">
                {preview && <img src={preview} className="w-full h-full object-contain" alt="Run Summary" />}
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center px-8">High-resolution stat card ready for sharing.</p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex flex-col gap-3">
          <button 
            disabled={loading}
            onClick={handleDownload}
            className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
          >
            💾 Save to Device
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
