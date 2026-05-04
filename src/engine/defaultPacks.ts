import type { PackData } from '../types/pack';

export const CRIT2048_DEFAULT_ENEMIES_PACK: PackData = {
  "id": "crit2048-default-enemies",
  "name": "Crit 2048 — Default Enemies",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "The core game monsters.",
  "type": "dungeon",
  "icon": "👹",
  "enemies": [
    { "id": "goblin_scout", "name": "Goblin Scout", "hp": 150, "slides": 25, "icon": "👺", "lore": "Ambush (Spawns a Goblin every 12 slides)", "mode": "simple", "primaryAbility": { "trigger": "every_n_slides", "triggerParam": 12, "effect": "spawn_hazard", "effectParam": "goblin", "logMessage": "Ambush: Goblin spawned!" } },
    { "id": "orc_brute", "name": "Orc Brute", "hp": 500, "slides": 30, "icon": "👹", "lore": "Tough (-10% Dmg taken)", "mode": "simple", "passiveAbility": { "effect": "damage_reduction", "effectParam": 10 } },
    { "id": "mimic_colony", "name": "Mimic Colony", "hp": 800, "slides": 30, "icon": "📦", "lore": "Shapechanger (Spawns Mimic every 10 slides)", "mode": "simple", "primaryAbility": { "trigger": "every_n_slides", "triggerParam": 10, "effect": "spawn_hazard", "effectParam": "mimic", "logMessage": "Shapechanger: Mimic spawned!" } },
    { "id": "slime_king", "name": "Slime King", "hp": 1200, "slides": 35, "icon": "🟢", "lore": "Ooze (Spawns a Slime every 8 slides)", "mode": "simple", "primaryAbility": { "trigger": "every_n_slides", "triggerParam": 8, "effect": "spawn_hazard", "effectParam": "slime", "logMessage": "Ooze: Slime spawned!" } },
    { "id": "owlbear_alpha", "name": "Owlbear Alpha", "hp": 2000, "slides": 35, "icon": "🦉", "lore": "Fierce (Randomly destroys worst weapon every 10 slides)", "mode": "simple", "primaryAbility": { "trigger": "every_n_slides", "triggerParam": 10, "effect": "weapon_destroy", "effectParam": "worst", "logMessage": "Owlbear crushes your weakest weapon!" } },
    { "id": "troll_king", "name": "Troll King", "hp": 3500, "slides": 40, "icon": "🧌", "lore": "Regen (Heals 30 HP per slide)", "mode": "simple", "passiveAbility": { "effect": "regen", "effectParam": 30 } },
    { "id": "mind_flayer", "name": "Mind Flayer", "hp": 5000, "slides": 35, "icon": "🧠", "lore": "Mind Blast (Shuffles 4 tiles every 8 slides)", "mode": "simple", "primaryAbility": { "trigger": "every_n_slides", "triggerParam": 8, "effect": "tile_shuffle", "effectParam": 4, "logMessage": "Mind Blast: Tiles shuffled!" } },
    { "id": "the_lich", "name": "The Lich", "hp": 8000, "slides": 40, "icon": "💀", "lore": "Necromancy (Spawns Skeleton per 12 slides, -10 Start Slides)", "mode": "simple", "primaryAbility": { "trigger": "every_n_slides", "triggerParam": 12, "effect": "spawn_hazard", "effectParam": "skeleton", "logMessage": "Necromancy: Skeleton raised!" } },
    { "id": "beholder", "name": "Beholder", "hp": 12000, "slides": 40, "icon": "👁️‍🗨️", "lore": "Eye Ray (Spawns Web per 10 slides)", "mode": "simple", "primaryAbility": { "trigger": "every_n_slides", "triggerParam": 10, "effect": "spawn_hazard", "effectParam": "web", "logMessage": "Eye Ray: Web spawned!" } },
    { "id": "ancient_dragon", "name": "Ancient Dragon", "hp": 20000, "slides": 45, "icon": "🐉", "lore": "Inferno (Burns best weapon every 10 slides)", "mode": "simple", "primaryAbility": { "trigger": "every_n_slides", "triggerParam": 10, "effect": "weapon_destroy", "effectParam": "best", "logMessage": "Inferno burned highest weapon!" } },
    { "id": "vampire_lord", "name": "Vampire Lord", "hp": 16000, "slides": 40, "icon": "🧛", "lore": "Charm (Regen 50 HP/slide, degrades best weapon every 15 slides)", "mode": "simple", "passiveAbility": { "effect": "regen", "effectParam": 50 }, "primaryAbility": { "trigger": "every_n_slides", "triggerParam": 15, "effect": "weapon_degrade", "effectParam": "best", "logMessage": "Charm: Best weapon degraded!" } },
    { "id": "tiamat", "name": "Tiamat", "hp": 30000, "slides": 50, "icon": "🐲", "lore": "Five Heads (Composite of all boss powers)", "mode": "advanced", "script": { "onSlide": "\n        if (G.slides > 0) {\n          if (G.slides % 8 === 0) { G.spawnHazard('slime'); G.log('Tiamat spits acid! (Slime)'); }\n          if (G.slides % 12 === 0) { G.spawnHazard('goblin'); G.log('Tiamat summons reinforcements! (Goblin)'); }\n          if (G.slides % 10 === 0) { G.spawnHazard('mimic'); G.spawnHazard('web'); G.log('Tiamat warps reality!'); }\n          if (G.slides % 8 === 0) { G.shuffleTiles(4); G.log('Tiamat mind blasts!'); }\n          if (G.slides % 12 === 0) { G.spawnHazard('skeleton'); G.log('Tiamat raises the dead!'); }\n          if (G.slides % 15 === 0) { G.degradeWeapon('best'); G.log('Tiamat charms your weapon!'); }\n          if (G.slides % 10 === 0) { G.destroyWeapon('best'); G.log('Tiamat breathes fire!'); }\n          if (G.prng() > 0.5) { G.enemy.healHp(40); }\n        }\n      " } }
  ]
};

