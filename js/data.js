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
    ability: { name: "Fireball", count: 1, sides: 6, maxUses: 1, spellType: "fireball" },
  },
  WARLOCK: {
    id: "Warlock",
    icon: "👁️",
    desc: "+1 to D20. Spell: Eldritch Blast.",
    d20Mod: 1,
    ability: { name: "Eldritch Blast", count: 1, sides: 10, maxUses: 3, spellType: "beam" },
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
      spellType: "divine"
    },
  },
  PALADIN: {
    id: "Paladin",
    icon: "🛡️",
    desc: "Spell: Smite (Mult by max tile).",
    d20Mod: 0,
    ability: { name: "Divine Smite", count: 1, sides: 8, maxUses: 2, spellType: "smite" },
  },
  BARD: {
    id: "Bard",
    icon: "🎵",
    desc: "+5 Gold per D20 roll. +1 to D20. Spell: Vicious Mockery.",
    d20Mod: 1,
    ability: { name: "Vicious Mockery", count: 1, sides: 6, maxUses: 3, spellType: "song" },
  },
  DRUID: {
    id: "Druid",
    icon: "🌿",
    desc: "20% chance to purify hazard on slide. Spell: Entangle.",
    d20Mod: 0,
    ability: { name: "Entangle", count: 1, sides: 8, maxUses: 2, spellType: "entangle" },
  },
  FIGHTER: {
    id: "Fighter",
    icon: "⚔️",
    desc: "+15 Base Dmg to T3+ merges. Spell: Action Surge.",
    d20Mod: 0,
    ability: { name: "Action Surge", count: 2, sides: 6, maxUses: 2, spellType: "blade_storm" },
  },
  MONK: {
    id: "Monk",
    icon: "👊",
    desc: "Alternating merge dirs gives +0.1 Mult. +1 to D20.",
    d20Mod: 1,
    ability: { name: "Flurry of Blows", count: 3, sides: 4, maxUses: 2, spellType: "ki_strike" },
  },
  RANGER: {
    id: "Ranger",
    icon: "🏹",
    desc: "+25% dmg vs spawning bosses. Spell: Hunter's Mark.",
    d20Mod: -1,
    ability: { name: "Hunter's Mark", count: 1, sides: 8, maxUses: 3, spellType: "hunter_mark" },
  },
  SORCERER: {
    id: "Sorcerer",
    icon: "🔮",
    desc: "D20 crit range expands to 19-20. Spell: Chaos Bolt.",
    d20Mod: 1,
    ability: { name: "Chaos Bolt", count: 2, sides: 8, maxUses: 1, spellType: "chaos" },
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
    name: "Mimic Colony",
    hp: 800,
    slides: 30,
    icon: "📦",
    power: "Shapechanger (Spawns Mimic every 10 slides)",
  },
  {
    name: "Slime King",
    hp: 1200,
    slides: 35,
    icon: "🟢",
    power: "Ooze (Spawns a Slime every 8 slides)",
  },
  {
    name: "Owlbear Alpha",
    hp: 2000,
    slides: 35,
    icon: "🦉",
    power: "Keen Sight (+20% dmg to lowest weapon merges)",
  },
  {
    name: "Troll King",
    hp: 3500,
    slides: 40,
    icon: "🧌",
    power: "Regen (Heals 30 HP per slide)",
  },
  {
    name: "Mind Flayer",
    hp: 5000,
    slides: 35,
    icon: "🧠",
    power: "Mind Blast (Shuffles 4 tiles every 8 slides)",
  },
  {
    name: "The Lich",
    hp: 8000,
    slides: 40,
    icon: "💀",
    power: "Necromancy (Spawns Skeleton per 12 slides, -10 Start Slides)",
  },
  {
    name: "Beholder",
    hp: 12000,
    slides: 40,
    icon: "👁️‍🗨️",
    power: "Antimagic (Double spell cost. Spawns Web per 10 slides)",
  },
  {
    name: "Ancient Dragon",
    hp: 20000,
    slides: 45,
    icon: "🐉",
    power: "Inferno (Burns best weapon every 10 slides)",
  },
  {
    name: "Vampire Lord",
    hp: 16000,
    slides: 40,
    icon: "🧛",
    power: "Charm (Regen 50 HP/slide, degrades best weapon every 15 slides)",
  },
  {
    name: "Tiamat",
    hp: 30000,
    slides: 50,
    icon: "🐲",
    power: "Five Heads (Composite of all boss powers)",
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
  {
    id: "CLOAK_INVIS",
    name: "Cloak of Invisibility",
    icon: "🧥",
    rarity: "Epic",
    classReq: null,
    basePrice: 25,
    desc: (lvl) => `Hazards spawn rate -${20 * lvl}%`,
  },
  {
    id: "AMULET_PROOF",
    name: "Amulet of Proof",
    icon: "📿",
    rarity: "Rare",
    classReq: null,
    basePrice: 15,
    desc: (lvl) => `D20 results 1-2 become ${1+lvl+1}`,
  },
  {
    id: "FLAME_TONGUE",
    name: "Flame Tongue",
    icon: "🔥",
    rarity: "Epic",
    classReq: "Fighter",
    basePrice: 20,
    desc: (lvl) => `Merging T3+ deals +${50 * lvl} AOE dmg.`,
  },
  {
    id: "MOON_SICKLE",
    name: "Moon Sickle",
    icon: "🌙",
    rarity: "Epic",
    classReq: "Druid",
    basePrice: 20,
    desc: (lvl) => `Heal spells restore +${3 * lvl} extra slides.`,
  },
  {
    id: "LUTE_THUNDER",
    name: "Lute of Thunderous Thumping",
    icon: "🎸",
    rarity: "Legendary",
    classReq: "Bard",
    basePrice: 30,
    desc: (lvl) => `Spell dmg x${1 + 0.5 * lvl}.`,
  },
  {
    id: "STAFF_POWER",
    name: "Staff of Power",
    icon: "🏛️",
    rarity: "Legendary",
    classReq: "Sorcerer",
    basePrice: 35,
    desc: (lvl) => `Chaos Bolt always picks best outcome.`,
  },
  {
    id: "BRACERS_DEF",
    name: "Bracers of Defense",
    icon: "🛡️",
    rarity: "Rare",
    classReq: "Monk",
    basePrice: 15,
    desc: (lvl) => `+${2 * lvl} slides per D20 roll.`,
  },
  {
    id: "QUIVER_PLENTY",
    name: "Quiver of Ehlonna",
    icon: "🏹",
    rarity: "Rare",
    classReq: "Ranger",
    basePrice: 15,
    desc: (lvl) => `Hunter's Mark lasts +${2 * lvl} merges.`,
  },
  {
    id: "BAG_HOLDING",
    name: "Bag of Holding",
    icon: "💼",
    rarity: "Common",
    classReq: null,
    basePrice: 10,
    desc: (lvl) => `Shop offers +${1 * lvl} artifact slots.`,
  },
  {
    id: "HELM_BRILLI",
    name: "Helm of Brilliance",
    icon: "👑",
    rarity: "Legendary",
    classReq: null,
    basePrice: 35,
    desc: (lvl) => `Crits deal ${2 + 1 * lvl}x dmg.`,
  },
  {
    id: "STONE_LUCK",
    name: "Stone of Good Luck",
    icon: "🪨",
    rarity: "Rare",
    classReq: null,
    basePrice: 20,
    desc: (lvl) => `+${1 * lvl} to ALL D20 rolls.`,
  },
  {
    id: "ADAMANTINE",
    name: "Adamantine Armor",
    icon: "⬛",
    rarity: "Epic",
    classReq: null,
    basePrice: 25,
    desc: (lvl) => `Immune to crit fail (D20 = 1).`,
  },
  {
    id: "IMMOV_ROD",
    name: "Immovable Rod",
    icon: "🔩",
    rarity: "Rare",
    classReq: null,
    basePrice: 15,
    desc: (lvl) => `Hazards can't spawn adjacent to best weapon.`,
  },
  {
    id: "DECK_MANY",
    name: "Deck of Many Things",
    icon: "🃏",
    rarity: "Artifact",
    classReq: null,
    basePrice: 50,
    desc: (lvl) => `D20 outcomes are doubled.`,
  },
  {
    id: "HOLY_AVENGER",
    name: "Holy Avenger",
    icon: "⚔️",
    rarity: "Artifact",
    classReq: "Paladin",
    basePrice: 50,
    desc: (lvl) => `Smite dmg x${2*lvl}. Hazards take AOE on cast.`,
  },
  {
    id: "SPELL_SCROLL",
    name: "Spell Scroll",
    icon: "📜",
    rarity: "Common",
    classReq: null,
    basePrice: 15,
    desc: (lvl) => `+${1 * lvl} max spell uses.`,
  },
];

