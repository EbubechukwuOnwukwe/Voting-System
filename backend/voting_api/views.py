import json
from io import BytesIO
from django.db.models import Count, F
from datetime import datetime
from openpyxl import Workbook
from openpyxl.utils import get_column_letter
from openpyxl.styles import Font, PatternFill, Alignment
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
# from django.core.mail import send_mail
from brevo import Brevo
from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsCMSAdmin
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Election, Profile, Position, Candidate, Vote
from .permissions import IsCMSAdmin
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    ElectionSerializer, PositionSerializer, CandidateSerializer, VoteSerializer,
    VoterCMSSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
)


def send_password_reset_email(user_email, reset_url):
    client = Brevo(api_key=settings.BREVO_API_KEY)

    client.transactional_emails.send_transac_email(
        subject="Voting System Password Reset",
        sender={
            "name": "NMA Voting System",
            "email": settings.BREVO_SENDER_EMAIL,
        },
        to=[
            {
                "email": user_email,
            }
        ],
        text_content=(
            "Hello,\n\n"
            "We received a request to reset your Voting System password.\n\n"
            "Click the link below to create a new password:\n\n"
            f"{reset_url}\n\n"
            "This link will expire for security reasons.\n\n"
            "If you did not request a password reset, you can safely ignore "
            "this email.\n\n"
            "NMA Voting System"
        ),
    )

def token_response(user, message="Login successful"):
    refresh = RefreshToken.for_user(user)
    return {
        "message": message,
        "user": UserSerializer(user).data,
        "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)},
    }


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(token_response(user, "Registration successful"), status=201)


class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        password = serializer.validated_data["password"]
        user = User.objects.filter(email__iexact=email).first()
        if user is not None and not user.check_password(password):
            user = None

        if user is None:
            return Response({"error": "Invalid email or password."}, status=401)
        if hasattr(user, "profile") and not user.profile.is_eligible and not user.is_staff:
            return Response({"error": "This voter account has been disabled."}, status=403)
        return Response(token_response(user))


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].lower().strip()

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Do not reveal whether an account exists.
            return Response({
                "message": "If an account exists, a reset link has been sent."
            })

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        frontend_url = getattr(
            settings,
            "FRONTEND_URL",
            "https://nma-voting-system.vercel.app"
        ).rstrip("/")

        reset_url = (
            f"{frontend_url}/reset-password/{uid}/{token}"
        )

        # send_mail(
        #     subject="Voting System Password Reset",
        #     message=(
        #         "Hello,\n\n"
        #         "We received a request to reset your Voting System password.\n\n"
        #         "Click the link below to create a new password:\n\n"
        #         f"{reset_url}\n\n"
        #         "This link will expire for security reasons.\n\n"
        #         "If you did not request a password reset, you can safely ignore "
        #         "this email.\n\n"
        #         "Voting System"
        #     ),
        #     from_email=getattr(
        #         settings,
        #         "DEFAULT_FROM_EMAIL",
        #         "noreply@votingsystem.local"
        #     ),
        #     recipient_list=[user.email],
        #     fail_silently=False,
        # )

        send_password_reset_email(
            user.email, 
            reset_url
        )

        return Response({
            "message": "If an account exists, a reset link has been sent."
        })

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid reset link."}, status=400)
        if not default_token_generator.check_token(user, token):
            return Response({"error": "This reset link is invalid or has expired."}, status=400)
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"message": "Password reset successfully. You can now sign in."})


class ElectionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ElectionSerializer

    def get_queryset(self):
        return Election.objects.filter(is_active=True).prefetch_related("positions__candidates")


class PositionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PositionSerializer

    def get_queryset(self):
        election_id = self.request.query_params.get("election")
        qs = Position.objects.filter(is_active=True, election__is_active=True).select_related("election").prefetch_related("candidates")
        if election_id:
            qs = qs.filter(election_id=election_id)
        return qs


class CandidateListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CandidateSerializer

    def get_queryset(self):
        qs = Candidate.objects.filter(is_active=True, position__is_active=True, position__election__is_active=True)
        position_id = self.request.query_params.get("position")
        election_id = self.request.query_params.get("election")
        if position_id:
            qs = qs.filter(position_id=position_id)
        if election_id:
            qs = qs.filter(position__election_id=election_id)
        return qs


