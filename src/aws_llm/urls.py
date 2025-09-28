from django.urls import path
from . import views

app_name = 'aws_llm'

urlpatterns = [
    path('chat/', views.ChatResponseView.as_view(), name='chat_response'),
    path('chat/history/', views.ChatHistoryView.as_view(), name='chat_history'),
]
