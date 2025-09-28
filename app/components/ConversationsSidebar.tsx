"use client";

interface ConversationsSidebarProps {
  currentConversationId?: number;
  onConversationSelect: (conversationId: number) => void;
}

export const ConversationsSidebar = ({
  currentConversationId,
  onConversationSelect,
}: ConversationsSidebarProps) => {
  // Mock data for now - in a real app, this would come from an API
  const conversations = [
    {
      id: 1,
      title: "General Chat",
      lastMessage: "What is my name?",
      timestamp: "2 min ago",
    },
    {
      id: 2,
      title: "Project Discussion",
      lastMessage: "Let's discuss the new features",
      timestamp: "1 hour ago",
    },
    {
      id: 3,
      title: "Code Review",
      lastMessage: "The implementation looks good",
      timestamp: "3 hours ago",
    },
  ];

  return (
    <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Conversations</h2>
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
          {conversations.map((conversation) => (
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
                    {conversation.title}
                  </h3>
                  <p className="text-sm text-slate-600 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                </div>
                <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                  {conversation.timestamp}
                </span>
              </div>
            </button>
          ))}
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
