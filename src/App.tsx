import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';

import BackgroundParticles from './components/BackgroundParticles';
import BrowserWarning from './components/BrowserWarning';
import ChallengeBanner from './components/ChallengeBanner';
import ClassSelection from './components/ClassSelection';
import ConfirmationModal from './components/ConfirmationModal';
import { Counter } from './components/Counter';
import DevPanel from './components/DevPanel';
import DiceModal from './components/DiceModal';
import { Emoji } from './components/Emoji';
import ForgeModal from './components/ForgeModal';
import FXRenderer from './components/FXRenderer';
import GodModeAuthModal from './components/GodModeAuthModal';
import Grid from './components/Grid';
import GrimoireModal from './components/GrimoireModal';
import HelpModal from './components/HelpModal';
import IOSInstallModal from './components/IOSInstallModalFix';
import LeaderboardModal from './components/LeaderboardModal';
import { MobileInventoryModal, MobileLogsModal } from './components/MobileModals';
import Preloader from './components/Preloader';
import RunStatsModal from './components/RunStatsModal';
import SettingsModal from './components/SettingsModal';
import ShareModal from './components/ShareModal';
import SpellModal from './components/SpellModal';
import Tavern from './components/Tavern';
import { SFX } from './engine/audio';
import { useGameStore } from './engine/gameStore';
import { Native } from './engine/native';
import { PackEngine } from './engine/packEngine';
import { useRegistry } from './engine/registryHub';
import type { Tile } from './types/game';
import type { PackData } from './types/pack';

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
    score,
    setGameState,
    castSpell,
    forfeitRun,
    showConfirm,
    settings,
    hasSave,
    loadGame,
    toggleDevMode,
    activeEncounters,
  } = useGameStore();

  const settingsVolume = settings.musicVolume;

  const [forgeData, setForgeData] = React.useState<PackData | null>(null);
  const [showShare, setShowShare] = React.useState(false);
  const [showMobileInventory, setShowMobileInventory] = React.useState(false);
  const [showMobileLogs, setShowMobileLogs] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<{
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [lastBackPress, setLastBackPress] = React.useState(0);
  const [showExitToast, setShowExitToast] = React.useState(false);
  const [showIOSInstall, setShowIOSInstall] = React.useState(false);
  const [isHUDHovered, setIsHUDHovered] = React.useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [showGodModeAuth, setShowGodModeAuth] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Derived routing state (avoids cascading render warnings)
  const showGrimoire = location.pathname.startsWith('/grimoire');
  const showForge = location.pathname.startsWith('/forge');
  const showLeaderboard = location.pathname.startsWith('/leaderboard');
  const showHelp = location.pathname.startsWith('/help');
  const showSettings = location.pathname.startsWith('/settings');

  const handleStart = React.useCallback(() => {
    Native.vibrate(50);
    SFX.dungeonEnter();
    setGameState('CLASS_SELECT');
  }, [setGameState]);

  const handleHoldStart = () => {
    holdTimer.current = setTimeout(() => {
      setShowGodModeAuth(true);
    }, 3000);
  };

  const handleHoldEnd = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  // Secret Handshake: Console Activation
  useEffect(() => {
    (window as unknown as { ACTIVATE_GOD_MODE?: () => string }).ACTIVATE_GOD_MODE = () => {
      setShowGodModeAuth(true);
      return 'INITIALIZING SECURITY PROTOCOL...';
    };
    return () => {
      delete (window as unknown as { ACTIVATE_GOD_MODE?: () => string }).ACTIVATE_GOD_MODE;
    };
  }, [toggleDevMode]);

  // Read HUD danger thresholds from registry (Mod Priority 0 — no hardcoded numbers)
  const uiDefs = useRegistry((s) => s.uiDefs);
  const hudDefs = uiDefs?.hud;
  const slideDanger = hudDefs?.slideDangerThreshold ?? 3;
  const slideCritical = hudDefs?.slideCriticalThreshold ?? 1;
  const multHigh = hudDefs?.multiplierHighThreshold ?? 3.0;
  const multRage = hudDefs?.multiplierRageThreshold ?? 5.0;
  const hpNearDeath = hudDefs?.hpNearDeathPercent ?? 0.2;

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(_r: ServiceWorkerRegistration | undefined) {
      // console.warn('SW Registered: ', _r);
    },
    onRegisterError(error: Error) {
      console.error('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      showConfirm(
        'Update Available',
        'A new version of Crit 2048 is ready. Refresh now to get the latest features and fixes?',
        () => updateServiceWorker(true),
        () => setNeedRefresh(false),
      );
    }
  }, [needRefresh, setNeedRefresh, showConfirm, updateServiceWorker]);

  // Sync Audio Volume & Start on Interaction
  useEffect(() => {
    const startAudio = () => {
      SFX.init();
      SFX.startMusic();
    };

    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('keydown', startAudio, { once: true });

    SFX.setMusicVolume(settings.musicVolume);
    SFX.setSfxVolume(settings.sfxVolume);
    SFX.setMusicMode(
      gameState,
      encounterIdx,
      activeEncounters?.length || 1,
      monsterHp,
      monsterMaxHp,
    );
    SFX.updateTension(multiplier);

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
  }, [
    settings.musicVolume,
    settings.sfxVolume,
    gameState,
    encounterIdx,
    activeEncounters?.length,
    monsterHp,
    monsterMaxHp,
    multiplier,
  ]);

  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        SFX.btnClick();
      }
    };
    window.addEventListener('click', handleButtonClick);
    return () => window.removeEventListener('click', handleButtonClick);
  }, []);

  const isRegistryReady = useRegistry((state) => state.isReady);

  const isDevMode = useGameStore((s) => s.isDevMode);
  useEffect(() => {
    if (isDevMode) {
      (window as unknown as { G_STORE: unknown }).G_STORE = useGameStore.getState();
      (window as unknown as { G_REGISTRY: unknown }).G_REGISTRY = useRegistry.getState();
    }
  }, [isDevMode]);

  useEffect(() => {
    useGameStore.getState().initializeRegistry();
    useGameStore.getState().checkSave();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    Native.requestWakeLock();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
        return;

      if (e.key === 'Enter' && gameState === 'START') {
        handleStart();
      }
      if (gameState === 'PLAYING') {
        if (e.key.toLowerCase() === 'c') castSpell();
      }
      if (e.key.toLowerCase() === 's') navigate('/settings');
      if (e.key.toLowerCase() === 'g') navigate('/grimoire');
      if (e.key.toLowerCase() === 'f') navigate('/forge');
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      Native.releaseWakeLock();
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [gameState, castSpell, handleStart, navigate]);

  useEffect(() => {
    // Intercept back button for PWAs/TWAs
    window.history.pushState(null, '', window.location.pathname + window.location.search);

    const handlePopState = (_e: PopStateEvent) => {
      // Re-push state to keep intercepting
      window.history.pushState(null, '', window.location.pathname + window.location.search);

      if (gameState !== 'START') {
        // Abandon run
        showConfirm(
          'Abandon Run?',
          'Are you sure you want to end this run and view your progress?',
          forfeitRun,
        );
      } else {
        // Home screen exit logic
        const now = Date.now();
        if (now - lastBackPress < 2000) {
          // Double press -> Exit Modal
          showConfirm('Exit App?', 'Are you sure you want to exit Crit 2048?', () => {
            if ((window as unknown as { AndroidNative?: { exitApp: () => void } }).AndroidNative) {
              (
                window as unknown as { AndroidNative: { exitApp: () => void } }
              ).AndroidNative.exitApp();
            } else {
              window.close();
            }
          });
        } else {
          // First press -> Toast
          setLastBackPress(now);
          setShowExitToast(true);
          setTimeout(() => setShowExitToast(false), 2000);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [gameState, lastBackPress, forfeitRun, showConfirm]);

  useEffect(() => {
    if (showForge) SFX.forgeEnter();
  }, [showForge]);

  useEffect(() => {
    if (showGrimoire) SFX.grimoireEnter();
  }, [showGrimoire]);

  const closeModals = () => {
    navigate('/');
  };

  return (
    <div className="bg-[var(--pack-bg)] text-slate-100 font-sans selection:bg-[var(--pack-primary)] flex flex-col h-dvh w-dvw overflow-hidden select-none safe-top safe-bottom">
      <AnimatePresence>
        {(isLoading || !isRegistryReady) && (
          <Preloader key="preloader" onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>
      <FXRenderer />
      <DevPanel />
      <ChallengeBanner />
      <AnimatePresence>
        {showGodModeAuth && <GodModeAuthModal onClose={() => setShowGodModeAuth(false)} />}
      </AnimatePresence>
      <div className="hidden">
        {/* Game Logs Container */}
        {logs.map((log: string, i: number) => (
          <div key={i}>{log}</div>
        ))}
      </div>
      {useGameStore.getState().settings.particles && <BackgroundParticles />}
      <BrowserWarning />
      {/* HEADER */}
      <header className="bg-[var(--pack-surface)] border-b border-white/10 flex justify-between items-center shrink-0 relative z-40 px-4 h-14 md:h-16">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="popLayout">
            {gameState !== 'START' && (
              <motion.h1
                layoutId="main-branding"
                transition={{
                  type: 'spring',
                  stiffness: 120,
                  damping: 20,
                  mass: 1,
                }}
                onClick={() => {
                  showConfirm(
                    'Abandon Run?',
                    'Are you sure you want to end this run and view your progress?',
                    forfeitRun,
                  );
                }}
                onMouseEnter={() => setIsTitleHovered(true)}
                onMouseLeave={() => setIsTitleHovered(false)}
                className="text-lg md:text-2xl font-black tracking-wider flex items-center gap-2 font-serif cursor-pointer hover:opacity-80 transition-all origin-left"
              >
                <Emoji
                  char="🐉"
                  assetKey="TitleIcon"
                  className="w-6 h-6 md:w-8 md:h-8"
                  active={isTitleHovered}
                />
                <span className="text-white">CRIT</span> <span className="text-rose-500">2048</span>
              </motion.h1>
            )}
          </AnimatePresence>
          {gameState !== 'START' && (
            <span className="bg-slate-800 text-slate-300 text-[10px] md:text-xs font-bold px-2 py-1 rounded-md ml-2 uppercase tracking-widest">
              Ante {encounterIdx + 1}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {gameState !== 'START' && (
            <>
              <div className="flex gap-2 md:gap-4 text-xs md:text-base font-black text-amber-400">
                <span
                  id="hud-gold"
                  className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm"
                >
                  💰{' '}
                  <motion.span
                    key={gold}
                    initial={{ y: -10, opacity: 0, scale: 1.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    className="font-mono"
                  >
                    <Counter value={gold} className="font-mono" />
                  </motion.span>
                </span>
                <span
                  id="hud-multiplier"
                  className={clsx(
                    'flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm',
                    multiplier >= multRage
                      ? 'border-amber-500/50'
                      : multiplier >= multHigh
                        ? 'border-amber-500/20'
                        : '',
                  )}
                >
                  ⚔️{' '}
                  <motion.span
                    key={multiplier}
                    initial={{ scale: 1.5, filter: 'brightness(2)' }}
                    animate={{ scale: 1, filter: 'brightness(1)' }}
                    className={clsx(
                      'font-mono',
                      multiplier >= multRage
                        ? 'mult-rage'
                        : multiplier >= multHigh
                          ? 'mult-high'
                          : 'text-rose-400',
                    )}
                  >
                    <Counter value={multiplier} decimals={1} className="font-mono" />
                  </motion.span>
                </span>
              </div>

              <button
                onClick={() => {
                  showConfirm(
                    'Abandon Run?',
                    'Are you sure you want to end this run and view your progress?',
                    forfeitRun,
                  );
                }}
                className="text-slate-400 hover:text-white transition-colors text-xl md:text-2xl active:scale-95 group"
                title="Forfeit & Return Home"
              >
                <Emoji
                  char="🏠"
                  assetKey="Home"
                  className="w-6 h-6 md:w-8 md:h-8 group-hover:animate-bounce-subtle"
                />
              </button>
            </>
          )}

          {/* Grimoire and Forge: Only when NOT playing/rolling/etc. */}
          {(gameState === 'START' || gameState === 'CLASS_SELECT') && (
            <>
              <Link
                to="/grimoire"
                className="text-slate-400 hover:text-white transition-colors text-xl md:text-2xl active:scale-95 group"
                title="Grimoire"
              >
                <Emoji
                  char="📜"
                  assetKey="Grimoire"
                  active={showGrimoire}
                  animateType="bounce"
                  className="w-6 h-6 md:w-8 md:h-8 group-hover:animate-bounce-subtle"
                />
              </Link>
              <Link
                to="/forge"
                onClick={() => setForgeData(null)}
                className="text-slate-400 hover:text-white transition-colors text-xl md:text-2xl active:scale-95 group"
                title="Forge"
              >
                <Emoji
                  char="⚒️"
                  assetKey="Forge"
                  active={showForge}
                  animateType="bounce"
                  className="w-6 h-6 md:w-8 md:h-8 group-hover:animate-bounce-subtle"
                />
              </Link>
            </>
          )}

          <Link
            to="/help"
            className="text-slate-400 hover:text-white transition-colors text-xl md:text-2xl active:scale-95 group"
            title="Help"
          >
            <Emoji
              char="❓"
              active={showHelp}
              animateType="bounce"
              className="w-6 h-6 md:w-8 md:h-8 group-hover:animate-bounce-subtle"
            />
          </Link>

          <Link
            to="/settings"
            className="text-slate-400 hover:text-white transition-colors text-xl active:scale-95 group"
            title="Settings"
          >
            <Emoji
              char="⚙️"
              active={showSettings}
              animateType="spin"
              className="w-6 h-6 md:w-8 md:h-8 group-hover:animate-gear-spin"
            />
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow flex flex-col items-center relative min-h-0 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {/* START SCREEN */}
          {gameState === 'START' && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="text-center max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center h-full overflow-y-auto px-6 pt-24 md:pt-32 pb-12"
            >
              <motion.div
                layoutId="main-branding"
                transition={{
                  type: 'spring',
                  stiffness: 120,
                  damping: 20,
                  mass: 1,
                }}
                onMouseEnter={() => setIsTitleHovered(true)}
                onMouseLeave={() => setIsTitleHovered(false)}
                className="group cursor-default flex flex-col items-center mb-16 md:mb-20"
              >
                <h2 className="text-[9.5vw] md:text-[6rem] font-black text-white mb-6 tracking-tighter font-serif flex flex-row items-center justify-center gap-3 md:gap-8 leading-none w-full">
                  <div
                    onPointerDown={handleHoldStart}
                    onPointerUp={handleHoldEnd}
                    onPointerLeave={handleHoldEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className="cursor-pointer active:scale-110 transition-transform duration-[3000ms] ease-linear select-none touch-none"
                  >
                    <Emoji
                      char="🐉"
                      assetKey="TitleIcon"
                      className="w-10 h-10 md:w-24 md:h-24"
                      active={isTitleHovered}
                    />
                  </div>
                  <span className="flex gap-[2vw] md:gap-6 whitespace-nowrap">
                    <span>CRIT</span> <span className="text-rose-500">2048</span>
                  </span>
                </h2>
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest md:tracking-[0.5em] opacity-80 mt-4 md:mt-0 px-6 text-center max-w-xs md:max-w-none">
                  A D&D inspired 2048 roguelike dungeon-crawler
                </p>
              </motion.div>

              {/* Cinematic Centerpiece */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 1, delay: 0.6 }}
                onClick={() => {
                  Native.vibrate(20);
                  navigate('/help');
                }}
                className="flex-grow flex flex-col items-center justify-center relative w-full py-12 cursor-help md:hidden group"
              >
                {/* Rotating Magic Circle */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-[75vw] h-[75vw] border-2 border-rose-500/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(225,29,72,0.1)]"
                >
                  <div className="absolute inset-1 border border-rose-500/10 rounded-full border-dashed" />
                  <div className="absolute inset-4 border border-rose-500/10 rounded-full" />
                  <div className="absolute inset-10 border border-rose-500/20 rounded-full" />
                  <div className="absolute inset-16 border border-rose-500/5 rounded-full border-dashed" />

                  {/* Arcane Lines */}
                  <div className="absolute w-full h-[1px] bg-rose-500/20 rotate-45" />
                  <div className="absolute w-full h-[1px] bg-rose-500/20 -rotate-45" />
                  <div className="absolute w-full h-[1px] bg-rose-500/20 rotate-90" />
                  <div className="absolute w-full h-[1px] bg-rose-500/20" />
                  <div className="absolute w-full h-[1px] bg-rose-500/10 rotate-[22.5deg]" />
                  <div className="absolute w-full h-[1px] bg-rose-500/10 rotate-[67.5deg]" />
                </motion.div>

                {/* Lore Text */}
                <div className="relative z-10 text-center px-12 transition-all group-active:scale-95">
                  <div className="w-12 h-[1px] bg-rose-500/50 mx-auto mb-6 shadow-[0_0_10px_rgba(225,29,72,0.5)]" />
                  <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.6em] mb-3 drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]">
                    Ancient Prophecy
                  </p>
                  <p className="text-slate-300 text-xs italic leading-relaxed max-w-[220px] mx-auto font-serif">
                    "Where the sword meets the soul, the dungeon's heart shall break."
                  </p>
                  <p className="text-rose-500/40 text-[8px] font-black uppercase tracking-widest mt-6 animate-pulse underline underline-offset-4">
                    Read the Compendium
                  </p>
                  <div className="w-12 h-[1px] bg-rose-500/50 mx-auto mt-6 shadow-[0_0_10px_rgba(225,29,72,0.5)]" />
                </div>
              </motion.div>

              <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-auto md:mt-0 pb-10 md:pb-0">
                <motion.button
                  onClick={handleStart}
                  whileHover={{ scale: 1.05, filter: 'brightness(1.15)' }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(225,29,72,0.3), inset 0 0 10px rgba(225,29,72,0.2)',
                      '0 0 60px rgba(225,29,72,0.8), inset 0 0 20px rgba(225,29,72,0.4)',
                      '0 0 20px rgba(225,29,72,0.3), inset 0 0 10px rgba(225,29,72,0.2)',
                    ],
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="w-full px-8 py-5 md:px-10 md:py-7 bg-gradient-to-br from-rose-600 to-rose-800 text-white font-black rounded-3xl shadow-2xl transition-all text-xl md:text-2xl uppercase tracking-[0.2em] border border-rose-400/50 relative overflow-hidden group z-20"
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  />

                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <span>Enter the Dungeon</span>
                  </span>

                  {/* Fiery Embers */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.2, 0],
                        y: [-10, -60 - i * 5],
                        x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 2)],
                      }}
                      transition={{
                        duration: 1.5 + i * 0.2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: 'easeOut',
                      }}
                      className="absolute w-1 h-1 bg-orange-400 rounded-full blur-[1px] pointer-events-none z-0"
                      style={{
                        left: `${20 + i * 10}%`,
                        bottom: '10%',
                      }}
                    />
                  ))}
                </motion.button>

                {hasSave && (
                  <button
                    onClick={() => {
                      Native.vibrate(50);
                      SFX.dungeonEnter();
                      loadGame();
                    }}
                    className="w-full px-8 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all text-base uppercase tracking-widest border border-slate-700 active:scale-95 shadow-lg"
                  >
                    Resume Quest
                  </button>
                )}

                {deferredPrompt && (
                  <button
                    onClick={handleInstall}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>📥</span> Install App for Offline Play
                  </button>
                )}

                {Native.isIOS() && !Native.isStandalone() && (
                  <button
                    onClick={() => setShowIOSInstall(true)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>📱</span> Install on iPhone / iPad
                  </button>
                )}

                <Link
                  to="/leaderboard"
                  className="w-full py-2 text-slate-500 hover:text-slate-300 transition-colors text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-1 text-center"
                >
                  🏆 Hall of Heroes
                </Link>
              </div>
            </motion.div>
          )}

          {/* CLASS SELECTION */}
          {gameState === 'CLASS_SELECT' && (
            <motion.div
              key="class-select"
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="w-full h-full"
            >
              <ClassSelection />
            </motion.div>
          )}

          {/* PLAYING SCREEN */}
          {gameState === 'PLAYING' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full max-w-4xl relative z-10 flex-1 min-h-0 justify-evenly px-4 py-2"
            >
              {/* HUD */}
              <div
                id="playing-hud"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2 md:p-3 mb-2 md:mb-4 relative overflow-hidden flex flex-col gap-1 shrink-0 shadow-lg"
              >
                <div className="absolute inset-0 bg-slate-800/50 w-full z-0">
                  <motion.div
                    initial={false}
                    animate={{ width: `${(monsterHp / monsterMaxHp) * 100}%` }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className={clsx(
                      'h-full bg-rose-600/80',
                      monsterMaxHp > 0 && monsterHp / monsterMaxHp < hpNearDeath && 'hp-near-death',
                    )}
                  />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div id="hud-boss" className="flex items-center gap-2 md:gap-3">
                    <span className="text-xl md:text-2xl bg-slate-950 p-1.5 md:p-2 rounded-xl border border-slate-800">
                      {useGameStore.getState().activeEncounters?.[encounterIdx]?.icon ||
                        (encounterIdx === 0
                          ? '👺'
                          : encounterIdx === 1
                            ? '👹'
                            : encounterIdx === 2
                              ? '🟢'
                              : '🐉')}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm md:text-lg text-white tracking-wider">
                          {useGameStore.getState().activeEncounters?.[encounterIdx]?.name ||
                            'Unknown Entity'}
                        </h3>
                        {useGameStore.getState().grid.some((t: Tile | null) => t?.val === -3) && (
                          <span
                            className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded animate-pulse"
                            title="Skeleton blocking merges"
                          >
                            💀
                          </span>
                        )}
                        {useGameStore.getState().grid.some((t: Tile | null) => t?.val === -2) && (
                          <span
                            className="text-[10px] bg-amber-900/50 text-amber-500 px-1 rounded animate-pulse"
                            title="Goblin stealing gold"
                          >
                            💰
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] md:text-xs font-mono text-rose-200 leading-none">
                        HP: {Math.ceil(monsterHp)} / {monsterMaxHp}
                      </p>
                      <div className="mt-2 flex">
                        <div className="bg-slate-950/80 border border-amber-500/30 rounded px-2 py-0.5 flex items-center gap-1.5 shadow-sm">
                          <span className="text-[7px] font-black text-amber-500 uppercase tracking-tighter">
                            Power:
                          </span>
                          <span className="text-[8px] md:text-[9px] font-bold text-amber-100 uppercase tracking-widest italic">
                            {useGameStore.getState().activeEncounters?.[encounterIdx]?.lore ||
                              'None'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        Score
                      </p>
                      <p className="text-xl md:text-2xl font-black font-mono text-amber-500 leading-none">
                        {score}
                      </p>
                    </div>
                    <div className="text-right border-l border-slate-700 pl-4">
                      <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        Slides
                      </p>
                      <motion.p
                        id="hud-slides"
                        key={slidesLeft}
                        initial={{ scale: 1.8, color: '#f43f5e' }}
                        animate={{ scale: 1, color: 'inherit' }}
                        className={clsx(
                          'text-xl md:text-3xl font-black font-mono leading-none',
                          slidesLeft <= slideCritical
                            ? 'slide-critical'
                            : slidesLeft <= slideDanger
                              ? 'slide-danger'
                              : 'text-white',
                        )}
                      >
                        <Counter value={slidesLeft} className="font-mono" />
                      </motion.p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row gap-4 items-stretch w-full justify-center min-h-0 flex-1">
                {/* Left Sidebar (Desktop) */}
                <div className="hidden md:flex flex-col gap-2 w-48 lg:w-56 shrink-0 min-h-0">
                  <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold shrink-0">
                    Inventory
                  </h4>
                  <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                    {artifacts.length === 0 ? (
                      <div className="text-[10px] text-slate-600 italic">No artifacts yet...</div>
                    ) : (
                      artifacts.map(
                        (
                          art: { icon: string; name: string; level: number; id: string },
                          idx: number,
                        ) => (
                          <div
                            key={idx}
                            className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center gap-3"
                          >
                            <span className="text-xl">{art.icon}</span>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-white truncate uppercase">
                                {art.name}
                              </p>
                              <p className="text-[8px] text-slate-500 font-mono">LVL {art.level}</p>
                              <p className="text-[7px] text-slate-400 italic line-clamp-2 mt-0.5 leading-tight">
                                {PackEngine.formatDesc(
                                  useGameStore
                                    .getState()
                                    .activeArtifacts.find(
                                      (a: { id: string; desc?: string }) => a.id === art.id,
                                    )?.desc || '',
                                  useGameStore
                                    .getState()
                                    .activeArtifacts.find((a: { id: string }) => a.id === art.id),
                                  art.level,
                                )}
                              </p>
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </div>

                {/* Grid */}
                <Grid />

                {/* Right Sidebar (Desktop) */}
                <div className="hidden md:flex flex-col gap-4 w-48 lg:w-56 shrink-0 min-h-0">
                  <motion.div
                    initial="initial"
                    animate="animate"
                    whileHover="panelHover"
                    onMouseEnter={() => setIsHUDHovered(true)}
                    onMouseLeave={() => setIsHUDHovered(false)}
                    className="bg-slate-900/90 p-6 rounded-[2rem] border border-slate-700/50 text-center shadow-2xl relative overflow-hidden shrink-0 backdrop-blur-xl group cursor-default"
                  >
                    <motion.div
                      variants={{ panelHover: { y: -5 } }}
                      className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"
                    />

                    {/* Ghostly Background Icon */}
                    <motion.div
                      variants={{
                        initial: { opacity: 0.05, rotate: 12, scale: 1, filter: 'blur(4px)' },
                        animate: { opacity: 0.15, rotate: 6, filter: 'blur(2px)' },
                        panelHover: { scale: 1.3, opacity: 0.35, rotate: 0, filter: 'blur(0px)' },
                      }}
                      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                      className="absolute -top-6 -right-6 pointer-events-none select-none z-0 transition-opacity"
                    >
                      <span className="text-9xl grayscale opacity-40">
                        {playerClass?.icon || '⚔️'}
                      </span>
                    </motion.div>

                    <motion.div
                      variants={{
                        initial: { scale: 0.8, opacity: 0 },
                        animate: { scale: 1, opacity: 1 },
                        panelHover: { scale: 1.15, rotate: 5 },
                      }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                      className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto mb-4 flex items-center justify-center text-5xl shadow-inner border border-slate-700 relative z-10 transition-transform duration-500"
                    >
                      <Emoji
                        char={playerClass?.icon || '⚔️'}
                        assetKey={playerClass?.name}
                        active={isHUDHovered}
                        className="w-12 h-12"
                      />
                    </motion.div>

                    <div className="relative z-10">
                      <h3 className="font-black text-lg text-white uppercase tracking-tighter italic font-serif leading-none">
                        {playerClass?.name || 'Hero'}
                      </h3>
                      <div className="flex items-center justify-center gap-1 mt-2 mb-4">
                        <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-blue-500/20">
                          Active Spell
                        </span>
                      </div>

                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 mb-4 space-y-1">
                        <p className="text-[10px] text-white font-bold uppercase tracking-widest truncate">
                          {playerClass?.ability?.name || 'None'}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex gap-0.5">
                            {Array(playerClass?.ability?.maxUses || 0)
                              .fill(0)
                              .map((_, i) => (
                                <div
                                  key={i}
                                  className={clsx(
                                    'w-1.5 h-1.5 rounded-full transition-colors duration-500',
                                    i < usesLeft
                                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                      : 'bg-slate-800',
                                  )}
                                />
                              ))}
                          </div>
                          <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">
                            {usesLeft} Left
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={
                          usesLeft > 0
                            ? {
                                scale: 1.05,
                                backgroundColor: '#3b82f6',
                                boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)',
                                textShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
                              }
                            : {}
                        }
                        whileTap={usesLeft > 0 ? { scale: 0.95 } : {}}
                        onClick={castSpell}
                        disabled={usesLeft <= 0}
                        className="w-full py-3.5 rounded-xl text-xs font-black transition-all bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-xl uppercase tracking-widest border border-blue-400/30 flex items-center justify-center gap-2"
                      >
                        <span>✨</span>
                        <span>Cast</span>
                      </motion.button>
                    </div>
                  </motion.div>

                  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-2 text-[10px] text-slate-400 font-mono flex-1 overflow-y-auto custom-scrollbar flex flex-col-reverse">
                    {logs.map((log: string, i: number) => (
                      <div key={i} className="py-0.5 border-b border-slate-800/50">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:hidden flex w-full gap-2 mt-2 shrink-0 pb-[env(safe-area-inset-bottom)] px-4 mb-2">
                <div className="bg-slate-900 p-2 rounded-2xl border border-slate-700/50 flex items-center justify-center gap-2 w-full shadow-2xl h-20 backdrop-blur-md">
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
                      <span className="font-mono text-sm">
                        {usesLeft}/{playerClass?.ability?.maxUses || 0}
                      </span>
                    </span>
                    <span className="text-[8px] opacity-80">
                      CAST {playerClass?.ability?.name?.toUpperCase()}
                    </span>
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
            </motion.div>
          )}

          {gameState === 'TAVERN' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full pull-up"
            >
              <Tavern />
            </motion.div>
          )}

          {gameState === 'DICE' && <DiceModal />}

          {gameState === 'SPELL' && <SpellModal />}
        </AnimatePresence>

        {/* MODALS */}
        <AnimatePresence>
          {showSettings && <SettingsModal onClose={closeModals} />}
          {showGrimoire && (
            <GrimoireModal
              onClose={closeModals}
              onEditPack={(p) => {
                setForgeData(p);
                navigate('/forge');
              }}
            />
          )}
          {showForge && (
            <ForgeModal
              initialData={forgeData}
              onClose={() => {
                setForgeData(null);
                closeModals();
              }}
            />
          )}
          {showLeaderboard && <LeaderboardModal onClose={closeModals} />}
          {showHelp && <HelpModal onClose={closeModals} />}
          {showShare && <ShareModal onClose={() => setShowShare(false)} />}
          {showIOSInstall && <IOSInstallModal onClose={() => setShowIOSInstall(false)} />}
          {showMobileInventory && (
            <MobileInventoryModal onClose={() => setShowMobileInventory(false)} />
          )}
          {showMobileLogs && <MobileLogsModal onClose={() => setShowMobileLogs(false)} />}
        </AnimatePresence>
        <ConfirmationModal />

        {(gameState === 'GAME_OVER' || gameState === 'VICTORY') && (
          <RunStatsModal
            onShowLeaderboard={() => navigate('/leaderboard')}
            onShowShare={() => setShowShare(true)}
          />
        )}

        {/* ENEMY DEFEATED SPLASH (LEGACY RESTORED) */}
        {useGameStore(
          (s) => s.isTransitioning && s.monsterHp <= 0 && s.gameState === 'PLAYING',
        ) && (
          <div className="fx-announcement">
            <h2 className="text-4xl md:text-7xl">
              {encounterIdx === 0
                ? 'Goblin Scout'
                : encounterIdx === 1
                  ? 'Orc Brute'
                  : encounterIdx === 2
                    ? 'Slime King'
                    : 'The Boss'}
            </h2>
            <p className="text-2xl md:text-4xl mt-2">Defeated!</p>
          </div>
        )}

        {/* LOADING SCREEN (Ante Transition) */}
        {useGameStore(
          (s) => s.isTransitioning && (s.monsterHp > 0 || s.gameState === 'TAVERN'),
        ) && (
          <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950 animate-in fade-in duration-300">
            <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(225,29,72,0.3)]" />
            <h2 className="text-2xl font-black text-white font-serif uppercase tracking-[0.5em] animate-pulse">
              Descending...
            </h2>
            <div className="w-64 mt-6 bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-800">
              <div className="descend-bar" />
            </div>
            <p className="text-slate-500 text-[10px] uppercase font-bold mt-4">
              Ante {encounterIdx + 1}
            </p>
          </div>
        )}

        {/* Exit Toast */}
        {showExitToast && (
          <div
            className="fixed left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 px-6 py-3 rounded-2xl text-xs font-black text-white uppercase tracking-widest animate-in slide-in-from-bottom-4 fade-in duration-300 z-[300] shadow-2xl backdrop-blur-md"
            style={{ bottom: 'calc(env(safe-area-inset-bottom) + 2.5rem)' }}
          >
            Press back again to exit
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
