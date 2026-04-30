// --- GAME STATE ---
let tileIdCounter = 1;

const state = {
  gameState: "START",
  grid: Array(16).fill(null),
  encounterIdx: 0,
  monsterHp: 0,
  monsterMaxHp: 0,
  slidesLeft: 0,
  gold: config.startingGold,
  multiplier: 1.0,
  playerClass: null,
  artifacts: [],
  slidesSinceRoll: 0,
  slidesTotalInEncounter: 0,
  usesLeft: 0,
  logs: [],
  isRolling: false,
  isSelecting: false,
  // Guard flags — prevent race conditions on rapid input or resume
  isGameOver: false,       // Set immediately when game-over is detected, before setTimeout
  isTransitioning: false,  // Set during state transitions to block concurrent processMove calls
  shopPool: [],
  currentAttackInfo: null,
  runStats: { 
    maxDamage: 0, 
    totalDamageDealt: 0,
    totalMerges: 0,
    totalMoves: 0,
    totalCoinsSpent: 0,
    maxMultiplier: 1.0,
    lastRoundDamage: 0,
    highestTileValue: 2,
    totalHazardsCleared: 0,
    mostMergedVal: 2,
    mergeCounts: {},
    abilityUses: 0,
    spellDamageDealt: 0,
    totalSpellsCast: 0,
    hazardsSpawned: 0,
    luckFactor: 10,
    startTime: 0,
    endTime: 0,
    seedUsed: "",
    endReason: "" 
  },
  lastDirection: null,
  hunterMarkLeft: 0,
  tavernRespinCount: 0,
};

function saveGameState() {
  const bundle = {
    state,
    tileIdCounter,
    config
  };
  localStorage.setItem("crit2048_save", JSON.stringify(bundle));
}

function loadGameState() {
  const saved = localStorage.getItem("crit2048_save");
  if (!saved) return false;
  try {
    const bundle = JSON.parse(saved);
    Object.assign(state, bundle.state);
    tileIdCounter = bundle.tileIdCounter;
    Object.assign(config, bundle.config);
    // Always reset transient flags — they must never be persisted
    state.isGameOver = false;
    state.isTransitioning = false;
    state.isRolling = false;
    // Clamp values that should never be negative after a load
    state.monsterHp = Math.max(0, state.monsterHp || 0);
    state.slidesLeft = Math.max(0, state.slidesLeft || 0);
    state.gold = Math.max(0, state.gold || 0);
    return true;
  } catch (e) {
    console.error("Load failed", e);
    return false;
  }
}

function clearSave() {
  localStorage.removeItem("crit2048_save");
}
