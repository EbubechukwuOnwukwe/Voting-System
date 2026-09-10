"""
URL configuration for voting_backend project.
AI-Enhanced Online Voting System Using Django REST and React
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('voting_api.urls')),
]
