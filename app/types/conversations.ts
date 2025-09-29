export interface LastMessage {
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

export interface Conversation {
  id: number;
  user_username: string;
  created_at: string;
  message_count: number;
  last_message: LastMessage | null;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

export interface UseConversationsReturn {
  conversations: Conversation[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
