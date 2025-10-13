# Task: Folders System for Quiz Organization

## Description

Create a new Django app called `folders` to implement a folder/map system that allows users to organize their quizzes into different categories (e.g., subjects, topics, or custom organizational structures). The system should include a Folder model and modify the existing Quiz model to include an optional `folder_id` foreign key relationship.

## Requirements

### Core Functionality

1. **Folder Model Creation**

   - Create a new Django app called `folders`
   - Define a Folder model with appropriate attributes
   - Implement CRUD operations for folders
   - Add proper user association and permissions

2. **Quiz Model Modification**

   - Add optional `folder_id` foreign key to existing Quiz model
   - Create database migration for the new field
   - Update serializers to include folder information
   - Maintain backward compatibility with existing quizzes

3. **API Endpoints**
   - Create REST API endpoints for folder management
   - Follow existing API patterns from `pdf_manager` app
   - Include proper OpenAPI documentation
   - Implement proper error handling and validation

## Technical Specifications

### Backend Requirements

#### 1. New Django App: `folders`

- **Location**: `src/folders/`
- **Structure**: Standard Django app with models, views, serializers, urls, admin
- **Integration**: Add to main `urls.py` and `settings.py`

#### 2. Folder Model

- **Location**: `src/folders/models.py`
- **Attributes**:
  ```python
  class Folder(models.Model):
      user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folders')
      name = models.CharField(max_length=255)
      description = models.TextField(blank=True, null=True)
      color = models.CharField(max_length=7, default='#3B82F6')  # Hex color for UI
      icon = models.CharField(max_length=50, blank=True, null=True)  # Icon identifier
      parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
      created_at = models.DateTimeField(auto_now_add=True)
      updated_at = models.DateTimeField(auto_now=True)

      class Meta:
          ordering = ['name']
          unique_together = ['user', 'name']  # Unique folder names per user
  ```

#### 3. Quiz Model Modification

- **Location**: `src/pdf_manager/models.py`
- **New Field**:
  ```python
  folder = models.ForeignKey(
      'folders.Folder',
      on_delete=models.SET_NULL,
      null=True,
      blank=True,
      related_name='quizzes'
  )
  ```

#### 4. API Endpoints

- **Base URL**: `/api/folders/`
- **Endpoints**:
  - `GET /api/folders/` - List all folders for user
  - `POST /api/folders/` - Create new folder
  - `GET /api/folders/{id}/` - Get specific folder
  - `PUT /api/folders/{id}/` - Update folder
  - `PATCH /api/folders/{id}/` - Partial update folder
  - `DELETE /api/folders/{id}/` - Delete folder
  - `GET /api/folders/{id}/quizzes/` - Get quizzes in folder

### Database Schema Changes

#### New Tables

**folders_folder**:

- id (PK, auto-increment)
- user_id (FK to User)
- name (VARCHAR 255)
- description (TEXT, nullable)
- color (VARCHAR 7, default '#3B82F6')
- icon (VARCHAR 50, nullable)
- parent_id (FK to folders_folder, nullable)
- created_at (DATETIME)
- updated_at (DATETIME)

#### Modified Tables

**pdf_manager_quiz**:

- Add: folder_id (FK to folders_folder, nullable)

### API Integration

#### 1. Folder Serializers

- **Location**: `src/folders/serializers.py`
- **Serializers**:
  ```python
  class FolderSerializer(serializers.ModelSerializer):
      quizzes_count = serializers.SerializerMethodField()
      children_count = serializers.SerializerMethodField()

      class Meta:
          model = Folder
          fields = [
              'id', 'name', 'description', 'color', 'icon',
              'parent', 'quizzes_count', 'children_count',
              'created_at', 'updated_at'
          ]
          read_only_fields = ['id', 'created_at', 'updated_at']
  ```

#### 2. Folder ViewSet

- **Location**: `src/folders/views.py`
- **Class**: `FolderViewSet(viewsets.ModelViewSet)`
- **Features**:
  - User filtering (hardcoded to user ID 1 for now)
  - CRUD operations
  - Nested folder support
  - Quiz count aggregation
  - Proper permissions and validation

#### 3. URL Configuration

- **Location**: `src/folders/urls.py`
- **Router**: DefaultRouter with 'folders' basename
- **Integration**: Add to main `urls.py` as `/api/folders/`

### Updated Quiz Integration

#### 1. Quiz Serializer Updates

- **Location**: `src/pdf_manager/serializers.py`
- **New Fields**:
  ```python
  folder_name = serializers.CharField(source='folder.name', read_only=True, allow_null=True)
  folder_color = serializers.CharField(source='folder.color', read_only=True, allow_null=True)
  ```

#### 2. Quiz ViewSet Updates

- **Location**: `src/pdf_manager/views.py`
- **New Features**:
  - Filter quizzes by folder
  - Include folder information in responses
  - Support folder assignment during quiz creation

## Implementation Steps

### Step 1: Create Folders App

- [ ] Create new Django app: `python manage.py startapp folders`
- [ ] Add `folders` to `INSTALLED_APPS` in settings
- [ ] Create basic app structure (models, views, serializers, urls, admin)

### Step 2: Implement Folder Model

- [ ] Define Folder model in `src/folders/models.py`
- [ ] Add proper Meta options and string representation
- [ ] Register model in Django admin
- [ ] Create and run migrations

### Step 3: Modify Quiz Model

- [ ] Add folder foreign key to Quiz model
- [ ] Create migration for the new field
- [ ] Update Quiz model string representation if needed
- [ ] Test migration with existing data

### Step 4: Create Folder API

