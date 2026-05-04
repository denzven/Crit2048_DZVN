export const WEAPON_STATS: Record<number, any> = {
  2: { name: "Dagger", icon: "🗡️", text: "text-slate-900", bg: "bg-slate-300", dmg: 2 },
  4: { name: "Shortsword", icon: "⚔️", text: "text-slate-900", bg: "bg-slate-400", dmg: 6 },
  8: { name: "Longsword", icon: "⚔️", text: "text-white", bg: "bg-amber-600", dmg: 15 },
  16: { name: "Battleaxe", icon: "🪓", text: "text-white", bg: "bg-orange-600", dmg: 40 },
  32: { name: "Warhammer", icon: "🔨", text: "text-white", bg: "bg-red-600", dmg: 100 },
  64: { name: "Greatsword", icon: "⚔️", text: "text-white", bg: "bg-purple-600", dmg: 250 },
  128: { name: "Magic Staff", icon: "🪄", text: "text-white", bg: "bg-indigo-700", dmg: 600 },
  256: { name: "Holy Avenger", icon: "✨", text: "text-white", bg: "bg-cyan-600", dmg: 1500 },
  512: { name: "Demon Blade", icon: "😈", text: "text-white", bg: "bg-gradient-to-r from-indigo-600 to-purple-600", dmg: 4000 },
  1024: { name: "Dragon Slayer", icon: "🐉", text: "text-white", bg: "bg-gradient-to-r from-red-600 to-orange-600", dmg: 10000 },
  2048: { name: "Crit 2048", icon: "💎", text: "text-white", bg: "bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600", dmg: 50000 }
};

export const HAZARD_STATS: Record<string, any> = {
  "-1": { id: "slime", name: "Slime", icon: "🟢", bg: "bg-lime-600", lore: "Spreads every 10 turns." },
  "-2": { id: "goblin", name: "Goblin", icon: "👺", bg: "bg-emerald-700", lore: "Steals 10 gold on contact." },
  "-3": { id: "skeleton", name: "Skeleton", icon: "💀", bg: "bg-gray-700", lore: "Blocks merges in its column." },
  "-4": { id: "mimic", name: "Mimic", icon: "📦", bg: "bg-yellow-700", lore: "Looks like a weapon until touched." },
  "-5": { id: "web", name: "Web", icon: "🕸️", bg: "bg-neutral-600", lore: "Slows adjacent tile movement." },
  "-6": { id: "curse", name: "Curse", icon: "🔮", bg: "bg-violet-800", lore: "Reduces D20 luck by 2." },
  "-7": { id: "spore", name: "Spore", icon: "🍄", bg: "bg-green-800", lore: "Explodes into 2 slimes." }
};

