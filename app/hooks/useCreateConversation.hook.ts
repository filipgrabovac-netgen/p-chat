import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:8000/api/aws-llm";

interface CreateConversationRequest {
  title?: string;
}

interface CreateConversationResponse {
  id: number;
  user_id: number;
  created_at: string;
  title: string;
  message_count: number;
  success: boolean;
}

interface UseCreateConversationReturn {
  createConversation: (
    data?: CreateConversationRequest
  ) => Promise<CreateConversationResponse>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

const createConversation = async (
  data?: CreateConversationRequest
): Promise<CreateConversationResponse> => {
  const response = await fetch(`${API_BASE_URL}/conversations/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data || {}),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        `Failed to create conversation: ${response.status} ${response.statusText}`
    );
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
