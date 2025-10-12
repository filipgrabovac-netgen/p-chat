"use client";

import { useState } from "react";
import { Quiz, QuizQuestion } from "@/app/types/pdf";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, HelpCircle, User } from "lucide-react";
import { cn } from "@/app/utils/cn";

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

  const getDifficultyVariant = (
    difficulty: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (difficulty) {
      case "easy":
        return "default";
      case "medium":
        return "secondary";
      case "hard":
        return "destructive";
      default:
        return "outline";
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
      >
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-medium text-sm">
                {question.order || 1}
              </span>
              <div className="flex-1">
                <p className="text-slate-900 font-medium text-lg">
                  {question.question_text}
                </p>
                <Badge variant="outline" className="mt-2">
                  {question.question_type.replace("_", " ").toUpperCase()}
                </Badge>
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
                  <Button
                    key={answer.id}
                    variant="ghost"
                    onClick={() => handleAnswerSelect(question.id, answer.id)}
                    disabled={showResults}
                    className={cn(
                      "w-full p-4 h-auto justify-start text-left transition-all",
                      bgColor,
                      borderColor,
                      textColor,
                      showResults ? "cursor-default" : "cursor-pointer"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex-1">{answer.answer_text}</span>
                      {showCorrect && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                      {showIncorrect && (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const score = showResults ? calculateScore() : 0;
  const percentage = showResults
    ? Math.round((score / quiz.questions.length) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                {quiz.title}
              </CardTitle>
              {quiz.pdf_title && (
                <p className="text-slate-600 text-sm">
                  Source: {quiz.pdf_title}
                </p>
              )}
            </div>
            <Badge
              variant={getDifficultyVariant(quiz.difficulty_level || "medium")}
            >
              {(quiz.difficulty_level || "medium").charAt(0).toUpperCase() +
                (quiz.difficulty_level || "medium").slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6 text-sm text-slate-600">
            <span className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>{quiz.questions.length} Questions</span>
            </span>
            <span className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{quiz.user_username}</span>
            </span>
          </div>

          {showResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6"
            >
              <Card className="bg-slate-50">
                <CardContent className="p-4">
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
                        className={cn(
                          "text-3xl font-bold",
                          percentage >= 70
                            ? "text-green-600"
                            : percentage >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        )}
                      >
                        {percentage}%
                      </p>
                    </div>
                  </div>
                  <Progress value={percentage} className="mt-4" />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {quiz.questions.map((question) => renderQuestion(question))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={() => setShowResults(!showResults)}
          size="lg"
          className="px-8 py-3"
        >
          {showResults ? "Hide Results" : "Submit & Show Results"}
        </Button>
      </div>
    </div>
  );
};
