import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { sendMessage } from "../services/api";
import type { Message } from "../types";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + "px";
    }
  }, [input]);

  const doSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage(trimmed, conversationId);
      if (!conversationId) setConversationId(response.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: `resp-${Date.now()}`,
          role: "assistant",
          content: response.reply,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
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
    <>
      {/* Chat bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen ? "bg-gray-700" : "bg-teal-500 shadow-teal-300/40 hover:bg-teal-600"
        }`}
      >
        {isOpen ? <X size={22} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
      </button>

      {/* Tooltip */}
      {!isOpen && messages.length === 0 && (
        <div className="fixed bottom-[84px] right-6 z-50 bg-white rounded-xl shadow-lg px-4 py-2.5 text-sm text-gray-700 animate-bounce max-w-[240px] border border-gray-100">
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100" />
          Need to book an appointment? 😊
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[530px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-[slideUp_0.25s_ease-out]">
          {/* Header */}
          <div className="bg-teal-500 px-5 py-4 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">SmileCare Assistant</h3>
                <p className="text-[11px] text-white/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                  Online — replies instantly
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {messages.length === 0 && !loading && (
              <div className="text-center mt-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={22} className="text-teal-500" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">Welcome to SmileCare!</p>
                <p className="text-xs text-gray-400 mb-5">How can I help you today?</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: "📋", text: "View services & prices" },
                    { icon: "📅", text: "Book an appointment" },
                    { icon: "❌", text: "Cancel my booking" },
                  ].map((item) => (
                    <button
                      key={item.text}
                      onClick={() => doSend(item.text)}
                      className="text-left px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all flex items-center gap-2"
                    >
                      <span>{item.icon}</span>
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-3`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <MessageCircle size={10} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal-500 text-white rounded-br-md"
                      : "bg-white border border-gray-100 text-gray-700 rounded-tl-md shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
                  <MessageCircle size={10} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 bg-white shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    doSend(input);
                  }
                }}
                placeholder="Type your message..."
                disabled={loading}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 disabled:opacity-50"
              />
              <button
                onClick={() => doSend(input)}
                disabled={loading || !input.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-500 text-white disabled:opacity-40 transition-all hover:bg-teal-600 active:scale-95 shrink-0"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-center text-[9px] text-gray-400 mt-1.5">Powered by SmileCare AI</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}