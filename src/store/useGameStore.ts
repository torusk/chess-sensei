import { create } from 'zustand';
import { Chess } from 'chess.js';
import { GameMode, Puzzle, Opening, ChatMessage, PuzzleAttempt, MoveHistoryItem, AnalysisState } from '../types';

interface GameStore {
  // ゲーム状態
  mode: GameMode;
  game: Chess;
  orientation: 'white' | 'black';
  
  // 解析モード用
  analysis: AnalysisState;
  
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
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  resetGame: () => void;
  flipBoard: () => void;
  
  // PGN/FEN読み込み
  loadFEN: (fen: string) => boolean;
  loadPGN: (pgn: string) => boolean;
  
  // 履歴ナビゲーション
  goToMove: (index: number) => void;
  goToFirst: () => void;
  goToLast: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  
  // 分岐
  createBranch: (fromIndex: number) => void;
  
  // エクスポート
  exportPGN: () => string;
  exportFEN: () => string;
  
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

const createInitialAnalysis = (): AnalysisState => ({
  history: [],
  currentMoveIndex: -1,
  branches: [],
  isNavigating: false,
});

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'play',
  game: new Chess(),
  orientation: 'white',
  analysis: createInitialAnalysis(),
  currentPuzzle: null,
  puzzleAttempts: [],
  puzzleIndex: 0,
  currentOpening: null,
  openingStep: 0,
  messages: [],
  isAIThinking: false,

  setMode: (mode) => set({ mode }),
  
  makeMove: (from, to, promotion) => {
    const { game, analysis } = get();
    const move = game.move({ from, to, promotion });
    
    if (move) {
      const newHistoryItem: MoveHistoryItem = {
        move: move.san,
        fen: game.fen(),
        moveNumber: Math.floor((analysis.history.length + 1) / 2) + 1,
        isWhite: game.turn() === 'b',
      };
      
      // ナビゲーション中なら分岐を作成
      if (analysis.isNavigating && analysis.currentMoveIndex < analysis.history.length - 1) {
        const currentBranch = analysis.branches.find(b => b.moveIndex === analysis.currentMoveIndex);
        if (currentBranch) {
          currentBranch.moves.push(newHistoryItem);
        } else {
          get().createBranch(analysis.currentMoveIndex);
        }
      } else {
        // 通常の手順追加
        set((state) => ({
          analysis: {
            ...state.analysis,
            history: [...state.analysis.history, newHistoryItem],
            currentMoveIndex: state.analysis.history.length,
            isNavigating: false,
          },
        }));
      }
      
      return true;
    }
    return false;
  },
  
  resetGame: () => {
    const newGame = new Chess();
    set({
      game: newGame,
      analysis: createInitialAnalysis(),
      currentPuzzle: null,
      currentOpening: null,
      openingStep: 0,
    });
  },
  
  flipBoard: () => set((prev) => ({
    orientation: prev.orientation === 'white' ? 'black' : 'white'
  })),
  
  // FEN読み込み
  loadFEN: (fen) => {
    const newGame = new Chess();
    try {
      newGame.load(fen);
      set({
        game: newGame,
        analysis: createInitialAnalysis(),
        mode: 'analysis',
      });
      return true;
    } catch {
      return false;
    }
  },
  
