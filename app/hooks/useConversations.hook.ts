import { useQuery } from "@tanstack/react-query";
import {
  ConversationListResponse,
  UseConversationsReturn,
} from "../types/conversations";

const API_BASE_URL = "http://localhost:8000/api/aws-llm";

const fetchConversations = async (): Promise<ConversationListResponse> => {
  const response = await fetch(`${API_BASE_URL}/conversations/`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch conversations: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
};

export const useConversations = (): UseConversationsReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
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
