import { useEffect, useRef, useState } from 'react';
import { GAMES } from '../games';
import { type AppData, progressFor } from '../lib/storage';
import { rand } from '../lib/util';

const HOLD_MS = 3000;

export function ParentGate({ onPass, onBack }: { onPass: () => void; onBack: () => void }) {
  const [held, setHeld] = useState(false);
  const [holding, setHolding] = useState(false);
  const [q, setQ] = useState(() => [rand(6, 9), rand(5, 9)]);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const start = () => {
    if (timer.current !== undefined) return;
    setHolding(true);
    timer.current = window.setTimeout(() => setHeld(true), HOLD_MS);
  };
  const stop = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
    setHolding(false);
  };

  return (
    <div className="screen">
      <header className="top-bar">
        <button className="icon-btn" aria-label="Back" onClick={onBack}>
          ⬅️
        </button>
        <h1>Grown-ups only</h1>
        <span className="spacer" />
      </header>
      <div className="panel gate">
        {!held ? (
          <>
            <p>Press and hold the button for 3 seconds.</p>
            <button
              className="btn hold"
              onPointerDown={start}
              onPointerUp={stop}
              onPointerLeave={stop}
              onPointerCancel={stop}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  start();
                }
              }}
              onKeyUp={stop}
              onContextMenu={(e) => e.preventDefault()}
            >
              <span className={`hold-fill ${holding ? 'on' : ''}`} aria-hidden="true" />
              <span className="hold-label">Hold here</span>
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (Number(value) === q[0] + q[1]) onPass();
              else {
                setWrong(true);
                setValue('');
                setQ([rand(6, 9), rand(5, 9)]);
              }
            }}
          >
            <label className="field">
              What is {q[0]} + {q[1]}?
              <input inputMode="numeric" pattern="[0-9]*" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
            </label>
            {wrong && <p role="alert">Not quite, try this one.</p>}
            <button type="submit" className="btn">
              Enter
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface AreaProps {
  data: AppData;
  onToggleSound: () => void;
  onReset: (id: string) => void;
  onBack: () => void;
}

export function ParentArea({ data, onToggleSound, onReset, onBack }: AreaProps) {
  const [confirm, setConfirm] = useState<string | null>(null);

  return (
    <div className="screen">
      <header className="top-bar">
        <button className="icon-btn" aria-label="Leave grown-ups area" onClick={onBack}>
          ⬅️
        </button>
        <h1>Grown-ups</h1>
        <span className="spacer" />
      </header>
      <section className="panel">
        <button className="btn secondary" aria-pressed={data.sound} onClick={onToggleSound}>
          {data.sound ? '🔊 Sound: On' : '🔇 Sound: Off'}
        </button>
        <p className="note">Sound covers spoken instructions too. Children who cannot read yet need it on.</p>
        <p className="note">All progress is kept on this device only. Nothing is sent anywhere.</p>
      </section>
      {data.profiles.length === 0 && <p className="panel">No players yet.</p>}
      {data.profiles.map((p) => (
        <section key={p.id} className="panel">
          <h2>
            {p.avatar} {p.name} · {p.band === 'young' ? 'Ages 4–6' : 'Ages 7–10'} · 📒 {p.stickers.length}
          </h2>
          <ul className="progress-list">
            {GAMES.map((g) => {
              const gp = progressFor(p, g.id);
              return (
                <li key={g.id}>
                  <span aria-hidden="true">{g.emoji}</span> <strong>{g.name}</strong>: level {gp.engine.level}
                  {gp.engine.band !== p.band ? ' (moved up to ages 7–10)' : ''} · ★ {gp.stars} · {gp.rounds}{' '}
                  {gp.rounds === 1 ? 'round' : 'rounds'}
                </li>
              );
            })}
          </ul>
          {confirm === p.id ? (
            <div className="row">
              <p role="alert">Erase all of {p.name}'s progress and stickers?</p>
              <button
                className="btn danger"
                onClick={() => {
                  onReset(p.id);
                  setConfirm(null);
                }}
              >
                Yes, reset
              </button>
              <button className="btn secondary" onClick={() => setConfirm(null)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="btn secondary" onClick={() => setConfirm(p.id)}>
              Reset {p.name}
            </button>
          )}
        </section>
      ))}
    </div>
  );
}
