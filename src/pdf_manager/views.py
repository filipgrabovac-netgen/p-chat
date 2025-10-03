"""
ViewSets for PDF document and Quiz management
"""
import logging
import json
import re
from langchain_google_genai import GoogleGenerativeAI
from pydantic import BaseModel
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema

from .models import PDFDocument, Quiz, QuizQuestion, QuizAnswer
from .serializers import (
    PDFDocumentSerializer,
    PDFUploadSerializer,
    PDFDocumentListSerializer,
    QuizSerializer,
    QuizGenerationRequestSerializer,
    QuizListSerializer,
    ErrorResponseSerializer,
)
from .utils.pdf_processor import PDFProcessor
from aws_llm.utils.llm_wrapper import AWSLLMWrapper

logger = logging.getLogger(__name__)


class PDFDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PDF document operations
    Provides CRUD operations for PDF documents
    """
    queryset = PDFDocument.objects.all()
    serializer_class = PDFDocumentSerializer
    permission_classes = [AllowAny]  # TODO: Add proper authentication
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return PDFDocumentListSerializer
        elif self.action == 'upload':
            return PDFUploadSerializer
        return PDFDocumentSerializer

    def get_queryset(self):
        """Filter PDFs by user (hardcoded to user ID 1 for now)"""
        # TODO: Replace with proper authentication
        return PDFDocument.objects.filter(user_id=1).order_by('-created_at')

    @extend_schema(
        operation_id='upload_pdf',
        summary='Upload a PDF document',
        description='Upload a PDF file for text extraction and quiz generation',
        request=PDFUploadSerializer,
        responses={
            201: PDFDocumentSerializer,
            400: ErrorResponseSerializer,
        },
        tags=['PDF Documents']
    )
    @action(detail=False, methods=['post'])
    def upload(self, request):
        """Handle PDF file upload"""
        serializer = PDFUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            uploaded_file = serializer.validated_data['file']
            title = serializer.validated_data.get('title', uploaded_file.name)
            
            # Get or create user (hardcoded for now)
            user, created = User.objects.get_or_create(
                id=1,
                defaults={
                    'username': 'default_user',
                    'email': 'default@example.com'
                }
            )
            
            # Create PDF document entry
            pdf_document = PDFDocument.objects.create(
                user=user,
                title=title,
                file=uploaded_file,
                file_size=uploaded_file.size,
                processing_status='processing'
            )

            # Extract text from PDF - read from the saved file
            pdf_document.file.seek(0)  # Reset file pointer to beginning
            file_content = pdf_document.file.read()
            extraction_result = PDFProcessor.extract_text_from_pdf(file_content)

            if extraction_result['success']:
                # Update document with extracted text
                pdf_document.extracted_text = extraction_result['text']
                pdf_document.page_count = extraction_result['page_count']
                pdf_document.processing_status = 'completed'
                logger.info(f"Successfully processed PDF: {pdf_document.title}")
            else:
                pdf_document.processing_status = 'failed'
                pdf_document.error_message = extraction_result['error']
                logger.error(f"Failed to process PDF: {pdf_document.title}, Error: {extraction_result['error']}")

            pdf_document.save()

            response_serializer = PDFDocumentSerializer(pdf_document)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error uploading PDF: {str(e)}")
            return Response(
                {'error': 'Failed to upload PDF', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        operation_id='get_pdf_text',
        summary='Get extracted text from PDF',
        description='Retrieve the extracted text content from a PDF document',
        responses={
            200: PDFDocumentSerializer,
            404: ErrorResponseSerializer,
        },
        tags=['PDF Documents']
    )
    @action(detail=True, methods=['get'])
    def extracted_text(self, request, pk=None):
        """Get extracted text from a specific PDF"""
        try:
            pdf_document = self.get_object()
            
            if pdf_document.processing_status != 'completed':
                return Response(
                    {
                        'error': 'PDF is still being processed',
                        'status': pdf_document.processing_status
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response({
                'id': pdf_document.id,
                'title': pdf_document.title,
                'extracted_text': pdf_document.extracted_text,
                'page_count': pdf_document.page_count,
            })

        except PDFDocument.DoesNotExist:
            return Response(
                {'error': 'PDF document not found'},
                status=status.HTTP_404_NOT_FOUND
            )



class QuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet for quiz operations
    Provides CRUD operations and quiz generation
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [AllowAny]  # TODO: Add proper authentication

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return QuizListSerializer
        elif self.action == 'generate':
            return QuizGenerationRequestSerializer
        return QuizSerializer

    def get_queryset(self):
        """Filter quizzes by user (hardcoded to user ID 1 for now)"""
        # TODO: Replace with proper authentication
        return Quiz.objects.filter(user_id=1).order_by('-created_at')

    @extend_schema(
        operation_id='generate_quiz',
        summary='Generate a quiz from PDF or text',
        description='Generate quiz questions using LLM from PDF document or custom text',
        request=QuizGenerationRequestSerializer,
        responses={
            201: QuizSerializer,
            400: ErrorResponseSerializer,
        },
        tags=['Quizzes']
    )
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate quiz from PDF or text"""
        serializer = QuizGenerationRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get or create user (hardcoded for now)
            user, created = User.objects.get_or_create(
                id=1,
                defaults={
                    'username': 'default_user',
                    'email': 'default@example.com'
                }
            )
            
            # Get source text
            pdf_id = serializer.validated_data.get('pdf_document_id')
            source_text = serializer.validated_data.get('source_text')
            
            pdf_document = None
            if pdf_id:
                pdf_document = PDFDocument.objects.get(id=pdf_id, user=user)
                if pdf_document.processing_status != 'completed':
                    return Response(
                        {'error': 'PDF is still being processed or failed'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                source_text = pdf_document.extracted_text

            # Validate source text length
            if not source_text or len(source_text.strip()) < 100:
                return Response(
                    {'error': 'Source text is too short to generate meaningful quiz questions. Minimum 100 characters required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create quiz entry
            quiz = Quiz.objects.create(
                user=user,
                pdf_document=pdf_document,
                title=serializer.validated_data.get('title', 'Generated Quiz'),
                source_text=source_text[:1000],  # Store first 1000 chars
                difficulty_level=serializer.validated_data.get('difficulty_level', 'medium'),
                num_questions=serializer.validated_data.get('num_questions', 5),
                generation_status='generating'
            )

            # Prepare prompt for LLM
            prompt = PDFProcessor.prepare_text_for_quiz_generation(
                source_text,
                num_questions=quiz.num_questions,
                difficulty=quiz.difficulty_level,
                question_types=serializer.validated_data.get('question_types', ['multiple_choice'])
            )

            # Generate quiz using LLM
            logger.info(f"Generating quiz with {quiz.num_questions} questions at {quiz.difficulty_level} difficulty")
            llm = AWSLLMWrapper(model="gemma2:2b", stream=False)
            
            # Invoke LLM and collect response
            response_generator = llm.invoke_with_history([{'role': 'user', 'content': prompt}])
            google_client = GoogleGenerativeAI(model="gemini-2.5-flash")
            response_generator = google_client.invoke(prompt)
            llm_response = ""
            
            try:
                for chunk in response_generator:
                    llm_response += chunk
            except Exception as e:
                logger.error(f"Error collecting LLM response: {str(e)}")
                raise

            logger.info(f"LLM response received, length: {len(llm_response)}")

            if llm_response:
                # Parse LLM response and create questions
                quiz_data = self._parse_quiz_response(llm_response)
                
                questions_created = 0
                for idx, q_data in enumerate(quiz_data.get('questions', [])):
                    question = QuizQuestion.objects.create(
                        quiz=quiz,
                        question_type=q_data.get('question_type', 'multiple_choice'),
                        question_text=q_data.get('question_text', ''),
                        order=idx + 1
                    )
                    questions_created += 1

                    # Create answers for the question
                    if q_data.get('question_type') == 'multiple_choice':
                        for ans_idx, option in enumerate(q_data.get('options', [])):
                            QuizAnswer.objects.create(
                                question=question,
                                answer_text=option.get('text', ''),
                                is_correct=(option.get('option') == q_data.get('correct_answer')),
                                order=ans_idx
                            )
                    elif q_data.get('question_type') == 'true_false':
                        QuizAnswer.objects.create(
                            question=question,
                            answer_text=q_data.get('correct_answer', ''),
                            is_correct=True,
                            order=0
                        )
                    elif q_data.get('question_type') == 'short_answer':
                        QuizAnswer.objects.create(
                            question=question,
                            answer_text=q_data.get('correct_answer', ''),
                            is_correct=True,
                            order=0
                        )

                if questions_created > 0:
                    quiz.generation_status = 'completed'
                    logger.info(f"Quiz generation completed with {questions_created} questions")
                else:
                    quiz.generation_status = 'failed'
                    logger.warning("Quiz generation failed: No questions were parsed from LLM response")
            else:
                quiz.generation_status = 'failed'
                logger.error("Quiz generation failed: Empty response from LLM")

            quiz.save()

            response_serializer = QuizSerializer(quiz)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except PDFDocument.DoesNotExist:
            return Response(
                {'error': 'PDF document not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error generating quiz: {str(e)}")
            if 'quiz' in locals():
                quiz.generation_status = 'failed'
                quiz.save()
            return Response(
                {'error': 'Failed to generate quiz', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _parse_quiz_response(self, response_text: str) -> dict:
        """Parse LLM response to extract quiz data"""
        try:
            # Try to extract JSON from the response
            # LLM might include extra text before/after JSON
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                logger.debug(f"Extracted JSON string: {json_str[:200]}...")
                
                # Clean up trailing commas (common LLM mistake)
                # Remove commas before closing brackets/braces
                json_str = re.sub(r',\s*}', '}', json_str)  # Remove trailing commas before }
                json_str = re.sub(r',\s*]', ']', json_str)  # Remove trailing commas before ]
                
                parsed_data = json.loads(json_str)
                
                # Validate that we have questions
                if 'questions' in parsed_data and isinstance(parsed_data['questions'], list):
                    logger.info(f"Successfully parsed {len(parsed_data['questions'])} questions from LLM response")
                    return parsed_data
                else:
                    logger.warning("Parsed JSON does not contain 'questions' list")
                    return {'questions': []}
            
            # If no valid JSON found, return empty structure
            logger.error("No JSON structure found in LLM response")
            logger.debug(f"Response text: {response_text[:500]}...")
            return {'questions': []}
        
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse quiz response as JSON: {str(e)}")
            logger.debug(f"Attempted to parse: {response_text[:500]}...")
            return {'questions': []}
