// --- SEEDED PRNG SYSTEM ---
let currentSeed = 1337;

function setSeed(str) {
  if (!str) str = (Math.random() * 4294967296 >>> 0).toString();
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  currentSeed = h >>> 0;
}

function prng() {
  let t = currentSeed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function prngInt(min, max) { return Math.floor(prng() * (max - min + 1)) + min; }
