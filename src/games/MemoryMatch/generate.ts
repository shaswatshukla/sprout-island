import type { Band } from '../../engine/adaptive';
import { range, sample, shuffle } from '../../lib/util';

export interface Card {
  id: string;
  pair: number;
  face: string; // emoji, numeral or word
  dots?: number; // quantity card
  word?: boolean; // render as text
  speak: string;
}

// Short words only, so they fit a 4x4 grid on a phone.
const ANIMALS: [string, string][] = [
  ['🐶', 'dog'], ['🐱', 'cat'], ['🐸', 'frog'], ['🦁', 'lion'], ['🐷', 'pig'],
  ['🦉', 'owl'], ['🦊', 'fox'], ['🐝', 'bee'], ['🐮', 'cow'], ['🦆', 'duck'],
];
const OBJECTS: [string, string][] = [
  ['🍎', 'apple'], ['🚗', 'car'], ['🏠', 'house'], ['⭐', 'star'], ['🌙', 'moon'],
  ['🪁', 'kite'], ['🎂', 'cake'], ['⚽', 'ball'], ['🌳', 'tree'], ['⛵', 'boat'],
];

export const pairsFor = (level: number) => [3, 6, 8][level - 1] ?? 3;
/** Pairs per round: level 1 plays two small boards so a round is still 6 items. */
export const totalPairs = (level: number) => (level === 1 ? 6 : pairsFor(level));
export const colsFor = (level: number) => (level === 1 ? 3 : 4);

export function genBoard(band: Band, level: number): Card[] {
  const n = pairsFor(level);
  const cards: Omit<Card, 'id'>[] = [];
  if (band === 'young' && level === 1) {
    sample(ANIMALS, n).forEach(([e, w], pair) => cards.push({ pair, face: e, speak: w }, { pair, face: e, speak: w }));
  } else if (band === 'young') {
    sample(range(1, 10), n).forEach((k, pair) =>
      cards.push({ pair, face: String(k), word: true, speak: String(k) }, { pair, face: '', dots: k, speak: `${k} ${k === 1 ? 'dot' : 'dots'}` }),
    );
  } else {
    sample(level === 3 ? OBJECTS : ANIMALS, n).forEach(([e, w], pair) =>
      cards.push({ pair, face: e, speak: w }, { pair, face: w, word: true, speak: w }),
    );
  }
  return shuffle(cards).map((c, i) => ({ ...c, id: `c${i}` }));
}
