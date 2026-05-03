/**
 * DEFAULT CONTENT PACKS
 * Physically split into specific types for modular management.
 */

const CRIT2048_DEFAULT_ENEMIES_PACK = {
  "id": "crit2048-default-enemies",
  "name": "Crit 2048 — Default Enemies",
  "version": "1.0.0",
  "author": "denzven",
  "description": "The core game monsters.",
  "type": "dungeon",
  "icon": "👹",
  "enemies": [
    { "id": "goblin_scout", "name": "Goblin Scout", "hp": 150, "slides": 25, "icon": "👺", "lore": "Ambush (Spawns a Goblin every 12 slides)", "mode": "simple", "primaryAbility": { "trigger": "every_n_slides", "triggerParam": 12, "effect": "spawn_hazard", "effectParam": "goblin", "logMessage": "Ambush: Goblin spawned!" } },
    { "id": "orc_brute", "name": "Orc Brute", "hp": 500, "slides": 30, "icon": "👹", "lore": "Tough (-10% Dmg taken)", "mode": "simple", "passiveAbility": { "effect": "damage_reduction", "effectParam": 10, "logMessage": "Orc Brute resists ${amount} damage!" } },
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

const CRIT2048_DEFAULT_HAZARDS_PACK = {
  "id": "crit2048-default-hazards",
  "name": "Crit 2048 — Default Hazards",
  "version": "1.0.0",
  "game_version": "1.0.0",
  "author": "denzven",
  "description": "The core game board obstacles.",
  "type": "hazard",
  "icon": "⚠️",
  "hazards": [
    { "id": "slime", "name": "Slime", "icon": "🟢", "tileValue": -1, "bg": "bg-lime-600" },
    { "id": "goblin", "name": "Goblin", "icon": "👺", "tileValue": -2, "bg": "bg-emerald-700" },
    { "id": "skeleton", "name": "Skeleton", "icon": "💀", "tileValue": -3, "bg": "bg-gray-700" },
    { "id": "mimic", "name": "Mimic", "icon": "📦", "tileValue": -4, "bg": "bg-yellow-700" },
    { "id": "web", "name": "Web", "icon": "🕸️", "tileValue": -5, "bg": "bg-neutral-600" },
    { "id": "curse", "name": "Curse", "icon": "🔮", "tileValue": -6, "bg": "bg-violet-800" },
    { "id": "spore", "name": "Spore", "icon": "🍄", "tileValue": -7, "bg": "bg-green-800" }
  ]
};

const CRIT2048_DEFAULT_CLASSES_PACK = {
  "id": "crit2048-default-classes",
  "name": "Crit 2048 — Default Classes",
  "version": "1.0.0",
  "game_version": "1.0.0",
  "author": "denzven",
  "description": "The core game hero classes.",
  "type": "class",
  "icon": "👤",
  "classes": [
    { "id": "barbarian", "name": "Barbarian", "icon": "😡", "desc": "+10 Dmg to T1&2 combos.", "d20Mod": -1, "mode": "simple", "ability": null },
    { "id": "rogue", "name": "Rogue", "icon": "🥷", "desc": "+1 Gold per merge, +2 to D20.", "d20Mod": 2, "mode": "simple", "passiveTrigger": "on_merge", "passiveEffect": "add_gold", "passiveParam": 1, "ability": null },
    { "id": "wizard", "name": "Wizard", "icon": "🧙‍♂️", "desc": "+1 to D20. Spell: Fireball.", "d20Mod": 1, "mode": "simple", "ability": { "name": "Fireball", "count": 1, "sides": 6, "maxUses": 1, "spellType": "fireball", "mode": "advanced", "script": { "onCast": "\nlet rF = G.prngInt(0, 2), cF = G.prngInt(0, 2);\nG.playFx(\"fireball\", rF, cF);\nG.shake();\nG.sfx(\"explosion\");\nG.timeout(300, () => {\n  let g = G.gridArray;\n  for (let i = 0; i < 2; i++) {\n    for (let j = 0; j < 2; j++) {\n      let idx = (rF + i) * 4 + (cF + j);\n      if (g[idx] && g[idx].val < 8) G.clearTile(idx);\n    }\n  }\n  G.enemy.dealDamage(roll * G.player.multiplier);\n  G.render();\n});\n" } } },
    { "id": "warlock", "name": "Warlock", "icon": "👁️", "desc": "+1 to D20. Spell: Eldritch Blast.", "d20Mod": 1, "mode": "simple", "ability": { "name": "Eldritch Blast", "count": 1, "sides": 10, "maxUses": 3, "spellType": "beam", "mode": "advanced", "script": { "onCast": "\nlet rB = G.prngInt(0, 3);\nG.playFx(\"beam\", rB, 0);\nG.sfx(\"beam\");\nG.timeout(300, () => {\n  let g = G.gridArray;\n  for (let c = 0; c < 4; c++) {\n    let idx = rB * 4 + c;\n    if (g[idx] && g[idx].val < 0) G.clearTile(idx);\n  }\n  G.enemy.dealDamage(roll * G.player.multiplier);\n  G.render();\n});\n" } } },
    { "id": "cleric", "name": "Cleric", "icon": "✨", "desc": "Spell: Divine Aid (Heals Slides).", "d20Mod": 0, "mode": "simple", "ability": { "name": "Divine Aid", "count": 1, "sides": 8, "maxUses": 2, "spellType": "divine", "type": "heal", "mode": "advanced", "script": { "onCast": "\nG.playFx(\"divine\", 0, 0);\nG.sfx(\"powerUp\");\nG.timeout(400, () => {\n  let slidesRes = roll + 3 * G.getArtifact(\"MOON_SICKLE\");\n  G.addSlides(slidesRes);\n  G.log('✨ Restored ' + slidesRes + ' slides!');\n  let g = G.gridArray;\n  let hIdx = g.findIndex(t => t && t.val < 0);\n  if (hIdx !== -1) {\n    G.setTile(hIdx, 2);\n    G.log(\"✨ Purified a hazard!\");\n  }\n  G.render();\n});\n" } } },
    { "id": "paladin", "name": "Paladin", "icon": "🛡️", "desc": "Spell: Smite (Mult by max tile).", "d20Mod": 0, "mode": "simple", "ability": { "name": "Divine Smite", "count": 1, "sides": 8, "maxUses": 2, "spellType": "smite", "mode": "advanced", "script": { "onCast": "\nlet maxV = 2, maxI = 0;\nlet g = G.gridArray;\ng.forEach((c, i) => { if (c && c.val > maxV) { maxV = c.val; maxI = i; } });\nlet totalDmg = roll * maxV * G.player.multiplier;\nlet avengerLvl = G.getArtifact(\"HOLY_AVENGER\");\nif (avengerLvl > 0) totalDmg *= 2 * avengerLvl;\nlet rS = Math.floor(maxI / 4), cS = maxI % 4;\nG.playFx(\"smite\", rS, cS);\nG.sfx(\"smite\");\nG.timeout(300, () => {\n  G.log('🛡️ Smite amplified by x' + maxV + '!');\n  if (avengerLvl > 0) {\n    let g2 = G.gridArray;\n    g2.forEach((t, i) => { if (t && t.val < 0) G.clearTile(i); });\n    G.log(\"✨ Holy Avenger cleansed all hazards!\");\n  }\n  G.enemy.dealDamage(totalDmg);\n  G.render();\n});\n" } } },
    { "id": "bard", "name": "Bard", "icon": "🎵", "desc": "+5 Gold per D20 roll. +1 to D20. Spell: Vicious Mockery.", "d20Mod": 1, "mode": "simple", "passiveTrigger": "on_crit", "passiveEffect": "add_gold", "passiveParam": 5, "ability": { "name": "Vicious Mockery", "count": 1, "sides": 6, "maxUses": 3, "spellType": "song", "mode": "advanced", "script": { "onCast": "\nG.playFx(\"song\", 0, 0);\nG.sfx(\"powerUp\");\nG.timeout(300, () => {\n  let totalDmg = roll * G.player.multiplier;\n  let lThump = G.getArtifact(\"LUTE_THUNDER\");\n  if (lThump > 0) totalDmg *= (1 + 0.5 * lThump);\n  let g = G.gridArray;\n  g.forEach((t, i) => {\n    if (t && t.val < 0) {\n      if (t.val === -1) G.clearTile(i);\n      else { G.setTile(i, t.val + 1); }\n    }\n  });\n  G.log('🎵 Weakened all hazards!');\n  G.enemy.dealDamage(totalDmg);\n  G.render();\n});\n" } } },
    { "id": "druid", "name": "Druid", "icon": "🌿", "desc": "20% chance to purify hazard on slide. Spell: Entangle.", "d20Mod": 0, "mode": "simple", "ability": { "name": "Entangle", "count": 1, "sides": 8, "maxUses": 2, "spellType": "entangle", "mode": "advanced", "script": { "onCast": "\nG.playFx(\"entangle\", 0, 0);\nG.sfx(\"powerUp\");\nG.timeout(300, () => {\n  let slidesRes = roll + 3 * G.getArtifact(\"MOON_SICKLE\");\n  G.addSlides(slidesRes);\n  G.log('🌿 Restored ' + slidesRes + ' slides!');\n  let g = G.gridArray;\n  let hz = g.map((t, i) => ({t, i})).filter(x => x.t && x.t.val < 0);\n  if (hz.length > 0) {\n    let target = hz[G.prngInt(0, hz.length - 1)].i;\n    G.setTile(target, 2);\n    G.log(\"🌿 Entangled and purified a hazard!\");\n  }\n  G.render();\n});\n" } } },
    { "id": "fighter", "name": "Fighter", "icon": "⚔️", "desc": "+15 Base Dmg to T3+ merges. Spell: Action Surge.", "d20Mod": 0, "mode": "simple", "ability": { "name": "Action Surge", "count": 2, "sides": 6, "maxUses": 2, "spellType": "blade_storm", "mode": "advanced", "script": { "onCast": "\nlet cC = G.prngInt(0, 3);\nG.playFx(\"blade_storm\", 0, cC);\nG.sfx(\"hit\");\nG.timeout(300, () => {\n  let g = G.gridArray;\n  for (let r = 0; r < 4; r++) {\n    let idx = r * 4 + cC;\n    if (g[idx] && g[idx].val < 0) G.clearTile(idx);\n  }\n  G.enemy.dealDamage(roll * G.player.multiplier);\n  G.render();\n});\n" } } },
    { "id": "monk", "name": "Monk", "icon": "👊", "desc": "Alternating merge dirs gives +0.1 Mult. +1 to D20.", "d20Mod": 1, "mode": "simple", "ability": { "name": "Flurry of Blows", "count": 3, "sides": 4, "maxUses": 2, "spellType": "ki_strike", "mode": "advanced", "script": { "onCast": "\nG.playFx(\"ki_strike\", 0, 0);\nG.sfx(\"hit\");\nG.timeout(300, () => {\n  let g = G.gridArray;\n  for (let k = 0; k < 4; k++) {\n    let idx = G.prngInt(0, 15);\n    if (g[idx] && g[idx].val < 0) G.clearTile(idx);\n  }\n  G.enemy.dealDamage(roll * G.player.multiplier);\n  G.render();\n});\n" } } },
    { "id": "ranger", "name": "Ranger", "icon": "🏹", "desc": "+25% dmg vs spawning bosses. Spell: Hunter's Mark.", "d20Mod": -1, "mode": "simple", "ability": { "name": "Hunter's Mark", "count": 1, "sides": 8, "maxUses": 3, "spellType": "hunter_mark", "mode": "advanced", "script": { "onCast": "\nG.playFx(\"hunter_mark\", 0, 0);\nG.sfx(\"powerUp\");\nG.timeout(300, () => {\n  let dur = 3 + 2 * G.getArtifact(\"QUIVER_PLENTY\");\n  G.setHunterMark(dur);\n  G.log('🏹 Marked the boss for ' + dur + ' merges!');\n  G.enemy.dealDamage(roll * G.player.multiplier);\n  G.render();\n});\n" } } },
    { "id": "sorcerer", "name": "Sorcerer", "icon": "🔮", "desc": "D20 crit range expands to 19-20. Spell: Chaos Bolt.", "d20Mod": 1, "mode": "simple", "ability": { "name": "Chaos Bolt", "count": 2, "sides": 8, "maxUses": 1, "spellType": "chaos", "mode": "advanced", "script": { "onCast": "\nG.playFx(\"chaos\", 0, 0);\nG.sfx(\"explosion\");\nG.timeout(300, () => {\n  let effect = G.prngInt(0, 3);\n  if (G.getArtifact(\"STAFF_POWER\") > 0) effect = 0;\n  let dmg = roll * G.player.multiplier;\n  if (effect === 0) {\n    dmg *= 3;\n    G.log(\"🌀 Chaos: Triple Damage!\");\n  } else if (effect === 1) {\n    G.addSlides(15);\n    G.log(\"🌀 Chaos: +15 Slides!\");\n  } else if (effect === 2) {\n    let g = G.gridArray;\n    let empty = g.findIndex(t => t === null);\n    if (empty !== -1) G.setTile(empty, 16);\n    G.log(\"🌀 Chaos: Spawned a Battleaxe!\");\n  } else {\n    G.player.addMultiplier(1.0);\n    G.log(\"🌀 Chaos: +1.0 Multiplier this turn!\");\n  }\n  G.enemy.dealDamage(dmg);\n  G.render();\n});\n" } } }
  ]
};

const CRIT2048_DEFAULT_ARTIFACTS_PACK = {
  "id": "crit2048-default-artifacts",
  "name": "Crit 2048 — Default Artifacts",
  "version": "1.0.0",
  "game_version": "1.0.0",
  "author": "denzven",
  "description": "The core game artifacts.",
  "type": "artifacts",
  "icon": "🏺",
  "artifacts": [
    { "id": "WEIGHTED_DICE", "name": "Weighted Dice", "icon": "🎲", "rarity": "Rare", "classReq": null, "basePrice": 15, "desc": "D20 rolls < ${4 + lvl} become ${4 + lvl}.", "scripts": { "onD20": "if (roll.val < 4 + lvl) { roll.val = 4 + lvl; G.log('🎲 Weighted Dice: Roll bumped to ' + roll.val + '!'); }" } },
    { "id": "ASSASSIN_MARK", "name": "Assassin's Mark", "icon": "🎯", "rarity": "Epic", "classReq": "Rogue", "basePrice": 20, "desc": "Merging Daggers gives +${(0.1 * lvl).toFixed(1)} Mult." },
    { "id": "GRAVITY_BOOTS", "name": "Gravity Boots", "icon": "🥾", "rarity": "Common", "classReq": null, "basePrice": 10, "desc": "Slide DOWN deals ${1 + 0.5 * lvl}x Dmg, UP deals 0.5x.", "scripts": { "onMergeDamage": "if (dir === 'DOWN') { dmg.val *= (1 + 0.5 * lvl); } else if (dir === 'UP') { dmg.val *= 0.5; }" } },
    { "id": "NECRONOMICON", "name": "Necronomicon", "icon": "📖", "rarity": "Legendary", "classReq": null, "basePrice": 30, "desc": "Slime spawns deal ${50 * lvl} Dmg to Boss.", "scripts": { "onD20": "if (roll.val > 1 && roll.val < 10) {\n  let slimes = G.gridArray.filter(t => t && t.val === -1).length;\n  if (slimes > 0) {\n    G.enemy.dealDamage(50 * lvl * slimes);\n    G.log('📖 Necronomicon: Burned boss for ' + (50 * lvl * slimes) + ' dmg!');\n  }\n}" } },
    { "id": "RING_WEALTH", "name": "Ring of Wealth", "icon": "💍", "rarity": "Rare", "classReq": null, "basePrice": 15, "desc": "+${30 * lvl} Gold entering Tavern.", "scripts": { "onTavern": "G.player.addGold(30 * lvl); G.log('💍 Ring of Wealth: +' + (30 * lvl) + ' Gold!');" } },
    { "id": "BOOTS_HASTE", "name": "Boots of Haste", "icon": "⚡", "rarity": "Epic", "classReq": null, "basePrice": 20, "desc": "+${3 * lvl} Slides per Ante.", "scripts": { "onEncounterStart": "G.addSlides(3 * lvl); G.log('⚡ Boots of Haste: +' + (3 * lvl) + ' slides!');" } },
    { "id": "GIANT_POTION", "name": "Giant's Potion", "icon": "🧪", "rarity": "Rare", "classReq": null, "basePrice": 25, "desc": "Base mult permanently +${(0.3 * lvl).toFixed(1)}.", "scripts": { "onPurchase": "G.player.addMultiplier(0.3);" } },
    { "id": "VORPAL_BLADE", "name": "Vorpal Edge", "icon": "🔪", "rarity": "Legendary", "classReq": null, "basePrice": 35, "desc": "2% chance for ${200 * lvl} True Dmg on slide." },
    { "id": "CLOAK_INVIS", "name": "Cloak of Invisibility", "icon": "🧥", "rarity": "Epic", "classReq": null, "basePrice": 25, "desc": "Hazards spawn rate -${20 * lvl}%" },
    { "id": "AMULET_PROOF", "name": "Amulet of Proof", "icon": "📿", "rarity": "Rare", "classReq": null, "basePrice": 15, "desc": "D20 results 1-2 become ${1 + lvl + 1}" },
    { "id": "FLAME_TONGUE", "name": "Flame Tongue", "icon": "🔥", "rarity": "Epic", "classReq": "Fighter", "basePrice": 20, "desc": "Merging T3+ deals +${50 * lvl} AOE dmg." },
    { "id": "MOON_SICKLE", "name": "Moon Sickle", "icon": "🌙", "rarity": "Epic", "classReq": "Druid", "basePrice": 20, "desc": "Heal spells restore +${3 * lvl} extra slides." },
    { "id": "LUTE_THUNDER", "name": "Lute of Thunderous Thumping", "icon": "🎸", "rarity": "Legendary", "classReq": "Bard", "basePrice": 30, "desc": "Spell dmg x${1 + 0.5 * lvl}." },
    { "id": "STAFF_POWER", "name": "Staff of Power", "icon": "🏛️", "rarity": "Legendary", "classReq": "Sorcerer", "basePrice": 35, "desc": "Chaos Bolt always picks best outcome." },
    { "id": "BRACERS_DEF", "name": "Bracers of Defense", "icon": "🛡️", "rarity": "Rare", "classReq": "Monk", "basePrice": 15, "desc": "+${2 * lvl} slides per D20 roll." },
    { "id": "QUIVER_PLENTY", "name": "Quiver of Ehlonna", "icon": "🏹", "rarity": "Rare", "classReq": "Ranger", "basePrice": 15, "desc": "Hunter's Mark lasts +${2 * lvl} merges." },
    { "id": "BAG_HOLDING", "name": "Bag of Holding", "icon": "💼", "rarity": "Common", "classReq": null, "basePrice": 10, "desc": "Shop offers +${1 * lvl} artifact slots." },
    { "id": "HELM_BRILLI", "name": "Helm of Brilliance", "icon": "👑", "rarity": "Legendary", "classReq": null, "basePrice": 35, "desc": "Crits deal ${2 + 1 * lvl}x dmg." },
    { "id": "STONE_LUCK", "name": "Stone of Good Luck", "icon": "🪨", "rarity": "Rare", "classReq": null, "basePrice": 20, "desc": "+${1 * lvl} to ALL D20 rolls." },
    { "id": "ADAMANTINE", "name": "Adamantine Armor", "icon": "⬛", "rarity": "Epic", "classReq": null, "basePrice": 25, "desc": "Immune to crit fail (D20 = 1)." },
    { "id": "IMMOV_ROD", "name": "Immovable Rod", "icon": "🔩", "rarity": "Rare", "classReq": null, "basePrice": 15, "desc": "Hazards can't spawn adjacent to best weapon." },
    { "id": "DECK_MANY", "name": "Deck of Many Things", "icon": "🃏", "rarity": "Artifact", "classReq": null, "basePrice": 50, "desc": "D20 outcomes are doubled." },
    { "id": "HOLY_AVENGER", "name": "Holy Avenger", "icon": "⚔️", "rarity": "Artifact", "classReq": "Paladin", "basePrice": 50, "desc": "Smite dmg x${2 * lvl}. Hazards take AOE on cast." },
    { "id": "SPELL_SCROLL", "name": "Spell Scroll", "icon": "📜", "rarity": "Common", "classReq": null, "basePrice": 15, "desc": "+${1 * lvl} max spell uses." }
  ]
};

const CRIT2048_DEFAULT_SKIN_PACK = {
  "id": "crit2048-default-skin",
  "name": "Crit 2048 — Original Theme",
  "version": "1.0.0",
  "game_version": "1.0.0",
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
      "onLoad": `
        G.log('Skin: Spawning atmosphere...');
        G.injectCss('skin-particles', \`
          .skin-particle {
            position: absolute;
            pointer-events: none;
            border-radius: 50%;
            background: var(--pack-primary);
            z-index: 1;
            filter: blur(1px);
            opacity: 0;
            animation: float-particle 10s infinite ease-in-out;
          }
          @keyframes float-particle {
            0% { transform: translate(0, 0) scale(1); opacity: 0; }
            20% { opacity: 0.5; }
            50% { transform: translate(80px, -150px) scale(1.5); opacity: 0.3; }
            80% { opacity: 0.5; }
            100% { transform: translate(-40px, -300px) scale(1); opacity: 0; }
          }
        \`);
        
        for(let i=0; i<35; i++) {
          const p = G.dom.create('div', 'sp-' + i, 'skin-particle');
          if (!p) continue;
          p.style.width = (G.prng() * 6 + 4) + 'px';
          p.style.height = p.style.width;
          p.style.left = (G.prng() * 100) + 'vw';
          p.style.top = (G.prng() * 100) + 'vh';
          p.style.animationDelay = (G.prng() * 10) + 's';
          G.dom.append(document.body, p);
        }
      `
    }
  }
};

