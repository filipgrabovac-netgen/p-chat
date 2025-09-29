from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
import logging
from drf_spectacular.utils import extend_schema, OpenApiResponse
from aws_llm.models import ChatConversation, ChatMessage
from aws_llm.serializers import (
    ConversationCreateSerializer,
    ConversationCreateResponseSerializer,
    ErrorResponseSerializer
)

logger = logging.getLogger(__name__)


class ConversationCreateView(APIView):
    """
    REST API endpoint for creating new conversations
    """
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id='create_conversation',
        summary='Create a new conversation',
        description='Create a new conversation for the current user (hardcoded to user_id=1)',
        request=ConversationCreateSerializer,
        responses={
            201: ConversationCreateResponseSerializer,
            400: ErrorResponseSerializer,
            500: ErrorResponseSerializer,
        },
        tags=['Conversations']
    )
    def post(self, request):
        """
        Handle POST requests for creating new conversations
        """
        try:
            # Validate incoming request
            request_serializer = ConversationCreateSerializer(data=request.data)
            
            if not request_serializer.is_valid():
                error_serializer = ErrorResponseSerializer(data={
                    'error': 'Invalid request data',
                    'details': request_serializer.errors,
                    'timestamp': timezone.now()
                })
                error_serializer.is_valid()
                return Response(error_serializer.data, status=status.HTTP_400_BAD_REQUEST)
            
            # Get validated data
            title = request_serializer.validated_data.get('title', 'New Conversation')
            
            # Get or create user (hardcoded to user_id=1)
            from django.contrib.auth.models import User
            user, created = User.objects.get_or_create(id=1, defaults={'username': 'test_user'})
            
            # Create new conversation
            conversation = ChatConversation.objects.create(
                user=user,
                title=title
            )
            
            # Get message count (should be 0 for new conversation)
            message_count = ChatMessage.objects.filter(conversation=conversation).count()
            
            # Create response data
            response_data = {
                'id': conversation.id,
                'user_id': conversation.user.id,
                'created_at': conversation.created_at,
                'title': conversation.title,
                'message_count': message_count,
                'success': True
            }
            
            # Validate response data
            response_serializer = ConversationCreateResponseSerializer(data=response_data)
            if response_serializer.is_valid():
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Response serialization failed: {response_serializer.errors}")
                raise Exception("Response serialization failed")
                
        except Exception as e:
            logger.error(f"Error creating conversation: {str(e)}")
            
            error_data = {
                'error': 'Internal server error',
                'details': str(e),
                'timestamp': timezone.now()
            }
            
            error_serializer = ErrorResponseSerializer(data=error_data)
            error_serializer.is_valid()
            return Response(error_serializer.data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConversationDeleteView(APIView):
    """
    REST API endpoint for deleting conversations
    """
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id='delete_conversation',
        summary='Delete a conversation',
        description='Delete a specific conversation by ID (hardcoded to user_id=1)',
        responses={
            204: OpenApiResponse(description='Conversation deleted successfully'),
            404: ErrorResponseSerializer,
            500: ErrorResponseSerializer,
        },
        tags=['Conversations']
    )
    def delete(self, request, conversation_id):
        """
        Handle DELETE requests for deleting conversations
        """
        try:
            # Get the conversation (hardcoded to user_id=1)
            try:
                conversation = ChatConversation.objects.get(id=conversation_id, user_id=1)
            except ChatConversation.DoesNotExist:
                error_data = {
                    'error': 'Conversation not found',
                    'details': f'Conversation with ID {conversation_id} does not exist or does not belong to user',
                    'timestamp': timezone.now()
                }
                error_serializer = ErrorResponseSerializer(data=error_data)
                error_serializer.is_valid()
                return Response(error_serializer.data, status=status.HTTP_404_NOT_FOUND)
            
            # Delete the conversation (this will cascade delete all messages)
            conversation.delete()
            
            # Return 204 No Content on successful deletion
            return Response(status=status.HTTP_204_NO_CONTENT)
                
        except Exception as e:
            logger.error(f"Error deleting conversation: {str(e)}")
            
            error_data = {
                'error': 'Internal server error',
                'details': str(e),
                'timestamp': timezone.now()
            }
            
            error_serializer = ErrorResponseSerializer(data=error_data)
            error_serializer.is_valid()
            return Response(error_serializer.data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
