import BubblePop from './BubblePop/BubblePop';
import LetterGarden from './LetterGarden/LetterGarden';
import { totalPairs } from './MemoryMatch/generate';
import MemoryMatch from './MemoryMatch/MemoryMatch';
import PatternTrain from './PatternTrain/PatternTrain';
import ShapeFactory from './ShapeFactory/ShapeFactory';
import type { GameDef } from './types';

const ROUND = 6;

export const GAMES: GameDef[] = [
  { id: 'bubbles', name: 'Bubble Pop', emoji: '🫧', color: '#7cc8ff', Component: BubblePop, total: () => ROUND },
  { id: 'letters', name: 'Letter Garden', emoji: '🌷', color: '#ffb3d1', Component: LetterGarden, total: () => ROUND },
  {
    id: 'memory',
    name: 'Memory Safari',
    emoji: '🦓',
    color: '#ffd166',
    Component: MemoryMatch,
    continuous: true,
    total: (d) => totalPairs(d.level),
  },
  { id: 'shapes', name: 'Shape Factory', emoji: '🔷', color: '#b9a6ff', Component: ShapeFactory, total: () => ROUND },
  { id: 'train', name: 'Pattern Train', emoji: '🚂', color: '#8ee3c8', Component: PatternTrain, total: () => ROUND },
];
