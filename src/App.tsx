import { useGameStore } from './store/useGameStore';
import { Layout } from './components/Layout';
import { ChessBoard } from './components/ChessBoard';
import { ModeSelector } from './components/ModeSelector';
import { ChatPanel } from './components/ChatPanel';
import { GameInfo } from './components/GameInfo';
import { PuzzleMode } from './components/PuzzleMode';
import { OpeningMode } from './components/OpeningMode';
import { PositionLoader } from './components/PositionLoader';
import { BoardControls } from './components/BoardControls';

function App() {
  const { mode } = useGameStore();

  return (
    <Layout>
      <div className="flex-1 flex gap-6 p-6 min-w-[1200px]">
        {/* 左パネル */}
        <div className="w-64 flex flex-col gap-4 shrink-0">
          <ModeSelector />
          {mode === 'puzzle' && <PuzzleMode />}
          {mode === 'opening' && <OpeningMode />}
          {mode === 'play' && <GameInfo />}
          <PositionLoader />
        </div>

        {/* 中央 */}
        <div className="flex-1 flex flex-col items-center gap-4 min-w-0">
          <ChessBoard />
          <div className="w-[560px]">
            <BoardControls />
          </div>
        </div>

        {/* 右パネル */}
        <div className="w-80 flex flex-col shrink-0">
          <ChatPanel />
        </div>
      </div>
    </Layout>
  );
}

export default App;
