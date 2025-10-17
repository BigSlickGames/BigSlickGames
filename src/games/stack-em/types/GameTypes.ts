import type { Card } from './Card';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type AnteAmount = 5 | 10 | 20 | 50 | 100;

export interface GridPosition {
  cardId: string;
  card: Card;
}

export interface GameState {
  deck: Card[];
  dealtCards: Card[];
  deckCycles: number;
  isDealing: boolean;
  gridPositions: (GridPosition | null)[];
  showSettings: boolean;
  score: number;
  difficulty: Difficulty;
  showAnimation: boolean;
  animationType: '2-card' | '3-card';
  chips: number;
  sessionWinnings: number;
  ante: AnteAmount;
  betsLocked: boolean;
  pendingAce: {
    card: Card;
    position: number;
  } | null;
  pendingWild: {
    card: Card;
    position: number;
    availableValues: number[];
  } | null;
  experience: number;
  level: number;
  showXPAnimation: boolean;
  xpAnimationAmount: number;
}