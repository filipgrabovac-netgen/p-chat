import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { Message } from "../types/chat";

export const useGetConversation = () => {
  return useQuery({
    queryKey: ["conversation"],
    queryFn: async (): Promise<Message[]> => {
      const response = await apiClientFetch.GET("/api/aws-llm/chat/history/");
      return response.data?.conversation?.messages || [];
    },
  });
};
