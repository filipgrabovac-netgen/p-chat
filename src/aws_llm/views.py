from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
import logging
from drf_spectacular.utils import extend_schema, OpenApiExample
from aws_llm.models import ChatConversation, ChatMessage
from aws_llm.utils.llm_wrapper import AWSLLMWrapper
from aws_llm.serializers import (
    ChatConversationSerializer,
    ChatRequestSerializer, 
    ChatResponseSerializer, 
    ErrorResponseSerializer
)

logger = logging.getLogger(__name__)


class ChatResponseView(APIView):
    """
    REST API endpoint for chat responses using AWS LLM
    """
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id='chat_response',
        summary='Send a message to the AI assistant',
        description='Send a message to the AI assistant and receive a response using AWS-hosted LLM',
        request=ChatRequestSerializer,
        responses={
            200: ChatResponseSerializer,
            400: ErrorResponseSerializer,
            500: ErrorResponseSerializer,
        },
        examples=[
            OpenApiExample(
                'Basic Chat Request',
                summary='Basic chat request',
                description='Send a simple message to the AI assistant',
                value={
                    'message': 'Hello, how are you today?',
                    'model': 'gemma2:2b',
                    'stream': False
                },
                request_only=True,
            ),
            OpenApiExample(
                'Streaming Request',
                summary='Streaming chat request',
                description='Request a streaming response from the AI',
                value={
                    'message': 'Tell me a story about space exploration',
                    'model': 'gemma2:2b',
                    'stream': True
                },
                request_only=True,
            ),
        ],
        tags=['Chat']
    )
    def post(self, request):
        """
        Handle POST requests for chat responses
        """
        # Validate incoming request
        request_serializer = ChatRequestSerializer(data=request.data)
        conversation = ChatConversation.objects.get(id=1, user_id=1)
        
        if not request_serializer.is_valid():
            error_serializer = ErrorResponseSerializer(data={
                'error': 'Invalid request data',
                'details': request_serializer.errors,
                'timestamp': timezone.now()
            })
            error_serializer.is_valid()
            return Response(error_serializer.data, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Extract validated data
            message = request_serializer.validated_data['message']
            model = request_serializer.validated_data.get('model', 'gemma2:2b')
            stream = request_serializer.validated_data.get('stream', False)
            
            # Initialize AWS LLM client
            client = AWSLLMWrapper(model=model, stream=stream)
            
            # Get conversation history and convert to list format
            message_queryset = ChatMessage.objects.filter(conversation=conversation).order_by('created_at')
            messages = []
            for msg in message_queryset:
                messages.append({
                    'role': msg.role,
                    'content': msg.message
                })
            
            # Add the new user message
            messages.append({
                'role': 'user',
                'content': message
            })
            
            # Get response from AWS LLM with conversation history
            if stream:
                # Handle streaming response with history
                response_generator = client.invoke_with_history(messages)
                response_text = ''.join(response_generator)
            else:
                # Handle non-streaming response with history
                response_generator = client.invoke_with_history(messages)
                response_text = next(response_generator)
            
            # Save the new user message to database
            user_message = ChatMessage.objects.create(
                conversation=conversation,
                message=message,
                role='user'
            )
            
            # Save the assistant response to database
            assistant_message = ChatMessage.objects.create(
                conversation=conversation,
                message=response_text,
                role='assistant'
            )
            
            # Create response data
            response_data = {
                'response': response_text,
                'model_used': model,
                'timestamp': timezone.now(),
                'success': True,
                'conversation_id': conversation.id,
                'user_message_id': user_message.id,
                'assistant_message_id': assistant_message.id
            }
            
            # Validate response data
            response_serializer = ChatResponseSerializer(data=response_data)
            if response_serializer.is_valid():
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            else:
                logger.error(f"Response serialization failed: {response_serializer.errors}")
                raise Exception("Response serialization failed")
                
        except Exception as e:
            logger.error(f"Error processing chat request: {str(e)}")
            
            error_data = {
                'error': 'Internal server error', 
                'details': str(e),
                'timestamp': timezone.now()
            }
            
            error_serializer = ErrorResponseSerializer(data=error_data)
            error_serializer.is_valid()
            return Response(error_serializer.data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ChatHistoryView(APIView):
    """
    REST API endpoint to retrieve conversation history
    """ 
    permission_classes = [AllowAny]

    @extend_schema(
        summary='Get chat history',
        description='Get chat history for a user',
        responses={
            200: ChatConversationSerializer,
            404: ErrorResponseSerializer,
        },
        tags=['Chat']
    )
    def get(self, request):
        """
        Handle GET requests for conversation history
        Returns only conversation with user_id=1 and conversation_id=1
        """
        try:
            # Get specific conversation with user_id=1 and conversation_id=1
            conversation = ChatConversation.objects.get(id=1, user_id=1)
            
            # Get all messages for this specific conversation
            messages = ChatMessage.objects.filter(conversation=conversation).order_by('created_at')
            
            # Format messages for response
            message_data = []
            for msg in messages:
                message_data.append({
                    'id': msg.id,
                    'role': msg.role,
                    'content': msg.message,
                    'timestamp': msg.created_at,
                })
            
            # Format conversation data
            # Use the serializer to format the response
            conversation_serializer = ChatConversationSerializer(conversation)
            
            response_data = {
                'conversation': conversation_serializer.data,
                'timestamp': timezone.now(),
                'success': True
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except ChatConversation.DoesNotExist:
            error_data = {
                'error': 'Conversation not found',
                'details': 'Conversation with ID 1 and user ID 1 does not exist',
                'timestamp': timezone.now()
            }
            error_serializer = ErrorResponseSerializer(data=error_data)
            error_serializer.is_valid()
            return Response(error_serializer.data, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            logger.error(f"Error retrieving conversation history: {str(e)}")
            
            error_data = {
                'error': 'Internal server error',
                'details': str(e),
                'timestamp': timezone.now()
            }

            print(e)
            
            error_serializer = ErrorResponseSerializer(data=error_data)
            error_serializer.is_valid()
            return Response(error_serializer.data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)