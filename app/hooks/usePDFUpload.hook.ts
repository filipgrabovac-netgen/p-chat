import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientFetch } from "../schema/apiClient";
import { components } from "@/app/schema/schema";

type PDFDocument = components["schemas"]["PDFDocument"];

interface UsePDFUploadReturn {
  uploadPDF: (file: File, title?: string) => Promise<PDFDocument>;
  isUploading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export const usePDFUpload = (): UsePDFUploadReturn => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: uploadPDF,
    isPending: isUploading,
    error,
    isSuccess,
  } = useMutation({
    mutationFn: async ({
      file,
      title,
    }: {
      file: File;
      title?: string;
    }): Promise<PDFDocument> => {
      const formData = new FormData();
      formData.append("file", file);
      if (title) {
        formData.append("title", title);
      }

      const response = await apiClientFetch.POST(
        "/api/pdf-manager/pdfs/upload/",
        {
          // @ts-expect-error - FormData is not fully supported by openapi-typescript
          body: formData,
          // @ts-expect-error - FormData bodySerializer type compatibility
          bodySerializer: (body: FormData) => body,
        }
      );

      if (response.error) {
        throw new Error("Failed to upload PDF");
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate PDF list to refetch
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    },
  });

  return {
    uploadPDF: (file: File, title?: string) => uploadPDF({ file, title }),
    isUploading,
    error: error ? (error as Error).message : null,
    isSuccess,
  };
};
