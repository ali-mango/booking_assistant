export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export interface ChatResponse {
  reply: string;
  conversation_id: string;
  tokens_used: number;
}