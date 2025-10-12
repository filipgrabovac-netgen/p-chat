"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PDFQuizPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the upload page as the default
    router.replace("/pdf-quiz/upload");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
      <div className="text-center">
        <svg
          className="w-12 h-12 animate-spin mx-auto mb-4 text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-slate-600">Redirecting...</p>
      </div>
    </div>
  );
}
