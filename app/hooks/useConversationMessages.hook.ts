import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";

type ConversationMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type ConversationData = {
  id: number;
  user_id: number;
  created_at: string;
  messages: ConversationMessage[];
};

type ConversationResponse = {
  conversation: ConversationData;
  timestamp: string;
  success: boolean;
};

interface UseConversationMessagesReturn {
  messages: ConversationMessage[];
  conversation: ConversationData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useConversationMessages = (
  conversationId?: number | null
): UseConversationMessagesReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      if (!conversationId) {
        throw new Error("Conversation ID is required");
      }

      const response = await apiClientFetch.GET(
        "/api/aws-llm/chat/history/{conversation_id}/",
        {
          params: {
            path: {
              conversation_id: conversationId,
            },
          },
        }
      );

      if (response.error) {
        throw new Error("Failed to fetch conversation messages");
      }

      return response.data as unknown as ConversationResponse;
    },
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
