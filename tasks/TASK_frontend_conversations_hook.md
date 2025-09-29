# Task: Implement Frontend Hook for Conversations

## Description

Create a React hook that fetches conversations from the backend API and displays them in the conversations sidebar on the left side of the application.

## Requirements

- **Hook Creation**: Create a custom React hook (e.g., `useConversations`)
- **API Integration**: Fetch conversations from `GET /api/aws-llm/conversations/`
- **State Management**: Manage loading, error, and data states
- **UI Integration**: Display conversations in the existing ConversationsSidebar component
- **Error Handling**: Handle API errors gracefully with user feedback
- **Loading States**: Show loading indicators during data fetching

## Implementation Details

### 1. Frontend Hook (`useConversations.hook.ts`)

- **Location**: `app/hooks/useConversations.hook.ts`
- **Dependencies**: TanStack React Query for data fetching
- **Functionality**:
  - Fetch conversations from backend API
  - Handle loading, error, and success states
  - Provide refetch functionality
  - Cache data appropriately

### 2. API Integration

- **Endpoint**: `GET /api/aws-llm/conversations/`
- **Response Format**:
  ```json
  {
    "conversations": [
      {
        "id": 1,
        "user_username": "test_user",
        "created_at": "2025-09-28T10:12:08.712886Z",
        "message_count": 34,
        "last_message": {
          "content": "Last message content...",
          "role": "assistant",
          "timestamp": "2025-09-29T11:10:42.460053Z"
        }
      }
    ],
    "total": 1
  }
  ```

### 3. UI Integration

- **Component**: Update `ConversationsSidebar.tsx`
- **Features**:
  - Replace mock data with real API data
  - Show loading spinner while fetching
  - Display error messages if fetch fails
  - Show conversation count
  - Handle empty state (no conversations)

### 4. TypeScript Types

- **Location**: `app/types/conversations.ts`
- **Types**:
  - `Conversation` interface
  - `ConversationListResponse` interface
  - `LastMessage` interface

## Technical Requirements

### Frontend Technologies

- **React Hooks**: `useState`, `useEffect`, `useCallback`
- **Data Fetching**: TanStack React Query (`useQuery`)
- **TypeScript**: Proper type definitions
- **Error Handling**: Try-catch blocks and error boundaries

### API Client

- **Base URL**: `http://localhost:8000/api/aws-llm/`
- **Method**: GET
- **Headers**: `Accept: application/json`
- **Error Handling**: HTTP status codes (200, 500)

### State Management

- **Loading State**: `isLoading: boolean`
- **Error State**: `error: string | null`
- **Data State**: `conversations: Conversation[]`
- **Refetch Function**: `refetch: () => void`

## Expected Behavior

### 1. Initial Load

- Show loading spinner in sidebar
- Fetch conversations from API
- Display conversations when loaded
- Show error message if fetch fails

### 2. Data Display

- List all conversations with:
  - Conversation ID
  - User username
  - Creation date (formatted)
  - Message count
  - Last message preview (truncated)
- Highlight current/active conversation
- Show total conversation count

### 3. Error Handling

- Display user-friendly error messages
- Provide retry button on error
- Log errors to console for debugging
- Graceful fallback to empty state

### 4. Loading States

- Show skeleton loader or spinner
- Disable interaction during loading
- Smooth transitions between states

## File Structure

```
app/
├── hooks/
│   └── useConversations.hook.ts
├── types/
│   └── conversations.ts
├── components/
│   └── ConversationsSidebar.tsx (update)
└── schema/
    └── schema.d.ts (update with new types)
```

## Implementation Steps

### Step 1: Create Types

- [ ] Define `Conversation` interface
- [ ] Define `ConversationListResponse` interface
- [ ] Define `LastMessage` interface
- [ ] Export types from `types/conversations.ts`

### Step 2: Create Hook

- [ ] Create `useConversations.hook.ts`
- [ ] Implement API call with TanStack React Query
- [ ] Add loading, error, and data states
- [ ] Add refetch functionality
- [ ] Add proper error handling

### Step 3: Update Sidebar Component

- [ ] Import and use `useConversations` hook
- [ ] Replace mock data with real API data
- [ ] Add loading state UI
- [ ] Add error state UI
- [ ] Add empty state UI
- [ ] Update conversation selection logic

### Step 4: Update Schema

- [ ] Regenerate OpenAPI schema
- [ ] Update TypeScript types
- [ ] Ensure type safety

### Step 5: Testing

- [ ] Test with real API data
- [ ] Test loading states
- [ ] Test error scenarios
- [ ] Test conversation selection
- [ ] Test refetch functionality

## Success Criteria

- [ ] Hook successfully fetches conversations from API
- [ ] Conversations display correctly in sidebar
- [ ] Loading states work properly
- [ ] Error handling is user-friendly
- [ ] TypeScript types are correct
- [ ] No console errors
- [ ] Smooth user experience

## Dependencies

- TanStack React Query
- Existing API endpoint (`/api/aws-llm/conversations/`)
- TypeScript
- React hooks

## Testing Scenarios

- [ ] **Happy Path**: API returns data, conversations display
- [ ] **Loading State**: Show spinner while fetching
- [ ] **Error State**: API fails, show error message
- [ ] **Empty State**: No conversations, show empty message
- [ ] **Network Error**: Handle network failures
- [ ] **Refetch**: Manual refresh works correctly

## Notes

- Ensure proper error boundaries
- Consider implementing optimistic updates
- Add proper loading skeletons
- Implement proper caching strategy
- Consider pagination for large conversation lists

Status: **PENDING**
Priority: **High**
Estimated Time: **3-4 hours**
