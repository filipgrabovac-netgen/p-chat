from django.urls import path
from .views import DummyView


test_app_router = [
    path("dummy/", DummyView.as_view()),
]