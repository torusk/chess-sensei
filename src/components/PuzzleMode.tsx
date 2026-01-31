import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Puzzle } from '../types';
import { invoke } from '@tauri-apps/api/tauri';
import { 
  Trophy, 
  Target, 
  Clock, 
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PuzzleMode() {
  const { 
    mode, 
    currentPuzzle, 
    loadPuzzle, 
    puzzleIndex,
    resetGame 
  } = useGameStore();
  
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // パズルリスト取得
  useEffect(() => {
    if (mode === 'puzzle') {
      loadPuzzleList();
    }
  }, [mode]);

  const loadPuzzleList = async () => {
    setLoading(true);
    try {
      const result: Puzzle[] = await invoke('get_puzzles', {
        theme: null,
        difficulty: null,
        limit: 10
      });
      setPuzzles(result);
      if (result.length > 0 && !currentPuzzle) {
        loadPuzzle(result[0]);
      }
    } catch (error) {
      console.error('Failed to load puzzles:', error);
    }
    setLoading(false);
  };

  const handleNextPuzzle = () => {
    const nextIndex = (puzzleIndex + 1) % puzzles.length;
    loadPuzzle(puzzles[nextIndex]);
    setSolved(false);
    setAttempts(0);
    setShowHint(false);
  };

  const handlePrevPuzzle = () => {
    const prevIndex = puzzleIndex === 0 ? puzzles.length - 1 : puzzleIndex - 1;
    loadPuzzle(puzzles[prevIndex]);
    setSolved(false);
    setAttempts(0);
    setShowHint(false);
  };

  if (mode !== 'puzzle') return null;

  return (
    <div className="space-y-4">
      {/* パズル情報パネル */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">詰め問題 {puzzleIndex + 1}/{puzzles.length}</h3>
              {currentPuzzle && (
                <p className="text-xs text-text-secondary">
                  テーマ: {currentPuzzle.theme} | 難易度: {'★'.repeat(currentPuzzle.difficulty)}
                </p>
              )}
            </div>
          </div>
          
          {solved && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-success"
            >
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">クリア!</span>
            </motion.div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="flex gap-2">
          <button 
            onClick={handlePrevPuzzle}
            className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm"
            disabled={puzzles.length <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
            前へ
          </button>
          <button 
            onClick={resetGame}
            className="btn-secondary flex items-center justify-center gap-1 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNextPuzzle}
            className="btn-primary flex-1 flex items-center justify-center gap-1 text-sm"
            disabled={puzzles.length <= 1}
          >
            次へ
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ヒントパネル */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-warning" />
            <span className="font-medium text-sm">ヒント</span>
          </div>
          <button 
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-accent hover:underline"
          >
            {showHint ? '隠す' : '表示'}
          </button>
        </div>
        
        <AnimatePresence>
          {showHint && currentPuzzle && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-text-secondary bg-bg-secondary p-3 rounded-lg"
            >
              {currentPuzzle.description || 'ヒントはありません'}
            </motion.div>
          )}
        </AnimatePresence>
        
        {!showHint && (
          <p className="text-xs text-text-secondary">
            ヒントを表示すると解答のヒントが見れます
          </p>
        )}
      </div>

      {/* 統計 */}
      <div className="panel p-4">
        <h4 className="text-sm font-semibold mb-3">今回の挑戦</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-secondary p-3 rounded-lg">
            <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
              <RotateCcw className="w-3 h-3" />
              試行回数
            </div>
            <p className="text-xl font-semibold">{attempts}</p>
          </div>
          <div className="bg-bg-secondary p-3 rounded-lg">
            <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
              <Clock className="w-3 h-3" />
              ステータス
            </div>
            <p className="text-sm font-medium">
              {solved ? (
                <span className="text-success">クリア!</span>
              ) : (
                <span className="text-warning">挑戦中</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
