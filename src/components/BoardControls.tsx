import { useGameStore } from '../store/useGameStore';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Copy, Check, RotateCcw, FlipHorizontal } from 'lucide-react';
import { useState } from 'react';

export function BoardControls() {
  const { 
    analysis, 
    goToFirst, 
    goToLast, 
    goToPrevious, 
    goToNext, 
    exportPGN, 
    exportFEN,
    resetGame,
    flipBoard
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

  // 手順を整形して表示
  const formatMoves = () => {
    const lines: string[] = [];
    let currentLine = '';
    
    analysis.history.forEach((item) => {
      if (item.isWhite) {
        currentLine = `${item.moveNumber}. ${item.move}`;
      } else {
        currentLine += ` ${item.move}`;
        lines.push(currentLine);
        currentLine = '';
      }
    });
    
    // 白の手だけがある場合
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  const moveLines = formatMoves();
  const currentMoveNum = analysis.currentMoveIndex >= 0 
    ? Math.floor(analysis.currentMoveIndex / 2) + 1 
    : 0;
  const totalMoves = Math.ceil(analysis.history.length / 2);

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
        
        {/* 手順表示エリア */}
        <div className="h-20 overflow-y-auto px-3 py-2 text-xs font-mono bg-slate-50/50">
          {moveLines.length === 0 ? (
            <p className="text-slate-400 text-center py-4">まだ手が指されていません</p>
          ) : (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {moveLines.map((line, lineIndex) => {
                const isCurrentLine = Math.floor(analysis.currentMoveIndex / 2) === lineIndex;
                
                return (
                  <span 
                    key={lineIndex}
                    className={`${isCurrentLine ? 'bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded' : 'text-slate-600'}`}
                  >
                    {line}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 下部：コントロール */}
      <div className="p-3 space-y-3">
        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={goToFirst}
            disabled={analysis.currentMoveIndex < 0}
            className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="最初"
          >
            <ChevronFirst className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={goToPrevious}
            disabled={analysis.currentMoveIndex < 0}
            className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="前へ"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          
          <div className="mx-2 px-3 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600 min-w-[4rem] text-center">
            {analysis.currentMoveIndex + 1} / {analysis.history.length}
          </div>
          
          <button
            onClick={goToNext}
            disabled={analysis.currentMoveIndex >= analysis.history.length - 1}
            className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="次へ"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={goToLast}
            disabled={analysis.currentMoveIndex >= analysis.history.length - 1}
            className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="最後"
          >
            <ChevronLast className="w-4 h-4 text-slate-600" />
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
