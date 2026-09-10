"""
Production voting models.
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Election(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def status(self):
        now = timezone.now()
        if not self.is_active:
            return "inactive"
        if now < self.start_time:
            return "scheduled"
        if now >= self.end_time:
            return "closed"
        return "voting"

    @property
    def voting_open(self):
        return self.is_active and self.start_time <= timezone.now() < self.end_time


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    is_eligible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ["last_name", "first_name"]
        verbose_name = "Voter"
        verbose_name_plural = "Voters"


class Position(models.Model):
    election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name="positions")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "name"]
        constraints = [
            models.UniqueConstraint(fields=["election", "name"], name="unique_position_per_election")
        ]

    def __str__(self):
        return f"{self.election.name} — {self.name}"

    def get_total_votes(self):
        return self.votes.count()

    def get_candidates_count(self):
        return self.candidates.count()


class Candidate(models.Model):
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name="candidates")
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    photo_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["position", "name"]
        constraints = [
            models.UniqueConstraint(fields=["position", "name"], name="unique_candidate_per_position")
        ]

    def __str__(self):
        return f"{self.name} — {self.position.name}"

    def get_vote_count(self):
        return self.votes.count()

    def get_vote_percentage(self):
        total = self.position.get_total_votes()
        return round((self.get_vote_count() / total) * 100, 2) if total else 0.0


class Vote(models.Model):
    """
    Server-side ballot record. The CMS deliberately never exposes the
    user->candidate relationship to administrators or exports.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="votes")
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name="votes")
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name="votes")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "position")
        ordering = ["-timestamp"]

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.candidate.position_id != self.position_id:
            raise ValidationError("Candidate does not belong to the selected position.")
        if self.position.election_id != self.candidate.position.election_id:
            raise ValidationError("Election mismatch.")
