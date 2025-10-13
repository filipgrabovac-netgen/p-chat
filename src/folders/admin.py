from django.contrib import admin
from .models import Folder


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'color', 'parent', 'quizzes_count', 'children_count', 'created_at']
    list_filter = ['user', 'parent', 'created_at']
    search_fields = ['name', 'description', 'user__username']
    readonly_fields = ['created_at', 'updated_at', 'quizzes_count', 'children_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'description')
        }),
        ('Appearance', {
            'fields': ('color', 'icon')
        }),
        ('Hierarchy', {
            'fields': ('parent',)
        }),
        ('Statistics', {
            'fields': ('quizzes_count', 'children_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )