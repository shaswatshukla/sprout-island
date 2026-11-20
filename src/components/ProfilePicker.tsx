import { useState } from 'react';
import type { Band } from '../engine/adaptive';
import { MAX_PROFILES, type Profile } from '../lib/storage';
import { Mascot } from './Mascot';

const AVATARS = ['🦁', '🐼', '🐸', '🦊', '🐰', '🐯', '🐨', '🐙'];

interface Props {
  profiles: Profile[];
  onPick: (id: string) => void;
  onCreate: (p: Profile) => void;
  onParent: () => void;
}

export function ProfilePicker({ profiles, onPick, onCreate, onParent }: Props) {
  const [adding, setAdding] = useState(profiles.length === 0);
  const [avatar, setAvatar] = useState(AVATARS[profiles.length % AVATARS.length]);
  const [name, setName] = useState('');
  const [band, setBand] = useState<Band>('young');

  const save = () => {
    const p: Profile = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim().slice(0, 12) || `Player ${profiles.length + 1}`,
      avatar,
      band,
      stickers: [],
      games: {},
    };
    onCreate(p);
    setAdding(false);
    setName('');
  };

  return (
    <div className="screen profiles">
      <header className="top-bar">
        <span className="spacer" />
        <h1>Sprout Island</h1>
        <button className="icon-btn" aria-label="Grown-ups area" onClick={onParent}>
          🔒
        </button>
      </header>
      <div className="coach center">
        <Mascot pose="cheer" size={110} />
        <p className="speech">{adding ? 'Make your player!' : 'Who is playing?'}</p>
      </div>

      {!adding ? (
        <div className="profile-grid">
          {profiles.map((p) => (
            <button key={p.id} className="profile-card" onClick={() => onPick(p.id)} aria-label={`Play as ${p.name}`}>
              <span className="profile-avatar" aria-hidden="true">
                {p.avatar}
              </span>
              <span>{p.name}</span>
            </button>
          ))}
          {profiles.length < MAX_PROFILES && (
            <button className="profile-card add" onClick={() => setAdding(true)} aria-label="Add a new player">
              <span className="profile-avatar" aria-hidden="true">
                ➕
              </span>
              <span>New</span>
            </button>
          )}
        </div>
      ) : (
        <form
          className="panel new-profile"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <fieldset>
            <legend>Pick a buddy</legend>
            <div className="avatar-row">
              {AVATARS.map((a) => (
                <button
                  type="button"
                  key={a}
                  className={`avatar-btn ${a === avatar ? 'on' : ''}`}
                  aria-pressed={a === avatar}
                  aria-label={`Avatar ${a}`}
                  onClick={() => setAvatar(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="field">
            Name
            <input value={name} maxLength={12} onChange={(e) => setName(e.target.value)} placeholder="Name" autoComplete="off" />
          </label>
          <fieldset>
            <legend>Age</legend>
            <div className="row">
              {(['young', 'older'] as Band[]).map((b) => (
                <button
                  type="button"
                  key={b}
                  className={`btn toggle ${band === b ? 'on' : ''}`}
                  aria-pressed={band === b}
                  onClick={() => setBand(b)}
                >
                  {b === 'young' ? 'Ages 4–6' : 'Ages 7–10'}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="row">
            <button type="submit" className="btn">
              ✅ Start
            </button>
            {profiles.length > 0 && (
              <button type="button" className="btn secondary" onClick={() => setAdding(false)}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
