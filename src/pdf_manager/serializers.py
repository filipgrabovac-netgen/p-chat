from rest_framework import serializers
from .models import PDFDocument, Quiz, QuizQuestion, QuizAnswer


class PDFDocumentSerializer(serializers.ModelSerializer):
    """Serializer for PDF documents"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = PDFDocument
        fields = [
            'id', 'user', 'user_username', 'title', 'file', 'file_size',
            'extracted_text', 'page_count', 'processing_status',
            'error_message', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'file_size', 'extracted_text', 'page_count',
            'processing_status', 'error_message', 'created_at', 'updated_at'
        ]


class PDFDocumentListSerializer(serializers.ModelSerializer):
    """Serializer for listing PDF documents (summary view)"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    quiz_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PDFDocument
        fields = [
            'id', 'user_username', 'title', 'file_size', 'page_count',
            'processing_status', 'quiz_count', 'created_at'
        ]
    
    def get_quiz_count(self, obj):
        """Get the number of quizzes generated from this PDF"""
        return obj.quizzes.count()


class PDFUploadSerializer(serializers.Serializer):
    """Serializer for PDF upload requests"""
    file = serializers.FileField(help_text="PDF file to upload")
    title = serializers.CharField(
        max_length=255,
        required=False,
        help_text="Optional title for the PDF document"
    )

    def validate_file(self, value):
        """Validate the uploaded file"""
        # Check file extension
        if not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError("Only PDF files are allowed")
        
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 10MB")
        
        return value


class QuizAnswerSerializer(serializers.ModelSerializer):
    """Serializer for quiz answers"""
    class Meta:
        model = QuizAnswer
        fields = ['id', 'answer_text', 'is_correct', 'order']


class QuizQuestionSerializer(serializers.ModelSerializer):
    """Serializer for quiz questions"""
    answers = QuizAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_type', 'question_text', 'order', 'answers']


class QuizSerializer(serializers.ModelSerializer):
    """Serializer for quizzes"""
    questions = QuizQuestionSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    pdf_title = serializers.CharField(source='pdf_document.title', read_only=True, allow_null=True)
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'user', 'user_username', 'pdf_document', 'pdf_title',
            'title', 'source_text', 'difficulty_level', 'num_questions',
            'generation_status', 'questions', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'generation_status', 'created_at', 'updated_at'
        ]


class QuizListSerializer(serializers.ModelSerializer):
    """Serializer for listing quizzes (summary view)"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    pdf_title = serializers.CharField(source='pdf_document.title', read_only=True, allow_null=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'user_username', 'pdf_title', 'title',
            'difficulty_level', 'num_questions', 'question_count',
            'generation_status', 'created_at'
        ]
    
    def get_question_count(self, obj):
        """Get the actual number of questions in the quiz"""
        return obj.questions.count()


class QuizGenerationRequestSerializer(serializers.Serializer):
    """Serializer for quiz generation requests"""
    pdf_document_id = serializers.IntegerField(
        required=False,
        help_text="ID of the PDF document to generate quiz from"
    )
    source_text = serializers.CharField(
        required=False,
        help_text="Custom text to generate quiz from (if not using PDF)"
    )
    title = serializers.CharField(
        max_length=255,
        required=False,
        default="Generated Quiz",
        help_text="Title for the quiz"
    )
    difficulty_level = serializers.ChoiceField(
        choices=['easy', 'medium', 'hard'],
        default='medium',
        help_text="Difficulty level of the quiz"
    )
    num_questions = serializers.IntegerField(
        min_value=1,
        max_value=20,
        default=5,
        help_text="Number of questions to generate"
    )
    question_types = serializers.ListField(
        child=serializers.ChoiceField(choices=['multiple_choice', 'true_false', 'short_answer']),
        default=['multiple_choice', 'true_false'],
        help_text="Types of questions to generate"
    )

    def validate(self, data):
        """Validate that either pdf_document_id or source_text is provided"""
        pdf_id = data.get('pdf_document_id')
        source_text = data.get('source_text')
        
        if not pdf_id and not source_text:
            raise serializers.ValidationError(
                "Either 'pdf_document_id' or 'source_text' must be provided"
            )
        
        if pdf_id and source_text:
            raise serializers.ValidationError(
                "Cannot provide both 'pdf_document_id' and 'source_text'"
            )
        
        return data


class ErrorResponseSerializer(serializers.Serializer):
    """Serializer for error responses"""
    error = serializers.CharField(help_text="Error message")
    details = serializers.CharField(
        required=False,
        help_text="Additional error details"
    )

