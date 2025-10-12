"use client";

import { useRouter } from "next/navigation";
import { useQuiz } from "../../../hooks/useQuiz.hook";
import { QuizDisplay } from "../../../components/quiz_display/QuizDisplay";
import { motion } from "framer-motion";
import { use } from "react";

interface QuizPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const quizId = parseInt(id);
  const { quiz, isLoading: isLoadingQuiz } = useQuiz(quizId);

  if (isLoadingQuiz) {
    return (
      <div className="text-center py-12">
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
        <p className="text-slate-600">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-slate-500 text-lg">Quiz not found</p>
        <p className="text-slate-400 text-sm mt-2">
          The quiz you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
        <button
          onClick={() => router.push("/pdf-quiz/quizzes")}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={() => router.push("/pdf-quiz/quizzes")}
        className="mb-6 flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back to Quizzes</span>
      </button>
      <QuizDisplay quiz={quiz} />
    </motion.div>
  );
}
