# Chess Sensei - AIと学ぶチェス教室

> **🎉 このプロジェクトは [opencode](https://opencode.ai) と [Kimi K2.5](https://www.moonshot.cn/) によって実装されました！**
>
> フロントエンドからバックエンド、そしてデザインまで、AIの力でゼロから構築された完全ローカル動作のチェストレーニングアプリです。

ローカルAI（Ollama）と連携した、詰め問題・棋譜復習に対応したチェストレーニングアプリ。

## ✨ 主な機能

- **🎯 棋譜復習モード**: chess.com等からコピーした棋譜を貼り付けて復習
  - PGN形式の棋譜読み込み
  - コメントを自動除去して処理
  - 手順のナビゲーション（前へ/次へ）
  - 各局面へのクリックでジャンプ
  - 分岐機能：途中から別の手を指して変化を試せる
  - FEN/PGNコピー機能（現在局面や棋譜全体）
- **🧩 詰め問題**: テーマ別・難易度別の問題集。ヒント機能付き
  - mate_in_1, mate_in_2 などのテーマ
  - 難易度 ★〜★★★★★
- **📚 オープニング練習**: 定石を学んで序盤を制す
  - AIチャットで定石を質問・解説してもらえる
- **🤖 AI解説**: Ollama（qwen2.5:14b）と対話しながら学習
  - 局面の評価と解説
  - 戦略的アドバイス
  - 日本語での自然な対話
  - 「現在の盤面をFENコピー」で局面をAIに共有可能

## 🛠️ 技術スタック

### フロントエンド
- **Tauri** - Rust製デスクトップアプリフレームワーク（軽量・高速）
- **React 18 + TypeScript** - 型安全なUI構築
- **react-chessboard** - 高品質なチェス盤表示
- **chess.js** - チェスロジック・FEN解析・PGN処理
- **Zustand** - シンプルな状態管理
- **TailwindCSS** - モダンなスタイリング
- **Framer Motion** - スムーズなアニメーション

### バックエンド（Rust）
- **Tauri Commands** - フロントエンドとの通信
- **SQLite** - 詰め問題・オープニングデータ・学習進捗の管理
- **Ollama API** - ローカルLLM連携（外部API不要）

### 開発環境
- **Vite** - 高速な開発サーバー
- **Cargo** - Rustのビルドシステム

## 💻 必要条件

- **Node.js** 18+
- **Rust** 1.70+
- **Ollama**（ローカルにインストール済み）
  - 推奨モデル: `qwen2.5:14b`（日本語対応・高品質）
  - その他利用可能: `gemma2:9b`, `translate-gemma` など

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
│   │   ├── GameInfo.tsx       # ゲーム情報
│   │   ├── Layout.tsx         # レイアウト
│   │   ├── ModeSelector.tsx   # モード選択
│   │   ├── BoardControls.tsx  # 棋譜履歴＋ナビゲーション
│   │   ├── OpeningMode.tsx    # オープニングUI
│   │   ├── PuzzleMode.tsx     # 詰め問題UI
│   │   └── PositionLoader.tsx # PGN/FEN読み込み
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
│       └── commands.rs        # Tauriコマンド定義
│
├── package.json
├── tailwind.config.js
└── README.md
```

## 🎨 デザインコンセプト

- **白ベースの明るいUI**: 長時間の学習でも目が疲れない
- **リッチな盤面**: react-chessboardによる美しい駒と盤
- **直感的な操作**: モード切り替えはワンクリック
- **レスポンシブ**: ウィンドウサイズに応じて自動調整
- **3カラムレイアウト**: 左（モード・読込）／中央（盤面＋履歴）／右（AIチャット）

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

## 📝 実装状況（2026年1月31日現在）

### ✅ 完了済み
- [x] プロジェクト基盤構築
- [x] チェス盤表示と操作
- [x] AIチャット機能
- [x] 棋譜復習機能（PGN読み込み）
  - [x] 履歴表示とナビゲーション
  - [x] 分岐機能（変化を試せる）
  - [x] FENコピー機能
- [x] レイアウト最適化（3カラムバランス）
- [x] オープニング・詰め問題のUI

### 🚧 進行中
- [ ] 詰め問題の正解判定ロジック
- [ ] 詰め問題の自動進行機能

### 📋 計画中
- [x] Stockfish連携による局面評価（コードのみ、UI未実装）
- [x] オープニングのステップナビゲーション（データ・UIあり、連携のみ）

## 🎯 開発方針

**主な用途**:
1. **棋譜復習**（メイン）
   - chess.com等の対局をコピーして貼り付け
   - AIに局面を聞いて復習
   - 分岐を作って変化を研究
2. **基礎力養成**（詰め問題）
   - 定番な詰め問題を解いて計算力向上

**注記**: 対局モード・オープニング機能は、
- 専門サイト（chess.com等）で十分な機能がある
- AIチャットで代用可能
- ため優先度は低い

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
