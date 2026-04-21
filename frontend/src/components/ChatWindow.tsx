import { useRef, useEffect } from "react";
import type { Message } from "../types";
import MessageBubble from "./MessageBubble";

interface Props {
  messages: Message[];
  loading: boolean;
}

export default function ChatWindow({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-400 mt-32">
            <h2 className="text-2xl font-semibold mb-2">AI Assistant</h2>
            <p className="text-sm">
              Start a conversation in any language.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}