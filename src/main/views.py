from django.http import HttpResponse, FileResponse
from django.conf import settings
import os
import mimetypes


def serve_frontend(request, path=''):
    """
    Serve static files from the Next.js out directory for all non-API routes.
    """
    # Handle API routes - let Django's URL routing handle these
    if path.startswith('api/'):
        return HttpResponse('API route not found', status=404)
    
    # Get the out directory path
    project_root = settings.BASE_DIR.parent
    out_dir = os.path.join(project_root, 'out')
    
    # Clean up the path
    path = path.strip('/')
    
    # Try to serve the specific file first (for assets, etc.)
    if path:
        file_path = os.path.join(out_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            content_type, _ = mimetypes.guess_type(file_path)
            return FileResponse(open(file_path, 'rb'), content_type=content_type)
    
    # For all other routes, try to serve the appropriate index.html
    # This handles both static routes and dynamic routes
    if path:
        # Try path/index.html (Next.js with trailingSlash: true)
        index_path = os.path.join(out_dir, path, 'index.html')
    else:
        # Root path
        index_path = os.path.join(out_dir, 'index.html')
    
    if os.path.exists(index_path):
        return FileResponse(open(index_path, 'rb'), content_type='text/html')
    
    # Fallback to root index.html for client-side routing
    root_index = os.path.join(out_dir, 'index.html')
    if os.path.exists(root_index):
        return FileResponse(open(root_index, 'rb'), content_type='text/html')
    
    return HttpResponse(f'Frontend file not found: {path}', status=404)


def serve_static_files(request, path):
    """
    Serve static files from the Next.js build output (_next directory).
    """
    project_root = settings.BASE_DIR.parent
    file_path = os.path.join(project_root, 'out', path)
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        content_type, _ = mimetypes.guess_type(file_path)
        return FileResponse(open(file_path, 'rb'), content_type=content_type)
    else:
        return HttpResponse('File not found', status=404)