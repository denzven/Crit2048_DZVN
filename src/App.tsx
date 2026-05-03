import React, { useEffect } from 'react'
import { useGameStore } from './engine/gameStore'
import Grid from './components/Grid'
import Tavern from './components/Tavern'
import ClassSelection from './components/ClassSelection'
import DiceModal from './components/DiceModal'
import SpellModal from './components/SpellModal'
import SettingsModal from './components/SettingsModal'
import GrimoireModal from './components/GrimoireModal'
import ForgeModal from './components/ForgeModal'
import RunStatsModal from './components/RunStatsModal'
import LeaderboardModal from './components/LeaderboardModal'
import ShareModal from './components/ShareModal'
import { MobileInventoryModal, MobileLogsModal } from './components/MobileModals'
import BackgroundParticles from './components/BackgroundParticles'
import { Native } from './engine/native'
import { clsx } from 'clsx'

function App() {
  const { 
    gameState, 
    monsterHp, 
    monsterMaxHp, 
    slidesLeft, 
    gold, 
    multiplier,
    logs,
    artifacts,
    encounterIdx,
    usesLeft,
    playerClass,
    setGameState,
    castSpell,
  } = useGameStore()

  const [showSettings, setShowSettings] = React.useState(false)
  const [showGrimoire, setShowGrimoire] = React.useState(false)
  const [showForge, setShowForge] = React.useState(false)
  const [showLeaderboard, setShowLeaderboard] = React.useState(false)
  const [showShare, setShowShare] = React.useState(false)
  const [showMobileInventory, setShowMobileInventory] = React.useState(false)
  const [showMobileLogs, setShowMobileLogs] = React.useState(false)
  const [seedInput, setSeedInput] = React.useState('')

  useEffect(() => {
    Native.requestWakeLock()
    return () => Native.releaseWakeLock()
  }, [])

  const handleStart = () => {
    Native.vibrate(50)
    if (seedInput) {
      useGameStore.setState({ runStats: { ...useGameStore.getState().runStats, seedUsed: seedInput } });
    }
    setGameState('CLASS_SELECT')
  }

  return (
    <div className="bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 flex flex-col h-screen w-screen overflow-hidden select-none">
      <BackgroundParticles />
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0 relative z-40 px-4 h-14 md:h-16">
        <div className="flex items-center gap-2">
          <h1 className="text-lg md:text-2xl font-black tracking-wider text-rose-500 flex items-center gap-2 font-serif cursor-pointer hover:text-rose-400 transition-colors">
            🐉 CRIT 2048
          </h1>
          {gameState !== 'START' && (
            <span className="bg-slate-800 text-slate-300 text-[10px] md:text-xs font-bold px-2 py-1 rounded-md ml-2 uppercase tracking-widest">
              Ante {encounterIdx + 1}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          {gameState !== 'START' && (
            <div className="flex gap-2 md:gap-4 text-xs md:text-base font-black text-amber-400">
              <span className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm">
                💰 <span className="font-mono">{gold}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm text-rose-400">
                ⚔️ <span className="font-mono">{multiplier.toFixed(1)}</span>
              </span>
            </div>
          )}
          <button 
            onClick={() => setShowGrimoire(true)}
            className="text-slate-400 hover:text-white transition-colors text-xl md:text-2xl active:scale-95" 
            title="Grimoire"
          >
            📜
          </button>
          <button 
            onClick={() => setShowForge(true)}
            className="text-slate-400 hover:text-white transition-colors text-xl md:text-2xl active:scale-95" 
            title="Forge"
          >
            ⚒️
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="text-slate-400 hover:text-white transition-colors text-xl active:scale-95"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow flex flex-col items-center relative min-h-0 w-full overflow-hidden">
        
        {/* START SCREEN */}
        {gameState === 'START' && (
          <div className="text-center space-y-6 md:space-y-8 max-w-4xl mx-auto w-full relative z-10 flex flex-col justify-center h-full overflow-y-auto px-6 py-8">
            <div>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter font-serif">CRIT <span className="text-rose-500">2048</span></h2>
              <p className="text-slate-400 text-lg md:text-xl font-light">Seeded Roguelike Deckbuilder</p>
            </div>

            <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl text-left text-sm md:text-base space-y-4 shadow-xl">
              <h3 className="font-black text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2">How to Play</h3>
              <ul className="space-y-3 text-slate-400">
                <li><strong className="text-white">1. Merge:</strong> Swipe to combine weapons and deal damage to the Boss.</li>
                <li><strong className="text-white">2. Spellcraft:</strong> Cast physical dice spells that unleash grid-wide effects.</li>
                <li><strong className="text-white">3. Hazards:</strong> Beware Goblins (steal gold) and Skeletons (block merging).</li>
                <li><strong className="text-white">4. The D20:</strong> Every <span className="font-bold text-amber-400">5</span> moves, roll a D20 to determine your fate.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-black uppercase tracking-widest pointer-events-none">Seed</span>
                <input 
                  type="text" 
                  placeholder="RANDOM" 
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-center font-mono rounded-2xl p-5 pl-16 focus:border-rose-500 outline-none uppercase shadow-2xl transition-all" 
                />
              </div>
              <button 
                onClick={handleStart}
                className="w-full px-8 py-5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl shadow-2xl shadow-rose-950/40 transition-all text-xl uppercase tracking-[0.2em] border border-rose-500/50 active:scale-95"
              >
                Enter the Dungeon
              </button>
              <button 
                onClick={() => setShowLeaderboard(true)}
                className="w-full py-3 text-slate-500 hover:text-slate-300 transition-colors text-[10px] font-black uppercase tracking-[0.3em] mt-2"
              >
                🏆 Hall of Heroes
              </button>
            </div>
          </div>
        )}

        {/* CLASS SELECTION */}
        {gameState === 'CLASS_SELECT' && (
          <ClassSelection />
        )}

        {/* PLAYING SCREEN */}
        {gameState === 'PLAYING' && (
          <div className="flex flex-col items-center w-full max-w-4xl relative z-10 h-full justify-center px-4 py-2">
            
            {/* HUD */}
            <div id="playing-hud" className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2 md:p-3 mb-2 md:mb-4 relative overflow-hidden flex flex-col gap-1 shrink-0 shadow-lg">
              <div className="absolute inset-0 bg-slate-800/50 w-full z-0">
                <div 
                  className="h-full bg-rose-600/80 transition-all duration-300 ease-out" 
                  style={{ width: `${(monsterHp / monsterMaxHp) * 100}%` }}
                ></div>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-xl md:text-2xl bg-slate-950 p-1.5 md:p-2 rounded-xl border border-slate-800">
                    {encounterIdx === 0 ? '👺' : 
                     encounterIdx === 1 ? '👹' : 
                     encounterIdx === 2 ? '🟢' : '🐉'}
                  </span>
                  <div>
                    <h3 className="font-black text-sm md:text-lg text-white tracking-wider">
                      {encounterIdx === 0 ? 'Goblin Scout' : 
                       encounterIdx === 1 ? 'Orc Brute' : 
                       encounterIdx === 2 ? 'Slime King' : 'The Boss'}
                    </h3>
                    <p className="text-[9px] md:text-xs font-mono text-rose-200 leading-none">HP: {Math.ceil(monsterHp)} / {monsterMaxHp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold">Slides</p>
                  <p className="text-xl md:text-3xl font-black font-mono text-white leading-none">{slidesLeft}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-4 items-stretch w-full justify-center min-h-0 flex-1">
              
              {/* Left Sidebar (Desktop) */}
              <div className="hidden md:flex flex-col gap-2 w-48 lg:w-56 shrink-0 min-h-0">
                <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold shrink-0">Inventory</h4>
                <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                  {artifacts.length === 0 ? (
                    <div className="text-[10px] text-slate-600 italic">No artifacts yet...</div>
                  ) : (
                    artifacts.map((art, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center gap-3">
                        <span className="text-xl">{art.icon}</span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-white truncate uppercase">{art.name}</p>
                          <p className="text-[8px] text-slate-500 font-mono">LVL {art.level}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Grid */}
              <Grid />

              {/* Right Sidebar (Desktop) */}
              <div className="hidden md:flex flex-col gap-4 w-48 lg:w-56 shrink-0 min-h-0">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 text-center shadow-lg relative overflow-hidden shrink-0">
                  <span className="text-4xl block mb-2 relative z-10">{playerClass?.icon || '⚔️'}</span>
                  <p className="font-black text-sm text-white uppercase tracking-wider relative z-10">{playerClass?.name || 'Hero'}</p>
                  <p className="text-xs text-indigo-400 font-mono mt-1 relative z-10">Spell: {playerClass?.ability?.name || 'None'}</p>
                  <p className={clsx("text-xs font-mono mb-4 relative z-10", usesLeft > 0 ? "text-amber-400" : "text-slate-600")}>
                    Uses: {usesLeft}/{playerClass?.ability?.maxUses || 0}
                  </p>
                  <button 
                    onClick={castSpell}
                    disabled={usesLeft <= 0}
                    className="relative z-10 w-full py-3 rounded-xl text-sm font-black transition-all bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-lg uppercase tracking-widest border border-blue-400/30 active:scale-95"
                  >
                    Cast
                  </button>
                </div>
                
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-2 text-[10px] text-slate-400 font-mono flex-1 overflow-y-auto custom-scrollbar flex flex-col-reverse">
                  {logs.map((log, i) => (
                    <div key={i} className="py-0.5 border-b border-slate-800/50">{log}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:hidden flex w-full gap-2 mt-2 shrink-0 h-16">
              <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-700 text-center flex items-center justify-center gap-2 w-full shadow-lg">
                 <button 
                   onClick={() => setShowMobileInventory(true)}
                   className="flex-1 h-full rounded-lg bg-slate-800 text-slate-300 font-black uppercase tracking-widest text-[10px] border border-slate-700 flex flex-col items-center justify-center gap-0.5 active:bg-slate-700"
                 >
                   <span className="text-lg">🎒</span>
                   <span>Items</span>
                 </button>
                 <button 
                   onClick={castSpell}
                   disabled={usesLeft <= 0}
                   className="flex-[1.5] h-full rounded-lg text-[10px] font-black transition-all bg-blue-600 active:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white uppercase tracking-widest flex flex-col items-center justify-center border border-blue-400/30"
                 >
                   <span className="flex items-center gap-2">
                     <span className="text-xl">{playerClass?.icon || '⚔️'}</span>
                     <span className="font-mono text-sm">{usesLeft}/{playerClass?.ability?.maxUses || 0}</span>
                   </span>
                   <span className="text-[8px] opacity-80">CAST {playerClass?.ability?.name?.toUpperCase()}</span>
                 </button>
                 <button 
                   onClick={() => setShowMobileLogs(true)}
                   className="flex-1 h-full rounded-lg bg-slate-800 text-slate-300 font-black uppercase tracking-widest text-[10px] border border-slate-700 flex flex-col items-center justify-center gap-0.5 active:bg-slate-700"
                 >
                   <span className="text-lg">📜</span>
                   <span>Logs</span>
                 </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'TAVERN' && (
          <Tavern />
        )}

        {gameState === 'DICE' && (
          <DiceModal />
        )}

        {gameState === 'SPELL' && (
          <SpellModal />
        )}

        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}

        {showGrimoire && (
          <GrimoireModal onClose={() => setShowGrimoire(false)} />
        )}

        {showForge && (
          <ForgeModal onClose={() => setShowForge(false)} />
        )}

        {showLeaderboard && (
          <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
        )}

        {showShare && (
          <ShareModal onClose={() => setShowShare(false)} />
        )}

        {showMobileInventory && (
          <MobileInventoryModal onClose={() => setShowMobileInventory(false)} />
        )}

        {showMobileLogs && (
          <MobileLogsModal onClose={() => setShowMobileLogs(false)} />
        )}

        {(gameState === 'GAME_OVER' || gameState === 'VICTORY') && (
          <RunStatsModal 
            onShowLeaderboard={() => setShowLeaderboard(true)} 
            onShowShare={() => setShowShare(true)}
          />
        )}
      </main>
    </div>
  )
}

export default App
