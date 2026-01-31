import { useGameStore } from '../store/useGameStore';
import { Clock, RotateCcw, FlipHorizontal } from 'lucide-react';

export function GameInfo() {
  const { game, orientation, resetGame, flipBoard, mode } = useGameStore();

  const getModeTitle = () => {
    switch (mode) {
      case 'play': return '対局モード';
      case 'puzzle': return '詰め問題';
      case 'opening': return 'オープニング練習';
      case 'analysis': return '解析モード';
      default: return '';
    }
  };

  return (
    <div className="panel p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-lg">{getModeTitle()}</h3>
        <p className="text-sm text-text-secondary">
          {game.turn() === 'w' ? '白番' : '黒番'}の手番です
        </p>
      </div>

      {game.isCheck() && (
        <div className="bg-error/10 text-error px-3 py-2 rounded-lg text-sm font-medium">
          チェック！
        </div>
      )}

      {game.isCheckmate() && (
        <div className="bg-error text-white px-3 py-2 rounded-lg text-sm font-medium">
          チェックメイト！
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Clock className="w-4 h-4" />
        <span>手数: {game.history().length}</span>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={resetGame}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          リセット
        </button>
        <button 
          onClick={flipBoard}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
        >
          <FlipHorizontal className="w-4 h-4" />
          {orientation === 'white' ? '黒側' : '白側'}
        </button>
      </div>
    </div>
  );
}
