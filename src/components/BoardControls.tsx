import { useGameStore } from '../store/useGameStore';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Copy, Check, RotateCcw, FlipHorizontal, GitBranch, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function BoardControls() {
  const { 
    analysis, 
    goToMove,
    goToFirst, 
    goToLast, 
    goToPrevious, 
    goToNext, 
    exportPGN, 
    exportFEN,
    resetGame,
    flipBoard,
    switchToBranch,
    deleteBranch,
    getActiveLine
  } = useGameStore();
  
  const [copied, setCopied] = useState<'pgn' | 'fen' | null>(null);

  const handleCopyPGN = async () => {
    const pgn = exportPGN();
    if (pgn) {
      await navigator.clipboard.writeText(pgn);
      setCopied('pgn');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleCopyFEN = async () => {
    const fen = exportFEN();
    await navigator.clipboard.writeText(fen);
    setCopied('fen');
    setTimeout(() => setCopied(null), 2000);
  };

  // アクティブライン（メインまたは分岐）を取得
  const activeLine = getActiveLine();
  const currentMoveNum = analysis.currentMoveIndex >= 0 
    ? Math.floor(analysis.currentMoveIndex / 2) + 1 
    : 0;
  const totalMoves = Math.ceil(activeLine.length / 2);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* 上部：手順表示 */}
      <div className="border-b border-slate-100">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">棋譜</h3>
          <span className="text-xs text-slate-500">
            {analysis.history.length > 0 
              ? `${currentMoveNum}/${totalMoves}手目`
              : '開始局面'
            }
          </span>
        </div>
        
        {/* 手順表示エリア - クリック可能な手 */}
        <div className="h-24 overflow-y-auto px-3 py-2 text-xs bg-slate-50/50">
          {activeLine.length === 0 ? (
            <p className="text-slate-400 text-center py-4">まだ手が指されていません</p>
          ) : (
            <div className="flex flex-wrap gap-x-1 gap-y-1">
              {activeLine.map((item, index) => {
                const isCurrentMove = analysis.currentMoveIndex === index;
                
                return (
                  <button
                    key={index}
                    onClick={() => goToMove(index)}
                    className={`px-1.5 py-0.5 rounded transition-all hover:scale-105 ${
                      isCurrentMove 
                        ? 'bg-blue-500 text-white font-semibold shadow-sm' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                    title={`${item.moveNumber}. ${item.move} - クリックしてこの局面へ`}
                  >
                    {item.isWhite ? `${item.moveNumber}.` : ''}{item.move}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 下部：コントロール */}
      <div className="p-3 space-y-3">
        {/* ブランチ管理 */}
        {(analysis.branches.length > 0 || analysis.activeBranchId) && (
          <div className="flex items-center gap-2">
            <select
              value={analysis.activeBranchId || ''}
              onChange={(e) => switchToBranch(e.target.value || null)}
              className="flex-1 text-xs bg-white border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Main Line</option>
              {analysis.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            
            {analysis.activeBranchId && (
              <button
                onClick={() => deleteBranch(analysis.activeBranchId!)}
                className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title="Delete Branch"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
        
        {/* ブランチインジケーター */}
        {analysis.activeBranchId && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 rounded-md">
            <GitBranch className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-purple-700 font-medium">
              {analysis.branches.find(b => b.id === analysis.activeBranchId)?.name || 'Branch'}
            </span>
          </div>
        )}
        
        {/* ナビゲーションボタン - 大きく使いやすく */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={goToFirst}
            disabled={analysis.currentMoveIndex < 0}
            className="p-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-100 transition-all active:scale-95"
            title="最初に戻る"
          >
            <ChevronFirst className="w-6 h-6 text-slate-700" />
          </button>
          <button
            onClick={goToPrevious}
            disabled={analysis.currentMoveIndex < 0}
            className="p-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-100 transition-all active:scale-95"
            title="1手戻る"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          
          <div className="mx-3 px-4 py-2 bg-blue-50 rounded-lg text-sm font-semibold text-blue-700 min-w-[5rem] text-center border border-blue-100">
            {analysis.currentMoveIndex + 1} / {analysis.history.length}
          </div>
          
          <button
            onClick={goToNext}
            disabled={analysis.currentMoveIndex >= analysis.history.length - 1}
            className="p-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-100 transition-all active:scale-95"
            title="1手進む"
          >
            <ChevronRight className="w-6 h-6 text-slate-700" />
          </button>
          <button
            onClick={goToLast}
            disabled={analysis.currentMoveIndex >= analysis.history.length - 1}
            className="p-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-100 transition-all active:scale-95"
            title="最後に進む"
          >
            <ChevronLast className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyPGN}
            disabled={analysis.history.length === 0}
            className="flex-1 py-1.5 px-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
          >
            {copied === 'pgn' ? (
              <>
                <Check className="w-3 h-3 text-green-600" />
                コピー済
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                PGN
              </>
            )}
          </button>
          <button
            onClick={handleCopyFEN}
            className="flex-1 py-1.5 px-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            {copied === 'fen' ? (
              <>
                <Check className="w-3 h-3 text-green-600" />
                コピー済
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                FEN
              </>
            )}
          </button>
          <button
            onClick={flipBoard}
            className="py-1.5 px-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
            title="盤面反転"
          >
            <FlipHorizontal className="w-3 h-3" />
          </button>
          <button
            onClick={resetGame}
            className="py-1.5 px-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
            title="リセット"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
