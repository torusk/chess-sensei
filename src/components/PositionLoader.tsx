import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';

export function PositionLoader() {
  const [fenInput, setFenInput] = useState('');
  const [pgnInput, setPgnInput] = useState('');
  const [activeTab, setActiveTab] = useState<'fen' | 'pgn'>('pgn');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { loadFEN, loadPGN } = useGameStore();

  const handleLoadFEN = () => {
    if (!fenInput.trim()) {
      setMessage({ type: 'error', text: 'FENを入力してください' });
      return;
    }
    
    const success = loadFEN(fenInput.trim());
    if (success) {
      setMessage({ type: 'success', text: 'FENを読み込みました' });
      setFenInput('');
    } else {
      setMessage({ type: 'error', text: '無効なFENです' });
    }
  };

  const handleLoadPGN = () => {
    if (!pgnInput.trim()) {
      setMessage({ type: 'error', text: 'PGNを入力してください' });
      return;
    }
    
    const success = loadPGN(pgnInput.trim());
    if (success) {
      setMessage({ type: 'success', text: 'PGNを読み込みました' });
      setPgnInput('');
    } else {
      setMessage({ type: 'error', text: '無効なPGNです' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <Upload className="w-4 h-4" />
        局面読み込み
      </h3>

      {/* タブ切り替え */}
      <div className="flex gap-1 mb-3 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('pgn')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'pgn'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          PGN
        </button>
        <button
          onClick={() => setActiveTab('fen')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'fen'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          FEN
        </button>
      </div>

      {/* PGN入力 */}
      {activeTab === 'pgn' && (
        <div className="space-y-2">
          <textarea
            value={pgnInput}
            onChange={(e) => setPgnInput(e.target.value)}
            placeholder="PGN棋譜を貼り付け...&#10;例: 1. e4 e5 2. Nf3 Nc6..."
            className="w-full h-24 px-3 py-2 text-xs border border-slate-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            onClick={handleLoadPGN}
            className="w-full py-2 px-4 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            PGNを読込
          </button>
        </div>
      )}

      {/* FEN入力 */}
      {activeTab === 'fen' && (
        <div className="space-y-2">
          <input
            type="text"
            value={fenInput}
            onChange={(e) => setFenInput(e.target.value)}
            placeholder="FENを入力..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            onClick={handleLoadFEN}
            className="w-full py-2 px-4 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            FENを読込
          </button>
        </div>
      )}

      {/* メッセージ */}
      {message && (
        <div
          className={`mt-3 flex items-center gap-2 text-xs ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        chess.comなどからコピーした棋譜をそのまま貼り付けられます
      </p>
    </div>
  );
}
