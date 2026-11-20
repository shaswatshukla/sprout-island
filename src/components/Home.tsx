import { useEffect } from 'react';
import { GAMES } from '../games';
import { speak } from '../lib/audio';
import { type GameId, type Profile, progressFor } from '../lib/storage';
import { Mascot } from './Mascot';

interface Props {
  profile: Profile;
  onPlay: (g: GameId) => void;
  onStickers: () => void;
  onParent: () => void;
  onSwitch: () => void;
}

export function Home({ profile, onPlay, onStickers, onParent, onSwitch }: Props) {
  useEffect(() => speak(`Hi ${profile.name}! Pick a game to play!`), [profile.name]);

  return (
    <div className="screen home">
      <header className="top-bar">
        <button className="icon-btn" aria-label={`Switch player, now ${profile.name}`} onClick={onSwitch}>
          {profile.avatar}
        </button>
        <h1 className="hello">Hi, {profile.name}!</h1>
        <button className="icon-btn" aria-label={`Sticker book, ${profile.stickers.length} stickers`} onClick={onStickers}>
          📒
        </button>
        <button className="icon-btn" aria-label="Grown-ups area" onClick={onParent}>
          🔒
        </button>
      </header>
      <div className="coach">
        <Mascot size={84} />
        <p className="speech">Pick a game!</p>
      </div>
      <nav className="islands" aria-label="Games">
        {GAMES.map((g, i) => (
          <button
            key={g.id}
            className="island"
            style={{ background: g.color, animationDelay: `${i * 0.3}s` }}
            onClick={() => onPlay(g.id)}
            aria-label={`${g.name}, ${progressFor(profile, g.id).stars} stars`}
          >
            <span className="island-emoji" aria-hidden="true">
              {g.emoji}
            </span>
            <span className="island-name">{g.name}</span>
            <span className="island-stars" aria-hidden="true">
              ★ {progressFor(profile, g.id).stars}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
