import type { Band } from '../../engine/adaptive';
import { numberOptions, pick, rand } from '../../lib/util';

export type BubbleShow = { kind: 'count'; emoji: string; n: number } | { kind: 'text'; text: string } | { kind: 'ear' };

export interface BubbleItem {
  say: string;
  label: string;
  show: BubbleShow;
  answer: number;
  options: number[];
}

const THINGS: [string, string][] = [
  ['🍎', 'apples'],
  ['🐞', 'ladybugs'],
  ['⭐', 'stars'],
  ['🐟', 'fish'],
  ['🌸', 'flowers'],
  ['🦆', 'ducks'],
];

export function genBubble(band: Band, level: number, choices: number): BubbleItem {
  if (band === 'young') {
    if (level === 3) {
      const n = rand(0, 10);
      return { say: `Pop the number ${n}!`, label: 'Listen for the number', show: { kind: 'ear' }, answer: n, options: numberOptions(n, choices, 0, 10) };
    }
    const n = rand(1, level === 1 ? 5 : 10);
    const [emoji, name] = pick(THINGS);
    return {
      say: `How many ${name}? Pop the right number!`,
      label: `${n} ${name}`,
      show: { kind: 'count', emoji, n },
      answer: n,
      options: numberOptions(n, choices, 1, 10),
    };
  }
  if (level === 3) {
    const t = pick([2, 5, 10]);
    const k = rand(1, 10);
    return {
      say: `What is ${t} times ${k}?`,
      label: `${t} times ${k}`,
      show: { kind: 'text', text: `${t} × ${k}` },
      answer: t * k,
      options: numberOptions(k, choices, 1, 12).map((x) => x * t), // distractors are nearby multiples
    };
  }
  const max = level === 1 ? 20 : 100;
  const add = Math.random() < 0.5;
  const a = add ? rand(1, max - 1) : rand(2, max);
  const b = add ? rand(1, max - a) : rand(1, a);
  const answer = add ? a + b : a - b;
  return {
    say: `What is ${a} ${add ? 'plus' : 'minus'} ${b}?`,
    label: `${a} ${add ? 'plus' : 'minus'} ${b}`,
    show: { kind: 'text', text: `${a} ${add ? '+' : '−'} ${b}` },
    answer,
    options: numberOptions(answer, choices, 0, max),
  };
}
