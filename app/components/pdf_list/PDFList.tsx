"use client";

import { PDFDocumentListItem } from "@/app/types/pdf";

export type PDFListProps = {
  pdfs: PDFDocumentListItem[];
  isLoading: boolean;
  onSelectPDF: (pdfId: number) => void;
  onGenerateQuiz: (pdfId: number) => void;
  selectedPDFId?: number;
};

export const PDFList = ({
  pdfs,
  isLoading,
  onSelectPDF,
  onGenerateQuiz,
  selectedPDFId,
}: PDFListProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-50 rounded-lg p-4 animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (pdfs.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-slate-500 text-lg">No PDF documents yet</p>
        <p className="text-slate-400 text-sm mt-2">
          Upload a PDF to get started with quiz generation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pdfs.map((pdf) => (
        <div
          key={pdf.id}
          className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
            selectedPDFId === pdf.id
              ? "border-slate-600 shadow-md"
              : "border-slate-200"
          }`}
          onClick={() => onSelectPDF(pdf.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                <h3 className="font-medium text-slate-900 truncate">
                  {pdf.title}
                </h3>
              </div>

              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span>{formatFileSize(pdf.file_size)}</span>
                <span>•</span>
                <span>{pdf.page_count} pages</span>
                <span>•</span>
                <span>{pdf.quiz_count} quizzes</span>
              </div>

              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    pdf.processing_status
                  )}`}
                >
                  {pdf.processing_status}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(pdf.created_at)}
                </span>
              </div>
            </div>

            {pdf.processing_status === "completed" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateQuiz(pdf.id);
                }}
                className="ml-4 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0"
              >
                Generate Quiz
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
