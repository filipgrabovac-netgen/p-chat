"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "../../schema/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/app/utils/cn";
import { useRouter } from "next/navigation";

interface Quiz {
  id: number;
  title: string;
  difficulty_level: "easy" | "medium" | "hard";
  num_questions: number;
  generation_status: "pending" | "generating" | "completed" | "failed";
  created_at: string;
}

interface FolderQuizzesProps {
  folderId: number;
  folderName: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export const FolderQuizzes = ({
  folderId,
  isExpanded,
  onToggle,
}: FolderQuizzesProps) => {
  const router = useRouter();

  const {
    data: quizzes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["folder-quizzes", folderId],
    queryFn: async (): Promise<Quiz[]> => {
      const response = await apiClientFetch.GET(`/api/folders/{id}/quizzes/`, {
        params: {
          path: {
            id: folderId,
          },
        },
      });

      if (response.error) {
        throw new Error("Failed to fetch folder quizzes");
      }

      return (response.data || []) as Quiz[];
    },
    enabled: isExpanded, // Only fetch when expanded
    staleTime: 30 * 1000,
  });

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
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "hard":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const handleQuizClick = (quizId: number) => {
    router.push(`/pdf-quiz/quiz/${quizId}`);
  };

  return (
    <div className="border-t border-slate-100">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="w-full justify-start p-2 sm:p-3 h-auto hover:bg-slate-50"
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
          ) : (
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
          )}
          <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
          <span className="text-xs sm:text-sm font-medium text-slate-700">
            {isExpanded ? "Hide" : "Show"} Quizzes (
            {isExpanded ? quizzes?.length || 0 : "..."})
          </span>
        </div>
      </Button>

      {isExpanded && (
        <div className="px-2 sm:px-3 pb-2 sm:pb-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-3 sm:py-4">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-slate-500" />
              <span className="ml-2 text-xs sm:text-sm text-slate-500">
                Loading quizzes...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-3 sm:py-4">
              <p className="text-xs sm:text-sm text-red-500">
                Failed to load quizzes
              </p>
            </div>
          ) : !quizzes || quizzes.length === 0 ? (
            <div className="text-center py-3 sm:py-4">
              <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs sm:text-sm text-slate-500">
                No quizzes in this folder yet
              </p>
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-2">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="hover:shadow-sm transition-all cursor-pointer border-slate-200"
                  onClick={() => handleQuizClick(quiz.id)}
                >
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                          <h4 className="font-medium text-slate-900 truncate text-xs sm:text-sm">
                            {quiz.title}
                          </h4>
                          <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        </div>

                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <Badge
                            variant={getStatusVariant(quiz.generation_status)}
                            className="text-xs"
                          >
                            {quiz.generation_status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getDifficultyColor(quiz.difficulty_level)
                            )}
                          >
                            {quiz.difficulty_level}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                          <span>{quiz.num_questions} questions</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{formatDate(quiz.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
