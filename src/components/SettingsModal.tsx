import React, { useState } from 'react';
import { useGameStore } from '../engine/gameStore';
import { Native } from '../engine/native';
import { SFX } from '../engine/audio';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { gold, addLog } = useGameStore();
  const [uiScale, setUiScale] = useState(1.0);
  const [volume, setVolume] = useState(1.0);

  const handleUiScaleChange = (val: number) => {
    setUiScale(val);
    document.documentElement.style.fontSize = `${val * 16}px`;
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    SFX.setVolume(val);
  };

  const resetToFactory = () => {
    if (confirm("Reset all settings to factory defaults?")) {
      handleUiScaleChange(1.0);
      handleVolumeChange(1.0);
      addLog("Settings: Factory defaults restored.");
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/95 z-[110] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md md:max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-800 shrink-0">
          <h2 className="text-2xl font-black tracking-widest text-white text-center uppercase font-serif">Settings</h2>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Visuals Section */}
          <section>
            <h3 className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Atmosphere</h3>
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">UI Scale <span className="text-white">{uiScale.toFixed(1)}x</span></label>
                <input 
                  type="range" 
                  min="0.8" 
                  max="1.5" 
                  step="0.05" 
                  value={uiScale} 
                  onChange={(e) => handleUiScaleChange(parseFloat(e.target.value))}
                  className="w-full accent-rose-500" 
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Dice Theme</label>
                <select className="w-full bg-slate-950 border border-slate-800 text-white font-bold rounded-xl p-3 focus:border-rose-500 outline-none text-xs">
                    <option value="default">Default Colors</option>
                    <option value="blood">Blood Magic</option>
                    <option value="bone">Ancient Bone</option>
                    <option value="neon">Cyber Neon</option>
                </select>
              </div>
            </div>
          </section>

          {/* Audio & Haptics Section */}
          <section className="pt-6 border-t border-slate-800">
            <h3 className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Sensory</h3>
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">SFX Volume <span className="text-white">{Math.round(volume * 100)}%</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={volume} 
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-rose-500" 
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Touch Feedback</label>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-rose-500 bg-slate-950 border-slate-800 rounded" />
              </div>
            </div>
          </section>

          <button onClick={resetToFactory} className="w-full py-3 text-slate-500 hover:text-rose-400 transition-colors text-[9px] font-black uppercase tracking-widest border border-dashed border-slate-800 rounded-xl">
            Reset to Factory Defaults
          </button>
        </div>

        <div className="p-6 border-t border-slate-800 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px] border border-slate-700">Cancel</button>
          <button onClick={() => { addLog("Settings: Config saved."); onClose(); }} className="flex-1 py-3 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-500 transition-colors uppercase tracking-widest text-[10px] border border-rose-500/50 shadow-lg">Save Config</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
