"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PDFList } from "../../components/pdf_list/PDFList";
import { FolderSelector } from "../../components/folder_selector/FolderSelector";
import { usePDFList } from "../../hooks/usePDFList.hook";
import { useFolders } from "../../hooks/useFolders.hook";
import { useQuizGeneration } from "../../hooks/useQuizGeneration.hook";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function PDFsPage() {
  const router = useRouter();
  const [selectedPDFId, setSelectedPDFId] = useState<number | undefined>();
  const [generatingQuizId, setGeneratingQuizId] = useState<
    number | undefined
  >();
  const [quizGenerationSettings, setQuizGenerationSettings] = useState({
    difficulty: "medium" as "easy" | "medium" | "hard",
    numQuestions: 5,
    folder: null as number | null,
  });

  const { pdfs, isLoading: isLoadingPDFs } = usePDFList();
  const { folders } = useFolders();
  const { generateQuiz } = useQuizGeneration();

  const handleGenerateQuiz = async (pdfId: number) => {
    setGeneratingQuizId(pdfId);
    try {
      const quiz = await generateQuiz({
        pdf_document_id: pdfId,
        title: "Generated Quiz",
        difficulty_level: quizGenerationSettings.difficulty,
        num_questions: quizGenerationSettings.numQuestions,
        question_types: ["multiple_choice", "true_false"],
        folder: quizGenerationSettings.folder,
      });
      router.push(`/pdf-quiz/quiz/${quiz.id}`);
    } catch (error) {
      // Error handling - could be extended with toast notifications
    } finally {
      setGeneratingQuizId(undefined);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          My PDF Documents
        </h2>
        <p className="text-slate-600">
          Select a PDF to generate a quiz or view details
        </p>
      </div>

      {/* Quiz Generation Settings */}
      {selectedPDFId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Quiz Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="difficulty"
                  className="text-sm font-medium text-slate-700"
                >
                  Difficulty Level
                </Label>
                <Select
                  value={quizGenerationSettings.difficulty}
                  onValueChange={(value) =>
                    setQuizGenerationSettings((prev) => ({
                      ...prev,
                      difficulty: value as "easy" | "medium" | "hard",
                    }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="numQuestions"
                  className="text-sm font-medium text-slate-700"
                >
                  Number of Questions
                </Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min="1"
                  max="20"
                  value={quizGenerationSettings.numQuestions}
                  onChange={(e) =>
                    setQuizGenerationSettings((prev) => ({
                      ...prev,
                      numQuestions: parseInt(e.target.value) || 5,
                    }))
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="folder"
                  className="text-sm font-medium text-slate-700"
                >
                  Folder
                </Label>
                <div className="mt-2">
                  <FolderSelector
                    folders={folders}
                    selectedFolderId={quizGenerationSettings.folder}
                    onFolderChange={(folderId) =>
                      setQuizGenerationSettings((prev) => ({
                        ...prev,
                        folder: folderId,
                      }))
                    }
                    placeholder="Select folder (optional)"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <PDFList
        pdfs={pdfs.map((pdf) => ({
          ...pdf,
          page_count: pdf.page_count || 0,
          processing_status: pdf.processing_status || "pending",
        }))}
        isLoading={isLoadingPDFs}
        onSelectPDF={setSelectedPDFId}
        onGenerateQuiz={handleGenerateQuiz}
        selectedPDFId={selectedPDFId}
        generatingQuizId={generatingQuizId}
      />
    </motion.div>
  );
}
