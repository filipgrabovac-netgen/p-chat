from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PDFDocumentViewSet, QuizViewSet

app_name = 'pdf_manager'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'pdfs', PDFDocumentViewSet, basename='pdf')
router.register(r'quizzes', QuizViewSet, basename='quiz')

urlpatterns = [
    path('', include(router.urls)),
]

