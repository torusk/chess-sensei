import { useState, useCallback, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useStockfish } from '../hooks/useStockfish';
import { invoke } from '@tauri-apps/api/tauri';
import { Bot, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIOpponentMode() {
  const { mode, gameState, setGameState, addMessage, setAIThinking } = useGameStore();
  const { evaluate, isReady } = useStockfish();
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiLevel, setAiLevel] = useState(10); // Stockfish depth (1-20)

  // AIの手を計算して実行
  const makeAIMove = useCallback(async () => {
    if (!isPlaying || gameState.isCheckmate || gameState.isDraw) return;

    setAIThinking(true);
    
    try {
      // Stockfishで最善手を計算
      const { bestMove, evaluation } = await evaluate(gameState.fen, aiLevel);
      
      if (!bestMove || bestMove === '(none)') {
        console.log('Game over or no legal moves');
        return;
      }

      // 手をパース（例: "e2e4" → from: "e2", to: "e4"）
      const from = bestMove.substring(0, 2);
      const to = bestMove.substring(2, 4);
      const promotion = bestMove.length > 4 ? bestMove.substring(4, 5) : undefined;

      // 手を実行（実際のゲームロジックはchess.jsで処理）
      // ここではメッセージを送信してユーザーに知らせる
      const moveNotation = `${from}-${to}${promotion ? '=' + promotion.toUpperCase() : ''}`;
      
      // AIに解説してもらう
      const messages = [
        {
          role: 'system',
          content: 'あなたはチェスの先生です。コンピュータが選んだ手を、初心者にもわかりやすく解説してください。'
        },
        {
          role: 'user',
          content: `局面（FEN）: ${gameState.fen}\nコンピュータが選んだ手: ${moveNotation}\n評価値: ${evaluation > 0 ? '+' : ''}${evaluation.toFixed(2)}\n\nこの手の意図と戦略的な考え方を解説してください。`
        }
      ];

      const response: string = await invoke('chat_with_ai', {
        messages,
        model: 'qwen2.5:14b'
      });

      // メッセージを追加
      addMessage({
        id: `ai-move-${Date.now()}`,
        role: 'assistant',
        content: `🤖 **コンピュータの手**: ${moveNotation}\n\n${response}`,
        timestamp: new Date()
      });

      // 盤面を更新（実際の移動は親コンポーネントで処理）
      // ここでは手を記録のみ
      
    } catch (error) {
      console.error('AI move error:', error);
      addMessage({
        id: `ai-error-${Date.now()}`,
        role: 'assistant',
        content: 'すみません、AIの手の計算に失敗しました。',
        timestamp: new Date()
      });
    } finally {
      setAIThinking(false);
    }
  }, [isPlaying, gameState.fen, gameState.isCheckmate, gameState.isDraw, aiLevel, evaluate, addMessage, setAIThinking]);

  // ゲーム状態が変わったらAIの手を打つ
  useEffect(() => {
    if (isPlaying && gameState.turn === 'b') { // 黒番（AI側）の時
      makeAIMove();
    }
  }, [isPlaying, gameState.turn, gameState.fen, makeAIMove]);

  if (mode !== 'play') return null;

  return (
    <div className="panel p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold">AI対局モード</h3>
          <p className="text-xs text-text-secondary">
            Stockfish + qwen2.5:14b
          </p>
        </div>
      </div>

      {/* 難易度設定 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          AIの強さ（思考深度）
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={aiLevel}
          onChange={(e) => setAiLevel(parseInt(e.target.value))}
          className="w-full h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <div className="flex justify-between text-xs text-text-secondary">
          <span>初級（1）</span>
          <span className="font-semibold text-accent">現在: {aiLevel}</span>
          <span>上級（20）</span>
        </div>
      </div>

      {/* 開始/停止ボタン */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
          isPlaying
            ? 'bg-error text-white hover:bg-error/90'
            : 'bg-success text-white hover:bg-success/90'
        }`}
      >
        {isPlaying ? (
          <>
            <Pause className="w-4 h-4" />
            対局を一時停止
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            AI対局を開始
          </>
        )}
      </button>

      {isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-accent/5 rounded-lg border border-accent/20"
        >
          <p className="text-sm text-accent">
            🤖 AI対局中... あなたは白番です。駒を動かしてください！
          </p>
        </motion.div>
      )}

      {!isReady && (
        <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
          <p className="text-sm text-warning">
            ⏳ Stockfishエンジンを準備中...
          </p>
        </div>
      )}
    </div>
  );
}
