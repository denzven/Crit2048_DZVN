import { SeededRNG } from '../src/engine/prng';

describe('SeededRNG', () => {
  test('should be deterministic with the same seed', () => {
    SeededRNG.setSeed('test-seed');
    const seq1 = [SeededRNG.random(), SeededRNG.random(), SeededRNG.random()];

    SeededRNG.setSeed('test-seed');
    const seq2 = [SeededRNG.random(), SeededRNG.random(), SeededRNG.random()];

    expect(seq1).toEqual(seq2);
  });

  test('should produce different sequences for different seeds', () => {
    SeededRNG.setSeed('seed-a');
    const valA = SeededRNG.random();

    SeededRNG.setSeed('seed-b');
    const valB = SeededRNG.random();

    expect(valA).not.toEqual(valB);
  });

  test('randomInt should stay within bounds', () => {
    SeededRNG.setSeed('bounds-test');
    for (let i = 0; i < 100; i++) {
      const val = SeededRNG.randomInt(1, 10);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  test('should handle numeric string seeds', () => {
    const seed = '12345';
    SeededRNG.setSeed(seed);
    const val1 = SeededRNG.random();

    SeededRNG.setSeed(seed);
    const val2 = SeededRNG.random();

    expect(val1).toEqual(val2);
  });
});
