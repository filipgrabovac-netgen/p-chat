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
    
    # Remove leading/trailing slashes for consistency
    path = path.strip('/')
    
    # Try different file path variations for Next.js static export with trailingSlash: true
    # 1. Try path/index.html (most common for Next.js with trailingSlash)
    if path:
        file_path = os.path.join(out_dir, path, 'index.html')
    else:
        file_path = os.path.join(out_dir, 'index.html')
    
    # 2. If not found, try path.html
    if not os.path.exists(file_path) and path:
        file_path = os.path.join(out_dir, path + '.html')
    
    # 3. If not found, try exact path (for files like favicon.ico, etc.)
    if not os.path.exists(file_path) and path:
        file_path = os.path.join(out_dir, path)
    
    # If the file exists and is a file, serve it
    if os.path.exists(file_path) and os.path.isfile(file_path):
        content_type, _ = mimetypes.guess_type(file_path)
        return FileResponse(open(file_path, 'rb'), content_type=content_type)
    
    # If nothing found, serve the root index.html (for client-side routing)
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