- [ ] Implement FolderSerializer with all required fields
- [ ] Create FolderViewSet with CRUD operations
- [ ] Add proper filtering and permissions
- [ ] Configure URL routing
- [ ] Add OpenAPI documentation with `@extend_schema`

### Step 5: Update Quiz API

- [ ] Update QuizSerializer to include folder information
- [ ] Add folder filtering to QuizViewSet
- [ ] Update quiz creation to support folder assignment
- [ ] Test API endpoints

### Step 6: Integration and Testing

- [ ] Add folders app to main URL configuration
- [ ] Test all API endpoints
- [ ] Verify database relationships work correctly
- [ ] Test with existing quiz data
- [ ] Update API documentation

## API Endpoints Specification

### Folder Endpoints

#### List Folders

```
GET /api/folders/
Response: 200 OK
[
  {
    "id": 1,
    "name": "Mathematics",
    "description": "Math-related quizzes",
    "color": "#3B82F6",
    "icon": "calculator",
    "parent": null,
    "quizzes_count": 5,
    "children_count": 2,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Create Folder

```
POST /api/folders/
Request Body:
{
  "name": "Science",
  "description": "Science quizzes",
  "color": "#10B981",
  "icon": "flask",
  "parent": null
}
Response: 201 Created
{
  "id": 2,
  "name": "Science",
  "description": "Science quizzes",
  "color": "#10B981",
  "icon": "flask",
  "parent": null,
  "quizzes_count": 0,
  "children_count": 0,
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

#### Get Folder Quizzes

```
GET /api/folders/1/quizzes/
Response: 200 OK
[
  {
    "id": 1,
    "title": "Algebra Basics",
    "folder_name": "Mathematics",
    "folder_color": "#3B82F6",
    "difficulty_level": "medium",
    "generation_status": "completed",
    "created_at": "2024-01-15T09:00:00Z"
  }
]
```

### Updated Quiz Endpoints

#### List Quizzes (with folder filter)

```
GET /api/pdf-manager/quizzes/?folder=1
Response: 200 OK
[
  {
    "id": 1,
    "title": "Algebra Basics",
    "folder": 1,
    "folder_name": "Mathematics",
    "folder_color": "#3B82F6",
    "difficulty_level": "medium",
    "generation_status": "completed",
    "created_at": "2024-01-15T09:00:00Z"
  }
]
```

#### Create Quiz (with folder assignment)

```
POST /api/pdf-manager/quizzes/generate/
Request Body:
{
  "pdf_document_id": 1,
  "title": "Calculus Quiz",
  "difficulty_level": "hard",
  "num_questions": 10,
  "folder": 1
}
Response: 201 Created
{
  "id": 2,
  "title": "Calculus Quiz",
  "folder": 1,
  "folder_name": "Mathematics",
  "folder_color": "#3B82F6",
  "difficulty_level": "hard",
  "generation_status": "generating",
  "created_at": "2024-01-15T12:00:00Z"
}
```

## Success Criteria

- [ ] New `folders` Django app created and integrated
- [ ] Folder model with all required attributes
- [ ] Quiz model updated with optional folder relationship
- [ ] Complete CRUD API for folders
- [ ] Quiz API updated to support folder filtering and assignment
- [ ] Database migrations created and applied successfully
- [ ] All API endpoints documented with OpenAPI
- [ ] Backward compatibility maintained for existing quizzes
- [ ] Proper error handling and validation
- [ ] Code follows existing project patterns and conventions

## Dependencies

- Django ORM for models and database operations
- Django REST Framework for API endpoints
- Existing User model for authentication
- Existing Quiz model for relationship
- Django migrations for database schema changes
- DRF Spectacular for API documentation

## Database Migration Strategy

### Migration Order

1. Create folders app and Folder model
2. Run migration to create folders_folder table
3. Add folder field to Quiz model
4. Run migration to add folder_id column to pdf_manager_quiz table
5. Test migrations with existing data

### Data Integrity

- Existing quizzes will have `folder_id = NULL` (optional field)
- No data loss during migration
- Foreign key constraints properly set up
- Cascade behavior: SET_NULL when folder is deleted

## Future Enhancements

### Nested Folders

- Support for parent-child folder relationships
- Hierarchical folder structure
- Folder tree navigation

### Advanced Features

- Folder sharing between users
- Folder templates
- Bulk quiz operations (move multiple quizzes to folder)
- Folder statistics and analytics
- Folder import/export functionality

### UI Integration

- Drag-and-drop quiz organization
- Folder color coding in UI
- Folder icons and visual indicators
- Search and filter by folder

## Security Considerations

- Users can only access their own folders
- Proper permission checks on all endpoints
- Validate folder ownership before operations
- Prevent unauthorized folder access
- Input validation and sanitization

## Performance Considerations

- Add database indexes on foreign keys
- Optimize queries with select_related for folder data
- Consider pagination for large folder lists
- Efficient counting of quizzes per folder
- Cache folder hierarchy if needed

## Testing Scenarios

- [ ] Create folder with all attributes
- [ ] Create nested folders (parent-child relationship)
- [ ] Assign quiz to folder during creation
- [ ] Move quiz between folders
- [ ] Delete folder with quizzes (should set folder_id to NULL)
- [ ] List quizzes filtered by folder
- [ ] List folders with quiz counts
- [ ] Error handling for invalid folder operations
- [ ] User isolation (users can't access other users' folders)

## Notes

- Follow existing project patterns from `pdf_manager` app
- Use same authentication approach (hardcoded user ID 1 for now)
- Maintain consistency with existing API design
- Consider future frontend integration requirements
- Plan for potential folder hierarchy features
- Ensure proper database constraints and relationships

Status: **PENDING**
Priority: **MEDIUM**
Estimated Time: **4-6 hours**
