import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

import { SFX } from '../engine/audio';
import { useGameStore } from '../engine/gameStore';
import { useRegistry } from '../engine/registryHub';
import { Recorder } from '../engine/screenRecorder';

const FX_PRESETS = [
  'stomp',
  'flash',
  'announce',
  'aoe',
  'lightning',
  'projectile',
  'smite',
  'swirl',
  'heal',
  'poison',
  'float',
  'pop',
];

const DevPanel: React.FC = () => {
  const {
    isDevMode,
    toggleDevMode,
    addGold,
    restoreSlides,
    setMultiplier,
    setMonsterHp,
    monsterMaxHp,
    monsterHp,
    gold,
    slidesLeft,
    multiplier,
    activeArtifacts,
    buyArtifact,
    spawnRandomTile,
    nextEncounter,
    prevEncounter,
    triggerFX,
    setD20Result,
    rollD20,
    executeDebugScript,
    setState,
  } = useGameStore();

  const [isOpen, setIsOpen] = useState(false);
  const [artSearch, setArtSearch] = useState('');
  const [debugScript, setDebugScript] = useState('');
  const [selectedFX, setSelectedFX] = useState('stomp');
  const [customDmg, setCustomDmg] = useState(1000);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const allArtifacts = useRegistry((s) => s.artifacts);

  if (!isDevMode) return null;

  const filteredArtifacts = Object.values(allArtifacts).filter(
    (a) =>
      a.name.toLowerCase().includes(artSearch.toLowerCase()) ||
      a.id.toLowerCase().includes(artSearch.toLowerCase()),
  );

  const handleRunScript = () => {
    if (!debugScript.trim()) return;
    executeDebugScript(debugScript);
    setDebugScript('');
  };

  const handleTriggerFX = () => {
    const params: any = { x: 50, y: 50, icon: '🛡️', name: 'DEBUG' };
    if (selectedFX === 'float' || selectedFX === 'pop') params.targetId = 'hud-gold';
    triggerFX(selectedFX, params);
  };

  const forceD20 = (val: number) => {
    setD20Result(val);
    setState({ gameState: 'DICE' });
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-20 right-4 z-[3000] flex flex-col items-end gap-2 font-sans"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-slate-900 border-2 border-indigo-500 rounded-2xl p-4 w-80 max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar flex flex-col gap-5"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 shrink-0">
              <h3 className="text-indigo-400 font-black uppercase text-xs tracking-tighter flex items-center gap-2">
                <span className="animate-pulse">🛠️</span> GOD MODE PANEL
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* SCRIPT INJECTION */}
            <section className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-2 px-1">
                Inject Script
              </h4>
              <textarea
                value={debugScript}
                onChange={(e) => setDebugScript(e.target.value)}
                placeholder="G.log('Hello World'); G.player.addGold(100);"
                className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg p-2 text-[10px] text-emerald-400 font-mono focus:outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={handleRunScript}
                className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest"
              >
                Execute JS
              </button>
            </section>

            {/* QUICK STATS */}
            <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">GOLD:</span>{' '}
                <span className="text-amber-400 font-bold">{gold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SLIDES:</span>{' '}
                <span className="text-emerald-400 font-bold">{slidesLeft}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MULT:</span>{' '}
                <span className="text-purple-400 font-bold">x{multiplier.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">HP:</span>{' '}
                <span className="text-rose-400 font-bold">{Math.ceil(monsterHp)}</span>
              </div>
            </div>

            {/* CORE CONTROLS */}
            <div className="grid grid-cols-2 gap-2">
              <DevButton
                label="+500 Gold"
                onClick={() => addGold(500)}
                color="bg-amber-600/20 text-amber-200 border-amber-600/30"
              />
              <DevButton
                label="+20 Slides"
                onClick={() => restoreSlides(20)}
                color="bg-emerald-600/20 text-emerald-200 border-emerald-600/30"
              />
              <DevButton
                label="Kill Boss"
                onClick={() => setMonsterHp(0)}
                color="bg-rose-600/20 text-rose-200 border-rose-600/30"
              />
              <DevButton
                label="Next Ante"
                onClick={() => nextEncounter()}
                color="bg-slate-800 border-slate-700"
              />
            </div>

            {/* RECORDING CONTROLS */}
            <section className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <h4 className="text-[10px] font-bold text-emerald-400 uppercase mb-2 px-1 flex justify-between">
                OST Recorder{' '}
                {isRecording && <span className="animate-pulse text-rose-500">● REC</span>}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    SFX.startRecording();
                    setIsRecording(true);
                  }}
                  disabled={isRecording}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase ${
                    isRecording
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  Start Record
                </button>
                <button
                  onClick={() => {
                    SFX.stopRecording();
                    setIsRecording(false);
                  }}
                  disabled={!isRecording}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase ${
                    !isRecording
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  Stop & DL
                </button>
              </div>
            </section>

            {/* CLIP MAKER CONTROLS */}
            <section className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-2 px-1 flex justify-between">
                Clip Maker{' '}
                {isVideoRecording && <span className="animate-pulse text-rose-500">● LIVE</span>}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    const success = await Recorder.start();
                    if (success) setIsVideoRecording(true);
                  }}
                  disabled={isVideoRecording}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase ${
                    isVideoRecording
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  Start Clip
                </button>
                <button
                  onClick={() => {
                    Recorder.stop();
                    setIsVideoRecording(false);
                  }}
                  disabled={!isVideoRecording}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase ${
                    !isVideoRecording
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  Save Clip
                </button>
              </div>
            </section>

            {/* CUSTOM DAMAGE SLIDER */}
            <section className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <h4 className="text-[10px] font-bold text-rose-400 uppercase mb-2 px-1">
                Custom Damage
              </h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={customDmg}
                    onChange={(e) => setCustomDmg(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <span className="text-[10px] font-bold text-rose-400 w-12 text-right">
                    {customDmg}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMonsterHp(Math.max(0, monsterHp - customDmg));
                    triggerFX('smite', { x: 50, y: 50 });
                  }}
                  className="w-full py-1.5 bg-rose-600/80 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest"
                >
                  Apply {customDmg} Damage
                </button>
              </div>
            </section>

            {/* D20 & MULTIPLIER */}
            <section className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.1"
                    max="10.0"
                    step="0.1"
                    value={multiplier}
                    onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-[10px] font-bold text-purple-400 w-8">
                    x{multiplier.toFixed(1)}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    onClick={() => forceD20(1)}
                    className="text-[9px] bg-rose-900/40 text-rose-200 p-1 rounded border border-rose-900/50"
                  >
                    NAT 1
                  </button>
                  <button
                    onClick={() => forceD20(10)}
                    className="text-[9px] bg-slate-800 p-1 rounded border border-slate-700"
                  >
                    SET 10
                  </button>
                  <button
                    onClick={() => forceD20(20)}
                    className="text-[9px] bg-amber-900/40 text-amber-200 p-1 rounded border border-amber-900/50"
                  >
                    NAT 20
                  </button>
                  <button
                    onClick={() => setState({ gameState: 'DICE' })}
                    className="text-[9px] bg-indigo-600 text-white p-1 rounded font-bold"
                  >
                    ROLL
                  </button>
                </div>
              </div>
            </section>

            {/* VISUAL SANDBOX */}
            <section className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 px-1">
                Visual Sandbox
              </h4>
              <div className="flex gap-2">
                <select
                  value={selectedFX}
                  onChange={(e) => setSelectedFX(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-300 flex-1 outline-none"
                >
                  {FX_PRESETS.map((fx) => (
                    <option key={fx} value={fx}>
                      {fx.toUpperCase()}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleTriggerFX}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg"
                >
                  FIRE
                </button>
              </div>
            </section>

            {/* ARTIFACT REPOSITORY */}
            <section className="flex flex-col gap-2">
              <div className="flex justify-between items-end px-1">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase">Artifacts</h4>
                <span className="text-[8px] text-slate-600">{filteredArtifacts.length} found</span>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={artSearch}
                onChange={(e) => setArtSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                {filteredArtifacts.map((art: any) => {
                  const owned = activeArtifacts.some((a) => a.id === art.id);
                  return (
                    <button
                      key={art.id}
                      onClick={() => buyArtifact(art.id)}
                      className={`text-[9px] text-left px-2 py-1.5 rounded border transition-all flex justify-between items-center ${
                        owned
                          ? 'bg-indigo-900/20 border-indigo-500/30 text-indigo-200'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">{art.icon}</span>
                        <span className="font-bold">{art.name}</span>
                      </span>
                      <span className="text-[8px] opacity-50 uppercase">
                        {owned ? 'Owned' : 'Add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <button
              onClick={toggleDevMode}
              className="w-full py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-500 text-[10px] font-black rounded-xl transition-all border border-rose-900/30"
            >
              DISABLE GOD MODE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-xl transition-all active:scale-90 border-2 border-indigo-400 relative z-[3001]"
      >
        <span className={isOpen ? 'rotate-90' : 'rotate-0' + ' transition-transform duration-300'}>
          🛠️
        </span>
      </button>
    </motion.div>
  );
};

const DevButton: React.FC<{ label: string; onClick: () => void; color: string }> = ({
  label,
  onClick,
  color,
}) => (
  <button
    onClick={onClick}
    className={`${color} border border-transparent rounded-xl py-2 px-1 text-[10px] font-black uppercase tracking-tighter shadow-sm hover:brightness-110 active:scale-95 transition-all`}
  >
    {label}
  </button>
);

export default DevPanel;
