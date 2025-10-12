from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
import logging
from drf_spectacular.utils import extend_schema, OpenApiExample
from aws_llm.models import ChatConversation, ChatMessage
from aws_llm.serializers import (
    ChatConversationSerializer,
    ChatRequestSerializer, 
    ChatResponseSerializer, 
    ErrorResponseSerializer,
    ConversationsListSerializer,
)

logger = logging.getLogger(__name__)

from dotenv import load_dotenv

load_dotenv()


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
        
        # Get conversation ID from request or default to 1
        conversation_id = request_serializer.validated_data.get('conversation_id', 1)
        conversation = ChatConversation.objects.get(id=conversation_id, user_id=1)
        
        try:
            # Extract validated data
            message = request_serializer.validated_data['message']
            model = request_serializer.validated_data.get('model', 'gemma2:2b')
            stream = request_serializer.validated_data.get('stream', False)
            
            # Initialize AWS LLM client
          
            
            # Get conversation history and convert to LangChain message format
            message_queryset = ChatMessage.objects.filter(conversation=conversation).order_by('created_at')
            messages = []
            
            # Add system message to encourage markdown formatting
            system_message = SystemMessage(content="""You are a helpful AI assistant. When responding, please use markdown formatting to make your responses more readable and well-structured. Use:

- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- `inline code` for code snippets
- ```language code blocks``` for multi-line code
- # Headers for organizing content
- - Bullet points for lists
- 1. Numbered lists for steps
- > Blockquotes for important information
- [Links](url) for references
- Tables for structured data

This will make your responses much more readable and professional.""")
            messages.append(system_message)
            
            for msg in message_queryset:
                if msg.role == 'user':
                    messages.append(HumanMessage(content=msg.message))
                elif msg.role == 'assistant':
                    messages.append(AIMessage(content=msg.message))
            
            # Add the current user message to the conversation
            messages.append(HumanMessage(content=message))
            
            logger.info(f"Prepared {len(messages)} messages for conversation {conversation.id}")
        
            # Initialize Google Generative AI client
            client = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=settings.GOOGLE_API_KEY
            )
            
            # Get response from Google Generative AI with conversation history
            try:
                if stream:
                    # Handle streaming response with history
                    response_generator = client.stream(messages)
                    response_text = ''.join([chunk.content for chunk in response_generator if hasattr(chunk, 'content')])
                else:
                    # Handle non-streaming response with history
                    response = client.invoke(messages)
                    response_text = response.content if hasattr(response, 'content') else str(response)
                
                logger.info(f"Successfully got response from Google Generative AI. Response length: {len(response_text)}")
                
            except Exception as e:
                logger.error(f"Error invoking Google Generative AI: {str(e)}")
                return Response(
                    {'error': f'Error processing chat request: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
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
    def get(self, request, conversation_id=None):
        """
        Handle GET requests for conversation history
        Returns conversation with user_id=1 and specified conversation_id
        """
        try:
            # Get conversation ID from URL parameter or default to 1
            conv_id = conversation_id or request.GET.get('conversation_id', 1)
            
            # Get specific conversation with user_id=1 and specified conversation_id
            conversation = ChatConversation.objects.get(id=conv_id, user_id=1)
            
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


class ConversationsListView(APIView):
    """
    REST API endpoint to retrieve all conversations
    """
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id='get_conversations',
        summary='Get all conversations',
        description='Retrieve a list of all conversations with summary information',
        responses={
            200: ConversationsListSerializer,
            500: ErrorResponseSerializer,
        },
        tags=['Conversations']
    )
    def get(self, request):
        """
        Handle GET requests for all conversations
        """
        try:
            # Get all conversations with message count
            conversations = ChatConversation.objects.all().order_by('-created_at')
            
            # Create conversations data manually
            conversations_data = []
            for conversation in conversations:
                # Get message count
                message_count = ChatMessage.objects.filter(conversation=conversation).count()
                
                # Get last message
                last_msg = ChatMessage.objects.filter(conversation=conversation).order_by('-created_at').first()
                last_message = None
                if last_msg:
                    last_message = {
                        'content': last_msg.message[:100] + '...' if len(last_msg.message) > 100 else last_msg.message,
                        'role': last_msg.role,
                        'timestamp': last_msg.created_at,
                    }
                
                conversation_data = {
                    'id': conversation.id,
                    'user_username': conversation.user.username if hasattr(conversation, 'user') and conversation.user else 'Unknown',
                    'created_at': conversation.created_at,
                    'message_count': message_count,
                    'last_message': last_message
                }
                conversations_data.append(conversation_data)
            
            # Create response data
            response_data = {
                'conversations': conversations_data,
                'total': len(conversations_data)
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error retrieving conversations: {str(e)}")
            
            error_data = {
                'error': 'Internal server error',
                'details': str(e),
                'timestamp': timezone.now()
            }
            
            error_serializer = ErrorResponseSerializer(data=error_data)
            error_serializer.is_valid()
            return Response(error_serializer.data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)