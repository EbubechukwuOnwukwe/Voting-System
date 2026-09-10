"""
AI Analysis Module using Groq API
Lightweight LLM-based analysis for voting insights
Academic Project: Focus on explainable AI, not heavy ML
"""
import os
from typing import Dict, List, Any
from django.conf import settings
from .models import Position, Candidate, Vote
from django.contrib.auth.models import User


def get_groq_client():
    """
    Get Groq API client
    Returns None if API key is not configured
    """
    try:
        from groq import Groq
        api_key = settings.GROQ_API_KEY
        
        if not api_key or api_key == '':
            return None
        
        return Groq(api_key=api_key)
    except ImportError:
        return None
    except Exception:
        return None


def prepare_voting_data_for_ai() -> Dict[str, Any]:
    """
    Prepare structured voting data for AI analysis
    Returns clean, summarized data suitable for LLM prompts
    """
    # Overall statistics
    total_users = User.objects.filter(is_superuser=False).count()
    total_voters = Vote.objects.values('user').distinct().count()
    total_votes = Vote.objects.count()
    turnout = round((total_voters / total_users * 100), 2) if total_users > 0 else 0
    
    # Position-by-position analysis
    positions_data = []
    
    for position in Position.objects.filter(is_active=True):
        candidates_info = []
        total_position_votes = position.get_total_votes()
        
        for candidate in position.candidates.filter(is_active=True):
            vote_count = candidate.get_vote_count()
            percentage = candidate.get_vote_percentage()
            
            candidates_info.append({
                'name': candidate.name,
                'votes': vote_count,
                'percentage': percentage
            })
        
        # Sort by votes descending
        candidates_info.sort(key=lambda x: x['votes'], reverse=True)
        
        positions_data.append({
            'position': position.name,
            'total_votes': total_position_votes,
            'candidates': candidates_info
        })
    
    return {
        'overall_stats': {
            'total_registered': total_users,
            'total_voters': total_voters,
            'total_votes': total_votes,
            'turnout_percentage': turnout
        },
        'positions': positions_data
    }


def generate_voting_summary_prompt(voting_data: Dict[str, Any]) -> str:
    """
    Create a concise prompt for Groq LLM to generate voting insights
    """
    overall = voting_data['overall_stats']
    positions = voting_data['positions']
    
    prompt = f"""You are an election analyst. Provide a brief, professional summary of this voting data.

Overall Statistics:
- Total Registered Users: {overall['total_registered']}
- Total Voters: {overall['total_voters']}
- Voter Turnout: {overall['turnout_percentage']}%
- Total Votes Cast: {overall['total_votes']}

Position Results:
"""
    
    for pos in positions:
        prompt += f"\n{pos['position']} ({pos['total_votes']} votes):\n"
        for i, candidate in enumerate(pos['candidates'], 1):
            prompt += f"  {i}. {candidate['name']}: {candidate['votes']} votes ({candidate['percentage']}%)\n"
    
    prompt += """
Task: Provide a 3-4 sentence summary highlighting:
1. Overall voter turnout assessment
2. Most competitive races
3. Clear winners and their margins
4. Any notable patterns

Keep it concise, factual, and suitable for an academic project dashboard.
"""
    
    return prompt


def generate_prediction_prompt(voting_data: Dict[str, Any]) -> str:
    """
    Create a prompt for AI to explain winner likelihood and competitiveness
    """
    positions = voting_data['positions']
    
    prompt = f"""You are an election analyst. Analyze the competitiveness and winner likelihood for each position.

Voting Data:
"""
    
    for pos in positions:
        prompt += f"\n{pos['position']}:\n"
        for candidate in pos['candidates']:
            prompt += f"  - {candidate['name']}: {candidate['votes']} votes ({candidate['percentage']}%)\n"
    
    prompt += """
Task: For each position, provide:
1. Winner likelihood explanation (clear winner vs. close race)
2. Competitiveness level (landslide, competitive, very close)
3. Brief interpretation of vote distribution

Format your response as a clear, structured analysis suitable for students. Keep it concise (3-4 sentences per position).
"""
    
    return prompt


def call_groq_api(prompt: str, model: str = None) -> str:
    """
    Call Groq LLM API with the given prompt
    Returns AI-generated text or error message
    """
    client = get_groq_client()
    
    if client is None:
        return "AI analysis unavailable: Groq API key not configured. Please set GROQ_API_KEY in your .env file."
    
    try:
        model_name = model or settings.GROQ_MODEL
        
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional election analyst providing clear, concise, and factual voting analysis for an academic project."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,  # Lower temperature for more factual responses
            max_tokens=500,   # Keep responses concise
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        return f"AI analysis error: {str(e)}"


def generate_voting_summary() -> Dict[str, Any]:
    """
    Generate AI-powered voting summary
    Main function for /api/ai/summary/ endpoint
    """
    # Prepare data
    voting_data = prepare_voting_data_for_ai()
    
    # Generate prompt
    prompt = generate_voting_summary_prompt(voting_data)
    
    # Get AI analysis
    ai_summary = call_groq_api(prompt)
    
    return {
        'summary': ai_summary,
        'data': voting_data,
        'model': settings.GROQ_MODEL
    }


def generate_winner_prediction() -> Dict[str, Any]:
    """
    Generate AI-powered winner prediction and competitiveness analysis
    Main function for /api/ai/prediction/ endpoint
    """
    # Prepare data
    voting_data = prepare_voting_data_for_ai()
    
    # Generate prompt
    prompt = generate_prediction_prompt(voting_data)
    
    # Get AI analysis
    ai_prediction = call_groq_api(prompt)
    
    return {
        'prediction': ai_prediction,
        'data': voting_data,
        'model': settings.GROQ_MODEL
    }


def generate_turnout_analysis() -> Dict[str, Any]:
    """
    Generate AI analysis of voter turnout and participation
    """
    voting_data = prepare_voting_data_for_ai()
    overall = voting_data['overall_stats']
    
    prompt = f"""Analyze voter turnout for this election:

Total Registered: {overall['total_registered']}
Total Voted: {overall['total_voters']}
Turnout Rate: {overall['turnout_percentage']}%

Provide a brief (2-3 sentence) interpretation:
1. Is this turnout rate good, average, or concerning?
2. What might this indicate about student engagement?
3. Any actionable insights?

Keep it professional and suitable for an academic dashboard.
"""
    
    ai_analysis = call_groq_api(prompt)
    
    return {
        'turnout_analysis': ai_analysis,
        'turnout_rate': overall['turnout_percentage'],
        'voters': overall['total_voters'],
        'registered': overall['total_registered']
    }
