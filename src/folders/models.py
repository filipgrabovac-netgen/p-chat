from django.db import models
from django.contrib.auth.models import User


class Folder(models.Model):
    """Model to store user folders for organizing quizzes"""
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
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"
    
    @property
    def quizzes_count(self):
        """Return the number of quizzes in this folder"""
        return self.quizzes.count()
    
    @property
    def children_count(self):
        """Return the number of child folders"""
        return self.children.count()