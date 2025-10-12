"use client";

import { QuizDisplay } from "@/app/components/quiz_display/QuizDisplay";
import { useQuiz } from "@/app/hooks/useQuiz.hook";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface QuizClientProps {
  quizId: number;
}

export function QuizClient({ quizId }: QuizClientProps) {
  const { quiz, isLoading, error } = useQuiz(quizId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Quiz Not Found
          </h2>
          <p className="text-slate-600 mb-6 text-sm sm:text-base">
            The quiz you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/pdf-quiz/quizzes">
            <Button>Back to Quizzes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <QuizDisplay quiz={quiz} />;
}
