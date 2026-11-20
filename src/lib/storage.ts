import { type AdaptiveState, type Band, newState } from '../engine/adaptive';

export type GameId = 'bubbles' | 'letters' | 'memory' | 'shapes' | 'train';

export interface GameProgress {
  engine: AdaptiveState;
  stars: number;
  rounds: number;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  band: Band;
  stickers: string[];
  games: Partial<Record<GameId, GameProgress>>;
}

export interface AppData {
  profiles: Profile[];
  sound: boolean;
}

const KEY = 'sprout-island-v1';
export const MAX_PROFILES = 4;

export const emptyData = (): AppData => ({ profiles: [], sound: true });

// Trust boundary: localStorage can be edited, corrupted, or from an older version.
const isProfile = (p: any): p is Profile =>
  !!p &&
  typeof p.id === 'string' &&
  typeof p.name === 'string' &&
  typeof p.avatar === 'string' &&
  (p.band === 'young' || p.band === 'older') &&
  Array.isArray(p.stickers) &&
  typeof p.games === 'object' &&
  p.games !== null;

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyData();
    const d = JSON.parse(raw);
    if (!d || !Array.isArray(d.profiles)) return emptyData();
    return { sound: d.sound !== false, profiles: d.profiles.filter(isProfile).slice(0, MAX_PROFILES) };
  } catch {
    return emptyData();
  }
}

export function saveData(d: AppData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    // Storage unavailable (private mode, blocked): keep playing in memory.
  }
}

export function progressFor(p: Profile, g: GameId): GameProgress {
  const gp = p.games[g];
  if (gp && gp.engine && Array.isArray(gp.engine.window) && typeof gp.stars === 'number') return gp;
  return { engine: newState(p.band), stars: 0, rounds: 0 };
}
