export interface AssetInfo {
  static?: string;
  animated?: string;
  fallback: string; // Emoji char
}

export const ASSET_MAP: Record<string, AssetInfo> = {
  // CLASSES
  'Barbarian': { 
    static: '/assets/classes/barbarian.svg', 
    animated: '/assets/classes/barbarian.webp', 
    fallback: '😡' 
  },
  'Rogue': { 
    static: '/assets/classes/rogue.svg', 
    animated: '/assets/classes/rogue.webp', 
    fallback: '🥷' 
  },
  'Wizard': { 
    static: '/assets/classes/wizard.svg', 
    animated: '/assets/classes/wizard.webp', 
    fallback: '🧙' 
  },
  'Fighter': { 
    static: '/assets/classes/fighter.svg', 
    animated: '/assets/classes/fighter.webp', 
    fallback: '⚔️' 
  },
  'Monk': { 
    static: '/assets/classes/monk.svg', 
    animated: '/assets/classes/monk.webp', 
    fallback: '👊' 
  },
  'Paladin': { 
    static: '/assets/classes/paladin.svg', 
    animated: '/assets/classes/paladin.webp', 
    fallback: '🛡️' 
  },
  'Cleric': { 
    static: '/assets/classes/cleric.svg', 
    animated: '/assets/classes/cleric.webp', 
    fallback: '✨' 
  },
  'Druid': { 
    static: '/assets/classes/druid.svg', 
    animated: '/assets/classes/druid.webp', 
    fallback: '🌿' 
  },
  'Warlock': { 
    static: '/assets/classes/warlock.svg', 
    animated: '/assets/classes/warlock.webp', 
    fallback: '👁️' 
  },
  'Bard': { 
    static: '/assets/classes/bard.svg', 
    animated: '/assets/classes/bard.webp', 
    fallback: '🎵' 
  },
  'Ranger': { 
    static: '/assets/classes/ranger.svg', 
    animated: '/assets/classes/ranger.webp', 
    fallback: '🏹' 
  },
  'Sorcerer': { 
    fallback: '🔮' 
  },

  // ENEMIES
  'Ancient Dragon': { 
    static: '/assets/enemies/dragon.svg', 
    animated: '/assets/enemies/dragon.webp', 
    fallback: '🐉' 
  },
  'The Lich': { 
    static: '/assets/enemies/lich.svg', 
    animated: '/assets/enemies/lich.webp', 
    fallback: '💀' 
  },
  'Goblin Scout': { 
    static: '/assets/enemies/goblin.svg', 
    animated: '/assets/enemies/goblin.webp', 
    fallback: '👺' 
  },
  
  // UI
  'TitleIcon': { 
    static: '/assets/ui/logo.svg', 
    animated: '/assets/ui/logo.webp', 
    fallback: '🐉' 
  },
  'Home': { 
    static: '/assets/ui/home.svg', 
    animated: '/assets/ui/home.webp', 
    fallback: '🏠' 
  },
  'Grimoire': { 
    static: '/assets/ui/scroll.svg', 
    animated: '/assets/ui/scroll.webp', 
    fallback: '📜' 
  },
  'Forge': { 
    static: '/assets/ui/forge.svg', 
    animated: '/assets/ui/forge.webp', 
    fallback: '⚒️' 
  },
};

export const getAsset = (key: string): AssetInfo | null => {
  return ASSET_MAP[key] || null;
};
