import React from 'react';

interface IOSInstallModalProps {
  onClose: () => void;
}

const IOSInstallModalFix: React.FC<IOSInstallModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/90 z-[200] flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-sm w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 text-center bg-gradient-to-b from-rose-500/10 to-transparent">
          <div className="w-20 h-20 bg-rose-600 rounded-2xl mx-auto mb-6 shadow-2xl flex items-center justify-center text-4xl transform -rotate-3">
             🐉
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 font-serif">Install Crit 2048</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Add to your home screen to enable <span className="text-rose-400">offline play</span> and fullscreen mode.
          </p>
        </div>

        {/* Steps */}
        <div className="px-8 pb-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center shrink-0 text-xs font-black text-white border border-slate-700">1</div>
            <div>
              <p className="text-sm text-slate-200 leading-tight">
                Tap the <span className="inline-flex items-center justify-center bg-slate-800 w-6 h-6 rounded mx-1 text-blue-400">📤</span> <strong>Share</strong> button in the Safari menu bar.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center shrink-0 text-xs font-black text-white border border-slate-700">2</div>
            <div>
              <p className="text-sm text-slate-200 leading-tight">
                Scroll down and select <span className="text-white font-bold">"Add to Home Screen"</span> <span className="inline-flex items-center justify-center bg-slate-800 w-6 h-6 rounded mx-1 text-slate-400">➕</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center shrink-0 text-xs font-black text-white border border-slate-700">3</div>
            <div>
              <p className="text-sm text-slate-200 leading-tight">
                Tap <span className="text-rose-500 font-black">Add</span> in the top right corner.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-slate-700 active:scale-95"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
};

export default IOSInstallModalFix;
