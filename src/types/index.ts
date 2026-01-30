export type GameMode = 'play' | 'puzzle' | 'opening' | 'analysis';

export interface GameState {
  mode: GameMode;
  fen: string;
  history: string[];
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
}

export interface Puzzle {
  id: number;
  fen: string;
  solution: string[];
  theme: string;
  difficulty: number;
  description?: string;
}

export interface Opening {
  id: number;
  eco: string;
  name: string;
  moves: string[];
  description: string;
  variations?: Opening[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface MoveAnalysis {
  move: string;
  evaluation: number;
  bestMove?: string;
  isBlunder: boolean;
  isMistake: boolean;
  isInaccuracy: boolean;
}

export interface PuzzleAttempt {
  puzzleId: number;
  solved: boolean;
  attempts: number;
  timeSpent: number;
  timestamp: Date;
}

export type BoardOrientation = 'white' | 'black';
