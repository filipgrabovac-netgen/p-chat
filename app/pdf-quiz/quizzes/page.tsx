"use client";

import { useRouter } from "next/navigation";
import { useQuizList } from "../../hooks/useQuizList.hook";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

export default function QuizzesPage() {
  const router = useRouter();
  const { quizzes, isLoading: isLoadingQuizzes } = useQuizList();

  const handleSelectQuiz = (quizId: number) => {
    router.push(`/pdf-quiz/quiz/${quizId}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default";
      case "generating":
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">My Quizzes</h2>
        <p className="text-slate-600">
          Select a quiz to take or review results
        </p>
      </div>

      {isLoadingQuizzes ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <HelpCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 text-lg">No quizzes yet</p>
            <p className="text-slate-400 text-sm mt-2">
              Generate a quiz from your PDFs to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleSelectQuiz(quiz.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">
                      {quiz.title}
                    </h3>
                    {quiz.pdf_title && (
                      <p className="text-sm text-slate-600 mb-2">
                        Source: {quiz.pdf_title}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>{quiz.question_count} questions</span>
                      <span>•</span>
                      <span className="capitalize">
                        {quiz.difficulty_level}
                      </span>
                      <span>•</span>
                      <span>{formatDate(quiz.created_at || "")}</span>
                    </div>
                  </div>
                  <Badge
                    variant={getStatusVariant(
                      quiz.generation_status || "pending"
                    )}
                  >
                    {quiz.generation_status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
