from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Election, Profile, Position, Candidate, Vote


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id", "first_name", "last_name", "email", "is_eligible", "created_at"]
        read_only_fields = ["id", "created_at"]


class UserRegistrationSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(username=value).exists() or Profile.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email address is already registered.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        email = validated_data["email"]
        user = User.objects.create_user(username=email, email=email, password=password,
                                        first_name=validated_data["first_name"],
                                        last_name=validated_data["last_name"])
        Profile.objects.create(user=user, **validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    def get_profile(self, obj):
        try:
            return ProfileSerializer(obj.profile).data
        except Profile.DoesNotExist:
            return None

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "is_staff", "profile"]


class CandidateSerializer(serializers.ModelSerializer):
    position_name = serializers.CharField(source="position.name", read_only=True)
    election_id = serializers.IntegerField(source="position.election_id", read_only=True)
    vote_count = serializers.SerializerMethodField()
    vote_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = ["id", "name", "bio", "photo_url", "position", "position_name",
                  "election_id", "vote_count", "vote_percentage", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_vote_count(self, obj):
        return obj.get_vote_count()

    def get_vote_percentage(self, obj):
        return obj.get_vote_percentage()


class PositionSerializer(serializers.ModelSerializer):
    candidates = CandidateSerializer(many=True, read_only=True)
    total_votes = serializers.SerializerMethodField()
    candidates_count = serializers.SerializerMethodField()

    class Meta:
        model = Position
        fields = ["id", "election", "name", "description", "order", "is_active",
                  "candidates", "total_votes", "candidates_count", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_total_votes(self, obj):
        return obj.get_total_votes()

    def get_candidates_count(self, obj):
        return obj.get_candidates_count()


class ElectionSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    voting_open = serializers.ReadOnlyField()
    positions = PositionSerializer(many=True, read_only=True)

    class Meta:
        model = Election
        fields = ["id", "name", "description", "start_time", "end_time",
                  "is_active", "status", "voting_open", "positions", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class VoteSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source="candidate.name", read_only=True)
    position_name = serializers.CharField(source="position.name", read_only=True)

    class Meta:
        model = Vote
        fields = ["id", "candidate", "position", "timestamp", "candidate_name", "position_name"]
        read_only_fields = ["id", "timestamp", "candidate_name", "position_name"]

    def validate(self, attrs):
        user = self.context["request"].user
        candidate, position = attrs["candidate"], attrs["position"]
        if not user.profile.is_eligible:
            raise serializers.ValidationError("Your voter account is not eligible.")
        if candidate.position_id != position.id:
            raise serializers.ValidationError("Candidate does not belong to the selected position.")
        if candidate.position.election_id != position.election_id:
            raise serializers.ValidationError("Election mismatch.")
        election = position.election
        if not election.voting_open:
            raise serializers.ValidationError(
                "Voting is closed. Votes cannot be submitted outside the election window."
            )
        if not position.is_active or not candidate.is_active:
            raise serializers.ValidationError("This position or candidate is no longer active.")
        if Vote.objects.filter(user=user, position=position).exists():
            raise serializers.ValidationError(f"You have already voted for {position.name}.")
        return attrs

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class VoterCMSSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    voted_positions = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ["id", "name", "email", "is_eligible", "voted_positions", "created_at"]
        read_only_fields = ["id", "created_at", "voted_positions"]

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_voted_positions(self, obj):
        return obj.user.votes.values_list("position__name", flat=True).count()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        return attrs
