import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { components } from "@/app/schema/schema";

type Quiz = components["schemas"]["Quiz"];

interface UseQuizReturn {
  quiz: Quiz | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useQuiz = (quizId?: number | null): UseQuizReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async (): Promise<Quiz> => {
      if (!quizId) {
        throw new Error("Quiz ID is required");
      }

      const response = await apiClientFetch.GET(
        "/api/pdf-manager/quizzes/{id}/",
        {
          params: {
            path: {
              id: quizId,
            },
          },
        }
      );

      if (response.error) {
        throw new Error("Failed to fetch quiz");
      }

      return response.data as Quiz;
    },
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    quiz: data || null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
