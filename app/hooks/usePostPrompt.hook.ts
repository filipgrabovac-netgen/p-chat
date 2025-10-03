import { useMutation } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";

import { components } from "@/app/schema/schema";

type ChatResponse = components["schemas"]["ChatResponse"];

export const usePostPrompt = (conversationId?: number | null) => {
  return useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      const response = await apiClientFetch.POST("/api/aws-llm/chat/", {
        body: {
          message: message,
          model: "gemma2:2b",
          stream: false,
          conversation_id: conversationId ?? undefined,
        },
      });

      if (response.error) {
        throw new Error("Failed to get response from AI");
      }

      return response.data as ChatResponse;
    },
  });
};
