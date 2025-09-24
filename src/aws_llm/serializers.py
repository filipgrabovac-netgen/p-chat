from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    """
    Serializer for incoming chat requests
    """
    message = serializers.CharField(
        max_length=4000,
        help_text="The user's message to the AI assistant"
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
