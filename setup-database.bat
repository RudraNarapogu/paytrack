@echo off
REM PayTrack Database Setup Script
REM This script creates the database and runs the schema

echo ========================================
echo PayTrack Database Setup
echo ========================================
echo.

REM Set PostgreSQL bin path
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"

echo Step 1: Creating database 'paytrack_dev'...
echo.
echo You will be prompted for your PostgreSQL password (the one you set during installation)
echo.

REM Create database
%PSQL% -U postgres -c "CREATE DATABASE paytrack_dev;"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Database created successfully!
    echo.
) else (
    echo.
    echo ✗ Database creation failed or database already exists
    echo   If database already exists, this is OK - continuing...
    echo.
)

echo Step 2: Running database schema...
echo.

REM Run schema
%PSQL% -U postgres -d paytrack_dev -f "database\schema.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✓ Database setup completed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Update backend\.env with your PostgreSQL password
    echo 2. Run: cd backend
    echo 3. Run: npm start
    echo.
) else (
    echo.
    echo ✗ Schema creation failed
    echo Please check the error messages above
    echo.
)

pause
