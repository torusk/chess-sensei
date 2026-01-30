import { ReactNode } from 'react';
import { Crown, Settings, HelpCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Chess Sensei</h1>
              <p className="text-xs text-text-secondary">AIと学ぶチェス教室</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              ヘルプ
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Settings className="w-4 h-4" />
              設定
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <p>ローカルAI完全対応 | Ollama連携</p>
          <p>v0.1.0</p>
        </div>
      </footer>
    </div>
  );
}
