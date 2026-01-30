use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Serialize)]
pub struct ChatRequest {
    pub model: String,
    pub messages: Vec<Message>,
    pub stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct ChatResponse {
    pub message: Message,
    pub done: bool,
}

pub struct OllamaClient {
    client: Client,
    base_url: String,
}

impl OllamaClient {
    pub fn new() -> Self {
        OllamaClient {
            client: Client::new(),
            base_url: "http://localhost:11434".to_string(),
        }
    }

    pub async fn chat(
        &self,
        model: &str,
        messages: Vec<Message>,
    ) -> Result<String, reqwest::Error> {
        let request = ChatRequest {
            model: model.to_string(),
            messages,
            stream: false,
        };

        let response = self
            .client
            .post(format!("{}/api/chat", self.base_url))
            .json(&request)
            .send()
            .await?;

        let chat_response: ChatResponse = response.json().await?;
        Ok(chat_response.message.content)
    }

    pub async fn analyze_position(
        &self,
        fen: &str,
        evaluation: f64,
        best_move: &str,
    ) -> Result<String, reqwest::Error> {
        let system_prompt = "あなたはチェスの先生です。局面の評価と最善手を日本語で解説してください。初心者にもわかりやすく、戦略的なポイントを含めてください。";

        let user_prompt = format!(
            "局面（FEN）: {}\n評価値: {:.2}\n最善手: {}\n\nこの局面について解説してください。",
            fen, evaluation, best_move
        );

        let messages = vec![
            Message {
                role: "system".to_string(),
                content: system_prompt.to_string(),
            },
            Message {
                role: "user".to_string(),
                content: user_prompt,
            },
        ];

        self.chat("qwen2.5:14b", messages).await
    }
}
