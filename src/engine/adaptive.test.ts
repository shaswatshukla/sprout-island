import { describe, expect, it } from 'vitest';
import {
  acceptPromotion,
  type AdaptiveState,
  newState,
  nextDifficulty,
  recordAnswer,
  recordRound,
} from './adaptive';

const feed = (s: AdaptiveState, n: number, correct: boolean, hint = false) => {
  for (let i = 0; i < n; i++) s = recordAnswer(s, correct, hint);
  return s;
};

describe('adaptive engine', () => {
  it('levels up after a full window of strong answers without hints', () => {
    const s = feed(newState('young'), 7, true);
    expect(s.level).toBe(1);
    const up = feed(s, 1, true);
    expect(up.level).toBe(2);
    expect(up.window).toEqual([]);
  });

  it('uses the 85% threshold: 7/8 levels up, 6/8 does not', () => {
    expect(feed(feed(newState('young'), 1, false), 7, true).level).toBe(2);
    expect(feed(feed(newState('young'), 2, false), 6, true).level).toBe(1);
  });

  it('does not level up when hints were used', () => {
    expect(feed(newState('young'), 8, true, true).level).toBe(1);
  });

  it('levels down below 50% and gives the next item extra help', () => {
    let s: AdaptiveState = { ...newState('older'), level: 2 };
    s = feed(feed(s, 1, true), 3, false);
    expect(s.level).toBe(1);
    expect(s.helpNext).toBe(true);
    expect(nextDifficulty(s)).toEqual({ level: 1, choices: 2, hint: true });
    expect(recordAnswer(s, true, true).helpNext).toBe(false);
  });

  it('clamps levels to 1..3', () => {
    expect(feed(newState('young'), 40, true).level).toBe(3);
    expect(feed(newState('young'), 40, false).level).toBe(1);
    expect(nextDifficulty({ ...newState('young'), level: 7 }).level).toBe(3);
    expect(nextDifficulty({ ...newState('young'), level: Number.NaN }).level).toBe(1);
  });

  it('maps level to number of choices', () => {
    expect([1, 2, 3].map((level) => nextDifficulty({ ...newState('young'), level }).choices)).toEqual([3, 4, 5]);
  });

  it('offers band promotion after 2 consecutive mastered level-3 rounds', () => {
    let s: AdaptiveState = { ...newState('young'), level: 3 };
    s = recordRound(s, 0.9);
    expect(s.promotionOffered).toBe(false);
    s = recordRound(s, 0.6); // streak broken
    expect(s.topRounds).toBe(0);
    s = recordRound(recordRound(s, 0.9), 1);
    expect(s.promotionOffered).toBe(true);
    const p = acceptPromotion(s);
    expect(p.band).toBe('older');
    expect(p.level).toBe(1);
  });

  it('never offers promotion below level 3 or to the older band', () => {
    let young: AdaptiveState = { ...newState('young'), level: 2 };
    young = recordRound(recordRound(young, 1), 1);
    expect(young.promotionOffered).toBe(false);
    let older: AdaptiveState = { ...newState('older'), level: 3 };
    older = recordRound(recordRound(older, 1), 1);
    expect(older.promotionOffered).toBe(false);
  });
});
