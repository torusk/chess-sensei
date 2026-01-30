import { create } from 'zustand';
import { GameMode, GameState, Puzzle, Opening, ChatMessage, PuzzleAttempt } from '../types';

interface GameStore {
  // ゲーム状態
  mode: GameMode;
  gameState: GameState;
  orientation: 'white' | 'black';
  
  // パズル
  currentPuzzle: Puzzle | null;
  puzzleAttempts: PuzzleAttempt[];
  puzzleIndex: number;
  
  // オープニング
  currentOpening: Opening | null;
  openingStep: number;
  
  // チャット
  messages: ChatMessage[];
  isAIThinking: boolean;
  
  // アクション
  setMode: (mode: GameMode) => void;
  setGameState: (state: Partial<GameState>) => void;
  makeMove: (from: string, to: string, promotion?: string) => void;
  resetGame: () => void;
  flipBoard: () => void;
  
  // パズルアクション
  loadPuzzle: (puzzle: Puzzle) => void;
  nextPuzzle: () => void;
  recordPuzzleAttempt: (attempt: PuzzleAttempt) => void;
  
  // オープニングアクション
  loadOpening: (opening: Opening) => void;
  nextOpeningStep: () => void;
  prevOpeningStep: () => void;
  
  // チャットアクション
  addMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setAIThinking: (thinking: boolean) => void;
}

const initialGameState: GameState = {
  mode: 'play',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  history: [],
  turn: 'w',
  isCheck: false,
  isCheckmate: false,
  isDraw: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'play',
  gameState: initialGameState,
  orientation: 'white',
  currentPuzzle: null,
  puzzleAttempts: [],
  puzzleIndex: 0,
  currentOpening: null,
  openingStep: 0,
  messages: [],
  isAIThinking: false,

  setMode: (mode) => set({ mode }),
  
  setGameState: (state) => set((prev) => ({
    gameState: { ...prev.gameState, ...state }
  })),
  
  makeMove: (from, to, promotion) => {
    // 実際の移動ロジックはchess.jsで処理
    const { gameState } = get();
    set({
      gameState: {
        ...gameState,
        history: [...gameState.history, `${from}-${to}`],
      }
    });
  },
  
  resetGame: () => set({
    gameState: initialGameState,
    currentPuzzle: null,
    currentOpening: null,
    openingStep: 0,
  }),
  
  flipBoard: () => set((prev) => ({
    orientation: prev.orientation === 'white' ? 'black' : 'white'
  })),
  
  loadPuzzle: (puzzle) => set({
    currentPuzzle: puzzle,
    gameState: {
      ...initialGameState,
      mode: 'puzzle',
      fen: puzzle.fen,
    }
  }),
  
  nextPuzzle: () => set((prev) => ({
    puzzleIndex: prev.puzzleIndex + 1,
  })),
  
  recordPuzzleAttempt: (attempt) => set((prev) => ({
    puzzleAttempts: [...prev.puzzleAttempts, attempt]
  })),
  
  loadOpening: (opening) => set({
    currentOpening: opening,
    openingStep: 0,
    gameState: {
      ...initialGameState,
      mode: 'opening',
    }
  }),
  
  nextOpeningStep: () => set((prev) => ({
    openingStep: Math.min(prev.openingStep + 1, (prev.currentOpening?.moves.length || 0) - 1)
  })),
  
  prevOpeningStep: () => set((prev) => ({
    openingStep: Math.max(prev.openingStep - 1, 0)
  })),
  
  addMessage: (message) => set((prev) => ({
    messages: [...prev.messages, message]
  })),
  
  clearChat: () => set({ messages: [] }),
  
  setAIThinking: (thinking) => set({ isAIThinking: thinking }),
}));
