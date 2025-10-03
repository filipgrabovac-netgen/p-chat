export interface PDFDocument {
  id: number;
  user: number;
  user_username: string;
  title: string;
  file: string;
  file_size: number;
  extracted_text: string | null;
  page_count: number;
  processing_status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface PDFDocumentListItem {
  id: number;
  user_username: string;
  title: string;
  file_size: number;
  page_count: number;
  processing_status: "pending" | "processing" | "completed" | "failed";
  quiz_count: string;
  created_at: string;
}

export interface PDFUploadRequest {
  file: File;
  title?: string;
}

export interface QuizAnswer {
  id: number;
  answer_text: string;
  is_correct: boolean;
  order: number;
}

export interface QuizQuestion {
  id: number;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  question_text: string;
  order: number;
  answers: QuizAnswer[];
}

export interface Quiz {
  id: number;
  user: number;
  user_username: string;
  pdf_document: number | null;
  pdf_title: string | null;
  title: string;
  source_text: string;
  difficulty_level: "easy" | "medium" | "hard";
  num_questions: number;
  generation_status: "pending" | "generating" | "completed" | "failed";
  questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

export interface QuizListItem {
  id: number;
  user_username: string;
  pdf_title: string | null;
  title: string;
  difficulty_level: "easy" | "medium" | "hard";
  num_questions: number;
  question_count: string;
  generation_status: "pending" | "generating" | "completed" | "failed";
  created_at: string;
}

export interface QuizGenerationRequest {
  pdf_document_id?: number;
  source_text?: string;
  title: string;
  difficulty_level: "easy" | "medium" | "hard";
  num_questions: number;
  question_types: Array<"multiple_choice" | "true_false" | "short_answer">;
}
