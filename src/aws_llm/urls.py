from django.urls import path
from . import views

app_name = 'aws_llm'

urlpatterns = [
    path('chat/', views.ChatResponseView.as_view(), name='chat_response'),
    path('chat/history/', views.ChatHistoryView.as_view(), name='chat_history'),
    path('chat/history/<int:conversation_id>/', views.ChatHistoryView.as_view(), name='chat_history_by_id'),
    path('conversations/', views.ConversationsListView.as_view(), name='conversations_list'),
    path('conversations/create/', views.ConversationCreateView.as_view(), name='conversation_create'),
    path('conversations/<int:conversation_id>/', views.ConversationDeleteView.as_view(), name='conversation_delete'),
]
