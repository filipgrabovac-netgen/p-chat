import { useMutation } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { components } from "../schema/schema";

export const usePostPrompt = () => {
  return useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiClientFetch.POST("/api/aws-llm/chat/", {
        body: { message: prompt, model: "gemma2:2b", stream: false },
      });

      if (response.error) {
        throw new Error("Failed to get response from AI");
      }

      return response.data;
    },
  });
};
