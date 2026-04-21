import type { Conversation } from "../types";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: Props) {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-4">
        <button
          onClick={onNew}
          className="w-full rounded-lg border border-gray-600 px-4 py-2.5 text-sm hover:bg-gray-800 transition-colors"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`group flex items-center justify-between rounded-lg px-3 py-2.5 mb-1 cursor-pointer text-sm transition-colors ${
              activeId === conv.id
                ? "bg-gray-700"
                : "hover:bg-gray-800"
            }`}
          >
            <span className="truncate flex-1">{conv.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 ml-2 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        AI Assistant v0.1
      </div>
    </div>
  );
}