import { useMutation } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";

export const usePostPrompt = () => {
  return useMutation({
    mutationFn: async (message: string) => {
      const response = await apiClientFetch.POST("/api/aws-llm/chat/", {
        body: { message: message, model: "gemma2:2b", stream: false },
      });

      return response.data;
    },
  });
};
