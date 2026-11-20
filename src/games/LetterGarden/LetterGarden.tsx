import { useEffect, useState } from 'react';
import { Draggable } from '../../components/Draggable';
import { sfx } from '../../lib/audio';
import type { GameProps } from '../types';
import { useAnswer } from '../useAnswer';
import { genLetter, type LetterItem } from './generate';

type ItemProps<M> = GameProps & { item: Extract<LetterItem, { mode: M }> };

export default function LetterGarden(props: GameProps) {
  const [item] = useState(() => genLetter(props.band, props.diff.level, props.diff.choices));
  return item.mode === 'pots' ? <Pots {...props} item={item} /> : <Spell {...props} item={item} />;
}

function Pots({ item, diff, say, react, onResult }: ItemProps<'pots'>) {
  const { answer, misses, solved, wobble } = useAnswer(react, onResult);
  useEffect(() => say(item.say), [item, say]);
  const choose = (id: string) => answer(id === item.answerId, id);
  const hint = diff.hint || misses > 0;

  return (
    <div className="garden">
      {!solved && (
        <Draggable label={`Seed with letter ${item.seed}. Tap a pot to plant it.`} className="seed" onDrop={choose} onTap={() => say(item.say)}>
          {item.seed}
        </Draggable>
      )}
      <div className="pots">
        {item.pots.map((p) => (
          <button
            key={p.id}
            data-drop={p.id}
            aria-label={p.aria}
            disabled={solved}
            onClick={() => choose(p.id)}
            className={`pot ${wobble === p.id ? 'wobble' : ''} ${hint && !solved && p.id === item.answerId ? 'hint' : ''}`}
          >
            <span className="pot-pic">{solved && p.id === item.answerId ? '🌷' : p.pic}</span>
            <span className="pot-base" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Spell({ item, diff, say, react, onResult }: ItemProps<'spell'>) {
  const { answer, misses, solved, wobble } = useAnswer(react, onResult);
  const [placed, setPlaced] = useState<string[]>([]);
  useEffect(() => say(item.say), [item, say]);
  const hint = diff.hint || misses > 0;

  const place = (tileId: string) => {
    if (solved || placed.includes(tileId)) return;
    const tile = item.tiles.find((t) => t.id === tileId);
    if (!tile) return;
    if (tile.ch !== item.word[placed.length]) return answer(false, tileId);
    const next = [...placed, tileId];
    setPlaced(next);
    sfx.pop();
    if (next.length === item.word.length) answer(true);
  };

  return (
    <div className="spell">
      <button className="word-pic" aria-label={`Picture of ${item.word}. Hear it again.`} onClick={() => say(item.say)}>
        {item.emoji}
      </button>
      <div className={`slots ${solved ? 'done' : ''}`} data-drop="word" role="group" aria-label={`Word so far: ${item.word.slice(0, placed.length) || 'empty'}`}>
        {[...item.word].map((ch, i) => (
          <span key={i} className={`slot ${i < placed.length ? 'filled' : ''}`}>
            {i < placed.length ? ch : hint && i === placed.length ? <span className="ghost">{ch}</span> : ''}
          </span>
        ))}
      </div>
      <div className="tiles">
        {item.tiles.map((t) =>
          placed.includes(t.id) ? (
            <span key={t.id} className="tile-gap" aria-hidden="true" />
          ) : (
            <Draggable
              key={t.id}
              label={`Letter ${t.ch}`}
              className={`tile ${wobble === t.id ? 'wobble' : ''}`}
              disabled={solved}
              onDrop={(target) => target === 'word' && place(t.id)}
              onTap={() => place(t.id)}
            >
              {t.ch}
            </Draggable>
          ),
        )}
      </div>
    </div>
  );
}
