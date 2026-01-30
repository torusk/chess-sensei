use tauri::State;
use crate::{database, ollama, AppState};

// パズル関連コマンド
#[tauri::command]
pub async fn get_puzzles(
    state: State<'_, AppState>,
    theme: Option<String>,
    difficulty: Option<i32>,
    limit: Option<i32>,
) -> Result<Vec<database::Puzzle>, String> {
    let db = state.db.lock().await;
    let limit = limit.unwrap_or(10);
    
    db.get_puzzles(theme.as_deref(), difficulty, limit)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_puzzle_by_id(
    state: State<'_, AppState>,
    id: i64,
) -> Result<Option<database::Puzzle>, String> {
    let db = state.db.lock().await;
    
    db.get_puzzle_by_id(id)
        .map_err(|e| e.to_string())
}

// オープニング関連コマンド
#[tauri::command]
pub async fn get_openings(
    state: State<'_, AppState>,
) -> Result<Vec<database::Opening>, String> {
    let db = state.db.lock().await;
    
    db.get_openings()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_opening_by_id(
    state: State<'_, AppState>,
    id: i64,
) -> Result<Option<database::Opening>, String> {
    let db = state.db.lock().await;
    
    db.get_opening_by_id(id)
        .map_err(|e| e.to_string())
}

// ユーザープログレス関連
#[tauri::command]
pub async fn save_puzzle_attempt(
    state: State<'_, AppState>,
    attempt: database::PuzzleAttempt,
) -> Result<(), String> {
    let db = state.db.lock().await;
    
    db.save_puzzle_attempt(&attempt)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_user_stats(
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let db = state.db.lock().await;
    
    db.get_user_stats()
        .map_err(|e| e.to_string())
}

// AI対話コマンド
#[tauri::command]
pub async fn chat_with_ai(
    messages: Vec<ollama::Message>,
    model: Option<String>,
) -> Result<String, String> {
    let client = ollama::OllamaClient::new();
    let model = model.unwrap_or_else(|| "qwen2.5:14b".to_string());
    
    client.chat(&model, messages)
        .await
        .map_err(|e| e.to_string())
}

// 局面解析コマンド
#[tauri::command]
pub async fn analyze_position(
    fen: String,
    evaluation: f64,
    best_move: String,
) -> Result<String, String> {
    let client = ollama::OllamaClient::new();
    
    client.analyze_position(&fen, evaluation, &best_move)
        .await
        .map_err(|e| e.to_string())
}
