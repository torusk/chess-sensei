import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Opening } from '../types';
import { invoke } from '@tauri-apps/api/tauri';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Play,
  GraduationCap,
  List,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export function OpeningMode() {
  const { 
    mode, 
    currentOpening, 
    openingStep,
    loadOpening
  } = useGameStore();
  
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [, setLoading] = useState(false);
  const [studyMode, setStudyMode] = useState<'learn' | 'test'>('learn');
  const [showList, setShowList] = useState(true);

  // オープニングリスト取得
  useEffect(() => {
    if (mode === 'opening') {
      loadOpeningsList();
    }
  }, [mode]);

  // 現在の手を反映
  useEffect(() => {
    if (currentOpening && openingStep < currentOpening.moves.length) {
      // ここで局面を更新（実際にはPGNパーサーが必要）
    }
  }, [currentOpening, openingStep]);

  const loadOpeningsList = async () => {
    setLoading(true);
    try {
      const result: Opening[] = await invoke('get_openings');
      setOpenings(result);
    } catch (error) {
      console.error('Failed to load openings:', error);
    }
    setLoading(false);
  };

  const handleSelectOpening = (opening: Opening) => {
    loadOpening(opening);
    setShowList(false);
  };

  const handleNextStep = () => {
    // openingStepを進める
  };

  const handlePrevStep = () => {
    // openingStepを戻す
  };

  if (mode !== 'opening') return null;

  return (
    <div className="space-y-4">
      {/* オープニング選択 or 詳細 */}
      <div className="panel p-4">
        {showList ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <List className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">オープニング一覧</h3>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {openings.map((opening) => (
                <motion.button
                  key={opening.id}
                  onClick={() => handleSelectOpening(opening)}
                  className="w-full p-3 rounded-lg bg-bg-secondary hover:bg-gray-200 transition-colors text-left"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{opening.name}</p>
                      <p className="text-xs text-text-secondary">ECO: {opening.eco}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-secondary" />
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">{currentOpening?.name}</h3>
                  <p className="text-xs text-text-secondary">
                    ECO: {currentOpening?.eco} | 手順 {openingStep + 1}/{currentOpening?.moves.length}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowList(true)}
                className="text-xs text-accent hover:underline"
              >
                一覧に戻る
              </button>
            </div>

            {/* 学習モード切替 */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setStudyMode('learn')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  studyMode === 'learn' 
                    ? 'bg-accent text-white' 
                    : 'bg-bg-secondary text-text-primary hover:bg-gray-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                教わる
              </button>
              <button
                onClick={() => setStudyMode('test')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  studyMode === 'test' 
                    ? 'bg-accent text-white' 
                    : 'bg-bg-secondary text-text-primary hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                テスト
              </button>
            </div>

            {/* 手順ナビゲーション */}
            <div className="flex gap-2">
              <button 
                onClick={handlePrevStep}
                className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm"
                disabled={openingStep === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                前へ
              </button>
              <button 
                onClick={handleNextStep}
                className="btn-primary flex-1 flex items-center justify-center gap-1 text-sm"
                disabled={!currentOpening || openingStep >= currentOpening.moves.length - 1}
              >
                次へ
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* 解説パネル */}
      {currentOpening && !showList && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Play className="w-4 h-4 text-success" />
            <span className="font-medium text-sm">解説</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {currentOpening.description}
          </p>
          
          {studyMode === 'learn' && (
            <div className="mt-4 p-3 bg-accent/5 rounded-lg border border-accent/20">
              <p className="text-sm text-accent font-medium">
                教わるモード: AIが1手ずつ解説しながら進めます
              </p>
            </div>
          )}
          
          {studyMode === 'test' && (
            <div className="mt-4 p-3 bg-warning/5 rounded-lg border border-warning/20">
              <p className="text-sm text-warning font-medium">
                テストモード: 正しい手を指して定石を覚えましょう
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
