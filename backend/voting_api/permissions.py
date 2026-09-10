from django.conf import settings
from rest_framework.permissions import BasePermission


class IsCMSAdmin(BasePermission):
    message = "CMS access is restricted to administrators."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
            and request.user.is_superuser
        )