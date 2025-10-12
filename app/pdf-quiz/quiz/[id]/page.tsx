"use client";

import { useParams } from "next/navigation";
import { QuizClient } from "./QuizClient";

export default function QuizDetailPage() {
  const params = useParams();
  const quizId = Number(params.id);

  return <QuizClient quizId={quizId} />;
}