export const CLASSES: any[] = [
  { id: "Barbarian", name: "Barbarian", icon: "😡", desc: "+10 Dmg to T1&2 combos.", d20Mod: -1, 
    scripts: { onMergeDamage: "if (val === 4 || val === 8) dmg.val += 10;" },
    ability: { name: "Rage", sides: 12, count: 1, maxUses: 2, type: "damage" } 
  },
  { id: "Rogue", name: "Rogue", icon: "🥷", desc: "+1 Gold per merge, +2 to D20.", d20Mod: 2, 
    scripts: { onMerge: "G.player.addGold(1);" },
    ability: { name: "Sneak Attack", sides: 6, count: 2, maxUses: 3, type: "damage" } 
  },
  { id: "Wizard", name: "Wizard", icon: "🧙‍♂️", desc: "+1 to D20. Spell: Fireball.", d20Mod: 1, 
    scripts: { onCast: "G.log('🧙‍♂️ Wizard casts Fireball!'); G.shake(); G.enemy.dealDamage(dmg.val * 1.5);" },
    ability: { name: "Fireball", sides: 6, count: 1, maxUses: 1, type: "damage" } 
  },
  { id: "Fighter", name: "Fighter", icon: "⚔️", desc: "+15 Base Dmg to T3+ merges.", d20Mod: 0, 
    scripts: { onMergeDamage: "if (val >= 8) dmg.val += 15;" },
    ability: { name: "Action Surge", sides: 6, count: 2, maxUses: 2, type: "damage" } 
  },
  { id: "Monk", name: "Monk", icon: "👊", desc: "Alternating merge dirs gives +0.1 Mult. +1 to D20.", d20Mod: 1, 
    scripts: { onSlide: "if (state.lastDirection && dir !== state.lastDirection) G.player.addMultiplier(0.1);" },
    ability: { name: "Flurry of Blows", sides: 4, count: 3, maxUses: 2, type: "damage" } 
  },
  { id: "Paladin", name: "Paladin", icon: "🛡️", desc: "Spell: Smite (Mult by max tile).", d20Mod: 0, 
    scripts: { onCast: "const maxV = Math.max(...G.grid.map(t => t?.val || 0)); dmg.val *= (maxV / 2); G.log('🛡️ Smite amplified by x' + (maxV/2) + '!');" },
    ability: { name: "Divine Smite", sides: 8, count: 1, maxUses: 2, type: "damage" } 
  },
  { id: "Cleric", name: "Cleric", icon: "✨", desc: "Spell: Divine Aid (Heals Slides).", d20Mod: 0, 
    ability: { name: "Divine Aid", sides: 8, count: 1, maxUses: 2, type: "heal" } 
  },
  { id: "Druid", name: "Druid", icon: "🌿", desc: "20% chance to purify hazard on slide.", d20Mod: 0, 
    scripts: { onSlide: "if (G.prng() < 0.2) { const hIdx = G.grid.findIndex(t => t && t.val < 0); if (hIdx !== -1) G.clearTile(hIdx); }" },
    ability: { name: "Entangle", sides: 8, count: 1, maxUses: 2, type: "heal" } 
  },
  { id: "Warlock", name: "Warlock", icon: "👁️", desc: "+1 to D20. Spell: Eldritch Blast.", d20Mod: 1, 
    ability: { name: "Eldritch Blast", sides: 10, count: 1, maxUses: 3, type: "damage" } 
  },
  { id: "Bard", name: "Bard", icon: "🎵", desc: "+5 Gold per D20 roll. +1 to D20.", d20Mod: 1, 
    scripts: { onD20: "G.player.addGold(5);" },
    ability: { name: "Vicious Mockery", sides: 6, count: 1, maxUses: 3, type: "damage" } 
  },
  { id: "Ranger", name: "Ranger", icon: "🏹", desc: "+25% dmg vs spawning bosses. Spell: Hunter's Mark.", d20Mod: -1, 
    scripts: { onMergeDamage: "if (G.slides < 10) dmg.val *= 1.25;" }, // Simplified: first 10 slides of encounter
    ability: { name: "Hunter's Mark", sides: 8, count: 1, maxUses: 3, type: "damage" } 
  },
  { id: "Sorcerer", name: "Sorcerer", icon: "🔥", desc: "D20 crit range expands to 19-20. Spell: Chaos Bolt.", d20Mod: 1, 
    scripts: { onD20: "if (roll.val === 19) roll.val = 20;" },
    ability: { name: "Chaos Bolt", sides: 8, count: 2, maxUses: 1, type: "damage" } 
  }
];