const CRIT2048_SHADOWFELL_SKIN_PACK = {
  "id": "crit2048-shadowfell-skin",
  "name": "Crit 2048 — Shadowfell Noir",
  "version": "1.0.0",
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
    "borderRadius": "2px",
    "customCss": ".tile { box-shadow: 0 0 10px rgba(168, 85, 247, 0.2); }",
    "script": {
      "onLoad": `
        if (window._skinPulseTimer) clearInterval(window._skinPulseTimer);
        document.querySelectorAll('canvas.skin-bg-element').forEach(c => c.remove());
        const main = document.getElementById('main-container');
        if (main) main.style.zIndex = '10';

        const canvas = G.dom.create('canvas', 'skin-pulse-canvas', 'skin-bg-element');
        canvas.style.position = 'fixed';
        canvas.style.inset = '0';
        canvas.style.zIndex = '1';
        G.dom.append(document.body, canvas);

        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        const lines = [];
        for (let i = 0; i < 20; i++) {
          lines.push({
            x: Math.random() * w,
            y: Math.random() * h,
            len: Math.random() * 300 + 100,
            speed: Math.random() * 1 + 0.5,
            angle: Math.random() * Math.PI * 2
          });
        }

        window._skinPulseTimer = setInterval(() => {
          if (!document.getElementById('skin-pulse-canvas')) return;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
          ctx.lineWidth = 1;
          lines.forEach(l => {
            l.x += Math.cos(l.angle) * l.speed;
            l.y += Math.sin(l.angle) * l.speed;
            if (l.x < -300) l.x = w + 300; if (l.x > w + 300) l.x = -300;
            if (l.y < -300) l.y = h + 300; if (l.y > h + 300) l.y = -300;
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.x + Math.cos(l.angle) * l.len, l.y + Math.sin(l.angle) * l.len);
            ctx.stroke();
          });
        }, 30);
      `
    }
  }
};

