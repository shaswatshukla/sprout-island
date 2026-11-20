import { useEffect, useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { Home } from './components/Home';
import { ParentArea, ParentGate } from './components/Parent';
import { ProfilePicker } from './components/ProfilePicker';
import { StickerBook } from './components/StickerBook';
import { GAMES } from './games';
import { setSoundEnabled } from './lib/audio';
import { type AppData, type GameId, loadData, type Profile, saveData } from './lib/storage';

type Screen = 'profiles' | 'home' | 'game' | 'stickers' | 'gate' | 'parent';

export default function App() {
  const [data, setData] = useState<AppData>(loadData);
  const [screen, setScreen] = useState<Screen>('profiles');
  const [pid, setPid] = useState<string | null>(null);
  const [gameId, setGameId] = useState<GameId>('bubbles');

  useEffect(() => {
    saveData(data);
    setSoundEnabled(data.sound);
  }, [data]);

  const profile = data.profiles.find((p) => p.id === pid);
  const update = (id: string, fn: (p: Profile) => Profile) =>
    setData((d) => ({ ...d, profiles: d.profiles.map((p) => (p.id === id ? fn(p) : p)) }));

  if (screen === 'gate') return <ParentGate onPass={() => setScreen('parent')} onBack={() => setScreen(profile ? 'home' : 'profiles')} />;
  if (screen === 'parent')
    return (
      <ParentArea
        data={data}
        onToggleSound={() => setData((d) => ({ ...d, sound: !d.sound }))}
        onReset={(id) => update(id, (p) => ({ ...p, stickers: [], games: {} }))}
        onBack={() => setScreen(profile ? 'home' : 'profiles')}
      />
    );

  if (!profile || screen === 'profiles')
    return (
      <ProfilePicker
        profiles={data.profiles}
        onPick={(id) => {
          setPid(id);
          setScreen('home');
        }}
        onCreate={(p) => {
          setData((d) => ({ ...d, profiles: [...d.profiles, p] }));
          setPid(p.id);
          setScreen('home');
        }}
        onParent={() => setScreen('gate')}
      />
    );

  if (screen === 'stickers') return <StickerBook profile={profile} onBack={() => setScreen('home')} />;

  if (screen === 'game') {
    const game = GAMES.find((g) => g.id === gameId) ?? GAMES[0];
    return (
      <GameScreen
        key={game.id}
        game={game}
        profile={profile}
        onHome={() => setScreen('home')}
        onSave={(g, progress, sticker) =>
          update(profile.id, (p) => ({
            ...p,
            games: { ...p.games, [g]: progress },
            stickers: sticker && !p.stickers.includes(sticker) ? [...p.stickers, sticker] : p.stickers,
          }))
        }
      />
    );
  }

  return (
    <Home
      profile={profile}
      onPlay={(g) => {
        setGameId(g);
        setScreen('game');
      }}
      onStickers={() => setScreen('stickers')}
      onParent={() => setScreen('gate')}
      onSwitch={() => setScreen('profiles')}
    />
  );
}
