"use client";

import { useState } from "react";
import { Quiz, QuizQuestion } from "@/app/types/pdf";
import { motion } from "framer-motion";

export type QuizDisplayProps = {
  quiz: Quiz;
};

export const QuizDisplay = ({ quiz }: QuizDisplayProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    if (!showResults) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: answerId,
      }));
    }
  };

  const calculateScore = (): number => {
    let correct = 0;
    quiz.questions.forEach((question) => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer) {
        const answer = question.answers.find((a) => a.id === selectedAnswer);
        if (answer?.is_correct) {
          correct++;
        }
      }
    });
    return correct;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderQuestion = (question: QuizQuestion) => {
    const selectedAnswer = selectedAnswers[question.id];
    const correctAnswer = question.answers.find((a) => a.is_correct);

    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-lg p-6 mb-4"
      >
        <div className="flex items-start space-x-3 mb-4">
          <span className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-medium text-sm">
            {question.order}
          </span>
          <div className="flex-1">
            <p className="text-slate-900 font-medium text-lg">
              {question.question_text}
            </p>
            <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
              {question.question_type.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {question.answers.map((answer) => {
            const isSelected = selectedAnswer === answer.id;
            const isCorrect = answer.is_correct;
            const showCorrect = showResults && isCorrect;
            const showIncorrect = showResults && isSelected && !isCorrect;

            let bgColor = "bg-slate-50 hover:bg-slate-100";
            let borderColor = "border-slate-200";
            let textColor = "text-slate-900";

            if (showCorrect) {
              bgColor = "bg-green-50";
              borderColor = "border-green-500";
              textColor = "text-green-900";
            } else if (showIncorrect) {
              bgColor = "bg-red-50";
              borderColor = "border-red-500";
              textColor = "text-red-900";
            } else if (isSelected) {
              bgColor = "bg-slate-100";
              borderColor = "border-slate-600";
            }

            return (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(question.id, answer.id)}
                disabled={showResults}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${bgColor} ${borderColor} ${textColor} ${
                  showResults ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1">{answer.answer_text}</span>
                  {showCorrect && (
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {showIncorrect && (
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const score = showResults ? calculateScore() : 0;
  const percentage = showResults
    ? Math.round((score / quiz.questions.length) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {quiz.title}
            </h1>
            {quiz.pdf_title && (
              <p className="text-slate-600 text-sm">Source: {quiz.pdf_title}</p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
              quiz.difficulty_level
            )}`}
          >
            {quiz.difficulty_level.charAt(0).toUpperCase() +
              quiz.difficulty_level.slice(1)}
          </span>
        </div>

        <div className="flex items-center space-x-6 text-sm text-slate-600">
          <span className="flex items-center space-x-2">
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{quiz.questions.length} Questions</span>
          </span>
          <span className="flex items-center space-x-2">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>{quiz.user_username}</span>
          </span>
        </div>

        {showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Your Score</p>
                <p className="text-3xl font-bold text-slate-900">
                  {score} / {quiz.questions.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-1">Percentage</p>
                <p
                  className={`text-3xl font-bold ${
                    percentage >= 70
                      ? "text-green-600"
                      : percentage >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {percentage}%
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question) => renderQuestion(question))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setShowResults(!showResults)}
          className="px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
        >
          {showResults ? "Hide Results" : "Submit & Show Results"}
        </button>
      </div>
    </div>
  );
};
