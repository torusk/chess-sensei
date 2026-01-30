// Stockfish WASM連携用モジュール
// フロントエンドでStockfish WASMを実行し、結果をバックエンドで処理

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub evaluation: f64, // +は白優勢、-は黒優勢（ポーン単位）
    pub best_move: String,
    pub depth: i32,
    pub pv: Vec<String>, // Principal Variation（読み筋）
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EngineInfo {
    pub name: String,
    pub version: String,
}

pub struct Stockfish;

impl Stockfish {
    pub fn new() -> Self {
        Stockfish
    }

    // フロントエンドからの解析結果を正規化
    pub fn normalize_evaluation(&self, eval_cp: i32, mate_in: Option<i32>) -> f64 {
        if let Some(mate) = mate_in {
            // メイトの場合は大きな値を返す
            if mate > 0 {
                1000.0 - mate as f64
            } else {
                -1000.0 - mate as f64
            }
        } else {
            // centipawnをpawnに変換
            eval_cp as f64 / 100.0
        }
    }
}
