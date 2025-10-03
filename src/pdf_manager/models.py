from django.db import models
from django.contrib.auth.models import User


class PDFDocument(models.Model):
    """Model to store uploaded PDF documents"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pdf_documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='pdfs/%Y/%m/%d/')
    file_size = models.IntegerField(help_text="File size in bytes")
    extracted_text = models.TextField(blank=True, null=True, help_text="Extracted text from PDF")
    page_count = models.IntegerField(default=0)
    processing_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"


class Quiz(models.Model):
    """Model to store generated quizzes"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quizzes')
    pdf_document = models.ForeignKey(
        PDFDocument,
        on_delete=models.CASCADE,
        related_name='quizzes',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    source_text = models.TextField(help_text="Text used to generate quiz")
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
        ],
        default='medium'
    )
    num_questions = models.IntegerField(default=5)
    generation_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('generating', 'Generating'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"


class QuizQuestion(models.Model):
    """Model to store individual quiz questions"""
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(
        max_length=20,
        choices=[
            ('multiple_choice', 'Multiple Choice'),
            ('true_false', 'True/False'),
            ('short_answer', 'Short Answer'),
        ]
    )
    question_text = models.TextField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"


class QuizAnswer(models.Model):
    """Model to store answer options for quiz questions"""
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='answers')
    answer_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.answer_text[:50]} ({'Correct' if self.is_correct else 'Incorrect'})"
