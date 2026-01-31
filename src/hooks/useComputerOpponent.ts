import { useState, useCallback } from 'react';

interface StockfishMove {
  from: string;
  to: string;
  promotion?: string;
  san: string;
}

export function useComputerOpponent() {
  const [isThinking, setIsThinking] = useState(false);
  const [difficulty, setDifficulty] = useState(10);
  const isReady = true; // 簡易実装：常に準備完了

  // 簡易実装：ランダムな合法手を返す（デモ用）
  const getComputerMove = useCallback(async (_fen: string): Promise<StockfishMove | null> => {
    setIsThinking(true);
    
    // デモ用：少し待ってからnullを返す（実際の実装は後で）
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsThinking(false);
    return null; // 一旦無効化
  }, []);

  return {
    getComputerMove,
    isThinking,
    difficulty,
    setDifficulty,
    isReady
  };
}
