# Task: Create Conversation CRUD Endpoints

## Description

Create REST API endpoints for creating and deleting conversations for the current user (hardcoded to user_id=1). This will extend the existing conversation functionality to allow users to manage their conversations.

## Requirements

- **Create Endpoint**: POST `/api/aws-llm/conversations/` - Create a new conversation
- **Delete Endpoint**: DELETE `/api/aws-llm/conversations/{id}/` - Delete a specific conversation
- **User Association**: Hardcode to user_id=1 for current implementation
- **Error Handling**: Implement proper error handling for all scenarios
- **Response Format**: Follow existing API patterns and serializers
- **Documentation**: Include OpenAPI/Swagger documentation

## Implementation Details

### 1. Create Conversation Endpoint

#### Endpoint: `POST /api/aws-llm/conversations/`

**Request Body:**
```json
{
  "title": "New Conversation" // Optional, defaults to "New Conversation"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "user_id": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "title": "New Conversation",
  "message_count": 0,
  "success": true
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid request data",
  "details": {
    "title": ["This field is required."]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 2. Delete Conversation Endpoint

#### Endpoint: `DELETE /api/aws-llm/conversations/{id}/`

**Response (204 No Content):**
- Empty response body on successful deletion

**Response (404 Not Found):**
```json
{
  "error": "Conversation not found",
  "details": "Conversation with ID {id} does not exist or does not belong to user",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Internal server error",
  "details": "Error message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Technical Implementation

### 1. URL Configuration

**File:** `src/aws_llm/urls.py`

Add new URL patterns:
```python
urlpatterns = [
    path('chat/', views.ChatResponseView.as_view(), name='chat_response'),
    path('chat/history/', views.ChatHistoryView.as_view(), name='chat_history'),
    path('conversations/', views.ConversationsListView.as_view(), name='conversations_list'),
    path('conversations/', views.ConversationCreateView.as_view(), name='conversation_create'),
    path('conversations/<int:conversation_id>/', views.ConversationDeleteView.as_view(), name='conversation_delete'),
]
```

### 2. View Classes

**File:** `src/aws_llm/views.py`

#### ConversationCreateView
```python
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
        # Implementation details below
```

#### ConversationDeleteView
```python
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
        # Implementation details below
```

### 3. Serializers

**File:** `src/aws_llm/serializers.py`

Add new serializers:
```python
class ConversationCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, required=False, default="New Conversation")

class ConversationCreateResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    user_id = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    title = serializers.CharField()
    message_count = serializers.IntegerField()
    success = serializers.BooleanField()
```

### 4. Model Updates

**File:** `src/aws_llm/models.py`

Add title field to ChatConversation model:
```python
class ChatConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, default="New Conversation")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation {self.id}: {self.title}"
```

### 5. Database Migration

Create and run migration for the new title field:
```bash
python manage.py makemigrations aws_llm
python manage.py migrate
```

## Implementation Steps

### Step 1: Update Models
- [ ] Add `title` field to `ChatConversation` model
- [ ] Create and run database migration
- [ ] Update model `__str__` method

### Step 2: Create Serializers
- [ ] Add `ConversationCreateSerializer`
- [ ] Add `ConversationCreateResponseSerializer`
- [ ] Update existing serializers if needed

### Step 3: Implement Views
- [ ] Create `ConversationCreateView` class
- [ ] Create `ConversationDeleteView` class
- [ ] Implement proper error handling
- [ ] Add OpenAPI documentation

### Step 4: Update URLs
- [ ] Add new URL patterns to `urls.py`
- [ ] Test URL routing

### Step 5: Testing
- [ ] Test conversation creation endpoint
- [ ] Test conversation deletion endpoint
- [ ] Test error scenarios
- [ ] Test with existing conversation data

## Error Handling Scenarios

### Create Conversation Errors
- **400 Bad Request**: Invalid request data
- **500 Internal Server Error**: Database errors, server issues

### Delete Conversation Errors
- **404 Not Found**: Conversation doesn't exist or doesn't belong to user
- **500 Internal Server Error**: Database errors, server issues

## Security Considerations

- **User Isolation**: Ensure users can only delete their own conversations
- **Input Validation**: Validate all input data
- **SQL Injection**: Use Django ORM to prevent SQL injection
- **Rate Limiting**: Consider implementing rate limiting for create/delete operations

## Testing Scenarios

### Create Conversation Tests
- [ ] **Valid Request**: Create conversation with valid data
- [ ] **Default Title**: Create conversation without title (should use default)
- [ ] **Custom Title**: Create conversation with custom title
- [ ] **Invalid Data**: Test with invalid request data
- [ ] **Server Error**: Test database connection issues

### Delete Conversation Tests
- [ ] **Valid Deletion**: Delete existing conversation
- [ ] **Non-existent ID**: Try to delete non-existent conversation
- [ ] **Wrong User**: Try to delete conversation belonging to different user
- [ ] **Server Error**: Test database connection issues

## API Documentation

### OpenAPI/Swagger Documentation
- [ ] Document all endpoints with examples
- [ ] Include request/response schemas
- [ ] Add error response examples
- [ ] Update API documentation

## Success Criteria

- [ ] POST `/api/aws-llm/conversations/` creates new conversations
- [ ] DELETE `/api/aws-llm/conversations/{id}/` deletes conversations
- [ ] All endpoints return appropriate HTTP status codes
- [ ] Error handling works for all scenarios
- [ ] OpenAPI documentation is complete
- [ ] Tests pass for all scenarios
- [ ] No breaking changes to existing functionality

## Dependencies

- Django REST Framework
- Existing `ChatConversation` and `ChatMessage` models
- Current serializers and error handling patterns
- OpenAPI/Swagger documentation setup

## Notes

- Hardcode user_id=1 as specified in requirements
- Follow existing code patterns and conventions
- Ensure backward compatibility with existing endpoints
- Consider adding conversation title editing in future iterations
- Plan for user authentication integration when ready

Status: **PENDING**
Priority: **High**
Estimated Time: **4-6 hours**