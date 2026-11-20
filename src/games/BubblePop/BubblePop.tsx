import { type CSSProperties, useEffect, useState } from 'react';
import { sfx } from '../../lib/audio';
import type { GameProps } from '../types';
import { useAnswer } from '../useAnswer';
import { genBubble } from './generate';

export default function BubblePop({ band, diff, say, react, onResult }: GameProps) {
  const [item] = useState(() => genBubble(band, diff.level, diff.choices));
  const { answer, misses, solved, wobble } = useAnswer(react, onResult);
  const [popped, setPopped] = useState<number | null>(null);
  useEffect(() => say(item.say), [item, say]);
  const hint = diff.hint || misses > 0;
  const { show } = item;

  return (
    <div className="bubble-game">
      <div className="prompt-card" role="img" aria-label={item.label}>
        {show.kind === 'count' && (
          <div className="count-row">
            {Array.from({ length: show.n }, (_, i) => (
              <span key={i} className={hint ? 'counted' : ''} data-n={i + 1}>
                {show.emoji}
              </span>
            ))}
          </div>
        )}
        {show.kind === 'text' && <div className="big-text">{show.text} = ?</div>}
        {show.kind === 'ear' && (
          <button className="icon-btn big" aria-label="Hear the number again" onClick={() => say(item.say)}>
            👂
          </button>
        )}
      </div>
      <div className="bubbles">
        {item.options.map((n, i) => (
          <button
            key={n}
            className={`bubble-btn ${popped === n ? 'popped' : ''} ${wobble === String(n) ? 'wobble' : ''} ${
              hint && n === item.answer && !solved ? 'hint' : ''
            }`}
            style={{ '--hue': (i * 67 + 190) % 360, animationDelay: `${i * 0.37}s` } as CSSProperties}
            aria-label={`Bubble ${n}`}
            disabled={solved}
            onClick={() => {
              const ok = n === item.answer;
              if (ok) {
                setPopped(n);
                sfx.pop();
              }
              answer(ok, String(n));
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
