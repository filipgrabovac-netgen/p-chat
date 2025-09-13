from django.contrib import admin
from django.urls import path

from test_app.urls import test_app_router

urlpatterns = [
    path('admin/', admin.site.urls),
]

urlpatterns += test_app_router