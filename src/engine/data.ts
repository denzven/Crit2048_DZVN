export const WEAPON_STATS: Record<number, any> = {
  2: { name: "Dagger", icon: "🗡️", text: "text-slate-900", bg: "bg-slate-300", dmg: 2 },
  4: { name: "Longsword", icon: "⚔️", text: "text-slate-900", bg: "bg-slate-400", dmg: 8 },
  8: { name: "Crossbow", icon: "🏹", text: "text-white", bg: "bg-amber-600", dmg: 20 },
  16: { name: "Battleaxe", icon: "🪓", text: "text-white", bg: "bg-orange-600", dmg: 50 },
  32: { name: "Magic Staff", icon: "🪄", text: "text-white", bg: "bg-red-600", dmg: 120 },
  64: { name: "Holy Sword", icon: "✨", text: "text-white", bg: "bg-purple-600", dmg: 300 },
  128: { name: "Relic", icon: "👑", text: "text-white", bg: "bg-indigo-700", dmg: 1280 },
  256: { name: "Greatsword", icon: "⚡", text: "text-white", bg: "bg-cyan-600", dmg: 2560 },
  512: { name: "Legendary Blade", icon: "💎", text: "text-white", bg: "bg-gradient-to-r from-indigo-600 to-purple-600", dmg: 5120 }
};

export const HAZARD_STATS: Record<string, any> = {
  "-1": { id: "slime", name: "Slime", icon: "🟢", bg: "bg-lime-600" },
  "-2": { id: "goblin", name: "Goblin", icon: "👺", bg: "bg-emerald-700" },
  "-3": { id: "skeleton", name: "Skeleton", icon: "💀", bg: "bg-gray-700" },
  "-4": { id: "mimic", name: "Mimic", icon: "📦", bg: "bg-yellow-700" },
  "-5": { id: "web", name: "Web", icon: "🕸️", bg: "bg-neutral-600" },
  "-6": { id: "curse", name: "Curse", icon: "🔮", bg: "bg-violet-800" },
  "-7": { id: "spore", name: "Spore", icon: "🍄", bg: "bg-green-800" }
};

export const CLASSES: any[] = [
  { id: "Barbarian", name: "Barbarian", icon: "😡", desc: "+10 Dmg to T1&2 combos.", d20Mod: -1, ability: { name: "Rage", sides: 12, count: 1, maxUses: 2, type: "damage" } },
  { id: "Rogue", name: "Rogue", icon: "🥷", desc: "+1 Gold per merge, +2 to D20.", d20Mod: 2, ability: { name: "Sneak Attack", sides: 6, count: 2, maxUses: 3, type: "damage" } },
  { id: "Wizard", name: "Wizard", icon: "🧙‍♂️", desc: "+1 to D20. Spell: Fireball.", d20Mod: 1, ability: { name: "Fireball", sides: 6, count: 1, maxUses: 1, type: "damage" } },
  { id: "Fighter", name: "Fighter", icon: "⚔️", desc: "+15 Base Dmg to T3+ merges.", d20Mod: 0, ability: { name: "Action Surge", sides: 6, count: 2, maxUses: 2, type: "damage" } },
  { id: "Monk", name: "Monk", icon: "👊", desc: "Alternating merge dirs gives +0.1 Mult. +1 to D20.", d20Mod: 1, ability: { name: "Flurry of Blows", sides: 4, count: 3, maxUses: 2, type: "damage" } },
  { id: "Paladin", name: "Paladin", icon: "🛡️", desc: "Spell: Smite (Mult by max tile).", d20Mod: 0, ability: { name: "Divine Smite", sides: 8, count: 1, maxUses: 2, type: "damage" } },
  { id: "Cleric", name: "Cleric", icon: "✨", desc: "Spell: Divine Aid (Heals Slides).", d20Mod: 0, ability: { name: "Divine Aid", sides: 8, count: 1, maxUses: 2, type: "heal" } },
  { id: "Druid", name: "Druid", icon: "🌿", desc: "20% chance to purify hazard on slide.", d20Mod: 0, ability: { name: "Entangle", sides: 8, count: 1, maxUses: 2, type: "heal" } },
  { id: "Warlock", name: "Warlock", icon: "👁️", desc: "+1 to D20. Spell: Eldritch Blast.", d20Mod: 1, ability: { name: "Eldritch Blast", sides: 10, count: 1, maxUses: 3, type: "damage" } },
  { id: "Bard", name: "Bard", icon: "🎵", desc: "+5 Gold per D20 roll. +1 to D20. Spell: Vicious Mockery.", d20Mod: 1, ability: { name: "Vicious Mockery", sides: 6, count: 1, maxUses: 3, type: "damage" } },
  { id: "Ranger", name: "Ranger", icon: "🏹", desc: "+25% dmg vs spawning bosses. Spell: Hunter's Mark.", d20Mod: -1, ability: { name: "Hunter's Mark", sides: 8, count: 1, maxUses: 3, type: "damage" } },
  { id: "Sorcerer", name: "Sorcerer", icon: "🔥", desc: "D20 crit range expands to 19-20. Spell: Chaos Bolt.", d20Mod: 1, ability: { name: "Chaos Bolt", sides: 8, count: 2, maxUses: 1, type: "damage" } }
];

