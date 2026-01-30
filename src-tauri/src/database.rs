use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct Puzzle {
    pub id: i64,
    pub fen: String,
    pub solution: String, // JSON配列
    pub theme: String,
    pub difficulty: i32,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Opening {
    pub id: i64,
    pub eco: String,
    pub name: String,
    pub moves: String, // JSON配列
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PuzzleAttempt {
    pub puzzle_id: i64,
    pub solved: bool,
    pub attempts: i32,
    pub time_spent: i32,
    pub timestamp: String,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;
        Ok(Database { conn })
    }

    pub fn init(&self) -> Result<()> {
        // パズルテーブル
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS puzzles (
                id INTEGER PRIMARY KEY,
                fen TEXT NOT NULL,
                solution TEXT NOT NULL,
                theme TEXT NOT NULL,
                difficulty INTEGER NOT NULL,
                description TEXT
            )",
            [],
        )?;

        // オープニングテーブル
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS openings (
                id INTEGER PRIMARY KEY,
                eco TEXT NOT NULL,
                name TEXT NOT NULL,
                moves TEXT NOT NULL,
                description TEXT NOT NULL
            )",
            [],
        )?;

        // ユーザープログレステーブル
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS puzzle_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                puzzle_id INTEGER NOT NULL,
                solved BOOLEAN NOT NULL,
                attempts INTEGER NOT NULL,
                time_spent INTEGER NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
            )",
            [],
        )?;

        // サンプルデータ投入（初回のみ）
        self.insert_sample_data()?;

        Ok(())
    }

    fn insert_sample_data(&self) -> Result<()> {
        // パズルが空の場合のみサンプルを投入
        let count: i64 = self
            .conn
            .query_row("SELECT COUNT(*) FROM puzzles", [], |row| row.get(0))?;

        if count == 0 {
            let sample_puzzles = vec![
                (
                    "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
                    "[\"Qxf7#\"]",
                    "mate_in_1",
                    1,
                    "scholars mate pattern",
                ),
                (
                    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
                    "[\"Nf3\"]",
                    "opening",
                    1,
                    "King's Knight Opening",
                ),
            ];

            for (fen, solution, theme, difficulty, description) in sample_puzzles {
                self.conn.execute(
                    "INSERT INTO puzzles (fen, solution, theme, difficulty, description) VALUES (?1, ?2, ?3, ?4, ?5)",
                    params![fen, solution, theme, difficulty, description],
                )?;
            }

            // サンプルオープニング
            let sample_openings = vec![
                (
                    "C20",
                    "King's Pawn Game",
                    "[\"e4\", \"e5\", \"Nf3\"]",
                    "古典的なオープニング。中央を取り、駒を速く展開する。",
                ),
                (
                    "C60",
                    "Ruy Lopez",
                    "[\"e4\", \"e5\", \"Nf3\", \"Nc6\", \"Bb5\"]",
                    "最も有名なオープニングの一つ。b5のビショップで圧力をかける。",
                ),
            ];

            for (eco, name, moves, description) in sample_openings {
                self.conn.execute(
                    "INSERT INTO openings (eco, name, moves, description) VALUES (?1, ?2, ?3, ?4)",
                    params![eco, name, moves, description],
                )?;
            }
        }

        Ok(())
    }

    pub fn get_puzzles(
        &self,
        theme: Option<&str>,
        difficulty: Option<i32>,
        limit: i32,
    ) -> Result<Vec<Puzzle>> {
        let mut query =
            "SELECT id, fen, solution, theme, difficulty, description FROM puzzles WHERE 1=1"
                .to_string();
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![];

        if let Some(t) = theme {
            query.push_str(" AND theme = ?");
            params_vec.push(Box::new(t.to_string()));
        }

        if let Some(d) = difficulty {
            query.push_str(" AND difficulty = ?");
            params_vec.push(Box::new(d));
        }

        query.push_str(" ORDER BY RANDOM() LIMIT ?");
        params_vec.push(Box::new(limit));

        let param_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

        let mut stmt = self.conn.prepare(&query)?;
        let puzzles = stmt.query_map(rusqlite::params_from_iter(param_refs), |row| {
            Ok(Puzzle {
                id: row.get(0)?,
                fen: row.get(1)?,
                solution: row.get(2)?,
                theme: row.get(3)?,
                difficulty: row.get(4)?,
                description: row.get(5)?,
            })
        })?;

        puzzles.collect()
    }

    pub fn get_puzzle_by_id(&self, id: i64) -> Result<Option<Puzzle>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, fen, solution, theme, difficulty, description FROM puzzles WHERE id = ?",
        )?;

        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Puzzle {
                id: row.get(0)?,
                fen: row.get(1)?,
                solution: row.get(2)?,
                theme: row.get(3)?,
                difficulty: row.get(4)?,
                description: row.get(5)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_openings(&self) -> Result<Vec<Opening>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, eco, name, moves, description FROM openings ORDER BY eco")?;

        let openings = stmt.query_map([], |row| {
            Ok(Opening {
                id: row.get(0)?,
                eco: row.get(1)?,
                name: row.get(2)?,
                moves: row.get(3)?,
                description: row.get(4)?,
            })
        })?;

        openings.collect()
    }

    pub fn get_opening_by_id(&self, id: i64) -> Result<Option<Opening>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, eco, name, moves, description FROM openings WHERE id = ?")?;

        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Opening {
                id: row.get(0)?,
                eco: row.get(1)?,
                name: row.get(2)?,
                moves: row.get(3)?,
                description: row.get(4)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn save_puzzle_attempt(&self, attempt: &PuzzleAttempt) -> Result<()> {
        self.conn.execute(
            "INSERT INTO puzzle_attempts (puzzle_id, solved, attempts, time_spent, timestamp) 
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                attempt.puzzle_id,
                attempt.solved,
                attempt.attempts,
                attempt.time_spent,
                attempt.timestamp,
            ],
        )?;
        Ok(())
    }

    pub fn get_user_stats(&self) -> Result<serde_json::Value> {
        let total_attempts: i64 =
            self.conn
                .query_row("SELECT COUNT(*) FROM puzzle_attempts", [], |row| row.get(0))?;

        let solved_count: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM puzzle_attempts WHERE solved = 1",
            [],
            |row| row.get(0),
        )?;

        let avg_attempts: f64 = self
            .conn
            .query_row("SELECT AVG(attempts) FROM puzzle_attempts", [], |row| {
                row.get(0)
            })
            .unwrap_or(0.0);

        Ok(serde_json::json!({
            "total_attempts": total_attempts,
            "solved_count": solved_count,
            "success_rate": if total_attempts > 0 { solved_count as f64 / total_attempts as f64 } else { 0.0 },
            "average_attempts": avg_attempts,
        }))
    }
}
