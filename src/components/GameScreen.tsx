import { type CSSProperties, useEffect, useRef, useState } from 'react';
import {
  acceptPromotion,
  declinePromotion,
  nextDifficulty,
  recordAnswer,
  recordRound,
} from '../engine/adaptive';
import { speak } from '../lib/audio';
import { STICKERS } from '../lib/stickers';
import { type GameId, type GameProgress, type Profile, progressFor } from '../lib/storage';
import { pick } from '../lib/util';
import type { GameDef } from '../games/types';
import { Mascot, type Pose } from './Mascot';
import { RoundEnd } from './RoundEnd';

interface Props {
  game: GameDef;
  profile: Profile;
  onSave: (g: GameId, progress: GameProgress, sticker: string | null) => void;
  onHome: () => void;
}

const starsFor = (acc: number) => (acc >= 0.85 ? 3 : acc >= 0.6 ? 2 : 1);

export function GameScreen({ game, profile, onSave, onHome }: Props) {
  // Round state lives in a ref so delayed callbacks (timers inside games) never see a stale engine.
  const st = useRef<null | { engine: GameProgress['engine']; results: boolean[]; diff: ReturnType<typeof nextDifficulty>; total: number }>(null);
  if (!st.current) {
    const engine = progressFor(profile, game.id).engine;
    const diff = nextDifficulty(engine);
    st.current = { engine, results: [], diff, total: game.total(diff) };
  }
  const s = st.current;
  const [, rerender] = useState(0);
  const [round, setRound] = useState(0);
  const [end, setEnd] = useState<null | { stars: number; sticker: string | null; offer: boolean }>(null);
  const [instr, setInstr] = useState({ text: '', n: 0 });
  const [pose, setPose] = useState<Pose>('idle');
  const [toast, setToast] = useState<string | null>(null);
  const poseTimer = useRef(0);
  const toastTimer = useRef(0);

  useEffect(() => {
    speak(instr.text);
  }, [instr]);
  useEffect(() => () => {
    clearTimeout(poseTimer.current);
    clearTimeout(toastTimer.current);
  }, []);

  const say = useRef((text: string) => setInstr((i) => ({ text, n: i.n + 1 }))).current;
  const react = useRef((kind: 'right' | 'wrong') => {
    setPose(kind === 'right' ? 'cheer' : 'think');
    clearTimeout(poseTimer.current);
    poseTimer.current = window.setTimeout(() => setPose('idle'), 1200);
  }).current;

  const finish = () => {
    const correct = s.results.filter(Boolean).length;
    const acc = correct / s.results.length;
    s.engine = recordRound(s.engine, acc);
    const stars = starsFor(acc);
    const fresh = STICKERS.filter((x) => !profile.stickers.includes(x));
    const sticker = fresh.length ? pick(fresh) : null;
    const prev = progressFor(profile, game.id);
    onSave(game.id, { engine: s.engine, stars: prev.stars + stars, rounds: prev.rounds + 1 }, sticker);
    setEnd({ stars, sticker, offer: s.engine.promotionOffered });
  };

  const onResult = (correct: boolean) => {
    if (s.results.length >= s.total) return;
    const before = s.engine.level;
    s.engine = recordAnswer(s.engine, correct, s.diff.hint);
    s.results = [...s.results, correct];
    if (s.engine.level > before) {
      setToast(`Level up! ⭐ ${s.engine.level}`);
      clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 1800);
    }
    if (s.results.length >= s.total) finish();
    else {
      s.diff = nextDifficulty(s.engine);
      rerender((x) => x + 1);
    }
  };

  const playAgain = () => {
    s.results = [];
    s.diff = nextDifficulty(s.engine);
    s.total = game.total(s.diff);
    setEnd(null);
    setRound((r) => r + 1);
  };

  const resolveOffer = (accept: boolean) => {
    s.engine = accept ? acceptPromotion(s.engine) : declinePromotion(s.engine);
    onSave(game.id, { ...progressFor(profile, game.id), engine: s.engine }, null);
    playAgain();
  };

  const index = s.results.length;
  const G = game.Component;
  const bandLabel = s.engine.band === 'young' ? '4–6' : '7–10';

  return (
    <div className="screen game-screen" style={{ '--accent': game.color } as CSSProperties}>
      <header className="game-bar">
        <button className="icon-btn" aria-label="Back to the map" onClick={onHome}>
          🏠
        </button>
        <div
          className="dots"
          role="progressbar"
          aria-label="Round progress"
          aria-valuemin={0}
          aria-valuemax={s.total}
          aria-valuenow={index}
        >
          {Array.from({ length: s.total }, (_, i) => (
            <span key={i} className={`dot ${i < index ? 'done' : ''} ${i === index ? 'now' : ''}`} />
          ))}
        </div>
        <span className="level-badge" aria-label={`Level ${s.diff.level}, ages ${bandLabel}`}>
          ⭐{s.diff.level}
        </span>
        <button className="icon-btn" aria-label="Say it again" onClick={() => speak(instr.text)}>
          🔊
        </button>
      </header>
      <div className="coach">
        <Mascot pose={pose} size={84} />
        <p className="speech" aria-live="polite">
          {instr.text}
        </p>
      </div>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      <main className="play">
        {!end && (
          <G
            key={game.continuous ? `r${round}` : `r${round}-${index}`}
            band={s.engine.band}
            diff={s.diff}
            say={say}
            react={react}
            onResult={onResult}
          />
        )}
      </main>
      {end && (
        <RoundEnd
          {...end}
          onAgain={playAgain}
          onHome={onHome}
          onAccept={() => resolveOffer(true)}
          onDecline={() => resolveOffer(false)}
        />
      )}
    </div>
  );
}
