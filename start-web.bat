@echo off
REM PayTrack Web Dashboard Startup Script

echo ========================================
echo Starting PayTrack Web Dashboard
echo ========================================
echo.

cd web

echo Starting Vite dev server...
echo.

node node_modules\vite\bin\vite.js

pause
