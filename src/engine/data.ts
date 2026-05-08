import { useRegistry } from './registryHub';

/**
 * DATA BRIDGE
 * This file now serves as a compatibility layer for the Registry Hub.
 * Hardcoded data has been migrated to engine_core/base_game/data/.
 */

export const getWEAPON_STATS = () => useRegistry.getState().arsenal;
export const getHAZARD_STATS = () => useRegistry.getState().hazards;
export const getCLASSES = () => Object.values(useRegistry.getState().heroes);
export const getENEMIES = () => Object.values(useRegistry.getState().monsters);
export const getMASTER_ARTIFACTS = () => Object.values(useRegistry.getState().artifacts);

// Compatibility Proxies (to avoid breaking existing imports)
export const WEAPON_STATS: any = new Proxy({}, {
  get: (_, prop) => useRegistry.getState().arsenal[prop as string]
});

export const HAZARD_STATS: any = new Proxy({}, {
  get: (_, prop) => useRegistry.getState().hazards[prop as string]
});

export const CLASSES: any[] = new Proxy([], {
  get: (_, prop) => {
    const list = Object.values(useRegistry.getState().heroes);
    if (prop === 'length') return list.length;
    if (prop === 'find') return list.find.bind(list);
    if (prop === 'filter') return list.filter.bind(list);
    if (prop === 'map') return list.map.bind(list);
    if (prop === 'forEach') return list.forEach.bind(list);
    return (list as any)[prop];
  }
});

export const ENEMIES: any[] = new Proxy([], {
  get: (_, prop) => {
    const list = Object.values(useRegistry.getState().monsters);
    if (prop === 'length') return list.length;
    if (prop === 'find') return list.find.bind(list);
    if (prop === 'filter') return list.filter.bind(list);
    if (prop === 'map') return list.map.bind(list);
    if (prop === 'forEach') return list.forEach.bind(list);
    return (list as any)[prop];
  }
});

export const MASTER_ARTIFACTS: any[] = new Proxy([], {
  get: (_, prop) => {
    const list = Object.values(useRegistry.getState().artifacts);
    if (prop === 'length') return list.length;
    if (prop === 'find') return list.find.bind(list);
    if (prop === 'filter') return list.filter.bind(list);
    if (prop === 'map') return list.map.bind(list);
    if (prop === 'forEach') return list.forEach.bind(list);
    return (list as any)[prop];
  }
});

export const getTileStats = (val: number) => {
  const registry = useRegistry.getState();
  if (val >= 2 || val < 0) {
    const stats = registry.arsenal[val.toString()] || registry.hazards[val.toString()];
    if (stats) return stats;
  }
  
  // Fallbacks
  if (val >= 2) return { name: "Weapon", icon: "⚔️", bg: "bg-slate-800", text: "text-white", dmg: 0 };
  if (val < 0) return { name: "Hazard", icon: "⚠️", bg: "bg-rose-900", text: "text-white", dmg: 0 };
  return { name: "", icon: "", bg: "bg-slate-800", text: "", dmg: 0 };
};
