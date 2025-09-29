import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:8000/api/aws-llm";

interface ConversationMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ConversationData {
  id: number;
  user_id: number;
  created_at: string;
  messages: ConversationMessage[];
}

interface ConversationResponse {
  conversation: ConversationData;
  timestamp: string;
  success: boolean;
}

interface UseConversationMessagesReturn {
  messages: ConversationMessage[];
  conversation: ConversationData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const fetchConversationMessages = async (
  conversationId: number
): Promise<ConversationResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/chat/history/${conversationId}/`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch conversation messages: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

export const useConversationMessages = (
  conversationId?: number
): UseConversationMessagesReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => fetchConversationMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    messages: data?.conversation?.messages || [],
    conversation: data?.conversation || null,
    isLoading,
    error: error?.message || null,
    refetch: () => refetch(),
  };
};
