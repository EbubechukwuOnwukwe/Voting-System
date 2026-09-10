# Backend - Django REST Framework API

**Author:** Ebubechukwu Onwukwe  
**GitHub:** [EbubechukwuOnwukwe](https://github.com/EbubechukwuOnwukwe)  
**Repository:** [Voting-System-Demo](https://github.com/EbubechukwuOnwukwe/Voting-System-Demo)

## Overview

RESTful API backend for the AI-Enhanced Online Voting System. Built with Django REST Framework, featuring JWT authentication and Groq AI integration.

## Quick Start

### Database Setup & Migrations

Run database migrations to initialize the database schema:

```bash
python manage.py migrate
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "student_id": "1234567",
  "email": "student@example.com",
  "nickname": "John Doe",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123"
}

Response: 201 Created
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "username": "1234567",
    "student_id": "1234567",
    "nickname": "John Doe",
    "email": "student@example.com"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJh...",
    "access": "eyJ0eXAiOiJKV1QiLCJh..."
  }
}
```

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "student_id": "1234567",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "message": "Login successful",
  "user": {...},
  "tokens": {...}
}
```

#### Get Profile
```http
GET /api/auth/profile/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": 1,
  "username": "1234567",
  "profile": {
    "id": 1,
    "username": "1234567",
    "student_id": "1234567",
    "nickname": "John Doe",
    "email": "student@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Voting

#### Get Positions
```http
GET /api/positions/
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "name": "President",
    "description": "Student body president",
    "order": 1,
    "is_active": true,
    "candidates": [
      {
        "id": 1,
        "name": "John Doe",
        "bio": "Experienced leader",
        "photo_url": "",
        "position": 1,
        "position_name": "President",
        "vote_count": 15,
        "vote_percentage": 60.0,
        "is_active": true
      }
    ],
    "total_votes": 25,
    "candidates_count": 3
  }
]
```

#### Cast Vote
```http
POST /api/vote/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "candidate": 1,
  "position": 1
}

Response: 201 Created
{
  "message": "Vote cast successfully",
  "vote": {
    "id": 1,
    "candidate": 1,
    "position": 1,
    "timestamp": "2024-01-15T10:35:00Z",
    "user_nickname": "John Doe",
    "candidate_name": "Jane Smith",
    "position_name": "President"
  }
}
```

#### Get Voting Status
```http
GET /api/votes/status/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "voting_status": [
    {
      "position_id": 1,
      "position_name": "President",
      "has_voted": true
    },
    {
      "position_id": 2,
      "position_name": "Vice President",
      "has_voted": false
    }
  ],
  "total_positions": 2,
  "voted_count": 1
}
```

### Results

#### Get All Results
```http
GET /api/results/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "results": [
    {
      "position_id": 1,
      "position_name": "President",
      "total_votes": 25,
      "candidates": [
        {
          "id": 1,
          "name": "Jane Smith",
          "bio": "Change advocate",
          "vote_count": 15,
          "percentage": 60.0
        },
        {
          "id": 2,
          "name": "John Doe",
          "bio": "Experienced leader",
          "vote_count": 10,
          "percentage": 40.0
        }
      ],
      "winner": {
        "id": 1,
        "name": "Jane Smith",
        "bio": "Change advocate",
        "vote_count": 15,
        "percentage": 60.0
      }
    }
  ]
}
```

#### Get Statistics
```http
GET /api/analytics/stats/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "total_registered_users": 100,
  "total_voters": 75,
  "total_votes_cast": 150,
  "voter_turnout_percentage": 75.0,
  "positions_count": 3,
  "candidates_count": 9,
  "most_competitive_position": "President",
  "votes_by_position": [
    {
      "position_name": "President",
      "vote_count": 75,
      "candidates_count": 3
    }
  ]
}
```

### AI Analysis

#### Get AI Summary
```http
GET /api/ai/summary/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "summary": "Based on current vote distribution, the election shows strong voter participation with a 75% turnout rate. The President position is highly competitive with Jane Smith leading at 60%. Vice President race shows a clear winner with 80% support.",
  "data": {
    "overall_stats": {
      "total_registered": 100,
      "total_voters": 75,
      "total_votes": 150,
      "turnout_percentage": 75.0
    },
    "positions": [...]
  },
  "model": "mixtral-8x7b-32768"
}
```

#### Get AI Prediction
```http
GET /api/ai/prediction/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "prediction": "President Position: COMPETITIVE RACE\nJane Smith (60%) shows strong lead but not overwhelming. The 20-point margin suggests moderate competitiveness. Victory is likely but not guaranteed if voting patterns shift.\n\nVice President Position: LANDSLIDE\nMark Johnson (80%) demonstrates clear dominance. This 60-point margin indicates strong consensus and very high winner likelihood.",
  "data": {...},
  "model": "mixtral-8x7b-32768"
}
```

#### Get Turnout Analysis
```http
GET /api/ai/turnout/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "turnout_analysis": "The 75% voter turnout is excellent for a student election, indicating strong engagement and interest. This level of participation suggests the election is meaningful to students and the voting process is accessible.",
  "turnout_rate": 75.0,
  "voters": 75,
  "registered": 100
}
```

## Database Models

### User Profile
```python
class Profile(models.Model):
    user = OneToOneField(User)
    student_id = CharField(max_length=7, unique=True)
    nickname = CharField(max_length=50)
    email = EmailField(unique=True)
    created_at = DateTimeField(auto_now_add=True)
```

### Position
```python
class Position(models.Model):
    name = CharField(max_length=100, unique=True)
    description = TextField(blank=True)
    order = IntegerField(default=0)
    is_active = BooleanField(default=True)
```

### Candidate
```python
class Candidate(models.Model):
    position = ForeignKey(Position)
    name = CharField(max_length=100)
    bio = TextField(blank=True)
    photo_url = URLField(blank=True)
    is_active = BooleanField(default=True)
```

### Vote
```python
class Vote(models.Model):
    user = ForeignKey(User)
    candidate = ForeignKey(Candidate)
    position = ForeignKey(Position)
    timestamp = DateTimeField(auto_now_add=True)
    
    # Constraint: unique_together = ('user', 'position')
```

## Setup Instructions

1. **Create Virtual Environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Mac/Linux
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment:**
   ```bash
   copy .env.example .env
   # Edit .env and add your Groq API key
   ```

4. **Run Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create Superuser:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start Server:**
   ```bash
   python manage.py runserver
   ```

## Admin Panel

Access Django admin at: `http://127.0.0.1:8000/admin`

Features:
- Manage users and profiles
- Create/edit positions
- Add/remove candidates
- View all votes
- Monitor statistics

## Environment Variables

Required in `.env` file:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
GROQ_API_KEY=your-groq-api-key  # Get from console.groq.com
```

## Testing

### Using Django Shell
```bash
python manage.py shell
```

```python
from voting_api.models import Position, Candidate
from django.contrib.auth.models import User

# Create test data
position = Position.objects.create(name="President", order=1)
candidate = Candidate.objects.create(
    position=position,
    name="Test Candidate",
    bio="Test bio"
)
```

### Using API Client
Test endpoints with tools like:
- Postman
- Thunder Client (VS Code)
- curl commands

## AI Integration

### Groq API Setup

1. Get API key from [console.groq.com](https://console.groq.com)
2. Add to `.env`: `GROQ_API_KEY=your-key`
3. Model used: `mixtral-8x7b-32768`

### AI Analysis Functions

Located in `voting_api/ai_analysis.py`:

- `generate_voting_summary()` - Overall election summary
- `generate_winner_prediction()` - Competition analysis
- `generate_turnout_analysis()` - Participation insights

## Security

- JWT token expiration: 5 hours
- Refresh token: 1 day
- CORS: Configured for localhost:3000
- Password validation: Django's built-in validators
- Vote integrity: Database constraints

## Deployment Notes

For production:
1. Set `DEBUG=False`
2. Update `ALLOWED_HOSTS`
3. Use PostgreSQL instead of SQLite
4. Configure proper SECRET_KEY
5. Set up HTTPS
6. Use environment variables for sensitive data

## Dependencies

Main packages:
- Django 5.0.1
- djangorestframework 3.14.0
- djangorestframework-simplejwt 5.3.1
- django-cors-headers 4.3.1
- groq 0.9.0

See `requirements.txt` for complete list.
