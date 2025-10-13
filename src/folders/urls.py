from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FolderViewSet

app_name = 'folders'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'', FolderViewSet, basename='folder')

urlpatterns = [
    path('', include(router.urls)),
]
