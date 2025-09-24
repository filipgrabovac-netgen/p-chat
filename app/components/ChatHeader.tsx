interface ChatHeaderProps {
  isConnected?: boolean;
}

export const ChatHeader = ({}: ChatHeaderProps) => {
  return (
    <div className="bg-slate-800 px-6 py-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          AI Assistant
        </h1>
      </div>
    </div>
  );
};
