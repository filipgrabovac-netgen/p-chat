import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { FolderListItem } from "../types/folders";

interface UseFoldersReturn {
  folders: FolderListItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useFolders = (): UseFoldersReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["folders"],
    queryFn: async (): Promise<FolderListItem[]> => {
      const response = await apiClientFetch.GET("/api/folders/");

      if (response.error) {
        throw new Error("Failed to fetch folders");
      }

      // Handle paginated response - extract results array
      return (response.data?.results || []) as FolderListItem[];
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  return {
    folders: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
