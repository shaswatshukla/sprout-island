import type { Band } from '../../engine/adaptive';
import { pick, sample, shuffle } from '../../lib/util';

export const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'] as const;
export const COLORS = { red: '#ef4444', blue: '#3b82f6', yellow: '#facc15', green: '#22c55e', purple: '#a855f7' };
export type Shape = (typeof SHAPES)[number];
export type Color = keyof typeof COLORS;

export type Piece = { kind: 'shape'; shape: Shape; color: Color } | { kind: 'pie'; num: number; den: number };
export type Mode = 'shape' | 'both' | 'pie';

export interface Target {
  id: string;
  piece: Piece;
  label: string;
}

export interface ShapeItem {
  mode: Mode;
  say: string;
  piece: Piece;
  targets: Target[];
  answerId: string;
}

const FRACTIONS: [number, number, string][] = [
  [1, 4, 'one quarter'],
  [1, 2, 'one half'],
  [3, 4, 'three quarters'],
  [4, 4, 'the whole pie'],
];

export const pieceLabel = (p: Piece) =>
  p.kind === 'shape' ? `${p.color} ${p.shape}` : `pie with ${p.num} of ${p.den} parts coloured`;

const MODES: Record<Band, Mode[]> = { young: ['shape', 'shape', 'both'], older: ['both', 'both', 'pie'] };

export function genShape(band: Band, level: number, choices: number): ShapeItem {
  const mode = MODES[band][level - 1] ?? 'shape';
  const colors = Object.keys(COLORS) as Color[];

  if (mode === 'shape') {
    const shapes = sample(SHAPES, choices);
    const color = pick(colors);
    const piece: Piece = { kind: 'shape', shape: shapes[0], color };
    return {
      mode,
      say: `Drag the ${shapes[0]} to its shadow!`,
      piece,
      answerId: shapes[0],
      targets: shuffle(shapes).map((s) => ({ id: s, piece: { kind: 'shape', shape: s, color }, label: `${s} shadow` })),
    };
  }

  if (mode === 'both') {
    const shape = pick(SHAPES);
    const color = pick(colors);
    // Distractors share exactly one attribute, so the child must check colour AND shape.
    const shareOne = SHAPES.flatMap((s) => colors.map((c) => ({ s, c }))).filter(({ s, c }) => (s === shape) !== (c === color));
    const combos = shuffle([{ s: shape, c: color }, ...sample(shareOne, choices - 1)]);
    return {
      mode,
      say: `Find the box for the ${color} ${shape}!`,
      piece: { kind: 'shape', shape, color },
      answerId: `${color}-${shape}`,
      targets: combos.map(({ s, c }) => ({ id: `${c}-${s}`, piece: { kind: 'shape', shape: s, color: c }, label: `${c} ${s} box` })),
    };
  }

  const options = sample(FRACTIONS, Math.min(choices, FRACTIONS.length));
  const [num, den] = options[0];
  return {
    mode,
    say: 'How much of the pie is coloured? Drag it to the right box!',
    piece: { kind: 'pie', num, den },
    answerId: `${num}/${den}`,
    targets: shuffle(options).map(([n, d, words]) => ({ id: `${n}/${d}`, piece: { kind: 'pie', num: n, den: d }, label: words })),
  };
}
