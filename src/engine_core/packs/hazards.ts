import type { PackData } from '../../types/pack';

export const CRIT2048_DEFAULT_HAZARDS_PACK: PackData = {
  "id": "crit2048-default-hazards",
  "name": "Crit 2048 — Default Hazards",
  "version": "1.0.0",
  "game_version": ">=1.0.0",
  "author": "denzven",
  "description": "The core game hazards.",
  "type": "hazards",
  "icon": "⚠️",
  "hazards": [
    { "id": "-1", "name": "Slime", "icon": "🟢", "bg": "bg-lime-600", "lore": "Spreads every 10 turns." },
    { "id": "-2", "name": "Goblin", "icon": "👺", "bg": "bg-emerald-700", "lore": "Steals 10 gold on contact." },
    { "id": "-3", "name": "Skeleton", "icon": "💀", "bg": "bg-gray-700", "lore": "Blocks merges in its column." },
    { "id": "-4", "name": "Mimic", "icon": "📦", "bg": "bg-yellow-700", "lore": "Looks like a weapon until touched." },
    { "id": "-5", "name": "Web", "icon": "🕸️", "bg": "bg-neutral-600", "lore": "Slows adjacent tile movement." },
    { "id": "-6", "name": "Curse", "icon": "🔮", "bg": "bg-violet-800", "lore": "Reduces D20 luck by 2." },
    { "id": "-7", "name": "Spore", "icon": "🍄", "bg": "bg-green-800", "lore": "Explodes into 2 slimes." }
  ]
};
