@echo off
echo ========================================================
echo Launching SkillTrack Maharashtra (Frontend + Backend)
echo ========================================================

start "SkillTrack Backend API (Port 5001)" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 2 /nobreak >nul
start "SkillTrack Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both Frontend and Backend have been started in separate windows!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5001
echo ========================================================
