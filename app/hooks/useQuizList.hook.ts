import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { components } from "@/app/schema/schema";

type QuizList = components["schemas"]["QuizList"];

interface UseQuizListReturn {
  quizzes: QuizList[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useQuizList = (): UseQuizListReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async (): Promise<QuizList[]> => {
      const response = await apiClientFetch.GET("/api/pdf-manager/quizzes/");

      if (response.error) {
        throw new Error("Failed to fetch quizzes");
      }

      // Handle paginated response - extract results array
      return (response.data?.results || []) as QuizList[];
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  return {
    quizzes: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
