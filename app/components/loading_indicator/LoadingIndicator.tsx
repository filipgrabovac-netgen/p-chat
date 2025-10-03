interface LoadingIndicatorProps {
  message?: string;
  variant?: "thinking" | "responding";
}

export const LoadingIndicator = ({
  message = "AI is thinking...",
  variant = "thinking",
}: LoadingIndicatorProps) => {
  const isResponding = variant === "responding";

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div
              className={`w-3 h-3 rounded-full animate-bounce ${
                isResponding ? "bg-slate-600" : "bg-slate-400"
              }`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full animate-bounce ${
                isResponding ? "bg-slate-600" : "bg-slate-400"
              }`}
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className={`w-3 h-3 rounded-full animate-bounce ${
                isResponding ? "bg-slate-600" : "bg-slate-400"
              }`}
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <span
            className={`text-sm font-medium ${
              isResponding ? "text-slate-600" : "text-slate-500"
            }`}
          >
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};
