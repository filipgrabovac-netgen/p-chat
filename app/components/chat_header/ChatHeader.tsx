"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ChatHeaderProps {
  isConnected?: boolean;
}

export const ChatHeader = ({}: ChatHeaderProps) => {
  const pathname = usePathname();

  return (
    <div className="bg-slate-800 px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          AI Assistant
        </h1>

        <nav className="flex items-center space-x-4">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg transition-colors ${
              pathname === "/"
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            Chat
          </Link>
          <Link
            href="/pdf-quiz"
            className={`px-4 py-2 rounded-lg transition-colors ${
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
