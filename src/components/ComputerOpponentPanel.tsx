import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useComputerOpponent } from '../hooks/useComputerOpponent';
import { Bot, Play, Pause, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export function ComputerOpponentPanel() {
  const { mode } = useGameStore();
  const { isThinking, difficulty, setDifficulty, isReady } = useComputerOpponent();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (mode !== 'play') return null;

  return (
    <div className="panel p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">コンピュータ対戦</h3>
          <p className="text-xs text-text-secondary">
            準備中（今後実装予定）
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      {/* 設定パネル */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 p-3 bg-bg-secondary rounded-lg"
        >
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-2">
              コンピュータの強さ（思考深度）
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              disabled={isPlaying}
              className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>初級</span>
              <span className="font-semibold text-accent">レベル {difficulty}</span>
              <span>最強</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 対局開始/停止ボタン */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        disabled={!isReady}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
          isPlaying
            ? 'bg-error text-white hover:bg-error/90'
            : 'bg-success text-white hover:bg-success/90'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isPlaying ? (
          <>
            <Pause className="w-4 h-4" />
            対局を終了
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            コンピュータ対戦を開始
          </>
        )}
      </button>

      {/* 状態表示 */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
            <p className="text-sm text-accent">
              🤖 コンピュータ対戦中！あなたは白番（下側）です。
            </p>
          </div>
          
          {isThinking && (
            <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
              <p className="text-sm text-warning">
                ⏳ コンピュータが考え中...
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
