/**
 * FXRenderer.tsx
 * 
 * Central visual effects renderer for Crit 2048.
 * 
 * PRESETS (use via G.triggerFX('preset_name', params)):
 * 
 * Global (screen-level) presets — no x/y coords:
 *   'stomp'    — Full-screen slam (enemy attack, boss ability)
 *   'flash'    — Full-screen color flash (white/red/gold)
 *   'announce' — Center-screen text banner
 * 
 * Targeted presets — use targetId: 'hud-gold' | 'hud-slides' | 'hud-multiplier':
 *   'float'    — Icon floats up from a HUD element (Ring of Wealth, Boots of Haste)
 *   'pop'      — Icon pops on a HUD element (Giant Potion)
 * 
 * Grid-local presets — use x, y (0–100 percent within grid):
 *   'aoe'      — Radial shockwave ring from a tile
 *   'lightning'— Bolt strike from above onto a tile
 *   'arrow'    — Directional arrow flies across
 *   'smite'    — Holy pillar of light on a tile
 *   'curse'    — Dark swirl on a tile
 *   'heal'     — Green sparkles rising from a tile
 *   'poison'   — Purple drip on a tile
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../engine/gameStore';
import { useRegistry } from '../engine/registryHub';

type FXEntry = { id: string; name: string; params?: any };

// ─── Preset Components ─────────────────────────────────────────────────────────

/** Full-screen flash overlay */
const FlashFX: React.FC<{ color?: string }> = ({ color = 'white' }) => (
  <motion.div
    className="fixed inset-0 pointer-events-none z-[2000]"
    style={{ background: color }}
    initial={{ opacity: 0.7 }}
    animate={{ opacity: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
  />
);

/** Full-screen slam — icon drops in from above */
const StompFX: React.FC<{ icon: string; name?: string }> = ({ icon, name }) => (
  <div className="fixed inset-0 pointer-events-none z-[1500] flex flex-col items-center justify-center">
    <motion.div
      initial={{ scale: 4, opacity: 0, y: -120 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', damping: 8, stiffness: 180 }}
      className="text-[10rem] drop-shadow-[0_0_40px_rgba(255,255,255,0.6)] filter"
    >
      {icon}
    </motion.div>
    {name && (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', damping: 15 }}
        className="mt-4 bg-slate-900/95 border border-slate-600 px-6 py-2 rounded-full"
      >
        <span className="text-rose-400 font-black uppercase tracking-widest text-base">{name}</span>
      </motion.div>
    )}
  </div>
);

/** HUD-targeted float — icon floats up from element */
const FloatFX: React.FC<{ left: string; top: string; icon: string }> = ({ left, top, icon }) => (
  <motion.div
    className="fixed pointer-events-none z-[1200] text-4xl"
    style={{ left, top, transform: 'translate(-50%, -50%)' }}
    initial={{ opacity: 0, scale: 0.5, y: 0 }}
    animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.4, 1.2, 0.8], y: [-0, -20, -50, -90] }}
    transition={{ duration: 1.0, times: [0, 0.2, 0.7, 1], ease: 'easeOut' }}
  >
    {icon}
  </motion.div>
);

/** HUD-targeted pop — icon pops on element */
const PopFX: React.FC<{ left: string; top: string; icon: string }> = ({ left, top, icon }) => (
  <motion.div
    className="fixed pointer-events-none z-[1200] text-5xl"
    style={{ left, top, transform: 'translate(-50%, -50%)' }}
    initial={{ scale: 0, opacity: 0, rotate: -20 }}
    animate={{ scale: [0, 1.8, 1.3, 1.6, 0], opacity: [0, 1, 1, 1, 0], rotate: [- 20, 5, -5, 0, 0] }}
    transition={{ duration: 0.9, times: [0, 0.25, 0.5, 0.75, 1] }}
  >
    {icon}
  </motion.div>
);

/** Grid-local: Radial AoE shockwave ring */
const AoeFX: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = '#f43f5e' }) => (
  <div
    className="absolute pointer-events-none z-[60]"
    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
  >
    {[0, 0.1, 0.2].map((delay, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border-2"
        style={{ borderColor: color, inset: '-10px' }}
        initial={{ scale: 0.1, opacity: 0.9 }}
        animate={{ scale: 3.5 + i * 0.8, opacity: 0 }}
        transition={{ duration: 0.7 + i * 0.1, delay, ease: 'easeOut' }}
      />
    ))}
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ background: `radial-gradient(circle, ${color}60 0%, transparent 70%)` }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  </div>
);

