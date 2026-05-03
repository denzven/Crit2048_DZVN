import React from 'react'

function App() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-950 safe-top safe-bottom">
      <header className="h-16 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <h1 className="text-xl font-bold text-rose-500 tracking-tighter">🐉 CRIT 2048</h1>
        <div className="flex gap-4">
          <button className="p-2 text-slate-400 hover:text-white transition-colors">⚙️</button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">⚔️</div>
          <h2 className="text-2xl font-bold text-slate-100">Welcome to the Dungeon</h2>
          <p className="text-slate-400 max-w-xs mx-auto">
            The rewrite has begun. We are currently in Phase 1: Scaffolding.
          </p>
          <button 
            className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/20 transition-all active:scale-95"
            onClick={() => navigator.vibrate?.(50)}
          >
            Test Haptics
          </button>
        </div>
      </main>

      <footer className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-4 shrink-0 pb-safe">
        <button className="flex flex-col items-center gap-1 text-rose-400">
          <span className="text-2xl">🏠</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <span className="text-2xl">📜</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Grimoire</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <span className="text-2xl">⚒️</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Forge</span>
        </button>
      </footer>
    </div>
  )
}

export default App
