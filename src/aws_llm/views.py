from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
import logging
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes

from aws_llm.utils.llm_wrapper import AWSLLMWrapper
from aws_llm.serializers import (
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
            
            # Get response from AWS LLM
            if stream:
                # Handle streaming response
                response_generator = client.invoke(message)
                response_text = ''.join(response_generator)
            else:
                # Handle non-streaming response
                response_generator = client.invoke(message)
                response_text = next(response_generator)
            
            # Create response data
            response_data = {
                'response': response_text,
                'model_used': model,
                'timestamp': timezone.now(),
                'success': True
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