/** Grid-local: Lightning bolt strike from above */
const LightningFX: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = '#facc15' }) => (
  <div
    className="absolute pointer-events-none z-[60]"
    style={{ left: `${x}%`, top: 0, transform: 'translateX(-50%)' }}
  >
    <motion.div
      className="w-2 origin-top"
      style={{
        background: `linear-gradient(to bottom, #fff, ${color}, ${color})`,
        boxShadow: `0 0 12px ${color}, 0 0 30px ${color}`,
        height: `${y}%`,
        filter: 'blur(0.5px)'
      }}
      initial={{ scaleY: 0, opacity: 1 }}
      animate={{ scaleY: [0, 1, 1, 0], opacity: [0.8, 1, 1, 0] }}
      transition={{ duration: 0.3, times: [0, 0.15, 0.7, 1], ease: 'easeIn' }}
    />
    {/* Impact bloom */}
    <motion.div
      className="absolute rounded-full"
      style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', background: `radial-gradient(circle, #fff 0%, ${color} 40%, transparent 70%)` }}
      initial={{ width: 0, height: 0, opacity: 1 }}
      animate={{ width: 80, height: 80, opacity: 0 }}
      transition={{ duration: 0.4, delay: 0.12 }}
    />
  </div>
);

/** Grid-local: Directional arrow / projectile */
const ProjectileFX: React.FC<{ x: number; y: number; dir?: string; icon?: string; color?: string }> = ({ x, y, dir = 'RIGHT', icon = '🏹', color }) => {
  const rotation = { LEFT: 180, RIGHT: 0, UP: -90, DOWN: 90 }[dir] ?? 0;
  const from = dir === 'LEFT' ? { x: 120 } : dir === 'RIGHT' ? { x: -120 } : dir === 'UP' ? { y: 120 } : { y: -120 };
  const to = { x: 0, y: 0 };
  return (
    <motion.div
      className="absolute pointer-events-none z-[60] text-3xl"
      style={{ 
        left: `${x}%`, 
        top: `${y}%`, 
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        color: color || 'inherit',
        textShadow: color ? `0 0 10px ${color}` : 'none'
      }}
      initial={{ ...from, opacity: 0, scale: 0.5 }}
      animate={{ ...to, opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.0, 0.7] }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {icon}
    </motion.div>
  );
};

/** Grid-local: Holy smite pillar */
const SmiteFX: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = '#fde047' }) => (
  <div
    className="absolute pointer-events-none z-[60]"
    style={{ left: `${x}%`, top: 0, transform: 'translateX(-50%)' }}
  >
    <motion.div
      style={{
        width: 40,
        height: `${y + 15}%`,
        background: `linear-gradient(to bottom, transparent, ${color}80, ${color}, #fff)`,
        boxShadow: `0 0 30px ${color}, 0 0 60px ${color}`,
        filter: 'blur(2px)',
      }}
      initial={{ opacity: 0, scaleX: 0.2 }}
      animate={{ opacity: [0, 1, 1, 0], scaleX: [0.2, 1, 1.2, 0.1] }}
      transition={{ duration: 0.6, times: [0, 0.1, 0.7, 1] }}
    />
    <AoeFX x={50} y={y + 15} color={color} />
  </div>
);

/** Grid-local: Swirl / Curse */
const SwirlFX: React.FC<{ x: number; y: number; color?: string; icon?: string }> = ({ x, y, color = '#a855f7', icon = '🌀' }) => (
  <motion.div
    className="absolute pointer-events-none z-[60] text-5xl"
    style={{ 
      left: `${x}%`, 
      top: `${y}%`, 
      transform: 'translate(-50%, -50%)',
      color: color || 'inherit',
      textShadow: color ? `0 0 15px ${color}` : 'none'
    }}
    initial={{ scale: 0, opacity: 0, rotate: 0 }}
    animate={{ scale: [0, 1.5, 1, 0], opacity: [0, 1, 0.8, 0], rotate: [0, -180, -360, -540] }}
    transition={{ duration: 0.8, ease: 'easeInOut' }}
  >
    {icon}
  </motion.div>
);

/** Grid-local: Heal sparkles */
const HealFX: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div className="absolute pointer-events-none z-[60]" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
    {['✨', '💚', '✨', '💚', '✨'].map((icon, i) => (
      <motion.span
        key={i}
        className="absolute text-xl"
        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
        animate={{
          x: Math.cos((i / 5) * Math.PI * 2) * 30,
          y: -40 - i * 12,
          opacity: [0, 1, 0],
          scale: [0, 1.2, 0]
        }}
        transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
      >
        {icon}
      </motion.span>
    ))}
  </div>
);

