import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import {
  sendMessage,
  getConversations,
  getMessages,
  deleteConversation,
} from "./services/api";
import type { Message, Conversation } from "./types";

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const convs = await getConversations();
      setConversations(convs);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const msgs = await getMessages(conversationId);
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    loadMessages(id);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
      await loadConversations();
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleSend = async (message: string) => {
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const response = await sendMessage(message, activeConversationId);

      if (!activeConversationId) {
        setActiveConversationId(response.conversation_id);
      }

      const assistantMsg: Message = {
        id: `resp-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      await loadConversations();
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg"
      >
        ☰
      </button>

      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform fixed md:static z-40 h-full`}
      >
        <Sidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          onDelete={handleDeleteConversation}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow messages={messages} loading={loading} />
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}