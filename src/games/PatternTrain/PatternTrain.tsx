import { useEffect, useState } from 'react';
import type { GameProps } from '../types';
import { useAnswer } from '../useAnswer';
import { genTrain, type Token, tokenKey, tokenLabel } from './generate';

function TokenView({ token }: { token: Token }) {
  if (token.t === 'dots')
    return (
      <span className="dots-face" aria-hidden="true">
        {Array.from({ length: token.v }, (_, i) => (
          <span key={i} className="pip" />
        ))}
      </span>
    );
  return <span className={token.t === 'num' ? 'car-num' : 'car-emoji'}>{token.v}</span>;
}

export default function PatternTrain({ band, diff, say, react, onResult }: GameProps) {
  const [item] = useState(() => genTrain(band, diff.level, diff.choices));
  const { answer, misses, solved, wobble } = useAnswer(react, onResult);
  useEffect(() => say(item.say), [item, say]);
  const hint = diff.hint || misses > 0;
  const answerKey = tokenKey(item.answer);

  return (
    <div className="train-game">
      <div className="track">
        <div
          className={`train ${solved ? 'go' : ''}`}
          role="img"
          aria-label={`Train cars: ${item.cars.map(tokenLabel).join(', ')}, then a question mark`}
        >
          <span className="engine" aria-hidden="true">
            🚂
          </span>
          {item.cars.map((c, i) => (
            <span key={i} className="car">
              <TokenView token={c} />
            </span>
          ))}
          <span className={`car mystery ${solved ? 'filled' : ''}`}>{solved ? <TokenView token={item.answer} /> : '?'}</span>
        </div>
      </div>
      <div className="choices">
        {item.options.map((o) => {
          const k = tokenKey(o);
          return (
            <button
              key={k}
              aria-label={tokenLabel(o)}
              disabled={solved}
              onClick={() => answer(k === answerKey, k)}
              className={`choice ${wobble === k ? 'wobble' : ''} ${hint && !solved && k === answerKey ? 'hint' : ''}`}
            >
              <TokenView token={o} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
