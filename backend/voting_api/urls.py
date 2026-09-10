from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView, UserLoginView, UserProfileView,
    PasswordResetRequestView, PasswordResetConfirmView,
    ElectionListView, PositionListView, CandidateListView,
    CastVoteView, UserVotesView, VotingStatusView,
    VoteResultsView, PositionResultView, VotingStatsView, health_check,
    CMSDashboardView, CMSElectionListCreateView, CMSElectionDetailView,
    CMSPositionListCreateView, CMSPositionDetailView,
    CMSCandidateListCreateView, CMSCandidateDetailView,
    CMSVoterListView, CMSVoterDetailView, CMSDatabaseView, CMSExportView,
)
from .ai_views import ai_summary_view, ai_prediction_view, ai_turnout_view

urlpatterns = [
    path("health/", health_check),
    path("auth/register/", UserRegistrationView.as_view()),
    path("auth/login/", UserLoginView.as_view()),
    path("auth/profile/", UserProfileView.as_view()),
    path("auth/token/refresh/", TokenRefreshView.as_view()),
    path("auth/password-reset/", PasswordResetRequestView.as_view()),
    path("auth/password-reset/<uidb64>/<token>/", PasswordResetConfirmView.as_view()),

    path("elections/", ElectionListView.as_view()),
    path("positions/", PositionListView.as_view()),
    path("candidates/", CandidateListView.as_view()),
    path("vote/", CastVoteView.as_view()),
    path("votes/my-votes/", UserVotesView.as_view()),
    path("votes/status/", VotingStatusView.as_view()),
    path("results/", VoteResultsView.as_view()),
    path("results/<int:position_id>/", PositionResultView.as_view()),
    path("analytics/stats/", VotingStatsView.as_view()),

    path("ai/summary/", ai_summary_view),
    path("ai/prediction/", ai_prediction_view),
    path("ai/turnout/", ai_turnout_view),

    path("cms/dashboard/", CMSDashboardView.as_view()),
    path("cms/elections/", CMSElectionListCreateView.as_view()),
    path("cms/elections/<int:pk>/", CMSElectionDetailView.as_view()),
    path("cms/positions/", CMSPositionListCreateView.as_view()),
    path("cms/positions/<int:pk>/", CMSPositionDetailView.as_view()),
    path("cms/candidates/", CMSCandidateListCreateView.as_view()),
    path("cms/candidates/<int:pk>/", CMSCandidateDetailView.as_view()),
    path("cms/voters/", CMSVoterListView.as_view()),
    path("cms/voters/<int:pk>/", CMSVoterDetailView.as_view()),
    path("cms/database/", CMSDatabaseView.as_view()),
    path("cms/export/", CMSExportView.as_view()),
]
