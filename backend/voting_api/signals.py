"""
Django signals for Voting API
Profile creation is handled by UserRegisterSerializer to ensure all required fields are set.
Signals removed to prevent IntegrityError on unique email constraint.
"""
# Signals removed - Profile creation handled in serializers.py