// --- DATA HELPERS ---
const getRarityColor = (rarity) => {
  if (rarity === "Common") return "text-slate-300 border-slate-600";
  if (rarity === "Rare") return "text-blue-400 border-blue-600";
  if (rarity === "Epic") return "text-purple-400 border-purple-600";
  if (rarity === "Artifact") return "text-red-400 border-red-600";
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
  if (val === -4)
    return {
      name: "Mimic",
      icon: "📦",
      bg: "bg-yellow-700",
      text: "text-white",
      dmg: 0,
    };
  if (val === -5)
    return {
      name: "Web",
      icon: "🕸️",
      bg: "bg-neutral-600",
      text: "text-white",
      dmg: 0,
    };
  if (val === -6)
    return {
      name: "Curse",
      icon: "🔮",
      bg: "bg-violet-800",
      text: "text-white",
      dmg: 0,
    };
  if (val === -7)
    return {
      name: "Spore",
      icon: "🍄",
      bg: "bg-green-800",
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
  if (val === 128)
    return {
      name: "Relic",
      icon: "👑",
      bg: "bg-indigo-700",
      text: "text-white",
      dmg: 1280,
    };
  if (val === 256)
    return {
      name: "Greatsword",
      icon: "⚡",
      bg: "bg-cyan-600",
      text: "text-white",
      dmg: 2560,
    };
  if (val >= 512)
    return {
      name: "Legendary Blade",
      icon: "💎",
      bg: "bg-gradient-to-r from-indigo-600 to-purple-600",
      text: "text-white",
      dmg: val * 10,
    };
  return { name: "", icon: "", bg: "bg-slate-800", text: "", dmg: 0 };
};
