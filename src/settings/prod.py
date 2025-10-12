import os
from .base import *

# Railway-specific settings
DEBUG = False
ALLOWED_HOSTS = ["*"]

# Database configuration for Railway
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('PGDATABASE', 'postgres'),
        'USER': os.getenv('PGUSER', 'postgres'),
        'PASSWORD': os.getenv('PGPASSWORD', ''),
        'HOST': os.getenv('PGHOST', 'localhost'),
        'PORT': os.getenv('PGPORT', '5432'),
    }
}

# Use Railway's DATABASE_URL if available and not empty
database_url = os.getenv('DATABASE_URL', '')
if database_url and database_url.strip():
    import dj_database_url
    DATABASES['default'] = dj_database_url.parse(database_url)

# Static files configuration for Railway
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Templates configuration for serving frontend
# Point to project root templates directory (one level up from BASE_DIR)
project_root = BASE_DIR.parent
TEMPLATES[0]['DIRS'] = [
    os.path.join(project_root, 'templates'),
]

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS settings
# Since frontend and backend are served from the same domain, allow all origins
CORS_ALLOW_ALL_ORIGINS = True

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}