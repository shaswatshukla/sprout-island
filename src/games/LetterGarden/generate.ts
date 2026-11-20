import type { Band } from '../../engine/adaptive';
import { pick, sample, shuffle } from '../../lib/util';

// One letter per starting sound. K is left out so C and K never compete for the same sound.
const PICS: Record<string, [string, string][]> = {
  A: [['apple', '🍎'], ['ant', '🐜']],
  B: [['bee', '🐝'], ['banana', '🍌']],
  C: [['cat', '🐱'], ['cake', '🎂']],
  D: [['dog', '🐶'], ['duck', '🦆']],
  F: [['fish', '🐟'], ['frog', '🐸']],
  G: [['grapes', '🍇'], ['goat', '🐐']],
  H: [['hat', '🎩'], ['horse', '🐴']],
  L: [['lion', '🦁'], ['leaf', '🍃']],
  M: [['moon', '🌙'], ['monkey', '🐵']],
  P: [['pig', '🐷'], ['pizza', '🍕']],
  R: [['rabbit', '🐰'], ['rainbow', '🌈']],
  S: [['sun', '☀️'], ['snake', '🐍']],
  T: [['tree', '🌳'], ['tiger', '🐯']],
  Z: [['zebra', '🦓'], ['zero', '0️⃣']],
};
const LETTERS = Object.keys(PICS);

const WORDS: [string, string][][] = [
  [['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['pig', '🐷'], ['bus', '🚌'], ['hat', '🎩'], ['bed', '🛏️'], ['fox', '🦊'], ['cup', '☕'], ['hen', '🐔']],
  [['frog', '🐸'], ['fish', '🐟'], ['duck', '🦆'], ['star', '⭐'], ['cake', '🎂'], ['tree', '🌳'], ['ship', '🚢'], ['drum', '🥁'], ['moon', '🌙'], ['bell', '🔔']],
  [['apple', '🍎'], ['house', '🏠'], ['train', '🚆'], ['snake', '🐍'], ['zebra', '🦓'], ['horse', '🐴'], ['plant', '🪴'], ['clock', '🕐'], ['whale', '🐳'], ['chair', '🪑']],
];

export interface Pot {
  id: string;
  pic: string;
  aria: string;
}

export type LetterItem =
  | { mode: 'pots'; say: string; seed: string; pots: Pot[]; answerId: string }
  | { mode: 'spell'; say: string; word: string; emoji: string; tiles: { id: string; ch: string }[] };

export function genLetter(band: Band, level: number, choices: number): LetterItem {
  if (band === 'young') {
    const letters = sample(LETTERS, choices);
    const target = letters[0];
    const pots = shuffle(letters).map((L): Pot => {
      if (level === 3) return { id: L, pic: L, aria: `Pot with big letter ${L}` };
      const [word, emoji] = pick(PICS[L]);
      return { id: L, pic: emoji, aria: `Pot with a picture of ${word}` };
    });
    return {
      mode: 'pots',
      say:
        level === 3
          ? `Find the big letter that matches little ${target}. Put the seed in its pot!`
          : `Which picture starts with ${target}? Put the seed in its pot!`,
      seed: level === 1 ? target : target.toLowerCase(),
      pots,
      answerId: target,
    };
  }
  const [word, emoji] = pick(WORDS[level - 1]);
  const extra = sample([...'abdefghilmnoprstuw'].filter((c) => !word.includes(c)), Math.max(0, choices - 3));
  const tiles = shuffle([...word, ...extra]).map((ch, i) => ({ id: `t${i}`, ch }));
  return { mode: 'spell', say: `Spell ${word}!`, word, emoji, tiles };
}
