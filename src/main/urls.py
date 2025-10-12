from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/aws-llm/', include('aws_llm.urls')),
    path('api/pdf-manager/', include('pdf_manager.urls')),
    
    # Swagger/OpenAPI documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve Next.js static files (CSS, JS, images, etc.) - capture full _next path
urlpatterns += [
    re_path(r'^(?P<path>_next/.*)$', views.serve_static_files, name='next_files'),
]

# Serve frontend for all other routes (must be last)
urlpatterns += [
    re_path(r'^(?P<path>.*)$', views.serve_frontend, name='frontend'),
]
