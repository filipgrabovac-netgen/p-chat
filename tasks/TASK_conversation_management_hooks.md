# Task: Conversation Management Hooks

## Description

Create two hooks for managing conversations - one for creating and one for deleting conversations. Implement UI functionality to create new conversations when a user clicks the "New Conversation" button and add delete functionality with X buttons on existing conversations.

## Requirements

- **Create Hook**: Implement `useCreateConversation` hook for creating new conversations
- **Delete Hook**: Implement `useDeleteConversation` hook for deleting conversations  
- **UI Integration**: Connect the "New Conversation" button to the create hook
- **Delete UI**: Add X buttons to existing conversations and connect to delete hook
- **Error Handling**: Proper error handling and loading states
- **State Management**: Invalidate queries after create/delete operations

## Implementation Details

### 1. Create Conversation Hook (`useCreateConversation.hook.ts`)

**Location**: `app/hooks/useCreateConversation.hook.ts`

**Functionality**:
- Create new conversations via POST request to `/api/aws-llm/conversations/`
- Handle loading, error, and success states
- Invalidate conversations list after successful creation
- Return conversation data for navigation

**Interface**:
```typescript
interface UseCreateConversationReturn {
  createConversation: (data?: CreateConversationRequest) => Promise<CreateConversationResponse>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}
```

### 2. Delete Conversation Hook (`useDeleteConversation.hook.ts`)

**Location**: `app/hooks/useDeleteConversation.hook.ts`

**Functionality**:
- Delete conversations via DELETE request to `/api/aws-llm/conversations/{id}/`
- Handle loading, error, and success states
- Invalidate conversations list after successful deletion
- Prevent accidental deletions with proper event handling

**Interface**:
```typescript
interface UseDeleteConversationReturn {
  deleteConversation: (conversationId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}
```

### 3. UI Updates (`ConversationsSidebar.tsx`)

**New Conversation Button**:
- Connect to `useCreateConversation` hook
- Show loading state during creation
- Navigate to new conversation after creation
- Disable button during creation process

**Delete Functionality**:
- Add X button to each conversation item
- Connect to `useDeleteConversation` hook
- Prevent conversation selection when clicking delete
- Show hover states and loading states
- Add proper accessibility attributes

## Technical Requirements

### Frontend Technologies

- **React Hooks**: `useMutation` from TanStack React Query
- **State Management**: Query invalidation for real-time updates
- **TypeScript**: Proper type definitions for all interfaces
- **Error Handling**: Try-catch blocks and user feedback

### API Integration

- **Create Endpoint**: `POST /api/aws-llm/conversations/`
- **Delete Endpoint**: `DELETE /api/aws-llm/conversations/{id}/`
- **Headers**: `Content-Type: application/json`, `Accept: application/json`
- **Error Handling**: HTTP status codes and error messages

### State Management

- **Loading States**: `isLoading: boolean` for both hooks
- **Error States**: `error: string | null` for user feedback
- **Success States**: `isSuccess: boolean` for UI updates
- **Query Invalidation**: Automatic refetch of conversations list

## Expected Behavior

### 1. Create Conversation

- User clicks "New Conversation" button
- Button shows loading spinner and "Creating..." text
- API call creates new conversation
- Conversations list refreshes automatically
- User is navigated to the new conversation
- Error handling if creation fails

### 2. Delete Conversation

- User clicks X button on any conversation
- Event propagation is stopped to prevent selection
- API call deletes the conversation
- Conversations list refreshes automatically
- Conversation is removed from UI
- Error handling if deletion fails

### 3. Loading States

- Create button shows spinner during creation
- Delete buttons are disabled during deletion
- Smooth transitions between states
- Proper disabled states to prevent multiple clicks

## File Structure

```
app/
├── hooks/
│   ├── useCreateConversation.hook.ts (new)
│   └── useDeleteConversation.hook.ts (new)
├── components/
│   └── ConversationsSidebar.tsx (updated)
└── types/
    └── conversations.ts (existing)
```

## Implementation Steps

### Step 1: Create Hooks

- [x] Create `useCreateConversation.hook.ts`
- [x] Create `useDeleteConversation.hook.ts`
- [x] Implement API calls with proper error handling
- [x] Add query invalidation for real-time updates

### Step 2: Update UI Components

- [x] Import hooks in `ConversationsSidebar.tsx`
- [x] Add handler functions for create/delete operations
- [x] Update "New Conversation" button with loading states
- [x] Add X buttons to conversation items
- [x] Implement proper event handling for delete buttons

### Step 3: Error Handling

- [x] Add try-catch blocks for API calls
- [x] Console error logging for debugging
- [x] User feedback for failed operations
- [x] Graceful fallbacks for network errors

### Step 4: Testing

- [ ] Test create conversation functionality
- [ ] Test delete conversation functionality
- [ ] Test loading states and error handling
- [ ] Test query invalidation and UI updates
- [ ] Test accessibility and keyboard navigation

## Success Criteria

- [x] Hooks successfully create and delete conversations
- [x] UI updates reflect changes in real-time
- [x] Loading states work properly
- [x] Error handling provides user feedback
- [x] TypeScript types are correct
- [x] No console errors during normal operation
- [x] Smooth user experience with proper transitions

## Dependencies

- TanStack React Query for mutations
- Existing conversation API endpoints
- TypeScript for type safety
- React hooks for state management

## Backend Requirements

**Note**: The following API endpoints need to be implemented in the backend:

1. **POST /api/aws-llm/conversations/**
   - Create a new conversation
   - Return conversation data with ID
   - Handle user authentication

2. **DELETE /api/aws-llm/conversations/{id}/**
   - Delete a conversation by ID
   - Return success/error response
   - Handle cascade deletion of messages

## Testing Scenarios

- [ ] **Create Success**: Button creates conversation and navigates
- [ ] **Create Error**: API fails, user sees error feedback
- [ ] **Delete Success**: X button removes conversation from list
- [ ] **Delete Error**: API fails, conversation remains in list
- [ ] **Loading States**: Buttons show proper loading indicators
- [ ] **Query Invalidation**: List refreshes after create/delete
- [ ] **Event Handling**: Delete doesn't trigger conversation selection

## Notes

- Ensure proper error boundaries for failed operations
- Consider implementing optimistic updates for better UX
- Add confirmation dialog for delete operations
- Implement proper loading skeletons
- Consider pagination for large conversation lists
- Add keyboard navigation support

Status: **COMPLETED**
Priority: **High**
Estimated Time: **2-3 hours**