export const CRIT2048_DEFAULT_HAZARDS_PACK: PackData = {
  "id": "crit2048-default-hazards",
  "name": "Crit 2048 — Default Hazards",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "The core game board obstacles.",
  "type": "hazard",
  "icon": "⚠️",
  "hazards": [
    { "id": "slime", "name": "Slime", "icon": "🟢", "tileValue": -1 } as any,
    { "id": "goblin", "name": "Goblin", "icon": "👺", "tileValue": -2 } as any,
    { "id": "skeleton", "name": "Skeleton", "icon": "💀", "tileValue": -3 } as any,
    { "id": "mimic", "name": "Mimic", "icon": "📦", "tileValue": -4 } as any,
    { "id": "web", "name": "Web", "icon": "🕸️", "tileValue": -5 } as any,
    { "id": "curse", "name": "Curse", "icon": "🔮", "tileValue": -6 } as any,
    { "id": "spore", "name": "Spore", "icon": "🍄", "tileValue": -7 } as any
  ]
};

export const CRIT2048_DEFAULT_CLASSES_PACK: PackData = {
  "id": "crit2048-default-classes",
  "name": "Crit 2048 — Default Classes",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "The core game hero classes.",
  "type": "class",
  "icon": "👤",
  "classes": [
    { "id": "barbarian", "name": "Barbarian", "icon": "😡", "desc": "+10 Dmg to T1&2 combos.", "d20Mod": -1, "mode": "simple", "ability": { "name": "Rage", "count": 2, "sides": 6, "maxUses": 1, "type": "damage" } },
    { "id": "rogue", "name": "Rogue", "icon": "🥷", "desc": "+1 Gold per merge, +2 to D20.", "d20Mod": 2, "mode": "simple", "passiveTrigger": "on_merge", "passiveEffect": "add_gold", "passiveParam": 1, "ability": { "name": "Backstab", "count": 1, "sides": 20, "maxUses": 1, "type": "damage" } },
    { "id": "wizard", "name": "Wizard", "icon": "🧙‍♂️", "desc": "+1 to D20. Spell: Fireball.", "d20Mod": 1, "mode": "simple", "ability": { "name": "Fireball", "count": 1, "sides": 6, "maxUses": 1, "type": "damage" } },
    { "id": "warlock", "name": "Warlock", "icon": "👁️", "desc": "+1 to D20. Spell: Eldritch Blast.", "d20Mod": 1, "mode": "simple", "ability": { "name": "Eldritch Blast", "count": 1, "sides": 10, "maxUses": 3, "type": "damage" } },
    { "id": "cleric", "name": "Cleric", "icon": "✨", "desc": "Spell: Divine Aid (Heals Slides).", "d20Mod": 0, "mode": "simple", "ability": { "name": "Divine Aid", "count": 1, "sides": 8, "maxUses": 2, "type": "heal" } },
    { "id": "paladin", "name": "Paladin", "icon": "🛡️", "desc": "Spell: Smite.", "d20Mod": 0, "mode": "simple", "ability": { "name": "Divine Smite", "count": 1, "sides": 8, "maxUses": 2, "type": "damage" } },
    { "id": "bard", "name": "Bard", "icon": "🎵", "desc": "+1 to D20. Spell: Vicious Mockery.", "d20Mod": 1, "mode": "simple", "ability": { "name": "Vicious Mockery", "count": 1, "sides": 6, "maxUses": 3, "type": "damage" } },
    { "id": "druid", "name": "Druid", "icon": "🌿", "desc": "Spell: Entangle.", "d20Mod": 0, "mode": "simple", "ability": { "name": "Entangle", "count": 1, "sides": 8, "maxUses": 2, "type": "heal" } },
    { "id": "fighter", "name": "Fighter", "icon": "⚔️", "desc": "Spell: Action Surge.", "d20Mod": 0, "mode": "simple", "ability": { "name": "Action Surge", "count": 2, "sides": 6, "maxUses": 2, "type": "damage" } },
    { "id": "monk", "name": "Monk", "icon": "👊", "desc": "Spell: Flurry of Blows.", "d20Mod": 1, "mode": "simple", "ability": { "name": "Flurry of Blows", "count": 3, "sides": 4, "maxUses": 2, "type": "damage" } },
    { "id": "ranger", "name": "Ranger", "icon": "🏹", "desc": "Spell: Hunter's Mark.", "d20Mod": -1, "mode": "simple", "ability": { "name": "Hunter's Mark", "count": 1, "sides": 8, "maxUses": 3, "type": "damage" } },
    { "id": "sorcerer", "name": "Sorcerer", "icon": "🔮", "desc": "Spell: Chaos Bolt.", "d20Mod": 1, "mode": "simple", "ability": { "name": "Chaos Bolt", "count": 2, "sides": 8, "maxUses": 1, "type": "damage" } }
  ]
};