const CRIT2048_DEFAULT_WEAPONS_PACK = {
  "id": "crit2048-default-weapons",
  "name": "Crit 2048 — Default Weapons",
  "version": "1.0.0",
  "game_version": "1.0.0",
  "author": "denzven",
  "description": "The core game arsenal.",
  "type": "weapon",
  "icon": "⚔️",
  "weapons": [
    { "tileValue": 2, "name": "Dagger", "icon": "🗡️", "text": "text-slate-900", "bg": "bg-slate-300", "dmg": 2 },
    { "tileValue": 4, "name": "Longsword", "icon": "⚔️", "text": "text-slate-900", "bg": "bg-slate-400", "dmg": 8 },
    { "tileValue": 8, "name": "Crossbow", "icon": "🏹", "text": "text-white", "bg": "bg-amber-600", "dmg": 20 },
    { "tileValue": 16, "name": "Battleaxe", "icon": "🪓", "text": "text-white", "bg": "bg-orange-600", "dmg": 50 },
    { "tileValue": 32, "name": "Magic Staff", "icon": "🪄", "text": "text-white", "bg": "bg-red-600", "dmg": 120 },
    { "tileValue": 64, "name": "Holy Sword", "icon": "✨", "text": "text-white", "bg": "bg-purple-600", "dmg": 300 },
    { "tileValue": 128, "name": "Relic", "icon": "👑", "text": "text-white", "bg": "bg-indigo-700", "dmg": 1280 },
    { "tileValue": 256, "name": "Greatsword", "icon": "⚡", "text": "text-white", "bg": "bg-cyan-600", "dmg": 2560 },
    { "tileValue": 512, "name": "Legendary Blade", "icon": "💎", "text": "text-white", "bg": "bg-gradient-to-r from-indigo-600 to-purple-600", "dmg": 5120 }
  ]
};

const CRIT2048_DEFAULT_PACK = {
  "id": "crit2048-default",
  "name": "Crit 2048 — Default Mega Pack",
  "version": "1.0.0",
  "author": "denzven",
  "description": "The complete built-in game content.",
  "type": "mega",
  "icon": "🐉",
  "hasAdvancedScripts": true,
  "enemies": CRIT2048_DEFAULT_ENEMIES_PACK.enemies,
  "hazards": CRIT2048_DEFAULT_HAZARDS_PACK.hazards,
  "classes": CRIT2048_DEFAULT_CLASSES_PACK.classes,
  "artifacts": CRIT2048_DEFAULT_ARTIFACTS_PACK.artifacts,
  "skin": CRIT2048_DEFAULT_SKIN_PACK.skin,
  "weapons": CRIT2048_DEFAULT_WEAPONS_PACK.weapons
};