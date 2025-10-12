import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "@/app/schema/apiClient";

interface DeletePDFResponse {
  success: boolean;
  message?: string;
}

export const useDeletePDF = () => {
  const queryClient = useQueryClient();

  return useMutation<DeletePDFResponse, Error, number>({
    mutationFn: async (pdfId: number) => {
      const response = await apiClientFetch.DELETE(
        "/api/pdf-manager/pdfs/{id}/",
        {
          params: {
            path: { id: pdfId },
          },
        }
      );

      if (response.error) {
        throw new Error(response.error.details || "Failed to delete PDF");
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate and refetch PDF list
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
      // Also invalidate quizzes since deleting a PDF deletes its quizzes
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
    onError: (error) => {
      // Error handling - could be extended with toast notifications
    },
  });
};
