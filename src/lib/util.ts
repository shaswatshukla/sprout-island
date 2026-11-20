export const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const pick = <T,>(arr: readonly T[]): T => arr[rand(0, arr.length - 1)];

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const sample = <T,>(arr: readonly T[], n: number): T[] => shuffle(arr).slice(0, n);

export const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/** `count` distinct numbers in [min, max] including `answer`; distractors are close to it. */
export function numberOptions(answer: number, count: number, min: number, max: number): number[] {
  const near = range(min, max).filter((x) => x !== answer);
  near.sort((a, b) => Math.abs(a - answer) - Math.abs(b - answer));
  return shuffle([answer, ...sample(near.slice(0, Math.max(4, count * 2)), count - 1)]);
}
