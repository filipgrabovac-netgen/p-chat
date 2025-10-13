"""
ViewSets for PDF document and Quiz management
"""
import logging
import os
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
    QuestionGeneratorOutput,
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

    @extend_schema(
        operation_id='delete_pdf',
        summary='Delete a PDF document',
        description='Delete a PDF document and all associated quizzes',
        responses={
            204: None,
            404: ErrorResponseSerializer,
            500: ErrorResponseSerializer,
        },
        tags=['PDF Documents']
    )
    def destroy(self, request, pk=None):
        """Delete a PDF document and its associated file"""
        try:
            pdf_document = self.get_object()
            
            # Delete associated quizzes first
            associated_quizzes = Quiz.objects.filter(pdf_document=pdf_document)
            quiz_count = associated_quizzes.count()
            associated_quizzes.delete()
            
            # Delete the file from storage
            if pdf_document.file:
                try:
                    if os.path.isfile(pdf_document.file.path):
                        os.remove(pdf_document.file.path)
                        logger.info(f"Deleted file: {pdf_document.file.path}")
                except Exception as e:
                    logger.warning(f"Could not delete file {pdf_document.file.path}: {str(e)}")
            
            # Delete the PDF document record
            pdf_document.delete()
            
            logger.info(f"Deleted PDF document {pk} and {quiz_count} associated quizzes")
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except PDFDocument.DoesNotExist:
            return Response(
                {'error': 'PDF document not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting PDF document {pk}: {str(e)}")
            return Response(
                {'error': 'Failed to delete PDF document', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
        """Filter quizzes by user and optionally by folder"""
        # TODO: Replace with proper authentication
        queryset = Quiz.objects.filter(user_id=1).order_by('-created_at')
        
        # Filter by folder if provided
        folder_id = self.request.query_params.get('folder', None)
        if folder_id:
            try:
                queryset = queryset.filter(folder_id=folder_id)
            except ValueError:
                # Invalid folder_id format
                pass
        
        return queryset

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
                folder=serializer.validated_data.get('folder'),
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

            # Generate quiz using LLM with structured output
            logger.info(f"Generating quiz with {quiz.num_questions} questions at {quiz.difficulty_level} difficulty")
            
            # Check if Google API key is configured
            if not os.getenv('GOOGLE_API_KEY'):
                logger.error("GOOGLE_API_KEY environment variable is not set")
                quiz.generation_status = 'failed'
                quiz.save()
                return Response(
                    {'error': 'Google API key is not configured. Please set GOOGLE_API_KEY environment variable.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            try:
                # Use Google Gemini with PydanticOutputParser
                from langchain_core.output_parsers import PydanticOutputParser
                
                parser = PydanticOutputParser(pydantic_object=QuestionGeneratorOutput)
                format_instructions = parser.get_format_instructions()
                full_prompt = f"{prompt}\n\n{format_instructions}"
                
                logger.info("Invoking Gemini for quiz generation...")
                google_client = GoogleGenerativeAI(model="gemini-2.5-flash")
                llm_response = google_client.invoke(full_prompt)
                
                logger.info("LLM response received, parsing structured output...")
                structured_response = parser.parse(llm_response)
                logger.info(f"Structured response parsed with {len(structured_response.questions)} questions")

                # Create questions from structured response
                questions_created = 0
                for idx, q_data in enumerate(structured_response.questions):
                    question = QuizQuestion.objects.create(
                        quiz=quiz,
                        question_type=q_data.question_type,
                        question_text=q_data.question_text,
                        order=idx + 1
                    )
                    questions_created += 1

                    # Create answers for the question
                    if q_data.question_type == 'multiple_choice':
                        for ans_idx, option in enumerate(q_data.options):
                            QuizAnswer.objects.create(
                                question=question,
                                answer_text=option.text,
                                is_correct=(option.option == q_data.correct_answer),
                                order=ans_idx
                            )
                    elif q_data.question_type == 'true_false':
                        # Create both True and False options for true/false questions
                        QuizAnswer.objects.create(
                            question=question,
                            answer_text='True',
                            is_correct=(q_data.correct_answer.lower() == 'true'),
                            order=0
                        )
                        QuizAnswer.objects.create(
                            question=question,
                            answer_text='False',
                            is_correct=(q_data.correct_answer.lower() == 'false'),
                            order=1
                        )
                    elif q_data.question_type == 'short_answer':
                        QuizAnswer.objects.create(
                            question=question,
                            answer_text=q_data.correct_answer,
                            is_correct=True,
                            order=0
                        )

                if questions_created > 0:
                    quiz.generation_status = 'completed'
                    logger.info(f"Quiz generation completed with {questions_created} questions")
                else:
                    quiz.generation_status = 'failed'
                    logger.warning("Quiz generation failed: No questions were generated")
                
                quiz.save()
                
            except Exception as llm_error:
                import traceback
                error_traceback = traceback.format_exc()
                logger.error(f"Error during LLM invocation: {str(llm_error)}")
                logger.error(f"Traceback: {error_traceback}")
                quiz.generation_status = 'failed'
                quiz.save()
            
                raise

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
                {'error': 'Failed to generate quiz', 'details': str(os.getenv('GOOGLE_API_KEY'))},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

