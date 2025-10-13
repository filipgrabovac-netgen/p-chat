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
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          My Quizzes
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Select a quiz to take or review results
        </p>
      </div>

      {isLoadingQuizzes ? (
        <div className="space-y-3 sm:space-y-4">
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
        <Card className="text-center py-8 sm:py-12">
          <CardContent>
            <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 text-base sm:text-lg">
              No quizzes yet
            </p>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Generate a quiz from your PDFs to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
              onClick={() => handleSelectQuiz(quiz.id)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between sm:block mb-2">
                      <h3 className="font-semibold text-base sm:text-lg text-slate-900 flex-1 break-words pr-2">
                        {quiz.title}
                      </h3>
                      <Badge
                        variant={getStatusVariant(
                          quiz.generation_status || "pending"
                        )}
                        className="sm:hidden flex-shrink-0"
                      >
                        {quiz.generation_status}
                      </Badge>
                    </div>
                    <div className="mb-2 space-y-1">
                      {quiz.pdf_title && (
                        <p className="text-xs sm:text-sm text-slate-600 truncate">
                          Source: {quiz.pdf_title}
                        </p>
                      )}
                      {quiz.folder_name && (
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: quiz.folder_color || "#3B82F6",
                            }}
                          />
                          <p className="text-xs sm:text-sm text-slate-600 truncate">
                            Folder: {quiz.folder_name}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600">
                      <span>{quiz.question_count} questions</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="capitalize">
                        {quiz.difficulty_level}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-xs">
                        {formatDate(quiz.created_at || "")}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={getStatusVariant(
                      quiz.generation_status || "pending"
                    )}
                    className="hidden sm:inline-flex flex-shrink-0"
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
