@echo off
echo ========================================================
echo       Starting DevFlow AI Platform
echo   AI-Powered Software Development & Project Intelligence
echo ========================================================

echo 1. Launching Backend API on Port 5000...
start "DevFlow Backend API (Port 5000)" cmd /k "cd backend && node dist/server.js"

timeout /t 3 /nobreak >nul

echo 2. Launching Frontend Portal on Port 3000...
start "DevFlow Frontend UI (Port 3000)" cmd /k "cd frontend && npm run start"

timeout /t 3 /nobreak >nul

echo 3. Opening Browser at http://localhost:3000...
start http://localhost:3000

echo ========================================================
echo   DevFlow AI is now running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ========================================================
pause

