@echo off
title AI Interview Analyzer - Frontend
color 0B

echo.
echo  ==========================================
echo   AI Interview Behavior Analyzer - Frontend
echo  ==========================================
echo.

cd /d "%~dp0frontend"

REM Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause & exit /b 1
)

REM Check .env
if not exist ".env" (
    echo [SETUP] Creating .env from template...
    copy .env.example .env
    echo [INFO]  Edit frontend\.env if needed
)

REM Install node_modules if missing
if not exist "node_modules" (
    echo [SETUP] Installing npm packages...
    npm install
    if %errorlevel% neq 0 (
        echo [RETRY] Trying with --legacy-peer-deps...
        npm install --legacy-peer-deps
    )
)

echo.
echo [START] Frontend running at http://localhost:5173
echo [INFO]  Press Ctrl+C to stop
echo.

npm run dev
pause
