import { motion } from "framer-motion";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
  placeholder = "Ask me anything...",
  inputRef,
}: ChatInputProps) => {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white border-t border-gray-100 px-6 py-6 shadow-lg"
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.01, y: -1 }}
            whileFocus={{ scale: 1.01, y: -1 }}
            className="flex items-center align-middle space-x-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl px-6 py-4 border border-slate-200/50 hover:border-slate-600/30 focus-within:border-slate-600 focus-within:ring-4 focus-within:ring-slate-200/50 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <div className="flex-1 flex items-center">
              <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder={placeholder}
                className="w-full bg-transparent border-none outline-none resize-none text-slate-900 placeholder-slate-500/70 text-base leading-relaxed font-medium py-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
                rows={1}
                style={{
                  minHeight: "28px",
                  maxHeight: "120px",
                  lineHeight: "1.5",
                }}
                disabled={disabled}
              />
            </div>
            <motion.button
              whileHover={{
                scale: 1.05,
                rotate: 3,
                boxShadow: "0 10px 25px rgba(15, 23, 42, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onSend}
              disabled={!value.trim() || disabled}
              className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white hover:from-slate-700 hover:via-slate-600 hover:to-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl disabled:shadow-none overflow-hidden"
              title="Send message (Enter)"
            >
              {/* Shimmer effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>

              {disabled ? (
                <div className="relative z-10 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <motion.svg
                  className="relative z-10 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </motion.svg>
              )}
            </motion.button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex items-center justify-between text-xs text-slate-500"
          >
            <div className="flex items-center space-x-6">
              <span className="flex items-center font-medium">
                <kbd className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  Enter
                </kbd>
                <span className="ml-3 text-slate-600">to send</span>
              </span>
              <span className="flex items-center font-medium">
                <kbd className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  Shift
                </kbd>
                <span className="mx-2 text-slate-400">+</span>
                <kbd className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  Enter
                </kbd>
                <span className="ml-3 text-slate-600">for new line</span>
              </span>
            </div>
            <motion.div
              className="text-slate-400 font-medium"
              animate={{ opacity: value.length > 0 ? 1 : 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {value.length > 0 && `${value.length} characters`}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
