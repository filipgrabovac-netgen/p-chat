"use client";

import { useRouter } from "next/navigation";
import { useQuiz } from "../../../hooks/useQuiz.hook";
import { QuizDisplay } from "../../../components/quiz_display/QuizDisplay";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface QuizClientProps {
  quizId: number;
}

const QuizClient = ({ quizId }: QuizClientProps) => {
  const router = useRouter();
  const { quiz, isLoading, error, refetch } = useQuiz(quizId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin mx-auto mb-4 text-slate-600">
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Error Loading Quiz
              </h2>
              <p className="text-slate-600 mb-4">
                {error || "Failed to load the quiz. Please try again."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push("/pdf-quiz/quizzes")}
                  className="w-full sm:w-auto"
                >
                  Back to Quizzes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Quiz Not Found
              </h2>
              <p className="text-slate-600 mb-4">
                The quiz you're looking for doesn't exist or has been deleted.
              </p>
              <Button
                onClick={() => router.push("/pdf-quiz/quizzes")}
                className="w-full sm:w-auto"
              >
                Back to Quizzes
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            onClick={() => router.push("/pdf-quiz/quizzes")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>
        </motion.div>

        <QuizDisplay quiz={quiz} />
      </div>
    </div>
  );
};

export { QuizClient };
