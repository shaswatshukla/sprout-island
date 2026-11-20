import { type CSSProperties, useEffect, useRef } from 'react';
import { sfx, speak } from '../lib/audio';
import { Mascot } from './Mascot';

interface Props {
  stars: number;
  sticker: string | null;
  offer: boolean;
  onAgain: () => void;
  onHome: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

const COLORS = ['#ff5d8f', '#ffd23f', '#3bceac', '#4d9de0', '#ff7a3d', '#a66cff'];

function Confetti() {
  const bits = useRef(
    Array.from({ length: 36 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      color: COLORS[i % COLORS.length],
      spin: Math.random() * 360,
    })),
  ).current;
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{ left: `${b.left}%`, background: b.color, animationDelay: `${b.delay}s`, rotate: `${b.spin}deg` } as CSSProperties}
        />
      ))}
    </div>
  );
}

export function RoundEnd({ stars, sticker, offer, onAgain, onHome, onAccept, onDecline }: Props) {
  useEffect(() => {
    sfx.cheer();
    const base = `Hooray! You got ${stars} ${stars === 1 ? 'star' : 'stars'}${sticker ? ' and a new sticker' : ''}!`;
    speak(offer ? `${base} Ready for a bigger challenge?` : base);
  }, [stars, sticker, offer]);

  return (
    <div className="round-end" role="dialog" aria-modal="true" aria-label="Round complete">
      <Confetti />
      <div className="round-card">
        <Mascot pose="cheer" size={120} />
        <div className="stars" aria-label={`${stars} of 3 stars`}>
          {[1, 2, 3].map((i) => (
            <span key={i} className={`star ${i <= stars ? 'on' : ''}`} style={{ animationDelay: `${i * 0.25}s` }}>
              ★
            </span>
          ))}
        </div>
        {sticker && (
          <div className="sticker-won">
            <span className="sticker-pop" aria-hidden="true">
              {sticker}
            </span>
            <p>New sticker!</p>
          </div>
        )}
        {offer ? (
          <div className="offer">
            <p>🚀 Ready for a bigger challenge?</p>
            <div className="row">
              <button className="btn" onClick={onAccept}>
                Yes!
              </button>
              <button className="btn secondary" onClick={onDecline}>
                Not yet
              </button>
            </div>
          </div>
        ) : (
          <div className="row">
            <button className="btn" onClick={onAgain} aria-label="Play again">
              🔁 Again
            </button>
            <button className="btn secondary" onClick={onHome} aria-label="Back to the map">
              🏠 Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
