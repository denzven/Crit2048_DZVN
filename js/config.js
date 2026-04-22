// --- API KEY & GLOBAL CONFIG ---
const apiKey = "";
const config = {
  turnsBeforeDice: 5,
  startingGold: 0,
  sfxVolume: 1.0,
  screenShake: 1.0,
  diceTheme: "default",
};

const DICE_THEMES = {
  default: {
    bg: "#0f172a",
    tray: "#050505",
    6: "#3b82f6",
    8: "#eab308",
    10: "#a855f7",
    20: "#f43f5e",
  },
  blood: {
    bg: "#450a0a",
    tray: "#170505",
    6: "#fca5a5",
    8: "#f87171",
    10: "#ef4444",
    20: "#dc2626",
  },
  bone: {
    bg: "#fdf6e3",
    tray: "#44403c",
    6: "#475569",
    8: "#334155",
    10: "#1e293b",
    20: "#0f172a",
  },
  neon: {
    bg: "#020617",
    tray: "#0f172a",
    6: "#0ea5e9",
    8: "#10b981",
    10: "#d946ef",
    20: "#f43f5e",
  },
};
