"""
PDF Processing Utility
Handles PDF text extraction and processing
"""
import logging
from typing import Dict, Any
import PyPDF2
from io import BytesIO

logger = logging.getLogger(__name__)


class PDFProcessor:
    """
    Handles PDF file processing including text extraction
    """

    @staticmethod
    def extract_text_from_pdf(file_content: bytes) -> Dict[str, Any]:
        """
        Extract text content from PDF file

        Args:
            file_content: PDF file content as bytes

        Returns:
            Dict containing:
                - success: bool
                - text: extracted text
                - page_count: number of pages
                - error: error message if failed
        """
        try:
            pdf_file = BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            page_count = len(pdf_reader.pages)
            extracted_text = []

            for page_num in range(page_count):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                if text:
                    extracted_text.append(text)

            full_text = "\n\n".join(extracted_text)
            
            return {
                'success': True,
                'text': full_text,
                'page_count': page_count,
                'error': None
            }

        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return {
                'success': False,
                'text': '',
                'page_count': 0,
                'error': str(e)
            }

    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean and normalize extracted text

        Args:
            text: Raw extracted text

        Returns:
            Cleaned text
        """
        # Remove excessive whitespace
        text = ' '.join(text.split())
        
        # Remove special characters but keep punctuation
        # Add more cleaning rules as needed
        
        return text

    @staticmethod
    def prepare_text_for_quiz_generation(
        text: str,
        num_questions: int = 5,
        difficulty: str = 'medium',
        question_types: list = None
    ) -> str:
        """
        Format extracted text with quiz generation instructions for LLM

        Args:
            text: Extracted and cleaned text
            num_questions: Number of questions to generate
            difficulty: Difficulty level (easy, medium, hard)
            question_types: List of question types to include

        Returns:
            Formatted prompt for LLM
        """
        if question_types is None:
            question_types = ['multiple_choice', 'true_false']

        question_types_str = ', '.join(question_types)
        
        prompt = f"""Based on the following text, generate a quiz with {num_questions} questions at {difficulty} difficulty level.

Question types to include: {question_types_str}

For multiple choice questions:
- Provide 4 answer options (A, B, C, D)
- Clearly indicate the correct answer

For true/false questions:
- Provide clear true or false statements
- Indicate the correct answer

For short answer questions:
- Provide the expected answer or key points

Format your response as a structured JSON with this schema:
{{
    "questions": [
        {{
            "question_number": 1,
            "question_type": "multiple_choice",
            "question_text": "Question here?",
            "options": [
                {{"option": "A", "text": "Option A text"}},
                {{"option": "B", "text": "Option B text"}},
                {{"option": "C", "text": "Option C text"}},
                {{"option": "D", "text": "Option D text"}}
            ],
            "correct_answer": "A",
            "explanation": "Brief explanation of why this is correct"
        }}
    ]
}}

Source Text:
{text[:5000]}

Generate the quiz questions now in valid JSON format:"""

        return prompt

