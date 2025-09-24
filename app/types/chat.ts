export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

export interface ChatState {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  typingMessageId: string | null;
  typingText: string;
}
