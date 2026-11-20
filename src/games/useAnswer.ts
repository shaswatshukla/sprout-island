import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';
import type { GameProps } from './types';

/** Shared answer flow: wrong = gentle wobble + hint, then retry; right = celebrate, then next item. */
export function useAnswer(react: GameProps['react'], onResult: GameProps['onResult']) {
  const [misses, setMisses] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wobble, setWobble] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const answer = (ok: boolean, id = '') => {
    if (solved) return;
    if (ok) {
      setSolved(true);
      sfx.correct();
      react('right');
      later(() => onResult(misses === 0), 1100);
    } else {
      setMisses((m) => m + 1);
      sfx.soft();
      react('wrong');
      setWobble(id);
      later(() => setWobble(null), 500);
    }
  };

  return { answer, misses, solved, wobble, later };
}
