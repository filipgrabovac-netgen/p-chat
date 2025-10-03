import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { components } from "@/app/schema/schema";

type ConversationCreateRequest =
  components["schemas"]["ConversationCreateRequest"];
type ConversationCreateResponse =
  components["schemas"]["ConversationCreateResponse"];

interface UseCreateConversationReturn {
  createConversation: (
    data?: Partial<ConversationCreateRequest>
  ) => Promise<ConversationCreateResponse>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export const useCreateConversation = (): UseCreateConversationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      data?: Partial<ConversationCreateRequest>
    ): Promise<ConversationCreateResponse> => {
      const response = await apiClientFetch.POST(
        "/api/aws-llm/conversations/create/",
        {
          body: {
            title: data?.title || "New Conversation",
          },
        }
      );

      if (response.error) {
        throw new Error("Failed to create conversation");
      }

      return response.data as ConversationCreateResponse;
    },
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
