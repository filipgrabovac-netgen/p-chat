# Task: Quiz Generation Endpoint

## Description

Create a backend endpoint for AI-powered quiz generation that accepts PDF context as a prompt and generates a quiz with multiple questions. The system should create new models for Quiz and Question with proper attributes, save the quiz with DRAFT status, and generate questions that are primarily free-form but designed to be compatible with future question types (single choice, multiple choice, true/false).

## Requirements

- **Quiz Model**: Create a Quiz model with proper attributes (title, status, description, etc.)
- **Question Model**: Create a Question model with attributes compatible with multiple question types
- **Quiz Generation Endpoint**: POST endpoint that accepts a prompt containing PDF context
- **AI Integration**: Use existing AWS LLM wrapper to generate quiz questions
- **Database Persistence**: Save quiz and all questions to database
- **Status Management**: Initialize quiz with DRAFT status
- **Future Compatibility**: Design question model to support multiple question types

## Models

### 1. Quiz Model

**Location**: `src/aws_llm/models.py`

**Attributes**:
```python
class Quiz(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('ARCHIVED', 'Archived'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    source_context = models.TextField()  # Store the original PDF context
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Quiz {self.id}: {self.title}"
```

### 2. Question Model

**Location**: `src/aws_llm/models.py`

**Attributes**:
```python
class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('FREE_FORM', 'Free Form'),
        ('SINGLE_CHOICE', 'Single Choice'),
        ('MULTIPLE_CHOICE', 'Multiple Choice'),
        ('TRUE_FALSE', 'True/False'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='FREE_FORM')
    
    # For choice-based questions (future use)
    choice_a = models.TextField(blank=True, null=True)
    choice_b = models.TextField(blank=True, null=True)
    choice_c = models.TextField(blank=True, null=True)
    choice_d = models.TextField(blank=True, null=True)
    
    # For storing correct answer(s)
    correct_answer = models.TextField(blank=True, null=True)  # For free-form expected answer
    correct_choices = models.JSONField(blank=True, null=True)  # For multiple choice (e.g., ['A', 'C'])
    
    # Additional metadata
    points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)  # Question order in quiz
    explanation = models.TextField(blank=True, null=True)  # Explanation for the answer
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'id']
    
    def __str__(self):
        return f"Question {self.id}: {self.question_text[:50]}..."
```

## API Endpoint

### Quiz Generation Endpoint

**URL**: `POST /api/aws-llm/quiz/generate/`

**Request Body**:
```json
{
  "prompt": "Large string containing PDF context...",
  "title": "Optional custom title",
  "num_questions": 5,
  "question_type": "FREE_FORM"
}
```

**Response**:
```json
{
  "quiz_id": 1,
  "title": "Generated Quiz Title",
  "status": "DRAFT",
  "description": "Quiz description",
  "questions_count": 5,
  "questions": [
    {
      "id": 1,
      "question_text": "What is...",
      "question_type": "FREE_FORM",
      "order": 1,
      "points": 1
    }
  ],
  "created_at": "2025-09-30T12:00:00Z",
  "success": true
}
```

## Implementation Details

### 1. Database Migration

**Location**: `src/aws_llm/migrations/`

**Actions**:
- Create migration for Quiz model
- Create migration for Question model
- Run migrations to create tables

**Command**:
```bash
python manage.py makemigrations aws_llm
python manage.py migrate
```

### 2. Serializers

**Location**: `src/aws_llm/serializers.py`

**Serializers to Create**:
- `QuizSerializer`: For quiz model serialization
- `QuestionSerializer`: For question model serialization
- `QuizGenerationRequestSerializer`: For validating generation requests
- `QuizGenerationResponseSerializer`: For formatting responses

**Example**:
```python
class QuizGenerationRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(
        required=True,
        help_text="PDF context or text content for quiz generation"
    )
    title = serializers.CharField(
        max_length=300,
        required=False,
        help_text="Custom title for the quiz"
    )
    num_questions = serializers.IntegerField(
        default=5,
        min_value=1,
        max_value=20,
        required=False,
        help_text="Number of questions to generate"
    )
    question_type = serializers.ChoiceField(
        choices=['FREE_FORM', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE'],
        default='FREE_FORM',
        required=False,
        help_text="Type of questions to generate"
    )
```

