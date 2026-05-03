import React, { useEffect } from 'react';
import { useGameStore } from '../engine/gameStore';
import { getTileStats } from '../engine/data';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Grid: React.FC = () => {
  const { grid, move, gameState } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          move('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
          move('RIGHT');
          break;
        case 'ArrowUp':
        case 'w':
          move('UP');
          break;
        case 'ArrowDown':
        case 's':
          move('DOWN');
          break;
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState !== 'PLAYING') return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 30) {
        if (absDx > absDy) {
          move(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
          move(dy > 0 ? 'DOWN' : 'UP');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, move]);

  return (
    <div 
      id="grid-container" 
      className="relative bg-slate-800 p-2 md:p-3 rounded-2xl border border-slate-700 w-72 h-72 md:w-96 md:h-96 shrink-0 self-center shadow-xl overflow-hidden"
    >
      <div className="relative w-full h-full">
        {/* Background Grid Cells */}
        <div className="grid grid-cols-4 grid-rows-4 gap-[2%] w-full h-full absolute inset-0">
          {Array(16).fill(null).map((_, i) => (
            <div key={`bg-${i}`} className="bg-slate-900/80 rounded-xl shadow-inner" />
          ))}
        </div>

        {/* Dynamic Tiles Layer */}
        <div id="tiles-layer" className="absolute inset-0 pointer-events-none">
          {grid.map((tile, idx) => {
            if (!tile) return null;
            const stats = getTileStats(tile.val);
            const r = Math.floor(idx / 4);
            const c = idx % 4;
            
            return (
              <div
                key={tile.id}
                className={clsx(
                  "absolute flex flex-col items-center justify-center rounded-xl shadow-lg transition-all duration-100",
                  stats.bg,
                  stats.text || "text-white",
                  tile.pop && "animate-tile-pop",
                  tile.merged && "animate-tile-merge"
                )}
                style={{
                  width: '23.5%',
                  height: '23.5%',
                  left: `${c * 25.5}%`,
                  top: `${r * 25.5}%`,
                  zIndex: tile.merged ? 20 : 10
                }}
              >
                <span className="text-2xl md:text-3xl">{stats.icon}</span>
                <span className="font-bold text-xs md:text-sm mt-1 leading-tight">{tile.val}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Grid;
