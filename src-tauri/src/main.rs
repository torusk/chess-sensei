#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod database;
mod ollama;
mod stockfish;

use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

// アプリケーション状態
pub struct AppState {
    db: Arc<Mutex<database::Database>>,
    stockfish: Arc<Mutex<Option<stockfish::Stockfish>>>,
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // データベース初期化
            let app_dir = app.path_resolver().app_data_dir().unwrap();
            std::fs::create_dir_all(&app_dir)?;
            let db_path = app_dir.join("chess_sensei.db");
            
            let db = database::Database::new(db_path.to_str().unwrap())?;
            db.init()?;
            
            // Stockfish初期化（WASM版はフロントエンドで動作）
            
            app.manage(AppState {
                db: Arc::new(Mutex::new(db)),
                stockfish: Arc::new(Mutex::new(None)),
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_puzzles,
            commands::get_puzzle_by_id,
            commands::get_openings,
            commands::get_opening_by_id,
            commands::save_puzzle_attempt,
            commands::get_user_stats,
            commands::chat_with_ai,
            commands::analyze_position,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
