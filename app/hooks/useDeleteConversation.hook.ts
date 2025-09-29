import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:8000/api/aws-llm";

interface UseDeleteConversationReturn {
  deleteConversation: (conversationId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

const deleteConversation = async (conversationId: number): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        `Failed to delete conversation: ${response.status} ${response.statusText}`
    );
  }
};

export const useDeleteConversation = (): UseDeleteConversationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      // Invalidate and refetch conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Failed to delete conversation:", error);
    },
  });

  return {
    deleteConversation: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    isSuccess: mutation.isSuccess,
  };
};
