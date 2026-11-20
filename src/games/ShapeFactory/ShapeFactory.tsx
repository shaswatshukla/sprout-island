import { useEffect, useState } from 'react';
import { Draggable } from '../../components/Draggable';
import type { GameProps } from '../types';
import { useAnswer } from '../useAnswer';
import { COLORS, genShape, type Piece, pieceLabel, type Shape } from './generate';

const PATHS: Record<Shape, string> = {
  circle: 'M50 10 A40 40 0 1 1 49.9 10 Z',
  square: 'M14 14 H86 V86 H14 Z',
  triangle: 'M50 10 L90 86 H10 Z',
  star: 'M50 6 L61 38 H94 L67 58 L77 92 L50 71 L23 92 L33 58 L6 38 H39 Z',
  heart: 'M50 88 C10 60 6 34 22 20 C34 10 46 16 50 28 C54 16 66 10 78 20 C94 34 90 60 50 88 Z',
  diamond: 'M50 6 L88 50 L50 94 L12 50 Z',
};

function sector(i: number, den: number) {
  const a0 = (i / den) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((i + 1) / den) * 2 * Math.PI - Math.PI / 2;
  const p = (a: number) => `${50 + 40 * Math.cos(a)} ${50 + 40 * Math.sin(a)}`;
  return `M50 50 L${p(a0)} A40 40 0 0 1 ${p(a1)} Z`;
}

export function PieceIcon({ piece, variant = 'solid' }: { piece: Piece; variant?: 'solid' | 'shadow' | 'outline' }) {
  if (piece.kind === 'pie') {
    return (
      <svg viewBox="0 0 100 100" className="piece-svg" aria-hidden="true">
        {Array.from({ length: piece.den }, (_, i) => (
          <path key={i} d={sector(i, piece.den)} fill={i < piece.num ? '#f59e0b' : '#fff7e0'} stroke="#7c4a03" strokeWidth="3" />
        ))}
      </svg>
    );
  }
  const color = COLORS[piece.color];
  const fill = variant === 'shadow' ? 'var(--shadow)' : variant === 'outline' ? `${color}55` : color;
  return (
    <svg viewBox="0 0 100 100" className="piece-svg" aria-hidden="true">
      <path
        d={PATHS[piece.shape]}
        fill={fill}
        stroke={variant === 'shadow' ? 'none' : variant === 'outline' ? color : '#00000033'}
        strokeWidth={variant === 'outline' ? 6 : 3}
        strokeDasharray={variant === 'outline' ? '10 6' : undefined}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ShapeFactory({ band, diff, say, react, onResult }: GameProps) {
  const [item] = useState(() => genShape(band, diff.level, diff.choices));
  const { answer, misses, solved, wobble } = useAnswer(react, onResult);
  const [dragging, setDragging] = useState(false);
  useEffect(() => say(item.say), [item, say]);
  const choose = (id: string) => answer(id === item.answerId, id);
  const hint = diff.hint || misses > 0;
  const variant = item.mode === 'shape' ? 'shadow' : 'outline';

  return (
    <div className="factory">
      <div className="belt">
        <div className={`belt-rider ${dragging || solved ? 'paused' : ''}`}>
          {!solved && (
            <Draggable
              label={`${pieceLabel(item.piece)}. Tap a box to put it there.`}
              className="piece"
              onDrop={choose}
              onTap={() => say(item.say)}
              onDragChange={setDragging}
            >
              <PieceIcon piece={item.piece} />
            </Draggable>
          )}
        </div>
      </div>
      <div className="bins">
        {item.targets.map((t) => (
          <button
            key={t.id}
            data-drop={t.id}
            aria-label={t.label}
            disabled={solved}
            onClick={() => choose(t.id)}
            className={`bin ${wobble === t.id ? 'wobble' : ''} ${hint && !solved && t.id === item.answerId ? 'hint' : ''} ${
              solved && t.id === item.answerId ? 'filled' : ''
            }`}
          >
            {solved && t.id === item.answerId ? (
              <PieceIcon piece={item.piece} />
            ) : item.mode === 'pie' ? (
              <span className="frac">{t.id}</span>
            ) : (
              <PieceIcon piece={t.piece} variant={variant} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
