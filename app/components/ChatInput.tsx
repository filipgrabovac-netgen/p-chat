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
    <div className="bg-white border-t border-gray-100 px-6 py-6 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="flex items-end space-x-4 bg-gray-50 rounded-3xl p-5 border-2 border-gray-200 hover:border-[#2176FF] focus-within:border-[#2176FF] focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-300 shadow-sm">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder={placeholder}
                className="w-full bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500 text-base leading-relaxed font-medium"
                rows={1}
                style={{
                  minHeight: "24px",
                  maxHeight: "120px",
                  lineHeight: "1.5",
                }}
                disabled={disabled}
              />
            </div>
            <button
              onClick={onSend}
              disabled={!value.trim() || disabled}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2176FF] text-white hover:bg-[#1a5fcc] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none"
              title="Send message (Enter)"
            >
              {disabled ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center font-medium">
                <kbd className="px-2 py-1 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                  Enter
                </kbd>
                <span className="ml-2">to send</span>
              </span>
              <span className="flex items-center font-medium">
                <kbd className="px-2 py-1 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                  Shift
                </kbd>
                <span className="mx-2">+</span>
                <kbd className="px-2 py-1 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                  Enter
                </kbd>
                <span className="ml-2">for new line</span>
              </span>
            </div>
            <div className="text-gray-400 font-medium">
              {value.length > 0 && `${value.length} characters`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
