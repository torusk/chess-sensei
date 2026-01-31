import { useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { useGameStore } from '../store/useGameStore';
import { Square } from 'react-chessboard/dist/chessboard/types';

export function ChessBoard() {
  const { game, orientation, makeMove } = useGameStore();
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});
  const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, any>>({});

  // 合法手の表示
  const getMoveOptions = useCallback((square: Square) => {
    const moves = game.moves({
      square,
      verbose: true,
    });

    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, any> = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to as Square) &&
          game.get(move.to as Square)?.color !== game.get(square)?.color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
    return true;
  }, [game]);

  // 駒をクリック
  const onSquareClick = useCallback((square: Square) => {
    setRightClickedSquares({});

    // 既に移動元を選択済み
    if (moveFrom) {
      const moves = game.moves({
        square: moveFrom,
        verbose: true,
      });
      const foundMove = moves.find(
        (m) => m.from === moveFrom && m.to === square
      );

      if (foundMove) {
        // プロモーション自動判定
        const isPromotion = 
          game.get(moveFrom)?.type === 'p' && 
          (square[1] === '8' || square[1] === '1');
        
        const promotion = isPromotion ? 'q' : undefined;
        
        // ストアのmakeMoveを呼ぶ（履歴も自動更新される）
        const success = makeMove(moveFrom, square, promotion);
        
        if (!success) {
          console.error('Move failed:', moveFrom, square);
        }
      }
      
      setMoveFrom(null);
      setOptionSquares({});
      return;
    }

    // 新しい移動元を選択
    const hasOptions = getMoveOptions(square);
    if (hasOptions) setMoveFrom(square);
  }, [game, moveFrom, getMoveOptions, makeMove]);

  // 右クリック（マーカー）
  const onSquareRightClick = useCallback((square: Square) => {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares((prev) => ({
      ...prev,
      [square]:
        prev[square] && prev[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    }));
  }, []);

  return (
    <div className="chess-board-container">
      <Chessboard
        id="chess-sensei-board"
        position={game.fen()}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        customBoardStyle={{
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#b58863' }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        customSquareStyles={{
          ...optionSquares,
          ...rightClickedSquares,
        }}
        boardOrientation={orientation}
        boardWidth={560}
        animationDuration={300}
      />
    </div>
  );
}
