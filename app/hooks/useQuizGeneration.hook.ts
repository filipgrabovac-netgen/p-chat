import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { components } from "@/app/schema/schema";

type Quiz = components["schemas"]["Quiz"];
type QuizGenerationRequest =
  components["schemas"]["QuizGenerationRequestRequest"];

interface UseQuizGenerationReturn {
  generateQuiz: (request: QuizGenerationRequest) => Promise<Quiz>;
  isGenerating: boolean;
  error: string | null;
  isSuccess: boolean;
}

export const useQuizGeneration = (): UseQuizGenerationReturn => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: generateQuiz,
    isPending: isGenerating,
    error,
    isSuccess,
  } = useMutation({
    mutationFn: async (request: QuizGenerationRequest): Promise<Quiz> => {
      const response = await apiClientFetch.POST(
        "/api/pdf-manager/quizzes/generate/",
        {
          body: {
            pdf_document_id: request.pdf_document_id,
            source_text: request.source_text,
            title: request.title,
            difficulty_level: request.difficulty_level,
            num_questions: request.num_questions,
            question_types: request.question_types,
          },
        }
      );

      if (response.error) {
        throw new Error("Failed to generate quiz");
      }

      return response.data as Quiz;
    },
    onSuccess: () => {
      // Invalidate quiz list and PDF list to refetch
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    },
  });

  return {
    generateQuiz,
    isGenerating,
    error: error ? (error as Error).message : null,
    isSuccess,
  };
};
