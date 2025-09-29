"use client";

import { useConversations } from "../hooks/useConversations.hook";

interface ConversationsSidebarProps {
  currentConversationId?: number;
  onConversationSelect: (conversationId: number) => void;
}

export const ConversationsSidebar = ({
  currentConversationId,
  onConversationSelect,
}: ConversationsSidebarProps) => {
  const { conversations, total, isLoading, error, refetch } =
    useConversations();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Conversations
          </h2>
          {!isLoading && !error && (
            <span className="text-sm text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
              {total}
            </span>
          )}
        </div>
      </div>

      {/* New Conversation Button */}
      <div className="p-4 border-b border-slate-200">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Conversation
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-100 animate-pulse"
                >
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <div className="text-red-600 mb-2">
                <svg
                  className="w-8 h-8 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-sm text-red-600 mb-2">
                  Failed to load conversations
                </p>
                <button
                  onClick={() => refetch()}
                  className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center">
              <div className="text-slate-500">
                <svg
                  className="w-8 h-8 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Start a new conversation to get started
                </p>
              </div>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  currentConversationId === conversation.id
                    ? "bg-slate-200 border border-slate-300"
                    : "hover:bg-slate-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">
                      Conversation {conversation.id}
                    </h3>
                    <p className="text-sm text-slate-600 truncate mt-1">
                      {conversation.last_message?.content || "No messages yet"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {conversation.message_count} messages
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        {conversation.user_username}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                    {formatTimestamp(conversation.created_at)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-slate-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">User</p>
            <p className="text-xs text-slate-500">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};
