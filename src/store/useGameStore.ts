import { create } from 'zustand';
import { Chess } from 'chess.js';
import { GameMode, Puzzle, Opening, ChatMessage, PuzzleAttempt, MoveHistoryItem, AnalysisState, Branch } from '../types';

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
  
  // 分岐管理
  createBranch: (fromIndex: number) => string;
  switchToBranch: (branchId: string | null) => void;
  deleteBranch: (branchId: string) => void;
  getActiveLine: () => MoveHistoryItem[];
  
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
  activeBranchId: null,
  isNavigating: false,
});

const generateBranchId = () => `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
        moveNumber: 0, // Will be calculated based on position
        isWhite: game.turn() === 'b',
      };
      
      const activeBranch = analysis.activeBranchId 
        ? analysis.branches.find(b => b.id === analysis.activeBranchId)
        : null;
      
      if (activeBranch) {
        // We're in a branch - append to the branch
        const branchMoveIndex = activeBranch.moves.length;
        newHistoryItem.moveNumber = Math.floor((activeBranch.parentMoveIndex + branchMoveIndex + 2) / 2) + 1;
        newHistoryItem.isWhite = (activeBranch.parentMoveIndex + branchMoveIndex + 1) % 2 === 0;
        
        set((state) => ({
          analysis: {
            ...state.analysis,
            branches: state.analysis.branches.map(b =>
              b.id === activeBranch.id
                ? { ...b, moves: [...b.moves, newHistoryItem] }
                : b
            ),
            isNavigating: false,
          },
        }));
      } else if (analysis.isNavigating && analysis.currentMoveIndex < analysis.history.length - 1) {
        // Navigating in main line and not at last position - create a new branch
        const fromIndex = analysis.currentMoveIndex;
        const branchId = generateBranchId();
        const branchName = `Variation ${analysis.branches.length + 1}`;
        
        newHistoryItem.moveNumber = Math.floor((fromIndex + 2) / 2) + 1;
        newHistoryItem.isWhite = (fromIndex + 1) % 2 === 0;
        
        const newBranch: Branch = {
          id: branchId,
          name: branchName,
          moves: [newHistoryItem],
          parentMoveIndex: fromIndex,
        };
        
        set((state) => ({
          analysis: {
            ...state.analysis,
            branches: [...state.analysis.branches, newBranch],
            activeBranchId: branchId,
            isNavigating: false,
          },
        }));
      } else {
        // At end of main line - append to main line
        newHistoryItem.moveNumber = Math.floor((analysis.history.length + 1) / 2) + 1;
        newHistoryItem.isWhite = (analysis.history.length) % 2 === 0;
        
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
          ...createInitialAnalysis(),
          history,
          currentMoveIndex: history.length - 1,
        },
        mode: 'analysis',
      });
      return true;
    } catch {
      return false;
    }
  },
  
  // 履歴ナビゲーション
  goToMove: (index) => {
    const { getActiveLine } = get();
    const activeLine = getActiveLine();
    
    if (index < -1 || index >= activeLine.length) return;
    
    const newGame = new Chess();
    if (index >= 0) {
      // 指定手まで再生
      activeLine.slice(0, index + 1).forEach(item => {
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
    const { getActiveLine } = get();
    const activeLine = getActiveLine();
    get().goToMove(activeLine.length - 1);
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
    const branchId = generateBranchId();
    const branchName = `Variation ${get().analysis.branches.length + 1}`;
    
    set((state) => ({
      analysis: {
        ...state.analysis,
        branches: [
          ...state.analysis.branches,
          { id: branchId, name: branchName, moves: [], parentMoveIndex: fromIndex },
        ],
      },
    }));
    
    return branchId;
  },
  
  // 分岐切り替え
  switchToBranch: (branchId) => {
    const { analysis } = get();
    
    if (branchId === null) {
      // Switch to main line
      const newGame = new Chess();
      set((state) => ({
        game: newGame,
        analysis: {
          ...state.analysis,
          activeBranchId: null,
          currentMoveIndex: -1,
          isNavigating: true,
        },
      }));
    } else {
      const branch = analysis.branches.find(b => b.id === branchId);
      if (!branch) return;
      
      // Load position up to the parent move index
      const newGame = new Chess();
      analysis.history.slice(0, branch.parentMoveIndex + 1).forEach(item => {
        newGame.move(item.move);
      });
      
      set((state) => ({
        game: newGame,
        analysis: {
          ...state.analysis,
          activeBranchId: branchId,
          currentMoveIndex: -1, // Reset to start of branch
          isNavigating: true,
        },
      }));
    }
  },
  
  // 分岐削除
  deleteBranch: (branchId) => {
    const { analysis } = get();
    
    // If currently in this branch, switch to main line
    if (analysis.activeBranchId === branchId) {
      const newGame = new Chess();
      set((state) => ({
        game: newGame,
        analysis: {
          ...state.analysis,
          branches: state.analysis.branches.filter(b => b.id !== branchId),
          activeBranchId: null,
          currentMoveIndex: -1,
          isNavigating: true,
        },
      }));
    } else {
      set((state) => ({
        analysis: {
          ...state.analysis,
          branches: state.analysis.branches.filter(b => b.id !== branchId),
        },
      }));
    }
  },
  
  // アクティブライン取得
  getActiveLine: () => {
    const { analysis } = get();
    
    if (analysis.activeBranchId) {
      const branch = analysis.branches.find(b => b.id === analysis.activeBranchId);
      if (branch) {
        // Combine main line up to parent index with branch moves
        return [...analysis.history.slice(0, branch.parentMoveIndex + 1), ...branch.moves];
      }
    }
    
    return analysis.history;
  },
  
  // PGNエクスポート
  exportPGN: () => {
    const { getActiveLine } = get();
    const activeLine = getActiveLine();
    let pgn = '';
    
    activeLine.forEach((item) => {
      if (item.isWhite) {
        pgn += `${item.moveNumber}. ${item.move} `;
      } else {
        pgn += `${item.move} `;
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
        ...createInitialAnalysis(),
        history,
        currentMoveIndex: history.length - 1,
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
