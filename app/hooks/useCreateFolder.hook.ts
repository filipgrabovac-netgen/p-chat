import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { CreateFolderRequest, Folder } from "../types/folders";

interface UseCreateFolderReturn {
  createFolder: (data: CreateFolderRequest) => Promise<Folder>;
  isCreating: boolean;
  error: string | null;
  isSuccess: boolean;
}

export const useCreateFolder = (): UseCreateFolderReturn => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: createFolder,
    isPending: isCreating,
    error,
    isSuccess,
  } = useMutation({
    mutationFn: async (data: CreateFolderRequest): Promise<Folder> => {
      const response = await apiClientFetch.POST("/api/folders/", {
        body: data,
      });

      if (response.error) {
        throw new Error("Failed to create folder");
      }

      return response.data as Folder;
    },
    onSuccess: () => {
      // Invalidate all related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    },
  });

  return {
    createFolder,
    isCreating,
    error: error ? (error as Error).message : null,
    isSuccess,
  };
};
