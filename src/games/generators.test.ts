import { describe, expect, it } from 'vitest';
import type { Band } from '../engine/adaptive';
import { genBubble } from './BubblePop/generate';
import { genLetter } from './LetterGarden/generate';
import { genBoard, pairsFor } from './MemoryMatch/generate';
import { tokenKey, genTrain } from './PatternTrain/generate';
import { genShape } from './ShapeFactory/generate';

const BANDS: Band[] = ['young', 'older'];
const RUNS = 60;

// Every band x level x choice-count, many random draws: the right answer is always offered, once.
const each = (fn: (band: Band, level: number, choices: number) => void) => {
  for (const band of BANDS)
    for (const level of [1, 2, 3])
      for (const choices of [2, 3, 4, 5]) for (let i = 0; i < RUNS; i++) fn(band, level, choices);
};

describe('game generators', () => {
  it('bubble pop: answer is among distinct options', () =>
    each((b, l, c) => {
      const it = genBubble(b, l, c);
      expect(it.options).toContain(it.answer);
      expect(new Set(it.options).size).toBe(c);
    }));

  it('letter garden: pots contain the answer; spelling tiles contain every letter of the word', () =>
    each((b, l, c) => {
      const it = genLetter(b, l, c);
      if (it.mode === 'pots') {
        expect(it.pots.map((p) => p.id)).toContain(it.answerId);
        expect(new Set(it.pots.map((p) => p.id)).size).toBe(c);
      } else {
        expect(it.word.length).toBe(l + 2);
        for (const ch of it.word) expect(it.tiles.filter((t) => t.ch === ch).length).toBeGreaterThanOrEqual([...it.word].filter((x) => x === ch).length);
      }
    }));

  it('memory: every card has exactly one partner', () =>
    each((b, l) => {
      const cards = genBoard(b, l);
      expect(cards.length).toBe(pairsFor(l) * 2);
      const counts = new Map<number, number>();
      cards.forEach((c) => counts.set(c.pair, (counts.get(c.pair) ?? 0) + 1));
      expect([...counts.values()].every((n) => n === 2)).toBe(true);
    }));

  it('shape factory: answer target exists and targets are distinct', () =>
    each((b, l, c) => {
      const it = genShape(b, l, c);
      const ids = it.targets.map((t) => t.id);
      expect(ids).toContain(it.answerId);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBe(it.mode === 'pie' ? Math.min(c, 4) : c);
    }));

  it('pattern train: answer is among distinct options', () =>
    each((b, l, c) => {
      const it = genTrain(b, l, c);
      const keys = it.options.map(tokenKey);
      expect(keys).toContain(tokenKey(it.answer));
      expect(new Set(keys).size).toBe(c);
    }));
});
