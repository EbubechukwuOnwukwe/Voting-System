from django.contrib import admin
from .models import Election, Profile, Position, Candidate, Vote


@admin.register(Election)
class ElectionAdmin(admin.ModelAdmin):
    list_display = ("name", "start_time", "end_time", "status", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "is_eligible", "created_at")
    search_fields = ("first_name", "last_name", "email")
    list_filter = ("is_eligible",)


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ("name", "election", "order", "is_active")
    list_filter = ("election", "is_active")
    search_fields = ("name",)


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ("name", "position", "is_active", "created_at")
    list_filter = ("is_active", "position__election")
    search_fields = ("name",)


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    # Do not expose the voter/candidate relationship in normal admin screens.
    list_display = ("id", "position", "candidate", "timestamp")
    list_filter = ("position__election", "position")
    readonly_fields = ("user", "candidate", "position", "timestamp")