export const ENEMIES: any[] = [
  { id: "goblin_scout", name: "Goblin Scout", hp: 150, slides: 25, icon: "👺", lore: "Ambush (Spawns a Goblin every 12 slides)", mode: "advanced", 
    script: { onSlide: "if (G.slides % 12 === 0) G.spawnHazard('-2');" } 
  },
  { id: "orc_brute", name: "Orc Brute", hp: 500, slides: 30, icon: "👹", lore: "Tough (-10% Dmg taken)", mode: "simple",
    passiveAbility: { effect: "damage_reduction", effectParam: 10 }
  },
  { id: "slime_king", name: "Slime King", hp: 1200, slides: 35, icon: "🟢", lore: "Ooze (Spawns a Slime every 8 slides)", mode: "advanced",
    script: { onSlide: "if (G.slides % 8 === 0) G.spawnHazard('-1');" }
  },
  { id: "owlbear_alpha", name: "Owlbear Alpha", hp: 2000, slides: 35, icon: "🦉", lore: "Fierce (Crushes weakest weapon every 10 slides)", mode: "advanced",
    script: { onSlide: "if (G.slides % 10 === 0) G.player.drainSlides(1); G.log('Owlbear crushed your spirit!');" }
  },
  { id: "troll_king", name: "Troll King", hp: 3500, slides: 40, icon: "🧌", lore: "Regen (Heals 30 HP per slide)", mode: "advanced",
    script: { onSlide: "G.enemy.healHp(30);" }
  },
  { id: "the_lich", name: "The Lich", hp: 8000, slides: 40, icon: "💀", lore: "Necromancy (Spawns Skeleton per 12 slides, -10 Start Slides)", mode: "advanced",
    script: { 
      onEncounterStart: "G.player.drainSlides(10); G.log('💀 The Lich drained 10 slides from your soul!');",
      onSlide: "if (G.slides % 12 === 0) G.spawnHazard('-3');" 
    }
  },
  { id: "beholder", name: "Beholder", hp: 12000, slides: 40, icon: "👁️‍🗨️", lore: "Eye Ray (Spawns Web per 10 slides)", mode: "advanced",
    script: { onSlide: "if (G.slides % 10 === 0) G.spawnHazard('-5');" }
  },
  { id: "ancient_dragon", name: "Ancient Dragon", hp: 20000, slides: 45, icon: "🐉", lore: "Inferno (Burns best weapon every 10 slides)", mode: "advanced",
    script: { onSlide: "if (G.slides % 10 === 0) { G.log('Inferno burned your best weapon!'); G.destroyWeapon('best'); }" }
  },
  { id: "mind_flayer", name: "Mind Flayer", hp: 5000, slides: 35, icon: "🧠", lore: "Mind Blast (Shuffles tiles every 8 slides)", mode: "advanced",
    script: { onSlide: "if (G.slides % 8 === 0) { G.log('Mind Blast: Tiles shuffled!'); G.shuffleTiles(); }" }
  },
  { id: "vampire_lord", name: "Vampire Lord", hp: 16000, slides: 40, icon: "🧛", lore: "Charm (Regen 50 HP/slide, degrades best weapon every 15 slides)", mode: "advanced",
    script: { onSlide: "if (G.slides % 15 === 0) { G.log('Charm: Best weapon degraded!'); G.degradeWeapon('best'); } G.enemy.healHp(50);" }
  },
  { id: "mimic_colony", name: "Mimic Colony", hp: 800, slides: 30, icon: "📦", lore: "Shapechanger (Spawns Mimic every 10 slides)", mode: "advanced",
    script: { onSlide: "if (G.slides % 10 === 0) G.spawnHazard('-4');" }
  },
  { id: "tiamat", name: "Tiamat", hp: 50000, slides: 50, icon: "🐲", lore: "Five Heads (Composite of all boss powers)", mode: "advanced",
    script: { 
      onSlide: `
        if (G.slides > 0) {
          if (G.slides % 8 === 0) { G.spawnHazard('-1'); G.log('Tiamat spits acid! (Slime)'); }
          if (G.slides % 12 === 0) { G.spawnHazard('-2'); G.log('Tiamat summons reinforcements! (Goblin)'); }
          if (G.slides % 10 === 0) { G.spawnHazard('-4'); G.spawnHazard('-5'); G.log('Tiamat warps reality!'); }
          if (G.slides % 8 === 0) { G.shuffleTiles(); G.log('Tiamat mind blasts!'); }
          if (G.slides % 12 === 0) { G.spawnHazard('-3'); G.log('Tiamat raises the dead!'); }
          if (G.slides % 15 === 0) { G.degradeWeapon('best'); G.log('Tiamat charms your weapon!'); }
          if (G.slides % 10 === 0) { G.destroyWeapon('best'); G.log('Tiamat breathes fire!'); }
          if (G.prng() > 0.5) { G.enemy.healHp(40); }
        }
      `
    }
  }
];

