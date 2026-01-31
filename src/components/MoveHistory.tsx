import { useGameStore } from '../store/useGameStore';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function MoveHistory() {
  const { 
    analysis, 
    goToFirst, 
    goToLast, 
    goToPrevious, 
    goToNext, 
    exportPGN, 
    exportFEN 
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
    
    // 白の手だけがある場合（最後の手が白の場合）
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  const moveLines = formatMoves();
  const currentMoveDisplay = analysis.currentMoveIndex >= 0 
    ? Math.floor(analysis.currentMoveIndex / 2) + 1 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">手順</h3>
        <span className="text-xs text-slate-500">
          {analysis.history.length > 0 
            ? `${currentMoveDisplay + (analysis.currentMoveIndex % 2 === 0 ? 0.5 : 0)}/${Math.ceil(analysis.history.length / 2)}手目`
            : '開始局面'
          }
        </span>
      </div>

      {/* 手順表示エリア */}
      <div className="h-32 overflow-y-auto bg-slate-50 rounded-md p-2 mb-3 text-xs font-mono">
        {moveLines.length === 0 ? (
          <p className="text-slate-400 text-center py-8">まだ手が指されていません</p>
        ) : (
          <div className="space-y-1">
            {moveLines.map((line, lineIndex) => {
              const moveNum = lineIndex + 1;
              const isCurrentLine = Math.floor(analysis.currentMoveIndex / 2) === lineIndex;
              
              return (
                <div 
                  key={lineIndex}
                  className={`flex gap-2 ${isCurrentLine ? 'bg-blue-50 -mx-2 px-2 py-0.5' : ''}`}
                >
                  <span className="text-slate-400 w-8">{moveNum}.</span>
                  <span className="text-slate-700">{line.replace(/^\d+\.\s*/, '')}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex items-center justify-center gap-1 mb-3">
        <button
          onClick={goToFirst}
          disabled={analysis.currentMoveIndex < 0}
          className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="最初に戻る"
        >
          <ChevronFirst className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={goToPrevious}
          disabled={analysis.currentMoveIndex < 0}
          className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="前の手"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={goToNext}
          disabled={analysis.currentMoveIndex >= analysis.history.length - 1}
          className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="次の手"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={goToLast}
          disabled={analysis.currentMoveIndex >= analysis.history.length - 1}
          className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="最後に進む"
        >
          <ChevronLast className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* コピーボタン */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyPGN}
          disabled={analysis.history.length === 0}
          className="flex-1 py-2 px-3 bg-slate-100 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
        >
          {copied === 'pgn' ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              コピー済
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              PGNコピー
            </>
          )}
        </button>
        <button
          onClick={handleCopyFEN}
          className="flex-1 py-2 px-3 bg-slate-100 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
        >
          {copied === 'fen' ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              コピー済
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              FENコピー
            </>
          )}
        </button>
      </div>
    </div>
  );
}
