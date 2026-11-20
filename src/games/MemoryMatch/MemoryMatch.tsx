import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { sfx, speak } from '../../lib/audio';
import type { GameProps } from '../types';
import { type Card, colsFor, genBoard, totalPairs } from './generate';

// A pair found within this many mismatches since the last match counts as "correct" for the engine.
const ALLOWED_MISSES = 2;

export default function MemoryMatch({ band, diff, say, react, onResult }: GameProps) {
  const [level] = useState(diff.level); // a round keeps one level, even if the engine moves mid-round
  const [board, setBoard] = useState(() => genBoard(band, level));
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [found, setFound] = useState(0);
  const [peek, setPeek] = useState(diff.hint);
  const [wob, setWob] = useState<string[]>([]);
  const misses = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    say(found === 0 ? 'Flip two cards. Find the pairs!' : 'New cards! Find the pairs!');
    if (diff.hint) {
      setPeek(true);
      later(() => setPeek(false), 2200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  const flip = (card: Card) => {
    if (peek || open.length === 2 || open.includes(card.id) || matched.includes(card.pair)) return;
    sfx.flip();
    speak(card.speak);
    const o = [...open, card.id];
    setOpen(o);
    if (o.length < 2) return;
    const [a, b] = o.map((id) => board.find((c) => c.id === id)!);
    if (a.pair === b.pair) {
      later(() => {
        sfx.correct();
        react('right');
        const nowMatched = [...matched, a.pair];
        setMatched(nowMatched);
        setOpen([]);
        const ok = misses.current <= ALLOWED_MISSES;
        misses.current = 0;
        const f = found + 1;
        setFound(f);
        if (f < totalPairs(level) && nowMatched.length === board.length / 2) {
          later(() => {
            setMatched([]);
            setBoard(genBoard(band, level));
          }, 900);
        }
        onResult(ok);
      }, 450);
    } else {
      misses.current++;
      later(() => {
        sfx.soft();
        react('wrong');
        setWob(o);
        setOpen([]);
        later(() => setWob([]), 500);
      }, 1000);
    }
  };

  return (
    <div className="memory" style={{ '--cols': colsFor(level) } as CSSProperties}>
      {board.map((c, i) => {
        const up = peek || open.includes(c.id) || matched.includes(c.pair);
        return (
          <button
            key={c.id}
            className={`card ${up ? 'up' : ''} ${matched.includes(c.pair) ? 'matched' : ''} ${wob.includes(c.id) ? 'wobble' : ''}`}
            aria-label={up ? c.speak : `Card ${i + 1}, face down`}
            aria-pressed={up}
            onClick={() => flip(c)}
          >
            {up ? (
              c.dots ? (
                <span className="dots-face" aria-hidden="true">
                  {Array.from({ length: c.dots }, (_, k) => (
                    <span key={k} className="pip" />
                  ))}
                </span>
              ) : (
                <span className={c.word ? 'card-word' : 'card-emoji'}>{c.face}</span>
              )
            ) : (
              <span className="card-back" aria-hidden="true">
                🌿
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
