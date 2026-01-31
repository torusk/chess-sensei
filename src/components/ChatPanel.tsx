import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { invoke } from '@tauri-apps/api/tauri';
import { Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function ChatPanel() {
  const { messages, isAIThinking, addMessage, setAIThinking, mode } = useGameStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAIThinking]);

  // 初回メッセージ（ StrictMode対策でフラグ使用）
  const hasAddedWelcome = useRef(false);
  useEffect(() => {
    if (messages.length === 0 && !hasAddedWelcome.current) {
      hasAddedWelcome.current = true;
      const welcomeMessage = getWelcomeMessage(mode);
      addMessage({
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      });
    }
  }, []); // modeが変わっても再実行しない

  const getWelcomeMessage = (mode: string) => {
    switch (mode) {
      case 'play':
        return '対局モードへようこそ！私と一緒にチェスを学びましょう。どんな質問でもどうぞ。';
      case 'puzzle':
        return '詰め問題モードですね。問題を解く上でヒントが必要な場合は、いつでも聞いてください。';
      case 'opening':
        return 'オープニング練習モードへようこそ。定石の理解を深めていきましょう。';
      case 'analysis':
        return '解析モードです。局面の評価や最善手について解説します。';
      default:
        return 'Chess Senseiへようこそ！何かお手伝いできることはありますか？';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isAIThinking) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setAIThinking(true);

    // デバッグログ
    console.log('[Chat] Starting AI request...');

    try {
      // 直近10件のコンテキストを作成
      const recentMessages: ChatMessage[] = messages
        .slice(-9) // 直近9件
        .map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));
      
      // ユーザーの新しいメッセージを追加
      recentMessages.push({ role: 'user', content: input });

      // システムプロンプトを追加（チェスの先生として）
      const systemPrompt: ChatMessage = {
        role: 'system',
        content: 'あなたはチェスの先生です。日本語で親しみやすく、わかりやすく解説してください。局面の評価、戦略的アドバイス、具体的な手の提案など、チェスに関する質問に答えてください。'
      };

      const allMessages = [systemPrompt, ...recentMessages];

      console.log('[Chat] Sending messages:', allMessages);
      console.log('[Chat] Invoking Tauri command...');

      // Tauri経由でバックエンドのOllama APIを呼び出し
      const response: string = await invoke('chat_with_ai', {
        messages: allMessages,
        model: 'qwen2.5:14b'
      });

      console.log('[Chat] Response received:', response);

      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `すみません、AIとの通信に失敗しました。\n\nエラー: ${errorMessage}\n\nOllamaが起動しているか確認してください（http://localhost:11434）`,
        timestamp: new Date(),
      });
    } finally {
      setAIThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="panel h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AIセンセイ</h3>
          <p className="text-xs text-text-secondary">qwen2.5:14b</p>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-2 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-accent text-white' 
                  : 'bg-accent/10 text-accent'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                message.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-bg-secondary text-text-primary'
              }`}>
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isAIThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-text-secondary text-sm"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            AIが考え中...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isAIThinking}
            className="btn-primary px-3 self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-text-secondary mt-2">
          Enterで送信、Shift+Enterで改行
        </p>
      </div>
    </div>
  );
}
