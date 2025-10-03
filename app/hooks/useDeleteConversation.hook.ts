import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { components } from "@/app/schema/schema";

interface UseDeleteConversationReturn {
  deleteConversation: (conversationId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export const useDeleteConversation = (): UseDeleteConversationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (conversationId: number): Promise<void> => {
      const response = await apiClientFetch.DELETE(
        "/api/aws-llm/conversations/{conversation_id}/",
        {
          params: {
            path: {
              conversation_id: conversationId,
            },
          },
        }
      );

      if (response.error) {
        throw new Error("Failed to delete conversation");
      }
    },
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
