# Chess Sensei - AIと学ぶチェス教室

> **🎉 このプロジェクトは [opencode](https://opencode.ai) と [Kimi K2.5](https://www.moonshot.cn/) によって実装されました！**
>
> フロントエンドからバックエンド、そしてデザインまで、AIの力でゼロから構築された完全ローカル動作のチェストレーニングアプリです。

ローカルAI（Ollama）と連携した、詰め問題・オープニング練習対応のチェストレーニングアプリ。

## ✨ 主な機能

- **🎯 対局モード**: AIと対戦して実力を試す。評価値バーで形勢を可視化
- **🧩 詰め問題**: テーマ別・難易度別の問題集。ヒント機能付き
  - mate_in_1, mate_in_2 などのテーマ
  - 難易度 ★〜★★★★★
- **📚 オープニング練習**: 定石を学んで序盤を制す
  - **教わるモード**: AIが1手ずつ解説しながら進める
  - **テストモード**: 正しい手を指して定石を覚える
- **🤖 AI解説**: Ollama（qwen2.5:14b）と対話しながら学習
  - 局面の評価と解説
  - 戦略的アドバイス
  - 日本語での自然な対話

## 🛠️ 技術スタック

### フロントエンド
- **Tauri** - Rust製デスクトップアプリフレームワーク（軽量・高速）
- **React 18 + TypeScript** - 型安全なUI構築
- **react-chessboard** - 高品質なチェス盤表示
- **chess.js** - チェスロジック・FEN解析
- **Zustand** - シンプルな状態管理
- **TailwindCSS** - モダンなスタイリング
- **Framer Motion** - スムーズなアニメーション

### バックエンド（Rust）
- **Tauri Commands** - フロントエンドとの通信
- **SQLite** - 詰め問題・オープニングデータ・学習進捗の管理
- **Ollama API** - ローカルLLM連携（外部API不要）
- **Stockfish** - チェスエンジン（WASM版、ブラウザ内で動作）

### 開発環境
- **Vite** - 高速な開発サーバー
- **Cargo** - Rustのビルドシステム

## 💻 必要条件

- **Node.js** 18+
- **Rust** 1.70+
- **Ollama**（ローカルにインストール済み）
  - 推奨モデル: `qwen2.5:14b`（日本語対応・高品質）
  - その他利用可能: `gemma2:9b`, `translategemma` など

### M5 MacBook Pro（24GB）推奨構成
このアプリは M5 MacBook Pro + 24GB RAM を想定して設計されています。
- qwen2.5:14b（9GB）が快適に動作
- 完全ローカル処理でプライバシー保護
- ファンレスで静音動作

## 🚀 クイックスタート

```bash
# 1. リポジトリをクローン
git clone https://github.com/yourusername/chess-sensei.git
cd chess-sensei

# 2. 依存関係をインストール
npm install

# 3. Tauri開発サーバーを起動
npm run tauri dev

# 4. アプリが自動的に開きます！
```

## 📦 ビルド

```bash
# 開発ビルド
npm run tauri dev

# リリースビルド（最適化済み）
npm run tauri build

# Mac用 .app 生成
npm run tauri build -- --target universal-apple-darwin
```

## 🏗️ プロジェクト構造

```
chess-sensei/
├── src/                        # フロントエンド（React + TypeScript）
│   ├── components/            # UIコンポーネント
│   │   ├── ChatPanel.tsx      # AI対話パネル
│   │   ├── ChessBoard.tsx     # チェス盤
│   │   ├── EvaluationBar.tsx  # 評価値バー
│   │   ├── GameInfo.tsx       # ゲーム情報
│   │   ├── Layout.tsx         # レイアウト
│   │   ├── ModeSelector.tsx   # モード選択
│   │   ├── OpeningMode.tsx    # オープニングUI
│   │   └── PuzzleMode.tsx     # 詰め問題UI
│   ├── store/
│   │   └── useGameStore.ts    # Zustand状態管理
│   ├── types/
│   │   └── index.ts           # TypeScript型定義
│   ├── styles/
│   │   └── index.css          # TailwindCSS + カスタム
│   ├── App.tsx                # メインアプリ
│   └── main.tsx               # エントリポイント
│
├── src-tauri/                 # バックエンド（Rust）
│   └── src/
│       ├── main.rs            # アプリエントリポイント
│       ├── database.rs        # SQLiteデータベース管理
│       ├── ollama.rs          # Ollama APIクライアント
│       ├── stockfish.rs       # Stockfish連携
│       └── commands.rs        # Tauriコマンド定義
│
├── puzzles/                   # 詰め問題データ（JSON/PGN）
├── openings/                  # オープニングデータ
├── package.json
├── tailwind.config.js
└── README.md
```

## 🎨 デザインコンセプト

- **白ベースの明るいUI**: 長時間の学習でも目が疲れない
- **リッチな盤面**: react-chessboardによる美しい駒と盤
- **直感的な操作**: モード切り替えはワンクリック
- **レスポンシブ**: ウィンドウサイズに応じて自動調整

## 🧠 AI連携の仕組み

```
ユーザーの入力
    ↓
フロントエンド（React）
    ↓
Tauriコマンド（Rust）
    ↓
Ollama API（ローカル）
    ↓
qwen2.5:14b による処理
    ↓
日本語での応答生成
    ↓
フロントエンドに表示
```

**プライバシー保護**: すべての処理がローカルで完結。外部サーバーとの通信は一切なし。

## 📝 実装のポイント

1. **FEN中心設計**: すべての局面をFEN形式で統一。モード間のシームレスな連携を実現
2. **モジュラーアーキテクチャ**: 詰め問題・オープニング・対局を独立したモジュールとして実装
3. **型安全性**: TypeScript + Rustによる厳格な型チェック
4. **パフォーマンス**: React.memo + useMemoによる最適化

## 🤝 コントリビューション

バグ報告や機能提案は GitHub Issues へお願いします。

## 📄 ライセンス

MIT License - 自由に利用・改変・配布可能

## 🙏 謝辞

- **opencode** - 効率的な開発支援
- **Kimi K2.5** - 高品質なコード生成
- **Tauri Team** - 素晴らしいデスクトップフレームワーク
- **Ollama Team** - ローカルLLMの民主化

---

**Happy Chess Learning! ♟️**
