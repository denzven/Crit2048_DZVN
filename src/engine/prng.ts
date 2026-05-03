/**
 * SEEDED PRNG SYSTEM
 * Ensures deterministic runs for competition and sharing.
 */
class PRNG {
  private currentSeed: number = 1337;

  setSeed(str?: string) {
    if (!str) str = ((Math.random() * 4294967296) >>> 0).toString();
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    this.currentSeed = h >>> 0;
    return str;
  }

  random(): number {
    let t = (this.currentSeed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}

export const SeededRNG = new PRNG();
