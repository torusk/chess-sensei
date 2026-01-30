import { useGameStore } from './store/useGameStore';
import { Layout } from './components/Layout';
import { ChessBoard } from './components/ChessBoard';
import { ModeSelector } from './components/ModeSelector';
import { ChatPanel } from './components/ChatPanel';
import { GameInfo } from './components/GameInfo';
import { EvaluationBar } from './components/EvaluationBar';
import { PuzzleMode } from './components/PuzzleMode';
import { OpeningMode } from './components/OpeningMode';

function App() {
  const { mode } = useGameStore();

  const renderLeftPanel = () => {
    switch (mode) {
      case 'puzzle':
        return <PuzzleMode />;
      case 'opening':
        return <OpeningMode />;
      default:
        return (
          <>
            <ModeSelector />
            <GameInfo />
          </>
        );
    }
  };

  return (
    <Layout>
      <div className="h-full flex gap-6 p-6">
        {/* 左パネル：モード別UI */}
        <div className="w-72 flex flex-col gap-4">
          {mode !== 'puzzle' && mode !== 'opening' && <ModeSelector />}
          {renderLeftPanel()}
          {(mode === 'puzzle' || mode === 'opening') && <GameInfo />}
        </div>

        {/* 中央：チェス盤 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-4">
            <EvaluationBar />
            <ChessBoard />
          </div>
        </div>

        {/* 右パネル：AIチャット */}
        <div className="w-96">
          <ChatPanel />
        </div>
      </div>
    </Layout>
  );
}

export default App;
