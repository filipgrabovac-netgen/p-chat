import { QuizClient } from "./QuizClient";

// For static export, we need to provide generateStaticParams
// Since quiz IDs are dynamic, we'll generate a reasonable range
export async function generateStaticParams() {
  // Generate static params for common quiz ID ranges
  // This allows the build to succeed while still supporting dynamic quiz IDs
  const params = [];
  for (let i = 1; i <= 100; i++) {
    params.push({ id: i.toString() });
  }
  return params;
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const quizId = params.id;

  return <QuizClient quizId={parseInt(quizId, 10)} />;
}
