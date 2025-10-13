from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .models import Folder
from .serializers import FolderSerializer, FolderListSerializer, FolderCreateUpdateSerializer


class FolderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for folder operations
    Provides CRUD operations for organizing quizzes into folders
    """
    queryset = Folder.objects.all()
    permission_classes = [AllowAny]  # TODO: Add proper authentication
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return FolderListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return FolderCreateUpdateSerializer
        return FolderSerializer
    
    def get_queryset(self):
        """Filter folders by user (hardcoded to user ID 1 for now)"""
        # TODO: Replace with proper authentication
        return Folder.objects.filter(user_id=1).order_by('name')
    
    def perform_create(self, serializer):
        """Set the user when creating a folder"""
        # TODO: Replace with proper authentication
        user_id = 1
        from django.contrib.auth.models import User
        user = User.objects.get(id=user_id)
        serializer.save(user=user)
    
    @extend_schema(
        operation_id='list_folders',
        summary='List all folders',
        description='Get a list of all folders for the authenticated user',
        responses={
            200: FolderListSerializer(many=True),
        },
        tags=['Folders']
    )
    def list(self, request, *args, **kwargs):
        """List all folders for the user"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        operation_id='create_folder',
        summary='Create a new folder',
        description='Create a new folder for organizing quizzes',
        request=FolderCreateUpdateSerializer,
        responses={
            201: FolderSerializer,
            400: {'description': 'Validation error'},
        },
        tags=['Folders']
    )
    def create(self, request, *args, **kwargs):
        """Create a new folder"""
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        operation_id='get_folder',
        summary='Get folder details',
        description='Get detailed information about a specific folder',
        responses={
            200: FolderSerializer,
            404: {'description': 'Folder not found'},
        },
        tags=['Folders']
    )
    def retrieve(self, request, *args, **kwargs):
        """Get folder details"""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        operation_id='update_folder',
        summary='Update folder',
        description='Update folder information',
        request=FolderCreateUpdateSerializer,
        responses={
            200: FolderSerializer,
            400: {'description': 'Validation error'},
            404: {'description': 'Folder not found'},
        },
        tags=['Folders']
    )
    def update(self, request, *args, **kwargs):
        """Update folder"""
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        operation_id='partial_update_folder',
        summary='Partially update folder',
        description='Partially update folder information',
        request=FolderCreateUpdateSerializer,
        responses={
            200: FolderSerializer,
            400: {'description': 'Validation error'},
            404: {'description': 'Folder not found'},
        },
        tags=['Folders']
    )
    def partial_update(self, request, *args, **kwargs):
        """Partially update folder"""
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(
        operation_id='delete_folder',
        summary='Delete folder',
        description='Delete a folder. Quizzes in this folder will have their folder set to null.',
        responses={
            204: {'description': 'Folder deleted successfully'},
            404: {'description': 'Folder not found'},
        },
        tags=['Folders']
    )
    def destroy(self, request, *args, **kwargs):
        """Delete folder"""
        return super().destroy(request, *args, **kwargs)
    
    @extend_schema(
        operation_id='get_folder_quizzes',
        summary='Get quizzes in folder',
        description='Get all quizzes that belong to a specific folder',
        responses={
            200: {'description': 'List of quizzes in the folder'},
            404: {'description': 'Folder not found'},
        },
        tags=['Folders']
    )
    @action(detail=True, methods=['get'])
    def quizzes(self, request, pk=None):
        """Get all quizzes in this folder"""
        folder = self.get_object()
        
        # Import here to avoid circular imports
        from pdf_manager.models import Quiz
        from pdf_manager.serializers import QuizListSerializer
        
        quizzes = Quiz.objects.filter(folder=folder, user_id=1).order_by('-created_at')
        serializer = QuizListSerializer(quizzes, many=True)
        
        return Response(serializer.data)