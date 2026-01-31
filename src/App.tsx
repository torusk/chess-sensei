import { useGameStore } from './store/useGameStore';
import { Layout } from './components/Layout';
import { ChessBoard } from './components/ChessBoard';
import { ModeSelector } from './components/ModeSelector';
import { ChatPanel } from './components/ChatPanel';
import { GameInfo } from './components/GameInfo';
import { EvaluationBar } from './components/EvaluationBar';
import { PuzzleMode } from './components/PuzzleMode';
import { OpeningMode } from './components/OpeningMode';
import { PositionLoader } from './components/PositionLoader';
import { BoardControls } from './components/BoardControls';

function App() {
  const { mode } = useGameStore();

  return (
    <Layout>
      <div className="h-full flex gap-6 p-6 min-w-[1200px]">
        {/* 左パネル：モード・局面読込 */}
        <div className="w-64 flex flex-col gap-4 shrink-0">
          <ModeSelector />
          {mode === 'puzzle' && <PuzzleMode />}
          {mode === 'opening' && <OpeningMode />}
          {mode === 'play' && <GameInfo />}
          <PositionLoader />
        </div>

        {/* 中央：チェス盤 + コントロール */}
        <div className="flex-1 flex flex-col items-center justify-start gap-4 min-w-0">
          <div className="flex items-start gap-4">
            <EvaluationBar />
            <ChessBoard />
          </div>
          <div className="w-[560px]">
            <BoardControls />
          </div>
        </div>

        {/* 右パネル：AIチャット */}
        <div className="w-80 shrink-0">
          <ChatPanel />
        </div>
      </div>
    </Layout>
  );
}

export default App;
