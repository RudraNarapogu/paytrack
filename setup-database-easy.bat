@echo off
REM PayTrack Database Setup Script (No Password Prompt)
REM This script uses PGPASSWORD environment variable

echo ========================================
echo PayTrack Database Setup
echo ========================================
echo.

REM IMPORTANT: Replace 'YOUR_PASSWORD_HERE' with your actual PostgreSQL password
set PGPASSWORD=Rudra@56

REM Set PostgreSQL bin path
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"

echo Step 1: Creating database 'paytrack_dev'...
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
    echo Tables created:
    %PSQL% -U postgres -d paytrack_dev -c "\dt"
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

REM Clear password from environment
set PGPASSWORD=

pause
