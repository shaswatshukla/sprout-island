import { useEffect } from 'react';
import { speak } from '../lib/audio';
import { STICKERS } from '../lib/stickers';
import type { Profile } from '../lib/storage';

export function StickerBook({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  const count = profile.stickers.length;
  useEffect(() => speak(`You have ${count} ${count === 1 ? 'sticker' : 'stickers'}!`), [count]);

  return (
    <div className="screen">
      <header className="top-bar">
        <button className="icon-btn" aria-label="Back to the map" onClick={onBack}>
          🏠
        </button>
        <h1>
          📒 {count} / {STICKERS.length}
        </h1>
        <span className="spacer" />
      </header>
      <div className="sticker-grid">
        {STICKERS.map((s) => {
          const have = profile.stickers.includes(s);
          return (
            <div key={s} className={`sticker ${have ? 'have' : ''}`} role="img" aria-label={have ? `Sticker ${s}` : 'Sticker not found yet'}>
              {have ? s : '?'}
            </div>
          );
        })}
      </div>
    </div>
  );
}
