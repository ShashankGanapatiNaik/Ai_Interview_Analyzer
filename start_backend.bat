@echo off
title AI Interview Analyzer - Backend
color 0B

echo.
echo  =========================================
echo   AI Interview Behavior Analyzer - Backend
echo  =========================================
echo.

cd /d "%~dp0backend"

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Install from https://python.org
    pause & exit /b 1
)

REM Create venv if missing
if not exist "venv" (
    echo [SETUP] Creating virtual environment...
    python -m venv venv
)

REM Activate
call venv\Scripts\activate.bat

REM Install deps
echo [SETUP] Installing Python packages...
pip install -r requirements.txt --quiet

REM Check .env
if not exist ".env" (
    echo [SETUP] Creating .env from template...
    copy .env.example .env
    echo.
    echo [ACTION REQUIRED] Edit backend\.env and add:
    echo   MONGODB_URL=your-atlas-connection-string
    echo   JWT_SECRET=any-random-long-string
    echo   ANTHROPIC_API_KEY=sk-ant-...
    echo.
    pause
)

REM Seed DB
echo [SETUP] Seeding database...
python seed.py

echo.
echo [START] Backend running at http://localhost:8000
echo [INFO]  API docs at    http://localhost:8000/docs
echo [INFO]  Press Ctrl+C to stop
echo.

uvicorn main:app --reload --port 8000 --host 0.0.0.0
pause