class CastVoteView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = VoteSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        vote = serializer.save()
        return Response({"message": "Vote cast successfully.", "vote_id": vote.id}, status=201)


class UserVotesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only returns completion status, never candidate choices.
        votes = Vote.objects.filter(user=request.user)
        return Response({"voted_position_ids": list(votes.values_list("position_id", flat=True))})


class VotingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        election_id = request.query_params.get("election")
        elections = Election.objects.filter(is_active=True)
        if election_id:
            elections = elections.filter(id=election_id)
        data = []
        for election in elections:
            positions = election.positions.filter(is_active=True)
            voted = set(Vote.objects.filter(user=request.user, position__in=positions).values_list("position_id", flat=True))
            data.append({
                "election_id": election.id,
                "election_name": election.name,
                "status": election.status,
                "voting_open": election.voting_open,
                "start_time": election.start_time,
                "end_time": election.end_time,
                "total_positions": positions.count(),
                "voted_count": len(voted),
                "voting_status": [
                    {"position_id": p.id, "position_name": p.name, "has_voted": p.id in voted}
                    for p in positions
                ],
            })
        return Response({"elections": data})


def result_for_election(election):
    results = []

    for position in election.positions.filter(
        is_active=True
    ).prefetch_related("candidates"):

        candidates = []

        total = position.get_total_votes()

        for candidate in position.candidates.filter(is_active=True):
            count = candidate.get_vote_count()

            candidates.append({
                "id": candidate.id,
                "name": candidate.name,
                "bio": candidate.bio,
                "vote_count": count,
                "percentage": round(count / total * 100, 2) if total else 0,
            })

        # Highest votes first
        candidates.sort(
            key=lambda x: x["vote_count"],
            reverse=True
        )

        winner = None
        draw = False
        draw_candidates = []

        if candidates and total:
            highest_votes = candidates[0]["vote_count"]

            # Find EVERY candidate who has the highest vote count
            draw_candidates = [
                candidate
                for candidate in candidates
                if candidate["vote_count"] == highest_votes
            ]

            # More than one candidate has the highest number of votes
            if len(draw_candidates) > 1:
                draw = True
            else:
                # Exactly one candidate has the highest votes
                winner = draw_candidates[0]

        results.append({
            "position_id": position.id,
            "position_name": position.name,
            "total_votes": total,
            "candidates": candidates,

            # Winner only when there is a unique highest scorer
            "winner": winner,

            # True when the highest score is tied
            "draw": draw,

            # Candidates involved in the draw
            "draw_candidates": draw_candidates,
        })

    return results


class VoteResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        election_id = request.query_params.get("election")
        qs = Election.objects.filter(is_active=True)
        if election_id:
            qs = qs.filter(id=election_id)
        elections = list(qs)
        payload = []
        for election in elections:
            # Vote totals can be shown while voting; winner/ordering is only released after close.
            results = result_for_election(election)
            if election.status != "closed":
                for item in results:
                    item["winner"] = None
                    item["draw"] = False
                    item["draw_candidates"] = []
            payload.append({
                "election": ElectionSerializer(election).data,
                "results": results,
                "winner_released": election.status == "closed",
            })
        return Response({"elections": payload, "timestamp": timezone.now()})


class PositionResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, position_id):
        try:
            position = Position.objects.select_related("election").get(id=position_id)
        except Position.DoesNotExist:
            return Response({"error": "Position not found."}, status=404)
        if position.election.status != "closed":
            return Response({"error": "Results are not released until voting ends."}, status=403)
        data = result_for_election(position.election)
        return Response(next(x for x in data if x["position_id"] == position.id))


class VotingStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        elections = Election.objects.filter(is_active=True)
        return Response({
            "elections": [{
                "id": e.id, "name": e.name, "status": e.status,
                "voting_open": e.voting_open,
                "start_time": e.start_time, "end_time": e.end_time,
                "registered_voters": Profile.objects.filter(is_eligible=True).count(),
                "voters_who_voted": Vote.objects.filter(position__election=e).values("user").distinct().count(),
                "votes_cast": Vote.objects.filter(position__election=e).count(),
                "positions": e.positions.filter(is_active=True).count(),
                "candidates": Candidate.objects.filter(position__election=e, is_active=True).count(),
            } for e in elections]
        })


