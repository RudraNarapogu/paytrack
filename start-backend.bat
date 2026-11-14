@echo off
REM PayTrack Backend Server Startup Script
REM This script bypasses PowerShell execution policy issues

echo ========================================
echo Starting PayTrack Backend Server
echo ========================================
echo.

cd backend

echo Starting server...
echo.

node node_modules\nodemon\bin\nodemon.js server.js

pause
