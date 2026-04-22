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
  shopPool: [],
  currentAttackInfo: null,
  runStats: { maxDamage: 0, totalMerges: 0 },
  lastDirection: null,
  hunterMarkLeft: 0,
};
