import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { components } from "@/app/schema/schema";

type ConversationsList = components["schemas"]["ConversationsList"];

interface UseConversationsReturn {
  conversations: components["schemas"]["ConversationSummary"][];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useConversations = (): UseConversationsReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: async (): Promise<ConversationsList> => {
      const response = await apiClientFetch.GET("/api/aws-llm/conversations/");

      if (response.error) {
        throw new Error("Failed to fetch conversations");
      }

      return response.data as ConversationsList;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    conversations: data?.conversations || [],
    total: data?.total || 0,
    isLoading,
    error: error?.message || null,
    refetch: () => refetch(),
  };
};
