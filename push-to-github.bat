@echo off
setlocal
echo ========================================================
echo Pushing SkillTrack Maharashtra to:
echo https://github.com/KushKhanpara/SIH-Project.git
echo ========================================================

cd /d "%~dp0"

echo.
echo [1/5] Initializing Git repository...
git init

echo.
echo [2/5] Staging files (excluding node_modules and .env)...
git add .

echo.
echo [3/5] Creating commit...
git commit -m "feat: complete SkillTrack Maharashtra prototype for SIH deployment"

echo.
echo [4/5] Setting main branch and origin remote...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/KushKhanpara/SIH-Project.git

echo.
echo [5/5] Pushing files to GitHub...
git push -u origin main --force

echo.
echo ========================================================
echo Successfully pushed to:
echo https://github.com/KushKhanpara/SIH-Project
echo ========================================================
pause
