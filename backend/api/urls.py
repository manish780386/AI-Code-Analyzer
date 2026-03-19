from django.urls import path
from .views import review_code

urlpatterns = [
    path('review/', review_code),
]