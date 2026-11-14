@echo off
REM Install Backend Dependencies

echo ========================================
echo Installing Backend Dependencies
echo ========================================
echo.

cd backend

echo Installing packages...
echo This may take a few minutes...
echo.

REM Use the full path to npm to bypass PowerShell execution policy
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✓ Backend dependencies installed successfully!
    echo ========================================
    echo.
    echo You can now start the backend with:
    echo .\start-backend.bat
    echo.
) else (
    echo.
    echo ✗ Installation failed
    echo Please check the error messages above
    echo.
)

pause
