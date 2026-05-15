# 🧠 AI Interview Behavior Analyzer

A production-grade AI-powered mock interview platform with real-time behavioral analysis.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend**: FastAPI, Python 3.11+
- **AI/CV**: OpenCV, MediaPipe, TensorFlow/Keras, Librosa
- **AI Coaching**: Anthropic Claude
- **Database**: MongoDB Atlas (Motor async)
- **Auth**: JWT + Refresh Tokens

---

## Prerequisites

- Python 3.11+ → https://www.python.org/downloads/
- Node.js 20+  → https://nodejs.org/
- MongoDB Atlas (free) → https://www.mongodb.com/cloud/atlas
- Anthropic API Key → https://console.anthropic.com/

---

## Setup (No Docker)

### 1. Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv venv

# Mac/Linux:
source venv/bin/activate

# Windows CMD:
venv\Scripts\activate.bat

# Windows PowerShell:
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Copy and fill env file
cp .env.example .env
# → Edit .env with your MongoDB URL, JWT secret, Anthropic key

# Seed database (admin user + question bank)
python seed.py

# Run backend
uvicorn main:app --reload --port 8000
```

Backend: http://localhost:8000  
API Docs: http://localhost:8000/docs

---

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
cp .env.example .env
# → Edit .env: set VITE_API_URL=http://localhost:8000
npm run dev
```

Frontend: http://localhost:5173

---

## Demo Credentials

| Role      | Email                  | Password  |
|-----------|------------------------|-----------|
| Candidate | demo@interviewai.com   | Demo@123  |
| Admin     | admin@interviewai.com  | Admin@123 |

---

## Troubleshooting

**pip install fails** → `pip install --upgrade pip` then retry  
**npm install fails** → `npm install --legacy-peer-deps`  
**MongoDB error** → Whitelist your IP in Atlas Network Access  
**WebSocket error** → Ensure backend is running on port 8000  
**Camera blocked** → Allow browser camera permissions  
**Port in use** → Change port: `uvicorn main:app --port 8001`
