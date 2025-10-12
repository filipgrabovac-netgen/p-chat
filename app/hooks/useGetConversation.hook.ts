import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { components } from "@/app/schema/schema";
import { Message } from "../types/chat";

type BackendMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type BackendResponse = {
  conversation: {
    id: number;
    user_id: number;
    created_at: string;
    messages: BackendMessage[];
  };
  timestamp: string;
  success: boolean;
};

export const useGetConversation = () => {
  return useQuery({
    queryKey: ["conversation"],
    queryFn: async (): Promise<Message[]> => {
      const response = await apiClientFetch.GET("/api/aws-llm/chat/history/");
      const data = response.data as unknown as BackendResponse;
      // The response has a conversation field with messages array
      const messages = data?.conversation?.messages || [];
      // Convert backend message format to frontend Message format
      return messages.map((msg: BackendMessage) => ({
        id: msg.id.toString(),
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
      }));
    },
  });
};