### 3. Quiz Generation View

**Location**: `src/aws_llm/views.py`

**Class**: `QuizGenerationView(APIView)`

**Functionality**:
1. Validate incoming request with `QuizGenerationRequestSerializer`
2. Extract prompt, title, num_questions from validated data
3. Use AWS LLM wrapper to generate quiz questions based on the context
4. Parse LLM response to extract questions and metadata
5. Create Quiz object with status='DRAFT'
6. Create Question objects associated with the quiz
7. Return serialized response with quiz and questions data

**LLM Prompt Template**:
```python
QUIZ_GENERATION_PROMPT = """
Based on the following context, generate {num_questions} quiz questions.

Context:
{context}

Generate the quiz in the following JSON format:
{{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {{
      "question_text": "Question text here?",
      "explanation": "Explanation of the answer",
      "points": 1
    }}
  ]
}}

Make sure questions are clear, relevant to the context, and test understanding of the material.
"""
```

### 4. URL Configuration

**Location**: `src/aws_llm/urls.py`

**Add Route**:
```python
path('quiz/generate/', views.QuizGenerationView.as_view(), name='quiz_generate'),
```

## Technical Requirements

### Backend Technologies

- **Django ORM**: For model definitions and database operations
- **Django REST Framework**: For API endpoint creation
- **AWS LLM Integration**: Using existing `AWSLLMWrapper`
- **JSON Parsing**: For parsing LLM responses
- **Validation**: Request/response serialization and validation

### Database Schema

