import type { Band } from '../../engine/adaptive';
import { numberOptions, rand, sample, shuffle } from '../../lib/util';

export type Token = { t: 'emoji'; v: string } | { t: 'num'; v: number } | { t: 'dots'; v: number };

export interface TrainItem {
  say: string;
  cars: Token[];
  answer: Token;
  options: Token[];
}

export const tokenKey = (k: Token) => `${k.t}:${k.v}`;
export const tokenLabel = (k: Token) => (k.t === 'dots' ? `${k.v} ${k.v === 1 ? 'dot' : 'dots'}` : String(k.v));

const POOL = ['🍎', '🐸', '⭐', '🌸', '🐟', '🎈', '🍋', '🦋'];
const emoji = (v: string): Token => ({ t: 'emoji', v });

function emojiPattern(unit: string[], choices: number): TrainItem {
  const cars = Array.from({ length: 5 }, (_, i) => emoji(unit[i % unit.length]));
  const answer = emoji(unit[cars.length % unit.length]);
  const distract = sample(POOL.filter((x) => x !== answer.v), choices - 1).map(emoji);
  return { say: 'What comes next on the train?', cars, answer, options: shuffle([answer, ...distract]) };
}

export function genTrain(band: Band, level: number, choices: number): TrainItem {
  if (band === 'young') {
    if (level === 1) return emojiPattern(sample(POOL, 2), choices); // ABAB
    if (level === 2) return emojiPattern(sample(POOL, 3), choices); // ABC
    const s = rand(1, 2); // growing: 1, 2, 3 -> 4
    const cars: Token[] = [0, 1, 2].map((i) => ({ t: 'dots', v: s + i }));
    const answer = s + 3;
    return {
      say: 'The train is growing! What comes next?',
      cars,
      answer: { t: 'dots', v: answer },
      options: numberOptions(answer, choices, 1, 8).map((v): Token => ({ t: 'dots', v })),
    };
  }
  const seq =
    level === 3
      ? (() => {
          const s = rand(1, 3);
          return [s, s * 2, s * 4, s * 8, s * 16];
        })()
      : (() => {
          const step = level === 1 ? 2 : 5;
          const s = rand(0, 10);
          return [0, 1, 2, 3, 4].map((i) => s + i * step);
        })();
  const answer = seq[4];
  return {
    say: 'Which number comes next on the train?',
    cars: seq.slice(0, 4).map((v): Token => ({ t: 'num', v })),
    answer: { t: 'num', v: answer },
    options: numberOptions(answer, choices, Math.max(0, answer - 12), answer + 12).map((v): Token => ({ t: 'num', v })),
  };
}
