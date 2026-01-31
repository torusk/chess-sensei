export function EvaluationBar() {
  // 仮の評価値（実際はStockfishから取得）
  const evaluation = 0.5; // -10 〜 +10

  // 評価値をパーセンテージに変換（-10が0%、+10が100%）
  const whitePercentage = Math.min(Math.max((evaluation + 10) / 20 * 100, 0), 100);

  return (
    <div className="h-[560px] w-8 bg-gray-800 rounded-full overflow-hidden relative shadow-lg">
      {/* 白側 */}
      <div 
        className="absolute top-0 left-0 right-0 bg-white transition-all duration-500"
        style={{ height: `${whitePercentage}%` }}
      >
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <span className="text-[10px] font-bold text-gray-800">
            {evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1)}
          </span>
        </div>
      </div>
      
      {/* 黒側 */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gray-800 transition-all duration-500"
        style={{ height: `${100 - whitePercentage}%` }}
      >
        <div className="absolute top-1 left-1/2 -translate-x-1/2">
          <span className="text-[10px] font-bold text-white">
            {evaluation < 0 ? evaluation.toFixed(1) : ''}
          </span>
        </div>
      </div>

      {/* 中央線 */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-accent/50" />
    </div>
  );
}
