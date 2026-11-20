import type { ComponentType } from 'react';
import type { Band, Difficulty } from '../engine/adaptive';
import type { GameId } from '../lib/storage';

export interface GameProps {
  band: Band;
  diff: Difficulty;
  say: (text: string) => void; // show + speak the instruction
  react: (kind: 'right' | 'wrong') => void; // mascot reaction
  onResult: (correctFirstTry: boolean) => void; // one call per item
}

export interface GameDef {
  id: GameId;
  name: string;
  emoji: string;
  color: string;
  Component: ComponentType<GameProps>;
  continuous?: boolean; // one mount handles the whole round (memory boards)
  total: (d: Difficulty) => number; // items per round
}