/** Grid-local: Poison drip */
const PoisonFX: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div className="absolute pointer-events-none z-[60]" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
    {['☠️', '💜', '☠️'].map((icon, i) => (
      <motion.span
        key={i}
        className="absolute text-xl"
        initial={{ y: 0, opacity: 0, scale: 0 }}
        animate={{ y: [0, 10, 30], opacity: [0, 1, 0], scale: [0, 1, 0.5] }}
        transition={{ duration: 0.8, delay: i * 0.12 }}
      >
        {icon}
      </motion.span>
    ))}
    <motion.div
      className="absolute rounded-full"
      style={{ width: 50, height: 50, background: 'radial-gradient(circle, #a855f760 0%, transparent 70%)', inset: -25 }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

// ─── Position Resolver ────────────────────────────────────────────────────────

function resolveTargetPosition(params: any): { left: string; top: string; found: boolean } {
  if (params?.targetId) {
    const el = document.getElementById(params.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      return {
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.top + rect.height / 2}px`,
        found: true,
      };
    }
  }
  return { left: '50%', top: '50%', found: false };
}

// ─── Grid-Local FX Renderer (inside Grid.tsx) ─────────────────────────────────
// This is exported and used inside Grid.tsx for x/y-based effects

export const GridFXLayer: React.FC<{ activeFX: FXEntry[] }> = ({ activeFX }) => {
  const gridFX = activeFX.filter(fx => fx.params?.x !== undefined && fx.params?.y !== undefined);
  return (
    <AnimatePresence>
      {gridFX.map(fx => {
        const { x, y } = fx.params;
        switch (fx.name) {
          case 'aoe':       return <AoeFX key={fx.id} x={x} y={y} color={fx.params.color} />;
          case 'lightning': return <LightningFX key={fx.id} x={x} y={y} color={fx.params.color} />;
          case 'arrow':
          case 'projectile': return <ProjectileFX key={fx.id} x={x} y={y} dir={fx.params.dir} icon={fx.params.icon} color={fx.params.color} />;
          case 'smite':     return <SmiteFX key={fx.id} x={x} y={y} color={fx.params.color} />;
          case 'swirl':
          case 'curse':     return <SwirlFX key={fx.id} x={x} y={y} color={fx.params.color} icon={fx.params.icon} />;
          case 'heal':      return <HealFX key={fx.id} x={x} y={y} />;
          case 'poison':    return <PoisonFX key={fx.id} x={x} y={y} />;
          case 'stomp':
          default:
            // Legacy icon drop on grid
            return (
              <motion.div
                key={fx.id}
                className="absolute pointer-events-none z-50 text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                initial={{ scale: 3, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 300 }}
              >
                {fx.params.icon || '✨'}
              </motion.div>
            );
        }
      })}
    </AnimatePresence>
  );
};

// ─── Global FX Renderer (replaces ArtifactTriggerOverlay) ────────────────────

const FXRenderer: React.FC = () => {
  const activeFX = useGameStore(s => s.activeFX);
  const artifacts = useRegistry(s => s.artifacts);

  // Only global/targeted FX (no x/y grid-local ones)
  const globalFX = activeFX.filter(fx => !( fx.params?.x !== undefined && fx.params?.y !== undefined));

  return (
    <AnimatePresence>
      {globalFX.map(fx => {
        const artifactDef = Object.values(artifacts).find((a: any) => a.id === fx.params?.artifactId);
        const icon = fx.params?.icon || (artifactDef as any)?.icon || '✨';

        // Flash — full-screen color wash
        if (fx.name === 'flash') {
          return <FlashFX key={fx.id} color={fx.params?.color} />;
        }

        // Stomp — full screen slam
        if (fx.name === 'stomp') {
          return <StompFX key={fx.id} icon={icon} name={fx.params?.name} />;
        }

        // Float / Pop — targeted to HUD element
        if (fx.name === 'float' || fx.name === 'pop') {
          const { left, top } = resolveTargetPosition(fx.params);
          if (fx.name === 'float') return <FloatFX key={fx.id} left={left} top={top} icon={icon} />;
          if (fx.name === 'pop')   return <PopFX   key={fx.id} left={left} top={top} icon={icon} />;
        }

        // Generic center screen — announce style
        return (
          <motion.div
            key={fx.id}
            className="fixed inset-0 pointer-events-none z-[1000] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1.5, opacity: 1, y: -80 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              className="text-8xl drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            >
              {icon}
            </motion.div>
            {fx.params?.name && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -60 }}
                className="bg-slate-900/90 border border-slate-700 px-4 py-1 rounded-full mt-4"
              >
                <span className="text-rose-400 font-black uppercase text-sm tracking-widest">{fx.params.name}</span>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};

export default FXRenderer;
