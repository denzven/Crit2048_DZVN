import React from 'react';
import { useGameStore } from '../engine/gameStore';
import { SFX } from '../engine/audio';
import { Native } from '../engine/native';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings, addLog, showConfirm } = useGameStore();

  const handleVolumeChange = (val: number) => {
    updateSettings({ volume: val });
    SFX.setVolume(val);
  };

  const resetToFactory = () => {
    showConfirm(
      "Factory Reset?", 
      "This will restore all settings to their default values. Proceed?", 
      () => {
        const defaults = {
          haptics: true,
          hapticIntensity: 1.0,
          screenshake: true,
          shakeIntensity: 1.0,
          particles: true,
          volume: 1.0,
          uiScale: 1.0,
          fontScale: 1.0,
          movesPerRoll: 5,
          startingGold: 0,
          diceTheme: 'default' as const
        };
        updateSettings(defaults);
        SFX.setVolume(1.0);
        addLog("Settings: Factory defaults restored.");
        onClose();
      }
    );
  };

  return (
    <div className="absolute inset-0 bg-slate-950/95 z-[160] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md md:max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-800 shrink-0">
          <h2 className="text-2xl font-black tracking-widest text-white text-center uppercase font-serif">Settings</h2>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Dungeon Rules Section */}
          <section>
            <h3 className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Dungeon Rules</h3>
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Moves per Roll <span className="text-white">{settings.movesPerRoll}</span></label>
                <input 
                  type="range" min="1" max="15" step="1" 
                  value={settings.movesPerRoll} 
                  onChange={(e) => updateSettings({ movesPerRoll: parseInt(e.target.value) })}
                  className="w-full accent-rose-500" 
                />
              </div>
              <div>
                <label className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Starting Gold <span className="text-amber-400">{settings.startingGold}</span></label>
                <input 
                  type="range" min="0" max="500" step="50" 
                  value={settings.startingGold} 
                  onChange={(e) => updateSettings({ startingGold: parseInt(e.target.value) })}
                  className="w-full accent-rose-500" 
                />
              </div>
            </div>
          </section>

          {/* Visuals Section */}
          <section className="pt-6 border-t border-slate-800">
            <h3 className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Atmosphere</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Dice Theme</label>
                <select 
                  value={settings.diceTheme}
                  onChange={(e) => updateSettings({ diceTheme: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-bold rounded-xl p-3 focus:border-rose-500 outline-none text-xs"
                >
                  <option value="default">Default Colors</option>
                  <option value="blood">Blood Magic</option>
                  <option value="bone">Ancient Bone</option>
                  <option value="neon">Cyber Neon</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Background Particles</label>
                <input 
                  type="checkbox" checked={settings.particles} 
                  onChange={(e) => updateSettings({ particles: e.target.checked })}
                  className="w-5 h-5 accent-rose-500 bg-slate-950 border-slate-800 rounded cursor-pointer" 
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Screen Shake</label>
                <input 
                  type="checkbox" checked={settings.screenshake} 
                  onChange={(e) => updateSettings({ screenshake: e.target.checked })}
                  className="w-5 h-5 accent-rose-500 bg-slate-950 border-slate-800 rounded cursor-pointer" 
                />
              </div>
              {settings.screenshake && (
                <div>
                  <label className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Shake Intensity <span className="text-white">{settings.shakeIntensity.toFixed(1)}</span></label>
                  <input 
                    type="range" min="0" max="2" step="0.1" 
                    value={settings.shakeIntensity} 
                    onChange={(e) => updateSettings({ shakeIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500" 
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">UI Scale <span className="text-white">{settings.uiScale.toFixed(1)}x</span></label>
                  <input 
                    type="range" min="0.8" max="1.5" step="0.05" 
                    value={settings.uiScale} 
                    onChange={(e) => updateSettings({ uiScale: parseFloat(e.target.value) })}
                    className="w-full accent-rose-500" 
                  />
                </div>
                <div>
                  <label className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Font Scale <span className="text-white">{settings.fontScale.toFixed(1)}x</span></label>
                  <input 
                    type="range" min="0.8" max="1.5" step="0.05" 
                    value={settings.fontScale} 
                    onChange={(e) => updateSettings({ fontScale: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Audio & Haptics Section */}
          <section className="pt-6 border-t border-slate-800">
            <h3 className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Sensory</h3>
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">SFX Volume <span className="text-white">{Math.round(settings.volume * 100)}%</span></label>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  value={settings.volume} 
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-rose-500" 
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Haptic Feedback</label>
                <input 
                  type="checkbox" checked={settings.haptics} 
                  onChange={(e) => updateSettings({ haptics: e.target.checked })}
                  className="w-5 h-5 accent-rose-500 bg-slate-950 border-slate-800 rounded cursor-pointer" 
                />
              </div>
              {settings.haptics && (
                <>
                  <div>
                    <label className="flex justify-between text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-wider">Haptic Intensity <span className="text-white">{settings.hapticIntensity.toFixed(1)}</span></label>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={settings.hapticIntensity} 
                      onChange={(e) => updateSettings({ hapticIntensity: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-500" 
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => Native.vibrate(20, settings.hapticIntensity)} className="py-2 bg-slate-800 text-slate-400 text-[8px] font-black uppercase rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">Light</button>
                    <button onClick={() => Native.vibrate(50, settings.hapticIntensity)} className="py-2 bg-slate-800 text-slate-400 text-[8px] font-black uppercase rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">Med</button>
                    <button onClick={() => Native.vibrate(100, settings.hapticIntensity)} className="py-2 bg-slate-800 text-slate-400 text-[8px] font-black uppercase rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">Heavy</button>
                    <button onClick={() => Native.vibrate([100, 50, 100], settings.hapticIntensity)} className="py-2 bg-slate-800 text-slate-400 text-[8px] font-black uppercase rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">Long</button>
                  </div>
                </>
              )}
            </div>
          </section>

          <button onClick={resetToFactory} className="w-full py-3 text-slate-500 hover:text-rose-400 transition-colors text-[9px] font-black uppercase tracking-widest border border-dashed border-slate-800 rounded-xl">
            Reset to Factory Defaults
          </button>
          
          <div className="pt-4 flex flex-col items-center gap-2">
            <button 
              onClick={async () => {
                addLog("Updater: Contacting GitHub for latest build info...");
                try {
                  const res = await fetch('https://api.github.com/repos/denzven/Crit2048_DZVN/commits/main');
                  const data = await res.json();
                  const latestSha = data.sha.substring(0, 7);
                  const lastSha = localStorage.getItem('crit2048_last_sha');
                  
                  if (lastSha && lastSha !== latestSha) {
                    addLog(`Updater: New build detected (${latestSha}). Refreshing registry...`);
                    if ('serviceWorker' in navigator) {
                      const reg = await navigator.serviceWorker.getRegistration();
                      if (reg) await reg.update();
                    }
                    showConfirm(
                      "New Content Available",
                      `A new version (${latestSha}) was found on GitHub. Would you like to update now?`,
                      () => window.location.reload()
                    );
                  } else {
                    addLog(`Updater: You are on the latest build (${latestSha}).`);
                    localStorage.setItem('crit2048_last_sha', latestSha);
                  }
                } catch (err) {
                  addLog("Updater: Failed to reach GitHub. Check your connection.");
                  // Fallback to standard SW update
                  if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.getRegistration();
                    if (reg) await reg.update();
                  }
                }
              }}
              className="text-[9px] text-slate-500 hover:text-indigo-400 uppercase font-black tracking-widest transition-colors"
            >
              Check Live GitHub Source
            </button>
            <p className="text-[8px] text-slate-700 font-mono">v1.0.0-pwa</p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex flex-col gap-3 shrink-0">
          {(useGameStore.getState().gameState !== 'START') && (
            <button 
              onClick={() => {
                showConfirm(
                  "Forfeit Run?", 
                  "Abandon your current progress and return to the menu? This cannot be undone.", 
                  () => { useGameStore.getState().forfeitRun(); onClose(); }
                );
              }}
              className="w-full py-3 bg-rose-900/20 text-rose-500 font-black rounded-xl hover:bg-rose-900/40 transition-colors uppercase tracking-widest text-[10px] border border-rose-500/30 mb-2"
            >
              Forfeit Current Run
            </button>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px] border border-slate-700">Cancel</button>
            <button onClick={() => { addLog("Settings: Config saved."); onClose(); }} className="flex-1 py-3 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-500 transition-colors uppercase tracking-widest text-[10px] border border-rose-500/50 shadow-lg">Save Config</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
