from django.contrib import admin
from .models import PDFDocument, Quiz, QuizQuestion, QuizAnswer


@admin.register(PDFDocument)
class PDFDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'processing_status', 'page_count', 'created_at']
    list_filter = ['processing_status', 'created_at']
    search_fields = ['title', 'user__username']
    readonly_fields = ['created_at', 'updated_at', 'file_size', 'page_count']


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'difficulty_level', 'num_questions', 'generation_status', 'created_at']
    list_filter = ['generation_status', 'difficulty_level', 'created_at']
    search_fields = ['title', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [QuizQuestionInline]


class QuizAnswerInline(admin.TabularInline):
    model = QuizAnswer
    extra = 0


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'quiz', 'question_type', 'order']
    list_filter = ['question_type', 'quiz']
    search_fields = ['question_text', 'quiz__title']
    inlines = [QuizAnswerInline]


@admin.register(QuizAnswer)
class QuizAnswerAdmin(admin.ModelAdmin):
    list_display = ['answer_text', 'question', 'is_correct', 'order']
    list_filter = ['is_correct']
    search_fields = ['answer_text', 'question__question_text']