export const CRIT2048_DEFAULT_ARTIFACTS_PACK: PackData = {
  "id": "crit2048-default-artifacts",
  "name": "Crit 2048 — Default Artifacts",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "The core game artifacts.",
  "type": "artifacts",
  "icon": "🏺",
  "artifacts": [
    { "id": "WEIGHTED_DICE", "name": "Weighted Dice", "icon": "🎲", "rarity": "Rare", "basePrice": 15, "desc": "D20 rolls < ${4 + lvl} become ${4 + lvl}.", "scripts": { "onD20": "if (roll.val < 4 + lvl) { roll.val = 4 + lvl; G.log('🎲 Weighted Dice: Roll bumped to ' + roll.val + '!'); }" } },
    { "id": "GRAVITY_BOOTS", "name": "Gravity Boots", "icon": "🥾", "rarity": "Common", "basePrice": 10, "desc": "Slide DOWN deals ${1 + 0.5 * lvl}x Dmg, UP deals 0.5x.", "scripts": { "onMergeDamage": "if (dir === 'DOWN') { dmg.val *= (1 + 0.5 * lvl); } else if (dir === 'UP') { dmg.val *= 0.5; }" } },
    { "id": "RING_WEALTH", "name": "Ring of Wealth", "icon": "💍", "rarity": "Rare", "basePrice": 15, "desc": "+${30 * lvl} Gold entering Tavern.", "scripts": { "onTavern": "G.player.addGold(30 * lvl); G.log('💍 Ring of Wealth: +' + (30 * lvl) + ' Gold!');" } },
    { "id": "BOOTS_HASTE", "name": "Boots of Haste", "icon": "⚡", "rarity": "Epic", "basePrice": 20, "desc": "+${3 * lvl} Slides per Ante.", "scripts": { "onEncounterStart": "G.addSlides(3 * lvl); G.log('⚡ Boots of Haste: +' + (3 * lvl) + ' slides!');" } },
    { "id": "GIANT_POTION", "name": "Giant's Potion", "icon": "🧪", "rarity": "Rare", "basePrice": 25, "desc": "Base mult permanently +${(0.3 * lvl).toFixed(1)}.", "scripts": { "onPurchase": "G.player.addMultiplier(0.3);" } }
  ]
};