def admin_only(request):
    return bool(request.user and request.user.is_authenticated and request.user.is_staff and request.user.is_superuser)


class CMSDashboardView(APIView):
    permission_classes = [IsCMSAdmin]

    def get(self, request):
        elections = list(Election.objects.all())
        return Response({
            "server_time": timezone.now(),
            "elections": [{
                "id": e.id, "name": e.name, "status": e.status,
                "start_time": e.start_time, "end_time": e.end_time,
                "registered_voters": Profile.objects.filter(is_eligible=True).count(),
                "voters_who_voted": Vote.objects.filter(position__election=e).values("user").distinct().count(),
                "votes_cast": Vote.objects.filter(position__election=e).count(),
                "positions": e.positions.count(),
                "candidates": Candidate.objects.filter(position__election=e).count(),
            } for e in elections],
            "counts": {
                "elections": Election.objects.count(),
                "positions": Position.objects.count(),
                "candidates": Candidate.objects.count(),
                "voters": Profile.objects.count(),
                "votes": Vote.objects.count(),
            }
        })


class CMSElectionListCreateView(APIView):
    permission_classes = [IsCMSAdmin]

    def get(self, request):
        return Response(ElectionSerializer(Election.objects.all(), many=True).data)

    def post(self, request):
        serializer = ElectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data if False else ElectionSerializer(serializer.save()).data, status=201)