export const ENEMIES: any[] = [
  { id: "goblin_scout", name: "Goblin Scout", hp: 150, slides: 25, icon: "👺", lore: "Ambush (Spawns a Goblin every 12 slides)" },
  { id: "orc_brute", name: "Orc Brute", hp: 500, slides: 30, icon: "👹", lore: "Tough (-10% Dmg taken)" },
  { id: "slime_king", name: "Slime King", hp: 1200, slides: 35, icon: "🟢", lore: "Ooze (Spawns a Slime every 8 slides)" },
  { id: "owlbear_alpha", name: "Owlbear Alpha", hp: 2000, slides: 35, icon: "🦉", lore: "Fierce (Crushes weakest weapon every 10 slides)" },
  { id: "troll_king", name: "Troll King", hp: 3500, slides: 40, icon: "🧌", lore: "Regen (Heals 30 HP per slide)" },
  { id: "the_lich", name: "The Lich", hp: 8000, slides: 40, icon: "💀", lore: "Necromancy (Spawns Skeleton per 12 slides)" },
  { id: "ancient_dragon", name: "Ancient Dragon", hp: 20000, slides: 45, icon: "🐉", lore: "Inferno (Burns best weapon every 10 slides)" }
];

export const MASTER_ARTIFACTS: any[] = [
  { id: "WEIGHTED_DICE", name: "Weighted Dice", icon: "🎲", rarity: "Rare", basePrice: 15, desc: "D20 rolls < 4 become 4." },
  { id: "ASSASSIN_MARK", name: "Assassin's Mark", icon: "🎯", rarity: "Epic", basePrice: 20, desc: "Merging Daggers gives +0.1 Mult." },
  { id: "GRAVITY_BOOTS", name: "Gravity Boots", icon: "🥾", rarity: "Common", basePrice: 10, desc: "Slide DOWN deals 1.5x Dmg." },
  { id: "RING_WEALTH", name: "Ring of Wealth", icon: "💍", rarity: "Rare", basePrice: 15, desc: "+30 Gold entering Tavern." },
  { id: "BOOTS_HASTE", name: "Boots of Haste", icon: "⚡", rarity: "Epic", basePrice: 20, desc: "+3 Slides per Ante." },
  { id: "GIANT_POTION", name: "Giant's Potion", icon: "🧪", rarity: "Rare", basePrice: 25, desc: "Base mult permanently +0.3." },
  { id: "VORPAL_BLADE", name: "Vorpal Edge", icon: "🔪", rarity: "Legendary", basePrice: 35, desc: "2% chance for 200 True Dmg." },
  { id: "ADAMANTINE", name: "Adamantine Armor", icon: "⬛", rarity: "Epic", basePrice: 25, desc: "Immune to crit fail (D20 = 1)." }
];

export const getTileStats = (val: number) => {
  if (val >= 2) return WEAPON_STATS[val] || { name: "Weapon", icon: "⚔️", bg: "bg-slate-800", text: "text-white", dmg: 0 };
  if (val < 0) return HAZARD_STATS[val.toString()] || { name: "Hazard", icon: "⚠️", bg: "bg-rose-900", text: "text-white", dmg: 0 };
  return { name: "", icon: "", bg: "bg-slate-800", text: "", dmg: 0 };
};
