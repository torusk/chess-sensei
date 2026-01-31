import { useGameStore } from '../store/useGameStore';
import { RotateCcw, FlipHorizontal } from 'lucide-react';

export function GameInfo() {
  const { game, resetGame, flipBoard } = useGameStore();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${game.turn() === 'w' ? 'bg-white border-2 border-slate-400' : 'bg-slate-800'}`} />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {game.turn() === 'w' ? '白番' : '黒番'}
            </p>
            <p className="text-xs text-slate-500">
              {game.isCheck() ? 'チェック！' : `${game.history().length}手目`}
            </p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={resetGame}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
            title="リセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={flipBoard}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
            title="盤面反転"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
