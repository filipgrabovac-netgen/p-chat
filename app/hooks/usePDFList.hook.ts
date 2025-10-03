import { useQuery } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { components } from "@/app/schema/schema";

type PDFDocumentList = components["schemas"]["PDFDocumentList"];

interface UsePDFListReturn {
  pdfs: PDFDocumentList[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePDFList = (): UsePDFListReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pdfs"],
    queryFn: async (): Promise<PDFDocumentList[]> => {
      const response = await apiClientFetch.GET("/api/pdf-manager/pdfs/");

      if (response.error) {
        throw new Error("Failed to fetch PDFs");
      }

      // Handle paginated response - extract results array
      return (response.data?.results || []) as PDFDocumentList[];
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  return {
    pdfs: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
