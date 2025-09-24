import { Message } from "../types/chat";

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
  typingText?: string;
  showCursor?: boolean;
}

export const ChatMessage = ({
  message,
  isTyping = false,
  typingText = "",
  showCursor = false,
}: ChatMessageProps) => {
  const displayText = isTyping ? typingText : message.content;

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      } animate-in fade-in duration-300 mb-4`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
          message.role === "user"
            ? "bg-[#2176FF] text-white"
            : "bg-white text-gray-900 border border-gray-100 shadow-md"
        }`}
      >
        <div className="whitespace-pre-wrap text-base leading-relaxed font-medium">
          {displayText}
          {showCursor && (
            <span className="inline-block w-0.5 h-5 bg-white ml-1 animate-pulse" />
          )}
        </div>
        <div
          className={`text-xs mt-3 font-medium ${
            message.role === "user" ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
