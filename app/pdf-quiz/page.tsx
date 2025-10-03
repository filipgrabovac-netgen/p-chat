"use client";

import { useState } from "react";
import { PDFUpload } from "../components/pdf_upload/PDFUpload";
import { PDFList } from "../components/pdf_list/PDFList";
import { QuizDisplay } from "../components/quiz_display/QuizDisplay";
import { usePDFUpload } from "../hooks/usePDFUpload.hook";
import { usePDFList } from "../hooks/usePDFList.hook";
import { useQuizGeneration } from "../hooks/useQuizGeneration.hook";
import { useQuizList } from "../hooks/useQuizList.hook";
import { useQuiz } from "../hooks/useQuiz.hook";
import { motion } from "framer-motion";

type Tab = "upload" | "pdfs" | "quizzes" | "take-quiz";

export default function PDFQuizPage() {
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [selectedPDFId, setSelectedPDFId] = useState<number | undefined>();
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [quizGenerationSettings, setQuizGenerationSettings] = useState({
    difficulty: "medium" as "easy" | "medium" | "hard",
    numQuestions: 5,
  });

  const { uploadPDF, isUploading } = usePDFUpload();
  const { pdfs, isLoading: isLoadingPDFs } = usePDFList();
  const { generateQuiz, isGenerating } = useQuizGeneration();
  const { quizzes, isLoading: isLoadingQuizzes } = useQuizList();
  const { quiz: selectedQuiz, isLoading: isLoadingQuiz } =
    useQuiz(selectedQuizId);

  const handleUpload = async (file: File, title?: string) => {
    try {
      await uploadPDF(file, title);
      setActiveTab("pdfs");
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleGenerateQuiz = async (pdfId: number) => {
    try {
      const quiz = await generateQuiz({
        pdf_document_id: pdfId,
        difficulty_level: quizGenerationSettings.difficulty,
        num_questions: quizGenerationSettings.numQuestions,
        question_types: ["multiple_choice", "true_false"],
      });
      setSelectedQuizId(quiz.id);
      setActiveTab("take-quiz");
    } catch (error) {
      console.error("Quiz generation failed:", error);
    }
  };

  const handleSelectQuiz = (quizId: number) => {
    setSelectedQuizId(quizId);
    setActiveTab("take-quiz");
  };

  const tabs: Array<{ id: Tab; label: string; icon: JSX.Element }> = [
    {
      id: "upload",
      label: "Upload PDF",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      id: "pdfs",
      label: "My PDFs",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
    {
      id: "quizzes",
      label: "My Quizzes",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
  ];

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
      case "generating":
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">PDF Quiz Generator</h1>
          <p className="text-slate-300 text-sm mt-1">
            Upload PDFs and generate AI-powered quizzes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-slate-800 text-slate-900"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PDFUpload onUpload={handleUpload} isUploading={isUploading} />
          </motion.div>
        )}

        {activeTab === "pdfs" && (
          <motion.div
            key="pdfs"
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
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Quiz Settings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={quizGenerationSettings.difficulty}
                      onChange={(e) =>
                        setQuizGenerationSettings((prev) => ({
                          ...prev,
                          difficulty: e.target.value as
                            | "easy"
                            | "medium"
                            | "hard",
                        }))
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Number of Questions
                    </label>
                    <input
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
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600"
                    />
                  </div>
                </div>
              </div>
            )}

            <PDFList
              pdfs={pdfs}
              isLoading={isLoadingPDFs}
              onSelectPDF={setSelectedPDFId}
              onGenerateQuiz={handleGenerateQuiz}
              selectedPDFId={selectedPDFId}
            />

            {isGenerating && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-6 h-6 animate-spin text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-blue-900 font-medium">
                    Generating quiz using AI... This may take a moment.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "quizzes" && (
          <motion.div
            key="quizzes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                My Quizzes
              </h2>
              <p className="text-slate-600">
                Select a quiz to take or review results
              </p>
            </div>

            {isLoadingQuizzes ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 rounded-lg p-4 animate-pulse"
                  >
                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-slate-500 text-lg">No quizzes yet</p>
                <p className="text-slate-400 text-sm mt-2">
                  Generate a quiz from your PDFs to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleSelectQuiz(quiz.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900 mb-2">
                          {quiz.title}
                        </h3>
                        {quiz.pdf_title && (
                          <p className="text-sm text-slate-600 mb-2">
                            Source: {quiz.pdf_title}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>{quiz.question_count} questions</span>
                          <span>•</span>
                          <span className="capitalize">
                            {quiz.difficulty_level}
                          </span>
                          <span>•</span>
                          <span>{formatDate(quiz.created_at)}</span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          quiz.generation_status
                        )}`}
                      >
                        {quiz.generation_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "take-quiz" && (
          <motion.div
            key="take-quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isLoadingQuiz ? (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 animate-spin mx-auto mb-4 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-slate-600">Loading quiz...</p>
              </div>
            ) : selectedQuiz ? (
              <>
                <button
                  onClick={() => setActiveTab("quizzes")}
                  className="mb-6 flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Back to Quizzes</span>
                </button>
                <QuizDisplay quiz={selectedQuiz} />
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-slate-500">No quiz selected</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