export const CRIT2048_DEFAULT_WEAPONS_PACK: PackData = {
  "id": "crit2048-default-weapons",
  "name": "Crit 2048 — Default Weapons",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "The core game arsenal.",
  "type": "weapon",
  "icon": "⚔️",
  "weapons": [
    { "tileValue": 2, "name": "Dagger", "icon": "🗡️", "dmg": 2 } as any,
    { "tileValue": 4, "name": "Shortsword", "icon": "⚔️", "dmg": 6 } as any,
    { "tileValue": 8, "name": "Longsword", "icon": "⚔️", "dmg": 15 } as any,
    { "tileValue": 16, "name": "Battleaxe", "icon": "🪓", "dmg": 40 } as any,
    { "tileValue": 32, "name": "Warhammer", "icon": "🔨", "dmg": 100 } as any,
    { "tileValue": 64, "name": "Greatsword", "icon": "⚔️", "dmg": 250 } as any,
    { "tileValue": 128, "name": "Magic Staff", "icon": "🪄", "dmg": 600 } as any,
    { "tileValue": 256, "name": "Holy Avenger", "icon": "✨", "dmg": 1500 } as any,
    { "tileValue": 512, "name": "Demon Blade", "icon": "😈", "dmg": 4000 } as any,
    { "tileValue": 1024, "name": "Dragon Slayer", "icon": "🐉", "dmg": 10000 } as any,
    { "tileValue": 2048, "name": "Crit 2048", "icon": "💎", "dmg": 50000 } as any
  ]
};

export const CRIT2048_SYLVAN_SKIN_PACK: PackData = {
  "id": "crit2048-sylvan-skin",
  "name": "Crit 2048 — Sylvan Glade",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "Vibrant forest aesthetic with mossy accents.",
  "type": "skin",
  "icon": "🌿",
  "skin": {
    "themeName": "Sylvan",
    "primaryColor": "#10b981",
    "accentColor": "#059669",
    "bgColor": "#064e3b",
    "surfaceColor": "#065f46",
    "borderColor": "#047857",
    "hpBarColor": "#34d399",
    "loadingColor": "#6ee7b7",
    "glowColor": "#10b981",
    "borderRadius": "1rem"
  }
};

export const CRIT2048_ABYSSAL_SKIN_PACK: PackData = {
  "id": "crit2048-abyssal-skin",
  "name": "Crit 2048 — Abyssal Crypt",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "Bone-white and deep-shadow aesthetic.",
  "type": "skin",
  "icon": "💀",
  "skin": {
    "themeName": "Abyssal",
    "primaryColor": "#94a3b8",
    "accentColor": "#64748b",
    "bgColor": "#020617",
    "surfaceColor": "#0f172a",
    "borderColor": "#1e293b",
    "hpBarColor": "#cbd5e1",
    "loadingColor": "#f1f5f9",
    "glowColor": "#ffffff",
    "borderRadius": "0px"
  }
};

export const CRIT2048_DEFAULT_SKIN_PACK: PackData = {
  "id": "crit2048-default-skin",
  "name": "Crit 2048 — Original Theme",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "The classic Crit 2048 aesthetic.",
  "type": "skin",
  "icon": "🎨",
  "skin": {
    "themeName": "Classic Noir",
    "primaryColor": "#f43f5e",
    "accentColor": "#e11d48",
    "bgColor": "#020617",
    "surfaceColor": "#0f172a",
    "borderColor": "#1e293b",
    "fontFamily": "Cinzel",
    "borderRadius": "0.5rem",
    "hpBarColor": "#f43f5e",
    "loadingColor": "#f43f5e",
    "glowColor": "#f43f5e",
    "script": {
      "onLoad": "G.log('Skin: Spawning atmosphere...');"
    }
  }
};

export const CRIT2048_SHADOWFELL_SKIN_PACK: PackData = {
  "id": "crit2048-shadowfell-skin",
  "name": "Crit 2048 — Shadowfell Noir",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "A dark, void-themed aesthetic with purple pulses.",
  "type": "skin",
  "icon": "🌌",
  "skin": {
    "themeName": "Shadowfell",
    "logoOverride": "VOID 2048",
    "primaryColor": "#a855f7",
    "accentColor": "#7e22ce",
    "bgColor": "#050010",
    "surfaceColor": "#0c001a",
    "borderColor": "#2e1065",
    "hpBarColor": "#9333ea",
    "loadingColor": "#d946ef",
    "glowColor": "#a855f7",
    "borderRadius": "2px"
  }
};

export const CRIT2048_DEFAULT_PACK: PackData = {
  "id": "crit2048-default",
  "name": "Crit 2048 — Default Mega Pack",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "The complete built-in game content.",
  "type": "mega",
  "icon": "🐉",
  "enemies": CRIT2048_DEFAULT_ENEMIES_PACK.enemies,
  "hazards": CRIT2048_DEFAULT_HAZARDS_PACK.hazards,
  "classes": CRIT2048_DEFAULT_CLASSES_PACK.classes,
  "artifacts": CRIT2048_DEFAULT_ARTIFACTS_PACK.artifacts,
  "weapons": CRIT2048_DEFAULT_WEAPONS_PACK.weapons,
  "skin": CRIT2048_DEFAULT_SKIN_PACK.skin
};
