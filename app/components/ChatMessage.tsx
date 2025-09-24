import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
          message.role === "user"
            ? "bg-slate-800 text-white"
            : "bg-white text-slate-900 border border-slate-100 shadow-md"
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
            message.role === "user" ? "text-slate-300" : "text-slate-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
