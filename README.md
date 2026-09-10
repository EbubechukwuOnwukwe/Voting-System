# 🗳️ Voting System

**Author:** Ebubechukwu Onwukwe  
**Email:** [ebube5298@gmail.com](mailto:ebube5298@gmail.com)  
**GitHub:** [@EbubechukwuOnwukwe](https://github.com/EbubechukwuOnwukwe)  
**Repository:** [Voting-System](https://github.com/EbubechukwuOnwukwe/Voting-System)

---

## 📄 Overview & Description

**Voting System Demo** is an AI-Enhanced, Full-Stack Online Voting Web Application. The platform provides a secure, interactive, and transparent digital balloting experience for organizations and educational institutions.

It combines a modern **React 18** Single Page Application (SPA) frontend with a robust **Django 5.1 REST Framework** backend. Integrated with **Groq's LLaMA 3.3 70B AI engine**, the system automatically analyzes election statistics, predicts turnout trends, calculates candidate competitiveness, and generates comprehensive markdown report summaries in real time.

[![React](https://img.shields.io/badge/Frontend-React%2018.3-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite%206.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Django REST Framework](https://img.shields.io/badge/Backend-Django%205.1-092E20?logo=django)](https://www.django-rest-framework.org/)
[![Groq AI](https://img.shields.io/badge/AI%20Engine-Groq%20LLaMA--3.3-f34f29)](https://groq.com/)
[![Bootstrap](https://img.shields.io/badge/UI-Bootstrap%205.3-7952B3?logo=bootstrap)](https://getbootstrap.com/)

---

## 📌 Table of Contents

- [Overview & Description](#-overview--description)
- [Project Architecture](#-project-architecture)
- [Key Features](#-key-features)
- [Tech Stack & Package Versions](#-tech-stack--package-versions)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference Overview](#-api-reference-overview)
- [Deployment](#-deployment)
- [Author & Contact](#-author--contact)

---

## 🏗️ Project Architecture

The repository is structured as a decoupled full-stack project split into distinct `frontend` and `backend` layers:

```
Voting System Demo/
├── 📁 backend/    # Django 5.1 REST API, Database, Email Service & Groq AI Engine
└── 📁 frontend/   # React 18.3 SPA powered by Vite 6 & Bootstrap 5.3
```

- **Frontend (`/frontend`)**: Built with React 18, Vite 6, and Bootstrap 5. Manages authentication state via React Context, handles candidate voting interfaces, visualizes real-time result bars, and renders AI-generated election summaries.
- **Backend (`/backend`)**: Powered by Django 5.1 & Django REST Framework with SimpleJWT authentication. Enforces strict single-vote integrity constraints, dispatches transactional verification emails via Brevo, and interfaces with Groq's high-speed LLaMA 3.3 AI model for election analysis.

---

## ✨ Key Features

### 🔐 Security & Authentication
- **JWT Authentication**: Token-based authentication using `SimpleJWT` (Access & Refresh tokens).
- **Voter Verification**: Unique Student/Voter ID authentication logic to prevent unauthorized access.
- **Vote Integrity**: Ensures each user can vote only once per position through database constraints.

### 🗳️ Voting & Real-Time Results
- **Multi-Position Ballots**: Handles elections across multiple offices (e.g., President, VP, Secretary).
- **Dynamic Percentage Calculations**: Real-time vote tallies, percentage distributions, and progress meters.
- **Winner Detection**: Automatically highlights leading and winning candidates per office.

### 🤖 Groq LLaMA 3.3 AI Analytics
- **Natural Language Summaries**: Generates human-readable summaries of complex election dynamics.
- **Turnout & Competitiveness Predictions**: Identifies landslide victories vs. tightly contested races.
- **Markdown Rendering**: Formats AI responses with rich markdown tables and headings directly in the UI.

### 📧 Email Integration
- **Transactional Notifications**: Integrated Brevo API for password resets and verification updates.

---

## 🛠️ Tech Stack & Package Versions

### **Backend (`/backend`)**
| Package / Dependency | Version | Purpose |
|---|---|---|
| **Python** | `>= 3.10` | Core programming runtime |
| **Django** | `>= 5.1.6, < 5.2` | Core web framework |
| **Django REST Framework** | `>= 3.15.2` | RESTful API engine |
| **djangorestframework-simplejwt** | `>= 5.4.0` | JWT authentication mechanism |
| **django-cors-headers** | `>= 4.7.0` | Cross-Origin Resource Sharing handling |
| **groq** | `>= 0.18.0` | Groq AI SDK (`llama-3.3-70b-versatile`) |
| **brevo-python** | `>= 1.1.0` | Transactional email provider |
| **psycopg2-binary** | `>= 2.9.10` | PostgreSQL database adapter |
| **gunicorn** | `>= 23.0.0` | WSGI HTTP Server for production |

### **Frontend (`/frontend`)**
| Package / Dependency | Version | Purpose |
|---|---|---|
| **React** | `^18.3.1` | User Interface Framework |
| **React DOM** | `^18.3.1` | DOM Renderer for React |
| **Vite** | `^6.1.1` | Next-generation build tool & dev server |
| **React Router DOM** | `^6.28.2` | Client-side routing with route guards |
| **Axios** | `^1.7.9` | HTTP client with automatic JWT handling |
| **Bootstrap** | `^5.3.3` | Responsive layout system |
| **React-Bootstrap** | `^2.10.9` | Component wrapper for Bootstrap |
| **React Markdown** | `^10.1.0` | Markdown parser for AI Insights |

---

## 📁 Directory Structure

```
Voting System Demo/
├── backend/
│   ├── manage.py               # Django management CLI
│   ├── requirements.txt        # Updated Python package specifications
│   ├── .env                    # Environment configuration
│   ├── db.sqlite3              # Local development database
│   ├── voting_backend/         # Project configuration & settings
│   │   └── settings.py         # Django settings, GROQ_MODEL, CORS settings
│   └── voting_api/             # Primary Django API application
│       ├── views.py            # Endpoints logic
│       ├── models.py           # Database schemas (Position, Candidate, Vote)
│       ├── serializers.py      # DRF JSON serializers
│       ├── ai_analysis.py      # Groq AI prompt generation & inference
│       ├── email_service.py    # Brevo email dispatch helper
│       └── management/         # Management commands (clear_elections)
│
└── frontend/
    ├── package.json            # Node.js dependencies & Vite scripts
    ├── vite.config.js          # Vite 6 configuration
    ├── index.html              # Entry HTML file
    └── src/
        ├── App.jsx             # Top-level router configuration
        ├── main.jsx            # React root renderer
        ├── components/         # NavigationBar, LoadingSpinner, ProtectedRoute
        ├── context/            # AuthContext state provider
        ├── pages/              # Login, Register, Dashboard, Vote, Results, AIInsights
        └── services/           # Axios API service integrations
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or higher) & **npm**
- **Python** (v3.10 or higher) & **pip**
- **Git**

---

### 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install updated backend requirements:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables (`.env`):**
   Create or verify your `backend/.env` file:
   ```env
   DEBUG=True
   SECRET_KEY=your_django_secret_key
   GROQ_API_KEY=your_groq_api_key
   BREVO_API_KEY=your_brevo_api_key
   BREVO_SENDER_EMAIL=ebubechukwu5298@gmail.com
   BREVO_SENDER_NAME=Voting System
   ```

5. **Run Database Migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Start Django API Server:**
   ```bash
   python manage.py runserver
   ```
   The backend API will run on `http://127.0.0.1:8000/`.

---

### 2. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (`.env`):**
   ```env
   VITE_API_URL=http://127.0.0.1:8000/api
   ```

4. **Launch the Vite Development Server:**
   ```bash
   npm run dev
   ```
   Access the web app at `http://localhost:5173/`.

---

## 🌐 API Reference Overview

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register new student account | Public |
| `POST` | `/api/auth/login/` | User login & JWT issuance | Public |
| `GET` | `/api/auth/profile/` | Fetch current user profile | Bearer JWT |
| `GET` | `/api/positions/` | Fetch positions and candidates | Bearer JWT |
| `POST` | `/api/votes/` | Submit vote for a candidate | Bearer JWT |
| `GET` | `/api/votes/status/` | Check user voting status | Bearer JWT |
| `GET` | `/api/votes/results/` | Get live election results | Bearer JWT |
| `GET` | `/api/ai/insights/` | Get Groq LLaMA 3.3 election report | Bearer JWT |

---

## ☁️ Deployment

- **Backend**: Configured for deployment on **Render** using PostgreSQL (`dj-database-url`) and Gunicorn.
- **Frontend**: Configured for deployment on **Vercel** with SPAs client routing rewrites (`vercel.json`).

---

## 👨‍💻 Author & Contact

- **Author:** Ebubechukwu Onwukwe
- **Email:** [ebube5298@gmail.com](mailto:ebube5298@gmail.com)
- **GitHub:** [@EbubechukwuOnwukwe](https://github.com/EbubechukwuOnwukwe)
- **Repository:** [Voting-System](https://github.com/EbubechukwuOnwukwe/Voting-System)
