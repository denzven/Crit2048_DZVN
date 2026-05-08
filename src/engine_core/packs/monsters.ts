import type { PackData } from '../../types/pack';

export const CRIT2048_DEFAULT_MONSTERS_PACK: PackData = {
  "id": "crit2048-default-monsters",
  "name": "Crit 2048 — Default Monsters",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "The core game monsters.",
  "type": "monsters",
  "icon": "👹",
  "monsters": [
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
    { "id": "tiamat", "parent": "tiamat_preset", "name": "Tiamat", "hp": 30000, "slides": 50, "icon": "🐲", "lore": "Five Heads (Composite of all boss powers)", "mode": "advanced" }
  ]
};