  // PGN読み込み（コメントを除去）
  loadPGN: (pgn) => {
    try {
      // コメント {} を除去
      const cleanPGN = pgn.replace(/\{[^}]*\}/g, '');
      // 複数スペースを1つに
      const normalizedPGN = cleanPGN.replace(/\s+/g, ' ').trim();
      
      const newGame = new Chess();
      newGame.loadPgn(normalizedPGN);
      
      const history: MoveHistoryItem[] = [];
      const tempGame = new Chess();
      
      newGame.history().forEach((move, index) => {
        tempGame.move(move);
        history.push({
          move,
          fen: tempGame.fen(),
          moveNumber: Math.floor(index / 2) + 1,
          isWhite: index % 2 === 0,
        });
      });
      
      set({
        game: newGame,
        analysis: {
          history,
          currentMoveIndex: history.length - 1,
          branches: [],
          isNavigating: false,
        },
        mode: 'analysis',
      });
      return true;
    } catch {
      return false;
    }
    return false;
  },
  
  // 履歴ナビゲーション
  goToMove: (index) => {
    const { analysis } = get();
    if (index < -1 || index >= analysis.history.length) return;
    
    const newGame = new Chess();
    if (index >= 0) {
      // 指定手まで再生
      analysis.history.slice(0, index + 1).forEach(item => {
        newGame.move(item.move);
      });
    }
    
    set((state) => ({
      game: newGame,
      analysis: {
        ...state.analysis,
        currentMoveIndex: index,
        isNavigating: true,
      },
    }));
  },
  
  goToFirst: () => get().goToMove(-1),
  
  goToLast: () => {
    const { analysis } = get();
    get().goToMove(analysis.history.length - 1);
  },
  
  goToPrevious: () => {
    const { analysis } = get();
    get().goToMove(analysis.currentMoveIndex - 1);
  },
  
  goToNext: () => {
    const { analysis } = get();
    get().goToMove(analysis.currentMoveIndex + 1);
  },
  
  // 分岐作成
  createBranch: (fromIndex) => {
    set((state) => ({
      analysis: {
        ...state.analysis,
        branches: [
          ...state.analysis.branches,
          { moveIndex: fromIndex, moves: [] },
        ],
      },
    }));
  },
  
  // PGNエクスポート
  exportPGN: () => {
    const { analysis } = get();
    let pgn = '';
    let moveNum = 1;
    
    analysis.history.forEach((item) => {
      if (item.isWhite) {
        pgn += `${moveNum}. ${item.move} `;
      } else {
        pgn += `${item.move} `;
        moveNum++;
      }
    });
    
    return pgn.trim();
  },
  
  // FENエクスポート
  exportFEN: () => {
    return get().game.fen();
  },
  
  // パズル
  loadPuzzle: (puzzle) => {
    const newGame = new Chess();
    newGame.load(puzzle.fen);
    
    set({
      currentPuzzle: puzzle,
      game: newGame,
      analysis: createInitialAnalysis(),
      mode: 'puzzle',
    });
  },
  
  nextPuzzle: () => set((prev) => ({
    puzzleIndex: prev.puzzleIndex + 1,
  })),
  
  recordPuzzleAttempt: (attempt) => set((prev) => ({
    puzzleAttempts: [...prev.puzzleAttempts, attempt]
  })),
  
  // オープニング
  loadOpening: (opening) => {
    const newGame = new Chess();
    opening.moves.forEach(move => newGame.move(move));
    
    const history: MoveHistoryItem[] = [];
    const tempGame = new Chess();
    opening.moves.forEach((move, index) => {
      tempGame.move(move);
      history.push({
        move,
        fen: tempGame.fen(),
        moveNumber: Math.floor(index / 2) + 1,
        isWhite: index % 2 === 0,
      });
    });
    
    set({
      currentOpening: opening,
      openingStep: 0,
      game: newGame,
      analysis: {
        history,
        currentMoveIndex: history.length - 1,
        branches: [],
        isNavigating: false,
      },
      mode: 'opening',
    });
  },
  
  nextOpeningStep: () => set((prev) => ({
    openingStep: Math.min(prev.openingStep + 1, (prev.currentOpening?.moves.length || 0) - 1)
  })),
  
  prevOpeningStep: () => set((prev) => ({
    openingStep: Math.max(prev.openingStep - 1, 0)
  })),
  
  // チャット
  addMessage: (message) => set((prev) => ({
    messages: [...prev.messages, message]
  })),
  
  clearChat: () => set({ messages: [] }),
  
  setAIThinking: (thinking) => set({ isAIThinking: thinking }),
}));
