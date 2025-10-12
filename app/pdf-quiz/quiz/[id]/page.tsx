import { QuizClient } from "./QuizClient";

// This is required for static export with dynamic routes
export function generateStaticParams() {
  // Return empty array - pages will be generated on-demand
  return [];
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function QuizDetailPage({ params }: PageProps) {
  const quizId = Number(params.id);

  return <QuizClient quizId={quizId} />;
}