**Quiz Table**:
- id (PK, auto-increment)
- user_id (FK to User)
- title (VARCHAR 300)
- description (TEXT)
- status (VARCHAR 20)
- source_context (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

**Question Table**:
- id (PK, auto-increment)
- quiz_id (FK to Quiz)
- question_text (TEXT)
- question_type (VARCHAR 20)
- choice_a, choice_b, choice_c, choice_d (TEXT, nullable)
- correct_answer (TEXT, nullable)
- correct_choices (JSON, nullable)
- points (INTEGER)
- order (INTEGER)
- explanation (TEXT, nullable)
- created_at (DATETIME)

### Error Handling

- **Invalid Request**: Return 400 with error details
- **LLM Failure**: Return 500 with error message
- **Database Error**: Return 500 with error details
- **JSON Parse Error**: Return 500 with parsing error details

## Expected Behavior

### 1. Quiz Generation Flow

1. User sends POST request with PDF context in prompt field
2. Backend validates request data
3. System constructs prompt for LLM with context and instructions
4. LLM generates quiz questions in structured format
5. Backend parses LLM response to extract quiz data
6. Quiz record created with status='DRAFT'
7. Question records created and associated with quiz
8. Response sent back with quiz_id and all generated questions

### 2. Data Persistence

- Quiz saved immediately with DRAFT status
- All questions saved with quiz_id reference
- Questions ordered sequentially (0, 1, 2, ...)
- Timestamps recorded for audit trail

### 3. Future Compatibility

- Question model includes fields for all question types
- question_type field allows filtering by type
- choice fields ready for single/multiple choice questions
- correct_choices JSON field supports multiple correct answers
- Structure allows easy extension to new question types

## File Structure

```
src/aws_llm/
├── models.py (updated with Quiz and Question models)
├── serializers.py (updated with quiz serializers)
├── views.py (updated with QuizGenerationView)
├── urls.py (updated with quiz route)
├── admin.py (updated to register Quiz and Question)
└── migrations/
    └── 000X_quiz_and_question.py (new migration)
```

## Implementation Steps

### Step 1: Create Models

- [ ] Add Quiz model to `models.py`
- [ ] Add Question model to `models.py`
- [ ] Create migrations with `makemigrations`
- [ ] Apply migrations with `migrate`
- [ ] Register models in `admin.py` for Django admin

### Step 2: Create Serializers

- [ ] Create `QuestionSerializer`
- [ ] Create `QuizSerializer`
- [ ] Create `QuizGenerationRequestSerializer`
- [ ] Create `QuizGenerationResponseSerializer`
- [ ] Add validation logic for request data

### Step 3: Implement Quiz Generation View

- [ ] Create `QuizGenerationView` class
- [ ] Implement request validation
- [ ] Create LLM prompt template
- [ ] Implement LLM integration for question generation
- [ ] Implement JSON parsing for LLM response
- [ ] Implement Quiz creation logic
- [ ] Implement Question creation logic
- [ ] Add error handling for all steps

### Step 4: Configure URLs

- [ ] Add quiz generation route to `urls.py`
- [ ] Test route is accessible
- [ ] Add API documentation with `@extend_schema`

### Step 5: Testing

- [ ] Test with sample PDF context
- [ ] Test with various prompt lengths
- [ ] Test error handling (invalid requests, LLM failures)
- [ ] Verify database records are created correctly
- [ ] Test question ordering
- [ ] Test DRAFT status is set correctly

## Success Criteria

- [ ] Quiz and Question models created and migrated
- [ ] POST endpoint accepts prompts with PDF context
- [ ] Endpoint successfully generates quiz questions using LLM
- [ ] Quiz saved to database with status='DRAFT'
- [ ] All questions saved with correct quiz_id
- [ ] Questions are all FREE_FORM type by default
- [ ] Model structure supports future question types
- [ ] Proper error handling and validation
- [ ] API returns structured response with quiz and questions
- [ ] Code follows existing project patterns and conventions

## Dependencies

- Django ORM for models and database operations
- Django REST Framework for API endpoint
- Existing AWS LLM wrapper for question generation
- JSON parsing library (Python built-in)
- Django migrations for database schema changes

## LLM Integration Strategy

**Approach**:
1. Construct structured prompt with PDF context
2. Request JSON-formatted response from LLM
3. Parse JSON response to extract questions
4. Validate extracted data before saving
5. Handle parsing errors gracefully

**Prompt Engineering**:
- Include clear instructions for question format
- Specify number of questions to generate
- Request explanations for answers
- Ensure output is valid JSON
- Include example format in prompt

## Data Validation

**Request Validation**:
- Prompt is required and non-empty
- Title is optional, max 300 characters
- num_questions is between 1 and 20
- question_type is valid enum value

**Response Validation**:
- LLM response is valid JSON
- All required fields present in response
- Questions array is non-empty
- Each question has required fields

## Future Enhancements

**Question Type Support**:
- Single choice: Add UI to display 4 choices, select 1
- Multiple choice: Add UI to display 4 choices, select multiple
- True/False: Add UI with True/False buttons

**Advanced Features**:
- Question difficulty levels
- Time limits per question
- Question categories/tags
- Quiz templates
- Question bank for reuse
- Import/export quiz functionality

**User Experience**:
- Quiz preview before publishing
- Edit questions after generation
- Regenerate individual questions
- Bulk question import
- Quiz analytics and statistics

## Testing Scenarios

- [ ] **Valid Generation**: Prompt generates quiz successfully
- [ ] **Empty Prompt**: Return 400 error
- [ ] **Large Prompt**: Handle prompts up to 50k characters
- [ ] **LLM Timeout**: Handle timeout gracefully
- [ ] **Invalid JSON**: Handle malformed LLM responses
- [ ] **Database Error**: Handle database connection issues
- [ ] **Concurrent Requests**: Multiple quiz generations simultaneously
- [ ] **Question Ordering**: Questions saved in correct order

## Notes

- Use transaction management for atomic quiz+questions creation
- Consider adding celery task for async generation (future)
- Implement rate limiting to prevent abuse
- Add logging for debugging LLM interactions
- Consider caching for similar prompts (future)
- Plan for quiz versioning (future)
- Consider adding quiz sharing/collaboration features (future)

## Security Considerations

- Validate and sanitize all user inputs
- Limit prompt size to prevent abuse
- Rate limit quiz generation endpoint
- Ensure user can only access their own quizzes
- Validate LLM responses before database insertion
- Protect against SQL injection via ORM
- Add CSRF protection for API endpoints

## Performance Considerations

- LLM calls may take 5-30 seconds
- Consider implementing progress updates
- Add timeout handling for LLM requests
- Optimize database queries with select_related
- Consider batch insertion for questions
- Add database indexes on foreign keys
- Monitor LLM API costs and usage

Status: **PENDING**
Priority: **HIGH**
Estimated Time: **6-8 hours**