// Pure adaptive-difficulty engine. No React, no storage: state in, state out.

export type Band = 'young' | 'older'; // young = ages 4–6, older = ages 7–10

export interface Answer {
  correct: boolean;
  usedHint: boolean;
}

export interface AdaptiveState {
  band: Band;
  level: number; // 1..3 within the band
  window: Answer[]; // last WINDOW answers
  helpNext: boolean; // give the next item extra help
  topRounds: number; // consecutive mastered rounds at level 3
  promotionOffered: boolean;
}

export interface Difficulty {
  level: number;
  choices: number;
  hint: boolean;
}

export const WINDOW = 8;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 3;
const UP = 0.85;
const DOWN = 0.5;
const MIN_FOR_DOWN = 4; // step down early so a struggling child is helped quickly

export const newState = (band: Band): AdaptiveState => ({
  band,
  level: MIN_LEVEL,
  window: [],
  helpNext: false,
  topRounds: 0,
  promotionOffered: false,
});

export const clampLevel = (level: number) =>
  Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(level) || MIN_LEVEL));

export const accuracy = (w: Answer[]) => (w.length ? w.filter((a) => a.correct).length / w.length : 0);

export function recordAnswer(s: AdaptiveState, correct: boolean, usedHint: boolean): AdaptiveState {
  const level = clampLevel(s.level);
  const window = [...s.window, { correct, usedHint }].slice(-WINDOW);
  const acc = accuracy(window);
  if (window.length === WINDOW && acc >= UP && window.every((a) => !a.usedHint) && level < MAX_LEVEL) {
    return { ...s, level: level + 1, window: [], helpNext: false };
  }
  if (window.length >= MIN_FOR_DOWN && acc < DOWN) {
    return { ...s, level: Math.max(MIN_LEVEL, level - 1), window: [], helpNext: true };
  }
  return { ...s, level, window, helpNext: false };
}

/** Call once per finished round. Two mastered level-3 rounds in a row offer the next band. */
export function recordRound(s: AdaptiveState, roundAccuracy: number): AdaptiveState {
  if (s.band !== 'young') return s;
  const topRounds = clampLevel(s.level) === MAX_LEVEL && roundAccuracy >= UP ? s.topRounds + 1 : 0;
  return { ...s, topRounds, promotionOffered: topRounds >= 2 };
}

export const acceptPromotion = (s: AdaptiveState): AdaptiveState => (s.band === 'young' ? newState('older') : s);

export const declinePromotion = (s: AdaptiveState): AdaptiveState => ({ ...s, topRounds: 0, promotionOffered: false });

export function nextDifficulty(s: AdaptiveState): Difficulty {
  const level = clampLevel(s.level);
  const base = level + 2; // 3, 4, 5 choices
  return s.helpNext ? { level, choices: Math.max(2, base - 1), hint: true } : { level, choices: base, hint: false };
}
