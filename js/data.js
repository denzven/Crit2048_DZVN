// --- GAME DATA ---
const CLASSES = {
  BARBARIAN: {
    id: "Barbarian",
    icon: "😡",
    desc: "+10 Dmg to T1&2 combos.",
    d20Mod: -1,
    ability: null,
  },
  ROGUE: {
    id: "Rogue",
    icon: "🥷",
    desc: "+1 Gold per merge, +2 to D20.",
    d20Mod: 2,
    ability: null,
  },
  WIZARD: {
    id: "Wizard",
    icon: "🧙‍♂️",
    desc: "+1 to D20. Spell: Fireball.",
    d20Mod: 1,
    ability: { name: "Fireball", count: 1, sides: 6, maxUses: 1 },
  },
  WARLOCK: {
    id: "Warlock",
    icon: "👁️",
    desc: "+1 to D20. Spell: Eldritch Blast.",
    d20Mod: 1,
    ability: { name: "Eldritch Blast", count: 1, sides: 10, maxUses: 3 },
  },
  CLERIC: {
    id: "Cleric",
    icon: "✨",
    desc: "Spell: Divine Aid (Heals Slides).",
    d20Mod: 0,
    ability: {
      name: "Divine Aid",
      count: 1,
      sides: 8,
      maxUses: 2,
      type: "heal",
    },
  },
  PALADIN: {
    id: "Paladin",
    icon: "🛡️",
    desc: "Spell: Smite (Mult by max tile).",
    d20Mod: 0,
    ability: { name: "Divine Smite", count: 1, sides: 8, maxUses: 2 },
  },
};

const ENCOUNTERS = [
  {
    name: "Goblin Scout",
    hp: 150,
    slides: 25,
    icon: "👺",
    power: "Ambush (Spawns a Goblin every 12 slides)",
  },
  {
    name: "Orc Brute",
    hp: 500,
    slides: 30,
    icon: "👹",
    power: "Tough (-10% Dmg taken)",
  },
  {
    name: "Slime King",
    hp: 1200,
    slides: 35,
    icon: "🟢",
    power: "Ooze (Spawns a Slime every 8 slides)",
  },
  {
    name: "Troll King",
    hp: 3500,
    slides: 40,
    icon: "🧌",
    power: "Regen (Heals 30 HP per slide)",
  },
  {
    name: "The Lich",
    hp: 8000,
    slides: 40,
    icon: "💀",
    power: "Necromancy (Spawns Skeleton per 12 slides, -10 Start Slides)",
  },
  {
    name: "Ancient Dragon",
    hp: 20000,
    slides: 45,
    icon: "🐉",
    power: "Inferno (Burns best weapon every 10 slides)",
  },
];

const MASTER_ARTIFACTS = [
  {
    id: "WEIGHTED_DICE",
    name: "Weighted Dice",
    icon: "🎲",
    rarity: "Rare",
    classReq: null,
    basePrice: 15,
    desc: (lvl) => `D20 rolls < ${4 + lvl} become ${4 + lvl}.`,
  },
  {
    id: "ASSASSIN_MARK",
    name: "Assassin's Mark",
    icon: "🎯",
    rarity: "Epic",
    classReq: "Rogue",
    basePrice: 20,
    desc: (lvl) => `Merging Daggers gives +${(0.1 * lvl).toFixed(1)} Mult.`,
  },
  {
    id: "GRAVITY_BOOTS",
    name: "Gravity Boots",
    icon: "🥾",
    rarity: "Common",
    classReq: null,
    basePrice: 10,
    desc: (lvl) => `Slide DOWN deals ${1 + 0.5 * lvl}x Dmg, UP deals 0.5x.`,
  },
  {
    id: "NECRONOMICON",
    name: "Necronomicon",
    icon: "📖",
    rarity: "Legendary",
    classReq: null,
    basePrice: 30,
    desc: (lvl) => `Slime spawns deal ${50 * lvl} Dmg to Boss.`,
  },
  {
    id: "RING_WEALTH",
    name: "Ring of Wealth",
    icon: "💍",
    rarity: "Rare",
    classReq: null,
    basePrice: 15,
    desc: (lvl) => `+${30 * lvl} Gold entering Tavern.`,
  },
  {
    id: "BOOTS_HASTE",
    name: "Boots of Haste",
    icon: "⚡",
    rarity: "Epic",
    classReq: null,
    basePrice: 20,
    desc: (lvl) => `+${3 * lvl} Slides per Ante.`,
  },
  {
    id: "GIANT_POTION",
    name: "Giant's Potion",
    icon: "🧪",
    rarity: "Rare",
    classReq: null,
    basePrice: 25,
    desc: (lvl) => `Base mult permanently +${(0.3 * lvl).toFixed(1)}.`,
  },
  {
    id: "VORPAL_BLADE",
    name: "Vorpal Edge",
    icon: "🔪",
    rarity: "Legendary",
    classReq: null,
    basePrice: 35,
    desc: (lvl) => `2% chance for ${200 * lvl} True Dmg on slide.`,
  },
];

// --- DATA HELPERS ---
const getRarityColor = (rarity) => {
  if (rarity === "Common") return "text-slate-300 border-slate-600";
  if (rarity === "Rare") return "text-blue-400 border-blue-600";
  if (rarity === "Epic") return "text-purple-400 border-purple-600";
  return "text-orange-400 border-orange-600";
};

const getWeaponStats = (val) => {
  if (val === -1)
    return {
      name: "Slime",
      icon: "🟢",
      bg: "bg-lime-600",
      text: "text-white",
      dmg: 0,
    };
  if (val === -2)
    return {
      name: "Goblin",
      icon: "👺",
      bg: "bg-emerald-700",
      text: "text-white",
      dmg: 0,
    };
  if (val === -3)
    return {
      name: "Skeleton",
      icon: "💀",
      bg: "bg-gray-700",
      text: "text-white",
      dmg: 0,
    };
  if (val === 2)
    return {
      name: "Dagger",
      icon: "🗡️",
      bg: "bg-slate-300",
      text: "text-slate-900",
      dmg: 2,
    };
  if (val === 4)
    return {
      name: "Longsword",
      icon: "⚔️",
      bg: "bg-slate-400",
      text: "text-slate-900",
      dmg: 8,
    };
  if (val === 8)
    return {
      name: "Crossbow",
      icon: "🏹",
      bg: "bg-amber-600",
      text: "text-white",
      dmg: 20,
    };
  if (val === 16)
    return {
      name: "Battleaxe",
      icon: "🪓",
      bg: "bg-orange-600",
      text: "text-white",
      dmg: 50,
    };
  if (val === 32)
    return {
      name: "Magic Staff",
      icon: "🪄",
      bg: "bg-red-600",
      text: "text-white",
      dmg: 120,
    };
  if (val === 64)
    return {
      name: "Holy Sword",
      icon: "✨",
      bg: "bg-purple-600",
      text: "text-white",
      dmg: 300,
    };
  if (val >= 128)
    return {
      name: "Relic",
      icon: "👑",
      bg: "bg-indigo-700",
      text: "text-white",
      dmg: val * 10,
    };
  return { name: "", icon: "", bg: "bg-slate-800", text: "", dmg: 0 };
};
