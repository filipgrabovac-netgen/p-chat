"use client";

import { PDFDocumentListItem } from "@/app/types/pdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { useDeletePDF } from "../../hooks/useDeletePDF.hook";

export type PDFListProps = {
  pdfs: PDFDocumentListItem[];
  isLoading: boolean;
  onSelectPDF: (pdfId: number) => void;
  onGenerateQuiz: (pdfId: number) => void;
  selectedPDFId?: number;
  generatingQuizId?: number;
};

export const PDFList = ({
  pdfs,
  isLoading,
  onSelectPDF,
  onGenerateQuiz,
  selectedPDFId,
  generatingQuizId,
}: PDFListProps) => {
  const deletePDFMutation = useDeletePDF();

  const handleDeletePDF = (pdfId: number) => {
    deletePDFMutation.mutate(pdfId);
  };

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

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pdfs.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-lg">No PDF documents yet</p>
          <p className="text-slate-400 text-sm mt-2">
            Upload a PDF to get started with quiz generation
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {pdfs.map((pdf) => (
        <Card
          key={pdf.id}
          className={cn(
            "hover:shadow-md transition-all cursor-pointer",
            selectedPDFId === pdf.id && "ring-2 ring-slate-600"
          )}
          onClick={() => onSelectPDF(pdf.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
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
                  <Badge variant={getStatusVariant(pdf.processing_status)}>
                    {pdf.processing_status}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {formatDate(pdf.created_at)}
                  </span>
                </div>
              </div>

              <div
                className="ml-4 flex-shrink-0 flex items-center space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                {pdf.processing_status === "completed" && (
                  <>
                    {generatingQuizId === pdf.id ? (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateQuiz(pdf.id);
                        }}
                      >
                        Generate Quiz
                      </Button>
                    )}
                  </>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete PDF Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{pdf.title}"? This
                        action will permanently delete the PDF file and all
                        associated quizzes. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeletePDF(pdf.id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deletePDFMutation.isPending}
                      >
                        {deletePDFMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
