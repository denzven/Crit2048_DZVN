// --- GAME DATA ---
// Base game data has been extracted to CRIT2048_DEFAULT_PACK in pack-default.js.
// These arrays/objects are populated at runtime by the PackEngine.

const CLASSES = {};
const ENCOUNTERS = [];
const MASTER_ARTIFACTS = [];

// --- DATA HELPERS ---
const getRarityColor = (rarity) => {
  if (rarity === "Common") return "text-slate-300 border-slate-600";
  if (rarity === "Rare") return "text-blue-400 border-blue-600";
  if (rarity === "Epic") return "text-purple-400 border-purple-600";
  if (rarity === "Artifact") return "text-red-400 border-red-600";
  return "text-orange-400 border-orange-600";
};

// This function is now patched by PackEngine using pack.weapons overrides.
// The base implementation provides empty fallback.
window.getWeaponStats = (val) => {
  return { name: "", icon: "", bg: "bg-slate-800", text: "", dmg: 0 };
};

