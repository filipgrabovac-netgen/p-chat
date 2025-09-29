import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";

interface CreateConversationRequest {
  user_id?: number;
}

interface CreateConversationResponse {
  id: number;
  user_id: number;
  created_at: string;
  messages: string;
}

interface UseCreateConversationReturn {
  createConversation: (data?: CreateConversationRequest) => Promise<CreateConversationResponse>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

const createConversation = async (data?: CreateConversationRequest): Promise<CreateConversationResponse> => {
  // For now, we'll create a conversation by making a POST request to a hypothetical endpoint
  // This will need to be implemented in the backend
  const response = await fetch("http://localhost:8000/api/aws-llm/conversations/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(data || {}),
  });

  if (!response.ok) {
    throw new Error(`Failed to create conversation: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const useCreateConversation = (): UseCreateConversationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      // Invalidate and refetch conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Failed to create conversation:", error);
    },
  });

  return {
    createConversation: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    isSuccess: mutation.isSuccess,
  };
};