export const MASTER_ARTIFACTS: any[] = [
  { id: "NECRONOMICON", name: "Necronomicon", icon: "📖", rarity: "Legendary", basePrice: 30, desc: "Slime spawns deal 50 Dmg to Boss.",
    scripts: { onD20: "if (roll.val > 1 && roll.val < 10) { const slimes = G.grid.filter(t => t && t.val === -1).length; if (slimes > 0) { G.enemy.dealDamage(50 * slimes); G.log('📖 Necronomicon: Burned boss for ' + (50 * slimes) + ' dmg!'); } }" }
  },
  { id: "RING_WEALTH", name: "Ring of Wealth", icon: "💍", rarity: "Rare", basePrice: 15, desc: "+30 Gold entering Tavern.",
    scripts: { onTavern: "G.player.addGold(30); G.log('💍 Ring of Wealth: +30 Gold!');" }
  },
  { id: "BOOTS_HASTE", name: "Boots of Haste", icon: "⚡", rarity: "Epic", basePrice: 20, desc: "+3 Slides per Ante.",
    scripts: { onEncounterStart: "G.player.addSlides(3); G.log('⚡ Boots of Haste: +3 slides!');" }
  },
  { id: "GIANT_POTION", name: "Giant's Potion", icon: "🧪", rarity: "Rare", basePrice: 25, desc: "Base mult permanently +0.3.",
    scripts: { onPurchase: "G.player.addMultiplier(0.3);" }
  },
  { id: "VORPAL_BLADE", name: "Vorpal Edge", icon: "🔪", rarity: "Legendary", basePrice: 35, desc: "2% chance for 200 True Dmg.",
    scripts: { onSlide: "if (G.prng() < 0.02) { G.enemy.dealDamage(200); G.log('⚔️ VORPAL STRIKE!'); }" }
  },
  { id: "MITHRIL_CHAIN", name: "Mithril Chain", icon: "⛓️", rarity: "Rare", basePrice: 15, desc: "-10% damage taken from hazards.",
    scripts: { onDamage: "if (dmg.val > 0) dmg.val *= 0.9;" }
  },
  { id: "PHOENIX_FEATHER", name: "Phoenix Feather", icon: "🪶", rarity: "Legendary", basePrice: 40, desc: "If slides hit 0, restore 5 slides (Once/Run).",
    scripts: { onSlide: "if (G.slides <= 0 && !G.state.featherUsed) { G.player.addSlides(5); G.state.featherUsed = true; G.log('🪶 Phoenix Feather: Rebirth!'); }" }
  },
  { id: "DRAGON_SCALE", name: "Dragon Scale", icon: "🛡️", rarity: "Epic", basePrice: 25, desc: "+50% damage to boss on D20 Crit (20).",
    scripts: { onD20: "if (roll.val === 20) { G.log('🛡️ Dragon Scale: CRITICAL POWER!'); G.player.addMultiplier(0.5); }" }
  },
  { id: "VOID_ORB", name: "Void Orb", icon: "🌑", rarity: "Artifact", basePrice: 60, desc: "Every 20 merges, clear all hazards.",
    scripts: { onMerge: "if (G.state.totalMerges % 20 === 0) { for(let i=0; i<16; i++) if(G.grid[i] && G.grid[i].val < 0) G.clearTile(i); G.log('🌑 Void Orb: Board Cleansed!'); }" }
  },
  { id: "CLOAK_INVIS", name: "Cloak of Invisibility", icon: "🧥", rarity: "Epic", basePrice: 25, desc: "Hazards spawn rate -20%" 
    // Logic handled in gameStore.ts spawnRandomTile for now
  },
  { id: "AMULET_PROOF", name: "Amulet of Proof", icon: "📿", rarity: "Rare", basePrice: 15, desc: "D20 results 1-2 become 5.",
    scripts: { onD20: "if (roll.val <= 2) roll.val = 5;" }
  },
  { id: "FLAME_TONGUE", name: "Flame Tongue", icon: "🔥", rarity: "Epic", basePrice: 20, desc: "Merging T3+ deals +${param} AOE dmg.",
    passiveParam: 50,
    scripts: { onMergeDamage: "if (val >= 8) dmg.val += (50 * lvl);" }
  },
  { id: "MOON_SICKLE", name: "Moon Sickle", icon: "🌙", rarity: "Epic", basePrice: 20, desc: "Heal spells restore +3 slides." 
    // Logic handled in Cleric/Druid spell scripts
  },
  { id: "LUTE_THUNDER", name: "Lute of Thunderous Thumping", icon: "🎸", rarity: "Legendary", basePrice: 30, desc: "Spell dmg x1.5.",
    scripts: { onCast: "dmg.val *= 1.5;" }
  },
  { id: "STAFF_POWER", name: "Staff of Power", icon: "🏛️", rarity: "Legendary", basePrice: 35, desc: "Chaos Bolt always picks best outcome." 
    // Logic handled in Sorcerer spell script
  },
  { id: "BRACERS_DEF", name: "Bracers of Defense", icon: "🛡️", rarity: "Rare", basePrice: 15, desc: "+${param} slides per D20 roll.",
    passiveParam: 2,
    scripts: { onD20: "G.player.addSlides(2 * lvl);" }
  },
  { id: "QUIVER_PLENTY", name: "Quiver of Ehlonna", icon: "🏹", rarity: "Rare", basePrice: 15, desc: "Hunter's Mark lasts +2 merges." 
    // Logic handled in Ranger spell script
  },
  { id: "BAG_HOLDING", name: "Bag of Holding", icon: "💼", rarity: "Common", basePrice: 10, desc: "Shop offers +1 artifact slots." 
    // Logic handled in Tavern shop generation
  },
  { id: "HELM_BRILLI", name: "Helm of Brilliance", icon: "👑", rarity: "Legendary", basePrice: 35, desc: "Crits deal 3x dmg.",
    scripts: { onMergeDamage: "if (val >= 32) dmg.val *= 1.5;" } // Approximation of "crit" for now
  },
  { id: "STONE_LUCK", name: "Stone of Good Luck", icon: "🪨", rarity: "Rare", basePrice: 20, desc: "+${param} to ALL D20 rolls.",
    passiveParam: 1,
    scripts: { onD20: "roll.val += (1 * lvl);" }
  },
  { id: "ADAMANTINE", name: "Adamantine Armor", icon: "⬛", rarity: "Epic", basePrice: 25, desc: "Immune to crit fail (D20 = 1).",
    scripts: { onD20: "if (roll.val === 1) roll.val = 10;" }
  },
  { id: "IMMOV_ROD", name: "Immovable Rod", icon: "🔩", rarity: "Rare", basePrice: 15, desc: "10% chance to block hazard spawn.",
    scripts: { onSlide: "if (G.prng() < 0.1) G.log('🔩 Immovable Rod blocked a potential hazard!');" }
  },
  { id: "DECK_MANY", name: "Deck of Many Things", icon: "🃏", rarity: "Artifact", basePrice: 50, desc: "D20 outcomes are doubled.",
    scripts: { onD20: "roll.val *= 2;" }
  },
  { id: "HOLY_AVENGER", name: "Holy Avenger", icon: "⚔️", rarity: "Artifact", basePrice: 50, desc: "Smite dmg x2. Hazards take AOE on cast.",
    scripts: { 
      onCast: "dmg.val *= 2; const g = G.grid; for(let i=0; i<16; i++) { if(g[i] && g[i].val < 0) G.clearTile(i); } G.log('⚔️ Holy Avenger cleansed the board!');" 
    }
  },
  { id: "SPELL_SCROLL", name: "Spell Scroll", icon: "📜", rarity: "Common", basePrice: 15, desc: "+1 max spell uses.",
    scripts: { onPurchase: "G.player.addSpellUses(1);" }
  }
];

export const getTileStats = (val: number) => {
  if (val >= 2) return WEAPON_STATS[val] || { name: "Weapon", icon: "⚔️", bg: "bg-slate-800", text: "text-white", dmg: 0 };
  if (val < 0) return HAZARD_STATS[val.toString()] || { name: "Hazard", icon: "⚠️", bg: "bg-rose-900", text: "text-white", dmg: 0 };
  return { name: "", icon: "", bg: "bg-slate-800", text: "", dmg: 0 };
};

