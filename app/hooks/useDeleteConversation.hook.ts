import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseDeleteConversationReturn {
  deleteConversation: (conversationId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

const deleteConversation = async (conversationId: number): Promise<void> => {
  // For now, we'll delete a conversation by making a DELETE request to a hypothetical endpoint
  // This will need to be implemented in the backend
  const response = await fetch(`http://localhost:8000/api/aws-llm/conversations/${conversationId}/`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.status} ${response.statusText}`);
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