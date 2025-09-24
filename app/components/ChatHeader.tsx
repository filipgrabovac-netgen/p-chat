interface ChatHeaderProps {
  isConnected?: boolean;
}

export const ChatHeader = ({ isConnected = true }: ChatHeaderProps) => {
  return (
    <div className="bg-[#2176FF] px-6 py-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          AI Assistant
        </h1>
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}
          ></div>
          <span className="text-sm font-medium text-white/90">
            {isConnected ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
};
