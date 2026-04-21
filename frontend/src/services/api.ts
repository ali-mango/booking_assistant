import axios from "axios";
import type { ChatResponse, Conversation, Message } from "../types";

const api = axios.create({
  baseURL: "/api",
});

export async function sendMessage(
  message: string,
  conversationId: string | null
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", {
    message,
    conversation_id: conversationId,
  });
  return data;
}

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get<{ conversations: Conversation[] }>(
    "/conversations"
  );
  return data.conversations;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data } = await api.get<Message[]>(
    `/conversations/${conversationId}/messages`
  );
  return data;
}

export async function deleteConversation(
  conversationId: string
): Promise<void> {
  await api.delete(`/conversations/${conversationId}`);
}