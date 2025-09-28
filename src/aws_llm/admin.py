from django.contrib import admin

from aws_llm.models import ChatConversation, ChatMessage

# Register your models here.

admin.site.register(ChatConversation)
admin.site.register(ChatMessage)