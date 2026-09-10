"""
AI Analysis API Views
Lightweight AI insights using Groq LLM
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .ai_analysis import (
    generate_voting_summary,
    generate_winner_prediction,
    generate_turnout_analysis
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_summary_view(request):
    """
    Generate AI-powered voting summary
    Returns concise insights about overall election status
    """
    try:
        result = generate_voting_summary()
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Failed to generate AI summary',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_prediction_view(request):
    """
    Generate AI-powered winner prediction and competitiveness analysis
    Returns detailed analysis of each position's race
    """
    try:
        result = generate_winner_prediction()
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Failed to generate AI prediction',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_turnout_view(request):
    """
    Generate AI analysis of voter turnout
    Returns insights about participation and engagement
    """
    try:
        result = generate_turnout_analysis()
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Failed to generate turnout analysis',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
