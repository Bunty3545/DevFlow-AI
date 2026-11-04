@echo off
echo ========================================================
echo       Starting DevFlow AI in Development Mode
echo   AI-Powered Software Development & Project Intelligence
echo ========================================================

start "DevFlow Backend (Dev)" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "DevFlow Frontend (Dev)" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul
start http://localhost:3000

