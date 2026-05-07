import React from 'react';
import { useGameStore } from '../engine/gameStore';
import { clsx } from 'clsx';
import { Emoji } from './Emoji';
import { motion } from 'framer-motion';

const ClassSelection: React.FC = () => {
  const { initEncounter, spawnRandomTile, addLog, activeClasses } = useGameStore();
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const isKeyboardNav = React.useRef(false);
  const blockScrollFocus = React.useRef(false);
  const scrollLockTimeout = React.useRef<any>(null);

  const handleSelect = (heroClass: any) => {
    useGameStore.setState({ playerClass: heroClass, usesLeft: heroClass.ability.maxUses });
    initEncounter(150, 25);
    addLog(`Dungeon entered as ${heroClass.name}.`);
  };

  // Scroll listener for mobile focus
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Don't fight with keyboard navigation or if we're on desktop (where hover is king)
      if (blockScrollFocus.current || window.innerWidth >= 768) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestIndex = focusedIndex;
      let minDistance = Infinity;

      cardRefs.current.forEach((card, idx) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(containerCenter - cardCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      });

      if (closestIndex !== focusedIndex) {
        setFocusedIndex(closestIndex);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [focusedIndex, activeClasses.length]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let nextIndex = focusedIndex;
      if (e.key === 'ArrowRight') {
        nextIndex = (focusedIndex + 1) % activeClasses.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (focusedIndex - 1 + activeClasses.length) % activeClasses.length;
      } else if (e.key === 'ArrowDown') {
        nextIndex = (focusedIndex + 3) % activeClasses.length;
      } else if (e.key === 'ArrowUp') {
        nextIndex = (focusedIndex - 3 + activeClasses.length) % activeClasses.length;
      } else if (e.key === 'Enter') {
        handleSelect(activeClasses[focusedIndex]);
        return;
      } else {
        return;
      }

      isKeyboardNav.current = true;
      blockScrollFocus.current = true;
      setFocusedIndex(nextIndex);
      
      if (scrollLockTimeout.current) clearTimeout(scrollLockTimeout.current);
      scrollLockTimeout.current = setTimeout(() => {
        blockScrollFocus.current = false;
      }, 800);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, activeClasses]);

  // Sync scroll on keyboard nav
  React.useEffect(() => {
    if (isKeyboardNav.current) {
      cardRefs.current[focusedIndex]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: window.innerWidth < 768 ? 'center' : 'nearest' 
      });
      isKeyboardNav.current = false;
    }
  }, [focusedIndex]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] as any }
    },
    focused: {
      y: -8,
      scale: 1.02,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="w-full flex flex-col h-full overflow-y-auto px-4 pb-20 custom-scrollbar snap-y snap-mandatory md:snap-none"
    >
      <div className="flex justify-between items-center mb-8 shrink-0 pt-4">
        <button 
          onClick={() => useGameStore.setState({ gameState: 'START' })}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-700 transition-all active:scale-95"
        >
          ◀ Menu
        </button>
        <div className="text-center flex-grow">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-1 font-serif tracking-tighter uppercase">Choose Your Hero</h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Select a class to begin your descent</p>
        </div>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full pb-8"
      >
        {activeClasses.map((hero, idx) => (
          <motion.button 
            key={hero.id}
            ref={el => cardRefs.current[idx] = el}
            variants={itemVariants}
            animate={focusedIndex === idx ? "focused" : "visible"}
            whileHover="focused"
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(hero)}
            onMouseEnter={() => {
              // Only trigger hover on mouse devices, and only if not blocked by keyboard
              if (!blockScrollFocus.current && window.matchMedia('(hover: hover)').matches) {
                setFocusedIndex(idx);
              }
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSelect(hero); }}
            className={clsx(
              "group relative bg-slate-900 border rounded-3xl p-6 text-left flex flex-col justify-between h-48 md:h-56 overflow-hidden outline-none snap-center md:snap-align-none",
              focusedIndex === idx 
                ? "border-rose-500 shadow-2xl shadow-rose-500/20" 
                : "border-slate-800 hover:border-slate-700"
            )}
          >
            {/* Ghostly Background Icon */}
            <motion.div 
              initial={{ opacity: 0.1, filter: 'blur(4px) grayscale(1)' }}
              animate={{ 
                opacity: focusedIndex === idx ? 0.35 : 0.15,
                filter: focusedIndex === idx ? 'blur(0px) grayscale(0)' : 'blur(4px) grayscale(1)',
                rotate: focusedIndex === idx ? 6 : 12,
                scale: focusedIndex === idx ? 1.1 : 1
              }}
              transition={{ duration: 0.4 }}
              className="absolute -top-8 -right-8 pointer-events-none"
            >
              <Emoji char={hero.icon} assetKey={hero.name} active={focusedIndex === idx} className="w-48 h-48" />
            </motion.div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <Emoji char={hero.icon} assetKey={hero.name} active={focusedIndex === idx} className="w-14 h-14" />
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">{hero.name}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {hero.desc}
              </p>
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Initial Ability</span>
                <span className="text-[10px] text-indigo-400 font-bold uppercase">{hero.ability.name}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">D20 Mod</span>
                <span className={clsx("text-xs font-mono font-black", hero.d20Mod >= 0 ? "text-emerald-400" : "text-rose-500")}>
                  {hero.d20Mod >= 0 ? `+${hero.d20Mod}` : hero.d20Mod}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default ClassSelection;
