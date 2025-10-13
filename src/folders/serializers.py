from rest_framework import serializers
from .models import Folder


class FolderSerializer(serializers.ModelSerializer):
    """Serializer for folders with computed fields"""
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
    
    def get_quizzes_count(self, obj):
        """Return the number of quizzes in this folder"""
        return obj.quizzes_count
    
    def get_children_count(self, obj):
        """Return the number of child folders"""
        return obj.children_count


class FolderListSerializer(serializers.ModelSerializer):
    """Simplified serializer for folder listing"""
    quizzes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = [
            'id', 'name', 'description', 'color', 'icon', 
            'parent', 'quizzes_count', 'created_at'
        ]
    
    def get_quizzes_count(self, obj):
        """Return the number of quizzes in this folder"""
        return obj.quizzes_count


class FolderCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating folders"""
    
    class Meta:
        model = Folder
        fields = [
            'name', 'description', 'color', 'icon', 'parent'
        ]
    
    def validate_name(self, value):
        """Validate that folder name is unique for the user"""
        # TODO: Replace with proper authentication
        from django.contrib.auth.models import User
        user = User.objects.get(id=1)  # Hardcoded for now
        
        if self.instance:
            # For updates, exclude current instance
            if Folder.objects.filter(user=user, name=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("A folder with this name already exists.")
        else:
            # For creation
            if Folder.objects.filter(user=user, name=value).exists():
                raise serializers.ValidationError("A folder with this name already exists.")
        return value
    
    def validate_parent(self, value):
        """Validate that parent folder belongs to the same user"""
        if value:
            # TODO: Replace with proper authentication
            from django.contrib.auth.models import User
            user = User.objects.get(id=1)  # Hardcoded for now
            if value.user != user:
                raise serializers.ValidationError("Parent folder must belong to the same user.")
        return value
