import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

import { Message } from "../types/chat";

interface ChatContainerProps {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  typingMessageId: string | null;
  typingText: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatContainer = ({
  messages,
  inputValue,
  isLoading,
  typingMessageId,
  typingText,
  onInputChange,
  onSendMessage,
  onKeyPress,
  inputRef,
  messagesEndRef,
}: ChatContainerProps) => {
  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      <ChatHeader />

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        typingMessageId={typingMessageId}
        typingText={typingText}
        messagesEndRef={messagesEndRef}
      />

      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSendMessage}
        onKeyPress={onKeyPress}
        disabled={isLoading}
        inputRef={inputRef}
      />
    </div>
  );
};
