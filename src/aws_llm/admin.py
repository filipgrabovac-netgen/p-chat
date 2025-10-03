from django.contrib import admin
from aws_llm.models import ChatConversation, ChatMessage

# Register your models here.

@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'user__username')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'role', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('message',)