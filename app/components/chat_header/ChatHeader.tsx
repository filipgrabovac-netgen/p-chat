"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ChatHeaderProps {
  isConnected?: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const ChatHeader = ({
  onToggleSidebar,
  isSidebarOpen,
}: ChatHeaderProps) => {
  const pathname = usePathname();

  return (
    <div className="bg-slate-800 px-4 lg:px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              )}
            </svg>
          </button>

          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            AI Assistant
          </h1>
        </div>

        <nav className="flex items-center space-x-2 lg:space-x-4">
          <Link
            href="/"
            className={`px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm lg:text-base ${
              pathname === "/"
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            Chat
          </Link>
          <Link
            href="/pdf-quiz"
            className={`px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm lg:text-base ${
              pathname === "/pdf-quiz"
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            PDF Quiz
          </Link>
        </nav>
      </div>
    </div>
  );
};
