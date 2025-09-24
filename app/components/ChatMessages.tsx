import { ChatMessage } from "./ChatMessage";
import { LoadingIndicator } from "./LoadingIndicator";

import { Message } from "../types/chat";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  typingMessageId: string | null;
  typingText: string;
}

export const ChatMessages = ({
  messages,
  isLoading,
  typingMessageId,
  typingText,
}: ChatMessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto space-y-2">
        {messages.map((message) => {
          const isTyping =
            typingMessageId === message.id && message.role === "assistant";
          const showCursor =
            isTyping && typingText.length < message.content.length;

          return (
            <ChatMessage
              key={message.id}
              message={message}
              isTyping={isTyping}
              typingText={typingText}
              showCursor={showCursor}
            />
          );
        })}

        {isLoading && <LoadingIndicator />}

        <div id="messages-end" />
      </div>
    </div>
  );
};
