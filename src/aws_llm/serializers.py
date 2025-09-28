from rest_framework import serializers
from .models import ChatMessage

from aws_llm.models import ChatConversation


class MessageSerializer(serializers.Serializer):
    """
    Serializer for individual messages in conversation
    """
    role = serializers.ChoiceField(
        choices=['user', 'assistant'],
        help_text="The role of the message sender"
    )
    content = serializers.CharField(
        max_length=4000,
        help_text="The content of the message"
    )

    def validate_content(self, value):
        """Validate that the content is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Message content cannot be empty")
        return value.strip()


class ChatRequestSerializer(serializers.Serializer):
    """
    Serializer for incoming chat requests
    """
    message = serializers.CharField(
        max_length=4000,
        required=False,
        help_text="The user's message to the AI assistant (legacy field)"
    )
    model = serializers.CharField(
        max_length=100,
        required=False,
        default="gemma2:2b",
        help_text="The AI model to use for the response"
    )
    stream = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Whether to stream the response"
    )

    def validate(self, data):
        """Validate that either message or messages is provided, but not both"""
        message = data.get('message')
        messages = data.get('messages')
        
        if not message and not messages:
            raise serializers.ValidationError("Either 'message' or 'messages' must be provided")
        
        if message and messages:
            raise serializers.ValidationError("Cannot provide both 'message' and 'messages'")
        
        if message:
            if not message.strip():
                raise serializers.ValidationError("Message cannot be empty")
            data['message'] = message.strip()
        
        if messages:
            if not messages:
                raise serializers.ValidationError("Messages list cannot be empty")
            # Ensure the last message is from the user
            if messages[-1]['role'] != 'user':
                raise serializers.ValidationError("Last message must be from user")
        
        return data

    def validate_message(self, value):
        """Validate that the message is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty")
        return value.strip()


class ChatResponseSerializer(serializers.Serializer):
    """
    Serializer for chat responses
    """
    response = serializers.CharField(
        help_text="The AI assistant's response"
    )
    model_used = serializers.CharField(
        help_text="The model that was used to generate the response"
    )
    timestamp = serializers.DateTimeField(
        help_text="When the response was generated"
    )
    success = serializers.BooleanField(
        help_text="Whether the request was successful"
    )


class ErrorResponseSerializer(serializers.Serializer):
    """
    Serializer for error responses
    """
    error = serializers.CharField(
        help_text="Error message"
    )
    details = serializers.CharField(
        required=False,
        help_text="Additional error details"
    )
    timestamp = serializers.DateTimeField(
        help_text="When the error occurred"
    )



class ChatConversationSerializer(serializers.ModelSerializer):
    """
    Serializer for chat conversations
    """
    messages = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatConversation
        fields = ['id', 'user_id', 'created_at', 'messages']
    
    def get_messages(self, obj):
        """Get all messages for this conversation"""
        messages = ChatMessage.objects.filter(conversation=obj).order_by('created_at')
        return [
            {
                'id': msg.id,
                'role': msg.role,
                'content': msg.message,
                'timestamp': msg.created_at,
            }
            for msg in messages
        ]