class CMSElectionDetailView(APIView):
    permission_classes = [IsCMSAdmin]

    def get_object(self, pk):
        return Election.objects.get(pk=pk)

    def get(self, request, pk):
        try: return Response(ElectionSerializer(self.get_object(pk)).data)
        except Election.DoesNotExist: return Response({"error": "Election not found."}, status=404)

    def put(self, request, pk):
        try: obj = self.get_object(pk)
        except Election.DoesNotExist: return Response({"error": "Election not found."}, status=404)
        serializer = ElectionSerializer(obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(ElectionSerializer(serializer.save()).data)

    def patch(self, request, pk):
        try: obj = self.get_object(pk)
        except Election.DoesNotExist: return Response({"error": "Election not found."}, status=404)
        serializer = ElectionSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        return Response(ElectionSerializer(serializer.save()).data)

    def delete(self, request, pk):
        try: obj = self.get_object(pk)
        except Election.DoesNotExist: return Response({"error": "Election not found."}, status=404)
        obj.delete()
        return Response(status=204)


class CMSPositionListCreateView(APIView):
    permission_classes = [IsCMSAdmin]

    def get(self, request):
        qs = Position.objects.all().select_related("election")
        election_id = request.query_params.get("election")
        if election_id: qs = qs.filter(election_id=election_id)
        return Response(PositionSerializer(qs, many=True).data)

    def post(self, request):
        print("POSITION REQUEST DATA:", request.data)

        serializer = PositionSerializer(data=request.data)

        if not serializer.is_valid():
            print("POSITION SERIALIZER ERRORS:", serializer.errors)
            return Response(serializer.errors, status=400)

        position = serializer.save()

        return Response(
            PositionSerializer(position).data,
            status=201
        )

class CMSPositionDetailView(APIView):
    permission_classes = [IsCMSAdmin]
    def get(self, request, pk):
        try: return Response(PositionSerializer(Position.objects.get(pk=pk)).data)
        except Position.DoesNotExist: return Response({"error":"Position not found."}, status=404)
    def patch(self, request, pk):
        try: obj=Position.objects.get(pk=pk)
        except Position.DoesNotExist: return Response({"error":"Position not found."}, status=404)
        serializer=PositionSerializer(obj,data=request.data,partial=True); serializer.is_valid(raise_exception=True)
        return Response(PositionSerializer(serializer.save()).data)
    def delete(self, request, pk):
        try: obj=Position.objects.get(pk=pk)
        except Position.DoesNotExist: return Response({"error":"Position not found."}, status=404)
        obj.delete(); return Response(status=204)


class CMSCandidateListCreateView(APIView):
    permission_classes = [IsCMSAdmin]
    def get(self, request):
        qs=Candidate.objects.all().select_related("position","position__election")
        election_id=request.query_params.get("election")
        if election_id: qs=qs.filter(position__election_id=election_id)
        return Response(CandidateSerializer(qs,many=True).data)
    def post(self, request):
        serializer=CandidateSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        return Response(CandidateSerializer(serializer.save()).data,status=201)


class CMSCandidateDetailView(APIView):
    permission_classes = [IsCMSAdmin]
    def patch(self, request, pk):
        try: obj=Candidate.objects.get(pk=pk)
        except Candidate.DoesNotExist: return Response({"error":"Candidate not found."},status=404)
        serializer=CandidateSerializer(obj,data=request.data,partial=True); serializer.is_valid(raise_exception=True)
        return Response(CandidateSerializer(serializer.save()).data)
    def delete(self, request, pk):
        try: obj=Candidate.objects.get(pk=pk)
        except Candidate.DoesNotExist: return Response({"error":"Candidate not found."},status=404)
        obj.delete(); return Response(status=204)


class CMSVoterListView(APIView):
    permission_classes = [IsCMSAdmin]
    def get(self, request):
        qs=Profile.objects.select_related("user").all()
        q=request.query_params.get("q","").strip()
        if q:
            qs=qs.filter(first_name__icontains=q) | qs.filter(last_name__icontains=q) | qs.filter(email__icontains=q)
        return Response(VoterCMSSerializer(qs,many=True).data)


class CMSVoterDetailView(APIView):
    permission_classes = [IsCMSAdmin]
    def patch(self, request, pk):
        try: profile=Profile.objects.get(pk=pk)
        except Profile.DoesNotExist: return Response({"error":"Voter not found."},status=404)
        for field in ["first_name","last_name","is_eligible"]:
            if field in request.data: setattr(profile,field,request.data[field])
        profile.save()
        profile.user.first_name, profile.user.last_name = profile.first_name, profile.last_name
        profile.user.save(update_fields=["first_name","last_name"])
        return Response(VoterCMSSerializer(profile).data)
    def delete(self, request, pk):
        try: profile=Profile.objects.get(pk=pk)
        except Profile.DoesNotExist: return Response({"error":"Voter not found."},status=404)
        # Deleting the User cascades to their votes. This is an explicit destructive action.
        profile.user.delete()
        return Response({"message":"Voter and associated votes deleted."},status=204)


class CMSDatabaseView(APIView):
    permission_classes = [IsCMSAdmin]

    def get(self, request):
        return Response({
            "elections": list(
                Election.objects.values(
                    "id",
                    "name",
                    "description",
                    "start_time",
                    "end_time",
                    "is_active",
                    "created_at",
                    "updated_at"
                )
            ),

            "positions": list(
                Position.objects
                .annotate(election_name=F("election__name"))
                .values(
                    "id",
                    "election_name",
                    "name",
                    "description",
                    "order",
                    "is_active",
                    "created_at"
                )
            ),

            "candidates": list(
                Candidate.objects
                .annotate(position_name=F("position__name"))
                .values(
                    "id",
                    "position_name",
                    "name",
                    "bio",
                    "is_active",
                    "created_at"
                )
            ),

            "voters": list(
                Profile.objects.values(
                    "id",
                    "first_name",
                    "last_name",
                    "email",
                    "is_eligible",
                    "created_at",
                    "updated_at"
                )
            ),

            "votes": list(
            Vote.objects
            .values(
                "candidate__name",
                "position__name",
            )
            .annotate(
                votes=Count("id")
            )
            .order_by(
                "position__name",
                "-votes",
            )
            ),
        })

class CMSExportView(APIView):
    permission_classes = [IsCMSAdmin]

    def get(self, request):
        workbook = Workbook()

        # Remove default sheet
        workbook.remove(workbook.active)

        # ==========================================
        # ELECTIONS
        # ==========================================

        sheet = workbook.create_sheet("Elections")

        sheet.append([
            "ID",
            "Name",
            "Description",
            "Start Time",
            "End Time",
            "Active",
            "Created At",
            "Updated At",
        ])

        for election in Election.objects.all().order_by("id"):
            sheet.append([
                election.id,
                election.name,
                election.description,
                timezone.localtime(
                    election.start_time
                ).strftime("%d/%m/%Y %H:%M")
                if election.start_time else "",

                timezone.localtime(
                    election.end_time
                ).strftime("%d/%m/%Y %H:%M")
                if election.end_time else "",

                "Yes" if election.is_active else "No",

                timezone.localtime(
                    election.created_at
                ).strftime("%d/%m/%Y %H:%M")
                if election.created_at else "",

                timezone.localtime(
                    election.updated_at
                ).strftime("%d/%m/%Y %H:%M")
                if election.updated_at else "",
            ])

        # ==========================================
        # POSITIONS
        # ==========================================

        sheet = workbook.create_sheet("Positions")

        sheet.append([
            "ID",
            "Election",
            "Position",
            "Description",
            "Order",
            "Active",
            "Created At",
        ])

        for position in Position.objects.select_related(
            "election"
        ).order_by("election_id", "order"):

            sheet.append([
                position.id,
                position.election.name,
                position.name,
                position.description,
                position.order,
                "Yes" if position.is_active else "No",
                timezone.localtime(
                    position.created_at
                ).strftime("%d/%m/%Y %H:%M")
                if position.created_at else "",
            ])

        # ==========================================
        # CANDIDATES
        # ==========================================

        sheet = workbook.create_sheet("Candidates")

        sheet.append([
            "ID",
            "Candidate",
            "Position",
            "Election",
            "Bio",
            "Active",
            "Created At",
        ])

        for candidate in Candidate.objects.select_related(
            "position",
            "position__election"
        ).order_by("id"):

            sheet.append([
                candidate.id,
                candidate.name,
                candidate.position.name,
                candidate.position.election.name,
                candidate.bio,
                "Yes" if candidate.is_active else "No",
                timezone.localtime(
                    candidate.created_at
                ).strftime("%d/%m/%Y %H:%M")
                if candidate.created_at else "",
            ])

        # ==========================================
        # VOTERS
        # ==========================================

        sheet = workbook.create_sheet("Voters")

        sheet.append([
            "ID",
            "First Name",
            "Last Name",
            "Email",
            "Eligible",
            "Created At",
            "Updated At",
        ])

        for voter in Profile.objects.all().order_by("id"):

            sheet.append([
                voter.id,
                voter.first_name,
                voter.last_name,
                voter.email,
                "Yes" if voter.is_eligible else "No",

                timezone.localtime(
                    voter.created_at
                ).strftime("%d/%m/%Y %H:%M")
                if voter.created_at else "",

                timezone.localtime(
                    voter.updated_at
                ).strftime("%d/%m/%Y %H:%M")
                if voter.updated_at else "",
            ])

        # ==========================================
        # VOTES
        # ==========================================

        sheet = workbook.create_sheet("Votes")

        sheet.append([
            "Candidate",
            "Position",
            "Votes",
        ])

        vote_counts = (
            Vote.objects
            .values(
                "candidate_id",
                "position_id",
            )
            .annotate(
                total_votes=Count("id")
            )
            .order_by(
                "position_id",
                "-total_votes",
            )
        )

        for vote in vote_counts:

            candidate = Candidate.objects.select_related(
                "position"
            ).filter(
                id=vote["candidate_id"]
            ).first()

            position = Position.objects.filter(
                id=vote["position_id"]
            ).first()

            if not candidate or not position:
                continue

            sheet.append([
                candidate.name,
                position.name,
                vote["total_votes"],
            ])

        # ==========================================
        # FORMAT ALL SHEETS
        # ==========================================

        for sheet in workbook.worksheets:

            for cell in sheet[1]:
                cell.font = Font(bold=True)
                cell.alignment = Alignment(
                    horizontal="center"
                )

            sheet.freeze_panes = "A2"

            for column in sheet.columns:

                max_length = 0

                for cell in column:
                    if cell.value is not None:
                        max_length = max(
                            max_length,
                            len(str(cell.value))
                        )

                sheet.column_dimensions[
                    column[0].column_letter
                ].width = min(
                    max_length + 2,
                    50
                )

        # ==========================================
        # RESPONSE
        # ==========================================

        output = BytesIO()
        workbook.save(output)
        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )

        response["Content-Disposition"] = (
            'attachment; filename="voting-system-export.xlsx"'
        )

        return response

        
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def health_check(request):
    return Response({"status":"healthy","message":"Voting System API is running"})
