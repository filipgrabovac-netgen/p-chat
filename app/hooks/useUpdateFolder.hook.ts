import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { UpdateFolderRequest, Folder } from "../types/folders";

interface UseUpdateFolderReturn {
  updateFolder: (
    folderId: number,
    data: UpdateFolderRequest
  ) => Promise<Folder>;
  isUpdating: boolean;
  error: string | null;
  isSuccess: boolean;
}

export const useUpdateFolder = (): UseUpdateFolderReturn => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateFolder,
    isPending: isUpdating,
    error,
    isSuccess,
  } = useMutation({
    mutationFn: async ({
      folderId,
      data,
    }: {
      folderId: number;
      data: UpdateFolderRequest;
    }): Promise<Folder> => {
      const response = await apiClientFetch.PUT(`/api/folders/${folderId}/`, {
        body: data,
      });

      if (response.error) {
        throw new Error("Failed to update folder");
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
    updateFolder: (folderId: number, data: UpdateFolderRequest) =>
      updateFolder({ folderId, data }),
    isUpdating,
    error: error ? (error as Error).message : null,
    isSuccess,
  };
};
