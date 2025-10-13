import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";

interface UseDeleteFolderReturn {
  deleteFolder: (folderId: number) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
  isSuccess: boolean;
}

export const useDeleteFolder = (): UseDeleteFolderReturn => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: deleteFolder,
    isPending: isDeleting,
    error,
    isSuccess,
  } = useMutation({
    mutationFn: async (folderId: number): Promise<void> => {
      const response = await apiClientFetch.DELETE(`/api/folders/${folderId}/`);

      if (response.error) {
        throw new Error("Failed to delete folder");
      }
    },
    onSuccess: () => {
      // Invalidate all related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
      // Also invalidate any folder-specific quiz queries
      queryClient.invalidateQueries({ queryKey: ["folder-quizzes"] });
    },
  });

  return {
    deleteFolder,
    isDeleting,
    error: error ? (error as Error).message : null,
    isSuccess,
  };
};
